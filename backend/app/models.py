from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    user_id: int = Field(foreign_key="user.id")
    container_id: Optional[str] = None
    status: str = Field(default="IDLE")
    stage: str = Field(default="IDLE")
    test_results: Optional[str] = None # Parsed JSON string of test results
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id", index=True)
    role: str # "user" or "assistant"
    content: str
    type: str = Field(default="text") # "text", "diff", "action"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
