from app.services.container_manager import ContainerManager

class AIAgentService:
    def __init__(self, container_manager: ContainerManager):
        self.container_manager = container_manager

    def process_slash_command(self, container_id: str, command_text: str, session=None, project_id=None):
        """
        Maps slash commands to actual operations in the container.
        """
        parts = command_text.split()
        cmd = parts[0].lower()
        
        # In a real SaaS, this would invoke a state-aware agent instance.
        # For this phase, we map them to the MCP tools or standardized scripts.
        if cmd == "/plan":
            return self.execute_autopilot_task(container_id, "echo 'Architectural planning initiated...'", session, project_id)
        elif cmd == "/unit":
            # Example: call mcp_server logic or a specific script
            sim_cmd = "python3 mcp_server.py --tool openv_init_test --args '{\"test_path\": \"test/\", \"top_module\": \"top\"}'"
            return self.execute_autopilot_task(container_id, sim_cmd, session, project_id)
        elif cmd == "/fix-unit":
            sim_cmd = "python3 mcp_server.py --tool openv_run_sim --args '{\"test_path\": \"test/\"}'"
            return self.execute_autopilot_task(container_id, sim_cmd, session, project_id)
        
        return {"status": "error", "detail": f"Unknown command: {cmd}"}

    def execute_autopilot_task(self, container_id: str, task_command: str, session=None, project_id=None):
        try:
            output = self.container_manager.exec_command(container_id, task_command)
            
            # If this was a simulation command, update results
            if session and project_id and ("iverilog" in task_command or "vvp" in task_command or "pytest" in task_command):
                from app.services.simulation_service import SimulationService
                SimulationService.update_project_results(session, project_id, output)

            return {
                "status": "success",
                "output": output
            }
        except Exception as e:
            return {
                "status": "error",
                "detail": str(e)
            }
