from sqlalchemy import text
from sqlmodel import SQLModel, create_engine, Session, select
from .models import User

# SQLite database file — will be created in the backend/ folder when the app starts
DATABASE_URL = "sqlite:///./globetrotter.db"

# check_same_thread=False is required for SQLite when used with FastAPI's threaded requests
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def create_db_and_tables():
    """Create all tables based on SQLModel models. Called once on app startup."""
    SQLModel.metadata.create_all(engine)
    with engine.begin() as connection:
        columns = {
            row[1] for row in connection.execute(text("PRAGMA table_info(user)"))
        }
        if "password_hash" not in columns:
            connection.execute(text("ALTER TABLE user ADD COLUMN password_hash TEXT"))
        if "is_admin" not in columns:
            connection.execute(text("ALTER TABLE user ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
        trip_columns = {
            row[1] for row in connection.execute(text("PRAGMA table_info(trip)"))
        }
        if "cover_photo" not in trip_columns:
            connection.execute(text("ALTER TABLE trip ADD COLUMN cover_photo TEXT"))
    with Session(engine) as session:
        first_user = session.exec(select(User).order_by(User.id)).first()
        if first_user and not session.exec(select(User).where(User.is_admin)).first():
            first_user.is_admin = True
            session.add(first_user)
            session.commit()


def get_session():
    """FastAPI dependency that yields a DB session per request."""
    with Session(engine) as session:
        yield session
