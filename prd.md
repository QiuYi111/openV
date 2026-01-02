# PRD: OpenV SaaS RTL 远程开发系统 (OpenV SaaS)

## 1. 产品概述 (Product Overview)
OpenV SaaS 是基于 OpenV 核心工具链升级而来的云原生 RTL 开发平台。它旨在通过 Docker 容器化技术，为硬件工程师提供一个“开箱即用”的远程开发环境，集成 AI 辅助编程、实时 TDD 验证和高性能 EDA 工具链。

## 2. 目标 (Objectives)
- **SaaS 化转型**：从单机 MCP 工具升级为多租户在线平台。
- **远程开发体验**：用户无需本地安装 EDA 工具，通过浏览器即可完成全流程 RTL 开发。
- **AI 深度集成**：AI 助手不仅能写代码，还能直接操控仿真、综合等底层工具。
- **环境隔离与安全**：每个用户的开发项目在独立的 Docker 容器中运行。

## 3. 核心功能需求 (Feature Requirements)

### 3.1 用户与项目管理 (Identity & Project Management)
- **多租户系统**：支持用户注册、登录。
- **项目空间**：用户可以创建、删除多个独立的 RTL 项目。
- **权限控制**：确保项目代码和仿真环境的私密性。

### 3.2 远程集成开发环境 (Web IDE)
- **Monaco Editor**：支持 Verilog/SystemVerilog 语法高亮、自动补全。
- **集成终端**：直接连接到后端开发容器的 Bash 终端。
- **波形查看器 (Waveform Viewer)**：支持在线查看 VCD 流，集成高效的波形渲染组件。
- **状态看板 (Floating Pipeline)**：可视化展示 TDD 链路状态（IDLE -> LOCKED -> VERIFIED -> SYNTHESIZED）。

### 3.3 远程工具链与执行 (Toolchain & Execution)
- **容器化执行**：所有 EDA 工具（Yosys, Verilator, Icarus Verilog）在独立的 Docker 容器中执行。
- **资源限制**：通过 Docker 原生机制限制 CPU 和内存使用。

### 3.4 AI 智能体 (AI Native)
- **Claude Code 集成**：容器内预装 `claude-code` 环境。用户需在首次使用时配置自己的 API Key。
- **Context-Aware Assistance**：AI 助手感知整个工程结构，支持一键修复 Lint 错误或仿真失败。
- **Auto-pilot**：通过 slash commands (/plan, /unit, /fix-unit) 驱动自动化流水线。

## 4. 技术架构 (Technical Architecture)

### 4.1 架构方案
- **Orchestration**: 仅使用 Docker Compose 进行容器编排，不使用 Kubernetes，确保系统轻量且易于集成。
- **Frontend**: React + Vite + TailwindCSS + Zustand + Monaco Editor (已完成 WebUI 集成)。
- **Backend**: FastAPI 服务，负责用户鉴权、项目元数据管理及 Docker 容器生命周期管理。
- **Storage**: 基于宿主机的持久化卷挂载，管理用户代码数据。

### 4.2 开发与维护规范
- **开发规范 (Self-Correction)**：在开发 OpenV 系统本身时，必须严格执行 **TDD 驱动开发** 流程并使用 **`uv`** 管理 Python 环境。
- **详尽文档**：交付物必须包含《开发手册》、《部署与维护指南》、《API 接口规范》。
- **隔离性**：利用 Docker 容器实现用户间的开发环境隔离。

## 5. 路线图 (Roadmap)
1. **Phase 1 (MVP)**: 完成 FastAPI 后端基础架构，支持 Docker 动态拉起开发容器，实现基本的远程连接。
2. **Phase 2 (Functionality)**: 集成已完成的 WebUI，完善 TDD Pipeline 可视化，集成波形查看器，优化 AI 助手的远程调用性能。
3. **Phase 3 (Optimization & Docs)**: 支持团队协作功能，增加更丰富的 EDA 工具支持，上线资源监控。**交付详尽的开发与维护文档**。

## 6. 成功指标 (Success Metrics)
- 环境初始化时长 < 10 秒。
- 前端到仿真引擎的指令响应延迟 < 200ms。
- AI 自动修复 RTL 故障的成功率 > 70%。
