"""
FastAPI application entry point.
KisanKhata — AI-Powered Farmer Credit Intelligence System
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import logging

from app.config import settings
from app.database import init_db, close_db
from app.middleware.rate_limiter import limiter

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("kisankhata")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🌾 KisanKhata backend starting...")
    await init_db()
    logger.info("✅ Database initialized")

    # Load ML models at startup
    try:
        from app.ml.model import load_models
        load_models()
        logger.info("✅ ML models loaded")
    except Exception as e:
        logger.warning(f"⚠️ ML models not loaded (run train_model first): {e}")

    yield

    await close_db()
    logger.info("🛑 KisanKhata backend stopped")


app = FastAPI(
    title="KisanKhata API",
    description="AI-Powered Farmer Credit Intelligence System — Backend API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# === Middleware ===

# CORS — allow all origins for development/demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# === Global Exception Handler ===
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all handler — never leak stack traces to clients."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "SERVER_ERROR",
                "message": "An internal server error occurred.",
            }
        },
    )


# === Register Routers ===
from app.routers import auth, farmers, scores, bank_dashboard, distress, analytics, internal  # noqa: E402

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(farmers.router, prefix="/api/v1/farmers", tags=["Farmers"])
app.include_router(scores.router, prefix="/api/v1/scores", tags=["Score Generation"])
app.include_router(bank_dashboard.router, prefix="/api/v1/bank", tags=["Bank Dashboard"])
app.include_router(distress.router, prefix="/api/v1/bank/distress", tags=["Distress Management"])
app.include_router(analytics.router, prefix="/api/v1/bank", tags=["Analytics"])
app.include_router(internal.router, prefix="/api/v1/internal", tags=["Internal"])


# === Health Check ===
@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "healthy", "service": "kisankhata-backend", "version": "1.0.0"}


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "🌾 KisanKhata API — AI-Powered Farmer Credit Intelligence",
        "docs": "/docs",
        "health": "/health",
    }
