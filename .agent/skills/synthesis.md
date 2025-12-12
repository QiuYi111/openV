---
description: Run Yosys synthesis and OpenSTA timing analysis
---

# Synthesis & Timing Analysis

## Yosys Synthesis

// turbo
1. Basic synthesis:
```bash
docker run --rm -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
cd /workspace
yosys -p "read_verilog design.v; synth -top top_module; stat; write_verilog -noattr synth_output.v"
'
```

## Yosys TCL Script Template
Create `synth.tcl`:
```tcl
# Read design
read_verilog src/*.v

# Synthesize
synth -top top_module

# Technology mapping (optional, requires liberty file)
# dfflibmap -liberty cells.lib
# abc -liberty cells.lib

# Report statistics
stat

# Write output
write_verilog -noattr output/synth.v
write_json output/synth.json
```

Run with:
```bash
yosys -s synth.tcl
```

## OpenSTA Timing Analysis

1. Create constraints file `constraints.sdc`:
```tcl
# Define clock
create_clock -name clk -period 10.0 [get_ports clk]

# Input/output delays
set_input_delay -clock clk 2.0 [all_inputs]
set_output_delay -clock clk 2.0 [all_outputs]
```

2. Create analysis script `analyze.tcl`:
```tcl
read_verilog synth_output.v
# read_liberty -min slow.lib
# read_liberty -max fast.lib
link_design top_module
read_sdc constraints.sdc
report_checks -path_delay min_max
report_tns
report_wns
```

3. Run timing analysis:
```bash
docker run --rm -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
cd /workspace
sta -f analyze.tcl
'
```

## Complete Flow Example
```bash
docker run --rm -v $(pwd):/workspace crpi-5901rc39czlvlzc5.cn-beijing.personal.cr.aliyuncs.com/open-v/openv-dev:amd64-latest bash -c '
cd /workspace
# Synthesize
yosys -p "read_verilog design.v; synth -top top; write_verilog synth.v"
# Analyze timing
sta -c "read_verilog synth.v; link_design top; report_checks"
'
```
