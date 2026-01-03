from app.services.container_manager import ContainerManager

class AIAgentService:
    def __init__(self, container_manager: ContainerManager):
        self.container_manager = container_manager

    def process_slash_command(self, container_id: str, command_text: str):
        """
        Maps slash commands to actual operations in the container.
        """
        parts = command_text.split()
        cmd = parts[0].lower()
        
        # In a real SaaS, this would invoke a state-aware agent instance.
        # For this phase, we map them to the MCP tools or standardized scripts.
        if cmd == "/plan":
            return self.execute_autopilot_task(container_id, "echo 'Architectural planning initiated...'") # Placeholder
        elif cmd == "/unit":
            # Example: call mcp_server logic or a specific script
            return self.execute_autopilot_task(container_id, "python3 mcp_server.py --tool openv_init_test --args '{\"test_path\": \"test/\", \"top_module\": \"top\"}'")
        elif cmd == "/fix-unit":
            return self.execute_autopilot_task(container_id, "python3 mcp_server.py --tool openv_run_sim --args '{\"test_path\": \"test/\"}'")
        
        return {"status": "error", "detail": f"Unknown command: {cmd}"}

    def execute_autopilot_task(self, container_id: str, task_command: str):
        try:
            output = self.container_manager.exec_command(container_id, task_command)
            return {
                "status": "success",
                "output": output
            }
        except Exception as e:
            return {
                "status": "error",
                "detail": str(e)
            }
