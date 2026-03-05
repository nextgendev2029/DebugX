from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime

# Use google-auth (already installed via firebase-admin) to verify tokens
# This works WITHOUT a service account key — uses Google's public JWKS endpoint
import requests as http_requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.utils.database import get_db
from app.utils.config import settings
from app.models.models import User, UserRole

router = APIRouter()

# ─── Token Verification ───────────────────────────────────────────────────────

def verify_firebase_token(authorization: str = Header(...)) -> dict:
    """
    Verify Firebase ID token from Authorization: Bearer <token> header.
    Uses Google's public JWKS — no service account key needed.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header. Use: Bearer <token>")
    id_token_str = authorization.split("Bearer ")[1].strip()
    try:
        request = google_requests.Request()
        decoded = id_token.verify_firebase_token(
            id_token_str,
            request,
            audience=settings.FIREBASE_PROJECT_ID,
        )
        return decoded
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/sync", summary="Sync User")
def sync_user(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    """
    Called after Firebase login/signup.
    Upserts the user into SQLite and returns their DB profile.
    """
    uid = decoded_token.get("uid") or decoded_token.get("user_id")
    email = decoded_token.get("email", "")
    name = decoded_token.get("name", "") or (email.split("@")[0] if email else "User")
    picture = decoded_token.get("picture", "")

    user = db.query(User).filter(User.firebase_uid == uid).first()

    if user:
        user.last_login = datetime.utcnow()
        if picture and not user.avatar_url:
            user.avatar_url = picture
        if name and not user.display_name:
            user.display_name = name
    else:
        # Generate unique username from email
        base_username = email.split("@")[0].lower().replace(".", "_") if email else uid[:12]
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            firebase_uid=uid,
            email=email,
            username=username,
            display_name=name,
            avatar_url=picture,
            role=UserRole.STUDENT,
            last_login=datetime.utcnow(),
        )
        db.add(user)

    db.commit()
    db.refresh(user)
    return _user_response(user)


@router.get("/me/{firebase_uid}", summary="Get User By Firebase Uid")
def get_user_by_firebase_uid(
    firebase_uid: str,
    db: Session = Depends(get_db),
):
    """Get a user's profile using their Firebase UID."""
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_response(user)


@router.get("/{user_id}", summary="Get User By Id")
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
):
    """Get a user's profile using their DB integer ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_response(user)


# ─── Helper ───────────────────────────────────────────────────────────────────

def _user_response(user: User) -> dict:
    return {
        "id": user.id,
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "username": user.username,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "role": user.role,
        "total_score": user.total_score,
        "problems_solved": user.problems_solved,
        "current_streak": user.current_streak,
        "longest_streak": user.longest_streak,
        "created_at": user.created_at.isoformat(),
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }
