from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..database import get_session
from ..models import User
from ..schemas import UserAuth, UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/signup", response_model=UserRead)
def signup(payload: UserAuth, session: Session = Depends(get_session)):
    """Find a user by email, or create one. No passwords — fake auth by design."""
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        return existing

    user = User(name=payload.name, email=payload.email)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=UserRead)
def login(payload: UserAuth, session: Session = Depends(get_session)):
    """Find a user by email. If they don't exist yet, create them (fake auth)."""
    user = session.exec(select(User).where(User.email == payload.email)).first()

    if not user:
        user = User(name=payload.name, email=payload.email)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    # Keep name in sync if it changed
    if payload.name and payload.name != user.name:
        user.name = payload.name
        session.add(user)
        session.commit()
        session.refresh(user)

    return user
