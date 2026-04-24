"""
Scoring service — orchestrates the full KisanScore generation pipeline.
This is the CRITICAL service that ties everything together.
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.farmer import Farmer
from app.models.kisan_score import KisanScore
from app.models.loan_application import LoanApplication
from app.models.scheme_enrollment import SchemeEnrollment
from app.models.distress_flag import DistressFlag
from app.external.nasa_power import get_rainfall_data, get_ndvi_proxy, DISTRICT_RAINFALL_AVERAGES
from app.external.openweathermap import get_current_weather, is_drought_active
from app.external.agmarknet import get_mandi_price
from app.ml.features import engineer_features
from app.ml.model import predict_score
from app.ml.shap_explainer import compute_shap_values, generate_xai_summary
from app.ml.score_bands import get_loan_recommendation, get_score_category
from app.data.districts import get_district_coords

logger = logging.getLogger("kisankhata.scoring")

# In-memory processing status tracker
_score_status: dict[str, str] = {}


def get_score_status(farmer_id: str) -> str:
    return _score_status.get(farmer_id, "unknown")


def set_score_status(farmer_id: str, status: str):
    _score_status[farmer_id] = status


async def generate_score(farmer_id: str, db: AsyncSession):
    """
    Full scoring pipeline:
    1. Fetch farmer data
    2. Call external APIs in parallel (weather, mandi, NDVI)
    3. Engineer features
    4. Run ML ensemble model
    5. Compute SHAP values
    6. Generate XAI summaries
    7. Store score + create loan recommendation
    8. Check distress conditions
    """
    set_score_status(farmer_id, "processing")

    try:
        # 1. Get farmer
        result = await db.execute(select(Farmer).where(Farmer.farmer_id == farmer_id))
        farmer = result.scalar_one_or_none()
        if not farmer:
            set_score_status(farmer_id, "error")
            logger.error(f"Farmer {farmer_id} not found")
            return

        coords = get_district_coords(farmer.district)
        lat, lng = coords["lat"], coords["lng"]

        # 2. Fetch external data in parallel
        rainfall_task = get_rainfall_data(farmer.district, lat, lng)
        ndvi_task = get_ndvi_proxy(farmer.district, lat, lng)
        mandi_task = get_mandi_price(farmer.primary_crop, farmer.district, farmer.state)
        weather_task = get_current_weather(farmer.district, lat, lng)

        rainfall_data, ndvi_data, mandi_data, weather_data = await asyncio.gather(
            rainfall_task, ndvi_task, mandi_task, weather_task
        )

        # 3. Get scheme enrollment
        scheme_result = await db.execute(
            select(SchemeEnrollment).where(SchemeEnrollment.farmer_id == farmer.id)
        )
        scheme = scheme_result.scalar_one_or_none()
        pm_kisan = scheme.pm_kisan_enrolled == "enrolled" if scheme else False
        pmfby = scheme.pmfby_enrolled == "enrolled" if scheme else False

        # 4. Compute revenue estimate
        price_per_quintal = mandi_data["price_per_quintal"]
        yield_per_acre = mandi_data["yield_per_acre_quintal"]
        estimated_revenue = farmer.land_area_acres * yield_per_acre * price_per_quintal

        # 5. Get district average rainfall for deviation calculation
        district_avg = DISTRICT_RAINFALL_AVERAGES.get(
            farmer.district, {"annual_mm": 900}
        )["annual_mm"]

        # 6. Get district average score
        avg_score_result = await db.execute(
            select(func.avg(KisanScore.score)).where(
                KisanScore.farmer_id.in_(
                    select(Farmer.id).where(Farmer.district == farmer.district)
                )
            )
        )
        district_avg_score = avg_score_result.scalar() or 600.0

        # 7. Engineer features
        features = engineer_features(
            land_area_acres=farmer.land_area_acres,
            primary_crop=farmer.primary_crop,
            ndvi_value=ndvi_data["ndvi_value"],
            rainfall_annual_mm=rainfall_data["annual_mm"],
            district_avg_rainfall_mm=district_avg,
            estimated_revenue_inr=estimated_revenue,
            pm_kisan_enrolled=pm_kisan,
            pmfby_enrolled=pmfby,
            district_avg_score=float(district_avg_score),
        )

        # 8. Run ML model
        prediction = predict_score(features)
        score = prediction["score"]
        category = prediction["category"]

        # 9. Compute sub-scores (0-200 each)
        ndvi_subscore = int(min(max(ndvi_data["ndvi_value"] * 250, 0), 200))
        rainfall_dev = abs(rainfall_data["annual_mm"] - district_avg) / district_avg if district_avg > 0 else 0
        weather_subscore = int(min(max((1 - rainfall_dev) * 200, 0), 200))
        income_subscore = int(min(max(estimated_revenue / 500, 0), 200))
        land_subscore = int(min(max(farmer.land_area_acres * 40, 0), 200))
        scheme_subscore = (80 if pm_kisan else 0) + (120 if pmfby else 30)
        scheme_subscore = min(scheme_subscore, 200)

        # 10. Compute SHAP values
        shap_factors = compute_shap_values(features)

        # 11. Generate XAI summaries
        xai_summaries = generate_xai_summary(
            shap_factors, farmer.full_name, farmer.primary_crop, farmer.district
        )

        # 12. Determine crop season
        now = datetime.utcnow()
        if now.month >= 6 and now.month <= 11:
            crop_season = f"Kharif_{now.year}"
        else:
            crop_season = f"Rabi_{now.year}"

        is_estimated = rainfall_data.get("is_fallback", False) and ndvi_data.get("is_fallback", False)

        # Track data sources
        data_sources = {
            "ndvi": ndvi_data.get("source", "Unknown"),
            "rainfall": rainfall_data.get("source", "Unknown"),
            "mandi_price": mandi_data.get("source", "Unknown"),
            "weather": weather_data.get("source", "Unknown"),
            "scheme": "Mock Data" if not scheme or scheme.data_source == "mock" else "API",
        }

        # 13. Store score record
        score_record = KisanScore(
            id=str(uuid.uuid4()),
            farmer_id=farmer.id,
            score=score,
            score_category=category,
            is_estimated=is_estimated,
            crop_season=crop_season,
            ndvi_subscore=ndvi_subscore,
            weather_subscore=weather_subscore,
            income_subscore=income_subscore,
            land_subscore=land_subscore,
            scheme_subscore=scheme_subscore,
            ndvi_value=ndvi_data["ndvi_value"],
            rainfall_mm=rainfall_data["annual_mm"],
            estimated_revenue_inr=estimated_revenue,
            mandi_price_inr=price_per_quintal,
            shap_json=json.dumps(shap_factors),
            xai_summary_hi=xai_summaries["hi"],
            xai_summary_en=xai_summaries["en"],
            data_sources=json.dumps(data_sources),
        )

        # Check if score already exists for this farmer+season — update it
        existing = await db.execute(
            select(KisanScore).where(
                KisanScore.farmer_id == farmer.id,
                KisanScore.crop_season == crop_season,
            )
        )
        existing_score = existing.scalar_one_or_none()
        if existing_score:
            # Update existing record
            for key, val in {
                "score": score, "score_category": category, "is_estimated": is_estimated,
                "ndvi_subscore": ndvi_subscore, "weather_subscore": weather_subscore,
                "income_subscore": income_subscore, "land_subscore": land_subscore,
                "scheme_subscore": scheme_subscore, "ndvi_value": ndvi_data["ndvi_value"],
                "rainfall_mm": rainfall_data["annual_mm"], "estimated_revenue_inr": estimated_revenue,
                "mandi_price_inr": price_per_quintal, "shap_json": json.dumps(shap_factors),
                "xai_summary_hi": xai_summaries["hi"], "xai_summary_en": xai_summaries["en"],
                "data_sources": json.dumps(data_sources),
            }.items():
                setattr(existing_score, key, val)
            score_id = existing_score.id
        else:
            db.add(score_record)
            score_id = score_record.id

        # 14. Create/update loan recommendation
        loan_rec = get_loan_recommendation(score)
        existing_loan = await db.execute(
            select(LoanApplication).where(
                LoanApplication.farmer_id == farmer.id,
                LoanApplication.status == "pending",
            )
        )
        existing_loan_app = existing_loan.scalar_one_or_none()

        if not existing_loan_app:
            # Get first available bank
            from app.models.bank import Bank
            bank_result = await db.execute(select(Bank).where(Bank.is_active == True).limit(1))
            bank = bank_result.scalar_one_or_none()

            if bank:
                loan_app = LoanApplication(
                    farmer_id=farmer.id,
                    score_id=score_id,
                    bank_id=bank.id,
                    idempotency_key=f"{farmer.id}:{crop_season}:{uuid.uuid4().hex[:8]}",
                    recommended_amount_min_inr=loan_rec["amount_min_inr"],
                    recommended_amount_max_inr=loan_rec["amount_max_inr"],
                    recommended_rate_percent=loan_rec["rate_percent"],
                    ledger_check_result="clear",
                )
                db.add(loan_app)

        # 15. Check distress conditions
        await _check_distress(farmer, score, pmfby, lat, lng, db)

        await db.commit()
        set_score_status(farmer_id, "complete")
        logger.info(f"Score generated for {farmer_id}: {score} ({category})")

    except Exception as e:
        set_score_status(farmer_id, "error")
        logger.error(f"Score generation failed for {farmer_id}: {e}", exc_info=True)
        raise


async def _check_distress(farmer: Farmer, current_score: int, has_insurance: bool, lat: float, lng: float, db: AsyncSession):
    """Check distress conditions and raise flag if all 3 conditions met."""
    try:
        # Get previous score
        prev_result = await db.execute(
            select(KisanScore.score).where(
                KisanScore.farmer_id == farmer.id
            ).order_by(KisanScore.generated_at.desc()).offset(1).limit(1)
        )
        prev_score = prev_result.scalar_one_or_none()

        # Check 3 conditions
        drought = await is_drought_active(farmer.district, lat, lng)
        score_drop = prev_score is not None and current_score <= (prev_score - 100)
        no_insurance = not has_insurance

        if drought and score_drop and no_insurance:
            # Check if flag already exists
            existing = await db.execute(
                select(DistressFlag).where(DistressFlag.farmer_id == farmer.id)
            )
            if not existing.scalar_one_or_none():
                flag = DistressFlag(
                    farmer_id=farmer.id,
                    drought_triggered=True,
                    score_drop_triggered=True,
                    no_insurance_triggered=True,
                    score_current=current_score,
                    score_previous=prev_score,
                )
                db.add(flag)
                logger.warning(f"🚨 Distress flag raised for farmer {farmer.farmer_id}")
    except Exception as e:
        logger.error(f"Distress check failed: {e}")
