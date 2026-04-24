"""Bank dashboard routes — applications, detail, approve/reject, export."""

import json
import csv
import io
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc

from app.database import get_db
from app.middleware.auth_middleware import get_current_officer
from app.models.bank_officer import BankOfficer
from app.models.loan_application import LoanApplication
from app.models.kisan_score import KisanScore
from app.models.farmer import Farmer
from app.models.distress_flag import DistressFlag
from app.models.scheme_enrollment import SchemeEnrollment
from app.models.audit_log import AuditLog
from app.schemas.loan import DecisionRequest, DecisionResponse, PaginationOut
from app.utils.encryption import mask_aadhaar
from app.ml.score_bands import get_score_category

router = APIRouter()


@router.get("/applications")
async def list_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    score_category: str | None = None,
    district: str | None = None,
    distress_only: bool = False,
    status: str | None = None,
    officer: BankOfficer = Depends(get_current_officer),
    db: AsyncSession = Depends(get_db),
):
    """Paginated, filtered list of loan applications for officer's bank."""
    query = (
        select(LoanApplication, Farmer, KisanScore)
        .join(Farmer, Farmer.id == LoanApplication.farmer_id)
        .outerjoin(KisanScore, KisanScore.id == LoanApplication.score_id)
        .where(LoanApplication.bank_id == officer.bank_id)
    )

    # Filters
    if status:
        query = query.where(LoanApplication.status == status)
    if district:
        query = query.where(Farmer.district == district)
    if score_category:
        query = query.where(KisanScore.score_category == score_category)
    if distress_only:
        query = query.join(DistressFlag, DistressFlag.farmer_id == Farmer.id).where(DistressFlag.status == "active")

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Sort
    if sort_by == "score":
        order_col = KisanScore.score
    else:
        order_col = LoanApplication.created_at
    query = query.order_by(desc(order_col) if sort_order == "desc" else asc(order_col))

    # Paginate
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    applications = []
    for app, farmer, score in rows:
        # Check distress
        distress_result = await db.execute(
            select(DistressFlag).where(DistressFlag.farmer_id == farmer.id, DistressFlag.status.in_(["active", "acknowledged", "in_progress"]))
        )
        distress = distress_result.scalar_one_or_none()

        applications.append({
            "id": app.id,
            "farmer": {
                "id": farmer.farmer_id,
                "name": farmer.full_name,
                "aadhaarMasked": mask_aadhaar(farmer.aadhaar_hash[-12:]),
                "district": farmer.district,
                "state": farmer.state,
                "primaryCrop": farmer.primary_crop,
                "secondaryCrop": farmer.secondary_crop,
                "landAcres": farmer.land_area_acres,
                "phone": farmer.mobile_number,
            },
            "submittedAt": app.created_at.isoformat() + "Z",
            "score": score.score if score else 0,
            "band": score.score_category if score else "Poor",
            "subScores": _build_sub_scores(score) if score else [],
            "xai": _build_xai_factors(score) if score else [],
            "summary": score.xai_summary_en if score else "",
            "recommendation": {
                "amountMin": app.recommended_amount_min_inr,
                "amountMax": app.recommended_amount_max_inr,
                "rate": app.recommended_rate_percent,
                "tenureMonths": 12,
            },
            "requestedAmount": app.recommended_amount_max_inr,
            "ledger": {
                "status": app.ledger_check_result or "clear",
                "bankName": json.loads(app.ledger_check_detail).get("bankName") if app.ledger_check_detail else None,
                "checkedAt": app.created_at.isoformat() + "Z",
            },
            "distress": distress.status.capitalize() if distress else None,
            "status": _map_status(app.status),
            "scoreHistory": await _get_score_history_mini(farmer.id, db),
        })

    return {
        "applications": applications,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": max(1, (total + limit - 1) // limit),
        },
    }


