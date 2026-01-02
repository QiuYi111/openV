# OpenV Web Space: Minimalist RTL & TDD Design Specification

This document serves as the official UI/UX specification for the OpenV SaaS platform.

## 1. Visual Identity
- **Style**: Minimalist, high-end (Apple/Google inspired).
- **Theme**: Light Mode (primary), focused on clarity and whitespace.
- **Typography**: Inter / San Francisco.
- **Color Palette**: Neutral grays for the layout, semantic Red/Green for TDD status, and soft accent shadows.

## 2. Core Layout Architecture

![OpenV Unified TDD IDE Mockup](/Users/qiujingyi.7/OpenV/assets/ui_mockup.png)

| Component | Responsibility |
| :--- | :--- |
| **Clean Toolbar** | Global navigation, project selection, and user settings. |
| **Side Nav** | Minimalist icons for File Explorer, Version Control, and Extensions. |
| **Monaco Editor** | The primary workspace with Verilog/SystemVerilog/Python support. |
| **AI Assistant** | A persistent right-side panel for context-aware code generation and TDD fixes. |
| **TDD Pipeline** | A floating bottom bar displaying "TDD Lock" status and individual Test Case (TC) result bubbles. |

## 3. Deep TDD Interaction Model
The platform enforces a strict **Red-Green-Refactor** hardware development cycle:

1. **Lock Stage (Red)**: Before implementation, the user/AI defines tests in Cocotb. `openv_init_test` locks these tests via SHA-256 hashes. The Pipeline bar turns Red.
2. **Implementation Stage (Progressing)**: As RTL is written, the floating UI bubbles (TC1, TC2...) turn Green in real-time as simulations pass.
3. **Refactor Stage (Green)**: Once all bubbles are green, the state moves to `VERIFIED`. The AI Agent then suggests area/timing optimizations.
4. **Tampering Protection**: Any unauthorized change to the test scripts triggers a UI alert and blocks the pipeline, ensuring verifiability.

## 4. Feature Roadmap
- [ ] Integrated Web VCD Viewer (Waveforms).
- [ ] Cocotb Coroutine execution timeline visualization.
- [ ] Real-time synthesis (Yosys) logic diagram generator.
