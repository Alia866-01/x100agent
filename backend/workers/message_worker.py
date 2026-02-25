"""
Message Worker

ARQ worker that processes messages from queues and invokes agents.

This worker:
1. Pulls messages from ARQ queues (one per channel)
2. Loads agent configuration
3. Performs RAG retrieval if needed
4. Invokes the Sales Agent
5. Sends response via Channel Router
6. Stores messages in database
7. Logs to ClickHouse analytics

Usage:
    arq backend.workers.message_worker.WorkerSettings
"""

import os
import asyncio
from typing import Dict, Any
from datetime import datetime
from arq import create_pool
from arq.connections import RedisSettings

from backend.agents.sales_full import create_sales_agent_full
from backend.services.db import (
    get_channel_by_id,
    load_agent_config,
    get_or_create_conversation,
    get_conversation_history,
    store_message,
)
from backend.services.channel_router import ChannelRouter, send_typing_indicator
from backend.services.message_queue import move_to_dead_letter


async def process_message(ctx: Dict, message: Dict[str, Any]):
    """
    Main message processing function

    Args:
        ctx: ARQ context
        message: Normalized message dict from webhook
    """
    try:
        print(f"Processing message: {message['message_id']} from {message['channel_type']}")

        # 1. Load channel config
        channel = await get_channel_by_id(message["channel_id"])
        if not channel:
            raise ValueError(f"Channel not found: {message['channel_id']}")

        # 2. Load agent config
        agent_config = await load_agent_config(message["agent_id"])
        if not agent_config:
            raise ValueError(f"Agent not found: {message['agent_id']}")

        # Check if agent is active
        if agent_config["status"] != "active":
            print(f"Agent {message['agent_id']} is not active (status: {agent_config['status']})")
            return

        # 3. Get or create conversation
        conversation = await get_or_create_conversation(
            agent_id=message["agent_id"],
            channel_id=message["channel_id"],
            user_identifier=message["user_identifier"],
            tenant_id=message["tenant_id"],
        )

        # 4. Store incoming message
        await store_message(
            conversation_id=conversation["id"],
            tenant_id=message["tenant_id"],
            sender="user",
            content=message["content"],
        )

        # 5. Send typing indicator (optional)
        await send_typing_indicator(channel, message["user_identifier"])

        # 6. Get conversation history
        history = await get_conversation_history(conversation["id"], limit=50)

        # 7. RAG retrieval (✅ Implemented)
        rag_context = await perform_rag_retrieval(
            agent_id=message["agent_id"],
            query=message["content"],
        )

        # 8. Build agent context
        agent_context = {
            "conversation_history": history,
            "rag_context": rag_context,
            "user_identifier": message["user_identifier"],
            "channel_type": message["channel_type"],
        }

        # 9. Invoke Sales Agent
        sales_agent = create_sales_agent_full(
            config=agent_config.get("config", {}),
            tenant_id=message["tenant_id"],
            customer_id=message["user_identifier"],
            session_id=conversation["id"],
            agent_id=message["agent_id"]
        )

        # Format history for agent
        history_text = format_conversation_history(history)

        # Build prompt with context
        full_prompt = f"""
{history_text}

User: {message['content']}

{f"Relevant Knowledge Base Information:\\n{rag_context}" if rag_context else ""}

Please respond to the user's message.
"""

        # Run agent
        response = await sales_agent.arun(full_prompt)

        # Extract response content
        response_text = response.content if hasattr(response, 'content') else str(response)

        # 10. Send response via Channel Router
        send_result = await ChannelRouter.send_message(
            channel=channel,
            user_identifier=message["user_identifier"],
            content=response_text,
        )

        if "error" in send_result:
            raise ValueError(f"Failed to send message: {send_result['error']}")

        # 11. Store agent response
        await store_message(
            conversation_id=conversation["id"],
            tenant_id=message["tenant_id"],
            sender="agent",
            content=response_text,
        )

        # 12. Log to ClickHouse (✅ Implemented with graceful degradation)
        await log_to_clickhouse(message, response_text, agent_config)

        print(f"Message processed successfully: {message['message_id']}")

    except Exception as e:
        print(f"Error processing message {message.get('message_id')}: {e}")
        # Move to dead letter queue
        await move_to_dead_letter(
            queue_name=f"incoming_messages_{message['channel_type']}",
            message=message,
            error=str(e),
        )
        raise


async def perform_rag_retrieval(agent_id: str, query: str) -> str:
    """
    Perform RAG retrieval from knowledge base using pgvector

    Args:
        agent_id: UUID of agent
        query: User's query text

    Returns:
        Relevant context from knowledge base
    """
    try:
        # Import OpenAI for embeddings
        from openai import AsyncOpenAI
        from backend.services.db import get_db_connection

        # Initialize OpenAI client (compatible with OpenRouter)
        openai_client = AsyncOpenAI(
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1",
        )

        # 1. Generate embedding for query using text-embedding-3-small
        embedding_response = await openai_client.embeddings.create(
            model="openai/text-embedding-3-small",
            input=query,
        )
        query_embedding = embedding_response.data[0].embedding

        # 2. Perform vector similarity search in tenant_embeddings table
        # Using pgvector's <=> operator for cosine distance
        async with get_db_connection() as conn:
            # Get tenant_id from agent_config
            agent_result = await conn.fetchrow(
                "SELECT tenant_id FROM agents WHERE id = $1",
                agent_id
            )
            if not agent_result:
                return ""

            tenant_id = agent_result['tenant_id']

            # Search for similar embeddings
            results = await conn.fetch(
                """
                SELECT content, embedding <=> $1::vector as distance
                FROM tenant_embeddings
                WHERE tenant_id = $2
                ORDER BY embedding <=> $1::vector
                LIMIT 5
                """,
                query_embedding,
                tenant_id
            )

            # 3. Format and return top-k relevant chunks
            if not results:
                return ""

            context_chunks = []
            for row in results:
                # Only include chunks with reasonable similarity (distance < 0.5)
                if row['distance'] < 0.5:
                    context_chunks.append(row['content'])

            if not context_chunks:
                return ""

            return "\n\n".join(context_chunks)

    except Exception as e:
        print(f"RAG retrieval error: {e}")
        # Don't fail the whole message processing if RAG fails
        return ""


