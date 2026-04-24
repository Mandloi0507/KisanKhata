"""KisanScore model — one record per scoring event per farmer."""

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Index, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class KisanScore(Base):
    __tablename__ = "kisan_scores"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id: Mapped[str] = mapped_column(String(36), ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False, index=True)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    score_category: Mapped[str] = mapped_column(String(20), nullable=False)  # Poor, Fair, Good, Excellent
    is_estimated: Mapped[bool] = mapped_column(Boolean, default=False)
    crop_season: Mapped[str] = mapped_column(String(20), nullable=False)  # e.g., Kharif_2025

    # Sub-scores (0–200 each)
    ndvi_subscore: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weather_subscore: Mapped[int | None] = mapped_column(Integer, nullable=True)
    income_subscore: Mapped[int | None] = mapped_column(Integer, nullable=True)
    land_subscore: Mapped[int | None] = mapped_column(Integer, nullable=True)
    scheme_subscore: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Raw data
    ndvi_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    rainfall_mm: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_revenue_inr: Mapped[float | None] = mapped_column(Float, nullable=True)
    mandi_price_inr: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Explainability
    shap_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    xai_summary_hi: Mapped[str | None] = mapped_column(Text, nullable=True)
    xai_summary_en: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Metadata
    data_sources: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="scores")

    __table_args__ = (
        CheckConstraint("score >= 0 AND score <= 1000", name="ck_score_range"),
        Index("idx_kisan_scores_farmer_season", "farmer_id", "crop_season", unique=True),
        Index("idx_kisan_scores_generated_at", "generated_at"),
    )
