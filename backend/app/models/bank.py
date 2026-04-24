"""Bank model — tenant registry for partner banks."""

import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Bank(Base):
    __tablename__ = "banks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    bank_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    bank_name: Mapped[str] = mapped_column(String(255), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    score_band_config: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON override
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    officers = relationship("BankOfficer", back_populates="bank", cascade="all, delete-orphan")
    loan_applications = relationship("LoanApplication", back_populates="bank", cascade="all, delete-orphan")