def format_conversation_history(history: list) -> str:
    """
    Format conversation history for agent context

    Args:
        history: List of message dicts

    Returns:
        Formatted string
    """
    if not history:
        return "Conversation History: (empty)"

    formatted = "Conversation History:\n"
    for msg in history:
        sender_label = "User" if msg["sender"] == "user" else "Agent"
        formatted += f"{sender_label}: {msg['content']}\n"

    return formatted


async def log_to_clickhouse(message: Dict, response: str, agent_config: Dict):
    """
    Log message metrics to ClickHouse for analytics

    Args:
        message: Original incoming message
        response: Agent's response
        agent_config: Agent configuration
    """
    try:
        # Only log if ClickHouse is configured
        clickhouse_host = os.getenv("CLICKHOUSE_HOST")
        if not clickhouse_host or clickhouse_host == "localhost":
            # ClickHouse not configured, skip logging
            return

        from clickhouse_driver import Client

        # Initialize ClickHouse client
        client = Client(
            host=os.getenv("CLICKHOUSE_HOST"),
            port=int(os.getenv("CLICKHOUSE_PORT", 9000)),
            user=os.getenv("CLICKHOUSE_USER", "default"),
            password=os.getenv("CLICKHOUSE_PASSWORD", ""),
            database=os.getenv("CLICKHOUSE_DATABASE", "ai01"),
        )

        # Prepare analytics data
        now = datetime.utcnow()
        analytics_data = {
            "timestamp": now,
            "tenant_id": message.get("tenant_id"),
            "agent_id": message.get("agent_id"),
            "channel_id": message.get("channel_id"),
            "channel_type": message.get("channel_type"),
            "user_identifier": message.get("user_identifier"),
            "message_id": message.get("message_id"),
            "message_content": message.get("content", "")[:500],  # Truncate for storage
            "response_content": response[:500],  # Truncate for storage
            "input_tokens": estimate_tokens(message.get("content", "")),
            "output_tokens": estimate_tokens(response),
            "model": agent_config.get("config", {}).get("model", "unknown"),
        }

        # Insert into messages_analytics table
        client.execute(
            """
            INSERT INTO messages_analytics (
                timestamp, tenant_id, agent_id, channel_id, channel_type,
                user_identifier, message_id, message_content, response_content,
                input_tokens, output_tokens, model
            ) VALUES (
                %(timestamp)s, %(tenant_id)s, %(agent_id)s, %(channel_id)s,
                %(channel_type)s, %(user_identifier)s, %(message_id)s,
                %(message_content)s, %(response_content)s, %(input_tokens)s,
                %(output_tokens)s, %(model)s
            )
            """,
            analytics_data,
        )

    except Exception as e:
        # Don't fail message processing if analytics logging fails
        print(f"ClickHouse logging error: {e}")


def estimate_tokens(text: str) -> int:
    """
    Estimate token count for text (rough approximation)

    Args:
        text: Input text

    Returns:
        Estimated token count
    """
    # Rough estimate: 1 token ≈ 4 characters for English text
    return len(text) // 4


# ===== ARQ Worker Configuration =====

async def startup(ctx: Dict):
    """
    Worker startup function - runs once when worker starts
    """
    print("Message worker starting up...")
    # Initialize connections, load models, etc.


async def shutdown(ctx: Dict):
    """
    Worker shutdown function - runs once when worker stops
    """
    print("Message worker shutting down...")
    # Cleanup connections


class WorkerSettings:
    """
    ARQ Worker Settings

    To run this worker:
        arq backend.workers.message_worker.WorkerSettings
    """

    functions = [process_message]
    on_startup = startup
    on_shutdown = shutdown

    # Redis connection for Upstash
    redis_settings = RedisSettings.from_dsn(os.getenv("UPSTASH_REDIS_REST_URL"))

    # Worker configuration
    max_jobs = 10  # Process up to 10 messages concurrently
    job_timeout = 300  # 5 minutes timeout per job
    keep_result = 3600  # Keep results for 1 hour

    # Queue names to listen to
    # Note: ARQ processes all queues, but we can prioritize specific ones
    queue_name = "arq:queue"  # Default ARQ queue name


# ===== Alternative: Separate workers per channel =====
# If you want dedicated workers per channel, create separate worker classes:

class WhatsAppWorkerSettings(WorkerSettings):
    queue_name = "incoming_messages_whatsapp"


class TelegramWorkerSettings(WorkerSettings):
    queue_name = "incoming_messages_telegram"


class InstagramWorkerSettings(WorkerSettings):
    queue_name = "incoming_messages_instagram"


class EmailWorkerSettings(WorkerSettings):
    queue_name = "incoming_messages_email"
