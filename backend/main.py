"""
☀️ AIRA Core - FastAPI Backend
"I don't solve problems alone. I orchestrate intelligence."
"""
from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sse_starlette.sse import EventSourceResponse
from config import settings
from models import ProjectRequest, AIRAState, Planet, PlanetStatus
from core.orchestrator import run_aira_pipeline, get_aira_graph
from deps import require_auth, get_current_user
from database import (
    init_db, create_project as db_create_project, get_user_projects,
    get_project as db_get_project, get_project_by_id_only,
    update_project as db_update_project, update_project_internal,
    delete_project as db_delete_project,
)
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

# ─── Auth routes ──────────────────────────────────────────────────────────────
from auth_routes import router as auth_router
app.include_router(auth_router)

@app.on_event("startup")
async def startup():
    await init_db()

# ─── In-memory runtime cache for active projects + SSE queues ─────────────────
# Projects are persisted in SQLite. This dict caches active project state
# for fast SSE/WS delivery during pipeline execution.
projects_store: Dict[str, Any] = {}
sse_queues: Dict[str, List[asyncio.Queue]] = {}
ws_connections: Dict[str, List[WebSocket]] = {}

# Map project_id -> user_id for SSE/WS auth
_project_user_map: Dict[str, str] = {}

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
async def create_project(request: ProjectRequest, background_tasks: BackgroundTasks,
                         user: dict = Depends(require_auth)):
    user_id = user["id"]
    project_id = str(uuid.uuid4())
    output_dir = os.path.join(settings.OUTPUT_DIR, project_id)
    os.makedirs(output_dir, exist_ok=True)

    from models import Planet
    planet_statuses = {p.value: "idle" for p in Planet}
    planet_statuses["aira"] = "active"

    # Persist to database
    await db_create_project(project_id, user_id, request.idea, request.dict())

    # Cache in memory for runtime
    projects_store[project_id] = {
        "id": project_id,
        "user_id": user_id,
        "status": "running",
        "request": request.dict(),
        "idea": request.idea,
        "created_at": datetime.utcnow().isoformat(),
        "planet_statuses": planet_statuses,
        "messages": [],
        "final_output": None,
        "errors": [],
        "output_dir": output_dir,
    }
    sse_queues[project_id] = []
    _project_user_map[project_id] = user_id

    background_tasks.add_task(_run_background, project_id, request, output_dir, user_id)

    return {
        "project_id": project_id,
        "status": "running",
        "message": "☀️ AIRA Core initialized. Mission begins.",
        "stream_url": f"/api/projects/{project_id}/stream",
    }

