# OpenV Web Space: Frontend API Reference

This document details the internal state management, store structures, and backend API integration used by the OpenV Frontend.

## 📦 State Stores (Zustand)

### 1. `AuthStore` (`src/authStore.ts`)
Manages user authentication lifecycle and JWT persistence.

- **State**:
    - `token`: `string | null` (The JWT access token)
    - `user`: `User | null` (User profile info)
    - `isAuthenticated`: `boolean`
- **Actions**:
    - `setAuth(token, user)`: Updates session and persists to `localStorage`.
    - `logout()`: Clears session and local storage.

### 2. `ProjectStore` (`src/store.ts`)
Manages project directory, active project state, and container control.

- **State**:
    - `projects`: `Project[]` (List of user projects)
    - `currentProject`: `Project | null`
    - `stats`: `ResourceStats | null` (CPU/Memory metrics)
- **Lifecycle Actions**:
    - `fetchProjects()`: GET `/projects/`
    - `setCurrentProject(project)`: Switches active workspace context.
    - `startProject(id)`: POST `/projects/{id}/start`
    - `stopProject(id)`: POST `/projects/{id}/stop`

## 📡 Remote Sync (SaaS API)

The frontend communicates with the FastAPI backend at `http://localhost:8000`.

### REST Endpoints
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/auth/register` | POST | Register new user. |
| `/auth/login` | POST | Obtain JWT (OAuth2 Password Flow). |
| `/projects/` | GET/POST | List and create projects. |
| `/projects/{id}/start` | POST | Spawn Docker container for project. |
| `/projects/{id}/stop` | POST | Terminate project container. |
| `/projects/{id}/stats` | GET | Retrieve real-time Docker metrics. |

### WebSockets
- **Terminal Gateway**: `ws://localhost:8000/ws/terminal/{project_id}?token={jwt}`
    - Bi-directional TTY streaming (xterm.js compatible).
    - Requires authenticated token as query parameter.

## 🏗 Component Integration

- **`TerminalComponent`**: Links to the Terminal Gateway. Uses `xterm-addon-fit` for responsive resizing.
- **`AuthComponent`**: Handles the Login/Register UI toggle and interacts with `AuthStore`.
- **`MainLayout`**: Orchestrates sidebars and workspace. Implements polling for `/stats` when a project is `RUNNING`.
