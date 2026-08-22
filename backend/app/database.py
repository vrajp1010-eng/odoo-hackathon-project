from sqlmodel import SQLModel, create_engine, Session

# SQLite database file — will be created in the backend/ folder when the app starts
DATABASE_URL = "sqlite:///./globetrotter.db"

# check_same_thread=False is required for SQLite when used with FastAPI's threaded requests
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def create_db_and_tables():
    """Create all tables based on SQLModel models. Called once on app startup."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency that yields a DB session per request."""
    with Session(engine) as session:
        yield session