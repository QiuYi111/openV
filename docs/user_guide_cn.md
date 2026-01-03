# OpenV 前端使用指南

OpenV 的 Web 界面旨在提供类似本地 IDE 的流畅体验，同时集成了云端 EDA 工具链的强大能力。本文档将指导您了解界面的各个部分以及标准开发流程。

## 1. 界面概览 (Layout)

OpenV 的界面布局遵循现代 IDE 标准，分为四个主要区域：

### A. 左侧导航栏 (Sidebar)
- **Explorer (资源管理器)**: 浏览项目文件结构，切换不同项目。
- **Settings (设置)**: 可以在此查看账户信息或退出登录。
- **Status (状态)**: 底部显示当然所选项目的资源占用情况（CPU/内存）。

### B. 编辑区 (Editor)
- 核心代码编辑区域，采用 **Monaco Editor**（VS Code 同款内核）。
- 支持 Verilog/SystemVerilog 语法高亮、自动缩进和简单的代码补全。
- 文件修改会自动保存（Auto-Save）。

### C. 终端与工作区 (Terminal & Workspace)
- **Terminal**: 一个连接到后端 Docker 容器的完整 Bash 终端。您可以在这里运行 `ls`, `make`, 或 OpenV 专属的 `/slash-commands`。
- **Waveform (波形查看)**: 当仿真完成后，您可以在此标签页直接打开 `.vcd` 文件查看波形。

### D. 顶部流水线看板 (Floating Pipeline)
- 实时显示当前项目的 TDD 状态：
    - `IDLE`: 空闲/规划中。
    - `TEST_LOCKED`: 测试用例已锁定，正在开发 RTL。
    - `VERIFIED`: 仿真通过，Lint 检查完成。
    - `SYNTHESIZED`: 综合完成，准备交付。

---

## 2. 标准工作流 (Workflow)

在 OpenV 中，我们遵循 **Spec -> Test -> Code -> Verify** 的闭环流程。

### 第一步：创建/选择项目
1. 登录后，在左侧点击 “+” 号或下拉菜单选择现有项目。
2. 系统会自动为您启动一个独立的开发环境容器。

### 第二步：规划与生成测试 (AI Agent)
在底部 **终端 (Terminal)** 中输入指令：
```bash
/plan "设计一个8位计数器，带复位和使能"
```
AI 会分析需求并生成 `plan.md`。确认无误后，生成测试用例：
```bash
/unit
```
此时项目状态变为 **LOCKED**。系统会生成 `tests/test_counter.py` 等 CocoTB 测试脚本。

### 第三步：编写 RTL 代码
在 **Editor** 中编写 Verilog 代码。您必须满足刚才生成的测试用例要求。
如果遇到困难，可以尝试请求 AI 修复：
```bash
/fix-unit
```

### 第四步：仿真与验证
手动运行仿真命令（或通过 AI）：
```bash
make test
```
如果测试通过，状态会自动更新为 **VERIFIED**。

### 第五步：查看波形
1. 仿真成功后，切换到 **Waveform** 标签页。
2. 点击刷新按钮，选择生成的 `.vcd` 文件。
3. 您可以缩放、拖拽波形，检查信号时序。

---

## 3. 常见问题 (FAQ)

**Q: 终端没有反应怎么办？**
A: 请尝试刷新页面。终端通过 WebSocket 连接，网络波动可能导致连接断开。

**Q: 如何导出我的代码？**
A: 目前代码存储在服务器的 Docker Volume 中。您可以使用终端里的 `git` 命令将代码推送到远程仓库。
