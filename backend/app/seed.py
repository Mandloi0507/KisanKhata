"""
Database seed script — populates demo data for hackathon presentation.
Creates: 1 bank, 1 demo officer, 12 farmers, 12 scores, 12 loan applications, 2 distress flags.

Run:  python -m app.seed
"""

import asyncio
import uuid
import json
import random
from datetime import datetime, timedelta
import bcrypt as _bcrypt

from app.database import engine, async_session, Base
from app.models.farmer import Farmer
from app.models.kisan_score import KisanScore
from app.models.bank import Bank
from app.models.bank_officer import BankOfficer
from app.models.loan_application import LoanApplication
from app.models.distress_flag import DistressFlag
from app.models.scheme_enrollment import SchemeEnrollment
from app.models.audit_log import AuditLog
from app.utils.encryption import encrypt_aadhaar, hash_aadhaar, mask_aadhaar
from app.data.districts import get_district_coords
from app.ml.score_bands import get_loan_recommendation


# === DEMO DATA ===

DEMO_FARMERS = [
    {
        "farmer_id": "KK-2026-00001", "full_name": "Ramesh Kumar", "mobile": "9876543210",
        "state": "Madhya Pradesh", "district": "Vidisha", "primary_crop": "Wheat",
        "secondary_crop": "Soybean", "land_acres": 2.5, "aadhaar": "234567890123",
        "score": 742, "category": "Good", "season": "Rabi_2026", "pm_kisan": "enrolled", "pmfby": "enrolled",
    },
    {
        "farmer_id": "KK-2026-00002", "full_name": "Sunita Devi", "mobile": "9876543211",
        "state": "Madhya Pradesh", "district": "Bhopal", "primary_crop": "Soybean",
        "secondary_crop": "Pulses", "land_acres": 1.8, "aadhaar": "345678901234",
        "score": 489, "category": "Fair", "season": "Kharif_2025", "pm_kisan": "enrolled", "pmfby": "not_enrolled",
    },
    {
        "farmer_id": "KK-2026-00003", "full_name": "Arjun Singh Patel", "mobile": "9876543212",
        "state": "Punjab", "district": "Ludhiana", "primary_crop": "Wheat",
        "secondary_crop": "Rice", "land_acres": 8.0, "aadhaar": "456789012345",
        "score": 856, "category": "Excellent", "season": "Rabi_2026", "pm_kisan": "enrolled", "pmfby": "enrolled",
    },
    {
        "farmer_id": "KK-2026-00004", "full_name": "Lakshmi Bai", "mobile": "9876543213",
        "state": "Maharashtra", "district": "Nashik", "primary_crop": "Cotton",
        "secondary_crop": None, "land_acres": 1.2, "aadhaar": "567890123456",
        "score": 320, "category": "Poor", "season": "Kharif_2025", "pm_kisan": "not_enrolled", "pmfby": "not_enrolled",
    },
    {
        "farmer_id": "KK-2026-00005", "full_name": "Govind Sharma", "mobile": "9876543214",
        "state": "Uttar Pradesh", "district": "Meerut", "primary_crop": "Sugarcane",
        "secondary_crop": "Wheat", "land_acres": 5.5, "aadhaar": "678901234567",
        "score": 685, "category": "Good", "season": "Rabi_2026", "pm_kisan": "enrolled", "pmfby": "enrolled",
    },
    {
        "farmer_id": "KK-2026-00006", "full_name": "Meena Kumari", "mobile": "9876543215",
        "state": "Bihar", "district": "Patna", "primary_crop": "Rice",
        "secondary_crop": "Maize", "land_acres": 0.8, "aadhaar": "789012345678",
        "score": 410, "category": "Fair", "season": "Kharif_2025", "pm_kisan": "enrolled", "pmfby": "not_enrolled",
    },
    {
        "farmer_id": "KK-2026-00007", "full_name": "Rajesh Verma", "mobile": "9876543216",
        "state": "Maharashtra", "district": "Aurangabad", "primary_crop": "Soybean",
        "secondary_crop": "Cotton", "land_acres": 3.5, "aadhaar": "890123456789",
        "score": 618, "category": "Good", "season": "Kharif_2025", "pm_kisan": "enrolled", "pmfby": "enrolled",
    },
    {
        "farmer_id": "KK-2026-00008", "full_name": "Geeta Rani", "mobile": "9876543217",
        "state": "Madhya Pradesh", "district": "Sehore", "primary_crop": "Wheat",
        "secondary_crop": "Pulses", "land_acres": 1.5, "aadhaar": "901234567890",
        "score": 555, "category": "Fair", "season": "Rabi_2026", "pm_kisan": "not_enrolled", "pmfby": "not_enrolled",
    },
    {
        "farmer_id": "KK-2026-00009", "full_name": "Dinesh Yadav", "mobile": "9876543218",
        "state": "Punjab", "district": "Amritsar", "primary_crop": "Rice",
        "secondary_crop": "Wheat", "land_acres": 12.0, "aadhaar": "012345678901",
        "score": 924, "category": "Excellent", "season": "Kharif_2025", "pm_kisan": "enrolled", "pmfby": "enrolled",
    },
    {
        "farmer_id": "KK-2026-00010", "full_name": "Anita Gupta", "mobile": "9876543219",
        "state": "Karnataka", "district": "Mysuru", "primary_crop": "Sugarcane",
        "secondary_crop": None, "land_acres": 4.0, "aadhaar": "112345678901",
        "score": 775, "category": "Excellent", "season": "Rabi_2026", "pm_kisan": "enrolled", "pmfby": "enrolled",
    },
    {
        "farmer_id": "KK-2026-00011", "full_name": "Bharat Deshmukh", "mobile": "9876543220",
        "state": "Maharashtra", "district": "Nagpur", "primary_crop": "Cotton",
        "secondary_crop": "Soybean", "land_acres": 2.0, "aadhaar": "122345678901",
        "score": 280, "category": "Poor", "season": "Kharif_2025", "pm_kisan": "not_enrolled", "pmfby": "not_enrolled",
    },
    {
        "farmer_id": "KK-2026-00012", "full_name": "Parvati Devi", "mobile": "9876543221",
        "state": "Uttar Pradesh", "district": "Varanasi", "primary_crop": "Rice",
        "secondary_crop": "Mustard", "land_acres": 1.0, "aadhaar": "132345678901",
        "score": 450, "category": "Fair", "season": "Kharif_2025", "pm_kisan": "enrolled", "pmfby": "not_enrolled",
    },
]

