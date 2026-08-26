"""
🪐 AIRA Live Preview — boots the generated project so the user can
actually open, use, and test it in the browser.

Flow:
  start_preview(project)  -> spawns generated backend (uvicorn) + frontend (next dev)
  get_preview(project_id) -> status / urls / progress
  stop_preview(project_id)-> kills both processes

The preview runs the generated code as-is. Frontend env var
NEXT_PUBLIC_API_URL is pointed at the generated backend so the app is
fully functional inside the Live Review iframe.
"""
import json
import os
import shutil
import socket
import subprocess
import sys
import time
import urllib.request
from datetime import datetime
from typing import Optional

PREVIEWS: dict = {}  # project_id -> {status, ports, pids, urls, message, error, started_at}


def _is_windows() -> bool:
    return os.name == "nt"


def _npm_cmd() -> str:
    return "npm.cmd" if _is_windows() else "npm"


def _free_port(lo: int = 8100, hi: int = 8999) -> int:
    for port in range(lo, hi):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    return 0


def _url_ready(url: str, timeout: float = 5.0) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            return resp.status < 500
    except Exception:
        return False


def _find_generated_project(output_dir: str) -> Optional[str]:
    """Return the path to the generated project folder (04_Development/<name>)."""
    if not output_dir:
        return None
    dev = os.path.join(output_dir, "04_Development")
    if not os.path.isdir(dev):
        return None
    for name in sorted(os.listdir(dev)):
        d = os.path.join(dev, name)
        if os.path.isdir(d) and not name.startswith("."):
            return d
    return None


def _kill_tree(pid: int):
    """Kill a process and its children, cross-platform."""
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
        try:
            import signal
            os.kill(pid, signal.SIGKILL)
        except Exception:
            pass


def _log_path(project_dir: str) -> str:
    # project_dir = <output>/04_Development/<name>  ->  log at <output>/_preview.log
    return os.path.join(project_dir, "..", "..", "_preview.log")


def _spawn_backend(project_dir: str, port: int, gemini_key: str, frontend_port: int, log_file) -> subprocess.Popen:
    """Spawn the generated FastAPI backend using the current Python environment."""
    be_dir = os.path.join(project_dir, "backend")
    env = os.environ.copy()
    env["GEMINI_API_KEY"] = gemini_key or env.get("GEMINI_API_KEY", "")
    env["CORS_ORIGINS"] = f"http://localhost:{frontend_port},http://127.0.0.1:{frontend_port}"
    env["DEBUG"] = "false"
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", str(port)],
        cwd=be_dir,
        env=env,
        stdout=log_file,
        stderr=subprocess.STDOUT,
        creationflags=subprocess.CREATE_NO_WINDOW if _is_windows() else 0,
    )


def _spawn_frontend(project_dir: str, port: int, backend_port: int, log_file) -> subprocess.Popen:
    """Spawn the generated Next.js dev server."""
    fe_dir = os.path.join(project_dir, "frontend")
    env = os.environ.copy()
    env["NEXT_PUBLIC_API_URL"] = f"http://localhost:{backend_port}"
    cmd = [_npm_cmd(), "run", "dev", "--", "-p", str(port), "-H", "0.0.0.0"]
    return subprocess.Popen(
        cmd,
        cwd=fe_dir,
        env=env,
        stdout=log_file,
        stderr=subprocess.STDOUT,
        creationflags=subprocess.CREATE_NO_WINDOW if _is_windows() else 0,
    )


def get_preview(project_id: str) -> dict:
    info = PREVIEWS.get(project_id)
    if not info:
        return {"status": "not_started", "available": False, "message": "Preview not started."}
    # Refresh readiness
    if info.get("status") == "starting":
        if info.get("frontend_url") and _url_ready(info["frontend_url"], timeout=3):
            info["status"] = "ready"
            info["message"] = "Live preview is ready."
        elif info.get("install_error"):
            info["status"] = "error"
            info["error"] = info["install_error"]
        elif time.time() - info.get("started_ts", time.time()) > 420:
            info["status"] = "error"
            info["error"] = "Timed out while preparing the preview."
    elif info.get("status") == "ready":
        if not _url_ready(info.get("frontend_url", ""), timeout=3):
            info["status"] = "stopped"
            info["message"] = "Preview server is no longer reachable."
    return info


def start_preview(project_id: str, output_dir: str, gemini_key: str = "") -> dict:
    """Start (or return existing) live preview for a project."""
    existing = PREVIEWS.get(project_id)
    if existing and existing.get("status") in ("ready", "starting"):
        return get_preview(project_id)

    project_dir = _find_generated_project(output_dir)
    if not project_dir:
        info = {"status": "error", "available": False,
                "error": "No generated project found. Run the pipeline first.",
                "message": "Nothing to preview yet."}
        PREVIEWS[project_id] = info
        return info

    frontend_port = _free_port(5100, 5999)
    backend_port = _free_port(8100, 8999)
    if not frontend_port or not backend_port:
        info = {"status": "error", "available": False, "error": "Could not allocate preview ports."}
        PREVIEWS[project_id] = info
        return info

    info = {
        "status": "starting",
        "available": True,
        "project_dir": project_dir,
        "frontend_port": frontend_port,
        "backend_port": backend_port,
        "frontend_url": f"http://localhost:{frontend_port}",
        "backend_url": f"http://localhost:{backend_port}",
        "message": "Preparing live preview...",
        "error": None,
        "started_ts": time.time(),
        "pids": [],
    }
    PREVIEWS[project_id] = info

    try:
        fe_dir = os.path.join(project_dir, "frontend")
        if not os.path.isdir(os.path.join(fe_dir, "node_modules")):
            info["message"] = "Installing frontend dependencies (first time only)..."
            install = subprocess.run(
                [_npm_cmd(), "install", "--no-audit", "--no-fund", "--loglevel=error"],
                cwd=fe_dir, capture_output=True, timeout=600,
                creationflags=subprocess.CREATE_NO_WINDOW if _is_windows() else 0,
            )
            if install.returncode != 0:
                info["status"] = "error"
                info["error"] = "npm install failed: " + (install.stdout or install.stderr or b"").decode(errors="ignore")[-800:]
                info["install_error"] = info["error"]
                return info

        # Spawn backend first (fast), then frontend (slow to compile first page)
        log_file = open(_log_path(project_dir), "a", encoding="utf-8", buffering=1)
        info["message"] = "Starting backend API..."
        be_proc = _spawn_backend(project_dir, backend_port, gemini_key, frontend_port, log_file)
        info["pids"].append(be_proc.pid)

        info["message"] = "Starting frontend (first page load compiles)..."
        fe_proc = _spawn_frontend(project_dir, frontend_port, backend_port, log_file)
        info["pids"].append(fe_proc.pid)

        # Give them a moment, then report status (readiness polled on GET)
        time.sleep(2)
        return get_preview(project_id)
    except Exception as e:
        info["status"] = "error"
        info["error"] = str(e)
        for pid in info.get("pids", []):
            _kill_tree(pid)
        return info


def stop_preview(project_id: str) -> dict:
    info = PREVIEWS.get(project_id)
    if not info:
        return {"status": "not_started", "message": "No preview running."}
    for pid in info.get("pids", []):
        _kill_tree(pid)
    info["status"] = "stopped"
    info["message"] = "Preview stopped."
    return {"status": "stopped", "message": "Preview stopped."}
