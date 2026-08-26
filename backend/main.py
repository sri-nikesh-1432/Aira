"""
☀️ AIRA Core - FastAPI Backend
"I don't solve problems alone. I orchestrate intelligence."
"""
from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sse_starlette.sse import EventSourceResponse
from config import settings
from models import ProjectRequest, AIRAState, Planet, PlanetStatus
from core.orchestrator import run_aira_pipeline, get_aira_graph
import uvicorn, json, os, uuid, asyncio, zipfile, io, tempfile
from datetime import datetime
from typing import Dict, Any, List
import pathlib

app = FastAPI(title="AIRA Core API", version="1.0.0", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Persistence ──────────────────────────────────────────────────────────────
PROJECTS_DB = os.path.join(settings.OUTPUT_DIR, "_projects_db.json")

def _load_projects() -> Dict[str, Any]:
    if os.path.exists(PROJECTS_DB):
        try:
            with open(PROJECTS_DB, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def _save_projects():
    os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
    try:
        with open(PROJECTS_DB, "w", encoding="utf-8") as f:
            json.dump(projects_store, f, indent=2, default=str)
    except Exception:
        pass

# ─── In-memory stores ─────────────────────────────────────────────────────────
projects_store: Dict[str, Any] = _load_projects()
sse_queues: Dict[str, List[asyncio.Queue]] = {}
ws_connections: Dict[str, List[WebSocket]] = {}


def _str_statuses(statuses: dict) -> dict:
    """Normalize planet_statuses keys/values to plain strings (JSON-safe)."""
    out = {}
    for k, v in (statuses or {}).items():
        key = k.value if hasattr(k, "value") else str(k)
        val = v.value if hasattr(v, "value") else str(v)
        out[key] = val
    return out

# ─── Root ─────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"name": "AIRA Core", "tagline": "I don't solve problems alone. I orchestrate intelligence.", "status": "operational", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ─── Projects ─────────────────────────────────────────────────────────────────
@app.post("/api/projects")
async def create_project(request: ProjectRequest, background_tasks: BackgroundTasks):
    project_id = str(uuid.uuid4())
    output_dir = os.path.join(settings.OUTPUT_DIR, project_id)
    os.makedirs(output_dir, exist_ok=True)

    from models import Planet
    projects_store[project_id] = {
        "id": project_id,
        "status": "running",
        "request": request.dict(),
        "created_at": datetime.utcnow().isoformat(),
        "planet_statuses": {p.value: "idle" for p in Planet},
        "messages": [],
        "final_output": None,
        "errors": [],
        "output_dir": output_dir,
    }
    projects_store[project_id]["planet_statuses"]["aira"] = "active"
    sse_queues[project_id] = []
    _save_projects()

    background_tasks.add_task(_run_background, project_id, request, output_dir)

    return {
        "project_id": project_id,
        "status": "running",
        "message": "☀️ AIRA Core initialized. Mission begins.",
        "stream_url": f"/api/projects/{project_id}/stream",
    }

async def _run_background(project_id: str, request: ProjectRequest, output_dir: str):
    async def on_event(event: dict):
        """Called after each planet node completes."""
        ps = event.get("planet_statuses", {})
        msg_text = event.get("message", "")
        planet = event.get("planet", "aira")
        quip = event.get("quip")

        if project_id in projects_store:
            if ps:
                projects_store[project_id]["planet_statuses"].update(
                    _str_statuses(ps)
                )
            if msg_text:
                projects_store[project_id]["messages"].append({
                    "planet": planet,
                    "event": event.get("event", "update"),
                    "message": msg_text,
                    "quip": quip,
                    "timestamp": datetime.utcnow().isoformat(),
                })
            if event.get("event") == "completed" and event.get("final_output"):
                projects_store[project_id]["final_output"] = event["final_output"]
            _save_projects()

        # Push to SSE queues
        sse_payload = {"data": json.dumps(event, default=str)}
        for q in sse_queues.get(project_id, []):
            await q.put(sse_payload)
        await _broadcast_ws(project_id, event)

    try:
        # Emit initial event
        await on_event({
            "event": "started",
            "planet": "aira",
            "message": "☀️ AIRA Core initialized. Waking up all planets...",
            "planet_statuses": {"aira": "active"},
        })

        final_state = await run_aira_pipeline(
            user_request=request.idea,
            msme_theme=request.msme_theme,
            target_audience=request.target_audience,
            tech_preferences=request.tech_preferences,
            competition_name=request.competition_name,
            project_id=project_id,
            output_dir=output_dir,
            on_event=on_event,
        )

        if project_id in projects_store:
            projects_store[project_id].update({
                "status": "completed",
                "planet_statuses": _str_statuses(final_state.planet_statuses),
                "messages": final_state.messages,
                "final_output": final_state.final_output,
                "errors": final_state.errors,
                "completed_at": datetime.utcnow().isoformat(),
                "output_dir": final_state.output_dir,
            })
            _save_projects()

        # Signal stream done
        for q in sse_queues.get(project_id, []):
            await q.put(None)

    except Exception as e:
        if project_id in projects_store:
            projects_store[project_id].update({"status": "failed", "errors": [str(e)]})
            _save_projects()
        await on_event({"event": "error", "planet": "aira", "message": f"Pipeline error: {e}"})
        for q in sse_queues.get(project_id, []):
            await q.put(None)

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str):
    if project_id not in projects_store:
        raise HTTPException(404, "Project not found")
    return projects_store[project_id]

@app.get("/api/projects")
async def list_projects():
    return {
        "projects": [
            {"id": p["id"], "status": p["status"], "created_at": p["created_at"],
             "idea": p["request"].get("idea", "")[:100]}
            for p in sorted(projects_store.values(), key=lambda x: x["created_at"], reverse=True)
        ],
        "total": len(projects_store),
    }

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    if project_id not in projects_store:
        raise HTTPException(404, "Project not found")
    del projects_store[project_id]
    _save_projects()
    return {"deleted": project_id}

# ─── SSE Stream ───────────────────────────────────────────────────────────────
@app.get("/api/projects/{project_id}/stream")
async def stream_project(project_id: str):
    if project_id not in projects_store:
        raise HTTPException(404, "Project not found")

    project = projects_store[project_id]

    async def generator():
        # If already done, replay messages then close
        if project["status"] in ("completed", "failed"):
            for msg in project.get("messages", []):
                yield {"data": json.dumps({
                    "event": msg.get("event", "update"),
                    "planet": msg.get("planet", "aira"),
                    "message": msg.get("message", ""),
                    "quip": msg.get("quip"),
                    "planet_statuses": project.get("planet_statuses"),
                }, default=str)}
            if project["status"] == "completed":
                yield {"data": json.dumps({
                    "event": "completed",
                    "planet": "aira",
                    "message": "Mission complete.",
                    "final_output": project.get("final_output"),
                    "planet_statuses": project.get("planet_statuses"),
                }, default=str)}
            return

        # Register queue for live stream
        q: asyncio.Queue = asyncio.Queue()
        sse_queues.setdefault(project_id, []).append(q)

        # Replay already-accumulated messages
        for msg in project.get("messages", []):
            yield {"data": json.dumps({
                "event": msg.get("event", "update"),
                "planet": msg.get("planet", "aira"),
                "message": msg.get("message", ""),
                "quip": msg.get("quip"),
                "planet_statuses": project.get("planet_statuses"),
            }, default=str)}

        try:
            while True:
                try:
                    item = await asyncio.wait_for(q.get(), timeout=30.0)
                except asyncio.TimeoutError:
                    yield {"data": json.dumps({"event": "ping", "message": ""})}
                    continue

                if item is None:
                    break  # Stream done

                yield item  # item is already {"data": "..."}

                # Check if the data signals completion
                try:
                    parsed = json.loads(item["data"])
                    if parsed.get("event") in ("completed", "error"):
                        break
                except Exception:
                    pass
        finally:
            if q in sse_queues.get(project_id, []):
                sse_queues[project_id].remove(q)

    return EventSourceResponse(generator())

# ─── Files ────────────────────────────────────────────────────────────────────
@app.get("/api/projects/{project_id}/files")
async def list_files(project_id: str):
    if project_id not in projects_store:
        raise HTTPException(404, "Project not found")
    output_dir = projects_store[project_id].get("output_dir", "")
    if not output_dir or not os.path.exists(output_dir):
        return {"files": [], "tree": []}

    files = []
    for root, dirs, fnames in os.walk(output_dir):
        # Skip __pycache__ and .git
        dirs[:] = [d for d in dirs if d not in ("__pycache__", ".git", "node_modules", ".next")]
        for fname in fnames:
            full = os.path.join(root, fname)
            rel = os.path.relpath(full, output_dir).replace("\\", "/")
            files.append({
                "name": fname,
                "path": rel,
                "size": os.path.getsize(full),
                "ext": pathlib.Path(fname).suffix,
            })

    return {"files": files, "total": len(files)}

@app.get("/api/projects/{project_id}/file")
async def read_file(project_id: str, path: str):
    if project_id not in projects_store:
        raise HTTPException(404, "Project not found")
    output_dir = projects_store[project_id].get("output_dir", "")
    if not output_dir:
        raise HTTPException(404, "No output dir")

    # Sanitize path traversal
    full = os.path.normpath(os.path.join(output_dir, path))
    if not full.startswith(os.path.normpath(output_dir)):
        raise HTTPException(400, "Invalid path")

    if not os.path.exists(full) or not os.path.isfile(full):
        raise HTTPException(404, "File not found")

    ext = pathlib.Path(full).suffix.lower()
    # Return binary for non-text files
    binary_exts = {".png", ".jpg", ".jpeg", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".svg"}
    if ext in binary_exts:
        return FileResponse(full)

    try:
        with open(full, "r", encoding="utf-8") as f:
            content = f.read()
        return {"path": path, "content": content, "ext": ext}
    except UnicodeDecodeError:
        return FileResponse(full)

@app.get("/api/projects/{project_id}/download/{filename:path}")
async def download_file(project_id: str, filename: str):
    if project_id not in projects_store:
        raise HTTPException(404, "Project not found")
    output_dir = projects_store[project_id].get("output_dir", "")
    if not output_dir:
        raise HTTPException(404, "No output dir")
    file_path = os.path.join(output_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(404, "File not found")
    return FileResponse(file_path, filename=filename)


# ─── ZIP Download ─────────────────────────────────────────────────────────────
SKIP_IN_ZIP = {
    "__pycache__", ".git", "node_modules", ".next", ".turbo",
    ".cache", "dist", "build", "*.pyc", ".DS_Store", "_preview.log",
}

def _should_skip(path: str) -> bool:
    """Returns True if the path component should be excluded from the ZIP."""
    parts = pathlib.Path(path).parts
    for part in parts:
        if part in SKIP_IN_ZIP:
            return True
        if part.endswith(".pyc"):
            return True
    return False


@app.get("/api/projects/{project_id}/download-zip")
async def download_project_zip(project_id: str):
    """
    Creates and streams a ZIP archive of EVERYTHING generated for the project:
    research, architecture, design, source code, deployment configs, and docs.
    """
    if project_id not in projects_store:
        raise HTTPException(404, "Project not found")

    project = projects_store[project_id]
    # Allow download even if still running (partial output)
    output_dir = project.get("output_dir", "")
    if not output_dir or not os.path.exists(output_dir):
        raise HTTPException(404, "No output directory found for this project")

    # Derive a nice archive name
    project_title = (
        (project.get("final_output") or {}).get("project_title")
        or project.get("request", {}).get("idea", "aira-project")[:40]
    )
    safe_name = "".join(c if c.isalnum() or c in "-_" else "-" for c in project_title.lower().replace(" ", "-"))
    zip_filename = f"AIRA-{safe_name}.zip"

    # Build ZIP from the ENTIRE output directory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for root, dirs, files in os.walk(output_dir):
            dirs[:] = [d for d in dirs if not _should_skip(d)]
            for fname in files:
                full_path = os.path.join(root, fname)
                rel_path = os.path.relpath(full_path, output_dir).replace("\\", "/")
                if _should_skip(rel_path):
                    continue
                try:
                    zf.write(full_path, rel_path)
                except Exception:
                    pass

    zip_buffer.seek(0)
    zip_bytes = zip_buffer.read()

    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{zip_filename}"',
            "Content-Length": str(len(zip_bytes)),
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


# ─── Upload ───────────────────────────────────────────────────────────────────
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename or "file.bin")[1]
    save_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{ext}")
    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)
    return {"file_id": file_id, "filename": file.filename, "size": len(content)}

