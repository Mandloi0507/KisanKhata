"""Scheme enrollment model — PM-KISAN and PMFBY status tracking."""

import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class SchemeEnrollment(Base):
    __tablename__ = "scheme_enrollments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id: Mapped[str] = mapped_column(String(36), ForeignKey("farmers.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    pm_kisan_enrolled: Mapped[str] = mapped_column(String(20), default="unknown")  # enrolled, not_enrolled, unknown
    pmfby_enrolled: Mapped[str] = mapped_column(String(20), default="unknown")
    pm_kisan_last_checked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    pmfby_last_checked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    data_source: Mapped[str] = mapped_column(String(50), default="mock")  # mock, api
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="scheme_enrollment")
