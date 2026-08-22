from datetime import datetime, timedelta
import hashlib
import hmac
import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import PasswordReset, User
from ..schemas import (
    PasswordResetConfirm,
    PasswordResetRequest,
    UserLogin,
    UserRead,
    UserSignup,
    UserUpdate,
)

router = APIRouter(prefix="/users", tags=["users"])


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
    return f"pbkdf2_sha256$120000${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algorithm, iterations, salt_hex, digest_hex = stored.split("$")
        candidate = hashlib.pbkdf2_hmac(
            algorithm.removeprefix("pbkdf2_"),
            password.encode(),
            bytes.fromhex(salt_hex),
            int(iterations),
        )
        return hmac.compare_digest(candidate.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


@router.post("/signup", response_model=UserRead)
def signup(payload: UserSignup, session: Session = Depends(get_session)):
    """Create an account with a salted PBKDF2 password hash."""
    if not payload.name or not payload.name.strip():
        raise HTTPException(status_code=422, detail="Name is required for signup")
    if len(payload.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")

    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user = User(name=payload.name.strip(), email=payload.email.lower().strip(), password_hash=hash_password(payload.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=UserRead)
def login(payload: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email.lower().strip())).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    # Existing demo users predate passwords; their first password login upgrades the row.
    if user.password_hash is None:
        user.password_hash = hash_password(payload.password)
        session.add(user)
        session.commit()
        session.refresh(user)
    elif not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user


@router.post("/forgot-password")
def forgot_password(payload: PasswordResetRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email.lower().strip())).first()
    if not user:
        return {"message": "If that email exists, a reset link has been created."}
    token = secrets.token_urlsafe(32)
    reset = PasswordReset(
        user_id=user.id,
        token_hash=hashlib.sha256(token.encode()).hexdigest(),
        expires_at=datetime.utcnow() + timedelta(minutes=30),
    )
    session.add(reset)
    session.commit()
    return {"message": "Reset link created for this local demo.", "reset_token": token}


@router.post("/reset-password")
def reset_password(payload: PasswordResetConfirm, session: Session = Depends(get_session)):
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    reset = session.exec(select(PasswordReset).where(PasswordReset.token_hash == token_hash, PasswordReset.used == False)).first()
    if not reset or reset.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This reset link is invalid or expired")
    if len(payload.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    user = session.get(User, reset.user_id)
    user.password_hash = hash_password(payload.password)
    reset.used = True
    session.add(user)
    session.add(reset)
    session.commit()
    return {"message": "Password updated successfully"}


@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, payload: UserUpdate, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = payload.dict(exclude_unset=True)
    if "name" in update_data and not update_data["name"].strip():
        raise HTTPException(status_code=422, detail="Name cannot be empty")
    if "email" in update_data:
        existing = session.exec(select(User).where(User.email == update_data["email"], User.id != user_id)).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email is already in use")
    for key, value in update_data.items():
        setattr(user, key, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