@router.get("/applications/{application_id}")
async def get_application_detail(
    application_id: str,
    officer: BankOfficer = Depends(get_current_officer),
    db: AsyncSession = Depends(get_db),
):
    """Full detail view for a single application."""
    result = await db.execute(
        select(LoanApplication, Farmer, KisanScore)
        .join(Farmer, Farmer.id == LoanApplication.farmer_id)
        .outerjoin(KisanScore, KisanScore.id == LoanApplication.score_id)
        .where(LoanApplication.id == application_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Application not found."})

    app, farmer, score = row

    # Tenant isolation
    if app.bank_id != officer.bank_id:
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "Access denied."})

    # Get scheme and distress
    scheme_result = await db.execute(select(SchemeEnrollment).where(SchemeEnrollment.farmer_id == farmer.id))
    scheme = scheme_result.scalar_one_or_none()

    distress_result = await db.execute(
        select(DistressFlag).where(DistressFlag.farmer_id == farmer.id)
    )
    distress = distress_result.scalar_one_or_none()

    return {
        "id": app.id,
        "farmer": {
            "id": farmer.farmer_id,
            "name": farmer.full_name,
            "aadhaarMasked": mask_aadhaar(farmer.aadhaar_hash[-12:]),
            "district": farmer.district,
            "state": farmer.state,
            "primaryCrop": farmer.primary_crop,
            "secondaryCrop": farmer.secondary_crop,
            "landAcres": farmer.land_area_acres,
            "phone": farmer.mobile_number,
        },
        "submittedAt": app.created_at.isoformat() + "Z",
        "score": score.score if score else 0,
        "band": score.score_category if score else "Poor",
        "subScores": _build_sub_scores(score) if score else [],
        "xai": _build_xai_factors(score) if score else [],
        "summary": score.xai_summary_en if score else "",
        "recommendation": {
            "amountMin": app.recommended_amount_min_inr,
            "amountMax": app.recommended_amount_max_inr,
            "rate": app.recommended_rate_percent,
            "tenureMonths": 12,
        },
        "requestedAmount": app.recommended_amount_max_inr,
        "ledger": {
            "status": app.ledger_check_result or "clear",
            "bankName": json.loads(app.ledger_check_detail).get("bankName") if app.ledger_check_detail else None,
            "checkedAt": app.created_at.isoformat() + "Z",
        },
        "distress": distress.status.capitalize() if distress else None,
        "status": _map_status(app.status),
        "scoreHistory": await _get_score_history_mini(farmer.id, db),
        "schemeStatus": {
            "pmKisan": scheme.pm_kisan_enrolled if scheme else "unknown",
            "pmfby": scheme.pmfby_enrolled if scheme else "unknown",
        },
        "estimatedRevenue": score.estimated_revenue_inr if score else 0,
    }


@router.post("/applications/{application_id}/decide", response_model=DecisionResponse)
async def decide_application(
    application_id: str,
    body: DecisionRequest,
    officer: BankOfficer = Depends(get_current_officer),
    db: AsyncSession = Depends(get_db),
):
    """Approve or reject a loan application."""
    result = await db.execute(
        select(LoanApplication).where(LoanApplication.id == application_id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Application not found."})

    if app.bank_id != officer.bank_id:
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "Access denied."})

    if app.status != "pending":
        raise HTTPException(status_code=409, detail={"code": "DECISION_ALREADY_MADE", "message": "This application has already been decided."})

    # Validate approved amount
    if body.decision == "approved":
        if not body.approved_amount_inr:
            raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR", "message": "Approved amount is required."})
        max_allowed = int(app.recommended_amount_max_inr * 1.2)
        min_allowed = int(app.recommended_amount_min_inr * 0.8)
        if body.approved_amount_inr < min_allowed or body.approved_amount_inr > max_allowed:
            raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR", "message": f"Amount must be between {min_allowed} and {max_allowed}."})

    now = datetime.now(timezone.utc)
    app.status = body.decision
    app.decision_comment = body.comment
    app.decided_by_officer_id = officer.id
    app.decided_at = now

    if body.decision == "approved":
        app.approved_amount_inr = body.approved_amount_inr
        app.approved_rate_percent = body.approved_rate_percent or app.recommended_rate_percent

    # Create audit log
    audit = AuditLog(
        event_type=f"loan_{body.decision}",
        actor_id=officer.id,
        actor_type="bank_officer",
        target_entity_type="loan_application",
        target_entity_id=app.id,
        payload_json=json.dumps({
            "decision": body.decision,
            "comment": body.comment,
            "approved_amount": body.approved_amount_inr,
            "officer_name": officer.full_name,
        }),
    )
    db.add(audit)
    await db.commit()

    return DecisionResponse(
        application_id=app.id,
        status=body.decision,
        decided_at=now.isoformat() + "Z",
        message="Decision recorded. Farmer will be notified.",
    )


