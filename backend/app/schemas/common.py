"""Common Pydantic response schemas."""

from pydantic import BaseModel
from typing import Any


class ErrorDetail(BaseModel):
    field: str | None = None
    message: str


class ErrorResponse(BaseModel):
    code: str
    message: str
    details: list[ErrorDetail] = []


class APIError(BaseModel):
    error: ErrorResponse


class MessageResponse(BaseModel):
    message: str
