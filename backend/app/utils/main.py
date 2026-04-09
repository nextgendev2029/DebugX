from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.config import settings
from app.utils.logger import setup_logging, get_logger

# ─── Initialize logging FIRST ─────────────────────────────────────────────────
setup_logging(level=settings.LOG_LEVEL)
logger = get_logger(__name__)

logger.info("Starting DebugX API (env=%s, log_level=%s)", settings.APP_ENV, settings.LOG_LEVEL)

from app.utils.database import engine, Base

# Import all models so SQLAlchemy creates their tables on startup
import app.models.models  # noqa: F401

# Import routers
from app.routes import users, problems, submissions, visualize, bookmarks

# Create all DB tables
Base.metadata.create_all(bind=engine)
logger.info("Database tables created/verified")

app = FastAPI(
    title="DebugX API",
    version="1.0.0",
    description="Backend API for the DebugX coding practice platform",
)

# CORS — allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("CORS configured for origins: %s", settings.CORS_ORIGINS)

# Routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
logger.info("Registered router: /api/users")
app.include_router(problems.router, prefix="/api/problems", tags=["problems"])
logger.info("Registered router: /api/problems")
app.include_router(submissions.router, prefix="/api/submissions", tags=["submissions"])
logger.info("Registered router: /api/submissions")
app.include_router(visualize.router, prefix="/api/visualize", tags=["visualize"])
logger.info("Registered router: /api/visualize")
app.include_router(bookmarks.router, prefix="/api/bookmarks", tags=["bookmarks"])
logger.info("Registered router: /api/bookmarks")

logger.info("DebugX API ready — all routers registered")


@app.get("/")
def root():
    logger.debug("Root endpoint hit")
    return {"status": "ok", "app": "DebugX API"}


@app.get("/health")
def health_check():
    logger.debug("Health check endpoint hit")
    return {"status": "healthy"}
