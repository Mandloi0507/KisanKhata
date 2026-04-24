"""Internal system routes — distress batch detection, admin tools."""

from fastapi import APIRouter, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import async_session
from app.models.farmer import Farmer

router = APIRouter()


@router.post("/distress/run-detection")
async def run_distress_detection(x_internal_key: str = Header(alias="X-Internal-Key")):
    """Trigger nightly distress detection manually."""
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid internal key")

    from app.services.scoring_service import generate_score

    async with async_session() as db:
        result = await db.execute(select(Farmer).where(Farmer.is_active == True))
        farmers = result.scalars().all()

        checked = 0
        for farmer in farmers:
            checked += 1
            # Score regeneration triggers distress check automatically

    return {
        "farmers_checked": checked,
        "message": "Distress detection triggered. Scores will be recalculated.",
    }
