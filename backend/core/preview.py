"""
☀️ AIRA Live Preview — boots each generated project independently.
Each project gets its OWN frontend + backend on unique ports.
No cross-contamination between projects.
"""
import json
import os
import re
import socket
import subprocess
import sys
import time
import urllib.request
from datetime import datetime

PREVIEWS: dict = {}


def _is_windows():
    return os.name == "nt"

def _npm_cmd():
    return "npm.cmd" if _is_windows() else "npm"

def _free_port(lo=3000, hi=3999):
    """Find a free port in range."""
    for port in range(lo, hi):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(("127.0.0.1", port))
                return port
        except OSError:
            continue
    return 0

def _url_ready(url, timeout=3.0):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            return resp.status < 500
    except Exception:
        return False

def _find_generated_project(output_dir):
    """Find the actual generated project directory (with frontend/ and backend/)."""
    if not output_dir or not os.path.isdir(output_dir):
        return None

    # Check 04_Development first (standard structure)
    dev = os.path.join(output_dir, "04_Development")
    if os.path.isdir(dev):
        candidates = []
        for name in sorted(os.listdir(dev)):
            d = os.path.join(dev, name)
            if os.path.isdir(d) and not name.startswith(".") and not name.startswith("_"):
                has_fe = os.path.isdir(os.path.join(d, "frontend"))
                has_be = os.path.isdir(os.path.join(d, "backend"))
                score = (2 if has_fe else 0) + (1 if has_be else 0)
                if score > 0:
                    candidates.append((score, d))
        if candidates:
            candidates.sort(key=lambda x: -x[0])
            return candidates[0][1]

    # Fallback: check if output_dir itself has frontend/
    if os.path.isdir(os.path.join(output_dir, "frontend")):
        return output_dir

    return None

def _kill_tree(pid):
    if pid is None:
        return
    try:
        if _is_windows():
            subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"],
                         capture_output=True, timeout=15)
        else:
            try:
                os.killpg(os.getpgid(pid), 9)
            except Exception:
                os.kill(pid, 9)
    except Exception:
        pass

def _kill_orphaned_previews():
    """
    Kill ALL orphaned preview processes on preview ports (3000-3999, 8100-8999).
    This prevents old previews from contaminating new ones.
    """
    if not _is_windows():
        return
    try:
        # Find node processes on ports 3000-3999 (frontend previews)
        result = subprocess.run(
            ["netstat", "-ano"], capture_output=True, timeout=10
        )
        lines = result.stdout.decode(errors="ignore").split("\n")
        pids_to_kill = set()

        for line in lines:
            # Match LISTENING on preview ports
            m = re.search(r':(3\d{3}|81\d{2})\s+.*?LISTENING\s+(\d+)', line)
            if m:
                port = int(m.group(1))
                pid = int(m.group(2))
                # Only kill if it's NOT our main backend (8000) or main frontend (5174)
                if port != 8000 and port != 5174 and pid > 0:
                    pids_to_kill.add(pid)

        for pid in pids_to_kill:
            _kill_tree(pid)

        if pids_to_kill:
            time.sleep(1)
    except Exception:
        pass

def _stop_preview_for_project(project_id):
    existing = PREVIEWS.get(project_id)
    if existing:
        for pid in existing.get("pids", []):
            _kill_tree(pid)
        time.sleep(0.5)
        PREVIEWS.pop(project_id, None)

def _stop_all_previews():
    """Stop ALL running previews — clean slate."""
    for pid in list(PREVIEWS.keys()):
        _stop_preview_for_project(pid)
    # Also kill orphans
    _kill_orphaned_previews()

def _log_path(project_dir, name="preview"):
    log_dir = os.path.join(project_dir, "..", "..")
    os.makedirs(log_dir, exist_ok=True)
    return os.path.join(log_dir, f"_{name}.log")