# ─── Planets ─────────────────────────────────────────────────────────────────
@app.get("/api/planets")
async def get_planets():
    return {"planets": [
        {"id": "aira",    "name": "AIRA",    "symbol": "☀️", "role": "Central Intelligence",       "motto": "I don't solve problems alone. I orchestrate intelligence.",              "color": "#FFD700"},
        {"id": "mercury", "name": "Mercury", "symbol": "☿",  "role": "Research & Intelligence",    "motto": "Before innovation comes understanding.",                              "color": "#B5A9A9"},
        {"id": "mars",    "name": "Mars",    "symbol": "♂",  "role": "Architecture & Planning",    "motto": "Don't start building until the architecture can survive success.",      "color": "#CF4B2B"},
        {"id": "venus",   "name": "Venus",   "symbol": "♀",  "role": "UI/UX & Experience",         "motto": "A product is successful when people enjoy using it.",                  "color": "#E8B86D"},
        {"id": "earth",   "name": "Earth",   "symbol": "🌍", "role": "Development & Engineering",  "motto": "Innovation becomes reality through engineering.",                    "color": "#4B9CD3"},
        {"id": "jupiter", "name": "Jupiter", "symbol": "♃",  "role": "Business Strategy",          "motto": "Innovation creates products. Business creates impact.",               "color": "#C8A951"},
        {"id": "saturn",  "name": "Saturn",  "symbol": "♄",  "role": "Documentation",              "motto": "If it isn't documented, it doesn't exist.",                          "color": "#A89070"},
        {"id": "neptune", "name": "Neptune", "symbol": "♆",  "role": "Quality Assurance",          "motto": "Trust is earned through testing.",                                   "color": "#4B7BE8"},
        {"id": "uranus",  "name": "Uranus",  "symbol": "♅",  "role": "Meta-Evolution",             "motto": "Intelligence is not what you know today.",                           "color": "#7EC8C8"},
        {"id": "pluto",   "name": "Pluto",   "symbol": "🪐", "role": "Deployment & Operations",    "motto": "Deployment is not the finish line. It is the beginning.",            "color": "#9B8EAE"},
    ]}

