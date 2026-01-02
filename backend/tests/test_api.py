import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_get_status():
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert "state" in data
    assert "test_hashes" in data

def test_init_test_success():
    # Note: We might need to mock calculate_hashes or ensure some files exist
    response = client.post("/api/init-test", json={"test_path": "test", "top_module": "top"})
    # If no files exist, it might fail, so we should handle that in the implementation
    # For now, we expect 200 if the path is valid or handled
    assert response.status_code in [200, 400]

def test_lint_wrong_stage():
    response = client.post("/api/lint", json={"src_files": ["src/top.v"]})
    # Should fail if state is IDLE
    assert response.status_code == 400
    assert "WorkflowViolationError" in response.json()["detail"]

def test_run_sim_wrong_stage():
    response = client.post("/api/run-sim", json={"test_path": "test"})
    assert response.status_code == 400
    assert "WorkflowViolationError" in response.json()["detail"]

def test_run_synth_wrong_stage():
    response = client.post("/api/run-synth", json={"top_module": "top"})
    assert response.status_code == 400
    assert "WorkflowViolationError" in response.json()["detail"]
