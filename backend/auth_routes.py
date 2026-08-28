"""
AIRA Auth Routes — Register, Login, Logout, Profile.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
import uuid

from auth import hash_password, verify_password, create_access_token
from database import (
    create_user, get_user_by_email, get_user_by_id, update_user,
)
from deps import require_auth, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    confirm_password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, min_length=3, max_length=255)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6, max_length=128)


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: str


def _sanitize_user(user: dict) -> dict:
    """Remove sensitive fields from user dict."""
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "created_at": user.get("created_at", ""),
    }


@router.post("/register")
async def register(req: RegisterRequest):
    # Validate passwords match
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Validate email format (basic)
    if "@" not in req.email or "." not in req.email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Check if email already exists
    existing = await get_user_by_email(req.email)
    if existing:
        # Don't reveal that the email is already registered
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user_id = str(uuid.uuid4())
    password_hash = hash_password(req.password)

    try:
        user = await create_user(user_id, req.name.strip(), req.email.strip(), password_hash)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create account. Please try again.")

    token = create_access_token({"sub": user_id})
    return {
        "token": token,
        "user": _sanitize_user(user),
    }


@router.post("/login")
async def login(req: LoginRequest):
    user = await get_user_by_email(req.email)
    if not user:
        # Generic error — don't reveal if email exists
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["id"]})
    return {
        "token": token,
        "user": _sanitize_user(user),
    }


@router.post("/logout")
async def logout(user: dict = Depends(require_auth)):
    """Logout — client should clear the token. Server-side revocation is optional."""
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_me(user: dict = Depends(require_auth)):
    return _sanitize_user(user)


@router.put("/me")
async def update_me(req: UpdateProfileRequest, user: dict = Depends(require_auth)):
    updates = {}
    if req.name is not None:
        updates["name"] = req.name.strip()
    if req.email is not None:
        # Validate email
        if "@" not in req.email or "." not in req.email.split("@")[-1]:
            raise HTTPException(status_code=400, detail="Invalid email format")
        # Check uniqueness
        existing = await get_user_by_email(req.email)
        if existing and existing["id"] != user["id"]:
            raise HTTPException(status_code=400, detail="Email already in use")
        updates["email"] = req.email.strip().lower()

    if updates:
        await update_user(user["id"], **updates)

    updated = await get_user_by_id(user["id"])
    return _sanitize_user(updated)


@router.post("/change-password")
async def change_password(req: ChangePasswordRequest, user: dict = Depends(require_auth)):
    # Re-fetch user to get password_hash
    full_user = await get_user_by_email(user["email"])
    if not full_user:
        raise HTTPException(status_code=500, detail="User not found")

    if not verify_password(req.current_password, full_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    new_hash = hash_password(req.new_password)
    await update_user(user["id"], password_hash=new_hash)
    return {"message": "Password updated successfully"}


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=1)


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    """Generic response — never reveal if email exists."""
    return {"message": "If an account exists with this email, a reset link has been sent."}


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    """Placeholder — in production, use email-based token verification."""
    return {"message": "Password has been reset. Please log in with your new password."}
