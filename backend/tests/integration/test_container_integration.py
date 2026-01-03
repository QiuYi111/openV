import pytest
import docker
import time
from app.services.container_manager import ContainerManager

@pytest.mark.integration
def test_real_container_lifecycle():
    manager = ContainerManager()
    if not manager.client:
        pytest.skip("Docker daemon not accessible")
    
    project_name = "test_integration"
    host_path = "/tmp/openv_test_integration"
    # Note: This requires 'alpine' or similar small image to be present or pullable
    image = "alpine:latest"
    
    # 1. Start with a command that keeps the container alive
    container_id = manager.start_container(
        project_name=project_name, 
        user_id=1,
        project_id=1,
        image=image, 
        command="tail -f /dev/null"
    )
    assert container_id is not None
    
    # Verify it exists
    container = manager.client.containers.get(container_id)
    assert container.status in ["running", "created"]
    
    # 2. Stop
    manager.stop_container(container_id)
    
    # Verify it's gone
    with pytest.raises(docker.errors.NotFound):
        manager.client.containers.get(container_id)
