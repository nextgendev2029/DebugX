"""
Tracer Worker — Sandboxed Python code execution with sys.settrace.

This script is run as a subprocess by the visualize API.
It receives user code via stdin (JSON), traces execution line-by-line,
and outputs the full execution trace as JSON to stdout.

Safety:
    - Max 500 execution steps (prevents infinite loops)
    - 5-second timeout (enforced by the parent process)
    - Restricted builtins (no file/network/exec/eval)
"""

import sys
import json
import io
import copy


MAX_STEPS = 500


def serialize_value(val):
    """Safely serialize a Python value for JSON output."""
    if isinstance(val, (int, float, bool, type(None))):
        return val
    if isinstance(val, str):
        return val if len(val) <= 200 else val[:200] + "..."
    if isinstance(val, (list, tuple)):
        if len(val) > 20:
            return [serialize_value(v) for v in val[:20]] + ["...(truncated)"]
        return [serialize_value(v) for v in val]
    if isinstance(val, dict):
        if len(val) > 20:
            items = list(val.items())[:20]
            result = {str(k): serialize_value(v) for k, v in items}
            result["...(truncated)"] = True
            return result
        return {str(k): serialize_value(v) for k, v in val.items()}
    if isinstance(val, set):
        return list(val)[:20]
    # Fallback: repr with truncation
    r = repr(val)
    return r if len(r) <= 200 else r[:200] + "..."


def trace_code(user_code: str, user_stdin: str = "") -> dict:
    """
    Execute user code with sys.settrace and capture every line execution.

    Returns:
        {
            "steps": [
                {"line": int, "variables": {name: value}, "output": str},
                ...
            ],
            "final_output": str,
            "error": str | None,
            "total_steps": int,
            "truncated": bool
        }
    """
    steps = []
    captured_output = io.StringIO()
    truncated = False
    error_msg = None

    # The code lines (for reference)
    code_lines = user_code.splitlines()

    # Filter out internal variables from locals
    INTERNAL_VARS = {"__builtins__", "__name__", "__doc__", "__package__",
                     "__loader__", "__spec__", "__annotations__", "__file__"}

    def trace_func(frame, event, arg):
        nonlocal truncated

        # Only trace 'line' events in the user's code (not imports/builtins)
        if event != "line":
            return trace_func

        # Only trace the top-level <module> or user-defined functions
        if frame.f_code.co_filename != "<user_code>":
            return trace_func

        if len(steps) >= MAX_STEPS:
            truncated = True
            sys.settrace(None)
            return None

        # Capture current variables
        local_vars = {}
        for k, v in frame.f_locals.items():
            if k not in INTERNAL_VARS and not k.startswith("_"):
                try:
                    local_vars[k] = serialize_value(v)
                except Exception:
                    local_vars[k] = "<unserializable>"

        # Capture current stdout
        current_output = captured_output.getvalue()

        steps.append({
            "line": frame.f_lineno,
            "variables": local_vars,
            "output": current_output,
        })

        return trace_func

    # Compile the user code
    try:
        compiled = compile(user_code, "<user_code>", "exec")
    except SyntaxError as e:
        return {
            "steps": [],
            "final_output": "",
            "error": f"SyntaxError: {e.msg} (line {e.lineno})",
            "total_steps": 0,
            "truncated": False,
            "code_lines": code_lines,
        }

    # Redirect stdout to capture print() output
    old_stdout = sys.stdout
    sys.stdout = captured_output

    # Build a restricted global namespace

    # Mock standard input
    input_lines = user_stdin.splitlines()
    input_iter = iter(input_lines)

    def mocked_input(*args):
        try:
            val = next(input_iter)
            # Log the input to captured output so it appears in the trace like a real terminal interaction (optional)
            # captured_output.write(f"{val}\n") 
            return val
        except StopIteration:
            return ""

    safe_globals = {"__builtins__": {
        "print": print,
        "range": range,
        "len": len,
        "int": int,
        "float": float,
        "str": str,
        "bool": bool,
        "list": list,
        "dict": dict,
        "tuple": tuple,
        "set": set,
        "abs": abs,
        "min": min,
        "max": max,
        "sum": sum,
        "sorted": sorted,
        "reversed": reversed,
        "enumerate": enumerate,
        "zip": zip,
        "map": map,
        "filter": filter,
        "isinstance": isinstance,
        "type": type,
        "round": round,
        "pow": pow,
        "divmod": divmod,
        "chr": chr,
        "ord": ord,
        "hex": hex,
        "bin": bin,
        "oct": oct,
        "input": mocked_input,
        "True": True,
        "False": False,
        "None": None,
    }}

    try:
        sys.settrace(trace_func)
        exec(compiled, safe_globals)
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout

    final_output = captured_output.getvalue()

    return {
        "steps": steps,
        "final_output": final_output,
        "error": error_msg,
        "total_steps": len(steps),
        "truncated": truncated,
        "code_lines": code_lines,
    }


if __name__ == "__main__":
    try:
        raw_input = sys.stdin.read()
        payload = json.loads(raw_input)
        user_code = payload.get("code", "")
        user_stdin = payload.get("stdin", "")

        result = trace_code(user_code, user_stdin)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "steps": [],
            "final_output": "",
            "error": f"Tracer error: {str(e)}",
            "total_steps": 0,
            "truncated": False,
            "code_lines": [],
        }))
