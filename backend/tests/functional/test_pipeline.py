import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_project_pipeline_status(client):
    # Setup: Register, login, and create project
    client.post("/auth/register", json={"email": "pipe@example.com", "password": "password", "username": "pipeuser"})
    login_res = client.post("/auth/login", data={"username": "pipe@example.com", "password": "password"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    proj_res = client.post("/projects/", json={"name": "Pipeline Proj"}, headers=headers)
    project_id = proj_res.json()["id"]
    
    # 1. Check initial stage
    res = client.get(f"/projects/{project_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["stage"] == "IDLE"
    
    # 2. Update stage
    update_res = client.patch(f"/projects/{project_id}/stage", json={"stage": "VERIFIED"}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["stage"] == "VERIFIED"
    
    # 3. Verify update
    res = client.get(f"/projects/{project_id}", headers=headers)
    assert res.json()["stage"] == "VERIFIED"

def test_invalid_stage_update(client):
    client.post("/auth/register", json={"email": "bad@example.com", "password": "password", "username": "baduser"})
    login_res = client.post("/auth/login", data={"username": "bad@example.com", "password": "password"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    proj_res = client.post("/projects/", json={"name": "Bad Proj"}, headers=headers)
    project_id = proj_res.json()["id"]
    
    # Update with invalid stage
    update_res = client.patch(f"/projects/{project_id}/stage", json={"stage": "SUPER_VERIFIED"}, headers=headers)
    assert update_res.status_code == 400
