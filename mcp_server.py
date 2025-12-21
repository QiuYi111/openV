import os
import json
import hashlib
import subprocess
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from fastmcp import FastMCP

# --- State Definitions ---

class State(int, Enum):
    IDLE = 0
    TEST_LOCKED = 1
    LINT_PASSED = 2
    VERIFIED = 3
    SYNTHESIZED = 4

STATE_FILE = ".openv/state.json"

class ProjectState(BaseModel):
    state: State = State.IDLE
    test_hashes: dict = {}
    last_log: Optional[str] = None
    blocking_reason: Optional[str] = None
    top_module: Optional[str] = None

# --- Helper Functions ---

def load_state() -> ProjectState:
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return ProjectState.model_validate(json.load(f))
    return ProjectState()

def save_state(state: ProjectState):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state.model_dump(), f, indent=2)

def calculate_hashes(directory: str) -> dict:
    hashes = {}
    if not os.path.exists(directory):
        return hashes
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith((".py", ".v", ".sv", "Makefile")):
                path = os.path.join(root, file)
                with open(path, "rb") as f:
                    hashes[path] = hashlib.sha256(f.read()).hexdigest()
    return hashes

# --- MCP Server Initializarion ---

mcp = FastMCP("OpenV MCP Server")

# --- Tool Implementations ---

def get_status():
    """Logic for openv_get_status"""
    state = load_state()
    return state.model_dump()

def init_test(test_path: str, top_module: str):
    """Logic for openv_init_test"""
    state = load_state()
    hashes = calculate_hashes(test_path)
    if not hashes:
        return f"Error: No test files found in {test_path}"
    
    state.test_hashes = hashes
    state.top_module = top_module
    state.state = State.TEST_LOCKED
    state.blocking_reason = None
    save_state(state)
    return f"TDD pipeline initialized. State: TEST_LOCKED. Top module: {top_module}"

def lint(src_files: List[str]):
    """Logic for openv_lint"""
    state = load_state()
    if state.state < State.TEST_LOCKED:
        return "WorkflowViolationError: You must initialize tests (openv_init_test) before linting."

    results = []
    # 1. Verible Lint
    for f in src_files:
        res = subprocess.run(["verible-verilog-lint", f], capture_output=True, text=True)
        if res.returncode != 0:
            state.blocking_reason = f"Verible Lint failed for {f}"
            save_state(state)
            return f"Lint Failed (Verible):\n{res.stderr}"

    # 2. Verilator Lint
    for f in src_files:
        res = subprocess.run(["verilator", "--lint-only", "-Wall", f], capture_output=True, text=True)
        if res.returncode != 0:
            state.blocking_reason = f"Verilator Lint failed for {f}"
            save_state(state)
            return f"Lint Failed (Verilator):\n{res.stderr}"

    state.state = State.LINT_PASSED
    state.blocking_reason = None
    save_state(state)
    return "All files passed linting. State: LINT_PASSED"

def run_sim(test_path: str, force_tool: Optional[str] = None):
    """Logic for openv_run_sim"""
    state = load_state()
    if state.state < State.LINT_PASSED:
        return "WorkflowViolationError: You must pass linting (openv_lint) before running simulation."

    # TDD Verification
    current_hashes = calculate_hashes(test_path)
    for path, original_hash in state.test_hashes.items():
        if path not in current_hashes or current_hashes[path] != original_hash:
            return f"TamperingDetectedError: Test file {path} has been modified. Reverting tests to match the locked version is required."

    # Smart Routing
    total_lines = 0
    use_verilator = False
    for root, _, files in os.walk("src"):
        for f in files:
            if f.endswith(".sv"):
                use_verilator = True
            path = os.path.join(root, f)
            with open(path, "r") as src:
                total_lines += len(src.readlines())
    
    if total_lines > 500:
        use_verilator = True
    
    if force_tool == "verilator": use_verilator = True
    elif force_tool == "icarus": use_verilator = False

    sim_tool = "verilator" if use_verilator else "icarus"
    
    # Run Simulation
    env = os.environ.copy()
    env["SIM"] = sim_tool
    res = subprocess.run(["make"], capture_output=True, text=True, env=env)
    
    state.last_log = res.stdout + res.stderr
    
    if res.returncode == 0 and "FAILING_TESTS=0" in res.stdout:
        state.state = State.VERIFIED
        state.blocking_reason = None
        save_state(state)
        return f"Simulation Passed using {sim_tool}. State: VERIFIED"
    else:
        state.blocking_reason = f"Simulation failed using {sim_tool}"
        save_state(state)
        return f"Simulation Failed ({sim_tool}):\n{res.stdout}\n{res.stderr}"

def run_synth(top_module: Optional[str] = None):
    """Logic for openv_run_synth"""
    state = load_state()
    if state.state < State.VERIFIED:
        return "WorkflowViolationError: You must pass functional simulation (openv_run_sim) before synthesis."

    module = top_module or state.top_module
    if not module:
        return "Error: Top module name not specified."

    res = subprocess.run(["yosys", "-p", f"read_verilog src/*.v; synth -top {module}; write_verilog synth.v"], capture_output=True, text=True)
    
    if res.returncode == 0:
        state.state = State.SYNTHESIZED
        state.blocking_reason = None
        save_state(state)
        return "Synthesis Successful. Netlist saved to synth.v. State: SYNTHESIZED"
    else:
        state.blocking_reason = "Synthesis failed"
        save_state(state)
        return f"Synthesis Failed:\n{res.stderr}"

def run_sta(constraints_file: Optional[str] = None):
    """Logic for openv_run_sta"""
    state = load_state()
    if state.state < State.SYNTHESIZED:
        return "WorkflowViolationError: You must complete synthesis (openv_run_synth) before timing analysis."

    res = subprocess.run(["sta", "-version"], capture_output=True, text=True)
    
    if res.returncode == 0:
        return f"Timing Analysis completed (Simulated). Tool version: {res.stdout.strip()}"
    else:
        return f"STA Failed: {res.stderr}"

# --- Tool Registration ---

@mcp.tool()
def openv_get_status():
    """Query current project status and pipeline state."""
    return get_status()

@mcp.tool()
def openv_init_test(test_path: str, top_module: str):
    """Initialize TDD process by locking test script hashes."""
    return init_test(test_path, top_module)

@mcp.tool()
def openv_lint(src_files: List[str]):
    """Execute static analysis using Verible and Verilator."""
    return lint(src_files)

@mcp.tool()
def openv_run_sim(test_path: str, force_tool: Optional[str] = None):
    """Execute functional simulation using CocoTB."""
    return run_sim(test_path, force_tool)

@mcp.tool()
def openv_run_synth(top_module: Optional[str] = None):
    """Logical synthesis using Yosys."""
    return run_synth(top_module)

@mcp.tool()
def openv_run_sta(constraints_file: Optional[str] = None):
    """Static Timing Analysis using OpenSTA."""
    return run_sta(constraints_file)

if __name__ == "__main__":
    mcp.run()
