from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlmodel import Session
from app.database import get_session
from app.models import Project, User
from app.routers.auth import get_current_user
from app.config import get_settings
from app.services.container_manager import ContainerManager
from jose import jwt, JWTError
import asyncio
import socket
from datetime import datetime, timezone

settings = get_settings()
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

router = APIRouter(prefix="/ws", tags=["terminal"])
container_manager = ContainerManager()

async def get_user_from_token(token: str, session: Session):
    credentials_exception = HTTPException(status_code=401, detail="Invalid token")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    from sqlmodel import select
    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise credentials_exception
    return user

@router.websocket("/terminal/{project_id}")
async def terminal_websocket(
    websocket: WebSocket, 
    project_id: int, 
    token: str = Query(...),
    session: Session = Depends(get_session)
):
    await websocket.accept()
    
    # 1. Auth check
    try:
        user = await get_user_from_token(token, session)
    except HTTPException:
        await websocket.close(code=1008)
        return

    # 2. Project check
    project = session.get(Project, project_id)
    if not project or project.user_id != user.id or not project.container_id:
        await websocket.close(code=1008)
        return

    # Initial heartbeat
    project.updated_at = datetime.now(timezone.utc)
    session.add(project)
    session.commit()

    try:
        docker_socket = container_manager.get_exec_socket(project.container_id)
        
        async def heartbeat_loop():
            """Periodically update project.updated_at while terminal is open"""
            try:
                while True:
                    await asyncio.sleep(60) # Every minute
                    from app.database import engine
                    with Session(engine) as heartbeat_session:
                        p = heartbeat_session.get(Project, project_id)
                        if p:
                            p.updated_at = datetime.now(timezone.utc)
                            heartbeat_session.add(p)
                            heartbeat_session.commit()
            except asyncio.CancelledError:
                pass

        async def read_from_socket():
            try:
                while True:
                    # Read from blocking generator in thread
                    chunk = await asyncio.to_thread(next, docker_socket, None)
                    if chunk is None:
                        break
                    await websocket.send_text(chunk.decode(errors='replace'))
            except Exception as e:
                print(f"Error reading from docker socket: {e}")

        async def write_to_socket():
            try:
                while True:
                    data = await websocket.receive_text()
                    if hasattr(docker_socket, '_sock'):
                        await asyncio.to_thread(docker_socket._sock.send, data.encode())
            except WebSocketDisconnect:
                pass
            except Exception as e:
                print(f"Error writing to docker socket: {e}")

        # Run tasks concurrently
        tasks = [
            asyncio.create_task(read_from_socket()),
            asyncio.create_task(write_to_socket()),
            asyncio.create_task(heartbeat_loop())
        ]
        
        done, pending = await asyncio.wait(
            tasks,
            return_when=asyncio.FIRST_COMPLETED
        )
        for task in pending:
            task.cancel()

    except Exception as e:
        print(f"Terminal error: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass
