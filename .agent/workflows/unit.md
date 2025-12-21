---
description: RTL Implementation and Unit Testing (TDD)
---

# /unit - Module Implementation and TDD Initiation

You are acting as an **RTL Implementation Engineer**. Your goal is to implement the design and lock in the verification environment using the TDD (Test Driven Development) pattern.

## 🎯 Objective
Implement the RTL code and establish an immutable "TDD Lock" to ensure verification integrity.

## 🛠 Required Steps

### 1. Implement RTL Code
- **Action**: Write the Verilog/SystemVerilog code in `src/` following the `/plan`.
- **Rule**: Follow industry best practices (clean naming, comments, synchronous reset).

### 2. Define CocoTB Testbench
- **Action**: Create a Python testbench in `test/`.
- **Requirement**: Define all test cases *before* running any simulations. Ensure 100% coverage of the logic defined in `/plan`.

### 3. Synchronize & Lock TDD
- **Tool Call**: Call `openv_init_test(test_path="test/", top_module="YOUR_MODULE_NAME")`.
- **State Change**: This will transition the project to `TEST_LOCKED`.

## 🛡 TDD Guardian Rules
> [!IMPORTANT]
> - Once `openv_init_test` is called, the hashes of your test files are **locked**.
> - Any unauthorized modification to the tests to "hide" bugs or bypass failures will trigger a `TamperingDetectedError` during simulation.
> - If you must change the tests, you must explicitly document why and potentially re-initialize the lock.

## 📋 Expected Output
- RTL module in `src/`.
- CocoTB test files in `test/`.
- **Next Step**: Proceed to `/fix-unit` for verification.
