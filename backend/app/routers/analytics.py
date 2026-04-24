"""Portfolio analytics route."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.middleware.auth_middleware import get_current_officer
from app.models.bank_officer import BankOfficer
from app.models.loan_application import LoanApplication
from app.models.kisan_score import KisanScore
from app.models.farmer import Farmer
from app.models.distress_flag import DistressFlag
from app.ml.score_bands import get_score_category

router = APIRouter()


@router.get("/analytics")
async def get_analytics(
    period: str = Query("all_time"),
    officer: BankOfficer = Depends(get_current_officer),
    db: AsyncSession = Depends(get_db),
):
    """Portfolio-level analytics for the bank."""
    bank_id = officer.bank_id

    # Total applications
    total = await db.execute(
        select(func.count()).select_from(LoanApplication).where(LoanApplication.bank_id == bank_id)
    )
    total_apps = total.scalar() or 0

    # By status
    for s in ["pending", "approved", "rejected"]:
        count = await db.execute(
            select(func.count()).select_from(LoanApplication)
            .where(LoanApplication.bank_id == bank_id, LoanApplication.status == s)
        )
        locals()[s + "_count"] = count.scalar() or 0

    pending_count = locals().get("pending_count", 0)
    approved_count = locals().get("approved_count", 0)
    rejected_count = locals().get("rejected_count", 0)

    decided = approved_count + rejected_count
    approval_rate = round((approved_count / decided * 100) if decided > 0 else 0, 1)

    # Average score of approved
    avg_score = await db.execute(
        select(func.avg(KisanScore.score))
        .join(LoanApplication, LoanApplication.score_id == KisanScore.id)
        .where(LoanApplication.bank_id == bank_id, LoanApplication.status == "approved")
    )
    avg_approved_score = round(float(avg_score.scalar() or 0), 0)

    # Active distress
    distress_count = await db.execute(
        select(func.count()).select_from(DistressFlag)
        .join(Farmer, Farmer.id == DistressFlag.farmer_id)
        .join(LoanApplication, LoanApplication.farmer_id == Farmer.id)
        .where(LoanApplication.bank_id == bank_id, DistressFlag.status == "active")
    )
    active_distress = distress_count.scalar() or 0

    # District breakdown
    dist_breakdown = await db.execute(
        select(Farmer.district, func.count())
        .join(LoanApplication, LoanApplication.farmer_id == Farmer.id)
        .where(LoanApplication.bank_id == bank_id)
        .group_by(Farmer.district)
        .order_by(func.count().desc())
    )
    by_district = [{"district": r[0], "count": r[1]} for r in dist_breakdown.all()]

    # Score band breakdown
    band_breakdown = await db.execute(
        select(KisanScore.score_category, func.count())
        .join(LoanApplication, LoanApplication.score_id == KisanScore.id)
        .where(LoanApplication.bank_id == bank_id)
        .group_by(KisanScore.score_category)
    )
    by_band = [{"band": r[0], "count": r[1]} for r in band_breakdown.all()]

    return {
        "period": period,
        "total_applications": total_apps,
        "pending": pending_count,
        "approved": approved_count,
        "rejected": rejected_count,
        "approval_rate_percent": approval_rate,
        "average_score_approved": avg_approved_score,
        "active_distress_count": active_distress,
        "district_breakdown": by_district,
        "by_band": by_band,
        "monthlyTrend": [],  # Would need time-series aggregation
        "byDistrict": by_district,
    }
