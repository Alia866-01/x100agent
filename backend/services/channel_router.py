"""
Channel Router Service

Handles sending messages to different communication channels.
Supports: WhatsApp, Telegram, Instagram, Email.
"""

import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
import os


class ChannelRouter:
    """
    Routes outgoing messages to the appropriate channel (WhatsApp, Telegram, Instagram, Email)
    """

    @staticmethod
    async def send_message(
        channel: Dict[str, Any], user_identifier: str, content: str
    ) -> Dict[str, Any]:
        """
        Main entry point for sending messages.

        Args:
            channel: Channel configuration dict with type and config
            user_identifier: Recipient ID (phone, chat_id, user_id, email)
            content: Message content to send

        Returns:
            Response dict from the channel API
        """
        channel_type = channel["channel_type"]
        config = channel["channel_config"]

        if channel_type == "whatsapp":
            return await ChannelRouter._send_whatsapp(config, user_identifier, content)
        elif channel_type == "telegram":
            return await ChannelRouter._send_telegram(config, user_identifier, content)
        elif channel_type == "instagram":
            return await ChannelRouter._send_instagram(config, user_identifier, content)
        elif channel_type == "email":
            return await ChannelRouter._send_email(config, user_identifier, content)
        else:
            raise ValueError(f"Unsupported channel type: {channel_type}")

    @staticmethod
    async def _send_whatsapp(config: Dict, to: str, message: str) -> Dict:
        """
        Send WhatsApp message via 360dialog/Meta Cloud API

        Args:
            config: { phone_number_id, access_token, ... }
            to: Recipient phone number
            message: Message text
        """
        url = "https://waba.360dialog.io/v1/messages"
        headers = {
            "Authorization": f"Bearer {config['access_token']}",
            "Content-Type": "application/json",
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": message},
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e), "status": "failed"}

    @staticmethod
    async def _send_telegram(config: Dict, chat_id: str, message: str) -> Dict:
        """
        Send Telegram message via Bot API

        Args:
            config: { bot_token, ... }
            chat_id: Telegram chat ID
            message: Message text (supports Markdown)
        """
        url = f"https://api.telegram.org/bot{config['bot_token']}/sendMessage"
        payload = {
            "chat_id": int(chat_id),
            "text": message,
            "parse_mode": "Markdown",  # Optional: supports markdown formatting
        }

        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e), "status": "failed"}

    @staticmethod
    async def _send_instagram(config: Dict, recipient_id: str, message: str) -> Dict:
        """
        Send Instagram message via Meta Graph API

        Args:
            config: { page_id, access_token, ... }
            recipient_id: Instagram user ID
            message: Message text
        """
        url = f"https://graph.facebook.com/v18.0/{config['page_id']}/messages"
        headers = {
            "Authorization": f"Bearer {config['access_token']}",
            "Content-Type": "application/json",
        }
        payload = {"recipient": {"id": recipient_id}, "message": {"text": message}}

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e), "status": "failed"}

    @staticmethod
    async def _send_email(config: Dict, to: str, message: str, subject: str = "Response from AI Agent") -> Dict:
        """
        Send Email via SMTP or Composio

        Args:
            config: { email_address, smtp_host, smtp_port, password } OR { composio_connection_id }
            to: Recipient email address
            message: Email body text
            subject: Email subject line
        """
        # Option 1: Composio Gmail Integration
        if "composio_connection_id" in config:
            # TODO: Implement Composio email sending
            # from composio import Composio
            # composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
            # result = composio.execute_action(
            #     action="gmail_send_email",
            #     connection_id=config["composio_connection_id"],
            #     params={"to": to, "subject": subject, "body": message}
            # )
            return {"status": "composio_not_implemented"}

        # Option 2: Direct SMTP
        try:
            msg = MIMEMultipart()
            msg["From"] = config["email_address"]
            msg["To"] = to
            msg["Subject"] = subject
            msg.attach(MIMEText(message, "plain"))

            with smtplib.SMTP(config["smtp_host"], config["smtp_port"]) as server:
                server.starttls()
                server.login(config["email_address"], config["password"])
                server.send_message(msg)

            return {"status": "sent", "to": to}
        except Exception as e:
            return {"error": str(e), "status": "failed"}


# ===== Utility Functions =====

async def send_typing_indicator(channel: Dict, user_identifier: str):
    """
    Send typing indicator (if supported by channel)
    """
    channel_type = channel["channel_type"]

    if channel_type == "telegram":
        config = channel["channel_config"]
        url = f"https://api.telegram.org/bot{config['bot_token']}/sendChatAction"
        payload = {"chat_id": int(user_identifier), "action": "typing"}
        requests.post(url, json=payload)

    elif channel_type == "whatsapp":
        # WhatsApp doesn't support typing indicators via API
        pass

    elif channel_type == "instagram":
        config = channel["channel_config"]
        url = f"https://graph.facebook.com/v18.0/{config['page_id']}/messages"
        headers = {"Authorization": f"Bearer {config['access_token']}"}
        payload = {
            "recipient": {"id": user_identifier},
            "sender_action": "typing_on",
        }
        requests.post(url, json=payload, headers=headers)


async def format_message_for_channel(channel_type: str, content: str) -> str:
    """
    Format message content based on channel capabilities

    - Telegram: Supports Markdown
    - WhatsApp: Plain text (can support formatting with special characters)
    - Instagram: Plain text
    - Email: HTML or plain text
    """
    if channel_type == "telegram":
        # Telegram supports Markdown - can keep formatting
        return content

    elif channel_type == "whatsapp":
        # WhatsApp supports *bold*, _italic_, ~strikethrough~
        return content

    elif channel_type == "email":
        # For email, might want to convert to HTML
        # For now, keep as plain text
        return content

    else:
        # Default: plain text
        return content
