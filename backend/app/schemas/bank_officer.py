"""Pydantic schemas for bank officer authentication."""

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    officer: dict


class RefreshRequest(BaseModel):
    refresh_token: str


class RefreshResponse(BaseModel):
    access_token: str


class RegisterOfficerRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    bank_code: str
    branch: str = ""
