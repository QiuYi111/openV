# OpenV Development Environment Docker Image

一个完整的 Verilog/SystemVerilog 开发环境，集成了主流的开源 EDA 工具，支持 ASIC 和 FPGA 设计流程。

## 📋 目录

- [镜像特性](#镜像特性)
- [工具版本](#工具版本)
- [快速开始](#快速开始)
- [拉取镜像](#拉取镜像)
- [使用方法](#使用方法)
- [工具使用指南](#工具使用指南)
- [开发工作流](#开发工作流)
- [示例项目](#示例项目)
- [故障排除](#故障排除)

## 🚀 镜像特性

- **完整工具链**：集成 Verilator、Yosys、OpenSTA、Icarus Verilog 等
- **Python 生态**：内置 CocoTB 2.0+，支持基于 Python 的验证
- **多架构支持**：提供 ARM64 和 AMD64 两个版本
- **优化构建**：多阶段构建，最小化镜像大小
- **即开即用**：预配置环境，无需额外安装

## 🛠️ 工具版本

| 工具 | 版本 | 说明 |
|------|------|------|
| Python | 3.10.12 | Python 开发环境 |
| Verilator | 5.036 | Verilog 仿真和综合 |
| Yosys | 0.9 | 逻辑综合工具 |
| OpenSTA | 2.7.0 | 静态时序分析 |
| Icarus Verilog | 11.0 | Verilog 仿真器 |
| CocoTB | 2.0.1 | Python 验证框架 |
| GTKWave | - | 波形查看器 |
| Verible | v0.0-4023 | SystemVerilog 工具链 |

## 🏃‍♂️ 快速开始

### 1. 拉取镜像

```bash
# ARM64 架构（适用于 Apple Silicon、ARM 服务器）
docker pull crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:latest

# AMD64 架构（适用于 Intel/AMD 服务器）
docker pull crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest
```

### 2. 启动开发环境

```bash
# 基本使用
docker run -it --rm crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:latest

# 挂载工作目录
docker run -it --rm -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:latest

# 后台运行容器
docker run -it -d --name openv-dev -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:latest
```

## 📖 使用方法

### 基本命令

```bash
# 进入容器并激活 Python 环境
docker run -it --rm -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:latest
source /opt/asic_env/bin/activate
```

### 持久化开发环境

```bash
# 创建并启动开发容器
docker run -it -d \
  --name openv-dev \
  -v $(pwd):/workspace \
  -v ~/.gitconfig:/root/.gitconfig \
  crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:latest

# 进入运行中的容器
docker exec -it openv-dev bash
```

## 🔧 工具使用指南

### Verilator

```bash
# 检查版本
verilator -version

# 编译 Verilog 文件
verilator --binary --cc -Wall my_module.v

# 运行仿真
obj_dir/Vmy_module
```

### Yosys

```bash
# 检查版本
yosys -V

# 交互式使用
yosys

# 命令行综合
yosys -p "read -sv design.v; synth; write -aiverilog design_synth.v"
```

### OpenSTA

```bash
# 检查版本
sta -version

# 交互式使用
sta

# 读取设计并分析
sta -f analyze_sta.tcl
```

### Icarus Verilog

```bash
# 编译 Verilog 文件
iverilog -o tb_sim tb.v design.v

# 运行仿真
vvp tb_sim

# 查看波形
gtkwave tb.vcd
```

### CocoTB (Python 验证)

```bash
# 激活 Python 环境
source /opt/asic_env/bin/activate

# 运行 CocoTB 测试
make -f cocotb_makefile MODULE=dut SIM=iverilog TOPLEVEL_LANG=verilog
```

### Verible

```bash
# 代码格式化
verible-verilog-format --inplace my_module.v

# 语法检查
verible-verilog-lint my_module.v

# 代码风格检查
verible-verilog-lint --rules=my_rules.config my_module.v
```

## 🔄 开发工作流

### 1. RTL 设计与仿真

```bash
# 创建设计文件
cat > counter.v << 'EOF'
module counter #(parameter WIDTH=8) (
    input clk,
    input reset,
    output reg [WIDTH-1:0] count
);
    always @(posedge clk or posedge reset) begin
        if (reset)
            count <= 0;
        else
            count <= count + 1;
    end
endmodule
EOF

# 创建测试文件
cat > tb_counter.v << 'EOF'
`timescale 1ns/1ps
module tb_counter();
    reg clk;
    reg reset;
    wire [7:0] count;

    counter dut (
        .clk(clk),
        .reset(reset),
        .count(count)
    );

    initial begin
        clk = 0;
        reset = 1;
        #10 reset = 0;
        #1000 $finish;
    end

    always #5 clk = ~clk;
endmodule
EOF

# 编译和仿真
iverilog -o tb_sim counter.v tb_counter.v
vvp tb_sim
```

### 2. 使用 CocoTB 进行验证

```python
# 创建测试文件 test_counter.py
import cocotb
from cocotb.triggers import Timer, RisingEdge, FallingEdge
from cocotb.clock import Clock

@cocotb.test()
async def test_counter(dut):
    """测试计数器功能"""
    # 创建时钟
    cocotb.start_soon(Clock(dut.clk, 10, units="ns").start())

    # 复位
    dut.reset.value = 1
    await RisingEdge(dut.clk)
    dut.reset.value = 0

    # 验证计数功能
    for i in range(100):
        await RisingEdge(dut.clk)
        assert dut.count.value == i, f"计数器值错误: 期望 {i}, 实际 {dut.count.value}"
```

```bash
# 运行 CocoTB 测试
SIM=iverilog TOPLEVEL_LANG=verilog MODULE=counter cocotb-test
```

### 3. 综合与时序分析

```bash
# Yosys 综合
yosys -p "read -sv counter.v; synth -top counter; write -aiverilog counter_synth.v"

# 创建约束文件
cat > constraints.sdc << 'EOF'
create_clock clk -period 10 -waveform {0 5}
set_input_delay 2 -clock clk [get_ports reset]
set_output_delay 2 -clock clk [get_ports count*]
EOF

# OpenSTA 时序分析
sta -c "read_liberty -sky130 /usr/local/share/sky130_fd_sc_hd_tt_025C_1v80.lib || echo 'Using default liberty'; read_verilog counter.v; read_sdc constraints.sdc; report_checks"
```

## 📁 项目结构示例

```
my_project/
├── src/
│   ├── rtl/
│   │   ├── counter.v
│   │   └── top.v
│   └── tb/
│       ├── tb_counter.py
│       └── tb_top.py
├── scripts/
│   ├── synth.tcl
│   └── analyze_sta.tcl
├── Makefile
└── README.md
```

## 🐳 Docker 最佳实践

### 1. 使用 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  openv-dev:
    image: crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:latest
    container_name: openv-dev-workspace
    volumes:
      - .:/workspace
      - ~/.gitconfig:/root/.gitconfig:ro
    working_dir: /workspace
    stdin_open: true
    tty: true
    command: /bin/bash
```

```bash
# 启动开发环境
docker-compose up -d

# 进入容器
docker-compose exec openv-dev bash
```

### 2. 常用 Docker 命令

```bash
# 查看镜像
docker images | grep openv-dev

# 查看运行的容器
docker ps | grep openv-dev

# 清理容器
docker rm -f openv-dev

# 查看日志
docker logs openv-dev
```

## 🔍 故障排除

### 常见问题

1. **内存不足**
   ```bash
   # 增加 Docker 内存限制
   # 在 Docker Desktop 中设置内存至少 4GB
   ```

2. **权限问题**
   ```bash
   # 修改文件权限
   sudo chown -R $USER:$USER .
   ```

3. **网络问题**
   ```bash
   # 配置 Docker 镜像加速器
   sudo systemctl daemon-reload
   sudo systemctl restart docker
   ```

4. **跨架构运行警告**
   ```bash
   # 如果看到架构不匹配警告，这是正常的
   # 在实际部署到对应架构服务器时不会出现此问题
   ```

### 获取帮助

```bash
# 查看工具帮助
verilator --help
yosys -h
sta -h
iverilog -h

# 在容器中查看系统信息
docker run --rm crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:latest \
  bash -c "echo '=== Environment Info ===' && \
  echo 'Architecture:' \$(uname -m) && \
  echo 'OS Version:' \$(cat /etc/os-release | grep PRETTY_NAME) && \
  echo 'Disk Usage:' && du -sh /workspace/ 2>/dev/null || echo 'Workspace not accessible'"
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

如有问题，请通过 GitHub Issues 联系我们。

---

**注意**：本镜像仅供开发和学习使用，不适用于生产环境。使用时请遵守相关工具的许可证要求。