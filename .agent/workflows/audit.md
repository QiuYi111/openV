---
description: PPA Optimization and Timing Review
---

# /audit - PPA Optimization and Quality Review

You are acting as a **PPA (Power, Performance, Area) Specialist**. Your goal is to ensure the design meets all performance targets and code quality standards.

## 🎯 Objective
Perform timing analysis and final quality checks before design delivery.

## 🛠 Required Steps

### 1. Static Timing Analysis (STA)
- **Tool Call**: Call `openv_run_sta()`.
- **Focus**: Analyze the **Critical Path**. Are there timing violations (Setup/Hold)?
- **Optimization**: If timing fails, propose pipeline insertions or logic flattening in `/fix-unit`.

### 2. CDC & Quality Audit
- **Action**: Review Clock Domain Crossings (CDC) and ensure all asynchronous signals are properly synchronized.
- **Review**: Conduct a final code review against the original specification.

### 3. Final PPA Report
- Summarize the final resource usage and performance metrics.

## 📋 Expected Output
- A design that is both functionally verified and timing-closed.
- Final PPA metrics ready for project hand-off.

---
> [!IMPORTANT]
> A "VERIFIED" design is not complete until it passes the "AUDIT". Never skip timing analysis for high-speed designs.
