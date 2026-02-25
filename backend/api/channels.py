"""
Agent Channels API

REST endpoints for managing agent communication channels.
Frontend uses these to add/remove/configure channels (WhatsApp, Telegram, Instagram, Email).
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from backend.services.db import (
    get_agent_channels,
    create_channel,
    update_channel_config,
    toggle_channel,
    delete_channel,
    get_channel_by_id,
)

router = APIRouter()


# ===== Pydantic Models =====

class ChannelCreateRequest(BaseModel):
    agent_id: str
    tenant_id: str
    channel_type: str  # whatsapp, telegram, instagram, email
    channel_config: Dict[str, Any]


class ChannelUpdateRequest(BaseModel):
    channel_config: Dict[str, Any]


class ChannelToggleRequest(BaseModel):
    is_active: bool


# ===== API Endpoints =====

@router.get("/agents/{agent_id}/channels")
async def list_agent_channels(agent_id: str):
    """
    Get all channels for an agent

    Returns list of channels with their configurations.
    """
    try:
        channels = await get_agent_channels(agent_id)
        return {"channels": channels}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/agents/{agent_id}/channels")
async def create_agent_channel(agent_id: str, request: ChannelCreateRequest):
    """
    Create a new channel for an agent

    Body:
    {
        "agent_id": "uuid",
        "tenant_id": "uuid",
        "channel_type": "whatsapp",
        "channel_config": {
            "phone_number_id": "123456789",
            "access_token": "EAAG...",
            ...
        }
    }
    """
    try:
        # Validate channel type
        valid_types = ["whatsapp", "telegram", "instagram", "email"]
        if request.channel_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid channel type. Must be one of: {valid_types}",
            )

        # Validate channel config based on type
        validate_channel_config(request.channel_type, request.channel_config)

        # Create channel
        channel = await create_channel(
            tenant_id=request.tenant_id,
            agent_id=agent_id,
            channel_type=request.channel_type,
            channel_config=request.channel_config,
        )

        # If Telegram, set webhook
        if request.channel_type == "telegram":
            await setup_telegram_webhook(channel)

        # If Instagram, verify webhook subscription
        if request.channel_type == "instagram":
            await verify_instagram_webhook(channel)

        return {"channel": channel}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/channels/{channel_id}")
async def get_channel_details(channel_id: str):
    """
    Get details of a specific channel
    """
    try:
        channel = await get_channel_by_id(channel_id)
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")
        return {"channel": channel}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/channels/{channel_id}")
async def update_channel(channel_id: str, request: ChannelUpdateRequest):
    """
    Update channel configuration

    Body:
    {
        "channel_config": {
            "access_token": "NEW_TOKEN",
            ...
        }
    }
    """
    try:
        # Get existing channel to validate type
        channel = await get_channel_by_id(channel_id)
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Validate new config
        validate_channel_config(channel["channel_type"], request.channel_config)

        # Update
        success = await update_channel_config(channel_id, request.channel_config)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update channel")

        return {"status": "updated"}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/channels/{channel_id}/toggle")
async def toggle_channel_status(channel_id: str, request: ChannelToggleRequest):
    """
    Activate or deactivate a channel

    Body:
    {
        "is_active": false
    }
    """
    try:
        success = await toggle_channel(channel_id, request.is_active)
        if not success:
            raise HTTPException(status_code=404, detail="Channel not found")
        return {"status": "updated", "is_active": request.is_active}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/channels/{channel_id}")
async def delete_channel_endpoint(channel_id: str):
    """
    Delete a channel (will cascade delete associated conversations)
    """
    try:
        success = await delete_channel(channel_id)
        if not success:
            raise HTTPException(status_code=404, detail="Channel not found")
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== Validation Functions =====

def validate_channel_config(channel_type: str, config: Dict[str, Any]):
    """
    Validate channel configuration based on channel type

    Raises ValueError if config is invalid
    """
    if channel_type == "whatsapp":
        required_fields = ["phone_number_id", "access_token"]
        for field in required_fields:
            if field not in config:
                raise ValueError(f"Missing required field for WhatsApp: {field}")

    elif channel_type == "telegram":
        if "bot_token" not in config:
            raise ValueError("Missing required field for Telegram: bot_token")

    elif channel_type == "instagram":
        required_fields = ["page_id", "access_token"]
        for field in required_fields:
            if field not in config:
                raise ValueError(f"Missing required field for Instagram: {field}")

    elif channel_type == "email":
        # Email can use SMTP or Composio
        has_smtp = all(
            field in config
            for field in ["smtp_host", "smtp_port", "email_address", "password"]
        )
        has_composio = "composio_connection_id" in config and "email_address" in config

        if not (has_smtp or has_composio):
            raise ValueError(
                "Email channel requires either SMTP config (smtp_host, smtp_port, email_address, password) "
                "or Composio config (composio_connection_id, email_address)"
            )


async def setup_telegram_webhook(channel: Dict):
    """
    Set Telegram webhook URL for the bot

    Called automatically when a Telegram channel is created
    """
    import requests
    import os

    bot_token = channel["channel_config"]["bot_token"]
    webhook_url = f"{os.getenv('BACKEND_URL')}/api/webhooks/telegram"

    url = f"https://api.telegram.org/bot{bot_token}/setWebhook"
    response = requests.post(
        url,
        json={
            "url": webhook_url,
            "allowed_updates": ["message", "callback_query"],
        },
    )

    if not response.ok:
        raise ValueError(f"Failed to set Telegram webhook: {response.text}")


async def verify_instagram_webhook(channel: Dict):
    """
    Verify Instagram webhook subscription

    Note: Instagram webhooks are configured in Facebook App settings,
    not via API. This function just validates the config.
    """
    # In production, you might want to verify the webhook is actually working
    # by sending a test message or checking subscription status via Graph API
    pass


# ===== Test Endpoints (for development) =====

@router.post("/channels/{channel_id}/test")
async def test_channel(channel_id: str, test_message: str = "Hello from AI-01!"):
    """
    Send a test message through the channel (for development/testing)

    Query params:
        test_message: Message to send (default: "Hello from AI-01!")
    """
    try:
        channel = await get_channel_by_id(channel_id)
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Get test recipient from config (if available)
        test_recipient = channel["channel_config"].get("test_recipient")
        if not test_recipient:
            raise HTTPException(
                status_code=400,
                detail="No test_recipient configured for this channel. "
                "Add 'test_recipient' to channel_config.",
            )

        from backend.services.channel_router import ChannelRouter

        result = await ChannelRouter.send_message(
            channel=channel, user_identifier=test_recipient, content=test_message
        )

        return {"status": "sent", "result": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
