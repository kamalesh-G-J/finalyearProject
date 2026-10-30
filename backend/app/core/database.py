"""Database configuration and session management."""
import logging
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

log = logging.getLogger(__name__)

Base = declarative_base()

def get_engine():
    # If database_url is provided, attempt to connect to it
    if settings.database_url and not settings.database_url.startswith("sqlite"):
        try:
            eng = create_engine(settings.database_url, pool_pre_ping=True)
            with eng.connect() as conn:
                pass
            log.info("Connected successfully to remote database: %s", settings.database_url.split('@')[-1])
            return eng
        except Exception as e:
            log.warning(
                "Failed to connect to remote database (%s). Falling back to local SQLite database (local_dev.db).",
                e,
            )

    # Local SQLite fallback
    sqlite_url = "sqlite:///./local_dev.db"
    return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator:
    """FastAPI dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
