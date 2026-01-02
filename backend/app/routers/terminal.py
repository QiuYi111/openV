from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlmodel import Session
from app.database import get_session
from app.models import Project, User
from app.routers.auth import get_current_user, ALGORITHM, SECRET_KEY
from app.services.container_manager import ContainerManager
from jose import jwt, JWTError
import asyncio
import socket

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
        await websocket.close(code=1008) # Policy Violation
        return

    # 2. Project check
    project = session.get(Project, project_id)
    if not project or project.user_id != user.id or not project.container_id:
        await websocket.close(code=1008)
        return

    try:
        # 3. Get Docker exec socket
        # docker-py's stream=True returns a blocking generator
        docker_socket = container_manager.get_exec_socket(project.container_id)
        
        async def read_from_socket():
            try:
                # Wrap the blocking generator in an async generator or run in thread
                def get_output():
                    for chunk in docker_socket:
                        yield chunk
                
                # We can't easily iterate a sync generator in a thread as an async generator
                # without more complexity. Let's use a simple thread loop that sends to WS.
                def thread_worker():
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    for chunk in docker_socket:
                        # This is tricky because we need to send to the WS from another thread
                        # Better to use a queue or just to_thread for each recv/send
                        pass
                
                # Simplest fix: read one chunk at a time in a thread
                while True:
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
                    # Write to the underlying socket in a thread to be safe
                    if hasattr(docker_socket, '_sock'):
                        await asyncio.to_thread(docker_socket._sock.send, data.encode())
            except WebSocketDisconnect:
                pass
            except Exception as e:
                print(f"Error writing to docker socket: {e}")

        # Run both tasks. When one ends (e.g. WS disconnect), cancel the other.
        done, pending = await asyncio.wait(
            [asyncio.create_task(read_from_socket()), asyncio.create_task(write_to_socket())],
            return_when=asyncio.FIRST_COMPLETED
        )
        for task in pending:
            task.cancel()

    except Exception as e:
        print(f"Terminal error: {e}")
    finally:
        await websocket.close()
