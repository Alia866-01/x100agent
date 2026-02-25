"""
Agents API - CRUD operations and agent invocation endpoint for Motia

This API provides:
1. POST /api/agents/invoke - Invoke Agno agent (called by Motia workflows)
2. GET /api/agents/:id - Load agent configuration from DB
3. POST /api/agents - Create new agent with Motia event emission
4. PATCH /api/agents/:id - Update agent configuration
5. DELETE /api/agents/:id - Soft delete agent
6. GET /api/agents - List all agents for tenant
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any, Dict
import asyncpg
import os
from datetime import datetime
import traceback

# Debug mode flag - set to False in production
DEBUG_MODE = os.getenv("DEBUG", "false").lower() == "true"

from backend.agents.sales_full import create_sales_agent_full
from backend.services.motia_client import emit_agent_provisioned

router = APIRouter()

# Database connection pool (shared)
db_pool = None

async def get_db_pool():
    """Get or create database connection pool"""
    global db_pool
    if db_pool is None:
        db_pool = await asyncpg.create_pool(
            dsn=os.getenv("DATABASE_URL"),
            min_size=2,
            max_size=10
        )
    return db_pool


async def close_db_pool():
    """Close database connection pool on shutdown"""
    global db_pool
    if db_pool is not None:
        await db_pool.close()
        db_pool = None
        print("[AgentsAPI] Database connection pool closed")


# === Request/Response Models ===

class InvokeAgentRequest(BaseModel):
    """Request to invoke an agent (called by Motia)"""
    agent_id: str = Field(..., max_length=100)
    message: str = Field(..., max_length=50000)  # 50KB max message length
    context: Optional[str] = Field(default="", max_length=100000)  # 100KB max context
    tenant_id: str = Field(..., max_length=100)
    customer_id: str = Field(..., max_length=100)  # Customer/user identifier for Level 3 isolation
    conversation_id: Optional[str] = Field(None, max_length=100)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @field_validator('metadata')
    @classmethod
    def validate_metadata_size(cls, v):
        """Prevent DoS via large metadata objects"""
        if v is None:
            return {}
        # Limit metadata to 100 keys and 10KB total size
        if len(v) > 100:
            raise ValueError("Metadata cannot have more than 100 keys")
        import json
        metadata_size = len(json.dumps(v))
        if metadata_size > 10000:
            raise ValueError("Metadata size cannot exceed 10KB")
        return v


class InvokeAgentResponse(BaseModel):
    """Response from agent invocation"""
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = []
    metadata: Optional[Dict[str, Any]] = {}


class CreateAgentRequest(BaseModel):
    """Request to create new agent"""
    tenant_id: str = Field(..., max_length=100)
    name: str = Field(..., max_length=200)
    config: Dict[str, Any] = Field(...)  # SalesAgentConfig from Platform Agent
    whatsapp_number: Optional[str] = Field(None, max_length=50)
    telegram_username: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=255)

    @field_validator('config')
    @classmethod
    def validate_config_size(cls, v):
        """Prevent DoS via large config objects"""
        import json
        config_size = len(json.dumps(v))
        if config_size > 100000:  # 100KB max config size
            raise ValueError("Agent config size cannot exceed 100KB")
        return v


class UpdateAgentRequest(BaseModel):
    """Request to update agent configuration"""
    config: Optional[Dict[str, Any]] = None
    name: Optional[str] = Field(None, max_length=200)
    is_active: Optional[bool] = None

    @field_validator('config')
    @classmethod
    def validate_config_size(cls, v):
        """Prevent DoS via large config objects"""
        if v is None:
            return None
        import json
        config_size = len(json.dumps(v))
        if config_size > 100000:  # 100KB max config size
            raise ValueError("Agent config size cannot exceed 100KB")
        return v


class AgentResponse(BaseModel):
    """Agent data response"""
    id: str
    tenant_id: str
    name: str
    config: Dict[str, Any]
    is_active: bool
    created_at: str
    updated_at: str


# === Core Endpoints ===

@router.post("/agents/invoke", response_model=InvokeAgentResponse)
async def invoke_agent(request: InvokeAgentRequest):
    """
    Invoke Agno Agent (called by Motia workflows)

    This is the critical endpoint that allows Motia to execute AI agent logic.
    Flow:
    1. Motia receives message.received event
    2. Motia calls this endpoint with message + context
    3. We load agent config from DB
    4. We create Sales Agent with session_id = conversation_id
    5. Agno automatically:
       - Loads conversation history for this session_id
       - Adds history to context
    6. We invoke agent.run() with message
    7. Agno automatically saves the message and response to DB
    8. We return response to Motia
    9. Motia sends response back to customer

    NOTE: Agno handles all session management automatically!
    """
    try:
        pool = await get_db_pool()

        # Load agent config from database
        async with pool.acquire() as conn:
            # Set tenant isolation (using set_config for parameterized query)
            await conn.execute("SELECT set_config('app.current_tenant', $1, false)", request.tenant_id)

            agent_row = await conn.fetchrow(
                "SELECT id, config, is_active FROM agents WHERE id = $1 AND tenant_id = $2",
                request.agent_id,
                request.tenant_id
            )

            if not agent_row:
                raise HTTPException(status_code=404, detail="Agent not found")

            if not agent_row['is_active']:
                raise HTTPException(status_code=400, detail="Agent is not active")

            agent_config = agent_row['config']

        # Create Sales Agent dynamically with session management
        # session_id = conversation_id ensures Agno tracks this conversation
        sales_agent = create_sales_agent_full(
            config=agent_config,
            tenant_id=request.tenant_id,
            customer_id=request.customer_id,
            session_id=request.conversation_id,  # ← Agno uses this for persistence
            agent_id=request.agent_id
        )

        # Build the full message with RAG context
        full_message = request.message
        if request.context:
            full_message = f"""Context from Knowledge Base:
{request.context}

