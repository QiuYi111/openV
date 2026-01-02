# OpenV Web Space: Basic Introduction

The OpenV Web Space is a minimalist, industrial-grade IDE designed for remote RTL development. It brings a "one-stop" experience to hardware engineers, integrating high-performance editing, real-time TDD verification, and AI-assisted debugging into a cohesive web interface.

## 🌟 Key Philosophy

OpenV Web Space is built on three pillars:
1. **Minimalism**: Removing visual clutter to focus on code and logic. Inspired by Apple and Google design systems.
2. **TDD-First**: Deep integration of the TDD Guardian, providing immediate visual feedback on test status through the Floating Pipeline.
3. **Frictionless Tooling**: Reducing the overhead of running EDA tools via quick-invocation features like the Command Palette and contextual menus.

## 🏗 Core Architecture

The frontend is built using a modern decoupled architecture:
- **Framework**: React + TypeScript (Vite)
- **Editor**: Monaco Editor (VS Code core)
- **State Management**: Zustand (Atomic & Reactive)
- **Communications**: WebSocket-ready for real-time backend synchronization.

## 📋 Major Components

- **Main Panel**: Houses the Editor and Bottom Workspace (Terminal/Waveforms).
- **Navigation Sidebar**: Global app navigation and settings.
- **Explorer Sidebar**: File tree with RTL-specific context actions.
- **AI Agent Sidebar**: Context-aware coding assistant with direct tool-triggering capabilities.
- **Floating Pipeline**: High-level status bar for the current project stage (Lock -> Verif -> Synth).

## 🚀 Getting Started

To run the Web Space UI prototype locally:

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://localhost:5173`.
