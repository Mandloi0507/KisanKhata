"""JWT token creation and validation utilities."""

from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.config import settings

ALGORITHM = "HS256"


def create_access_token(data: dict) -> str:
    """Create an access token with 30-minute expiry."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a refresh token with 8-hour expiry."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.REFRESH_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    """Decode and validate a JWT token. Returns payload or None if invalid."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_refresh_expiry() -> datetime:
    """Get the expiry datetime for a new refresh token."""
    return datetime.now(timezone.utc) + timedelta(hours=settings.REFRESH_TOKEN_EXPIRE_HOURS)