def _spawn_backend(project_dir, port, frontend_port):
    """Start the generated backend (FastAPI) on its own port."""
    be_dir = os.path.join(project_dir, "backend")
    if not os.path.isdir(be_dir):
        return None

    env = os.environ.copy()
    env["CORS_ORIGINS"] = f"http://localhost:{frontend_port},http://127.0.0.1:{frontend_port}"
    env["PYTHONPATH"] = be_dir
    flags = subprocess.CREATE_NO_WINDOW if _is_windows() else 0

    log_file = open(_log_path(project_dir, "backend"), "a", encoding="utf-8", buffering=1)
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", str(port)],
        cwd=be_dir, env=env,
        stdout=log_file, stderr=subprocess.STDOUT,
        creationflags=flags,
    )

def _spawn_frontend(project_dir, port, backend_port):
    """Start the generated frontend (Next.js) on its own port."""
    fe_dir = os.path.join(project_dir, "frontend")
    if not os.path.isdir(fe_dir):
        return None

    env = os.environ.copy()
    env["NEXT_PUBLIC_API_URL"] = f"http://localhost:{backend_port}"
    env["PORT"] = str(port)
    flags = subprocess.CREATE_NO_WINDOW if _is_windows() else 0

    log_file = open(_log_path(project_dir, "frontend"), "a", encoding="utf-8", buffering=1)
    return subprocess.Popen(
        [_npm_cmd(), "run", "dev", "--", "-p", str(port), "-H", "0.0.0.0"],
        cwd=fe_dir, env=env,
        stdout=log_file, stderr=subprocess.STDOUT,
        creationflags=flags,
    )

def get_preview(project_id):
    """Get current preview status, updating state as needed."""
    info = PREVIEWS.get(project_id)
    if not info:
        return {"status": "not_started", "available": False, "message": "Preview not started."}

    if info.get("status") == "starting":
        fe_url = info.get("frontend_url", "")
        if fe_url and _url_ready(fe_url, timeout=3):
            info["status"] = "ready"
            info["message"] = "Live preview is ready!"
            info["ready_at"] = datetime.utcnow().isoformat()
        elif info.get("install_error"):
            info["status"] = "error"
            info["error"] = info["install_error"]
        elif time.time() - info.get("started_ts", time.time()) > 600:
            info["status"] = "error"
            info["error"] = "Timed out preparing the preview (10 min limit)."

    elif info.get("status") == "ready":
        fe_url = info.get("frontend_url", "")
        if fe_url and not _url_ready(fe_url, timeout=3):
            if not _url_ready(fe_url, timeout=5):
                info["status"] = "stopped"
                info["message"] = "Preview server is no longer reachable."

    return info