async def _run_background(project_id: str, request: ProjectRequest, output_dir: str, user_id: str):
    async def on_event(event: dict):
        """Called after each planet node completes."""
        ps = event.get("planet_statuses", {})
        msg_text = event.get("message", "")
        planet = event.get("planet", "aira")
        quip = event.get("quip")

        if project_id in projects_store:
            if ps:
                projects_store[project_id]["planet_statuses"].update(_str_statuses(ps))
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

            # Sync to database
            try:
                await db_update_project_internal(
                    project_id,
                    planet_statuses_json=projects_store[project_id]["planet_statuses"],
                    messages_json=projects_store[project_id]["messages"],
                    final_output_json=projects_store[project_id].get("final_output"),
                )
            except Exception:
                pass

        # Push to SSE queues
        sse_payload = {"data": json.dumps(event, default=str)}
        for q in sse_queues.get(project_id, []):
            await q.put(sse_payload)
        await _broadcast_ws(project_id, event)

    try:
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

        # Final DB sync
        try:
            await db_update_project_internal(
                project_id,
                status="completed",
                planet_statuses_json=projects_store[project_id]["planet_statuses"],
                messages_json=projects_store[project_id]["messages"],
                final_output_json=projects_store[project_id].get("final_output"),
                errors_json=projects_store[project_id].get("errors", []),
                output_dir=projects_store[project_id].get("output_dir", ""),
                completed_at=datetime.utcnow().isoformat(),
            )
        except Exception:
            pass

        for q in sse_queues.get(project_id, []):
            await q.put(None)

    except Exception as e:
        if project_id in projects_store:
            projects_store[project_id].update({"status": "failed", "errors": [str(e)]})
        try:
            await db_update_project_internal(project_id, status="failed", errors_json=[str(e)])
        except Exception:
            pass
        await on_event({"event": "error", "planet": "aira", "message": f"Pipeline error: {e}"})
        for q in sse_queues.get(project_id, []):
            await q.put(None)

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str, user: dict = Depends(require_auth)):
    user_id = user["id"]
    # Check in-memory cache first (active projects)
    if project_id in projects_store and projects_store[project_id].get("user_id") == user_id:
        return projects_store[project_id]
    # Fall back to database
    project = await db_get_project(project_id, user_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project

@app.get("/api/projects")
async def list_projects(user: dict = Depends(require_auth)):
    user_id = user["id"]
    projects = await get_user_projects(user_id)
    return {
        "projects": [
            {
                "id": p["id"],
                "status": p["status"],
                "created_at": p["created_at"],
                "idea": (p.get("idea") or "")[:100],
            }
            for p in projects
        ],
        "total": len(projects),
    }

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str, user: dict = Depends(require_auth)):
    user_id = user["id"]
    deleted = await db_delete_project(project_id, user_id)
    if not deleted:
        raise HTTPException(404, "Project not found")
    # Clean up runtime cache
    projects_store.pop(project_id, None)
    sse_queues.pop(project_id, None)
    _project_user_map.pop(project_id, None)
    return {"deleted": project_id}

# ─── SSE Stream ───────────────────────────────────────────────────────────────
@app.get("/api/projects/{project_id}/stream")
async def stream_project(project_id: str, user: dict = Depends(require_auth)):
    user_id = user["id"]
    # Verify ownership
    project = None
    if project_id in projects_store and projects_store[project_id].get("user_id") == user_id:
        project = projects_store[project_id]
    else:
        project = await db_get_project(project_id, user_id)
    if not project:
        raise HTTPException(404, "Project not found")

    async def generator():
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

        q: asyncio.Queue = asyncio.Queue()
        sse_queues.setdefault(project_id, []).append(q)

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
                    break
                yield item
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
async def list_files(project_id: str, user: dict = Depends(require_auth)):
    user_id = user["id"]
    # Verify ownership
    project = None
    if project_id in projects_store and projects_store[project_id].get("user_id") == user_id:
        project = projects_store[project_id]
    else:
        project = await db_get_project(project_id, user_id)
    if not project:
        raise HTTPException(404, "Project not found")

    output_dir = project.get("output_dir", "")
    if not output_dir or not os.path.exists(output_dir):
        return {"files": [], "tree": []}

    files = []
    for root, dirs, fnames in os.walk(output_dir):
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
async def read_file(project_id: str, path: str, user: dict = Depends(require_auth)):
    user_id = user["id"]
    project = None
    if project_id in projects_store and projects_store[project_id].get("user_id") == user_id:
        project = projects_store[project_id]
    else:
        project = await db_get_project(project_id, user_id)
    if not project:
        raise HTTPException(404, "Project not found")

    output_dir = project.get("output_dir", "")
    if not output_dir:
        raise HTTPException(404, "No output dir")

    full = os.path.normpath(os.path.join(output_dir, path))
    if not full.startswith(os.path.normpath(output_dir)):
        raise HTTPException(400, "Invalid path")
    if not os.path.exists(full) or not os.path.isfile(full):
        raise HTTPException(404, "File not found")

    ext = pathlib.Path(full).suffix.lower()
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
async def download_file(project_id: str, filename: str, user: dict = Depends(require_auth)):
    user_id = user["id"]
    project = None
    if project_id in projects_store and projects_store[project_id].get("user_id") == user_id:
        project = projects_store[project_id]
    else:
        project = await db_get_project(project_id, user_id)
    if not project:
        raise HTTPException(404, "Project not found")

    output_dir = project.get("output_dir", "")
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
    parts = pathlib.Path(path).parts
    for part in parts:
        if part in SKIP_IN_ZIP:
            return True
        if part.endswith(".pyc"):
            return True
    return False

