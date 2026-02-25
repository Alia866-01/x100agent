"""
Motia Event Client

Отправляет events из FastAPI в Motia workflows
"""

import httpx
import os
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

MOTIA_URL = os.getenv("MOTIA_URL", "http://localhost:3001")


class MotiaClient:
    """Client для отправки events в Motia"""

    def __init__(self, base_url: str = MOTIA_URL):
        self.base_url = base_url
        logger.info(f"[MotiaClient] Initialized with base_url: {base_url}")

    async def emit_event(
        self,
        event_name: str,
        data: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Emit event to Motia workflow

        Args:
            event_name: Event name (e.g., "agent.provisioned")
            data: Event payload
            metadata: Optional metadata (user_id, tenant_id, etc)

        Returns:
            Response from Motia

        Example:
            await motia.emit_event("agent.provisioned", {
                "agent_id": "abc-123",
                "tenant_id": "tenant-456",
                "config": {...}
            })
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(
                    f"{self.base_url}/events/emit",
                    json={
                        "event": event_name,
                        "data": data,
                        "metadata": metadata or {}
                    }
                )

                response.raise_for_status()

                logger.info(f"[MotiaClient] Event emitted: {event_name}")
                logger.debug(f"[MotiaClient] Event data: {data}")

                return response.json()

        except httpx.HTTPError as e:
            logger.error(f"[MotiaClient] Failed to emit event {event_name}: {e}")
            # Don't raise - Motia может быть down, но FastAPI должен продолжать работать
            return {"status": "error", "message": str(e)}

        except Exception as e:
            logger.error(f"[MotiaClient] Unexpected error: {e}")
            return {"status": "error", "message": str(e)}

    async def check_health(self) -> bool:
        """Check if Motia is running"""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except:
            return False


# Singleton instance
_motia_client = None


def get_motia_client() -> MotiaClient:
    """Get singleton Motia client"""
    global _motia_client
    if _motia_client is None:
        _motia_client = MotiaClient()
    return _motia_client


# Convenience functions для common events

async def emit_agent_provisioned(agent_id: str, tenant_id: str, config: dict):
    """Emit agent.provisioned event"""
    motia = get_motia_client()
    return await motia.emit_event("agent.provisioned", {
        "agent_id": agent_id,
        "tenant_id": tenant_id,
        "config": config
    })


async def emit_message_received(
    agent_id: str,
    channel: str,
    from_id: str,
    content: str,
    metadata: dict = None
):
    """Emit message.received event"""
    motia = get_motia_client()
    return await motia.emit_event("message.received", {
        "agent_id": agent_id,
        "channel": channel,
        "from": from_id,
        "content": content,
        "metadata": metadata or {}
    })


async def emit_kb_uploaded(source_id: str, agent_id: str, file_url: str):
    """Emit kb.uploaded event"""
    motia = get_motia_client()
    return await motia.emit_event("kb.uploaded", {
        "source_id": source_id,
        "agent_id": agent_id,
        "file_url": file_url
    })
