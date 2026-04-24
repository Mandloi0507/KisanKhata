"""Session model — tracks active JWT refresh tokens for bank officers."""

import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    officer_id: Mapped[str] = mapped_column(String(36), ForeignKey("bank_officers.id", ondelete="CASCADE"), nullable=False, index=True)
    refresh_token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    officer = relationship("BankOfficer", back_populates="sessions")