# XAI templates for different score ranges
SHAP_TEMPLATES = {
    "Excellent": [
        {"feature_name": "ndvi_value", "label": "Crop Health (NDVI)", "label_hi": "फसल स्वास्थ्य", "contribution": 75, "direction": "positive", "shap_value": 150.0, "feature_value": 0.82},
        {"feature_name": "estimated_revenue_log", "label": "Income Potential (Mandi)", "label_hi": "आय क्षमता", "contribution": 60, "direction": "positive", "shap_value": 120.0, "feature_value": 0.78},
        {"feature_name": "pmfby_enrolled", "label": "Crop Insurance (PMFBY)", "label_hi": "फसल बीमा", "contribution": 45, "direction": "positive", "shap_value": 90.0, "feature_value": 1.0},
        {"feature_name": "rainfall_deviation_pct", "label": "Rainfall Risk", "label_hi": "वर्षा जोखिम", "contribution": 30, "direction": "positive", "shap_value": 60.0, "feature_value": 0.05},
    ],
    "Good": [
        {"feature_name": "ndvi_value", "label": "Crop Health (NDVI)", "label_hi": "फसल स्वास्थ्य", "contribution": 50, "direction": "positive", "shap_value": 100.0, "feature_value": 0.65},
        {"feature_name": "estimated_revenue_log", "label": "Income Potential (Mandi)", "label_hi": "आय क्षमता", "contribution": 35, "direction": "positive", "shap_value": 70.0, "feature_value": 0.55},
        {"feature_name": "rainfall_deviation_pct", "label": "Rainfall Risk", "label_hi": "वर्षा जोखिम", "contribution": -15, "direction": "negative", "shap_value": -30.0, "feature_value": -0.15},
        {"feature_name": "pm_kisan_enrolled", "label": "PM-KISAN Enrollment", "label_hi": "पीएम-किसान", "contribution": 25, "direction": "positive", "shap_value": 50.0, "feature_value": 1.0},
    ],
    "Fair": [
        {"feature_name": "ndvi_value", "label": "Crop Health (NDVI)", "label_hi": "फसल स्वास्थ्य", "contribution": 20, "direction": "positive", "shap_value": 40.0, "feature_value": 0.48},
        {"feature_name": "rainfall_deviation_pct", "label": "Rainfall Risk", "label_hi": "वर्षा जोखिम", "contribution": -35, "direction": "negative", "shap_value": -70.0, "feature_value": -0.25},
        {"feature_name": "pmfby_enrolled", "label": "Crop Insurance (PMFBY)", "label_hi": "फसल बीमा", "contribution": -20, "direction": "negative", "shap_value": -40.0, "feature_value": 0.0},
        {"feature_name": "estimated_revenue_log", "label": "Income Potential (Mandi)", "label_hi": "आय क्षमता", "contribution": 15, "direction": "positive", "shap_value": 30.0, "feature_value": 0.40},
    ],
    "Poor": [
        {"feature_name": "ndvi_value", "label": "Crop Health (NDVI)", "label_hi": "फसल स्वास्थ्य", "contribution": -45, "direction": "negative", "shap_value": -90.0, "feature_value": 0.28},
        {"feature_name": "rainfall_deviation_pct", "label": "Rainfall Risk", "label_hi": "वर्षा जोखिम", "contribution": -55, "direction": "negative", "shap_value": -110.0, "feature_value": -0.42},
        {"feature_name": "pmfby_enrolled", "label": "Crop Insurance (PMFBY)", "label_hi": "फसल बीमा", "contribution": -30, "direction": "negative", "shap_value": -60.0, "feature_value": 0.0},
        {"feature_name": "land_area_acres", "label": "Land Area", "label_hi": "ज़मीन", "contribution": -20, "direction": "negative", "shap_value": -40.0, "feature_value": 0.06},
    ],
}


