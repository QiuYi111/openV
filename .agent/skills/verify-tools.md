---
description: Verify all openV tools are working correctly
---

# Verify OpenV Tools

// turbo-all

## Quick Version Check

1. Check all tool versions:
```bash
docker run --rm crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
echo "=== OpenV Tool Versions ==="
echo "[Python]    $(python3 --version)"
echo "[Verilator] $(verilator --version | head -1)"
echo "[Yosys]     $(yosys -V)"
echo "[OpenSTA]   $(sta -version)"
echo "[Icarus]    $(iverilog -V 2>&1 | head -1)"
echo "[GTKWave]   $(which gtkwave)"
echo "[Verible]   $(verible-verilog-format --version 2>&1 | head -1)"
source /opt/asic_env/bin/activate
echo "[CocoTB]    $(pip show cocotb | grep Version)"
'
```

## Functional Tests

2. Run Icarus Verilog simulation test:
```bash
docker run --rm crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
cd /tmp
echo "module test; initial begin \$display(\"Icarus OK\"); \$finish; end endmodule" > test.v
iverilog -o test test.v && vvp test
'
```

3. Run Yosys synthesis test:
```bash
docker run --rm crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
cd /tmp
echo "module test(input a, output b); assign b = a; endmodule" > test.v
yosys -q -p "read_verilog test.v; synth; stat"
'
```

4. Run Verilator lint test:
```bash
docker run --rm crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
cd /tmp
echo "module test(input a, output b); assign b = a; endmodule" > test.v
verilator --lint-only -Wall test.v && echo "Verilator lint: OK"
'
```

5. Run CocoTB + Verilator integration test:
```bash
docker run --rm crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
source /opt/asic_env/bin/activate
cd /tmp
cat > counter.v << EOF
module counter(input clk, input reset, output reg [7:0] count);
always @(posedge clk) if (reset) count <= 0; else count <= count + 1;
endmodule
EOF
cat > test_counter.py << EOF
import cocotb
from cocotb.triggers import RisingEdge
from cocotb.clock import Clock
@cocotb.test()
async def test(dut):
    cocotb.start_soon(Clock(dut.clk, 10, unit="ns").start())
    dut.reset.value = 1
    await RisingEdge(dut.clk)
    dut.reset.value = 0
    for _ in range(5): await RisingEdge(dut.clk)
    print("CocoTB + Verilator: OK")
EOF
cat > Makefile << EOF
SIM = verilator
TOPLEVEL_LANG = verilog
VERILOG_SOURCES = counter.v
TOPLEVEL = counter
MODULE = test_counter
include \$(shell cocotb-config --makefiles)/Makefile.sim
EOF
make 2>&1 | tail -10
'
```

## Expected Results
All tests should pass with no errors. Key versions:
- Verilator: 5.036
- CocoTB: 2.0.1
- Python: 3.10.x
