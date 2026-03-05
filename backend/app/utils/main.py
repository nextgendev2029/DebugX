from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.config import settings
from app.utils.database import engine, Base

# Import all models so SQLAlchemy creates their tables on startup
import app.models.models  # noqa: F401

# Import routers
from app.routes import users

# Create all DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Codexa API",
    version="1.0.0",
    description="Backend API for the Codexa coding practice platform",
)

# CORS — allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(users.router, prefix="/api/users", tags=["users"])


@app.get("/")
def root():
    return {"status": "ok", "app": "Codexa API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
