"""Score generation routes — generate and poll status."""

from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.scoring_service import generate_score, get_score_status
from app.ml.score_bands import get_score_category

router = APIRouter()


@router.post("/generate", status_code=202)
async def trigger_score_generation(
    farmer_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger score regeneration for a farmer."""
    from app.database import async_session

    async def _run():
        async with async_session() as session:
            await generate_score(farmer_id, session)

    background_tasks.add_task(_run)

    return {
        "message": "Score generation queued.",
        "farmer_id": farmer_id,
        "estimated_wait_seconds": 30,
    }


@router.get("/{farmer_id}/status")
async def poll_score_status(farmer_id: str, db: AsyncSession = Depends(get_db)):
    """Poll score generation status."""
    status = get_score_status(farmer_id)

    if status == "complete":
        from sqlalchemy import select
        from app.models.farmer import Farmer
        from app.models.kisan_score import KisanScore

        result = await db.execute(select(Farmer).where(Farmer.farmer_id == farmer_id))
        farmer = result.scalar_one_or_none()
        if farmer:
            score_result = await db.execute(
                select(KisanScore).where(KisanScore.farmer_id == farmer.id)
                .order_by(KisanScore.generated_at.desc()).limit(1)
            )
            score = score_result.scalar_one_or_none()
            if score:
                return {
                    "status": "complete",
                    "score": score.score,
                    "score_category": score.score_category,
                }

    return {"status": status if status != "unknown" else "processing"}
