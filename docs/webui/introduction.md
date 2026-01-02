# OpenV Web Space: Basic Introduction

The OpenV Web Space is an industrial-grade IDE designed for SaaS-ready remote RTL development. It provides a secure, containerized environment for hardware engineers, integrating high-performance editing, real-time TDD verification, and persistent project management.

## 🌟 Key Philosophy

OpenV Web Space is built on three pillars:
1. **Minimalism**: Removing visual clutter to focus on code and logic. Inspired by Apple and Google design systems.
2. **Containerized Isolation**: Every project runs in a dedicated Docker container (Phase 1-3), ensuring environment reproducibility and security.
3. **Real-Time Synergy**: Deep integration between the Web UI and backend services through WebSockets (Terminal/Logs) and REST APIs (Projects/Stats).

## 🏗 Core Architecture

The system uses a decoupled SaaS-native architecture:
- **Frontend**: React + TypeScript (Vite), Zustand for global state, Xterm.js for real-time terminal.
- **Backend**: FastAPI (Python), SQLModel for database interaction, `docker-py` for container orchestration.
- **Isolation**: Each user project is mapped to an isolated Docker container with volume persistence at `/workspace`.

## 📋 Major Components

- **Main Panel**: Houses the Editor and integrated Workspace (Terminal/Waveforms).
- **Navigation Sidebar**: Supports Global Navigation, Resource Monitoring, and Quick Logout.
- **Explorer Sidebar**: Project-specific file tree and project switcher (Dropdown).
- **Floating Pipeline**: High-level status bar reflecting the current project stage (IDLE -> VERIFIED) synced with backend state.
- **Integrated Terminal**: Real-time shell access to the development container via WebSocket.

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://localhost:5173`. Default login requires user registration via the built-in Auth component.
