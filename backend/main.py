from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agno.os import AgentOS
from backend.agents.platform import platform_agent  # Re-enabled after auth testing
from backend.api.webhooks import router as webhooks_router
from backend.api.channels import router as channels_router
from dotenv import load_dotenv
import os

# Load .env.local for local dev, .env for Docker — skip silently if missing
load_dotenv(".env.local", override=False)
load_dotenv(".env", override=False)

app = FastAPI(title="AI-01 SaaS Platform Backend")

# CORS middleware for frontend communication
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost,https://x100ai.space").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth: Neon Auth handles login (Google OAuth, email/password).
# Tenant isolation: x-tenant-id header + PostgreSQL RLS.
# JWT middleware disabled — re-enable when public API needed.
print("[Auth] Using Neon Auth + x-tenant-id for tenant isolation")

# In production, Sales Agents are dynamic and not statically listed here.
# They are loaded from the DB when a request comes in.
# For AgentOS UI/Playground purposes, we only expose the Platform Agent initially.

from backend.database import get_shared_db

# Database for AgentOS
# FIXED: Use shared PostgresDb instance for better performance
platform_db = get_shared_db()

agent_os = AgentOS(
    agents=[platform_agent],  # Platform Agent for creating Sales Agents
    db=platform_db,
    base_app=app
)

# Include API routers
from backend.api.users import router as users_router
from backend.api.integrations import router as integrations_router
from backend.api.agents import router as agents_router
from backend.api.health import router as health_router
from backend.api.platform_chat import router as platform_chat_router
from backend.api.transcribe import router as transcribe_router

app.include_router(users_router, prefix="/api", tags=["users"])
app.include_router(webhooks_router, prefix="/api", tags=["webhooks"])
app.include_router(channels_router, prefix="/api", tags=["channels"])
app.include_router(integrations_router, prefix="/api", tags=["integrations"])
app.include_router(agents_router, prefix="/api", tags=["agents"])  # Agent Management & Invocation
app.include_router(health_router, prefix="/api", tags=["health"])  # Health & Monitoring
app.include_router(platform_chat_router, prefix="/api", tags=["platform"])  # Platform Agent Chat
app.include_router(transcribe_router, prefix="/api", tags=["transcribe"])  # Whisper STT

# Shutdown event handlers for connection pool cleanup
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on application shutdown"""
    from backend.api.agents import close_db_pool as close_agents_pool
    from backend.api.users import close_db_pool as close_users_pool

    await close_agents_pool()
    await close_users_pool()
    print("[Backend] Shutdown complete - all connection pools closed")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "backend-core"}

@app.get("/")
def root():
    return {
        "service": "AI-01 Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "agentOS": "/v1/agents"
    }

if __name__ == "__main__":
    agent_os.serve(app="backend.main:app", host="0.0.0.0", port=8000, reload=True)
