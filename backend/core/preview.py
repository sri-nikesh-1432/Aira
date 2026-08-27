"""\
☀️ AIRA Live Preview — boots the generated project so the user can
actually open, use, and test it in the browser.
"""
import json
import os
import socket
import subprocess
import sys
import time
import urllib.request
from datetime import datetime
from typing import Optional

PREVIEWS: dict = {}


def _is_windows():
    return os.name == "nt"

def _npm_cmd():
    return "npm.cmd" if _is_windows() else "npm"

def _free_port(lo=8100, hi=8999):
    for port in range(lo, hi):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
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
    if not output_dir:
        return None
    dev = os.path.join(output_dir, "04_Development")
    if not os.path.isdir(dev):
        if os.path.isdir(os.path.join(output_dir, "frontend")):
            return output_dir
        return None
    candidates = []
    for name in sorted(os.listdir(dev)):
        d = os.path.join(dev, name)
        if os.path.isdir(d) and not name.startswith(".") and not name.startswith("_"):
            has_fe = os.path.isdir(os.path.join(d, "frontend"))
            has_be = os.path.isdir(os.path.join(d, "backend"))
            score = (2 if has_fe else 0) + (1 if has_be else 0)
            candidates.append((score, d))
    if candidates:
        candidates.sort(key=lambda x: -x[0])
        return candidates[0][1]
    return None

def _kill_tree(pid):
    if pid is None:
        return
    try:
        if _is_windows():
            subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True, timeout=15)
        else:
            try:
                os.killpg(os.getpgid(pid), 9)
            except Exception:
                os.kill(pid, 9)
    except Exception:
        pass

def _stop_preview_for_project(project_id):
    existing = PREVIEWS.get(project_id)
    if existing:
        for pid in existing.get("pids", []):
            _kill_tree(pid)
        PREVIEWS.pop(project_id, None)

def _log_path(project_dir):
    return os.path.join(project_dir, "..", "..", "_preview.log")

def _spawn_backend(project_dir, port, frontend_port):
    be_dir = os.path.join(project_dir, "backend")
    if not os.path.isdir(be_dir):
        return None
    env = os.environ.copy()
    env["CORS_ORIGINS"] = f"http://localhost:{frontend_port},http://127.0.0.1:{frontend_port}"
    env["GEMINI_API_KEY"] = env.get("GEMINI_API_KEY", "")
    flags = subprocess.CREATE_NO_WINDOW if _is_windows() else 0
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", str(port)],
        cwd=be_dir, env=env,
        stdout=open(_log_path(project_dir), "a", encoding="utf-8", buffering=1),
        stderr=subprocess.STDOUT,
        creationflags=flags,
    )

def _spawn_frontend(project_dir, port, backend_port):
    fe_dir = os.path.join(project_dir, "frontend")
    if not os.path.isdir(fe_dir):
        return None
    env = os.environ.copy()
    env["NEXT_PUBLIC_API_URL"] = f"http://localhost:{backend_port}"
    flags = subprocess.CREATE_NO_WINDOW if _is_windows() else 0
    return subprocess.Popen(
        [_npm_cmd(), "run", "dev", "--", "-p", str(port), "-H", "0.0.0.0"],
        cwd=fe_dir, env=env,
        stdout=open(_log_path(project_dir), "a", encoding="utf-8", buffering=1),
        stderr=subprocess.STDOUT,
        creationflags=flags,
    )

def get_preview(project_id):
    info = PREVIEWS.get(project_id)
    if not info:
        return {"status": "not_started", "available": False, "message": "Preview not started."}
    if info.get("status") == "starting":
        if info.get("frontend_url") and _url_ready(info["frontend_url"], timeout=3):
            info["status"] = "ready"
            info["message"] = "Live preview is ready."
            info["ready_at"] = datetime.utcnow().isoformat()
        elif info.get("install_error"):
            info["status"] = "error"
            info["error"] = info["install_error"]
        elif time.time() - info.get("started_ts", time.time()) > 600:
            info["status"] = "error"
            info["error"] = "Timed out preparing the preview."
    elif info.get("status") == "ready":
        if not _url_ready(info.get("frontend_url", ""), timeout=3):
            if not _url_ready(info.get("frontend_url", ""), timeout=5):
                info["status"] = "stopped"
                info["message"] = "Preview server is no longer reachable."
    return info

def start_preview(project_id, output_dir, gemini_key=""):
    existing = PREVIEWS.get(project_id)
    if existing and existing.get("status") in ("ready", "starting"):
        return get_preview(project_id)

    _stop_preview_for_project(project_id)
    project_dir = _find_generated_project(output_dir)
    if not project_dir:
        info = {"status": "error", "available": False, "error": "No generated project found.", "message": "Run the pipeline first."}
        PREVIEWS[project_id] = info
        return info

    frontend_port = _free_port(3000, 3999)
    backend_port = _free_port(8100, 8999)
    if not frontend_port or not backend_port:
        info = {"status": "error", "available": False, "error": "Could not allocate ports."}
        PREVIEWS[project_id] = info
        return info

    info = {
        "status": "starting", "available": True,
        "project_id": project_id, "project_dir": project_dir,
        "frontend_port": frontend_port, "backend_port": backend_port,
        "frontend_url": f"http://localhost:{frontend_port}",
        "backend_url": f"http://localhost:{backend_port}",
        "message": "Preparing live preview...", "error": None,
        "started_ts": time.time(), "pids": [],
    }
    PREVIEWS[project_id] = info

    try:
        fe_dir = os.path.join(project_dir, "frontend")
        if not os.path.isdir(fe_dir):
            info["status"] = "error"
            info["error"] = "No frontend directory in generated project."
            return info

        # Install frontend deps
        if not os.path.isdir(os.path.join(fe_dir, "node_modules")):
            info["message"] = "Installing frontend dependencies (first time only)..."
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

        # Install backend deps
        be_dir = os.path.join(project_dir, "backend")
        req_file = os.path.join(be_dir, "requirements.txt")
        if os.path.isfile(req_file):
            info["message"] = "Installing backend dependencies..."
            PREVIEWS[project_id] = info
            pip_env = os.environ.copy()
            pip_env["PIP_QUIET"] = "1"
            flags = subprocess.CREATE_NO_WINDOW if _is_windows() else 0
            subprocess.run(
                [sys.executable, "-m", "pip", "install", "-r", req_file, "--quiet"],
                cwd=be_dir, capture_output=True, timeout=300, env=pip_env, creationflags=flags,
            )

        # Spawn backend then frontend
        info["message"] = "Starting backend API..."
        PREVIEWS[project_id] = info
        be_proc = _spawn_backend(project_dir, backend_port, frontend_port)
        if be_proc:
            info["pids"].append(be_proc.pid)

        info["message"] = "Starting frontend (first load compiles)..."
        PREVIEWS[project_id] = info
        fe_proc = _spawn_frontend(project_dir, frontend_port, backend_port)
        if fe_proc:
            info["pids"].append(fe_proc.pid)

        time.sleep(2)
        return get_preview(project_id)
    except Exception as e:
        info["status"] = "error"
        info["error"] = str(e)
        for pid in info.get("pids", []):
            _kill_tree(pid)
        PREVIEWS[project_id] = info
        return info

def stop_preview(project_id):
    info = PREVIEWS.get(project_id)
    if not info:
        return {"status": "not_started", "message": "No preview running."}
    for pid in info.get("pids", []):
        _kill_tree(pid)
    info["status"] = "stopped"
    info["message"] = "Preview stopped."
    return {"status": "stopped", "message": "Preview stopped."}
