"""
AIRA Dependencies — Auth middleware for FastAPI.
Supports both Bearer token (HTTP header) and query param token (for SSE).
"""
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from auth import decode_access_token
from database import get_user_by_id

security = HTTPBearer(auto_error=False)


async def _extract_user(request: Request) -> Optional[dict]:
    """Extract user from Bearer token or query param."""
    # Try Bearer token first
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    else:
        # Try query param (for SSE / EventSource which can't send headers)
        token = request.query_params.get("token")

    if not token:
        return None

    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = await get_user_by_id(user_id)
    return user


async def get_current_user(request: Request) -> Optional[dict]:
    """Extract and verify JWT token. Returns user dict or None."""
    return await _extract_user(request)


async def require_auth(request: Request) -> dict:
    """Require a valid JWT token. Raises 401 if not authenticated."""
    user = await _extract_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user