# ─── WebSocket ───────────────────────────────────────────────────────────────
@app.websocket("/ws/{project_id}")
async def ws_endpoint(websocket: WebSocket, project_id: str):
    await websocket.accept()
    ws_connections.setdefault(project_id, []).append(websocket)
    if project_id in projects_store:
        await websocket.send_json(projects_store[project_id])
    try:
        while True:
            await websocket.receive_text()
            await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        if websocket in ws_connections.get(project_id, []):
            ws_connections[project_id].remove(websocket)

async def _broadcast_ws(project_id: str, message: dict):
    dead = []
    for ws in ws_connections.get(project_id, []):
        try:
            await ws.send_json(message)
        except Exception:
            dead.append(ws)
    for ws in dead:
        ws_connections[project_id].remove(ws)

# ─── Live Preview (boot the generated app) ────────────────────────────────────────────────────────

from core.preview import start_preview as _start_preview, get_preview as _get_preview, stop_preview as _stop_preview

@app.post("/api/projects/{project_id}/preview/start")
async def preview_start(project_id: str):
    """Boot the generated frontend + backend so the user can test the real app."""
    if project_id not in projects_store:
        raise HTTPException(404, "Project not found")
    project = projects_store[project_id]
    return await asyncio.to_thread(
        _start_preview, project_id, project.get("output_dir", ""), settings.GEMINI_API_KEY
    )

