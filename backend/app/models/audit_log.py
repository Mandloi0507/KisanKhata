"""Audit log model — immutable append-only log of all decisions and sensitive operations."""

import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # loan_approved, loan_rejected, distress_acknowledged, etc.
    actor_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    actor_type: Mapped[str] = mapped_column(String(20), nullable=False)  # bank_officer, system
    target_entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # loan_application, distress_flag, farmer
    target_entity_id: Mapped[str] = mapped_column(String(36), nullable=False)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)  # Full JSON snapshot
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        Index("idx_audit_target_entity", "target_entity_type", "target_entity_id"),
    )
