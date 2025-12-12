---
description: Lint and format Verilog/SystemVerilog code
---

# Verilog Linting & Formatting

## Verible Linting

// turbo
1. Lint all Verilog files:
```bash
docker run --rm -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
cd /workspace
find . -name "*.v" -o -name "*.sv" | xargs verible-verilog-lint
'
```

## Verible Formatting

// turbo
2. Format a single file (in-place):
```bash
docker run --rm -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
cd /workspace
verible-verilog-format --inplace file.v
'
```

3. Format all files:
```bash
docker run --rm -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
cd /workspace
find . -name "*.v" -o -name "*.sv" | xargs verible-verilog-format --inplace
'
```

## Verilator Lint Check

// turbo
4. Static analysis with Verilator:
```bash
docker run --rm -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
cd /workspace
verilator --lint-only -Wall design.v
'
```

## Lint Configuration
Create `.verible.filelist` for project:
```
# Source files
src/top.v
src/module_a.v
src/module_b.v

# Exclude testbenches from lint
# -tb/tb_*.v
```

Create `.verible-lintrc` for lint rules:
```
# Disable specific rules if needed
# -explicit-parameter-storage-type
# -no-trailing-spaces
```

## CI Integration Example
```bash
#!/bin/bash
# lint_all.sh
set -e
echo "Running Verilator lint..."
verilator --lint-only -Wall src/*.v
echo "Running Verible lint..."
verible-verilog-lint src/*.v
echo "All lint checks passed!"
```
