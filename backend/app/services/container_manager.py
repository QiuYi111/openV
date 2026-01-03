import docker
import os
from pathlib import Path
from app.config import get_settings

class ContainerManager:
    def __init__(self):
        self.settings = get_settings()
        try:
            self.client = docker.from_env()
        except Exception as e:
            # Handle cases where Docker is not running or not accessible
            print(f"Warning: Could not connect to Docker daemon: {e}")
            self.client = None

    def _resolve_project_path(self, user_id: int, project_id: int) -> str:
        """
        Securely resolve and validate the project path.
        Ensures the path is within the configured DOCKER_BASE_PATH.
        """
        base_path = Path(self.settings.DOCKER_BASE_PATH).resolve()
        
        # Ensure IDs are integers to prevent path injection via string manipulation
        if not isinstance(user_id, int) or not isinstance(project_id, int):
            raise ValueError("Invalid user_id or project_id type")

        project_path = (base_path / str(user_id) / str(project_id)).resolve()
        
        # Security check: Prevent directory traversal
        if not project_path.is_relative_to(base_path):
            raise ValueError(f"Security violation: Path {project_path} is outside base path {base_path}")
            
        return str(project_path)

    def start_container(self, project_name: str, user_id: int, project_id: int, image: str = "openv-env:latest", command: str = None, extra_env: dict = None) -> str:
        if not self.client:
            raise Exception("Docker client not initialized")
        
        # Securely resolve host path
        host_path = self._resolve_project_path(user_id, project_id)
        
        # Ensure project directory exists on host
        if not os.path.exists(host_path):
            os.makedirs(host_path, exist_ok=True)

        # Slugify project name for Docker compatibility
        safe_project_name = project_name.replace(" ", "_").lower()
        
        container = self.client.containers.run(
            image,
            command=command,
            detach=True,
            name=f"openv_{safe_project_name}_{os.urandom(4).hex()}",
            environment={
                "PROJECT_NAME": project_name,
                **(extra_env or {})
            },
            volumes={
                host_path: {'bind': '/workspace', 'mode': 'rw'}
            },
            working_dir='/workspace',
            # Resource Limits
            mem_limit="512m",
            cpu_period=100000,
            cpu_quota=50000, # 0.5 CPU
            user="1000:1000" # Run as non-root for security
        )
        return container.id

    def get_exec_socket(self, container_id: str):
        if not self.client:
            raise Exception("Docker client not initialized")
        
        container = self.client.containers.get(container_id)
        # Create an exec instance
        exec_id = self.client.api.exec_create(
            container.id, 
            cmd="/bin/sh", 
            stdin=True, 
            stdout=True, 
            stderr=True, 
            tty=True
        )['Id']
        
        # Attach and get the socket
        socket = self.client.api.exec_start(exec_id, detach=False, tty=True, stream=True)
        return socket

    def exec_command(self, container_id: str, command: str) -> str:
        if not self.client:
            raise Exception("Docker client not initialized")
        
        container = self.client.containers.get(container_id)
        result = container.exec_run(command)
        return result.output.decode(errors='replace')

    def get_container_stats(self, container_id: str):
        if not self.client:
            raise Exception("Docker client not initialized")
        
        container = self.client.containers.get(container_id)
        # stream=False returns a single snapshot of stats
        return container.stats(stream=False)

    def list_containers(self, all=False):
        if not self.client:
            raise Exception("Docker client not initialized")
        
        # Filter by name prefix to only management openv containers
        filters = {"name": "openv_"}
        return self.client.containers.list(all=all, filters=filters)

    def stop_container(self, container_id: str):
        if not self.client:
            raise Exception("Docker client not initialized")
        
        try:
            container = self.client.containers.get(container_id)
            container.stop()
            container.remove()
        except docker.errors.NotFound:
            pass
        except Exception as e:
            raise Exception(f"Failed to stop/remove container: {e}")