@app.get("/api/projects/{project_id}/preview")
async def preview_status(project_id: str):
    if project_id not in projects_store:
        raise HTTPException(404, "Project not found")
    return await asyncio.to_thread(_get_preview, project_id)

@app.post("/api/projects/{project_id}/preview/stop")
async def preview_stop(project_id: str):
    if project_id not in projects_store:
        raise HTTPException(404, "Project not found")
    return await asyncio.to_thread(_stop_preview, project_id)

@app.get("/api/projects/{project_id}/preview-info")
async def get_preview_info(project_id: str):
    """
    Returns info about the generated project so the frontend can show
    a live preview panel with setup instructions and file structure.
    """
    if project_id not in projects_store:
        raise HTTPException(404, "Project not found")

    project = projects_store[project_id]
    output_dir = project.get("output_dir", "")

    if not output_dir or not os.path.exists(output_dir):
        return {"available": False, "message": "No output yet"}

    # Find the generated project folder inside 04_Development
    dev_dir = os.path.join(output_dir, "04_Development")
    project_folder = None
    project_name = None
    if os.path.isdir(dev_dir):
        subdirs = [d for d in os.listdir(dev_dir)
                   if os.path.isdir(os.path.join(dev_dir, d))
                   and d not in ("__pycache__", ".git")]
        if subdirs:
            project_folder = os.path.join(dev_dir, subdirs[0])
            project_name = subdirs[0]

    has_frontend = project_folder and os.path.isdir(os.path.join(project_folder, "frontend"))
    has_backend = project_folder and os.path.isdir(os.path.join(project_folder, "backend"))
    has_docker = project_folder and os.path.isfile(os.path.join(project_folder, "docker-compose.yml"))

    # Count files
    total_files = 0
    if project_folder and os.path.isdir(project_folder):
        for _, _, fnames in os.walk(project_folder):
            total_files += len(fnames)

    readme_content = ""
    if project_folder:
        readme_path = os.path.join(project_folder, "README.md")
        if os.path.isfile(readme_path):
            with open(readme_path, "r", encoding="utf-8") as f:
                readme_content = f.read()[:3000]

    return {
        "available": True,
        "project_name": project_name,
        "has_frontend": has_frontend,
        "has_backend": has_backend,
        "has_docker": has_docker,
        "total_files": total_files,
        "readme": readme_content,
        "setup_commands": {
            "docker": [
                f"# Download the ZIP first, then:",
                f"cd {project_name or 'your-project'}",
                "cp backend/.env.example backend/.env",
                "# Add your GEMINI_API_KEY to backend/.env",
                "docker-compose up --build",
                "# Frontend: http://localhost:3000",
                "# Backend:  http://localhost:8000",
            ],
            "manual": [
                f"cd {project_name or 'your-project'}",
                "# Backend:",
                "cd backend && pip install -r requirements.txt",
                "cp .env.example .env  # add GEMINI_API_KEY",
                "uvicorn main:app --reload --port 8000",
                "# Frontend (new terminal):",
                "cd frontend && npm install && npm run dev",
                "# Open http://localhost:3000",
            ]
        },
        "tech_stack": (
            (project.get("final_output") or {})
            .get("planet_outputs", {})
            .get("mars", {})
            .get("architecture", {})
            .get("tech_stack", {})
        )
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
