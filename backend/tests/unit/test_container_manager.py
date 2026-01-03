import pytest
from unittest.mock import MagicMock, patch
from app.services.container_manager import ContainerManager

@pytest.fixture
def mock_docker_client():
    with patch("docker.from_env") as mock:
        yield mock

def test_start_container(mock_docker_client):
    manager = ContainerManager()
    mock_container = MagicMock()
    mock_container.id = "test_id"
    mock_docker_client.return_value.containers.run.return_value = mock_container
    
    container_id = manager.start_container(
        project_name="test_project",
        user_id=1,
        project_id=1,
        image="openv-env:latest",
        command="tail -f /dev/null"
    )
    
    assert container_id == "test_id"
    mock_docker_client.return_value.containers.run.assert_called_once()

def test_get_container_stats(mock_docker_client):
    manager = ContainerManager()
    mock_container = MagicMock()
    mock_container.stats.return_value = {"cpu_stats": {}, "memory_stats": {}}
    mock_docker_client.return_value.containers.get.return_value = mock_container
    
    stats = manager.get_container_stats("test_id")
    assert "cpu_stats" in stats
    assert "memory_stats" in stats
    mock_docker_client.return_value.containers.get.assert_called_with("test_id")

def test_exec_command_success(mock_docker_client):
    manager = ContainerManager()
    mock_container = MagicMock()
    mock_container.exec_run.return_value.output = b"hello output"
    mock_docker_client.return_value.containers.get.return_value = mock_container
    
    output = manager.exec_command("test_id", "echo hello")
    assert output == "hello output"
    mock_container.exec_run.assert_called_with("echo hello")

def test_stop_container(mock_docker_client):
    manager = ContainerManager()
    mock_container = MagicMock()
    mock_docker_client.return_value.containers.get.return_value = mock_container
    
    manager.stop_container("test_id")
    
    mock_container.stop.assert_called_once()
    mock_container.remove.assert_called_once()
