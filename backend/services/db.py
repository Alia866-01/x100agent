"""
Database Service

Handles database queries for channels, agents, conversations, etc.
Uses Neon PostgreSQL with RLS for multi-tenancy.
"""

import os
import asyncpg
from typing import Optional, Dict, List, Any
from contextlib import asynccontextmanager


DATABASE_URL = os.getenv("DATABASE_URL")


@asynccontextmanager
async def get_db_connection():
    """
    Async context manager for database connections
    """
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        yield conn
    except Exception as e:
        raise e
    finally:
        await conn.close()


async def get_channel_by_config(
    channel_type: str, config_key: str, config_value: str
) -> Optional[Dict[str, Any]]:
    """
    Find an agent channel by a specific config value

    Example:
        get_channel_by_config("whatsapp", "phone_number_id", "123456789")

    Args:
        channel_type: Type of channel (whatsapp, telegram, instagram, email)
        config_key: Key in the channel_config JSONB (e.g., "phone_number_id")
        config_value: Value to search for

    Returns:
        Channel dict or None
    """
    async with get_db_connection() as conn:
        query = """
            SELECT id, tenant_id, agent_id, channel_type, channel_config, is_active
            FROM agent_channels
            WHERE channel_type = $1
              AND channel_config->>$2 = $3
              AND is_active = true
        """
        result = await conn.fetchrow(query, channel_type, config_key, config_value)
        return dict(result) if result else None


async def get_channel_by_identifier(
    channel_type: str, user_identifier: str
) -> Optional[Dict[str, Any]]:
    """
    Find channel by user identifier (used for Telegram where we need to map chat_id to channel)

    This is a more complex query - might need to maintain a separate mapping table
    For now, returns None (implement as needed)
    """
    # TODO: Implement if needed (depends on architecture decision)
    return None


async def get_channel_by_id(channel_id: str) -> Optional[Dict[str, Any]]:
    """
    Get channel by ID
    """
    async with get_db_connection() as conn:
        query = """
            SELECT id, tenant_id, agent_id, channel_type, channel_config, is_active
            FROM agent_channels
            WHERE id = $1
        """
        result = await conn.fetchrow(query, channel_id)
        return dict(result) if result else None


async def get_agent_channels(agent_id: str) -> List[Dict[str, Any]]:
    """
    Get all active channels for an agent
    """
    async with get_db_connection() as conn:
        query = """
            SELECT id, tenant_id, agent_id, channel_type, channel_config, is_active, created_at
            FROM agent_channels
            WHERE agent_id = $1 AND is_active = true
            ORDER BY created_at DESC
        """
        results = await conn.fetch(query, agent_id)
        return [dict(row) for row in results]


async def create_channel(
    tenant_id: str,
    agent_id: str,
    channel_type: str,
    channel_config: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Create a new agent channel
    """
    async with get_db_connection() as conn:
        query = """
            INSERT INTO agent_channels (tenant_id, agent_id, channel_type, channel_config, is_active)
            VALUES ($1, $2, $3, $4, true)
            RETURNING id, tenant_id, agent_id, channel_type, channel_config, is_active, created_at
        """
        import json

        result = await conn.fetchrow(
            query, tenant_id, agent_id, channel_type, json.dumps(channel_config)
        )
        return dict(result)


async def update_channel_config(
    channel_id: str, channel_config: Dict[str, Any]
) -> bool:
    """
    Update channel configuration
    """
    async with get_db_connection() as conn:
        query = """
            UPDATE agent_channels
            SET channel_config = $1, updated_at = NOW()
            WHERE id = $2
        """
        import json

        result = await conn.execute(query, json.dumps(channel_config), channel_id)
        # asyncpg returns "UPDATE N" where N is row count
        return int(result.split()[-1]) > 0


async def toggle_channel(channel_id: str, is_active: bool) -> bool:
    """
    Activate or deactivate a channel
    """
    async with get_db_connection() as conn:
        query = """
            UPDATE agent_channels
            SET is_active = $1, updated_at = NOW()
            WHERE id = $2
        """
        result = await conn.execute(query, is_active, channel_id)
        return int(result.split()[-1]) > 0


async def delete_channel(channel_id: str) -> bool:
    """
    Delete a channel (will cascade delete conversations)
    """
    async with get_db_connection() as conn:
        query = "DELETE FROM agent_channels WHERE id = $1"
        result = await conn.execute(query, channel_id)
        return int(result.split()[-1]) > 0


async def get_or_create_conversation(
    agent_id: str, channel_id: str, user_identifier: str, tenant_id: str
) -> Dict[str, Any]:
    """
    Get existing conversation or create new one
    """
    async with get_db_connection() as conn:
        # Try to find existing conversation
        select_query = """
            SELECT id, tenant_id, agent_id, channel_id, user_identifier, status, created_at
            FROM conversations
            WHERE agent_id = $1 AND channel_id = $2 AND user_identifier = $3
            ORDER BY created_at DESC
            LIMIT 1
        """
        result = await conn.fetchrow(select_query, agent_id, channel_id, user_identifier)

        if result:
            return dict(result)

        # Create new conversation
        insert_query = """
            INSERT INTO conversations (tenant_id, agent_id, channel_id, user_identifier, status)
            VALUES ($1, $2, $3, $4, 'active')
            RETURNING id, tenant_id, agent_id, channel_id, user_identifier, status, created_at
        """
        result = await conn.fetchrow(insert_query, tenant_id, agent_id, channel_id, user_identifier)
        return dict(result)


async def get_conversation_history(
    conversation_id: str, limit: int = 50
) -> List[Dict[str, Any]]:
    """
    Get message history for a conversation
    """
    async with get_db_connection() as conn:
        query = """
            SELECT id, conversation_id, sender, content, timestamp
            FROM messages
            WHERE conversation_id = $1
            ORDER BY timestamp DESC
            LIMIT $2
        """
        results = await conn.fetch(query, conversation_id, limit)
        # Reverse to get chronological order
        return [dict(row) for row in reversed(results)]


async def store_message(
    conversation_id: str, tenant_id: str, sender: str, content: str
) -> Dict[str, Any]:
    """
    Store a message in the database

    Args:
        conversation_id: UUID of conversation
        tenant_id: UUID of tenant (for RLS)
        sender: 'user' or 'agent'
        content: Message text
    """
    async with get_db_connection() as conn:
        query = """
            INSERT INTO messages (conversation_id, tenant_id, sender, content, timestamp)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id, conversation_id, sender, content, timestamp
        """
        result = await conn.fetchrow(query, conversation_id, tenant_id, sender, content)
        return dict(result)


async def load_agent_config(agent_id: str) -> Optional[Dict[str, Any]]:
    """
    Load agent configuration from database
    """
    async with get_db_connection() as conn:
        query = """
            SELECT id, tenant_id, name, role_description, status, config
            FROM agents
            WHERE id = $1
        """
        result = await conn.fetchrow(query, agent_id)
        return dict(result) if result else None
