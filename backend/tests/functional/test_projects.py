import pytest

def test_create_project(client):
    # Register and login to get token
    client.post("/auth/register", json={"email": "proj@example.com", "password": "password", "username": "projuser"})
    login_res = client.post("/auth/login", data={"username": "proj@example.com", "password": "password"})
    token = login_res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/projects/",
        json={"name": "My Project", "description": "A test project"},
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "My Project"
    assert "id" in data

def test_list_projects(client):
    client.post("/auth/register", json={"email": "proj2@example.com", "password": "password", "username": "projuser2"})
    login_res = client.post("/auth/login", data={"username": "proj2@example.com", "password": "password"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    client.post("/projects/", json={"name": "Project 1"}, headers=headers)
    client.post("/projects/", json={"name": "Project 2"}, headers=headers)
    
    response = client.get("/projects/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_project_lifecycle(client):
    # Setup: Register, login, and create project
    client.post("/auth/register", json={"email": "life@example.com", "password": "password", "username": "lifeuser"})
    login_res = client.post("/auth/login", data={"username": "life@example.com", "password": "password"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    proj_res = client.post("/projects/", json={"name": "Lifecycle Proj"}, headers=headers)
    project_id = proj_res.json()["id"]
    
    # 1. Start Project
    start_res = client.post(f"/projects/{project_id}/start", headers=headers)
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "RUNNING"
    assert start_res.json()["container_id"] is not None
    
    # 2. Stop Project
    stop_res = client.post(f"/projects/{project_id}/stop", headers=headers)
    assert stop_res.status_code == 200
    assert stop_res.json()["status"] == "IDLE"
    assert stop_res.json()["container_id"] is None