def start_preview(project_id, output_dir, gemini_key=""):
    """Boot a generated project's frontend + backend on unique ports."""
    existing = PREVIEWS.get(project_id)
    if existing and existing.get("status") in ("ready", "starting"):
        return get_preview(project_id)

    # Kill ALL orphaned previews first — clean slate
    _kill_orphaned_previews()
    _stop_preview_for_project(project_id)

    project_dir = _find_generated_project(output_dir)
    if not project_dir:
        info = {
            "status": "error", "available": False,
            "error": "No generated project found. Run the pipeline first.",
            "message": "No generated project with frontend/backend."
        }
        PREVIEWS[project_id] = info
        return info

    fe_dir = os.path.join(project_dir, "frontend")
    be_dir = os.path.join(project_dir, "backend")

    has_frontend = os.path.isdir(fe_dir) and os.path.isfile(os.path.join(fe_dir, "package.json"))
    has_backend = os.path.isdir(be_dir) and os.path.isfile(os.path.join(be_dir, "main.py"))

    if not has_frontend:
        info = {"status": "error", "available": False,
                "error": "No frontend directory with package.json found.",
                "message": "Generated project has no frontend."}
        PREVIEWS[project_id] = info
        return info

    # Allocate unique ports
    frontend_port = _free_port(3000, 3999)
    backend_port = _free_port(8100, 8999) if has_backend else 0

    if not frontend_port:
        info = {"status": "error", "available": False, "error": "Could not allocate a free port for frontend."}
        PREVIEWS[project_id] = info
        return info

    project_name = os.path.basename(project_dir)

    info = {
        "status": "starting", "available": True,
        "project_id": project_id, "project_dir": project_dir,
        "project_name": project_name,
        "frontend_port": frontend_port, "backend_port": backend_port,
        "frontend_url": f"http://localhost:{frontend_port}",
        "backend_url": f"http://localhost:{backend_port}" if backend_port else None,
        "message": f"Preparing preview for: {project_name}",
        "error": None,
        "started_ts": time.time(), "pids": [],
        "has_frontend": has_frontend, "has_backend": has_backend,
    }
    PREVIEWS[project_id] = info

    try:
        # Step 1: Install frontend deps (only if node_modules doesn't exist)
        if not os.path.isdir(os.path.join(fe_dir, "node_modules")):
            info["message"] = "Installing frontend dependencies (first time)..."
            PREVIEWS[project_id] = info
            flags = subprocess.CREATE_NO_WINDOW if _is_windows() else 0
            install = subprocess.run(
                [_npm_cmd(), "install", "--no-audit", "--no-fund", "--loglevel=error"],
                cwd=fe_dir, capture_output=True, timeout=600, creationflags=flags,
            )
            if install.returncode != 0:
                err = (install.stdout or install.stderr or b"").decode(errors="ignore")[-800:]
                info["status"] = "error"
                info["error"] = "npm install failed: " + err
                info["install_error"] = info["error"]
                PREVIEWS[project_id] = info
                return info

        # Step 2: Install backend deps (only if needed)
        if has_backend:
            req_file = os.path.join(be_dir, "requirements.txt")
            site_pkgs = os.path.join(be_dir, ".aira_deps_installed")
            if os.path.isfile(req_file) and not os.path.exists(site_pkgs):
                info["message"] = "Installing backend dependencies..."
                PREVIEWS[project_id] = info
                pip_env = os.environ.copy()
                pip_env["PIP_QUIET"] = "1"
                flags = subprocess.CREATE_NO_WINDOW if _is_windows() else 0
                result = subprocess.run(
                    [sys.executable, "-m", "pip", "install", "-r", req_file, "--quiet"],
                    cwd=be_dir, capture_output=True, timeout=300, env=pip_env, creationflags=flags,
                )
                if result.returncode == 0:
                    open(site_pkgs, "w").close()

        # Step 3: Start backend
        if has_backend:
            info["message"] = "Starting backend API..."
            PREVIEWS[project_id] = info
            be_proc = _spawn_backend(project_dir, backend_port, frontend_port)
            if be_proc:
                info["pids"].append(be_proc.pid)
            time.sleep(2)

        # Step 4: Start frontend
        info["message"] = "Starting frontend (first compile takes a moment)..."
        PREVIEWS[project_id] = info
        fe_proc = _spawn_frontend(project_dir, frontend_port, backend_port or 8001)
        if fe_proc:
            info["pids"].append(fe_proc.pid)

        time.sleep(3)
        return get_preview(project_id)

    except Exception as e:
        info["status"] = "error"
        info["error"] = str(e)
        for pid in info.get("pids", []):
            _kill_tree(pid)
        PREVIEWS[project_id] = info
        return info

def stop_preview(project_id):
    """Stop all processes for a project preview."""
    info = PREVIEWS.get(project_id)
    if not info:
        return {"status": "not_started", "message": "No preview running."}

    for pid in info.get("pids", []):
        _kill_tree(pid)

    info["status"] = "stopped"
    info["message"] = "Preview stopped."
    info["pids"] = []
    return {"status": "stopped", "message": "Preview stopped."}

def stop_all_previews():
    """Emergency: stop all preview processes."""
    _stop_all_previews()
    return {"status": "stopped", "message": "All previews stopped."}
