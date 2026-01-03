# OpenV 系统架构与逻辑 (System Logic)

本文档详细解析 OpenV 系统的底层逻辑（"路基"），即数据如何在**用户界面**、**后端服务**与**EDA 工具链**之间流转。

## 1. 核心架构图 (Architecture Overview)

OpenV 采用 **SaaS + DevContainer** 架构。每个用户项目不仅仅是一个文件夹，而是一个**独立的运行时环境**。

```mermaid
graph TD
    User[用户 (Browser)] <-->|HTTP/WebSocket| Frontend[Web 前端 (React)]
    Frontend <-->|REST API| Backend[后端 API (FastAPI)]
    Frontend <-->|WebSocket| Terminal[终端服务]
    
    subgraph "Docker Host (宿主机)"
        Backend -->|Docker Socket| Daemon[Docker Daemon]
        Daemon -->|Spawn| ContainerA[项目容器 A]
        Daemon -->|Spawn| ContainerB[项目容器 B]
        
        ContainerA -->|Mount| VolumeA[(持久化存储 A)]
    end
    
    subgraph "Container (开发环境)"
        ContainerA --> Verilator[Verilator 仿真]
        ContainerA --> Yosys[Yosys 综合]
        ContainerA --> Python[CocoTB 测试]
    end
```

## 2. 数据流逻辑 (Data Flow Logic)

系统的数据流转主要分为三条链路：

### A. 指令执行链路 (Command Execution)
用户在前端终端输入命令（如 `make test`）时的逻辑流：
1. **Frontend**: xterm.js 捕获键盘输入，通过 WebSocket 发送给后端。
2. **Backend**: `TerminalManager` 接收数据，并将其通过 Docker API 写入目标容器的 `STDIN`。
3. **Container**: 容器内的 `bash` 进程执行命令，调用 EDA 工具（Verilator/Yosys）。
4. **Feedback**: `bash` 的输出 (`STDOUT/STDERR`) 通过相同的链路反向推送到前端显示。

### B. 文件编辑链路 (File Editing)
1. **Load**: 用户打开项目时，后端读取 Docker 挂载卷 (`/workspace`) 中的文件内容并返回给前端。
2. **Edit**: Monaco Editor 在本地内存中维护文件状态。
3. **Save**: 用户保存（或自动保存）时，前端调用 API 将内容覆写回 Docker 挂载卷。这意味着**代码实时持久化**在宿主机上，容器重启不会丢失数据。

### C. 状态同步链路 (State Sysnthesis)
OpenV 的核心特性是 **TDD 流水线状态** (`IDLE` -> `VERIFIED`...)。
1. **Monitor**: 后端有一个后台任务 (Reaper/Watcher)，或者通过 AI Agent 的回调，监控项目文件的哈希值和测试结果文件。
2. **Update**: 当检测到 `results.xml` 变动或 AI 完成任务时，数据库中的 `ProjectStage` 会更新。
3. **Sync**: 前端轮询或通过 SSE (Server-Sent Events) 获取最新状态，更新顶部的流水线看板。

## 3. 关键技术点

### 隔离性 (Isolation)
为了保证多租户安全：
- 任何两个项目之间**文件系统完全隔离**。
- 容器限制了 CPU 和 内存配额，防止单一用户耗尽服务器资源。

### AI 集成 (MCP)
AI Agent 不是直接运行在浏览器中，而是通过 MCP 协议与后端交互。
- 当您在终端输入 `/plan` 时，实际上是触发了后端调用 Claude/LLM API。
- AI 的回复被解析为具体的文件操作指令，直接作用于容器内的文件系统。
