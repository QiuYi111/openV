from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models import Project, User, ChatMessage
from app.routers.auth import get_current_user
from app.services.container_manager import ContainerManager
from app.services.ai_agent import AIAgentService
from datetime import datetime, timezone
from typing import List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

router = APIRouter(prefix="/projects", tags=["chat"])
container_manager = ContainerManager()
ai_agent = AIAgentService(container_manager)

class ChatMessageCreate(BaseModel):
    role: str
    content: str
    type: str = "text"

class ChatMessageRead(BaseModel):
    id: int
    project_id: int
    role: str
    content: str
    type: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

@router.post("/{project_id}/messages", response_model=ChatMessageRead)
def create_message(
    project_id: int,
    message: ChatMessageCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    new_message = ChatMessage(
        project_id=project_id,
        role=message.role,
        content=message.content,
        type=message.type
    )
    project.updated_at = datetime.now(timezone.utc)
    session.add(project)
    session.add(new_message)
    session.commit()
    session.refresh(new_message)

    # Autopilot / Slash Command Logic
    if message.role == "user" and message.content.startswith("/"):
        if project.container_id:
            result = ai_agent.process_slash_command(project.container_id, message.content, session, project.id)
            
            # Save AI response
            ai_message = ChatMessage(
                project_id=project_id,
                role="assistant",
                content=result.get("output") or result.get("detail") or "Command executed.",
                type="text" if result["status"] == "success" else "error"
            )
            session.add(ai_message)
            session.commit()
        else:
            # Container not running
            error_message = ChatMessage(
                project_id=project_id,
                role="assistant",
                content="Error: Compute node (container) is not running. Please start the project first.",
                type="error"
            )
            session.add(error_message)
            session.commit()

    return new_message

@router.get("/{project_id}/messages", response_model=List[ChatMessageRead])
def get_messages(
    project_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    statement = select(ChatMessage).where(ChatMessage.project_id == project_id).order_by(ChatMessage.created_at)
    messages = session.exec(statement).all()
    return messages
