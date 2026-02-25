"""
Sales Agent - Full Implementation with Multi-Level Isolation

Полная реализация Sales Agent с:
- PostgresDb для session management
- Memory для customer memories
- Knowledge для tenant RAG
- Composio tools
- Customer data tracking
- Qualification management
"""

from agno.agent import Agent
from agno.models.anthropic import Claude
from agno.knowledge.knowledge import Knowledge
from agno.vectordb.pgvector import PgVector, SearchType
from agno.knowledge.embedder.openai import OpenAIEmbedder
from backend.database import get_shared_db, get_agno_db_url
from backend.services.composio_service import get_composio_service
from typing import Optional, Dict, Any
import os
import logging

logger = logging.getLogger(__name__)


def create_sales_agent_full(
    config: Dict[str, Any],
    tenant_id: str,
    customer_id: str,
    session_id: Optional[str] = None,
    agent_id: Optional[str] = None
) -> Agent:
    """
    Create fully-featured Sales Agent with complete data isolation

    Args:
        config: Agent configuration from Platform Agent
        tenant_id: Tenant ID (Level 2 isolation)
        customer_id: Customer ID (Level 3 isolation)
        session_id: Conversation ID (WhatsApp, Telegram, etc)
        agent_id: Agent ID from agents table

    Returns:
        Agent with memory, knowledge, tools, and data tracking
    """

    logger.info(f"[SalesAgent] Creating agent for tenant={tenant_id}, customer={customer_id}")

    # ===================================
    # 1. SHARED DATABASE (Agno)
    # ===================================

    # Use singleton PostgresDb instance (shared across all agents)
    # This reduces memory overhead and connection pool size
    # Handles both sessions AND memories automatically
    db = get_shared_db()

    logger.info(f"[SalesAgent] Using shared database instance")

    # ===================================
    # 2. KNOWLEDGE BASE (Agno + PgVector)
    # ===================================

    # Knowledge base изолирован по tenant_id
    # Все документы tenant доступны для RAG
    knowledge = Knowledge(
        name=f"{config.get('company_name')} Knowledge Base",
        vector_db=PgVector(
            table_name="tenant_embeddings",
            db_url=get_agno_db_url(),  # ← FIXED: Use proper Agno URL format
            search_type=SearchType.hybrid,  # ← FIXED: Vector + keyword search (best results)
            embedder=OpenAIEmbedder(
                model="text-embedding-3-small",
                dimensions=1536
            ),
            # RLS ensures only tenant's embeddings are accessible
        )
    )

    logger.info(f"[SalesAgent] Knowledge base configured for tenant {tenant_id}")

    # ===================================
    # 3. COMPOSIO TOOLS
    # ===================================

    tools = []
    try:
        composio = get_composio_service()
        requested_apps = config.get("composio_apps", ["gmail", "googlecalendar"])

        # Map common apps to recommended actions (OPTIMIZED)
        recommended_actions = {
            "gmail": ["GMAIL_SEND_EMAIL", "GMAIL_READ_EMAIL", "GMAIL_SEARCH_EMAIL"],
            "googlecalendar": ["GCAL_CREATE_EVENT", "GCAL_LIST_EVENTS", "GCAL_UPDATE_EVENT"],
            "hubspot": ["HUBSPOT_CREATE_CONTACT", "HUBSPOT_CREATE_DEAL", "HUBSPOT_UPDATE_CONTACT"],
            "slack": ["SLACKBOT_SEND_MESSAGE_TO_CHANNEL", "SLACKBOT_SEND_DIRECT_MESSAGE"],
        }

        # Build action list based on requested apps
        actions_to_load = []
        for app in requested_apps:
            app_lower = app.lower()
            if app_lower in recommended_actions:
                actions_to_load.extend(recommended_actions[app_lower])

        # Load tools (prefer specific actions for performance)
        if actions_to_load:
            tools = composio.get_tools_for_agent(
                tenant_id=tenant_id,
                apps=requested_apps,
                actions=actions_to_load  # ← OPTIMIZED: Only load needed actions
            )
            logger.info(f"[SalesAgent] Loaded {len(tools)} optimized Composio tools")
        else:
            # Fallback: load all app tools (if no action mapping exists)
            tools = composio.get_tools_for_agent(
                tenant_id=tenant_id,
                apps=requested_apps
            )
            logger.info(f"[SalesAgent] Loaded {len(tools)} Composio tools (all apps)")

    except Exception as e:
        logger.warning(f"[SalesAgent] Could not load Composio tools: {e}")

    # ===================================
    # 4. SYSTEM PROMPT
    # ===================================

    system_prompt = f"""
You are a Sales Representative for {config.get('company_name')}.

**Your Primary Goal:** {config.get('sales_goal')}

**Product/Service Description:**
{config.get('product_description')}

**Communication Style:**
- Tone: {config.get('tone_of_voice')}
- Be professional, helpful, and attentive

**Qualification Process:**
You must naturally ask these questions during the conversation:
{chr(10).join([f"- {q}" for q in config.get('qualification_questions', [])])}

**Important Instructions:**
1. Use your knowledge base to answer specific product questions
2. Remember customer details automatically (memory is enabled)
3. Track qualification progress as you learn about the customer
4. If customer is qualified and interested, use available tools to:
   - Schedule meetings (Google Calendar)
   - Send follow-up emails (Gmail)
   - Create CRM records (if available)
5. If you don't know something, be honest and offer to find out
6. Always maintain context from previous messages

**Customer Data:**
- Customer ID: {customer_id}
- This customer's history and preferences are automatically loaded
- Update your understanding of the customer as conversation progresses
"""

    # ===================================
    # 5. CREATE AGENT
    # ===================================

    agent = Agent(
        name=f"Sales Agent - {config.get('company_name')}",
        role="Sales Representative",
        session_id=session_id,  # Conversation ID
        user_id=customer_id,  # Customer ID for memory
        model=Claude(
            id="claude-sonnet-4-5-20250929"  # Latest Claude Sonnet 4.5
        ),
        instructions=[system_prompt],

        # Database (handles BOTH sessions AND memories)
        # FIXED: Use shared PostgresDb instance
        db=db,
        add_history_to_context=True,
        num_history_runs=5,  # Last 5 messages in context
        read_chat_history=True,

        # Memory management
        update_memory_on_run=True,  # Auto-update memories after each response
        # Alternative: enable_agentic_memory=True  # Let agent decide when to update

        # Knowledge base
        knowledge=knowledge,
        search_knowledge=True,  # Auto-search knowledge base when needed
        knowledge_filters={"tenant_id": tenant_id},  # FIXED: Multi-tenant isolation

        # Tools
        tools=tools,

        # Output format
        markdown=True,

        # Metadata
        metadata={
            "tenant_id": tenant_id,
            "customer_id": customer_id,
            "agent_id": agent_id,
        }
    )

    logger.info(f"[SalesAgent] Agent created successfully")

    return agent


