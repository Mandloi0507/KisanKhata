"""Pydantic schemas for loan and bank dashboard endpoints."""

from pydantic import BaseModel, field_validator
from typing import Optional


class DecisionRequest(BaseModel):
    decision: str  # "approved" or "rejected"
    approved_amount_inr: Optional[int] = None
    approved_rate_percent: Optional[float] = None
    comment: str

    @field_validator("decision")
    @classmethod
    def validate_decision(cls, v):
        if v not in ("approved", "rejected"):
            raise ValueError("Decision must be 'approved' or 'rejected'")
        return v

    @field_validator("comment")
    @classmethod
    def validate_comment(cls, v):
        if len(v.strip()) < 10:
            raise ValueError("Comment must be at least 10 characters")
        if len(v) > 500:
            raise ValueError("Comment must be at most 500 characters")
        return v.strip()


class DecisionResponse(BaseModel):
    application_id: str
    status: str
    decided_at: str
    message: str


class DistressAcknowledgeRequest(BaseModel):
    action_note: str
    new_status: str = "in_progress"


class DistressResolveRequest(BaseModel):
    resolution_note: str
    is_false_positive: bool = False


class PaginationOut(BaseModel):
    page: int
    limit: int
    total: int
    pages: int


class ApplicationListResponse(BaseModel):
    applications: list[dict]
    pagination: PaginationOut


class AnalyticsResponse(BaseModel):
    period: str
    total_applications: int
    pending: int
    approved: int
    rejected: int
    approval_rate_percent: float
    average_score_approved: float
    active_distress_count: int
    district_breakdown: list[dict]
    monthly_trend: list[dict] = []
    by_band: list[dict] = []
