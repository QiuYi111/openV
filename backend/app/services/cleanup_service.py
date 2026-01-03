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
        # 1. Get all projects with active containers from DB
        statement = select(Project).where(Project.container_id != None)
        projects = session.exec(statement).all()
        project_container_ids = {p.container_id for p in projects}
        project_map = {p.container_id: p for p in projects}

        # 2. Get all actual running openv containers from Docker
        try:
            actual_containers = self.container_manager.list_containers()
            actual_ids = {c.id for c in actual_containers}
        except Exception as e:
            print(f"[CleanupService] Failed to list docker containers: {e}")
            return

        # 3. Logic: Cleanup orphans (Docker has it, DB doesn't)
        for container in actual_containers:
            if container.id not in project_container_ids:
                print(f"[CleanupService] Removing orphan container: {container.name} ({container.id})")
                try:
                    self.container_manager.stop_container(container.id)
                except Exception as e:
                    print(f"[CleanupService] Error removing orphan {container.id}: {e}")

        # 4. Logic: Handle desync (DB has it, Docker doesn't)
        for proj_container_id in project_container_ids:
            if proj_container_id not in actual_ids:
                project = project_map[proj_container_id]
                print(f"[CleanupService] DB desync: Project {project.id} container {proj_container_id} not found in Docker. Resetting.")
                project.container_id = None
                project.status = "IDLE"
                session.add(project)

        # 5. Logic: Cleanup Idle containers (updated_at too old)
        now = datetime.now(timezone.utc)
        for project in projects:
            if project.container_id and project.container_id in actual_ids:
                # Ensure updated_at has timezone info if it comes from DB without it (though model factory uses UTC)
                last_active = project.updated_at
                if last_active.tzinfo is None:
                    last_active = last_active.replace(tzinfo=timezone.utc)
                
                if now - last_active > self.idle_timeout:
                    print(f"[CleanupService] Project {project.id} (Container {project.container_id}) is idle. Stopping.")
                    try:
                        self.container_manager.stop_container(project.container_id)
                        project.container_id = None
                        project.status = "IDLE"
                        session.add(project)
                    except Exception as e:
                        print(f"[CleanupService] Error stopping idle container {project.container_id}: {e}")

        session.commit()
        print("[CleanupService] Reconciliation cycle complete.")

# Singleton instance for the service
_reaper = None

def get_reaper(container_manager: ContainerManager = None):
    global _reaper
    if _reaper is None:
        if container_manager is None:
            container_manager = ContainerManager()
        _reaper = CleanupService(container_manager)
    return _reaper
