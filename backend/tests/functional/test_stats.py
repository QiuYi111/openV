import pytest
from app.main import app

def test_get_project_stats_success(client):
    # Setup: Register, login, create, and start project
    client.post("/auth/register", json={"email": "stats@example.com", "password": "password", "username": "statsuser"})
    login_res = client.post("/auth/login", data={"username": "stats@example.com", "password": "password"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    proj_res = client.post("/projects/", json={"name": "Stats Proj"}, headers=headers)
    project_id = proj_res.json()["id"]
    client.post(f"/projects/{project_id}/start", headers=headers)
    
    # Get stats
    res = client.get(f"/projects/{project_id}/stats", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "cpu_stats" in data
    assert "memory_stats" in data

def test_get_project_stats_not_running(client):
    client.post("/auth/register", json={"email": "stats2@example.com", "password": "password", "username": "statsuser2"})
    login_res = client.post("/auth/login", data={"username": "stats2@example.com", "password": "password"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    proj_res = client.post("/projects/", json={"name": "Not Running"}, headers=headers)
    project_id = proj_res.json()["id"]
    
    # Get stats without starting
    res = client.get(f"/projects/{project_id}/stats", headers=headers)
    assert res.status_code == 400
    assert res.json()["detail"] == "Container not running"
