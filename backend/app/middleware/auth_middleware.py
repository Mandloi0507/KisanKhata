"""
Authentication middleware — JWT token extraction and validation.
Provides FastAPI dependencies for route-level auth.
"""

from datetime import datetime, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.utils.jwt_utils import decode_token
from app.models.bank_officer import BankOfficer

security = HTTPBearer()


async def get_current_officer(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> BankOfficer:
    """
    FastAPI dependency that extracts and validates the JWT Bearer token.
    Returns the authenticated BankOfficer or raises 401/403.
    """
    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Invalid or expired token."},
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Invalid token type."},
        )

    officer_id = payload.get("sub")
    if not officer_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Invalid token payload."},
        )

    result = await db.execute(select(BankOfficer).where(BankOfficer.id == officer_id))
    officer = result.scalar_one_or_none()

    if not officer or not officer.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Officer account not found or inactive."},
        )

    # Check lockout
    if officer.locked_until and officer.locked_until > datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "ACCOUNT_LOCKED", "message": "Account is temporarily locked."},
        )

    return officer
