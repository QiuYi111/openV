# OpenV Backend: API Specification

This document provides a detailed specification for the OpenV SaaS APIs.

## 🔐 Authentication (`/auth`)

### Register
`POST /auth/register`
- **Body**: `{"username": "...", "email": "...", "password": "..."}`
- **Response**: `201 Created` with User object (minus password).

### Login
`POST /auth/login`
- **Body**: `Form-Data` (`username` (email), `password`)
- **Response**: `{"access_token": "...", "token_type": "bearer"}`

---

## 📁 Project Management (`/projects`)

### List/Create Projects
- `GET /projects/`: Returns all projects for the current user.
- `POST /projects/`: Create a new project workspace.

### Container Control
- `POST /projects/{id}/start`: Spawns/Restarts the Docker environment.
- `POST /projects/{id}/stop`: Terminates the Docker container.
- `GET /projects/{id}/stats`: Returns real-time CPU/Memory/Network metrics.

### Stage Management
`PATCH /projects/{id}/stage`
- **Body**: `{"stage": "IDLE" | "LOCKED" | "VERIFIED" | "SYNTHESIZED"}`
- **Usage**: Syncs the Floating Pipeline UI.

---

## 🐚 Remote Terminal (`/ws/terminal`)

### Connection
`WS /ws/terminal/{project_id}?token={jwt}`

- **Protocol**: Raw TTY byte stream.
- **Authentication**: JWT required in query parameter for WebSocket handshake.
- **Features**: Supports command execution, interrupt signals (Ctrl+C), and real-time streaming.

---

## 🧪 Service Internals

### `ContainerManager`
- Base Image: `alpine:latest` (Default for MVP).
- Volume Map: `/tmp/openv_projects/{user_id}/{project_id} -> /workspace`.
- Environment: Isolated networking, custom entrypoint.
