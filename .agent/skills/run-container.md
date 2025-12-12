---
description: Start and manage the openV development container
---

# Run OpenV Container

## Quick Start

// turbo
1. Run interactive container with current directory mounted:
```bash
docker run -it --rm -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest
```

## Persistent Development Environment

1. Create named container for persistent use:
```bash
docker run -it -d \
  --name openv-dev \
  -v $(pwd):/workspace \
  -v ~/.gitconfig:/root/.gitconfig:ro \
  crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest
```

2. Enter the running container:
```bash
docker exec -it openv-dev bash
```

3. Activate Python environment inside container:
```bash
source /opt/asic_env/bin/activate
```

## Container Management

// turbo
- Check running containers:
```bash
docker ps | grep openv
```

- Stop container:
```bash
docker stop openv-dev
```

- Remove container:
```bash
docker rm openv-dev
```

## Available Tools Inside Container
- `verilator` - Verilog simulation (v5.036)
- `yosys` - Logic synthesis
- `iverilog` / `vvp` - Icarus Verilog simulation
- `sta` - OpenSTA timing analysis
- `gtkwave` - Waveform viewer
- `verible-verilog-format` / `verible-verilog-lint` - Linting
- `cocotb` - Python verification framework (activate venv first)