Customer message:
{request.message}"""

        # Invoke agent
        print(f"[AgentsAPI] Invoking agent {request.agent_id} (session: {request.conversation_id})")

        # Agno automatically:
        # 1. Loads history for session_id from sales_agent_sessions table
        # 2. Adds history to context (last 5 messages as configured)
        # 3. Runs the agent
        # 4. Saves the message and response back to sales_agent_sessions table
        response = sales_agent.run(full_message)

        # Extract response content
        response_content = ""
        tool_calls = []

        if hasattr(response, 'content'):
            response_content = response.content
        elif isinstance(response, str):
            response_content = response
        else:
            response_content = str(response)

        # Check for tool calls in response
        if hasattr(response, 'tool_calls') and response.tool_calls:
            tool_calls = [
                {
                    "name": tc.name,
                    "arguments": tc.arguments,
                    "result": getattr(tc, 'result', None)
                }
                for tc in response.tool_calls
            ]

        print(f"[AgentsAPI] Agent responded with {len(response_content)} characters")
        if tool_calls:
            print(f"[AgentsAPI] Agent made {len(tool_calls)} tool calls")

        return InvokeAgentResponse(
            content=response_content,
            tool_calls=tool_calls,
            metadata={
                "agent_id": request.agent_id,
                "conversation_id": request.conversation_id,
                "session_id": request.conversation_id,  # Same as conversation_id
                "timestamp": datetime.utcnow().isoformat()
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        # Log full error details server-side
        print(f"[AgentsAPI] Error invoking agent: {e}")
        if DEBUG_MODE:
            print(traceback.format_exc())
        # Return generic error to client (don't expose internal details)
        error_detail = str(e) if DEBUG_MODE else "Agent invocation failed. Please try again later."
        raise HTTPException(status_code=500, detail=error_detail)


@router.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str, tenant_id: str = Header(..., alias="x-tenant-id")):
    """
    Get agent configuration by ID

    Used by:
    - Frontend to display agent details
    - Motia to load agent config (alternative to direct DB access)
    """
    try:
        pool = await get_db_pool()

        async with pool.acquire() as conn:
            await conn.execute("SELECT set_config('app.current_tenant', $1, false)", tenant_id)

            agent_row = await conn.fetchrow(
                """
                SELECT id, tenant_id, name, config, is_active, created_at, updated_at
                FROM agents
                WHERE id = $1 AND tenant_id = $2
                """,
                agent_id,
                tenant_id
            )

            if not agent_row:
                raise HTTPException(status_code=404, detail="Agent not found")

            return AgentResponse(
                id=str(agent_row['id']),
                tenant_id=str(agent_row['tenant_id']),
                name=agent_row['name'],
                config=agent_row['config'],
                is_active=agent_row['is_active'],
                created_at=agent_row['created_at'].isoformat(),
                updated_at=agent_row['updated_at'].isoformat()
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[AgentsAPI] Error fetching agent: {e}")
        if DEBUG_MODE:
            print(traceback.format_exc())
        error_detail = str(e) if DEBUG_MODE else "Failed to fetch agent. Please try again later."
        raise HTTPException(status_code=500, detail=error_detail)


@router.post("/agents", response_model=AgentResponse)
async def create_agent(request: CreateAgentRequest):
    """
    Create new agent and emit agent.provisioned event to Motia

    Flow:
    1. Save agent config to database
    2. Emit agent.provisioned event to Motia
    3. Motia handles:
       - Setting up Composio entity
       - Initializing tools
       - Provisioning webhooks (if WhatsApp/Telegram)
    """
    try:
        pool = await get_db_pool()

        async with pool.acquire() as conn:
            await conn.execute(f"SET app.current_tenant = '{request.tenant_id}'")

            # Insert agent into database
            agent_row = await conn.fetchrow(
                """
                INSERT INTO agents (tenant_id, name, config, is_active)
                VALUES ($1, $2, $3, true)
                RETURNING id, tenant_id, name, config, is_active, created_at, updated_at
                """,
                request.tenant_id,
                request.name,
                request.config
            )

            agent_id = str(agent_row['id'])

            # Insert channel configurations if provided
            if request.whatsapp_number:
                await conn.execute(
                    """
                    INSERT INTO agent_channels (agent_id, channel_type, channel_config, is_active)
                    VALUES ($1, 'whatsapp', $2, true)
                    """,
                    agent_id,
                    {"phone_number": request.whatsapp_number}
                )

            if request.telegram_username:
                await conn.execute(
                    """
                    INSERT INTO agent_channels (agent_id, channel_type, channel_config, is_active)
                    VALUES ($1, 'telegram', $2, true)
                    """,
                    agent_id,
                    {"username": request.telegram_username}
                )

            if request.email:
                await conn.execute(
                    """
                    INSERT INTO agent_channels (agent_id, channel_type, channel_config, is_active)
                    VALUES ($1, 'email', $2, true)
                    """,
                    agent_id,
                    {"email": request.email}
                )

        # Emit event to Motia for provisioning workflow
        print(f"[AgentsAPI] Emitting agent.provisioned event for agent {agent_id}")
        await emit_agent_provisioned(
            agent_id=agent_id,
            tenant_id=request.tenant_id,
            config=request.config
        )

        return AgentResponse(
            id=agent_id,
            tenant_id=str(agent_row['tenant_id']),
            name=agent_row['name'],
            config=agent_row['config'],
            is_active=agent_row['is_active'],
            created_at=agent_row['created_at'].isoformat(),
            updated_at=agent_row['updated_at'].isoformat()
        )

    except Exception as e:
        print(f"[AgentsAPI] Error creating agent: {e}")
        if DEBUG_MODE:
            print(traceback.format_exc())
        error_detail = str(e) if DEBUG_MODE else "Failed to create agent. Please try again later."
        raise HTTPException(status_code=500, detail=error_detail)


@router.patch("/agents/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    request: UpdateAgentRequest,
    tenant_id: str = Header(..., alias="x-tenant-id")
):
    """
    Update agent configuration

    Used by:
    - Assistant agent to apply configuration changes
    - Frontend settings page
    """
    try:
        pool = await get_db_pool()

        # Build dynamic update query
        update_fields = []
        update_values = []
        param_count = 1

        if request.config is not None:
            update_fields.append(f"config = ${param_count}")
            update_values.append(request.config)
            param_count += 1

        if request.name is not None:
            update_fields.append(f"name = ${param_count}")
            update_values.append(request.name)
            param_count += 1

        if request.is_active is not None:
            update_fields.append(f"is_active = ${param_count}")
            update_values.append(request.is_active)
            param_count += 1

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_fields.append(f"updated_at = NOW()")
        update_values.extend([agent_id, tenant_id])

        async with pool.acquire() as conn:
            await conn.execute("SELECT set_config('app.current_tenant', $1, false)", tenant_id)

            query = f"""
                UPDATE agents
                SET {', '.join(update_fields)}
                WHERE id = ${param_count} AND tenant_id = ${param_count + 1}
                RETURNING id, tenant_id, name, config, is_active, created_at, updated_at
            """

            agent_row = await conn.fetchrow(query, *update_values)

            if not agent_row:
                raise HTTPException(status_code=404, detail="Agent not found")

            return AgentResponse(
                id=str(agent_row['id']),
                tenant_id=str(agent_row['tenant_id']),
                name=agent_row['name'],
                config=agent_row['config'],
                is_active=agent_row['is_active'],
                created_at=agent_row['created_at'].isoformat(),
                updated_at=agent_row['updated_at'].isoformat()
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[AgentsAPI] Error updating agent: {e}")
        if DEBUG_MODE:
            print(traceback.format_exc())
        error_detail = str(e) if DEBUG_MODE else "Failed to update agent. Please try again later."
        raise HTTPException(status_code=500, detail=error_detail)


@router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str, tenant_id: str = Header(..., alias="x-tenant-id")):
    """
    Soft delete agent (set is_active = false)
    """
    try:
        pool = await get_db_pool()

        async with pool.acquire() as conn:
            await conn.execute("SELECT set_config('app.current_tenant', $1, false)", tenant_id)

            result = await conn.execute(
                """
                UPDATE agents
                SET is_active = false, updated_at = NOW()
                WHERE id = $1 AND tenant_id = $2
                """,
                agent_id,
                tenant_id
            )

            if result == "UPDATE 0":
                raise HTTPException(status_code=404, detail="Agent not found")

            return {"status": "deleted", "agent_id": agent_id}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[AgentsAPI] Error deleting agent: {e}")
        if DEBUG_MODE:
            print(traceback.format_exc())
        error_detail = str(e) if DEBUG_MODE else "Failed to delete agent. Please try again later."
        raise HTTPException(status_code=500, detail=error_detail)


@router.get("/agents", response_model=List[AgentResponse])
async def list_agents(
    tenant_id: str = Header(..., alias="x-tenant-id"),
    include_inactive: bool = False
):
    """
    List all agents for tenant

    Used by:
    - Frontend dashboard to show agent cards
    """
    try:
        pool = await get_db_pool()

        async with pool.acquire() as conn:
            await conn.execute("SELECT set_config('app.current_tenant', $1, false)", tenant_id)

            query = """
                SELECT id, tenant_id, name, config, is_active, created_at, updated_at
                FROM agents
                WHERE tenant_id = $1
            """

            if not include_inactive:
                query += " AND is_active = true"

            query += " ORDER BY created_at DESC"

            rows = await conn.fetch(query, tenant_id)

            return [
                AgentResponse(
                    id=str(row['id']),
                    tenant_id=str(row['tenant_id']),
                    name=row['name'],
                    config=row['config'],
                    is_active=row['is_active'],
                    created_at=row['created_at'].isoformat(),
                    updated_at=row['updated_at'].isoformat()
                )
                for row in rows
            ]

    except Exception as e:
        print(f"[AgentsAPI] Error listing agents: {e}")
        if DEBUG_MODE:
            print(traceback.format_exc())
        error_detail = str(e) if DEBUG_MODE else "Failed to list agents. Please try again later."
        raise HTTPException(status_code=500, detail=error_detail)


@router.get("/agents/{agent_id}/stats")
async def get_agent_stats(agent_id: str, tenant_id: str = Header(..., alias="x-tenant-id")):
    """
    Get agent statistics

    Returns:
    - Total messages
    - Response time average
    - Conversion rate (if tracked)
    - Last activity
    """
    try:
        pool = await get_db_pool()

        async with pool.acquire() as conn:
            await conn.execute("SELECT set_config('app.current_tenant', $1, false)", tenant_id)

            # Verify agent exists
            agent_exists = await conn.fetchval(
                "SELECT EXISTS(SELECT 1 FROM agents WHERE id = $1 AND tenant_id = $2)",
                agent_id,
                tenant_id
            )

            if not agent_exists:
                raise HTTPException(status_code=404, detail="Agent not found")

            # Get message stats
            stats = await conn.fetchrow(
                """
                SELECT
                    COUNT(*) as total_messages,
                    COUNT(DISTINCT conversation_id) as total_conversations,
                    MAX(created_at) as last_activity
                FROM messages
                WHERE agent_id = $1
                """,
                agent_id
            )

            return {
                "agent_id": agent_id,
                "total_messages": stats['total_messages'] or 0,
                "total_conversations": stats['total_conversations'] or 0,
                "last_activity": stats['last_activity'].isoformat() if stats['last_activity'] else None,
                "avg_response_time_seconds": None,  # TODO: Calculate from message timestamps
                "conversion_rate": None,  # TODO: Track conversions
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[AgentsAPI] Error fetching agent stats: {e}")
        if DEBUG_MODE:
            print(traceback.format_exc())
        error_detail = str(e) if DEBUG_MODE else "Failed to fetch agent stats. Please try again later."
        raise HTTPException(status_code=500, detail=error_detail)
