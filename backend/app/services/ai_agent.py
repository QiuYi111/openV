from app.services.container_manager import ContainerManager

class AIAgentService:
    def __init__(self, container_manager: ContainerManager):
        self.container_manager = container_manager

    def execute_autopilot_task(self, container_id: str, task_command: str):
        # In a real scenario, this might involve more logic, 
        # but for now it's a wrapper for executing commands.
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
