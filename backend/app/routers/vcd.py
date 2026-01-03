from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlmodel import Session
from app.database import get_session
from app.models import Project, User
from app.routers.auth import get_current_user
from app.config import get_settings
import os
from pathlib import Path

router = APIRouter(prefix="/vcd", tags=["waveform"])
settings = get_settings()

def get_vcd_path(project_id: int, user_id: int, filename: str) -> Path:
    base_path = Path(settings.DOCKER_BASE_PATH).resolve()
    # Waveforms are usually in the project workspace
    vcd_path = (base_path / str(user_id) / str(project_id) / filename).resolve()
    
    if not vcd_path.is_relative_to(base_path):
         raise HTTPException(status_code=403, detail="Access denied")
    
    if not vcd_path.exists() or not vcd_path.is_file():
        raise HTTPException(status_code=404, detail="Waveform file not found")
        
    return vcd_path

@router.get("/{project_id}/list")
async def list_vcd_files(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    base_path = Path(settings.DOCKER_BASE_PATH).resolve()
    project_path = (base_path / str(current_user.id) / str(project_id)).resolve()
    
    if not project_path.exists():
        return []
        
    vcd_files = []
    for f in project_path.glob("**/*.vcd"):
        vcd_files.append({
            "name": f.name,
            "path": str(f.relative_to(project_path)),
            "size": f.stat().st_size
        })
    return vcd_files

@router.get("/{project_id}/metadata")
async def get_vcd_metadata(
    project_id: int,
    filename: str = Query(..., description="Relative path to VCD file"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    vcd_path = get_vcd_path(project_id, current_user.id, filename)
    
    # Simple metadata: timescale, signals found in first few KB
    signals = []
    timescale = "unknown"
    try:
        with open(vcd_path, "r", errors='replace') as f:
            for _ in range(500): # Scan first 500 lines
                line = f.readline()
                if not line: break
                if "$timescale" in line:
                    timescale = f.readline().strip()
                if "$var" in line:
                    parts = line.split()
                    if len(parts) >= 5:
                        signals.append({"name": parts[4], "type": parts[1]})
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Failed to parse metadata: {e}")

    return {
        "filename": filename,
        "size": vcd_path.stat().st_size,
        "timescale": timescale,
        "signals": signals
    }

@router.get("/{project_id}/stream")
async def stream_vcd(
    project_id: int,
    filename: str = Query(..., description="Relative path to VCD file"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    vcd_path = get_vcd_path(project_id, current_user.id, filename)
    
    def iterfile():
        with open(vcd_path, mode="rb") as file_like:
            yield from file_like

    return StreamingResponse(iterfile(), media_type="application/octet-stream")
