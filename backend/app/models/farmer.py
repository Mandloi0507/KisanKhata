"""Farmer model — core identity record."""

import uuid
from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    aadhaar_encrypted: Mapped[str] = mapped_column(String, nullable=False)
    aadhaar_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mobile_number: Mapped[str] = mapped_column(String(15), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    district_lat: Mapped[float] = mapped_column(Float, nullable=False)
    district_lng: Mapped[float] = mapped_column(Float, nullable=False)
    primary_crop: Mapped[str] = mapped_column(String(100), nullable=False)
    secondary_crop: Mapped[str | None] = mapped_column(String(100), nullable=True)
    land_area_acres: Mapped[float] = mapped_column(Float, nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(10), default="hi")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    scores = relationship("KisanScore", back_populates="farmer", cascade="all, delete-orphan")
    loan_applications = relationship("LoanApplication", back_populates="farmer", cascade="all, delete-orphan")
    distress_flag = relationship("DistressFlag", back_populates="farmer", uselist=False, cascade="all, delete-orphan")
    scheme_enrollment = relationship("SchemeEnrollment", back_populates="farmer", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_farmers_state_district", "state", "district"),
    )
