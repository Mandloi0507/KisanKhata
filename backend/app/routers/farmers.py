"""Farmer routes — registration, dashboard, score history, XAI report, benchmark."""

import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.farmer import Farmer
from app.models.kisan_score import KisanScore
from app.models.loan_application import LoanApplication
from app.models.scheme_enrollment import SchemeEnrollment
from app.models.distress_flag import DistressFlag
from app.schemas.farmer import (
    FarmerRegisterRequest, FarmerRegisterResponse, FarmerDashboardResponse,
    ScoreHistoryResponse, ScoreHistoryItem, XAIReportResponse, XAIFactorOut,
    BenchmarkResponse, LatestScoreOut, SubScoreOut, LoanOfferOut, SchemeStatusOut,
    DistressFlagOut,
)
from app.utils.encryption import encrypt_aadhaar, hash_aadhaar, mask_aadhaar
from app.data.districts import get_district_coords
from app.services.scoring_service import generate_score, get_score_status
from app.ml.score_bands import get_score_category

router = APIRouter()


@router.post("/register", response_model=FarmerRegisterResponse, status_code=201)
async def register_farmer(
    body: FarmerRegisterRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Register a new farmer and trigger KisanScore generation."""
    # Check for duplicate Aadhaar
    aadhaar_h = hash_aadhaar(body.aadhaar_number)
    existing = await db.execute(select(Farmer).where(Farmer.aadhaar_hash == aadhaar_h))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail={"code": "AADHAAR_ALREADY_REGISTERED", "message": "This Aadhaar is already linked to a profile. Please log in."},
        )

    # Generate farmer ID
    count_result = await db.execute(select(func.count()).select_from(Farmer))
    count = count_result.scalar() or 0
    farmer_id = f"KK-{datetime.utcnow().year}-{count + 1:05d}"

    # Get district coordinates
    coords = get_district_coords(body.district)

    # Create farmer record
    farmer = Farmer(
        id=str(uuid.uuid4()),
        farmer_id=farmer_id,
        aadhaar_encrypted=encrypt_aadhaar(body.aadhaar_number),
        aadhaar_hash=aadhaar_h,
        full_name=body.full_name,
        mobile_number=body.mobile_number,
        state=body.state,
        district=body.district,
        district_lat=coords["lat"],
        district_lng=coords["lng"],
        primary_crop=body.primary_crop,
        secondary_crop=body.secondary_crop,
        land_area_acres=body.land_area_acres,
        preferred_language=body.preferred_language,
    )
    db.add(farmer)

    # Create scheme enrollment (mock data)
    import random
    scheme = SchemeEnrollment(
        farmer_id=farmer.id,
        pm_kisan_enrolled=random.choice(["enrolled", "enrolled", "not_enrolled"]),
        pmfby_enrolled=random.choice(["enrolled", "not_enrolled", "not_enrolled"]),
        data_source="mock",
    )
    db.add(scheme)
    await db.commit()

    # Trigger score generation in background
    background_tasks.add_task(_generate_score_bg, farmer_id, db)

    return FarmerRegisterResponse(
        farmer_id=farmer_id,
        message="Registration successful. Generating your KisanScore...",
        score_status="processing",
        estimated_wait_seconds=30,
    )


async def _generate_score_bg(farmer_id: str, db: AsyncSession):
    """Background task wrapper for score generation."""
    from app.database import async_session
    async with async_session() as session:
        try:
            await generate_score(farmer_id, session)
        except Exception as e:
            import logging
            logging.getLogger("kisankhata").error(f"Background score gen failed: {e}", exc_info=True)


@router.get("/{farmer_id}/dashboard", response_model=FarmerDashboardResponse)
async def get_farmer_dashboard(farmer_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch farmer dashboard data — score, loan offer, distress flag."""
    result = await db.execute(select(Farmer).where(Farmer.farmer_id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Farmer not found."})

    # Check if score is still processing
    status = get_score_status(farmer_id)
    if status == "processing":
        return FarmerDashboardResponse(
            farmer_id=farmer.farmer_id,
            full_name=farmer.full_name,
            district=farmer.district,
            state=farmer.state,
            primary_crop=farmer.primary_crop,
            secondary_crop=farmer.secondary_crop,
            land_area_acres=farmer.land_area_acres,
            aadhaar_masked=mask_aadhaar("X" * 8 + "0000"),
            score_status="processing",
        )

    # Get latest score
    score_result = await db.execute(
        select(KisanScore).where(KisanScore.farmer_id == farmer.id)
        .order_by(KisanScore.generated_at.desc()).limit(1)
    )
    latest_score = score_result.scalar_one_or_none()

    # Get previous score for delta
    prev_result = await db.execute(
        select(KisanScore).where(KisanScore.farmer_id == farmer.id)
        .order_by(KisanScore.generated_at.desc()).offset(1).limit(1)
    )
    prev_score = prev_result.scalar_one_or_none()

    # Build sub-scores
    score_out = None
    if latest_score:
        sub_scores = [
            SubScoreOut(
                key="crop_health", label="Crop Health (NDVI)", label_hi="फसल स्वास्थ्य",
                value=latest_score.ndvi_subscore or 0, max=200,
                impact=f"+{latest_score.ndvi_subscore - 100}" if (latest_score.ndvi_subscore or 0) > 100 else str((latest_score.ndvi_subscore or 0) - 100),
                note=f"NDVI {latest_score.ndvi_value:.2f} for {farmer.district}" if latest_score.ndvi_value else "",
                note_hi=f"{farmer.district} में फसल स्वास्थ्य",
                source=json.loads(latest_score.data_sources or "{}").get("ndvi", ""),
                trend="up" if prev_score and (latest_score.ndvi_subscore or 0) > (prev_score.ndvi_subscore or 0) else "flat",
            ),
            SubScoreOut(
                key="rainfall_risk", label="Rainfall Risk", label_hi="वर्षा जोखिम",
                value=latest_score.weather_subscore or 0, max=200,
                impact=f"+{(latest_score.weather_subscore or 0) - 100}",
                note=f"Rainfall {latest_score.rainfall_mm:.0f}mm" if latest_score.rainfall_mm else "",
                note_hi="मौसमी वर्षा",
                source=json.loads(latest_score.data_sources or "{}").get("rainfall", ""),
                trend="flat",
            ),
            SubScoreOut(
                key="income_potential", label="Income Potential (Mandi)", label_hi="आय क्षमता",
                value=latest_score.income_subscore or 0, max=200,
                impact=f"+{(latest_score.income_subscore or 0) - 100}",
                note=f"₹{latest_score.mandi_price_inr:.0f}/qtl, est. revenue ₹{latest_score.estimated_revenue_inr:,.0f}" if latest_score.mandi_price_inr else "",
                note_hi=f"अनुमानित मौसमी आय ₹{latest_score.estimated_revenue_inr:,.0f}" if latest_score.estimated_revenue_inr else "",
                source=json.loads(latest_score.data_sources or "{}").get("mandi_price", ""),
                trend="up",
            ),
            SubScoreOut(
                key="land", label="Land & Tenure", label_hi="ज़मीन व अधिकार",
                value=latest_score.land_subscore or 0, max=200,
                impact=f"+{(latest_score.land_subscore or 0) - 100}",
                note=f"{farmer.land_area_acres} acres",
                note_hi=f"{farmer.land_area_acres} एकड़",
                source="Farmer Profile",
            ),
            SubScoreOut(
                key="scheme_enrolment", label="Scheme & Insurance", label_hi="योजना व बीमा",
                value=latest_score.scheme_subscore or 0, max=200,
                impact=f"+{(latest_score.scheme_subscore or 0) - 100}",
                note="PM-Kisan & PMFBY status",
                note_hi="योजना नामांकन स्थिति",
                source="Government Records",
            ),
        ]

        score_out = LatestScoreOut(
            score=latest_score.score,
            score_category=latest_score.score_category,
            is_estimated=latest_score.is_estimated,
            crop_season=latest_score.crop_season,
            generated_at=latest_score.generated_at.isoformat() + "Z",
            sub_scores=sub_scores,
        )

    # Loan offer
    loan_out = None
    if latest_score:
        from app.ml.score_bands import get_loan_recommendation
        rec = get_loan_recommendation(latest_score.score)
        loan_out = LoanOfferOut(
            amount_min_inr=rec["amount_min_inr"],
            amount_max_inr=rec["amount_max_inr"],
            rate_percent=rec["rate_percent"],
            score_band=rec["score_band"],
        )

    # Scheme status
    scheme_result = await db.execute(
        select(SchemeEnrollment).where(SchemeEnrollment.farmer_id == farmer.id)
    )
    scheme = scheme_result.scalar_one_or_none()
    scheme_out = SchemeStatusOut(
        pm_kisan=scheme.pm_kisan_enrolled if scheme else "unknown",
        pmfby=scheme.pmfby_enrolled if scheme else "unknown",
    ) if scheme else None

    # Distress flag
    distress_result = await db.execute(
        select(DistressFlag).where(DistressFlag.farmer_id == farmer.id, DistressFlag.status == "active")
    )
    distress = distress_result.scalar_one_or_none()
    distress_out = DistressFlagOut(
        status="active",
        message="Your farm may be at risk. Contact your bank officer for support.",
        message_hi="आपका खेत जोखिम में हो सकता है। अपने बैंक अधिकारी से संपर्क करें।",
    ) if distress else None

    return FarmerDashboardResponse(
        farmer_id=farmer.farmer_id,
        full_name=farmer.full_name,
        district=farmer.district,
        state=farmer.state,
        primary_crop=farmer.primary_crop,
        secondary_crop=farmer.secondary_crop,
        land_area_acres=farmer.land_area_acres,
        aadhaar_masked=mask_aadhaar(farmer.aadhaar_hash[-12:]),
        latest_score=score_out,
        loan_offer=loan_out,
        distress_flag=distress_out,
        scheme_status=scheme_out,
    )


@router.get("/{farmer_id}/score-history", response_model=ScoreHistoryResponse)
async def get_score_history(farmer_id: str, db: AsyncSession = Depends(get_db)):
    """Return past score snapshots for the score timeline."""
    result = await db.execute(select(Farmer).where(Farmer.farmer_id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Farmer not found."})

    scores_result = await db.execute(
        select(KisanScore).where(KisanScore.farmer_id == farmer.id)
        .order_by(KisanScore.generated_at.asc())
    )
    scores = scores_result.scalars().all()

    history = [
        ScoreHistoryItem(
            score=s.score,
            score_category=s.score_category,
            crop_season=s.crop_season,
            generated_at=s.generated_at.isoformat() + "Z",
        )
        for s in scores
    ]

    message = None
    if len(history) < 2:
        message = "More history will appear after your next season."

    return ScoreHistoryResponse(farmer_id=farmer_id, history=history, message=message)


@router.get("/{farmer_id}/xai-report", response_model=XAIReportResponse)
async def get_xai_report(farmer_id: str, db: AsyncSession = Depends(get_db)):
    """Return SHAP explainability report for latest score."""
    result = await db.execute(select(Farmer).where(Farmer.farmer_id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Farmer not found."})

    score_result = await db.execute(
        select(KisanScore).where(KisanScore.farmer_id == farmer.id)
        .order_by(KisanScore.generated_at.desc()).limit(1)
    )
    score = score_result.scalar_one_or_none()
    if not score:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "No score found for this farmer."})

    # Parse SHAP factors
    shap_data = json.loads(score.shap_json) if score.shap_json else []
    factors = [
        XAIFactorOut(
            label=f.get("label", ""),
            label_hi=f.get("label_hi", ""),
            impact="positive" if f.get("contribution", 0) >= 0 else "negative",
            contribution_points=f.get("contribution", 0),
            description_en=f"Feature value: {f.get('feature_value', 'N/A')}",
            description_hi=f"मान: {f.get('feature_value', 'N/A')}",
        )
        for f in shap_data
    ]

    data_sources = json.loads(score.data_sources) if score.data_sources else {}

    return XAIReportResponse(
        farmer_id=farmer_id,
        score=score.score,
        crop_season=score.crop_season,
        factors=factors,
        ai_summary_en=score.xai_summary_en or "",
        ai_summary_hi=score.xai_summary_hi or "",
        data_sources=data_sources,
    )


@router.get("/{farmer_id}/benchmark", response_model=BenchmarkResponse)
async def get_benchmark(farmer_id: str, db: AsyncSession = Depends(get_db)):
    """Return regional score comparison."""
    result = await db.execute(select(Farmer).where(Farmer.farmer_id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Farmer not found."})

    # Get farmer's latest score
    latest = await db.execute(
        select(KisanScore.score).where(KisanScore.farmer_id == farmer.id)
        .order_by(KisanScore.generated_at.desc()).limit(1)
    )
    farmer_score = latest.scalar_one_or_none() or 0

    # District average
    dist_avg = await db.execute(
        select(func.avg(KisanScore.score), func.count(KisanScore.score))
        .join(Farmer, Farmer.id == KisanScore.farmer_id)
        .where(Farmer.district == farmer.district)
    )
    dist_row = dist_avg.one()
    dist_average = round(float(dist_row[0] or 0), 1)
    dist_sample = int(dist_row[1] or 0)

    # State average
    state_avg = await db.execute(
        select(func.avg(KisanScore.score))
        .join(Farmer, Farmer.id == KisanScore.farmer_id)
        .where(Farmer.state == farmer.state)
    )
    state_average = round(float(state_avg.scalar() or 0), 1)

    message = None
    if dist_sample < 10:
        message = "Not enough data for district average."

    return BenchmarkResponse(
        farmer_score=farmer_score,
        district=farmer.district,
        district_average=dist_average,
        state_average=state_average,
        district_sample_size=dist_sample,
        message=message,
    )
