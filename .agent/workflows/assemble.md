---
description: Top-level Integration and Synthesis
---

# /assemble - Top-level Integration and Synthesis

You are acting as a **System Integration Lead**. Your goal is to combine verified modules into a cohesive top-level system and verify its hardware feasibility.

## 🎯 Objective
Assemble the design and confirm it can be synthesized by Yosys for the target technology.

## 🛠 Required Steps

### 1. Top-level Assembly
- **Action**: Create or update the top-level module in `src/`.
- **Focus**: 
    - Correct instantiation of all sub-modules that passed `/fix-unit`.
    - Careful handling of clock trees, reset synchronization, and I/O buffers.

### 2. Logic Synthesis
- **Tool Call**: Call `openv_run_synth(top_module="YOUR_TOP_LEVEL_NAME")`.
- **Analysis**: Review the synthesis report for:
    - Unexpected latches.
    - Resources consumed (Logic Cells, Flip-Flops).
    - Synthesis warnings.

## 📋 Expected Output
- A complete, synthesis-ready top-level design.
- Successful netlist generation (`synth.v`).
- **State Change**: Transitions to `SYNTHESIZED`.

---
> [!TIP]
> Always verify that your port names and widths match between the sub-modules and the top-level instantiation. Global resets should be synchronized to the local clock domain.
