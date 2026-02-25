# Agno Framework Integration — X100 Platform

**Complete guide for integrating Agno agents in X100 multi-tenant SaaS**

Last Updated: 2026-02-17

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Core Architecture](#core-architecture)
3. [Database Configuration](#database-configuration)
4. [Creating Agents](#creating-agents)
5. [Knowledge Base (RAG)](#knowledge-base-rag)
6. [Memory & Sessions](#memory--sessions)
7. [Custom Toolkits](#custom-toolkits)
8. [Multi-Tenant Isolation](#multi-tenant-isolation)
9. [Agent Invocation API](#agent-invocation-api)
10. [Complete Examples](#complete-examples)

---

## Installation & Setup

### Install Agno

```bash
pip install agno
pip install agno[postgres]           # PostgreSQL + pgvector support
pip install psycopg psycopg-binary   # Postgres driver (required for Neon)
pip install sqlalchemy               # Required by agno DB classes
```

### Environment Variables

```env
# .env.local or .env
DATABASE_URL="postgresql://neondb_owner:password@ep-xxx.aws.neon.tech/neondb?sslmode=require"
ANTHROPIC_API_KEY="sk-ant-..."       # For Claude models
OPENAI_API_KEY="sk-..."              # For embeddings (text-embedding-3-small)
```

---

## Core Architecture

### X100 + Agno Integration Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│                 User creates/manages agents                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ POST /api/agents/invoke
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (FastAPI) — Agent Manager               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Agent Factory: Creates Agno Agent instances         │  │
│  │  - Loads config from agents table (PostgreSQL)       │  │
│  │  - Injects tenant-specific toolkits                  │  │
│  │  - Sets up knowledge base per agent                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Agno Agent (Runtime)                                │  │
│  │  - Claude Sonnet 4.5                                 │  │
│  │  - PostgresDb for sessions + memory                  │  │
│  │  - PgVector for RAG knowledge                        │  │
│  │  - Custom toolkits (WhatsApp, CRM, Calendar, etc.)  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│          Neon PostgreSQL (Multi-tenant Database)             │
│                                                              │
│  - agents table (user-created agents config)                │
│  - agno_sessions (chat history per agent/user)              │
│  - agno_user_memories (persistent user facts)               │
│  - knowledge_* tables (pgvector for each agent)             │
│  - tenant isolation via tenant_id + RLS                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Configuration

### Neon PostgreSQL Connection

Agno requires specific URL format:

```python
# ❌ WRONG (standard psycopg)
DATABASE_URL = "postgresql://user:pass@host/db"

# ✅ CORRECT (agno format with psycopg driver)
DATABASE_URL = "postgresql+psycopg://user:pass@host/db?sslmode=require"
```

### Setup Database

```python
from agno.db.postgres import PostgresDb

# Neon connection (convert standard URL to agno format)
def get_agno_db_url(standard_url: str) -> str:
    """Convert standard PostgreSQL URL to Agno format."""
    if standard_url.startswith("postgresql://"):
        return standard_url.replace("postgresql://", "postgresql+psycopg://")
    return standard_url

DATABASE_URL = get_agno_db_url(os.getenv("DATABASE_URL"))

# Create shared DB instance (reuse across all agents)
db = PostgresDb(db_url=DATABASE_URL)
```

**Important**: Create ONE `PostgresDb` instance and share it across all agents in your application.

### Enable pgvector Extension

```sql
-- Run once on your Neon database
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Creating Agents

### Basic Agent Pattern

```python
from agno.agent import Agent
from agno.models.anthropic import Claude

agent = Agent(
    name="CustomerSupportAgent",
    model=Claude(id="claude-sonnet-4-5-20250929"),
    instructions=[
        "You are a customer support agent for X100 platform.",
        "Be helpful, professional, and concise.",
        "Always respond in the language the user writes in.",
    ],
    db=db,  # Shared PostgresDb instance
    markdown=False,  # Disable markdown (for WhatsApp/Telegram compatibility)
)
```

### Full Agent Configuration (X100 Pattern)

```python
from agno.agent import Agent
from agno.models.anthropic import Claude
from agno.db.postgres import PostgresDb

def create_agent(
    agent_config: dict,        # From agents table in database
    tenant_id: str,            # Multi-tenant isolation
    db: PostgresDb,            # Shared database instance
    toolkits: list,            # Tenant-specific toolkits
    knowledge_base = None,     # Optional RAG knowledge
) -> Agent:
    """
    Create Agno agent instance from X100 agent config.

    Args:
        agent_config: Agent configuration from database (agents table)
        tenant_id: Tenant UUID for isolation
        db: Shared PostgresDb instance
        toolkits: List of Toolkit instances (WhatsApp, CRM, etc.)
        knowledge_base: Optional Knowledge instance for RAG

    Returns:
        Agent: Configured Agno agent ready to run
    """
    agent = Agent(
        # Identity
        name=agent_config["name"],
        model=Claude(id="claude-sonnet-4-5-20250929"),
        description=agent_config.get("description", ""),
        instructions=agent_config.get("instructions", []),

        # Database (sessions, memory, history)
        db=db,

        # Knowledge / RAG (if provided)
        knowledge=knowledge_base,
        search_knowledge=True if knowledge_base else False,
        add_knowledge_to_context=False,  # Agentic RAG: agent decides when to search

        # Memory (user-level persistent facts)
        enable_user_memories=agent_config.get("enable_memory", True),
        update_memory_on_run=True,
        add_memories_to_context=True,

        # Chat history (session-level)
        add_history_to_context=True,
        num_history_runs=agent_config.get("num_history_runs", 10),

        # Tools
        tools=toolkits,

        # Multi-tenant context injection
        session_state={"tenant_id": tenant_id},
        add_session_state_to_context=True,

        # Output formatting
        markdown=False,  # WhatsApp/Telegram don't render markdown

        # Reliability
        retries=3,
        delay_between_retries=2,

        # Debug
        debug_mode=agent_config.get("debug_mode", False),
    )

    return agent
```

---

## Knowledge Base (RAG)

### Setup Knowledge Base with PgVector

Each agent gets its own knowledge table in the database:

```python
from agno.knowledge.knowledge import Knowledge
from agno.vectordb.pgvector import PgVector, SearchType
from agno.knowledge.embedder.openai import OpenAIEmbedder

def create_knowledge_base(
    agent_id: str,
    tenant_id: str,
    db_url: str,
) -> Knowledge:
    """
    Create knowledge base for an agent.

    Each agent has its own pgvector table: knowledge_{agent_id}
    """
    knowledge = Knowledge(
        name=f"knowledge_{agent_id}",
        vector_db=PgVector(
            table_name=f"knowledge_{agent_id}",  # Unique per agent
            db_url=db_url,
            search_type=SearchType.hybrid,  # Vector + keyword search (best results)
            embedder=OpenAIEmbedder(
                id="text-embedding-3-small",
                dimensions=1536,
            ),
        ),
    )

    return knowledge
```

### Add Knowledge to Agent

```python
# Add text content
await knowledge.ainsert(
    name="product_info",
    text="Our platform allows you to deploy AI agents across WhatsApp, Telegram, and Email...",
    metadata={
        "tenant_id": tenant_id,
        "agent_id": agent_id,
        "category": "product",
    },
)

# Add from URL (PDF, webpage)
await knowledge.ainsert(
    name="user_manual",
    url="https://x100.ai/docs/user-manual.pdf",
    metadata={
        "tenant_id": tenant_id,
        "agent_id": agent_id,
        "category": "documentation",
    },
)

# Add from file
await knowledge.ainsert(
    name="company_faq",
    path="/path/to/faq.txt",
    metadata={
        "tenant_id": tenant_id,
        "agent_id": agent_id,
        "category": "faq",
    },
)
```

### Knowledge Filters (Multi-tenant Isolation)

Always filter knowledge by tenant:

```python
agent = Agent(
    knowledge=knowledge_base,
    search_knowledge=True,
    # Restrict knowledge search to this tenant only
    knowledge_filters={"tenant_id": tenant_id},
)

# Or pass filters at runtime
response = await agent.arun(
    "What features are available?",
    knowledge_filters={
        "tenant_id": tenant_id,
        "category": "product",
    },
)
```

---

## Memory & Sessions

### User Memory (Persistent Facts)

Memory stores learned facts about users across sessions:

```python
agent = Agent(
    db=db,
    enable_user_memories=True,      # Auto-extract and store memory after each run
    update_memory_on_run=True,       # Update existing memories
    add_memories_to_context=True,    # Inject memories into context
)

# Run agent with user context
response = await agent.arun(
    input="I prefer responses in Russian",
    user_id=f"{tenant_id}_{customer_phone}",  # Tenant + customer phone
    session_id=f"wa_{tenant_id}_{customer_phone}",
)

# Agent automatically remembers: "User prefers Russian language"
# On next run, this memory is automatically injected into context
```

### Session Management (Conversation History)

Sessions track conversation history per user:

```python
# Each channel conversation is one session
session_id = f"wa_{tenant_id}_{customer_phone}"   # WhatsApp
session_id = f"tg_{tenant_id}_{customer_id}"      # Telegram
session_id = f"email_{tenant_id}_{customer_email}" # Email

response = await agent.arun(
    input="What is your pricing?",
    user_id=f"{tenant_id}_{customer_phone}",
    session_id=session_id,
    add_history_to_context=True,  # Include past messages
)
```

### Read Memories Programmatically

```python
# Get all memories for a user
memories = await agent.aget_user_memories(
    user_id=f"{tenant_id}_{customer_phone}"
)

for memory in memories:
    print(f"Memory: {memory.memory}")
    print(f"Created: {memory.created_at}")
```

---

## Custom Toolkits

### WhatsApp Toolkit Example

```python
from agno.tools import Toolkit
from agno.utils.log import logger
import httpx

class WhatsAppToolkit(Toolkit):
    """WhatsApp messaging toolkit for X100 agents."""

    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        self.base_url = "https://api.whatsapp.com"  # Or ManyChat/Twilio API

        tools = [
            self.send_message,
            self.send_image,
        ]

        super().__init__(name="whatsapp_tools", tools=tools, **kwargs)

    def send_message(self, phone_number: str, text: str) -> str:
        """
        Send a WhatsApp message to a phone number.

        Args:
            phone_number: Recipient phone number (e.g., "+79991234567")
            text: Message text to send

        Returns:
            str: "success" or error description
        """
        try:
            response = httpx.post(
                f"{self.base_url}/v1/messages",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "to": phone_number,
                    "type": "text",
                    "text": {"body": text},
                },
                timeout=10,
            )
            response.raise_for_status()
            return "success"
        except Exception as e:
            logger.error(f"WhatsAppToolkit.send_message failed: {e}")
            return f"error: {str(e)}"

    async def asend_message(self, phone_number: str, text: str) -> str:
        """Async version of send_message."""
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(
                    f"{self.base_url}/v1/messages",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "to": phone_number,
                        "type": "text",
                        "text": {"body": text},
                    },
                )
                response.raise_for_status()
                return "success"
        except Exception as e:
            logger.error(f"WhatsAppToolkit.asend_message failed: {e}")
            return f"error: {str(e)}"
```

### CRM Toolkit Example

```python
class CRMToolkit(Toolkit):
    """CRM integration toolkit for X100 agents."""

    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        self.base_url = "https://api.composio.dev"

        tools = [
            self.create_contact,
            self.update_deal,
        ]

        super().__init__(name="crm_tools", tools=tools, **kwargs)

    async def acreate_contact(
        self,
        email: str,
        name: str,
        phone: str,
        tenant_id: str,
    ) -> str:
        """
        Create a new contact in CRM.

        Args:
            email: Contact email address
            name: Contact full name
            phone: Contact phone number
            tenant_id: Tenant UUID (for multi-tenant isolation)

        Returns:
            str: Contact ID or error description
        """
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(
                    f"{self.base_url}/objects/contacts",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "data": {
                            "values": {
                                "email_addresses": [{"email_address": email}],
                                "name": [{"first_name": name}],
                                "phone_numbers": [{"phone_number": phone}],
                                "custom_fields": {
                                    "tenant_id": tenant_id,
                                },
                            }
                        }
                    },
                )
                response.raise_for_status()
                data = response.json()
                contact_id = data["data"]["id"]["object_id"]
                return f"contact_created: {contact_id}"
        except Exception as e:
            logger.error(f"CRMToolkit.acreate_contact failed: {e}")
            return f"error: {str(e)}"
```

### Attach Toolkits to Agent

```python
# Create toolkit instances
whatsapp = WhatsAppToolkit(api_key=settings.WHATSAPP_API_KEY)

# For CRM integrations, use Composio (supports HubSpot, Salesforce, Pipedrive, etc.)
# See docs/COMPOSIO_INTEGRATIONS.md for complete guide
from composio import ComposioToolSet, App

composio_tools = ComposioToolSet(
    api_key=settings.COMPOSIO_API_KEY,
    entity_id=f"tenant_{tenant_id}"
).get_tools(apps=[App.HUBSPOT])

# Attach to agent
agent = Agent(
    tools=[whatsapp, *composio_tools],
    ...
)
```

**Note**: For CRM and other third-party integrations, we recommend using **Composio** which provides unified access to 800+ tools. See `docs/COMPOSIO_INTEGRATIONS.md` for the complete integration guide.

---

## Multi-Tenant Isolation

### Pattern for Multi-Tenant Agents

```python
async def invoke_agent(
    agent_id: str,
    tenant_id: str,
    customer_id: str,
    message: str,
    channel: str,  # "whatsapp" | "telegram" | "email"
) -> str:
    """
    Invoke agent with multi-tenant context.

    Args:
        agent_id: Agent UUID from agents table
        tenant_id: Tenant UUID
        customer_id: Customer phone/email/telegram_id
        message: Customer message
        channel: Communication channel

    Returns:
        str: Agent response
    """
    # Load agent config from database
    agent_config = await get_agent_config(agent_id, tenant_id)

    # Create tenant-specific toolkits
    toolkits = create_tenant_toolkits(tenant_id, channel)

    # Create knowledge base (if agent has knowledge enabled)
    knowledge = None
    if agent_config.get("enable_knowledge", False):
        knowledge = create_knowledge_base(agent_id, tenant_id, DATABASE_URL)

    # Create agent instance
    agent = create_agent(
        agent_config=agent_config,
        tenant_id=tenant_id,
        db=db,
        toolkits=toolkits,
        knowledge_base=knowledge,
    )

    # Create session ID (tenant + channel + customer)
    session_id = f"{channel}_{tenant_id}_{customer_id}"
    user_id = f"{tenant_id}_{customer_id}"

    # Run agent with multi-tenant context
    response = await agent.arun(
        input=message,
        user_id=user_id,
        session_id=session_id,
        # Inject tenant context into session state
        session_state={
            "tenant_id": tenant_id,
            "agent_id": agent_id,
            "channel": channel,
            "customer_id": customer_id,
        },
        add_session_state_to_context=True,
    )

    return response.content
```

### Database Queries with Tenant Isolation

Always filter by `tenant_id`:

```python
async def get_agent_config(agent_id: str, tenant_id: str) -> dict:
    """Load agent config with tenant isolation."""
    async with db_pool.acquire() as conn:
        result = await conn.fetchrow(
            """
            SELECT id, tenant_id, name, config, is_active
            FROM agents
            WHERE id = $1 AND tenant_id = $2 AND is_active = true
            """,
            agent_id,
            tenant_id,
        )

        if not result:
            raise ValueError(f"Agent {agent_id} not found for tenant {tenant_id}")

        return dict(result)
```

---

## Agent Invocation API

### FastAPI Endpoint Pattern

```python
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class InvokeAgentRequest(BaseModel):
    agent_id: str
    tenant_id: str
    customer_id: str
    message: str
    channel: str  # "whatsapp" | "telegram" | "email"

class InvokeAgentResponse(BaseModel):
    response: str
    session_id: str
    user_id: str

@router.post("/agents/invoke", response_model=InvokeAgentResponse)
async def invoke_agent_endpoint(request: InvokeAgentRequest):
    """
    Invoke an agent with a customer message.

    This endpoint:
    1. Loads agent config from database
    2. Creates Agno agent instance
    3. Runs agent with customer message
    4. Returns agent response
    """
    try:
        # Validate tenant has access to agent
        agent_config = await get_agent_config(request.agent_id, request.tenant_id)

        # Invoke agent
        response_text = await invoke_agent(
            agent_id=request.agent_id,
            tenant_id=request.tenant_id,
            customer_id=request.customer_id,
            message=request.message,
            channel=request.channel,
        )

        session_id = f"{request.channel}_{request.tenant_id}_{request.customer_id}"
        user_id = f"{request.tenant_id}_{request.customer_id}"

        return InvokeAgentResponse(
            response=response_text,
            session_id=session_id,
            user_id=user_id,
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Agent invocation failed: {e}")
        raise HTTPException(status_code=500, detail="Agent invocation failed")
```

---

## Complete Examples

### Example 1: Sales Agent with CRM Integration

```python
from agno.agent import Agent
from agno.models.anthropic import Claude
from agno.db.postgres import PostgresDb

# Setup
db = PostgresDb(db_url=DATABASE_URL)
crm = CRMToolkit(api_key=settings.COMPOSIO_API_KEY)
whatsapp = WhatsAppToolkit(api_key=settings.WHATSAPP_API_KEY)

# Create agent
sales_agent = Agent(
    name="SalesAgent",
    model=Claude(id="claude-sonnet-4-5-20250929"),
    description="Sales agent that qualifies leads and creates CRM records",
    instructions=[
        "You are a sales agent for X100 AI platform.",
        "Qualify leads by asking about their use case, company size, and timeline.",
        "After qualifying, create a contact in CRM with the lead information.",
        "Always be professional and helpful.",
    ],
    db=db,
    tools=[crm, whatsapp],
    enable_user_memories=True,
    add_history_to_context=True,
    markdown=False,
)

# Run agent
response = await sales_agent.arun(
    input="Hi, I'm interested in deploying AI agents for customer support",
    user_id="tenant_123_+79991234567",
    session_id="wa_tenant_123_+79991234567",
)

print(response.content)
# Agent response: "Great! I'd love to help you with that. Can you tell me more about your company? How many customer support requests do you handle per month?"
```

### Example 2: Support Agent with Knowledge Base

```python
# Setup knowledge base
knowledge = create_knowledge_base(
    agent_id="agent_456",
    tenant_id="tenant_123",
    db_url=DATABASE_URL,
)

# Add documentation
await knowledge.ainsert(
    name="user_guide",
    url="https://x100.ai/docs/user-guide.pdf",
    metadata={"tenant_id": "tenant_123", "category": "documentation"},
)

await knowledge.ainsert(
    name="faq",
    text="""
    Q: How do I create an agent?
    A: Go to Dashboard → My Workforce → Deploy Agent

    Q: What channels are supported?
    A: WhatsApp, Telegram, and Email

    Q: How much does it cost?
    A: We have Free, Pro ($99/mo), and Enterprise ($499/mo) plans
    """,
    metadata={"tenant_id": "tenant_123", "category": "faq"},
)

# Create support agent
support_agent = Agent(
    name="SupportAgent",
    model=Claude(id="claude-sonnet-4-5-20250929"),
    description="Customer support agent with access to documentation",
    instructions=[
        "You are a customer support agent for X100 platform.",
        "Search the knowledge base when customers ask questions about features or pricing.",
        "If you can't find the answer, apologize and offer to escalate.",
        "Always be helpful and professional.",
    ],
    db=db,
    knowledge=knowledge,
    search_knowledge=True,  # Agentic RAG
    knowledge_filters={"tenant_id": "tenant_123"},
    enable_user_memories=True,
    add_history_to_context=True,
    markdown=False,
)

# Run agent
response = await support_agent.arun(
    input="How much does the Pro plan cost?",
    user_id="tenant_123_customer@example.com",
    session_id="email_tenant_123_customer@example.com",
)

print(response.content)
# Agent searches knowledge base and responds: "The Pro plan costs $99 per month and includes unlimited agents, all channels, and priority support."
```

### Example 3: Multi-Agent Team (Supervisor Pattern)

```python
from agno.team import Team

# Create specialist agents
dialog_agent = Agent(
    name="DialogAgent",
    model=Claude(id="claude-sonnet-4-5-20250929"),
    role="Handles customer conversations",
    tools=[whatsapp],
    db=db,
)

crm_agent = Agent(
    name="CRMAgent",
    model=Claude(id="claude-sonnet-4-5-20250929"),
    role="Creates and updates CRM records",
    tools=[crm],
    db=db,
)

support_agent = Agent(
    name="SupportAgent",
    model=Claude(id="claude-sonnet-4-5-20250929"),
    role="Answers questions using knowledge base",
    knowledge=knowledge,
    search_knowledge=True,
    db=db,
)

# Create supervisor team
supervisor = Team(
    name="CustomerServiceTeam",
    model=Claude(id="claude-sonnet-4-5-20250929"),
    mode="coordinate",  # Supervisor coordinates agents
    members=[dialog_agent, crm_agent, support_agent],
    instructions=[
        "You coordinate a team of customer service agents.",
        "Delegate tasks to the right specialist agents.",
        "For new leads: use CRMAgent to create contact, then DialogAgent to respond.",
        "For questions: use SupportAgent to search knowledge, then DialogAgent to respond.",
    ],
    db=db,
    enable_user_memories=True,
    add_history_to_context=True,
    markdown=False,
)

# Run supervisor
response = await supervisor.arun(
    input="Hi, I'm John from Acme Corp. We want to deploy AI agents for our support team.",
    user_id="tenant_123_+79991234567",
    session_id="wa_tenant_123_+79991234567",
)

print(response.content)
# Supervisor delegates to CRMAgent (create contact) and DialogAgent (respond)
```

---

## Database Schema for User-Created Agents

### Agents Table

```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Agent configuration (JSONB)
    config JSONB NOT NULL DEFAULT '{
        "role": "Customer Support",
        "instructions": [],
        "model": "claude-sonnet-4-5-20250929",
        "enable_memory": true,
        "enable_knowledge": false,
        "num_history_runs": 10,
        "temperature": 0.7,
        "debug_mode": false
    }'::jsonb,

    -- Status
    is_active BOOLEAN DEFAULT true,
    deployment_status VARCHAR(50) DEFAULT 'draft', -- draft | deploying | active | paused | error

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    -- Indexes for performance
    CONSTRAINT agents_tenant_id_name_unique UNIQUE(tenant_id, name)
);

CREATE INDEX idx_agents_tenant_id ON agents(tenant_id);
CREATE INDEX idx_agents_is_active ON agents(is_active);
CREATE INDEX idx_agents_deployment_status ON agents(deployment_status);

-- Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY agents_tenant_isolation ON agents
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### Agent Channels Table

```sql
CREATE TABLE agent_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Channel type
    channel_type VARCHAR(50) NOT NULL, -- whatsapp | telegram | email | web

    -- Channel configuration (JSONB)
    channel_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Example for WhatsApp: {"phone_number": "+1234567890", "api_key": "..."}
    -- Example for Telegram: {"bot_token": "...", "webhook_url": "..."}

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT agent_channels_unique UNIQUE(agent_id, channel_type)
);

CREATE INDEX idx_agent_channels_agent_id ON agent_channels(agent_id);
CREATE INDEX idx_agent_channels_tenant_id ON agent_channels(tenant_id);

ALTER TABLE agent_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY agent_channels_tenant_isolation ON agent_channels
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### Agent Integrations Table (Composio)

```sql
CREATE TABLE agent_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Integration info
    app_name VARCHAR(100) NOT NULL, -- gmail | calendar | hubspot | slack etc.
    connection_id VARCHAR(255), -- Composio connection ID

    -- Connection status
    is_connected BOOLEAN DEFAULT false,
    connection_status VARCHAR(50) DEFAULT 'pending', -- pending | connected | error | expired

    -- OAuth metadata
    oauth_metadata JSONB DEFAULT '{}'::jsonb,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT agent_integrations_unique UNIQUE(agent_id, app_name)
);

CREATE INDEX idx_agent_integrations_agent_id ON agent_integrations(agent_id);
CREATE INDEX idx_agent_integrations_tenant_id ON agent_integrations(tenant_id);

ALTER TABLE agent_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY agent_integrations_tenant_isolation ON agent_integrations
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

## Agent CRUD API

### Create Agent

```python
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict
import uuid

router = APIRouter()

class CreateAgentRequest(BaseModel):
    name: str
    description: Optional[str] = None
    role: str = "Customer Support"
    instructions: List[str] = []
    enable_memory: bool = True
    enable_knowledge: bool = False

class AgentResponse(BaseModel):
    id: str
    tenant_id: str
    name: str
    description: Optional[str]
    config: Dict
    deployment_status: str
    is_active: bool
    created_at: str

@router.post("/agents", response_model=AgentResponse)
async def create_agent(
    request: CreateAgentRequest,
    tenant_id: str = Depends(get_current_tenant_id),
):
    """
    Create a new agent for the tenant.

    This creates the agent config in database but does NOT deploy it yet.
    User must explicitly deploy the agent after configuration.
    """
    agent_id = str(uuid.uuid4())

    config = {
        "role": request.role,
        "instructions": request.instructions,
        "model": "claude-sonnet-4-5-20250929",
        "enable_memory": request.enable_memory,
        "enable_knowledge": request.enable_knowledge,
        "num_history_runs": 10,
        "temperature": 0.7,
        "debug_mode": False,
    }

    async with db_pool.acquire() as conn:
        result = await conn.fetchrow(
            """
            INSERT INTO agents (id, tenant_id, name, description, config, deployment_status)
            VALUES ($1, $2, $3, $4, $5::jsonb, 'draft')
            RETURNING id, tenant_id, name, description, config, deployment_status, is_active, created_at
            """,
            agent_id,
            tenant_id,
            request.name,
            request.description,
            json.dumps(config),
        )

        return AgentResponse(**dict(result))
```

### Update Agent

```python
class UpdateAgentRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[List[str]] = None
    enable_memory: Optional[bool] = None
    enable_knowledge: Optional[bool] = None

@router.patch("/agents/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    request: UpdateAgentRequest,
    tenant_id: str = Depends(get_current_tenant_id),
):
    """Update agent configuration."""
    async with db_pool.acquire() as conn:
        # Get current agent
        agent = await conn.fetchrow(
            """
            SELECT id, config FROM agents
            WHERE id = $1 AND tenant_id = $2
            """,
            agent_id,
            tenant_id,
        )

        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Update config
        config = agent['config']
        if request.instructions is not None:
            config['instructions'] = request.instructions
        if request.enable_memory is not None:
            config['enable_memory'] = request.enable_memory
        if request.enable_knowledge is not None:
            config['enable_knowledge'] = request.enable_knowledge

        # Update database
        update_fields = []
        params = [agent_id, tenant_id]
        param_count = 3

        if request.name:
            update_fields.append(f"name = ${param_count}")
            params.append(request.name)
            param_count += 1

        if request.description:
            update_fields.append(f"description = ${param_count}")
            params.append(request.description)
            param_count += 1

        update_fields.append(f"config = ${param_count}::jsonb")
        params.append(json.dumps(config))
        param_count += 1

        update_fields.append("updated_at = NOW()")

        result = await conn.fetchrow(
            f"""
            UPDATE agents
            SET {', '.join(update_fields)}
            WHERE id = $1 AND tenant_id = $2
            RETURNING id, tenant_id, name, description, config, deployment_status, is_active, created_at
            """,
            *params,
        )

        return AgentResponse(**dict(result))
```

### Deploy/Pause Agent

```python
@router.post("/agents/{agent_id}/deploy")
async def deploy_agent(
    agent_id: str,
    tenant_id: str = Depends(get_current_tenant_id),
):
    """
    Deploy agent to production.

    This creates the Agno agent instance and makes it available for invocation.
    """
    async with db_pool.acquire() as conn:
        agent_config = await conn.fetchrow(
            """
            SELECT id, config FROM agents
            WHERE id = $1 AND tenant_id = $2
            """,
            agent_id,
            tenant_id,
        )

        if not agent_config:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Update status to deploying
        await conn.execute(
            """
            UPDATE agents
            SET deployment_status = 'deploying', updated_at = NOW()
            WHERE id = $1 AND tenant_id = $2
            """,
            agent_id,
            tenant_id,
        )

    try:
        # Create knowledge base if enabled
        knowledge = None
        if agent_config['config'].get('enable_knowledge', False):
            knowledge = create_knowledge_base(agent_id, tenant_id, DATABASE_URL)

        # Test agent creation (this validates the config)
        test_agent = create_agent(
            agent_config=agent_config['config'],
            tenant_id=tenant_id,
            db=db,
            toolkits=[],  # Will be populated at runtime
            knowledge_base=knowledge,
        )

        # Update status to active
        async with db_pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE agents
                SET deployment_status = 'active', is_active = true, updated_at = NOW()
                WHERE id = $1 AND tenant_id = $2
                """,
                agent_id,
                tenant_id,
            )

        return {"status": "deployed", "agent_id": agent_id}

    except Exception as e:
        # Update status to error
        async with db_pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE agents
                SET deployment_status = 'error', updated_at = NOW()
                WHERE id = $1 AND tenant_id = $2
                """,
                agent_id,
                tenant_id,
            )

        logger.error(f"Agent deployment failed: {e}")
        raise HTTPException(status_code=500, detail=f"Deployment failed: {str(e)}")

@router.post("/agents/{agent_id}/pause")
async def pause_agent(
    agent_id: str,
    tenant_id: str = Depends(get_current_tenant_id),
):
    """Pause agent (stop accepting new invocations)."""
    async with db_pool.acquire() as conn:
        await conn.execute(
            """
            UPDATE agents
            SET deployment_status = 'paused', is_active = false, updated_at = NOW()
            WHERE id = $1 AND tenant_id = $2
            """,
            agent_id,
            tenant_id,
        )

    return {"status": "paused", "agent_id": agent_id}
```

---

## Composio Integration

### Setup Composio

```bash
pip install composio-core
```

```env
# .env.local
COMPOSIO_API_KEY="cwa14vsbbv6zrwghobk9ep"
```

### Composio Toolkit for Agents

```python
from composio import ComposioToolSet, App, Action
from agno.tools import Toolkit
from typing import Dict

class ComposioToolkit(Toolkit):
    """
    Composio toolkit for X100 agents.

    Provides OAuth-integrated tools (Gmail, Calendar, HubSpot, etc.)
    with automatic per-tenant isolation.
    """

    def __init__(
        self,
        api_key: str,
        tenant_id: str,
        agent_id: str,
        connected_apps: list[str],  # ["gmail", "gcal", "hubspot"]
        **kwargs
    ):
        self.api_key = api_key
        self.tenant_id = tenant_id
        self.agent_id = agent_id

        # Initialize Composio toolset
        self.toolset = ComposioToolSet(api_key=api_key)

        # Entity ID = tenant_id (multi-tenant isolation)
        self.entity_id = f"tenant_{tenant_id}"

        # Get tools for connected apps
        tools = []
        for app in connected_apps:
            app_tools = self.toolset.get_tools(
                apps=[App[app.upper()]],
                entity_id=self.entity_id,
            )
            tools.extend(app_tools)

        super().__init__(name="composio_tools", tools=tools, **kwargs)

# Usage in agent creation
def create_tenant_toolkits(tenant_id: str, agent_id: str) -> list:
    """Create tenant-specific toolkits."""
    toolkits = []

    # Load agent integrations from database
    async with db_pool.acquire() as conn:
        integrations = await conn.fetch(
            """
            SELECT app_name, connection_id
            FROM agent_integrations
            WHERE agent_id = $1 AND tenant_id = $2 AND is_connected = true
            """,
            agent_id,
            tenant_id,
        )

    connected_apps = [i['app_name'] for i in integrations]

    if connected_apps:
        composio = ComposioToolkit(
            api_key=settings.COMPOSIO_API_KEY,
            tenant_id=tenant_id,
            agent_id=agent_id,
            connected_apps=connected_apps,
        )
        toolkits.append(composio)

    return toolkits
```

### Connect OAuth App

```python
@router.post("/integrations/connect")
async def connect_integration(
    agent_id: str,
    app_name: str,  # "gmail" | "gcal" | "hubspot" etc.
    tenant_id: str = Depends(get_current_tenant_id),
):
    """
    Initiate OAuth connection for an app.

    Returns OAuth URL for user to authorize.
    """
    from composio import ComposioToolSet, App

    toolset = ComposioToolSet(api_key=settings.COMPOSIO_API_KEY)
    entity_id = f"tenant_{tenant_id}"

    try:
        # Get or create entity
        entity = toolset.get_entity(id=entity_id)

        # Get OAuth URL
        request = entity.initiate_connection(
            app=App[app_name.upper()],
            redirect_url=f"{settings.FRONTEND_URL}/integrations/callback",
        )

        # Save integration record
        async with db_pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO agent_integrations (agent_id, tenant_id, app_name, connection_status)
                VALUES ($1, $2, $3, 'pending')
                ON CONFLICT (agent_id, app_name)
                DO UPDATE SET connection_status = 'pending', updated_at = NOW()
                """,
                agent_id,
                tenant_id,
                app_name,
            )

        return {
            "oauth_url": request.redirectUrl,
            "app_name": app_name,
            "entity_id": entity_id,
        }

    except Exception as e:
        logger.error(f"OAuth initiation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/integrations/callback")
async def integration_callback(
    code: str,
    state: str,
    agent_id: str,
    app_name: str,
    tenant_id: str = Depends(get_current_tenant_id),
):
    """Handle OAuth callback after user authorizes."""
    from composio import ComposioToolSet

    toolset = ComposioToolSet(api_key=settings.COMPOSIO_API_KEY)
    entity_id = f"tenant_{tenant_id}"

    try:
        # Complete OAuth flow
        connection = toolset.get_entity(id=entity_id).get_connection(
            app=app_name.upper()
        )

        # Update integration status
        async with db_pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE agent_integrations
                SET is_connected = true,
                    connection_status = 'connected',
                    connection_id = $1,
                    updated_at = NOW()
                WHERE agent_id = $2 AND tenant_id = $3 AND app_name = $4
                """,
                connection.id,
                agent_id,
                tenant_id,
                app_name,
            )

        return {"status": "connected", "app_name": app_name}

    except Exception as e:
        logger.error(f"OAuth callback failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Composio Integrations

For integrating third-party tools and services (CRM, Email, Calendar, Slack, etc.) with your Agno agents, we use **Composio**.

Composio provides:
- ✅ **800+ Tools**: HubSpot, Salesforce, Gmail, Slack, GitHub, and more
- ✅ **Managed Authentication**: OAuth2, API Keys, Bearer tokens handled automatically
- ✅ **Multi-tenant Support**: Each tenant gets isolated connections
- ✅ **Agno Compatible**: Direct integration with Agno Agent toolkit system

**Complete Integration Guide**: See [`docs/COMPOSIO_INTEGRATIONS.md`](./COMPOSIO_INTEGRATIONS.md) for:
- Installation & Setup
- Authentication & Connected Accounts
- Building Custom Toolkits
- Multi-tenant Integration Patterns
- Complete Examples (CRM, Email, Calendar, etc.)
- Best Practices

**Quick Example:**

```python
from composio import ComposioToolSet, App, Action

# Create toolset for a tenant
composio_tools = ComposioToolSet(
    api_key=os.getenv("COMPOSIO_API_KEY"),
    entity_id=f"tenant_{tenant_id}"
).get_tools(
    apps=[App.HUBSPOT, App.GMAIL],
    actions=[
        Action.HUBSPOT_CREATE_CONTACT,
        Action.GMAIL_SEND_EMAIL,
    ]
)

# Attach to Agno agent
agent = Agent(
    name="SalesAgent",
    model=Claude(id="claude-sonnet-4-5-20250929"),
    tools=composio_tools,
    ...
)
```

---

## Knowledge Base Management API


### Upload Knowledge Files

```python
from fastapi import UploadFile, File

@router.post("/agents/{agent_id}/knowledge/upload")
async def upload_knowledge(
    agent_id: str,
    file: UploadFile = File(...),
    category: str = "general",
    tenant_id: str = Depends(get_current_tenant_id),
):
    """
    Upload a file to agent's knowledge base.

    Supports: PDF, TXT, MD, DOCX
    """
    # Validate agent exists and has knowledge enabled
    async with db_pool.acquire() as conn:
        agent = await conn.fetchrow(
            """
            SELECT id, config FROM agents
            WHERE id = $1 AND tenant_id = $2
            """,
            agent_id,
            tenant_id,
        )

        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        if not agent['config'].get('enable_knowledge', False):
            raise HTTPException(
                status_code=400,
                detail="Knowledge base not enabled for this agent"
            )

    # Save file temporarily
    temp_path = f"/tmp/{agent_id}_{file.filename}"
    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Create/get knowledge base
    knowledge = create_knowledge_base(agent_id, tenant_id, DATABASE_URL)

    try:
        # Insert into knowledge base
        await knowledge.ainsert(
            name=file.filename,
            path=temp_path,
            metadata={
                "tenant_id": tenant_id,
                "agent_id": agent_id,
                "category": category,
                "filename": file.filename,
            },
        )

        return {
            "status": "uploaded",
            "filename": file.filename,
            "agent_id": agent_id,
        }

    finally:
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.get("/agents/{agent_id}/knowledge")
async def list_knowledge(
    agent_id: str,
    tenant_id: str = Depends(get_current_tenant_id),
):
    """List all knowledge files for an agent."""
    # This would query the knowledge_{agent_id} table
    # For now, return empty list (implementation depends on Agno's API)
    return {"files": []}
```

---

## Complete User Flow: Create → Deploy → Use Agent

### 1. User Creates Agent

```http
POST /api/agents
Authorization: Bearer <token>
x-tenant-id: tenant_123

{
  "name": "SupportBot",
  "description": "Customer support agent for our product",
  "role": "Customer Support Specialist",
  "instructions": [
    "You are a helpful customer support agent.",
    "Always be polite and professional.",
    "Search knowledge base before answering questions."
  ],
  "enable_memory": true,
  "enable_knowledge": true
}

Response:
{
  "id": "agent_456",
  "tenant_id": "tenant_123",
  "name": "SupportBot",
  "deployment_status": "draft",
  "is_active": false,
  ...
}
```

### 2. User Connects OAuth Apps

```http
POST /api/integrations/connect?agent_id=agent_456&app_name=gmail

Response:
{
  "oauth_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "app_name": "gmail",
  "entity_id": "tenant_tenant_123"
}

# User authorizes in browser → redirected to callback
# Callback updates agent_integrations table
```

### 3. User Uploads Knowledge

```http
POST /api/agents/agent_456/knowledge/upload
Content-Type: multipart/form-data

file: product-manual.pdf
category: documentation

Response:
{
  "status": "uploaded",
  "filename": "product-manual.pdf",
  "agent_id": "agent_456"
}
```

### 4. User Deploys Agent

```http
POST /api/agents/agent_456/deploy

Response:
{
  "status": "deployed",
  "agent_id": "agent_456"
}

# Agent status changes: draft → deploying → active
```

### 5. User/Customer Invokes Agent

```http
POST /api/agents/invoke

{
  "agent_id": "agent_456",
  "tenant_id": "tenant_123",
  "customer_id": "+79991234567",
  "message": "How do I reset my password?",
  "channel": "whatsapp"
}

Response:
{
  "response": "To reset your password, go to Settings → Security → Reset Password...",
  "session_id": "whatsapp_tenant_123_+79991234567",
  "user_id": "tenant_123_+79991234567"
}
```

### Backend Implementation

```python
@router.post("/agents/invoke")
async def invoke_agent_endpoint(request: InvokeAgentRequest):
    """
    Invoke an agent with customer message.

    Flow:
    1. Load agent config from database
    2. Create Agno agent instance with tenant-specific toolkits
    3. Load knowledge base if enabled
    4. Run agent with customer message
    5. Return agent response
    """
    # Load agent config
    agent_config = await get_agent_config(request.agent_id, request.tenant_id)

    # Validate agent is active
    if agent_config['deployment_status'] != 'active':
        raise HTTPException(
            status_code=400,
            detail=f"Agent is not active (status: {agent_config['deployment_status']})"
        )

    # Create tenant-specific toolkits (including Composio OAuth apps)
    toolkits = create_tenant_toolkits(request.tenant_id, request.agent_id)

    # Create knowledge base if enabled
    knowledge = None
    if agent_config['config'].get('enable_knowledge', False):
        knowledge = create_knowledge_base(
            request.agent_id,
            request.tenant_id,
            DATABASE_URL,
        )

    # Create agent instance
    agent = create_agent(
        agent_config=agent_config['config'],
        tenant_id=request.tenant_id,
        db=db,  # Shared PostgresDb instance
        toolkits=toolkits,
        knowledge_base=knowledge,
    )

    # Invoke agent
    session_id = f"{request.channel}_{request.tenant_id}_{request.customer_id}"
    user_id = f"{request.tenant_id}_{request.customer_id}"

    response = await agent.arun(
        input=request.message,
        user_id=user_id,
        session_id=session_id,
        session_state={
            "tenant_id": request.tenant_id,
            "agent_id": request.agent_id,
            "channel": request.channel,
        },
    )

    return {
        "response": response.content,
        "session_id": session_id,
        "user_id": user_id,
    }
```

---

## Key Rules for X100 Integration

1. **Database URL Format**: Always use `postgresql+psycopg://` (not `postgresql://`) for Agno + Neon
2. **Always Async**: Use `agent.arun()` (not `agent.run()`) in FastAPI context
3. **One DB Instance**: Create `db = PostgresDb(...)` once and share across all agents
4. **Unique Knowledge Tables**: Use `table_name=f"knowledge_{agent_id}"` for each agent
5. **Multi-Tenant IDs**:
   - `user_id = f"{tenant_id}_{customer_id}"`
   - `session_id = f"{channel}_{tenant_id}_{customer_id}"`
6. **Tool Docstrings**: Write clear Google-style docstrings — LLM reads them to understand tools
7. **Tools Return Strings**: Never raise exceptions in tools — catch and return error strings
8. **Knowledge Filters**: Always filter by `tenant_id` to isolate tenant data
9. **Channel Compatibility**: Set `markdown=False` for WhatsApp/Telegram
10. **Error Handling**: Wrap agent invocations in try/except and log errors

---

## Reference Links

- **Agno Documentation**: https://docs.agno.com
- **Neon PostgreSQL**: https://neon.tech/docs
- **Claude API**: https://docs.anthropic.com
- **X100 Architecture**: [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)
- **X100 Roadmap**: [TRACTION.md](../TRACTION.md)

---

**Last Updated**: 2026-02-17
**Version**: 1.0
**Status**: Production Ready
