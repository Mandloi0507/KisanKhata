"""Authentication routes — login, refresh, logout, register for bank officers."""

import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import bcrypt as _bcrypt

from app.database import get_db
from app.models.bank_officer import BankOfficer
from app.models.bank import Bank
from app.models.session import Session
from app.schemas.bank_officer import LoginRequest, LoginResponse, RefreshRequest, RefreshResponse, RegisterOfficerRequest
from app.utils.jwt_utils import create_access_token, create_refresh_token, decode_token, get_refresh_expiry
from app.middleware.rate_limiter import limiter

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/15minutes")
async def login(request: Request, body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate bank officer and return JWT tokens."""
    result = await db.execute(
        select(BankOfficer).where(BankOfficer.email == body.email.lower())
    )
    officer = result.scalar_one_or_none()

    if not officer:
        raise HTTPException(status_code=401, detail={"code": "UNAUTHORIZED", "message": "Invalid credentials."})

    # Check lockout
    if officer.locked_until and officer.locked_until.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
        raise HTTPException(status_code=403, detail={"code": "ACCOUNT_LOCKED", "message": "Account is locked. Try again later."})

    # Verify password
    if not _bcrypt.checkpw(body.password.encode(), officer.password_hash.encode()):
        officer.failed_login_attempts += 1
        if officer.failed_login_attempts >= 3:
            from datetime import timedelta
            officer.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
        await db.commit()
        raise HTTPException(status_code=401, detail={"code": "UNAUTHORIZED", "message": "Invalid credentials."})

    # Reset failed attempts on success
    officer.failed_login_attempts = 0
    officer.locked_until = None
    officer.last_login_at = datetime.now(timezone.utc)

    # Get bank info
    bank_result = await db.execute(select(Bank).where(Bank.id == officer.bank_id))
    bank = bank_result.scalar_one_or_none()

    # Create tokens
    token_data = {
        "sub": officer.id,
        "email": officer.email,
        "bank_id": officer.bank_id,
        "role": officer.role,
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"sub": officer.id})

    # Store session
    session = Session(
        officer_id=officer.id,
        refresh_token_hash=hashlib.sha256(refresh_token.encode()).hexdigest(),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        expires_at=get_refresh_expiry(),
    )
    db.add(session)
    await db.commit()

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        officer={
            "id": officer.id,
            "email": officer.email,
            "full_name": officer.full_name,
            "bank_id": officer.bank_id,
            "bank_name": bank.bank_name if bank else "",
            "role": officer.role,
        },
    )


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Exchange refresh token for new access token."""
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail={"code": "UNAUTHORIZED", "message": "Invalid refresh token."})

    token_hash = hashlib.sha256(body.refresh_token.encode()).hexdigest()
    session_result = await db.execute(
        select(Session).where(Session.refresh_token_hash == token_hash)
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=401, detail={"code": "SESSION_EXPIRED", "message": "Session not found."})

    officer_result = await db.execute(
        select(BankOfficer).where(BankOfficer.id == payload["sub"])
    )
    officer = officer_result.scalar_one_or_none()
    if not officer:
        raise HTTPException(status_code=401, detail={"code": "UNAUTHORIZED", "message": "Officer not found."})

    token_data = {
        "sub": officer.id,
        "email": officer.email,
        "bank_id": officer.bank_id,
        "role": officer.role,
    }
    new_access_token = create_access_token(token_data)
    return RefreshResponse(access_token=new_access_token)


@router.post("/logout")
async def logout(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Invalidate current session."""
    token_hash = hashlib.sha256(body.refresh_token.encode()).hexdigest()
    session_result = await db.execute(
        select(Session).where(Session.refresh_token_hash == token_hash)
    )
    session = session_result.scalar_one_or_none()
    if session:
        await db.delete(session)
        await db.commit()
    return {"message": "Logged out successfully."}


@router.post("/register")
async def register_officer(body: RegisterOfficerRequest, db: AsyncSession = Depends(get_db)):
    """Register a new bank officer (for demo purposes)."""
    # Check if email exists
    existing = await db.execute(
        select(BankOfficer).where(BankOfficer.email == body.email.lower())
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail={"code": "EMAIL_EXISTS", "message": "Email already registered."})

    # Find bank
    bank_result = await db.execute(select(Bank).where(Bank.is_active == True).limit(1))
    bank = bank_result.scalar_one_or_none()
    if not bank:
        raise HTTPException(status_code=400, detail={"code": "NO_BANK", "message": "No active bank found."})

    officer = BankOfficer(
        bank_id=bank.id,
        email=body.email.lower(),
        password_hash=_bcrypt.hashpw(body.password.encode(), _bcrypt.gensalt(12)).decode(),
        full_name=body.full_name,
        role="officer",
    )
    db.add(officer)
    await db.commit()

    return {"message": "Account created successfully.", "officer_id": officer.id}
