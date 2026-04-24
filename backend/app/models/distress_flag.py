"""Distress flag model — at-risk farmer detection records."""

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class DistressFlag(Base):
    __tablename__ = "distress_flags"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id: Mapped[str] = mapped_column(String(36), ForeignKey("farmers.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Trigger conditions
    drought_triggered: Mapped[bool] = mapped_column(Boolean, nullable=False)
    score_drop_triggered: Mapped[bool] = mapped_column(Boolean, nullable=False)
    no_insurance_triggered: Mapped[bool] = mapped_column(Boolean, nullable=False)

    # Score context
    score_current: Mapped[int] = mapped_column(Integer, nullable=False)
    score_previous: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Status workflow
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)  # active, acknowledged, in_progress, resolved, false_positive
    acknowledged_by_officer_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("bank_officers.id", ondelete="SET NULL"), nullable=True)
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    officer_action_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    data_quality_warning: Mapped[bool] = mapped_column(Boolean, default=False)
    flagged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="distress_flag")
