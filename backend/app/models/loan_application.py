"""Loan application model — tracks every loan application from farmer to bank."""

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id: Mapped[str] = mapped_column(String(36), ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False, index=True)
    score_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("kisan_scores.id", ondelete="SET NULL"), nullable=True)
    bank_id: Mapped[str] = mapped_column(String(36), ForeignKey("banks.id", ondelete="CASCADE"), nullable=False, index=True)
    idempotency_key: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)

    # Recommendation
    recommended_amount_min_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    recommended_amount_max_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    recommended_rate_percent: Mapped[float] = mapped_column(Float, nullable=False)

    # Decision
    approved_amount_inr: Mapped[int | None] = mapped_column(Integer, nullable=True)
    approved_rate_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", index=True)  # pending, approved, rejected
    decision_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    decided_by_officer_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("bank_officers.id", ondelete="SET NULL"), nullable=True)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Ledger check
    ledger_check_result: Mapped[str | None] = mapped_column(String(50), nullable=True)  # clear, duplicate_detected, error
    ledger_check_detail: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Rejection reasons
    rejection_reason_hi: Mapped[str | None] = mapped_column(Text, nullable=True)
    rejection_reason_en: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="loan_applications")
    bank = relationship("Bank", back_populates="loan_applications")
    score = relationship("KisanScore")

    __table_args__ = (
        Index("idx_loan_apps_bank_status", "bank_id", "status"),
        Index("idx_loan_apps_created_at", "created_at"),
    )
