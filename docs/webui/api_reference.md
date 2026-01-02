# OpenV Web Space: Frontend API Reference

This document details the internal state management and component communication APIs used by the OpenV Frontend.

## 📦 State Store (Zustand)

The frontend uses `src/store.ts` to manage global project state.

### `ProjectState` Interface

```typescript
type ProjectStage = 'IDLE' | 'LOCKED' | 'LINT_PASSED' | 'VERIFIED' | 'SYNTHESIZED';

interface ProjectState {
  stage: ProjectStage;
  testCases: { id: number; status: 'idle' | 'pass' | 'fail' }[];
  lastLog: string;
}
```

### Actions

| Action | Description |
| :--- | :--- |
| `setStage(stage: ProjectStage)` | Updates the current lifecycle stage of the project. |
| `runTestCase(id: number, status: 'pass' \| 'fail')` | Updates the status of a specific test case in the TDD pipeline. |
| `addLog(log: string)` | Appends a new entry to the integrated terminal log. |

## 🧩 Component APIs

### `CodeEditor`
Responsible for the main workspace editing.
- **Props**:
  - `fileName`: string (active file name)
  - `code`: string (content)
  - `language`: 'verilog' | 'python' | 'markdown'
  - `onChange`: (value: string) => void

### `AgentChat`
Internal AI agent communication.
- **Internal State**: Reactive message list supporting `text`, `diff`, and `action` types.
- **Action Triggers**: Emits store updates (e.g., `setStage`) based on user interaction with AI-suggested buttons.

### `CommandPalette`
Global tool dispatcher.
- **Trigger**: `Cmd+K` or `Ctrl+K`
- **Commands Map**:
  - `/lint` -> Triggers `openv_lint` simulation.
  - `/sim` -> Triggers `openv_run_sim`.
  - `/synth` -> Triggers `openv_synth`.

## 📡 Remote Sync (SaaS API)

Currently, the frontend uses a mock implementation in the Store. Real implementation will target:
- **Base URL**: `APP_BACKEND_URL`
- **WebSocket Path**: `/ws/logs`
- **File Endpoints**: `/api/files/*`