# ===================================
# HELPER FUNCTIONS
# ===================================

def get_customer_memories(agent: Agent, customer_id: str) -> list:
    """
    Get all memories for a specific customer

    Args:
        agent: Sales Agent instance
        customer_id: Customer ID

    Returns:
        List of customer memories
    """
    if not agent.db:
        return []

    return agent.get_user_memories(user_id=customer_id)


def get_conversation_summary(agent: Agent, session_id: str) -> Optional[str]:
    """
    Get summary of conversation

    Args:
        agent: Sales Agent instance
        session_id: Session ID

    Returns:
        Conversation summary or None
    """
    if not agent.db:
        return None

    session = agent.get_session(session_id=session_id)
    return session.summary if session else None


def run_sales_agent(
    agent: Agent,
    message: str,
    context: Optional[str] = None,
    stream: bool = False
) -> str:
    """
    Run Sales Agent with message and optional RAG context

    Args:
        agent: Sales Agent instance
        message: Customer message
        context: Optional RAG context (pre-fetched)
        stream: Whether to stream response

    Returns:
        Agent response text
    """

    # Build full message with context if provided
    full_message = message
    if context:
        full_message = f"""[Knowledge Base Context]
{context}

[Customer Message]
{message}"""

    # Run agent
    # Agno automatically:
    # 1. Loads conversation history (session_id)
    # 2. Loads customer memories (user_id)
    # 3. Searches knowledge base (search_knowledge=True)
    # 4. Executes tools if needed
    # 5. Saves message and response
    # 6. Updates customer memories
    response = agent.run(full_message, stream=stream)

    # Extract response text
    if hasattr(response, 'content'):
        return response.content
    elif isinstance(response, str):
        return response
    else:
        return str(response)


# ===================================
# EXAMPLE USAGE
# ===================================

if __name__ == "__main__":
    """
    Test Sales Agent with full features

    Prerequisites:
    1. DATABASE_URL set in .env.local
    2. OPENROUTER_API_KEY set
    3. Database initialized with schema_extended.sql
    4. RLS configured (SET app.current_tenant)
    """

    import asyncio
    import asyncpg

    async def test_sales_agent():
        # Test configuration
        config = {
            "company_name": "Acme Corp",
            "sales_goal": "Book demo meetings",
            "product_description": "B2B SaaS platform for sales automation",
            "tone_of_voice": "Professional and friendly",
            "qualification_questions": [
                "What is your company size?",
                "What's your current sales process?",
                "What's your budget for sales tools?"
            ]
        }

        tenant_id = "test-tenant-123"
        customer_id = "+1234567890"
        session_id = "whatsapp-conv-001"

        # Set tenant context (RLS)
        db = await asyncpg.connect(os.getenv("DATABASE_URL"))
        await db.execute(f"SET app.current_tenant = '{tenant_id}'")
        await db.close()

        # Create agent
        agent = create_sales_agent_full(
            config=config,
            tenant_id=tenant_id,
            customer_id=customer_id,
            session_id=session_id
        )

        print("=== Testing Sales Agent ===\n")

        # Test 1: First message
        print("Customer: Hi, I'm interested in your product")
        response = run_sales_agent(agent, "Hi, I'm interested in your product")
        print(f"Agent: {response}\n")

        # Test 2: Get memories
        print("=== Customer Memories ===")
        memories = get_customer_memories(agent, customer_id)
        for i, memory in enumerate(memories, 1):
            print(f"{i}. {memory.memory}")
        print()

        # Test 3: Second message (agent should remember)
        print("Customer: We have 50 employees")
        response = run_sales_agent(agent, "We have 50 employees")
        print(f"Agent: {response}\n")

        # Test 4: Get updated memories
        print("=== Updated Memories ===")
        memories = get_customer_memories(agent, customer_id)
        for i, memory in enumerate(memories, 1):
            print(f"{i}. {memory.memory}")
        print()

        # Test 5: Conversation summary
        summary = get_conversation_summary(agent, session_id)
        print(f"=== Conversation Summary ===")
        print(summary)

    # Run test
    asyncio.run(test_sales_agent())
