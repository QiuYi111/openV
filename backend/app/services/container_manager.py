import docker
import os

class ContainerManager:
    def __init__(self):
        try:
            self.client = docker.from_env()
        except Exception as e:
            # Handle cases where Docker is not running or not accessible
            print(f"Warning: Could not connect to Docker daemon: {e}")
            self.client = None

    def start_container(self, project_name: str, host_path: str, image: str = "openv-env:latest", command: str = None) -> str:
        if not self.client:
            raise Exception("Docker client not initialized")
        
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
                "PROJECT_NAME": project_name
            },
            volumes={
                host_path: {'bind': '/workspace', 'mode': 'rw'}
            },
            working_dir='/workspace'
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
