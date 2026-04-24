"""Pydantic schemas for farmer endpoints."""

from pydantic import BaseModel, field_validator
from typing import Optional


class FarmerRegisterRequest(BaseModel):
    full_name: str
    aadhaar_number: str
    mobile_number: str
    state: str
    district: str
    primary_crop: str
    secondary_crop: Optional[str] = None
    land_area_acres: float
    preferred_language: str = "hi"

    @field_validator("aadhaar_number")
    @classmethod
    def validate_aadhaar(cls, v):
        v = v.replace(" ", "").replace("-", "")
        if len(v) != 12 or not v.isdigit():
            raise ValueError("Aadhaar number must be exactly 12 digits")
        return v

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile(cls, v):
        v = v.replace(" ", "").replace("+91", "")
        if len(v) != 10 or not v.isdigit():
            raise ValueError("Mobile number must be 10 digits")
        return v

    @field_validator("land_area_acres")
    @classmethod
    def validate_land(cls, v):
        if v < 0.1 or v > 1000:
            raise ValueError("Land area must be between 0.1 and 1000 acres")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v.strip()


class FarmerRegisterResponse(BaseModel):
    farmer_id: str
    message: str
    score_status: str
    estimated_wait_seconds: int


class SubScoreOut(BaseModel):
    key: str
    label: str
    label_hi: str = ""
    value: int
    max: int = 200
    impact: str = ""
    note: str = ""
    note_hi: str = ""
    source: str = ""
    trend: str = "flat"


class LatestScoreOut(BaseModel):
    score: int
    score_category: str
    is_estimated: bool
    crop_season: str
    generated_at: str
    sub_scores: list[SubScoreOut]


class LoanOfferOut(BaseModel):
    amount_min_inr: int
    amount_max_inr: int
    rate_percent: float
    score_band: str


class SchemeStatusOut(BaseModel):
    pm_kisan: str
    pmfby: str


class DistressFlagOut(BaseModel):
    status: str
    message: str
    message_hi: str


class FarmerDashboardResponse(BaseModel):
    farmer_id: str
    full_name: str
    district: str
    state: str = ""
    primary_crop: str = ""
    secondary_crop: Optional[str] = None
    land_area_acres: float = 0
    aadhaar_masked: str
    latest_score: Optional[LatestScoreOut] = None
    loan_offer: Optional[LoanOfferOut] = None
    distress_flag: Optional[DistressFlagOut] = None
    scheme_status: Optional[SchemeStatusOut] = None
    score_status: str = "complete"


class ScoreHistoryItem(BaseModel):
    score: int
    score_category: str
    crop_season: str
    generated_at: str


class ScoreHistoryResponse(BaseModel):
    farmer_id: str
    history: list[ScoreHistoryItem]
    message: Optional[str] = None


class XAIFactorOut(BaseModel):
    label: str
    label_hi: str
    impact: str  # positive or negative
    contribution_points: int
    description_en: str
    description_hi: str


class XAIReportResponse(BaseModel):
    farmer_id: str
    score: int
    crop_season: str
    factors: list[XAIFactorOut]
    ai_summary_en: str
    ai_summary_hi: str
    data_sources: dict


class BenchmarkResponse(BaseModel):
    farmer_score: int
    district: str
    district_average: float
    state_average: float
    district_sample_size: int
    message: Optional[str] = None
