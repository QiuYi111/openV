# OpenV: 云端 AI-Native RTL 开发平台

> **首个 "TDD 驱动" 的云端 EDA 平台**
> *在浏览器中编写 Verilog/SystemVerilog，由 AI 辅助验证，即时运行仿真并查看波形。*

---

## 🚀 什么是 OpenV?

**OpenV** 将传统笨重、碎片化的 EDA 工具链转化为现代化的 **SaaS 开发环境**。如果不使用云端版本，您也可以在本地通过 Docker 一键拉起属于自己的私有云开发平台。

它不仅是一个 IDE，更是一个强制执行 **测试驱动开发 (TDD)** 流程的智能管家。无论您是设计简单的计数器还是复杂的 RISC-V 核心，OpenV 都能确保您的代码从第一天起就是健壮、可验证的。

---

## 📚 文档导航 (Documentation)

为了方便快速上手，我们提供了详细的中文文档：

- **📖 [前端使用指南 (User Guide)](docs/user_guide_cn.md)**
    - 界面布局介绍 (资源管理器、编辑器、终端)
    - 标准开发工作流 (创建 -> 规划 -> 编码 -> 验证)
    - 如何使用波形查看器
- **🏗 [系统架构与逻辑 (Architecture)](docs/architecture_cn.md)**
    - 解密 OpenV 的底层"路基" (Logic)
    - 数据流如何在浏览器、后端与 Docker 容器间流转

---

## ✨ 核心特性

### 🌐 云原生 IDE (Web IDE)
- **零配置启动**: 只要有浏览器，就能开始 IC 设计。告别繁琐的环境变量配置。
- **现代化编辑器**: 基于 Monaco Editor，提供丝滑的代码补全和高亮。
- **集成终端**: 直接访问项目背后的 Linux 容器，支持 `make`、`git` 等所有标准命令。

### 🤖 AI 智能体集成 (AI Agent)
- **状态感知**: AI 知道您当前处于“设计阶段”还是“Debug阶段”，不会胡乱建议。
- **Slash Commands**:
    - `/plan`: 生成设计规格说明书
    - `/unit`: 自动编写 CocoTB 测试用例（TDD 核心）
    - `/fix-unit`: 仿真挂了？让 AI 根据波形和日志自动修代码

### 📈 可视化与看板
- **Web 波形查看器**: 仿真生成的 `.vcd` 文件直接在网页打开，无需下载 GTKWave。
- **流水线看板**: 实时展示项目健康度 (`TEST_LOCKED` → `VERIFIED` → `SYNTHESIZED`)。

---

## ⚡️ 快速开始 (Quick Start)

### 前置要求
- **Docker** & **Docker Compose**
- **Python 3.10+** (仅用于本地脚本)

### 1. 克隆仓库
```bash
git clone https://github.com/your-org/openv.git
cd openv
```

### 2. 配置环境
在根目录创建 `.env` 文件：
```bash
# 必填：用于 AI 功能
ANTHROPIC_API_KEY=sk-ant-... 
# 选填：安全密钥
SECRET_KEY=dev_secret_key
```

### 3. 一键启动
```bash
docker-compose up -d
```

- **访问前端**: 打开浏览器访问 `http://localhost:80`
- **查看 API**: 访问 `http://localhost:8000/docs`

---

## 🛠 技术栈

| 领域 | 技术选型 | 说明 |
|------|----------|------|
| **前端** | React, Vite, Zustand | 现代化的 SPA 架构 |
| **后端** | FastAPI, Docker SDK | 高性能异步 IO 与容器编排 |
| **EDA** | Verilator, Yosys, CocoTB | 业界最强开源工具链合集 |
| **AI** | Claude 3.5 Sonnet, MCP | 通过 Model Context Protocol 深度集成 |

---

## 📄 许可证

本项目采用 **MIT License** 开源。