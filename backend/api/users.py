"""
Users API - User synchronization after Neon Auth
Creates tenant and user records in database after successful Neon Auth registration
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import asyncpg
import os
import uuid
import traceback
import jwt as pyjwt
from datetime import datetime, timedelta, timezone

# Debug mode flag - set to False in production
DEBUG_MODE = os.getenv("DEBUG", "false").lower() == "true"

router = APIRouter()

# Database connection pool (shared)
db_pool = None

async def get_db_pool():
    """Get or create database connection pool"""
    global db_pool
    if db_pool is None:
        db_pool = await asyncpg.create_pool(
            dsn=os.getenv("DATABASE_URL"),
            min_size=2,
            max_size=10
        )
    return db_pool


async def close_db_pool():
    """Close database connection pool on shutdown"""
    global db_pool
    if db_pool is not None:
        await db_pool.close()
        db_pool = None
        print("[UsersAPI] Database connection pool closed")


# === Request/Response Models ===

class SyncUserRequest(BaseModel):
    """Request to sync user from Neon Auth"""
    auth_provider_id: str  # User ID from Neon Auth
    email: EmailStr
    name: Optional[str] = None
    company_name: Optional[str] = None


class UserResponse(BaseModel):
    """User data response"""
    id: str
    tenant_id: str
    email: str
    role: str
    auth_provider_id: str


class TenantResponse(BaseModel):
    """Tenant data response"""
    id: str
    name: str
    plan_tier: str


class SyncUserResponse(BaseModel):
    """Response from sync user"""
    user: UserResponse
    tenant: TenantResponse
    is_new: bool
    token: Optional[str] = None


def generate_platform_jwt(user_id: str, tenant_id: str, email: str, name: Optional[str] = None) -> str:
    """Generate a JWT signed with our JWT_SECRET_KEY for API access"""
    secret = os.getenv("JWT_SECRET_KEY")
    if not secret:
        raise ValueError("JWT_SECRET_KEY not set")

    payload = {
        "sub": user_id,
        "tenant_id": tenant_id,
        "email": email,
        "name": name or email,
        "session_id": f"sess_{uuid.uuid4().hex[:12]}",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return pyjwt.encode(payload, secret, algorithm="HS256")


# === Endpoints ===

@router.post("/users/sync", response_model=SyncUserResponse)
async def sync_user(request: SyncUserRequest):
    """
    Sync user from Neon Auth to local database

    Called after successful Neon Auth registration/login to create
    tenant and user records in our database.

    If user already exists, returns existing user.
    If new user, creates tenant and user.
    """
    pool = await get_db_pool()

    async with pool.acquire() as conn:
        # Check if user already exists by auth_provider_id
        existing_user = await conn.fetchrow(
            """
            SELECT u.id, u.tenant_id, u.email, u.role, u.auth_provider_id,
                   t.name as tenant_name, t.plan_tier
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.auth_provider_id = $1
            """,
            request.auth_provider_id
        )

        if existing_user:
            # User exists, set RLS context and return data
            await conn.execute("SELECT set_config('app.current_tenant', $1, false)", str(existing_user['tenant_id']))
            platform_token = generate_platform_jwt(
                str(existing_user['id']), str(existing_user['tenant_id']),
                existing_user['email'], request.name
            )
            return SyncUserResponse(
                user=UserResponse(
                    id=str(existing_user['id']),
                    tenant_id=str(existing_user['tenant_id']),
                    email=existing_user['email'],
                    role=existing_user['role'],
                    auth_provider_id=existing_user['auth_provider_id']
                ),
                tenant=TenantResponse(
                    id=str(existing_user['tenant_id']),
                    name=existing_user['tenant_name'],
                    plan_tier=existing_user['plan_tier']
                ),
                is_new=False,
                token=platform_token
            )

        # Check if user exists by email (might have been created another way)
        existing_user_by_email = await conn.fetchrow(
            """
            SELECT u.id, u.tenant_id, u.email, u.role, u.auth_provider_id,
                   t.name as tenant_name, t.plan_tier
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.email = $1
            """,
            request.email
        )

        if existing_user_by_email:
            # User exists with same email, set RLS context and update auth_provider_id
            await conn.execute("SELECT set_config('app.current_tenant', $1, false)", str(existing_user_by_email['tenant_id']))
            await conn.execute(
                """
                UPDATE users
                SET auth_provider_id = $1, updated_at = NOW()
                WHERE email = $2
                """,
                request.auth_provider_id,
                request.email
            )

            platform_token = generate_platform_jwt(
                str(existing_user_by_email['id']), str(existing_user_by_email['tenant_id']),
                existing_user_by_email['email'], request.name
            )
            return SyncUserResponse(
                user=UserResponse(
                    id=str(existing_user_by_email['id']),
                    tenant_id=str(existing_user_by_email['tenant_id']),
                    email=existing_user_by_email['email'],
                    role=existing_user_by_email['role'],
                    auth_provider_id=request.auth_provider_id  # Updated value
                ),
                tenant=TenantResponse(
                    id=str(existing_user_by_email['tenant_id']),
                    name=existing_user_by_email['tenant_name'],
                    plan_tier=existing_user_by_email['plan_tier']
                ),
                is_new=False,
                token=platform_token
            )

        # New user - create tenant and user
        tenant_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())

        # Use company_name if provided, otherwise use name or email
        tenant_name = request.company_name or request.name or request.email.split('@')[0]

        try:
            async with conn.transaction():
                # Set RLS context for new tenant (using set_config for parameterized query)
                await conn.execute("SELECT set_config('app.current_tenant', $1, false)", tenant_id)

                # Create tenant
                await conn.execute(
                    """
                    INSERT INTO tenants (id, name, plan_tier, created_at)
                    VALUES ($1, $2, 'free', NOW())
                    """,
                    tenant_id,
                    tenant_name
                )

                # Create user
                await conn.execute(
                    """
                    INSERT INTO users (id, tenant_id, email, role, auth_provider_id, created_at)
                    VALUES ($1, $2, $3, 'admin', $4, NOW())
                    """,
                    user_id,
                    tenant_id,
                    request.email,
                    request.auth_provider_id
                )

            platform_token = generate_platform_jwt(
                user_id, tenant_id, request.email, request.name
            )
            return SyncUserResponse(
                user=UserResponse(
                    id=user_id,
                    tenant_id=tenant_id,
                    email=request.email,
                    role='admin',
                    auth_provider_id=request.auth_provider_id
                ),
                tenant=TenantResponse(
                    id=tenant_id,
                    name=tenant_name,
                    plan_tier='free'
                ),
                is_new=True,
                token=platform_token
            )

        except Exception as e:
            # Log full error details server-side
            print(f"[UsersAPI] Error creating user: {e}")
            if DEBUG_MODE:
                print(traceback.format_exc())
            # Return generic error to client
            error_detail = str(e) if DEBUG_MODE else "Failed to create user. Please try again later."
            raise HTTPException(status_code=500, detail=error_detail)


@router.get("/users/me")
async def get_current_user(auth_provider_id: str):
    """
    Get current user by auth_provider_id

    Query param: auth_provider_id (from Neon Auth JWT)
    """
    pool = await get_db_pool()

    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            """
            SELECT u.id, u.tenant_id, u.email, u.role, u.auth_provider_id,
                   t.name as tenant_name, t.plan_tier
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.auth_provider_id = $1
            """,
            auth_provider_id
        )

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Set RLS context for subsequent queries (using set_config for parameterized query)
        await conn.execute("SELECT set_config('app.current_tenant', $1, false)", str(user['tenant_id']))

        return {
            "user": {
                "id": str(user['id']),
                "tenant_id": str(user['tenant_id']),
                "email": user['email'],
                "role": user['role'],
                "auth_provider_id": user['auth_provider_id']
            },
            "tenant": {
                "id": str(user['tenant_id']),
                "name": user['tenant_name'],
                "plan_tier": user['plan_tier']
            }
        }
