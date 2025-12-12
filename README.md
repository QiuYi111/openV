# OpenV: 智能体驱动的 Verilog 开发套件

> **一套完整的开源 Verilog/SystemVerilog 工具链，专为 AI 辅助的智能体工作流优化。**

OpenV 将业界标准的 EDA 工具打包到 Docker 环境中，与 AI 编程助手（如 **Claude Code**）无缝集成。让智能体帮你完成代码检查、仿真、综合和时序分析——全程使用自然语言交互。

---

## 📋 目录

- [智能体用法（推荐）](#-智能体用法推荐)
- [手动用法（备选）](#-手动用法备选)
- [工具版本](#-工具版本)
- [故障排除](#-故障排除)

---

## 🤖 智能体用法（推荐）

### 快速开始

**1. 拉取 Docker 镜像**

```bash
# AMD64 架构（Intel/AMD 服务器）
docker pull crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest

# ARM64 架构（Apple Silicon、ARM 服务器）
docker pull crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:latest
```

**2. 复制技能到你的项目**

```bash
# 在你的项目目录下
mkdir -p .claude/skills
cp -r /path/to/openV/.agent/skills/* .claude/skills/
```

或者直接从仓库下载：
```bash
mkdir -p .claude/skills
curl -sL https://raw.githubusercontent.com/xxx/openV/main/.agent/skills/openV -o .claude/skills/openV
curl -sL https://raw.githubusercontent.com/xxx/openV/main/.agent/skills/lint.md -o .claude/skills/lint.md
curl -sL https://raw.githubusercontent.com/xxx/openV/main/.agent/skills/cocotb-test.md -o .claude/skills/cocotb-test.md
curl -sL https://raw.githubusercontent.com/xxx/openV/main/.agent/skills/synthesis.md -o .claude/skills/synthesis.md
curl -sL https://raw.githubusercontent.com/xxx/openV/main/.agent/skills/run-container.md -o .claude/skills/run-container.md
curl -sL https://raw.githubusercontent.com/xxx/openV/main/.agent/skills/verify-tools.md -o .claude/skills/verify-tools.md
```

**3. 用自然语言交互**

在 Claude Code 中打开项目后，直接用自然语言描述需求：

| 你这样说... | Claude 这样做... |
|------------|-----------------|
| "检查我的 Verilog 代码" | 通过 Docker 运行 Verible/Verilator 代码检查 |
| "运行 CocoTB 测试" | 使用 Verilator/Icarus 执行仿真 |
| "综合我的设计" | 运行 Yosys 综合 + OpenSTA 时序分析 |
| "验证 OpenV 工具是否正常" | 检查所有工具版本并运行功能测试 |
| "启动开发容器" | 启动持久化的开发环境 |

### 可用技能

| 技能文件 | 描述 |
|----------|------|
| `openV` | 主入口，路由到具体的工作流 |
| `lint.md` | Verible 格式化 + Verilator 静态分析 |
| `cocotb-test.md` | 使用 Verilator/Icarus 的 CocoTB 仿真 |
| `synthesis.md` | Yosys 综合 + OpenSTA 时序分析 |
| `run-container.md` | 容器生命周期管理 |
| `verify-tools.md` | 所有工具的功能验证 |

### 项目结构示例

```
your-project/
├── .claude/
│   └── skills/         # ← 从 openV 复制的技能文件
│       ├── openV
│       ├── lint.md
│       ├── cocotb-test.md
│       ├── synthesis.md
│       ├── run-container.md
│       └── verify-tools.md
├── src/                # RTL 源文件
├── test/               # CocoTB 测试文件
├── Makefile            # CocoTB makefile
└── constraints.sdc     # 时序约束
```

---

## 🛠️ 工具版本

| 工具 | 版本 | 说明 |
|------|------|------|
| Python | 3.10.12 | Python 开发环境 |
| Verilator | 5.036 | 快速仿真与代码检查 |
| Yosys | 0.9 | 逻辑综合工具 |
| OpenSTA | 2.7.0 | 静态时序分析 |
| Icarus Verilog | 11.0 | Verilog 仿真器 |
| CocoTB | 2.0.1 | Python 验证框架 |
| Verible | v0.0-4023 | 代码检查与格式化 |
| GTKWave | - | 波形查看器 |

---

## 🔧 手动用法（备选）

如果你更喜欢直接使用命令行：

### 基本命令

```bash
# 一次性执行命令
docker run --rm -v $(pwd):/workspace \
  crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest \
  bash -c 'source /opt/asic_env/bin/activate && <你的命令>'

# 交互式会话
docker run -it --rm -v $(pwd):/workspace \
  crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest
```

### 持久化开发环境

```bash
# 创建并启动开发容器
docker run -it -d \
  --name openv-dev \
  -v $(pwd):/workspace \
  -v ~/.gitconfig:/root/.gitconfig:ro \
  crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest

# 进入运行中的容器
docker exec -it openv-dev bash

# 激活 Python 环境
source /opt/asic_env/bin/activate
```

### 工具使用示例

```bash
# Verilator 代码检查
verilator --lint-only -Wall my_module.v

# Yosys 综合
yosys -p "read_verilog design.v; synth -top top_module; stat; write_verilog synth.v"

# OpenSTA 时序分析
sta -f analyze.tcl

# Icarus Verilog 仿真
iverilog -o tb_sim tb.v design.v && vvp tb_sim

# Verible 格式化
verible-verilog-format --inplace my_module.v

# CocoTB 测试
source /opt/asic_env/bin/activate && make SIM=verilator
```

### 容器管理

```bash
docker ps | grep openv      # 查看运行中的容器
docker stop openv-dev       # 停止容器
docker rm openv-dev         # 删除容器
```

---

## 🔍 故障排除

| 问题 | 解决方案 |
|------|----------|
| 内存不足 | Docker Desktop 设置内存至少 4GB |
| 权限问题 | `sudo chown -R $USER:$USER .` |
| 架构不匹配 | 确保使用正确的镜像标签（`amd64-latest` 或 `latest`） |

---

## 📄 许可证

MIT 许可证，仅供开发和学习使用。