import re
import json
from sqlmodel import Session
from app.models import Project
from datetime import datetime, timezone

class SimulationService:
    @staticmethod
    def parse_vvp_output(output: str):
        """
        Parses iverilog vvp output for common success/failure markers.
        Example: "TEST PASSED" or "Verification failed"
        """
        results = []
        # Look for pass markers
        if re.search(r"PASSED|PASSED!|pass", output, re.IGNORECASE):
            results.append({"id": 1, "name": "Functional Check", "status": "pass"})
        elif re.search(r"FAIL|FAILED|fail|Error", output, re.IGNORECASE):
            results.append({"id": 1, "name": "Functional Check", "status": "fail"})
        else:
            results.append({"id": 1, "name": "Functional Check", "status": "idle"})
            
        return results

    @staticmethod
    def update_project_results(session: Session, project_id: int, output: str):
        project = session.get(Project, project_id)
        if not project:
            return
            
        results = SimulationService.parse_vvp_output(output)
        project.test_results = json.dumps(results)
        project.updated_at = datetime.now(timezone.utc)
        session.add(project)
        session.commit()
        return results
