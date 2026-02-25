"""
Composio OAuth Integration API

Handles OAuth flow for connecting external services (Gmail, CRM, Calendar, etc.)
Multi-tenant support with Composio entities.
"""

import os
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from backend.services.composio_service import get_composio_service

router = APIRouter()


# Pydantic models
class ConnectIntegrationRequest(BaseModel):
    app_name: str  # e.g., "gmail", "slack", "hubspot"
    agent_id: str
    tenant_id: str
    redirect_url: Optional[str] = None


# ===== OAuth Flow Endpoints =====

@router.post("/integrations/connect")
async def connect_integration(request: ConnectIntegrationRequest):
    """
    Initiate OAuth flow for connecting an integration

    Returns OAuth URL for user to authorize
    """
    try:
        composio = get_composio_service()

        # Get or create Composio entity for tenant
        entity = composio.get_or_create_entity(request.tenant_id)

        # Generate OAuth URL
        oauth_url = composio.get_oauth_url(
            tenant_id=request.tenant_id,
            app_name=request.app_name,
            redirect_url=request.redirect_url
        )

        return {
            "oauth_url": oauth_url,
            "entity_id": entity["id"],
            "app_name": request.app_name
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initiate OAuth: {str(e)}")


@router.get("/integrations/callback")
async def oauth_callback(
    code: str = Query(...),
    state: Optional[str] = Query(None)
):
    """
    OAuth callback endpoint

    Composio handles the token exchange automatically.
    This endpoint just confirms success and redirects to frontend.
    """
    # Decode state to get tenant_id and app_name
    # Format: "tenant_id:app_name" (set by Composio)

    # Redirect to frontend success page
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

    return RedirectResponse(url=f"{frontend_url}/dashboard?integration_connected=true")


@router.get("/agents/{agent_id}/integrations")
async def list_agent_integrations(agent_id: str, tenant_id: str = Query(...)):
    """
    List all connected integrations for an agent
    """
    try:
        composio = get_composio_service()

        connections = composio.get_connected_accounts(tenant_id)

        return {
            "agent_id": agent_id,
            "integrations": connections
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list integrations: {str(e)}")


@router.delete("/integrations/{connection_id}")
async def disconnect_integration(connection_id: str):
    """
    Disconnect an integration
    """
    try:
        composio = get_composio_service()

        success = composio.disconnect_account(connection_id)

        if success:
            return {"status": "disconnected", "connection_id": connection_id}
        else:
            raise HTTPException(status_code=500, detail="Failed to disconnect")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error disconnecting: {str(e)}")


@router.get("/integrations/apps")
async def list_available_apps():
    """
    List all available apps that can be connected
    """
    apps = [
        {
            "name": "gmail",
            "display_name": "Gmail",
            "description": "Send and read emails",
            "icon": "📧",
            "category": "communication"
        },
        {
            "name": "googlecalendar",
            "display_name": "Google Calendar",
            "description": "Create and manage calendar events",
            "icon": "📅",
            "category": "productivity"
        },
        {
            "name": "hubspot",
            "display_name": "HubSpot",
            "description": "Manage contacts, deals, and companies",
            "icon": "🔷",
            "category": "crm"
        },
        {
            "name": "salesforce",
            "display_name": "Salesforce",
            "description": "Manage leads, opportunities, and accounts",
            "icon": "☁️",
            "category": "crm"
        },
        {
            "name": "slack",
            "display_name": "Slack",
            "description": "Send messages and manage channels",
            "icon": "💬",
            "category": "communication"
        }
    ]

    return {"apps": apps}
