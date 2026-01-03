from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, projects, terminal, chat
from app.database import create_db_and_tables
from app.config import get_settings
from app.services.cleanup_service import get_reaper
import asyncio

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    # Start the Reaper as a background task
    reaper = get_reaper()
    reaper_task = asyncio.create_task(reaper.run_reconciliation_loop())
    yield
    # Cleanup background task if needed
    reaper_task.cancel()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, we can use * or ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(terminal.router)
app.include_router(chat.router)

@app.get("/")
async def root():
    return {"message": "Welcome to OpenV SaaS API"}
