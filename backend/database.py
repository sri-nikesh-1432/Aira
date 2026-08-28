"""
AIRA Database — SQLite async with aiosqlite.
Users + Projects with proper isolation.
"""
import aiosqlite
import os
import json
from datetime import datetime
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(__file__), "aira.db")

async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db

async def init_db():
    """Create tables if they don't exist."""
    db = await get_db()
    try:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                idea TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'pending',
                request_json TEXT DEFAULT '{}',
                planet_statuses_json TEXT DEFAULT '{}',
                messages_json TEXT DEFAULT '[]',
                final_output_json TEXT DEFAULT NULL,
                errors_json TEXT DEFAULT '[]',
                output_dir TEXT DEFAULT '',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                completed_at TEXT DEFAULT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
            CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);
        """)
        await db.commit()
    finally:
        await db.close()


# ─── User operations ──────────────────────────────────────────────────────────

async def create_user(user_id: str, name: str, email: str, password_hash: str) -> Dict[str, Any]:
    db = await get_db()
    try:
        now = datetime.utcnow().isoformat()
        await db.execute(
            "INSERT INTO users (id, name, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, name, email.lower().strip(), password_hash, now, now),
        )
        await db.commit()
        return {"id": user_id, "name": name, "email": email.lower().strip(), "created_at": now}
    finally:
        await db.close()

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None
    finally:
        await db.close()

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?", (user_id,))
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None
    finally:
        await db.close()

async def update_user(user_id: str, **kwargs) -> bool:
    db = await get_db()
    try:
        allowed = {"name", "email", "password_hash"}
        updates = {k: v for k, v in kwargs.items() if k in allowed}
        if not updates:
            return False
        updates["updated_at"] = datetime.utcnow().isoformat()
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [user_id]
        await db.execute(f"UPDATE users SET {set_clause} WHERE id = ?", values)
        await db.commit()
        return True
    finally:
        await db.close()


# ─── Project operations (ALL scoped to user_id) ──────────────────────────────

async def create_project(project_id: str, user_id: str, idea: str, request_data: Dict) -> Dict[str, Any]:
    db = await get_db()
    try:
        now = datetime.utcnow().isoformat()
        await db.execute(
            """INSERT INTO projects (id, user_id, idea, status, request_json, created_at, updated_at)
               VALUES (?, ?, ?, 'running', ?, ?, ?)""",
            (project_id, user_id, idea, json.dumps(request_data, default=str), now, now),
        )
        await db.commit()
        return {
            "id": project_id, "user_id": user_id, "idea": idea,
            "status": "running", "created_at": now,
        }
    finally:
        await db.close()

async def get_user_projects(user_id: str) -> List[Dict[str, Any]]:
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id, idea, status, created_at, updated_at, completed_at FROM projects WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        await db.close()

async def get_project(project_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """Get a project ONLY if it belongs to the user."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM projects WHERE id = ? AND user_id = ?",
            (project_id, user_id),
        )
        row = await cursor.fetchone()
        if not row:
            return None
        return _row_to_project(dict(row))
    finally:
        await db.close()

async def get_project_by_id_only(project_id: str) -> Optional[Dict[str, Any]]:
    """Internal: get project by ID regardless of user (for background tasks)."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        row = await cursor.fetchone()
        if not row:
            return None
        return _row_to_project(dict(row))
    finally:
        await db.close()

async def update_project(project_id: str, user_id: str, **kwargs) -> bool:
    """Update a project ONLY if it belongs to the user."""
    db = await get_db()
    try:
        # Verify ownership first
        cursor = await db.execute(
            "SELECT id FROM projects WHERE id = ? AND user_id = ?",
            (project_id, user_id),
        )
        if not await cursor.fetchone():
            return False

        allowed = {
            "idea", "status", "request_json", "planet_statuses_json",
            "messages_json", "final_output_json", "errors_json", "output_dir",
            "completed_at",
        }
        updates = {k: v for k, v in kwargs.items() if k in allowed}
        if not updates:
            return True
        updates["updated_at"] = datetime.utcnow().isoformat()

        # Serialize dicts/lists to JSON
        for k in ("request_json", "planet_statuses_json", "messages_json", "final_output_json", "errors_json"):
            if k in updates and not isinstance(updates[k], str):
                updates[k] = json.dumps(updates[k], default=str)

        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [project_id, user_id]
        await db.execute(
            f"UPDATE projects SET {set_clause} WHERE id = ? AND user_id = ?",
            values,
        )
        await db.commit()
        return True
    finally:
        await db.close()

async def update_project_internal(project_id: str, **kwargs) -> bool:
    """Internal update by project_id (for background tasks — no user check)."""
    db = await get_db()
    try:
        allowed = {
            "idea", "status", "request_json", "planet_statuses_json",
            "messages_json", "final_output_json", "errors_json", "output_dir",
            "completed_at",
        }
        updates = {k: v for k, v in kwargs.items() if k in allowed}
        if not updates:
            return True
        updates["updated_at"] = datetime.utcnow().isoformat()

        for k in ("request_json", "planet_statuses_json", "messages_json", "final_output_json", "errors_json"):
            if k in updates and not isinstance(updates[k], str):
                updates[k] = json.dumps(updates[k], default=str)

        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [project_id]
        await db.execute(f"UPDATE projects SET {set_clause} WHERE id = ?", values)
        await db.commit()
        return True
    finally:
        await db.close()

async def delete_project(project_id: str, user_id: str) -> bool:
    """Delete a project ONLY if it belongs to the user."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "DELETE FROM projects WHERE id = ? AND user_id = ?",
            (project_id, user_id),
        )
        await db.commit()
        return cursor.rowcount > 0
    finally:
        await db.close()

async def project_exists_for_user(project_id: str, user_id: str) -> bool:
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT 1 FROM projects WHERE id = ? AND user_id = ?",
            (project_id, user_id),
        )
        return await cursor.fetchone() is not None
    finally:
        await db.close()


def _row_to_project(row: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a DB row to a project dict matching the existing API format."""
    project = {
        "id": row["id"],
        "user_id": row["user_id"],
        "status": row["status"],
        "idea": row["idea"],
        "created_at": row["created_at"],
        "updated_at": row.get("updated_at", ""),
        "completed_at": row.get("completed_at"),
        "output_dir": row.get("output_dir", ""),
    }

    for key, db_key in [
        ("request", "request_json"),
        ("planet_statuses", "planet_statuses_json"),
        ("messages", "messages_json"),
        ("final_output", "final_output_json"),
        ("errors", "errors_json"),
    ]:
        val = row.get(db_key)
        if val:
            try:
                project[key] = json.loads(val)
            except (json.JSONDecodeError, TypeError):
                project[key] = {} if key in ("request", "planet_statuses") else []
        else:
            project[key] = {} if key in ("request", "planet_statuses") else ([] if key != "final_output" else None)

    return project
