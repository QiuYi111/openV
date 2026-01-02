# OpenV Backend: Architecture & Introduction

The OpenV Backend is a Python-based service layer designed to orchestrate isolated RTL development environments. It leverages FastAPI for performance and Docker for mission-critical isolation.

## 🏗 Technology Stack

- **Framework**: FastAPI (Async-native API)
- **Database**: SQLModel (SQLAlchemy 2.0 + Pydantic V2)
- **Environment Management**: `uv` (Next-gen Python package manager)
- **Containerization**: Docker (via `docker-py`)
- **Authentication**: JWT (OAuth2 Password Bearer flow)

## 📡 Essential Services

### 1. User & Session Management
Handles identity via JWT. Uses email-based login for compliance with OAuth2 standards.
- **Security**: Passwords hashed with `bcrypt` (using `passlib`).
- **Persistence**: SQLite (development/MVP) or PostgreSQL (production).

### 2. Container Lifecycle Manager
The core engine of OpenV. Orchestrates Docker containers for user projects.
- **Isolation**: Each project is an independent container.
- **Volumes**: Host-to-container mapping for `/workspace` persistence.
- **Cleanup**: Automatic lifecycle management (START/STOP).

### 3. Unified Terminal Gateway
A WebSocket-to-Docker bridge.
- **Mechanism**: Streams TTY raw data between the browser (xterm.js) and the Docker `exec` session.
- **Stability**: Uses `asyncio.to_thread` to bridge blocking Docker socket reads with async WebSockets.

## 📁 Directory Structure

```text
backend/
├── app/
│   ├── main.py          # FastAPI Entrypoint
│   ├── database.py      # SQLModel Config
│   ├── models.py        # Shared Data Models
│   ├── routers/         # API Layer (auth, projects, terminal)
│   └── services/        # Service Layer (container_manager)
├── tests/               # Multi-tier Tests (UT/FT/IT)
├── pyproject.toml       # uv configuration
└── openv.db             # Development database
```
