OpenV 升级方案：构建智能体驱动的工业级 EDA MCP Server

1. 现状评估与问题分析

当前 OpenV 采用基于 .agent/skills/*.md 的方案，存在以下致命缺陷：

管控力缺失：智能体通过 Shell 直接调用工具，经常为了规避错误而选择低效工具（如只用 Icarus）或篡改测试脚本。

版本滞后：依赖系统软件源导致 yosys 等核心工具版本过老，无法支持现代硬件设计特性。

平台耦合：深度绑定 Claude Code 目录结构，无法在 Antigravity、Cursor 等其他支持 MCP 的智能体环境中复用。

TDD 溃败：智能体倾向于修改测试逻辑以匹配错误代码，导致验证过程失去真实性。

2. 目标架构：OpenV MCP Server

我们将 OpenV 重构为运行在 Docker 容器内的 MCP Server，通过标准协议向智能体暴露“原子能力”。

2.1 核心转变

特性

现有方案 (Skills)

升级方案 (MCP Server)

交互逻辑

智能体阅读 Markdown 猜命令

智能体调用结构化工具 API

工具选择

由智能体自行决定 (不确定性高)

由 MCP 逻辑自动选优 (强制性)

权限控制

智能体拥有全量 Shell 权限

智能体仅拥有受控工具权限

TDD 流程

靠口头约定 (易被忽略)

靠执行逻辑锁定 (物理强制)

3. 关键技术改进

3.1 基础镜像现代化 (Dockerfile)

弃用系统源：删除 apt-get install yosys。

集成 OSS-CAD-Suite：直接从 YosysHQ 引入最新的预编译二进制包，确保 Yosys、Nextpnr、OpenSTA 均为最新版。

编译器增强：保持 Verilator 5.036+ 源码编译，以完美适配 CocoTB 2.0+。

3.2 工具流管控 (Smart Routing)

在 MCP 工具 run_simulation 内部实现逻辑：

自动扫描：在执行前扫描 src/ 目录。

复杂度判定：若代码行数 > 500 或使用了 SystemVerilog 高级特性，强制路由至 Verilator，禁用 Icarus。

错误重试：当仿真失败时，MCP Server 返回带有上下文指引的结构化错误，防止智能体胡乱修改代码。

3.3 TDD 守卫机制 (TDD Guardian)

为了防止智能体在 TDD 过程中“作弊”，MCP Server 将执行以下逻辑：

阶段锁定：一旦智能体调用 init_test 提交了测试脚本，服务器记录该文件的 Git Hash。

写保护校验：在后续执行 run_test 时，服务器首先进行 git diff。

熔断报错：如果检测到 test/ 目录被修改，且未通过特定的“测试重构指令”授权，直接拒绝运行仿真并返回：“检测到测试篡改，请先修复逻辑而非修改断言”。

4. MCP 工具定义 (API)

# 计划暴露的核心工具示例
tools = [
    {
        "name": "openv_lint",
        "description": "使用最新 Verible 进行全量代码检查和格式化"
    },
    {
        "name": "openv_sim",
        "parameters": {
            "module": "string",
            "tdd_mode": "boolean"
        },
        "description": "执行仿真。大规模设计自动强制使用 Verilator。"
    },
    {
        "name": "openv_synth",
        "description": "使用最新 Yosys 进行逻辑综合并输出时序报告"
    }
]


5. 跨 Agent 适配 (Antigravity & More)

通用配置：通过 docker run -i 模式启动 MCP Server，支持标准输入输出通信。

配置文件：提供标准 mcp_config.json，用户一键拷贝即可在 Claude Desktop 或 Antigravity 中完成集成。

6. 实施路线图

Stage 1 (工具链升级)：更新 Dockerfile，集成 OSS-CAD-Suite。

Stage 2 (MCP 开发)：使用 Python fastmcp 编写 Server 逻辑，封装现有指令。

Stage 3 (流程加固)：实现在 MCP 内部的 TDD 校验逻辑。

Stage 4 (文档重写)：删除 .agent/skills，改为 MCP Server 使用指南。

结论：不要再试图通过写长篇大论的指令来教 Agent 听话。通过 MCP Server 建立一个“有围墙的花园”，让工具选优和流程合规成为系统的底座。