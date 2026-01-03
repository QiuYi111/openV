from sqlmodel import SQLModel, create_engine, Session
from app.config import get_settings

settings = get_settings()
DATABASE_URL = settings.sync_database_url

# Only SQLite needs check_same_thread: False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
