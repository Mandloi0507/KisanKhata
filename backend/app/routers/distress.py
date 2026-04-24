"""Distress management routes."""

import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.middleware.auth_middleware import get_current_officer
from app.models.bank_officer import BankOfficer
from app.models.distress_flag import DistressFlag
from app.models.farmer import Farmer
from app.models.loan_application import LoanApplication
from app.models.audit_log import AuditLog
from app.schemas.loan import DistressAcknowledgeRequest, DistressResolveRequest

router = APIRouter()


@router.get("/")
async def list_distress(
    status: str = Query("active"),
    officer: BankOfficer = Depends(get_current_officer),
    db: AsyncSession = Depends(get_db),
):
    """List distress flags for the officer's bank."""
    query = (
        select(DistressFlag, Farmer)
        .join(Farmer, Farmer.id == DistressFlag.farmer_id)
        .join(LoanApplication, LoanApplication.farmer_id == Farmer.id)
        .where(LoanApplication.bank_id == officer.bank_id)
    )
    if status != "all":
        query = query.where(DistressFlag.status == status)
    query = query.order_by(DistressFlag.flagged_at.asc())

    result = await db.execute(query)
    rows = result.unique().all()

    alerts = []
    for flag, farmer in rows:
        days_since = (datetime.now(timezone.utc) - flag.flagged_at.replace(tzinfo=timezone.utc)).days
        alerts.append({
            "distress_id": flag.id,
            "farmer_id": farmer.farmer_id,
            "farmer_name": farmer.full_name,
            "district": farmer.district,
            "triggers": {
                "drought": flag.drought_triggered,
                "score_drop": flag.score_drop_triggered,
                "no_insurance": flag.no_insurance_triggered,
            },
            "score_current": flag.score_current,
            "score_previous": flag.score_previous,
            "status": flag.status,
            "flagged_at": flag.flagged_at.isoformat() + "Z",
            "days_since_flagged": days_since,
        })

    return {"distress_alerts": alerts, "total": len(alerts)}


@router.post("/{distress_id}/acknowledge")
async def acknowledge_distress(
    distress_id: str,
    body: DistressAcknowledgeRequest,
    officer: BankOfficer = Depends(get_current_officer),
    db: AsyncSession = Depends(get_db),
):
    """Acknowledge a distress flag."""
    result = await db.execute(select(DistressFlag).where(DistressFlag.id == distress_id))
    flag = result.scalar_one_or_none()
    if not flag:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Distress flag not found."})

    flag.status = body.new_status
    flag.acknowledged_by_officer_id = officer.id
    flag.acknowledged_at = datetime.now(timezone.utc)
    flag.officer_action_note = body.action_note

    audit = AuditLog(
        event_type="distress_acknowledged",
        actor_id=officer.id,
        actor_type="bank_officer",
        target_entity_type="distress_flag",
        target_entity_id=flag.id,
        payload_json=json.dumps({"action_note": body.action_note, "new_status": body.new_status}),
    )
    db.add(audit)
    await db.commit()

    return {
        "distress_id": flag.id,
        "status": flag.status,
        "acknowledged_at": flag.acknowledged_at.isoformat() + "Z",
    }


@router.post("/{distress_id}/resolve")
async def resolve_distress(
    distress_id: str,
    body: DistressResolveRequest,
    officer: BankOfficer = Depends(get_current_officer),
    db: AsyncSession = Depends(get_db),
):
    """Resolve/clear a distress flag."""
    result = await db.execute(select(DistressFlag).where(DistressFlag.id == distress_id))
    flag = result.scalar_one_or_none()
    if not flag:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Distress flag not found."})

    flag.status = "false_positive" if body.is_false_positive else "resolved"
    flag.officer_action_note = body.resolution_note

    audit = AuditLog(
        event_type="distress_cleared",
        actor_id=officer.id,
        actor_type="bank_officer",
        target_entity_type="distress_flag",
        target_entity_id=flag.id,
        payload_json=json.dumps({"resolution_note": body.resolution_note, "is_false_positive": body.is_false_positive}),
    )
    db.add(audit)
    await db.commit()

    return {"distress_id": flag.id, "status": flag.status, "message": "Distress flag resolved."}
