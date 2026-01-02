import pytest

def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123", "username": "testuser"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_login_user(client):
    # Pre-register user if needed (for now assume register works or mock it)
    # This is a functional test, so we test the flow
    client.post(
        "/auth/register",
        json={"email": "test2@example.com", "password": "password123", "username": "testuser2"},
    )
    
    response = client.post(
        "/auth/login",
        data={"username": "test2@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
