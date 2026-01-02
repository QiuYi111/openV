# OpenV Web Space: UI Implementation Plan

This document outlines the technical steps to build the approved minimalist, TDD-integrated RTL development interface.

## 🛠 Technology Stack

- **Framework**: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/) (TypeScript) for a robust and fast development experience.
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (the engine behind VS Code) for high-performance Verilog/Python editing.
- **Terminal**: [Xterm.js](https://xtermjs.org/) for the integrated remote shell.
- **Styling**: **Vanilla CSS / CSS Modules** (following project guidelines for maximum flexibility and clean aesthetics).
- **Icons**: [Lucide React](https://lucide.dev/) for minimalist, Apple-style iconography.
- **Communication**: WebSockets (Socket.io or native) for real-time pipeline status and AI stream.

## 🏗 Component Architecture

### 1. Global Layout (`/src/layouts`)
- `MainLayout`: A grid/flex-based container managing the three-column view (Sidebar | Editor | Chat).
- `StatusBar`: The floating bottom bar for the TDD Pipeline.

### 2. Core Modules (`/src/components`)
- `FileExplorer`: Minimalist project tree.
- `CodeWorkspace`: Monaco Editor instance with custom themes (Light/Minimal).
- `AgentChat`: A chat window supporting markdown, code diffs, and action buttons (e.g., "Apply Fix").
- `CommandPalette`: (New) A spotlight-style search bar for quick access to EDA tools (`/lint`, `/sim`, `/synth`).
- `TDDPipeline`: A specialized component for the "Lock -> TC1...TCn" visualization.

## 🚀 Implementation Phases

### Phase 1: Foundation & Layout
- Initialize Vite/React project in `frontend/`.
- Setup global CSS variables (colors, spacing, shadows).
- Create the responsive three-panel layout.

### Phase 2: Editor & File Sync
- Integrate Monaco Editor.
- Add Verilog/SystemVerilog syntax highlighting.
- Implement file reading/writing via the Backend API.

### Phase 3: AI & Pipeline Integration
- Build the Agent Chat UI.
- Implement WebSocket client to listen to backend state changes (`.openv/state.json`).
- Create the Floating TDD Pipeline component with reactive Red/Green states.

### Phase 4: Polish & Tool Accessibility
- **Command Palette (Ctrl/Cmd+K)**: Implement a global command palette for quick tool invocation.
- **Contextual EDA Actions**: Right-click menu or editor hover actions to run Lint on a specific file.
- **Waveform Viewer**: Integrate VCD waveform viewer.
- **Final Polish**: Finalize "One-Click" actions from the AI sidebar and floating pipeline.

---

> [!IMPORTANT]
> **Design Consistency**: Every component must adhere to the high-end, minimalist aesthetic defined in [ui.md](file:///Users/qiujingyi.7/OpenV/plans/ui.md). Focus on subtle transitions and clean typography.
