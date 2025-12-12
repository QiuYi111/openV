---
description: Run CocoTB tests with Verilator or Icarus Verilog
---

# CocoTB Testing Workflow

## Overview
OpenV supports CocoTB 2.0+ with both Verilator 5.036 and Icarus Verilog 11.0.

## Quick Test with Verilator (Recommended)

// turbo
1. Run CocoTB test inside container:
```bash
docker run --rm -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
source /opt/asic_env/bin/activate
cd /workspace
make SIM=verilator
'
```

## Test with Icarus Verilog

// turbo
```bash
docker run --rm -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
source /opt/asic_env/bin/activate
cd /workspace
make SIM=icarus
'
```

## Makefile Template for CocoTB
Create a `Makefile` in your project:

```makefile
SIM ?= verilator
TOPLEVEL_LANG = verilog

# Verilog sources
VERILOG_SOURCES = $(wildcard src/*.v)

# Top-level module name
TOPLEVEL = my_module

# Python test module (without .py)
MODULE = test_my_module

# Verilator options
ifeq ($(SIM),verilator)
  EXTRA_ARGS += --trace
endif

include $(shell cocotb-config --makefiles)/Makefile.sim
```

## Python Test Template
Create `test_my_module.py`:

```python
import cocotb
from cocotb.triggers import RisingEdge, Timer
from cocotb.clock import Clock

@cocotb.test()
async def test_basic(dut):
    """Basic functionality test"""
    # Start clock (10ns period)
    cocotb.start_soon(Clock(dut.clk, 10, unit="ns").start())
    
    # Reset
    dut.reset.value = 1
    await RisingEdge(dut.clk)
    await RisingEdge(dut.clk)
    dut.reset.value = 0
    
    # Your test logic here
    await RisingEdge(dut.clk)
    assert dut.output.value == expected_value
```

## Viewing Waveforms
After simulation with `--trace`, view VCD files:
```bash
gtkwave dump.vcd
```
