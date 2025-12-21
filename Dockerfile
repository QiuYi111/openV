# ==========================================
# Stage 1: Base System (系统基础环境)
# ==========================================
FROM ubuntu:22.04 AS base-system

ENV DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/bash

# 1. 基础系统工具
RUN apt-get update && apt-get install -y \
    wget curl git make bzip2 \
    g++ \
    cmake ninja-build \
    libtcl8.6 libgomp1 graphviz \
    libreadline8 locales \
    python3 python3-pip python3-dev python3-venv \
    # 构建工具 (为 Verilator 等源码编译准备)
    build-essential autoconf automake libtool \
    flex bison \
    help2man perl \
    && rm -rf /var/lib/apt/lists/*

# 设置 UTF-8 语言环境 (Python 3 必须)
RUN locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

# 2. 集成 OSS-CAD-Suite (最新预编译二进制包)
# 包含: Yosys, Nextpnr, OpenSTA, Icarus Verilog, etc.
WORKDIR /opt
RUN wget -q https://github.com/YosysHQ/oss-cad-suite-build/releases/download/2025-12-18/oss-cad-suite-linux-x64-20251218.tgz -O oss-cad-suite.tgz \
    && tar -xzf oss-cad-suite.tgz \
    && rm oss-cad-suite.tgz

# 设置 OSS-CAD-Suite 环境变量
ENV PATH="/opt/oss-cad-suite/bin:$PATH"

# ==========================================
# Stage 2: Verilator (Verilator编译)
# ==========================================
FROM base-system AS with-verilator

# Build Verilator 5.036 from source (required for CocoTB 2.0+)
WORKDIR /tmp/verilator-build
RUN git clone --depth 1 --branch v5.036 https://github.com/verilator/verilator.git \
    && cd verilator \
    && autoconf \
    && ./configure --prefix=/usr/local \
    && make -j$(nproc) \
    && make install \
    && cd / && rm -rf /tmp/verilator-build

# ==========================================
# Stage 3: Verible (Verible工具)
# ==========================================
FROM with-verilator AS with-verible

# 安装 Verible (静态二进制包)
RUN wget -q https://github.com/chipsalliance/verible/releases/download/v0.0-4023-gc1271a00/verible-v0.0-4023-gc1271a00-linux-static-x86_64.tar.gz -O verible.tar.gz \
    && tar -xzf verible.tar.gz \
    && cp verible-*/bin/* /usr/local/bin/ \
    && rm -rf verible-* verible.tar.gz

# ==========================================
# Stage 4: Python & MCP Environment
# ==========================================
FROM with-verible AS final

WORKDIR /workspace

# 配置 Python 虚拟环境
ENV PYTHON_ENV=/opt/asic_env
ENV PATH=$PYTHON_ENV/bin:$PATH

RUN mkdir -p $PYTHON_ENV \
    && python3 -m venv $PYTHON_ENV \
    && pip install --upgrade pip \
    && pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/ \
    && pip config set global.trusted-host mirrors.aliyun.com

# 安装 EDA 和 MCP 相关 Python 库
RUN pip install --no-cache-dir \
    cocotb>=2.0 \
    cocotb-test \
    cocotb-bus \
    pytest \
    numpy \
    scipy \
    matplotlib \
    volare \
    fastmcp \
    pydantic

# 最终构建自检
RUN echo "=== Environment Check ===" \
    && echo "[Python] $(python --version)" \
    && echo "[Verilator] $(verilator --version | head -1)" \
    && echo "[CocoTB] $(pip show cocotb | grep Version)" \
    && echo "[Yosys] $(yosys -V)" \
    && echo "[OpenSTA] $(sta -version)" \
    && echo "[Icarus] $(iverilog -V | head -1)" \
    && echo "Build Verified Successfully!"

# 设置执行脚本 (MCP Server)
# COPY mcp_server.py /workspace/mcp_server.py
# CMD ["python", "/workspace/mcp_server.py"]

CMD ["/bin/bash"]