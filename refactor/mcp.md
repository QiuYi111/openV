OpenV MCP Server 技术定义书 (v2.0)

本文件定义了 OpenV 作为 MCP (Model Context Protocol) 服务端的交互接口与逻辑准则。其核心目标是通过强制流水线状态机与TDD 物理锁，杜绝智能体在 RTL 开发过程中的非规范行为。

1. 核心设计原则

状态依赖：除了 init 和 status 工具外，其余工具的执行必须依赖前置步骤的成功状态。

物理隔离：Agent 无法通过 MCP 注入任意 Shell 命令，所有操作必须通过预定义的 Tool API。

TDD 强制：在测试用例锁定后，任何对测试脚本的修改都会触发仿真熔断。

工具选优：Agent 仅发起“仿真”请求，MCP Server 根据代码复杂度自动选择 Verilator 或 Icarus。

2. 流水线状态定义 (State Machine)

状态值

名称

说明

允许的操作

0

IDLE

初始状态或项目初始化。

openv_init_test

1

TEST_LOCKED

测试脚本已就绪并锁定 Hash。

openv_lint

2

LINT_PASSED

静态检查（Verible/Verilator）通过。

openv_run_sim

3

VERIFIED

仿真 100% 通过（CocoTB）。

openv_run_synth

4

SYNTHESIZED

综合完成（Yosys），生成网表。

openv_run_sta

3. 工具接口定义 (Tools API)

3.1 openv_init_test

描述：初始化 TDD 流程。Agent 必须首先编写 CocoTB 测试脚本。

参数：

test_path: 测试文件所在的目录（如 test/）。

top_module: 目标模块名。

内部逻辑：

扫描指定目录，计算所有 .py 和 Makefile 的内容 Hash。

将 Hash 存入本地 .openv/state.json。

设置状态为 TEST_LOCKED。

3.2 openv_lint

描述：执行静态检查。必须在 TEST_LOCKED 之后执行。

参数：

src_files: 需要检查的 .v 或 .sv 文件列表。

内部逻辑：

调用 verible-verilog-lint。

调用 verilator --lint-only。

判定：若有任何 Error 或 Warning（除非显式忽略），返回失败，状态保持。若全通，状态设为 LINT_PASSED。

3.3 openv_run_sim

描述：执行功能仿真。强制要求 LINT_PASSED。

参数：

force_tool: 可选（"verilator" | "icarus"）。

内部逻辑：

TDD 校验：对比当前 test/ Hash。若不匹配，报错并提示“禁止修改测试用例以适配 Bug”。

Smart Routing：若设计包含 SystemVerilog 接口或文件 > 500 行，强制使用 Verilator。

判定：只有当 CocoTB 输出中 FAILING_TESTS=0 且 TOTAL_TESTS > 0 时，状态设为 VERIFIED。

3.4 openv_run_synth

描述：逻辑综合。强制要求 VERIFIED。

参数：

constraints_file: SDC 约束文件路径。

内部逻辑：

检查状态。若未通过仿真，返回：“严禁在功能未通过时尝试综合”。

调用最新版 yosys 及其流水线。

状态设为 SYNTHESIZED。

3.5 openv_get_status

描述：元数据查询。

返回内容：当前状态码、当前 Hash、最后一次执行日志路径、流水线阻塞原因。

4. 异常处理规范

WorkflowViolationError：当 Agent 尝试跳步操作（例如在 IDLE 状态下请求 synth）时抛出。

TackperingDetectedError：当 run_sim 阶段发现测试脚本被改动时抛出。

VersionMismatchError：当环境检测到 yosys 版本低于目标版本时抛出。

5. 客户端集成配置 (mcp_config.json)

{
  "mcpServers": {
    "openv": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-v", "${PWD}:/workspace",
        "openv-mcp-server:latest"
      ]
    }
  }
}


开发者提示：本定义书是 Agent 的“行为法律”。在实现时，必须确保 .openv/state.json 的不可篡改性（在容器内通过 root 权限管理）。