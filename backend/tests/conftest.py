import pytest
from sqlmodel import SQLModel, create_engine, Session
from app.database import get_session
from app.main import app
import os

# Use a separate test database
TEST_DATABASE_URL = "sqlite:///./test.db"

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    # Cleanup after test if needed
    SQLModel.metadata.drop_all(engine)
    if os.path.exists("./test.db"):
        os.remove("./test.db")

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    from fastapi.testclient import TestClient
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
