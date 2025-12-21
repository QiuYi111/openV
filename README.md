# OpenV: 智能体驱动的 Verilog 开发套件

> **一套完整的开源 Verilog/SystemVerilog 工具链，专为 AI 辅助的智能体工作流优化。**

OpenV 将业界标准的 EDA 工具打包到 Docker 环境中，与 AI 编程助手（如 **Claude Code**, **Antigravity**）无缝集成。让智能体帮你完成代码检查、仿真、综合和时序分析——全程使用自然语言交互，并受严格的 TDD 流水线保护。

---

## 🚀 核心特性

- **State-Aware MCP Server**: 基于状态机的 RTL 交付流水线，强制执行“设计 -> 测试 -> 修复 -> 验证 -> 综合”的研发流程。
- **TDD Guardian**: 物理锁机制。一旦测试用例初始化，智能体无法通过“修改测试用例”来掩盖 RTL 漏洞。
- **Smart Routing**: 自动根据设计规模（行数、SystemVerilog 特性）在 **Verilator** 与 **Icarus Verilog** 之间切换仿真引擎。
- **Modern Toolchain**: 集成最新版 OSS-CAD-Suite，提供工业级的 Yosys, OpenSTA 和 Verible 支持。

---

## 🤖 智能体集成 (MCP Server v2.0)

OpenV 作为一个标准的 **Model Context Protocol (MCP) Server** 运行，通过状态机确保开发质量。

### 1. 配置 MCP Client

将以下配置添加到你的 MCP 客户端配置文件中（推荐使用 Docker 运行以确保工具链完整性）：

```json
{
  "mcpServers": {
    "openv": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-v", "${PWD}:/workspace",
        "crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-mcp-server:latest"
      ]
    }
  }
}
```

### 2. 标准化工作流 (Slash Commands)

通过项目中的 `.agent/workflows/` 指令集进行开发，每步都会触发状态转换：

| 指令 | 角色 | 产出物 | 状态转换 |
| :--- | :--- | :--- | :--- |
| `/plan` | 架构师 | `plan.md` | `IDLE` |
| `/unit` | RTL 工程师 | `unit.md` | `TEST_LOCKED` (Hash 锁定) |
| `/fix-unit` | 验证专家 | `fix-unit.md` | `LINT_PASSED` -> `VERIFIED` |
| `/assemble` | 集成负责人 | `assemble.md` | `SYNTHESIZED` (逻辑综合) |
| `/audit` | PPA 专家 | `audit.md` | `SYNTHESIZED` (时序闭合) |

---

## 🛠️ 工具链规格

| 工具 | 版本 | 说明 |
|------|------|------|
| **Yosys** | 0.49+ | 工业级逻辑综合引擎 |
| **Verilator** | 5.036 | 高性能 C++ 仿真与语义检查 |
| **OpenSTA** | 2.7.0 | 静态时序分析 (STA) |
| **Icarus Verilog**| 12.0 | 标准 Verilog 仿真器 |
| **CocoTB** | 2.0+ | 基于 Python 的硬件验证框架 |
| **Verible** | 最新 | Google 出品的代码 Lint 与格式化工具 |

---

## 🛡️ TDD Guardian 原理

1. **锁定**: 执行 `openv_init_test` 时，系统会计算 `test/` 目录下所有脚本的 SHA-256 哈希值。
2. **校验**: 每次 `openv_run_sim` 之前，系统会重新检查哈希。
3. **熔断**: 若检测到智能体为了“通过测试”而私自修改了测试脚本，系统将抛出 `TamperingDetectedError` 并拒绝执行。

---

## 🔧 项目结构

```
your-project/
├── .agent/
│   └── workflows/      # ← 标准化指令集 (由 OpenV 提供)
├── .openv/
│   └── state.json      # ← 工程状态追踪 (持久化)
├── src/                # RTL 设计源文件 (*.v, *.sv)
├── test/               # CocoTB 验证环境 (*.py, Makefile)
└── mcp_config.json     # 快速配置参考
```

---

## 📄 许可证

本项目遵循 MIT 许可证。仅供 EDA 研究与 AI 辅助硬件平面设计学习使用。