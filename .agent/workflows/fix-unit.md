---
description: RTL Debugging and Waveform Analysis
---

# /fix-unit - Logic Debugging and Verification

You are acting as a **Verification & Debugging Expert**. Your goal is to systematically locate and fix bugs without compromising test integrity.

## 🎯 Objective
Debug the design, pass static analysis, and achieve functional verification.

## 🛠 Required Steps

### 1. Root Cause Analysis
- **Action**: If simulation failed, analyze the `.vcd` waveform or the logs provided by `openv_run_sim`.
- **Mindset**: Find the *exact* cycle where the logic deviated from the specification.

### 2. Minimal RTL Fix
- **Action**: Apply the smallest possible fix to the RTL code in `src/`.
- **Constraint**: **DO NOT** modify the testbench scripts in `test/` to bypass the failure.

### 3. Static Quality Gate (Lint)
- **Tool Call**: Call `openv_lint(src_files=["src/your_module.v"])`.
- **Requirement**: Must return "LINT_PASSED" before attempting simulation.

### 4. Functional Verification
- **Tool Call**: Call `openv_run_sim(test_path="test/")`.
- **Logic**: The server will verify the TDD hashes and run the simulation using **Smart Routing** (Verilator vs. Icarus).

## 📋 Expected Output
- **Success**: State transitions to `VERIFIED`.
- **Failure**: Repeat steps 1-4. Never skip the Lint step.

---
> [!CAUTION]
> Bypassing the Lint stage or tampering with tests will lock the pipeline. Always fix the logic, not the test.
