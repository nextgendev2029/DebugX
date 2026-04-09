"""
Visualize API — Trace Python code execution step-by-step.

POST /api/visualize
    Body: { "code": "print('hello')" }
    Returns: execution trace with line-by-line variable snapshots
"""

import subprocess
import sys
import json
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.routes.users import verify_firebase_token
from app.utils.logger import get_logger
from app.utils.config import settings

router = APIRouter()
logger = get_logger(__name__)

# Path to the tracer worker script
TRACER_SCRIPT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "tracer_worker.py")


class VisualizeRequest(BaseModel):
    code: str
    stdin: str = ""


@router.post("", summary="Visualize Code Execution")
def visualize_code(
    body: VisualizeRequest,
    decoded_token: dict = Depends(verify_firebase_token),
):
    """
    Trace Python code execution line-by-line.
    Returns step data with variable values at each line.
    """
    uid = decoded_token.get("uid") or decoded_token.get("user_id")
    code = body.code.strip()

    if not code:
        raise HTTPException(status_code=400, detail="No code provided")

    if len(code) > 10000:
        raise HTTPException(status_code=400, detail="Code too long (max 10,000 characters)")

    logger.info("Visualize request (uid=%s, code_length=%d)", uid, len(code))

    try:
        result = subprocess.run(
            [sys.executable, TRACER_SCRIPT],
            input=json.dumps({"code": code, "stdin": body.stdin}),
            capture_output=True,
            text=True,
            timeout=settings.MAX_EXECUTION_TIME,
        )

        if result.returncode != 0 and not result.stdout.strip():
            logger.error("Tracer worker failed: %s", result.stderr[:500])
            raise HTTPException(status_code=500, detail="Code visualization failed")

        trace_data = json.loads(result.stdout)

        logger.info(
            "Visualize complete (uid=%s, steps=%d, truncated=%s, error=%s)",
            uid, trace_data.get("total_steps", 0),
            trace_data.get("truncated", False),
            trace_data.get("error") is not None,
        )

        return trace_data

    except subprocess.TimeoutExpired:
        logger.warning("Tracer timed out (uid=%s)", uid)
        return {
            "steps": [],
            "final_output": "",
            "error": f"Execution timed out after {settings.MAX_EXECUTION_TIME} seconds. Your code may have an infinite loop.",
            "total_steps": 0,
            "truncated": True,
            "code_lines": code.splitlines(),
        }
    except json.JSONDecodeError:
        logger.error("Tracer returned invalid JSON (uid=%s)", uid)
        raise HTTPException(status_code=500, detail="Code visualization returned invalid data")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Visualize error (uid=%s): %s", uid, str(e))
        raise HTTPException(status_code=500, detail="Code visualization failed")