async def seed():
    """Seed the database with demo data."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Check if already seeded
        from sqlalchemy import select, func
        count = await db.execute(select(func.count()).select_from(Farmer))
        if (count.scalar() or 0) > 0:
            print("[WARN] Database already has data. Skipping seed.")
            return

        print("[SEED] Seeding database...")

        # === 1. Create Bank ===
        bank_id = str(uuid.uuid4())
        bank = Bank(
            id=bank_id,
            bank_code="NGB001",
            bank_name="Nashik Grameen Bank",
            state="Maharashtra",
            contact_email="admin@nashikgameenbank.in",
        )
        db.add(bank)
        print("  [OK] Created bank: Nashik Grameen Bank")

        # === 2. Create Demo Officer ===
        officer_id = str(uuid.uuid4())
        officer = BankOfficer(
            id=officer_id,
            bank_id=bank_id,
            email="priya@kisankhata.in",
            password_hash=_bcrypt.hashpw("demo1234".encode(), _bcrypt.gensalt(12)).decode(),
            full_name="Priya Nair",
            role="manager",
        )
        db.add(officer)
        print("  [OK] Created officer: Priya Nair (priya@kisankhata.in / demo1234)")

        # === 3. Create Farmers and Scores ===
        statuses = ["pending", "pending", "approved", "pending", "approved", "pending",
                     "rejected", "pending", "approved", "pending", "pending", "pending"]

        for i, f in enumerate(DEMO_FARMERS):
            coords = get_district_coords(f["district"])
            farmer_uuid = str(uuid.uuid4())

            farmer = Farmer(
                id=farmer_uuid,
                farmer_id=f["farmer_id"],
                aadhaar_encrypted=encrypt_aadhaar(f["aadhaar"]),
                aadhaar_hash=hash_aadhaar(f["aadhaar"]),
                full_name=f["full_name"],
                mobile_number=f["mobile"],
                state=f["state"],
                district=f["district"],
                district_lat=coords["lat"],
                district_lng=coords["lng"],
                primary_crop=f["primary_crop"],
                secondary_crop=f["secondary_crop"],
                land_area_acres=f["land_acres"],
                created_at=datetime.utcnow() - timedelta(days=random.randint(5, 30)),
            )
            db.add(farmer)

            # Score
            ndvi = round(random.uniform(0.3, 0.85), 2)
            rainfall = round(random.uniform(600, 1200), 0)
            revenue = round(f["land_acres"] * random.uniform(40000, 80000), 0)
            mandi_price = round(random.uniform(1800, 5000), 0)

            sub_ndvi = int(min(max(ndvi * 250, 0), 200))
            sub_weather = random.randint(80, 180)
            sub_income = int(min(max(revenue / 500, 0), 200))
            sub_land = int(min(max(f["land_acres"] * 40, 0), 200))
            sub_scheme = (80 if f["pm_kisan"] == "enrolled" else 0) + (120 if f["pmfby"] == "enrolled" else 30)

            shap_data = SHAP_TEMPLATES.get(f["category"], SHAP_TEMPLATES["Fair"])
            xai_en = f"{f['full_name']}'s {f['primary_crop']} profile in {f['district']} shows {'strong' if f['score'] > 600 else 'moderate'} creditworthiness."
            xai_hi = f"{f['full_name']} की {f['primary_crop']} प्रोफ़ाइल {'मजबूत' if f['score'] > 600 else 'सामान्य'} है।"

            score_uuid = str(uuid.uuid4())
            score = KisanScore(
                id=score_uuid,
                farmer_id=farmer_uuid,
                score=f["score"],
                score_category=f["category"],
                crop_season=f["season"],
                ndvi_subscore=sub_ndvi,
                weather_subscore=sub_weather,
                income_subscore=sub_income,
                land_subscore=sub_land,
                scheme_subscore=min(sub_scheme, 200),
                ndvi_value=ndvi,
                rainfall_mm=rainfall,
                estimated_revenue_inr=revenue,
                mandi_price_inr=mandi_price,
                shap_json=json.dumps(shap_data),
                xai_summary_en=xai_en,
                xai_summary_hi=xai_hi,
                data_sources=json.dumps({
                    "ndvi": "NASA POWER API (solar proxy)",
                    "rainfall": "NASA POWER API",
                    "mandi_price": "AGMARKNET (data.gov.in)",
                    "weather": "OpenWeatherMap",
                }),
                generated_at=datetime.utcnow() - timedelta(days=random.randint(1, 10)),
            )
            db.add(score)

            # Loan application
            loan_rec = get_loan_recommendation(f["score"])
            app_status = statuses[i]
            loan = LoanApplication(
                farmer_id=farmer_uuid,
                score_id=score_uuid,
                bank_id=bank_id,
                idempotency_key=f"{farmer_uuid}:{f['season']}:{uuid.uuid4().hex[:8]}",
                recommended_amount_min_inr=loan_rec["amount_min_inr"],
                recommended_amount_max_inr=loan_rec["amount_max_inr"],
                recommended_rate_percent=loan_rec["rate_percent"],
                status=app_status,
                approved_amount_inr=loan_rec["amount_max_inr"] if app_status == "approved" else None,
                approved_rate_percent=loan_rec["rate_percent"] if app_status == "approved" else None,
                decided_by_officer_id=officer_id if app_status != "pending" else None,
                decided_at=datetime.utcnow() - timedelta(days=1) if app_status != "pending" else None,
                decision_comment="Low score, high risk in current season." if app_status == "rejected" else ("Approved. Good profile." if app_status == "approved" else None),
                ledger_check_result="clear",
                created_at=datetime.utcnow() - timedelta(days=random.randint(2, 15)),
            )
            db.add(loan)

            # Scheme enrollment
            scheme = SchemeEnrollment(
                farmer_id=farmer_uuid,
                pm_kisan_enrolled=f["pm_kisan"],
                pmfby_enrolled=f["pmfby"],
                data_source="mock",
            )
            db.add(scheme)

            print(f"  [OK] Farmer: {f['full_name']} | Score: {f['score']} ({f['category']}) | App: {app_status}")

        # === 4. Create Distress Flags ===
        # Lakshmi Bai (Poor, no insurance) and Bharat Deshmukh (Poor, no insurance)
        for farmer_data in [DEMO_FARMERS[3], DEMO_FARMERS[10]]:
            # Find the farmer we just created
            from sqlalchemy import select
            farmer_result = await db.execute(
                select(Farmer).where(Farmer.farmer_id == farmer_data["farmer_id"])
            )
            farmer_obj = farmer_result.scalar_one_or_none()
            if farmer_obj:
                distress = DistressFlag(
                    farmer_id=farmer_obj.id,
                    drought_triggered=True,
                    score_drop_triggered=True,
                    no_insurance_triggered=True,
                    score_current=farmer_data["score"],
                    score_previous=farmer_data["score"] + random.randint(100, 200),
                    status="active",
                    flagged_at=datetime.utcnow() - timedelta(days=random.randint(3, 7)),
                )
                db.add(distress)
                print(f"  [ALERT] Distress flag: {farmer_data['full_name']}")

        await db.commit()
        print("\n[DONE] Seed complete! Database ready for demo.")
        print("   Login:  priya@kisankhata.in / demo1234")


if __name__ == "__main__":
    asyncio.run(seed())
