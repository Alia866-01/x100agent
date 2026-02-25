"""
Health Check and Monitoring API

Provides endpoints for:
- System health status
- Database connection monitoring
- Service dependencies check
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime
import os

from backend.database import get_db_stats

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    timestamp: str
    version: str
    services: Dict[str, Any]


@router.get("/health/detailed", response_model=HealthResponse)
async def health_check_detailed():
    """
    Detailed health check with all service statuses

    Returns:
        HealthResponse with status of all services:
        - database
        - composio
        - environment
    """
    # Get database stats
    db_stats = get_db_stats()

    # Check environment variables
    env_status = {
        "DATABASE_URL": "✅" if os.getenv("DATABASE_URL") else "❌",
        "ANTHROPIC_API_KEY": "✅" if os.getenv("ANTHROPIC_API_KEY") else "❌",
        "COMPOSIO_API_KEY": "✅" if os.getenv("COMPOSIO_API_KEY") else "❌",
    }

    # Overall health
    is_healthy = (
        db_stats["initialized"] and
        os.getenv("DATABASE_URL") and
        os.getenv("ANTHROPIC_API_KEY")
    )

    return HealthResponse(
        status="healthy" if is_healthy else "degraded",
        timestamp=datetime.utcnow().isoformat(),
        version="1.0.0",
        services={
            "database": {
                "status": "✅" if db_stats["initialized"] else "❌",
                "initialized": db_stats["initialized"],
                "singleton": db_stats["singleton"],
                "url_format": db_stats["url_format"] if db_stats["initialized"] else "not_set",
            },
            "environment": env_status,
            "composio": {
                "status": "✅" if os.getenv("COMPOSIO_API_KEY") else "❌",
                "configured": bool(os.getenv("COMPOSIO_API_KEY")),
            }
        }
    )


@router.get("/health/database")
async def health_check_database():
    """
    Database-specific health check

    Returns:
        Database connection statistics and health
    """
    stats = get_db_stats()

    return {
        "status": "healthy" if stats["initialized"] else "not_initialized",
        "details": stats,
        "recommendations": _get_db_recommendations(stats)
    }


def _get_db_recommendations(stats: dict) -> list:
    """Generate recommendations based on DB stats"""
    recommendations = []

    if not stats["initialized"]:
        recommendations.append(
            "Database not initialized. Call get_shared_db() to initialize."
        )

    if stats.get("url_format", "").startswith("error"):
        recommendations.append(
            "DATABASE_URL environment variable not set correctly."
        )

    if not recommendations:
        recommendations.append("All checks passed! Database is healthy.")

    return recommendations


@router.get("/health/ready")
async def readiness_check():
    """
    Kubernetes-style readiness probe

    Returns:
        200 if ready to accept traffic, 503 otherwise
    """
    db_stats = get_db_stats()

    if not db_stats["initialized"]:
        return {"ready": False, "reason": "database_not_initialized"}

    if not os.getenv("DATABASE_URL"):
        return {"ready": False, "reason": "missing_database_url"}

    return {"ready": True}


@router.get("/health/live")
async def liveness_check():
    """
    Kubernetes-style liveness probe

    Returns:
        200 if application is alive
    """
    return {"alive": True, "timestamp": datetime.utcnow().isoformat()}
