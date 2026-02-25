"""
Multi-Channel Webhook Handlers

Unified webhook endpoints for WhatsApp, Telegram, Instagram, and Email.
All incoming messages are normalized to a standard format and pushed to ARQ queues.
"""

from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
import hashlib
import hmac
import json
from datetime import datetime
from backend.services.message_queue import push_to_queue
from backend.services.db import get_channel_by_config

router = APIRouter()


# ===== WhatsApp Webhook =====
@router.get("/webhooks/whatsapp")
async def whatsapp_webhook_verify(
    request: Request,
    hub_mode: Optional[str] = None,
    hub_verify_token: Optional[str] = None,
    hub_challenge: Optional[str] = None
):
    """
    WhatsApp webhook verification (GET request from Meta)

    Meta sends this GET request to verify webhook ownership.
    We verify the token against stored channel configs or environment variable.
    """
    from backend.services.db import get_db_connection
    import os

    if hub_mode != "subscribe":
        raise HTTPException(status_code=403, detail="Invalid mode")

    if not hub_verify_token or not hub_challenge:
        raise HTTPException(status_code=400, detail="Missing parameters")

    # Option 1: Check against environment variable (global token)
    global_token = os.getenv("WHATSAPP_VERIFY_TOKEN")
    if global_token and hub_verify_token == global_token:
        return int(hub_challenge)

    # Option 2: Check against any WhatsApp channel's verify_token
    try:
        async with get_db_connection() as conn:
            # Query all active WhatsApp channels
            channels = await conn.fetch(
                """
                SELECT channel_config
                FROM agent_channels
                WHERE channel_type = 'whatsapp' AND is_active = true
                """
            )

            # Check if any channel has a matching verify_token
            for channel in channels:
                config = channel['channel_config']
                if isinstance(config, dict) and config.get('verify_token') == hub_verify_token:
                    return int(hub_challenge)

    except Exception as e:
        print(f"Error verifying WhatsApp webhook token: {e}")

    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/webhooks/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    WhatsApp incoming message webhook (POST from 360dialog/Meta)

    Normalizes WhatsApp webhook format to standard structure and pushes to queue.
    """
    body = await request.json()

    # Extract messages from 360dialog/Meta format
    if "entry" in body:
        for entry in body["entry"]:
            for change in entry.get("changes", []):
                value = change.get("value", {})
                messages = value.get("messages", [])

                for msg in messages:
                    phone_number_id = value["metadata"]["phone_number_id"]

                    # Find agent channel by phone_number_id
                    channel = await get_channel_by_config(
                        "whatsapp", "phone_number_id", phone_number_id
                    )
                    if not channel:
                        print(f"No channel found for phone_number_id: {phone_number_id}")
                        continue

                    # Normalize message format
                    normalized = {
                        "channel_type": "whatsapp",
                        "channel_id": str(channel["id"]),
                        "agent_id": str(channel["agent_id"]),
                        "tenant_id": str(channel["tenant_id"]),
                        "user_identifier": msg["from"],
                        "message_id": msg["id"],
                        "content": msg.get("text", {}).get("body", ""),
                        "timestamp": datetime.fromtimestamp(
                            int(msg["timestamp"])
                        ).isoformat(),
                        "metadata": value["metadata"],
                    }

                    # Push to queue
                    await push_to_queue("incoming_messages_whatsapp", normalized)

    return {"status": "ok"}


# ===== Telegram Webhook =====
@router.post("/webhooks/telegram")
async def telegram_webhook(request: Request):
    """
    Telegram incoming message webhook

    Telegram webhooks are set per bot via:
    https://api.telegram.org/bot<TOKEN>/setWebhook?url=<URL>
    """
    body = await request.json()

    if "message" in body:
        msg = body["message"]
        chat_id = str(msg["chat"]["id"])

        # Find agent channel
        # Note: We need a way to identify which bot this belongs to
        # Option 1: Use different webhook URLs per bot (/webhooks/telegram/{bot_id})
        # Option 2: Store bot_token hash and validate incoming messages
        # For now, we'll use a simplified approach
        channel = await get_channel_by_identifier("telegram", chat_id)
        if not channel:
            return {"status": "no_agent"}

        # Normalize message format
        normalized = {
            "channel_type": "telegram",
            "channel_id": str(channel["id"]),
            "agent_id": str(channel["agent_id"]),
            "tenant_id": str(channel["tenant_id"]),
            "user_identifier": chat_id,
            "message_id": str(msg["message_id"]),
            "content": msg.get("text", ""),
            "timestamp": datetime.fromtimestamp(msg["date"]).isoformat(),
            "metadata": {
                "username": msg["from"].get("username"),
                "first_name": msg["from"].get("first_name"),
            },
        }

        await push_to_queue("incoming_messages_telegram", normalized)

    return {"status": "ok"}


# ===== Instagram Webhook =====
@router.get("/webhooks/instagram")
async def instagram_webhook_verify(
    request: Request,
    hub_mode: Optional[str] = None,
    hub_verify_token: Optional[str] = None,
    hub_challenge: Optional[str] = None,
):
    """
    Instagram webhook verification (GET request from Meta)

    Meta sends this GET request to verify webhook ownership.
    We verify the token against stored channel configs or environment variable.
    """
    from backend.services.db import get_db_connection
    import os

    if hub_mode != "subscribe":
        raise HTTPException(status_code=403, detail="Invalid mode")

    if not hub_verify_token or not hub_challenge:
        raise HTTPException(status_code=400, detail="Missing parameters")

    # Option 1: Check against environment variable (global token)
    global_token = os.getenv("INSTAGRAM_VERIFY_TOKEN")
    if global_token and hub_verify_token == global_token:
        return int(hub_challenge)

    # Option 2: Check against any Instagram channel's verify_token
    try:
        async with get_db_connection() as conn:
            # Query all active Instagram channels
            channels = await conn.fetch(
                """
                SELECT channel_config
                FROM agent_channels
                WHERE channel_type = 'instagram' AND is_active = true
                """
            )

            # Check if any channel has a matching verify_token
            for channel in channels:
                config = channel['channel_config']
                if isinstance(config, dict) and config.get('verify_token') == hub_verify_token:
                    return int(hub_challenge)

    except Exception as e:
        print(f"Error verifying Instagram webhook token: {e}")

    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/webhooks/instagram")
async def instagram_webhook(request: Request):
    """
    Instagram incoming message webhook (Meta Graph API)
    """
    body = await request.json()

    if body.get("object") == "instagram":
        for entry in body.get("entry", []):
            for messaging in entry.get("messaging", []):
                sender_id = messaging["sender"]["id"]
                page_id = messaging["recipient"]["id"]

                # Find agent channel by page_id
                channel = await get_channel_by_config("instagram", "page_id", page_id)
                if not channel:
                    print(f"No channel found for page_id: {page_id}")
                    continue

                msg = messaging.get("message", {})

                # Normalize message format
                normalized = {
                    "channel_type": "instagram",
                    "channel_id": str(channel["id"]),
                    "agent_id": str(channel["agent_id"]),
                    "tenant_id": str(channel["tenant_id"]),
                    "user_identifier": sender_id,
                    "message_id": msg.get("mid", ""),
                    "content": msg.get("text", ""),
                    "timestamp": datetime.fromtimestamp(
                        messaging["timestamp"] / 1000  # Instagram uses milliseconds
                    ).isoformat(),
                    "metadata": {"page_id": page_id},
                }

                await push_to_queue("incoming_messages_instagram", normalized)

    return {"status": "ok"}


# ===== Email Webhook =====
@router.post("/webhooks/email")
async def email_webhook(request: Request):
    """
    Email webhook (via Composio or other email provider)

    This endpoint receives webhooks when a new email arrives.
    Structure depends on the email provider's webhook format.
    """
    body = await request.json()

    # Assuming a standardized webhook format
    # (actual structure depends on provider - Composio, SendGrid, etc.)
    email_address = body.get("to")  # Agent's email

    # Find agent channel by email address
    channel = await get_channel_by_config("email", "email_address", email_address)
    if not channel:
        return {"status": "no_agent"}

    # Normalize message format
    normalized = {
        "channel_type": "email",
        "channel_id": str(channel["id"]),
        "agent_id": str(channel["agent_id"]),
        "tenant_id": str(channel["tenant_id"]),
        "user_identifier": body.get("from"),
        "message_id": body.get("message_id"),
        "content": body.get("body_text", ""),
        "timestamp": body.get("date"),
        "metadata": {
            "subject": body.get("subject"),
            "from_name": body.get("from_name"),
        },
    }

    await push_to_queue("incoming_messages_email", normalized)

    return {"status": "ok"}


# ===== Webhook for Email Polling (Alternative) =====
# If using polling instead of webhooks for email
@router.post("/internal/email-poll")
async def trigger_email_poll(agent_id: str):
    """
    Internal endpoint to trigger email polling for a specific agent
    (Can be called by a cron job or scheduler)
    """
    # TODO: Implement email polling logic
    # 1. Fetch agent's email channel config
    # 2. Connect to IMAP
    # 3. Fetch unread emails
    # 4. For each email, create normalized message and push to queue
    pass