@router.get("/applications/export")
async def export_applications(
    officer: BankOfficer = Depends(get_current_officer),
    db: AsyncSession = Depends(get_db),
):
    """Export applications as CSV."""
    result = await db.execute(
        select(LoanApplication, Farmer, KisanScore)
        .join(Farmer, Farmer.id == LoanApplication.farmer_id)
        .outerjoin(KisanScore, KisanScore.id == LoanApplication.score_id)
        .where(LoanApplication.bank_id == officer.bank_id)
        .order_by(LoanApplication.created_at.desc())
    )
    rows = result.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Farmer ID", "Name", "District", "Aadhaar (Masked)", "Score", "Category", "Loan Amount", "Rate", "Status", "Decision", "Date"])

    for app, farmer, score in rows:
        writer.writerow([
            farmer.farmer_id, farmer.full_name, farmer.district,
            mask_aadhaar(farmer.aadhaar_hash[-12:]),
            score.score if score else "", score.score_category if score else "",
            app.approved_amount_inr or app.recommended_amount_max_inr,
            app.approved_rate_percent or app.recommended_rate_percent,
            app.status, app.decision_comment or "", app.created_at.strftime("%Y-%m-%d"),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=KisanKhata_Applications.csv"},
    )


def _map_status(status: str) -> str:
    """Map internal status to frontend status format."""
    mapping = {"pending": "Pending", "approved": "Approved", "rejected": "Rejected"}
    return mapping.get(status, "Pending")


def _build_sub_scores(score: KisanScore | None) -> list[dict]:
    if not score:
        return []
    return [
        {"key": "crop_health", "label": "Crop Health (NDVI)", "value": score.ndvi_subscore or 0, "max": 200, "trend": "up"},
        {"key": "rainfall_risk", "label": "Rainfall Risk", "value": score.weather_subscore or 0, "max": 200, "trend": "flat"},
        {"key": "income_potential", "label": "Income Potential", "value": score.income_subscore or 0, "max": 200, "trend": "up"},
        {"key": "scheme_enrolment", "label": "Scheme Enrolment", "value": score.scheme_subscore or 0, "max": 200, "trend": "up"},
    ]


def _build_xai_factors(score: KisanScore | None) -> list[dict]:
    if not score or not score.shap_json:
        return []
    try:
        factors = json.loads(score.shap_json)
        return [
            {
                "label": f.get("label", ""),
                "contribution": f.get("contribution", 0),
                "direction": f.get("direction", "positive"),
                "detail": f"Value: {f.get('feature_value', 'N/A')}",
            }
            for f in factors[:6]
        ]
    except (json.JSONDecodeError, TypeError):
        return []


async def _get_score_history_mini(farmer_internal_id: str, db: AsyncSession) -> list[dict]:
    """Get minimal score history for application detail."""
    result = await db.execute(
        select(KisanScore.crop_season, KisanScore.score)
        .where(KisanScore.farmer_id == farmer_internal_id)
        .order_by(KisanScore.generated_at.asc())
    )
    return [{"season": r[0], "score": r[1]} for r in result.all()]
