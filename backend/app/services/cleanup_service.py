import asyncio
from datetime import datetime, timezone, timedelta
from sqlmodel import Session, select
from app.database import get_session
from app.models import Project
from app.services.container_manager import ContainerManager
from app.config import get_settings

class CleanupService:
    def __init__(self, container_manager: ContainerManager):
        self.container_manager = container_manager
        self.settings = get_settings()
        self.idle_timeout = timedelta(minutes=60) # Default timeout: 60 minutes

    async def run_reconciliation_loop(self):
        """
        Periodically runs the reconciliation logic.
        """
        while True:
            try:
                print("[CleanupService] Starting reconciliation cycle...")
                # We need a fresh session for each loop iteration
                from app.database import engine
                with Session(engine) as session:
                    await self.reconcile(session)
            except Exception as e:
                print(f"[CleanupService] Error in reconciliation loop: {e}")
            
            # Wait for 5 minutes before next cycle
            await asyncio.sleep(300)

    async def reconcile(self, session: Session):
        """
        Main reconciliation logic that coordinates sub-tasks.
        """
        try:
            # 1. Fetch current states
            db_projects = session.exec(select(Project).where(Project.container_id != None)).all()
            actual_containers = self.container_manager.list_containers()
            
            # 2. Cleanup Orphans (Docker exists, DB doesn't)
            await self._cleanup_orphans(actual_containers, db_projects)
            
            # 3. Handle Desync (DB has it, Docker doesn't)
            await self._handle_db_desync(session, db_projects, actual_containers)
            
            # 4. Handle Idle Timeout
            await self._cleanup_idle_containers(session, db_projects, actual_containers)
            
            session.commit()
            print("[CleanupService] Reconciliation cycle complete.")
        except Exception as e:
            session.rollback()
            print(f"[CleanupService] Reconciliation failed: {e}")

    async def _cleanup_orphans(self, actual_containers, db_projects):
        db_container_ids = {p.container_id for p in db_projects}
        for container in actual_containers:
            if container.id not in db_container_ids:
                print(f"[CleanupService] Removing orphan container: {container.name} ({container.id})")
                try:
                    self.container_manager.stop_container(container.id)
                except Exception as e:
                    print(f"[CleanupService] Failed to remove orphan {container.id}: {e}")

    async def _handle_db_desync(self, session: Session, db_projects, actual_containers):
        actual_ids = {c.id for c in actual_containers}
        for project in db_projects:
            if project.container_id not in actual_ids:
                print(f"[CleanupService] DB desync: Project {project.id} container {project.container_id} missing. Resetting.")
                project.container_id = None
                project.status = "IDLE"
                session.add(project)

    async def _cleanup_idle_containers(self, session: Session, db_projects, actual_containers):
        actual_ids = {c.id for c in actual_containers}
        now = datetime.now(timezone.utc)
        for project in db_projects:
            if project.container_id in actual_ids:
                last_active = project.updated_at
                if last_active.tzinfo is None:
                    last_active = last_active.replace(tzinfo=timezone.utc)
                
                if now - last_active > self.idle_timeout:
                    print(f"[CleanupService] Project {project.id} is idle. Stopping.")
                    try:
                        self.container_manager.stop_container(project.container_id)
                        project.container_id = None
                        project.status = "IDLE"
                        session.add(project)
                    except Exception as e:
                        print(f"[CleanupService] Failed to stop idle container {project.container_id}: {e}")

# Singleton instance for the service
_reaper = None

def get_reaper(container_manager: ContainerManager = None):
    global _reaper
    if _reaper is None:
        if container_manager is None:
            container_manager = ContainerManager()
        _reaper = CleanupService(container_manager)
    return _reaper