@app.get("/api/projects/{project_id}/download-zip")
async def download_project_zip(project_id: str, user: dict = Depends(require_auth)):
    user_id = user["id"]
    project = None
    if project_id in projects_store and projects_store[project_id].get("user_id") == user_id:
        project = projects_store[project_id]
    else:
        project = await db_get_project(project_id, user_id)
    if not project:
        raise HTTPException(404, "Project not found")

    output_dir = project.get("output_dir", "")
    if not output_dir or not os.path.exists(output_dir):
        raise HTTPException(404, "No output directory found for this project")

    project_title = (
        (project.get("final_output") or {}).get("project_title")
        or project.get("request", {}).get("idea", "aira-project")[:40]
    )
    safe_name = "".join(c if c.isalnum() or c in "-_" else "-" for c in project_title.lower().replace(" ", "-"))
    zip_filename = f"AIRA-{safe_name}.zip"

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
async def upload_file(file: UploadFile = File(...), user: dict = Depends(require_auth)):
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename or "file.bin")[1]
    save_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{ext}")
    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)
    return {"file_id": file_id, "filename": file.filename, "size": len(content)}

# ─── Planets (public) ────────────────────────────────────────────────────────
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
        {"id": "ceres",   "name": "Ceres",   "symbol": "☄",  "role": "Technical Documentation",    "motto": "If it isn't documented, it doesn't exist.",                       "color": "#D4A574"},
    ]}

# ─── WebSocket ───────────────────────────────────────────────────────────────
@app.websocket("/ws/{project_id}")
async def ws_endpoint(websocket: WebSocket, project_id: str):
    await websocket.accept()
    # Note: WebSocket auth is handled via query param token in production
    ws_connections.setdefault(project_id, []).append(websocket)
    # Send cached state if available
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

# ─── Live Preview (boot the generated app) ───────────────────────────────────
from core.preview import start_preview as _start_preview, get_preview as _get_preview, stop_preview as _stop_preview

@app.post("/api/projects/{project_id}/preview/start")
async def preview_start(project_id: str, user: dict = Depends(require_auth)):
    user_id = user["id"]
    project = None
    if project_id in projects_store and projects_store[project_id].get("user_id") == user_id:
        project = projects_store[project_id]
    else:
        project = await db_get_project(project_id, user_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return await asyncio.to_thread(
        _start_preview, project_id, project.get("output_dir", ""), settings.GEMINI_API_KEY
    )

@app.get("/api/projects/{project_id}/preview")
async def preview_status(project_id: str, user: dict = Depends(require_auth)):
    user_id = user["id"]
    project = None
    if project_id in projects_store and projects_store[project_id].get("user_id") == user_id:
        project = projects_store[project_id]
    else:
        project = await db_get_project(project_id, user_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return await asyncio.to_thread(_get_preview, project_id)

@app.post("/api/projects/{project_id}/preview/stop")
async def preview_stop(project_id: str, user: dict = Depends(require_auth)):
    user_id = user["id"]
    project = None
    if project_id in projects_store and projects_store[project_id].get("user_id") == user_id:
        project = projects_store[project_id]
    else:
        project = await db_get_project(project_id, user_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return await asyncio.to_thread(_stop_preview, project_id)

@app.post("/api/previews/stop-all")
async def preview_stop_all():
    from core.preview import stop_all_previews
    return await asyncio.to_thread(stop_all_previews)

@app.get("/api/projects/{project_id}/preview-info")
async def get_preview_info(project_id: str, user: dict = Depends(require_auth)):
    user_id = user["id"]
    project = None
    if project_id in projects_store and projects_store[project_id].get("user_id") == user_id:
        project = projects_store[project_id]
    else:
        project = await db_get_project(project_id, user_id)
    if not project:
        raise HTTPException(404, "Project not found")

    output_dir = project.get("output_dir", "")
    if not output_dir or not os.path.exists(output_dir):
        return {"available": False, "message": "No output yet"}

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
