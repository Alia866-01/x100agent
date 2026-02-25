"""
Message Queue Service

Handles pushing messages to ARQ queues (via Upstash Redis)
and provides utility functions for queue management.
"""

import os
import json
from typing import Dict, Any
from redis import Redis
from arq import create_pool
from arq.connections import RedisSettings


# Initialize Redis connection for Upstash (lazy loading)
redis_client = None

def get_redis_client():
    """Get or create Redis client"""
    global redis_client
    if redis_client is None:
        redis_url = os.getenv("UPSTASH_REDIS_REST_URL")
        if not redis_url or redis_url == "https://your-project.upstash.io":
            raise RuntimeError("UPSTASH_REDIS_REST_URL not configured")
        redis_client = Redis.from_url(redis_url, decode_responses=True)
    return redis_client


async def push_to_queue(queue_name: str, message: Dict[str, Any]) -> bool:
    """
    Push a message to an ARQ queue

    Args:
        queue_name: Name of the queue (e.g., "incoming_messages_whatsapp")
        message: Normalized message dict

    Returns:
        True if successful, False otherwise
    """
    try:
        # Using Redis LPUSH to add to queue
        # ARQ workers will BRPOP from this queue
        client = get_redis_client()
        client.lpush(queue_name, json.dumps(message))
        return True
    except Exception as e:
        print(f"Error pushing to queue {queue_name}: {e}")
        return False


async def get_queue_length(queue_name: str) -> int:
    """
    Get the current length of a queue
    """
    try:
        client = get_redis_client()
        return client.llen(queue_name)
    except Exception as e:
        print(f"Error getting queue length for {queue_name}: {e}")
        return 0


async def clear_queue(queue_name: str) -> bool:
    """
    Clear all messages from a queue (use with caution!)
    """
    try:
        client = get_redis_client()
        client.delete(queue_name)
        return True
    except Exception as e:
        print(f"Error clearing queue {queue_name}: {e}")
        return False


# Queue names
QUEUE_WHATSAPP = "incoming_messages_whatsapp"
QUEUE_TELEGRAM = "incoming_messages_telegram"
QUEUE_INSTAGRAM = "incoming_messages_instagram"
QUEUE_EMAIL = "incoming_messages_email"
QUEUE_DEAD_LETTER = "dead_letter_queue"


async def move_to_dead_letter(queue_name: str, message: Dict[str, Any], error: str):
    """
    Move a failed message to the dead letter queue
    """
    dead_letter_message = {
        "original_queue": queue_name,
        "message": message,
        "error": error,
        "timestamp": message.get("timestamp"),
    }
    await push_to_queue(QUEUE_DEAD_LETTER, dead_letter_message)
