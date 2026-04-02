from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import UniqueConstraint
from app.utils.database import get_db
from app.models.models import Bookmark, Problem
from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class BookmarkResponse(BaseModel):
    id: int
    user_id: int
    problem_id: int
    created_at: datetime
    # Denormalised problem info for the bookmarks list page
    problem_title: str
    problem_slug: str
    problem_difficulty: str
    problem_topic: str
    problem_description: str

    class Config:
        from_attributes = True


class BookmarkToggleRequest(BaseModel):
    user_id: int
    problem_id: int


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/toggle")
def toggle_bookmark(body: BookmarkToggleRequest, db: Session = Depends(get_db)):
    """
    Add or remove a bookmark (toggle).
    Returns {"bookmarked": true/false, "bookmark_id": int|null}
    """
    existing = db.query(Bookmark).filter(
        Bookmark.user_id == body.user_id,
        Bookmark.problem_id == body.problem_id,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        logger.info(f"Bookmark removed: user {body.user_id}, problem {body.problem_id}")
        return {"bookmarked": False, "bookmark_id": None}
    else:
        bm = Bookmark(user_id=body.user_id, problem_id=body.problem_id)
        db.add(bm)
        db.commit()
        db.refresh(bm)
        logger.info(f"Bookmark added: user {body.user_id}, problem {body.problem_id}, bm_id {bm.id}")
        return {"bookmarked": True, "bookmark_id": bm.id}


@router.get("/user/{user_id}", response_model=List[BookmarkResponse])
def get_user_bookmarks(user_id: int, db: Session = Depends(get_db)):
    """Return all bookmarks for a user, newest first, with problem info."""
    logger.info(f"Fetching bookmarks for user {user_id}")
    bookmarks = (
        db.query(Bookmark)
        .filter(Bookmark.user_id == user_id)
        .order_by(Bookmark.created_at.desc())
        .all()
    )
    result = []
    for bm in bookmarks:
        p: Problem = bm.problem
        result.append(BookmarkResponse(
            id=bm.id,
            user_id=bm.user_id,
            problem_id=bm.problem_id,
            created_at=bm.created_at,
            problem_title=p.title,
            problem_slug=p.slug,
            problem_difficulty=p.difficulty,
            problem_topic=p.topic or "",
            problem_description=p.description[:120] + "..." if len(p.description) > 120 else p.description,
        ))
    return result


@router.get("/user/{user_id}/ids")
def get_user_bookmark_ids(user_id: int, db: Session = Depends(get_db)):
    """Return just the problem IDs that a user has bookmarked — fast check for UI."""
    logger.info(f"Fetching bookmark IDs for user {user_id}")
    rows = db.query(Bookmark.problem_id).filter(Bookmark.user_id == user_id).all()
    return {"bookmarked_problem_ids": [r[0] for r in rows]}


@router.delete("/{bookmark_id}")
def delete_bookmark(bookmark_id: int, db: Session = Depends(get_db)):
    bm = db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
    if not bm:
        logger.warning(f"Delete bookmark failed: bookmark_id {bookmark_id} not found")
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    user_id = bm.user_id
    problem_id = bm.problem_id
    db.delete(bm)
    db.commit()
    logger.info(f"Bookmark deleted directly: bm_id {bookmark_id}, user {user_id}, problem {problem_id}")
    return {"deleted": True}
