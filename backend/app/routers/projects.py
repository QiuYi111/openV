from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models import Project, User
from app.routers.auth import get_current_user
from app.services.container_manager import ContainerManager
from app.config import get_settings
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
import os
from datetime import datetime, timezone

settings = get_settings()

router = APIRouter(prefix="/projects", tags=["projects"])
container_manager = ContainerManager()

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    status: str
    stage: str
    user_id: int
    container_id: Optional[str] = None
    test_results: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

@router.post("/", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    new_project = Project(
        name=project_data.name, 
        description=project_data.description, 
        user_id=current_user.id
    )
    session.add(new_project)
    session.commit()
    session.refresh(new_project)
    return new_project

@router.get("/", response_model=List[ProjectRead])
def list_projects(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(Project).where(Project.user_id == current_user.id)
    projects = session.exec(statement).all()
    return projects

@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

class ProjectStageUpdate(BaseModel):
    stage: str

@router.patch("/{project_id}/stage", response_model=ProjectRead)
def update_project_stage(
    project_id: int,
    stage_update: ProjectStageUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    
    valid_stages = ["IDLE", "LOCKED", "VERIFIED", "SYNTHESIZED"]
    if stage_update.stage.upper() not in valid_stages:
        raise HTTPException(status_code=400, detail="Invalid stage")
        
    project.stage = stage_update.stage.upper()
    project.updated_at = datetime.now(timezone.utc)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@router.post("/{project_id}/start", response_model=ProjectRead)
def start_project(
    project_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.container_id:
        # Container already exists, maybe try to restart or just return it
        return project

    try:
        # We use a standard image for RTL dev
        # Prepare extra environment variables (e.g., API Keys)
        extra_env = {}
        if settings.ANTHROPIC_API_KEY:
            extra_env["ANTHROPIC_API_KEY"] = settings.ANTHROPIC_API_KEY

        container_id = container_manager.start_container(
            project_name=project.name,
            user_id=current_user.id,
            project_id=project.id,
            image=settings.DEFAULT_IMAGE, 
            command="tail -f /dev/null",
            extra_env=extra_env
        )
        project.container_id = container_id
        project.status = "RUNNING"
        project.updated_at = datetime.now(timezone.utc)
        session.add(project)
        session.commit()
        session.refresh(project)
        return project
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}/stats")
def get_project_stats(
    project_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.container_id:
        raise HTTPException(status_code=400, detail="Container not running")
        
    try:
        project.updated_at = datetime.now(timezone.utc)
        session.add(project)
        session.commit()
        stats = container_manager.get_container_stats(project.container_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/{project_id}/stop", response_model=ProjectRead)
def stop_project(
    project_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.container_id:
        return project

    try:
        container_manager.stop_container(project.container_id)
        project.container_id = None
        project.status = "IDLE"
        session.add(project)
        session.commit()
        session.refresh(project)
        return project
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
