"""
Composio Tool Router - Полный пример использования

Демонстрирует:
1. Автоматический OAuth flow (manage_connections=True)
2. Manual OAuth flow (manage_connections=False)
3. Использование с Claude Agent SDK
4. Integration с Sales Agent
"""

import asyncio
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from composio import Composio
from composio_claude_agent_sdk import ClaudeAgentSDKProvider
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, create_sdk_mcp_server
from dotenv import load_dotenv

load_dotenv('../.env.local')


# ===== Example 1: Basic Tool Router Setup =====

def example_basic_setup():
    """
    Базовая настройка Tool Router
    """
    # Initialize Composio с Claude Agent SDK Provider
    composio = Composio(
        api_key=os.getenv("COMPOSIO_API_KEY"),
        provider=ClaudeAgentSDKProvider()
    )

    # Create session для tenant
    tenant_id = "test-tenant-123"
    external_user_id = f"tenant_{tenant_id}"

    session = composio.create(
        user_id=external_user_id,
        manage_connections=True  # Автоматический OAuth в chat
    )

    # Get tools (native Claude Agent SDK tools)
    tools = session.tools()

    print(f"✅ Session created for tenant: {tenant_id}")
    print(f"✅ Loaded {len(tools)} tools")

    return session, tools


# ===== Example 2: Send Email с автоматическим OAuth =====

async def example_send_email_auto_oauth():
    """
    Отправить email с автоматическим OAuth flow

    Если user не авторизован, agent попросит авторизоваться в chat
    """
    # Initialize Composio
    composio = Composio(
        api_key=os.getenv("COMPOSIO_API_KEY"),
        provider=ClaudeAgentSDKProvider()
    )

    tenant_id = "test-tenant-123"
    external_user_id = f"tenant_{tenant_id}"

    # Create session
    session = composio.create(
        user_id=external_user_id,
        manage_connections=True  # Автоматический OAuth
    )

    # Get tools
    tools = session.tools()

    # Create MCP server с Composio tools
    custom_server = create_sdk_mcp_server(
        name="composio",
        version="1.0.0",
        tools=tools
    )

    # Setup Claude Agent SDK
    options = ClaudeAgentOptions(
        system_prompt="You are a helpful sales assistant with access to Gmail and Calendar tools.",
        permission_mode="bypassPermissions",  # Auto-approve tool usage
        mcp_servers={
            "composio": custom_server,
        },
    )

    # Run query
    print("\n📧 Sending email via Claude Agent SDK...\n")

    async with ClaudeSDKClient(options=options) as client:
        await client.query(
            "Send an email to test@example.com with subject 'Hello from Composio' "
            "and body 'This is a test email from Tool Router!'"
        )

        # Print response
        async for msg in client.receive_response():
            print(msg)


# ===== Example 3: Manual OAuth Flow =====

def example_manual_oauth():
    """
    Manual authorization - для building UI

    User click "Connect Gmail" → redirect to OAuth URL → callback
    """
    composio = Composio(
        api_key=os.getenv("COMPOSIO_API_KEY"),
        provider=ClaudeAgentSDKProvider()
    )

    tenant_id = "test-tenant-123"
    external_user_id = f"tenant_{tenant_id}"

    # Create session БЕЗ автоматического OAuth
    session = composio.create(
        user_id=external_user_id,
        manage_connections=False  # Manual OAuth
    )

    # Manually authorize Gmail
    connection_request = session.authorize(
        toolkit='gmail',
        callback_url='http://localhost:3000/api/integrations/callback'
    )

    print(f"\n🔗 OAuth URL: {connection_request.redirect_url}\n")
    print("👉 Open this URL in browser to authorize Gmail\n")

    # Wait for user to complete OAuth (blocking)
    print("⏳ Waiting for authorization...")
    connected_account = connection_request.wait_for_connection()

    print(f"✅ Connected! Account ID: {connected_account.id}\n")

    return connected_account


# ===== Example 4: Create Calendar Event =====

async def example_create_calendar_event():
    """
    Создать событие в Google Calendar
    """
    composio = Composio(
        api_key=os.getenv("COMPOSIO_API_KEY"),
        provider=ClaudeAgentSDKProvider()
    )

    tenant_id = "test-tenant-123"
    session = composio.create(
        user_id=f"tenant_{tenant_id}",
        manage_connections=True
    )

    tools = session.tools()
    custom_server = create_sdk_mcp_server(
        name="composio",
        version="1.0.0",
        tools=tools
    )

    options = ClaudeAgentOptions(
        system_prompt="You are a helpful assistant with access to Google Calendar.",
        permission_mode="bypassPermissions",
        mcp_servers={"composio": custom_server},
    )

    print("\n📅 Creating calendar event...\n")

    async with ClaudeSDKClient(options=options) as client:
        await client.query(
            "Create a calendar event for tomorrow at 2pm titled 'Demo Call with Customer' "
            "lasting 30 minutes. Add description: 'Product demonstration call.'"
        )

        async for msg in client.receive_response():
            print(msg)


# ===== Example 5: Integration с Sales Agent =====

async def example_sales_agent_with_tools():
    """
    Sales Agent с Composio Tool Router

    Agent может использовать Gmail, Calendar, CRM tools
    """
    from backend.agents.sales_with_tool_router import create_sales_agent_with_router

    # Agent config
    config = {
        "company_name": "Acme Corp",
        "sales_goal": "Book demo calls and qualify leads",
        "product_description": "AI-powered sales automation platform that helps teams close more deals",
        "tone_of_voice": "Professional, friendly, and consultative",
        "qualification_questions": [
            "What is your company size?",
            "What tools do you currently use for sales?",
            "What are your biggest sales challenges?"
        ]
    }

    tenant_id = "acme-corp-tenant"

    # Create agent с Tool Router tools
    agent = create_sales_agent_with_router(config, tenant_id)

    # Test conversation
    print("\n💬 Sales Agent conversation:\n")

    # User message
    user_message = """
    Hi! I'm interested in learning more about your product.
    Can you send me more information to john@example.com?
    Also, I'd like to schedule a demo next week.
    """

    # Agent response (will use Gmail + Calendar tools)
    response = agent.run(user_message)

    print(f"Agent: {response.content}")


# ===== Example 6: Multi-Tenant Usage =====

async def example_multi_tenant():
    """
    Демонстрация multi-tenant usage

    Каждый tenant имеет свой session и свои connections
    """
    composio = Composio(
        api_key=os.getenv("COMPOSIO_API_KEY"),
        provider=ClaudeAgentSDKProvider()
    )

    # Tenant 1
    tenant1_id = "tenant-acme-corp"
    session1 = composio.create(
        user_id=f"tenant_{tenant1_id}",
        manage_connections=True
    )
    tools1 = session1.tools()

    print(f"✅ Tenant 1 ({tenant1_id}): {len(tools1)} tools")

    # Tenant 2
    tenant2_id = "tenant-globex-inc"
    session2 = composio.create(
        user_id=f"tenant_{tenant2_id}",
        manage_connections=True
    )
    tools2 = session2.tools()

    print(f"✅ Tenant 2 ({tenant2_id}): {len(tools2)} tools")

    print("\n🔐 Each tenant has isolated connections and tools")


# ===== Run Examples =====

if __name__ == "__main__":
    print("=" * 60)
    print("Composio Tool Router - Examples")
    print("=" * 60)

    # Uncomment to run:

    # Example 1: Basic setup
    # print("\n📦 Example 1: Basic Setup\n")
    # example_basic_setup()

    # Example 2: Send email (async)
    # print("\n📧 Example 2: Send Email (Auto OAuth)\n")
    # asyncio.run(example_send_email_auto_oauth())

    # Example 3: Manual OAuth
    # print("\n🔗 Example 3: Manual OAuth Flow\n")
    # example_manual_oauth()

    # Example 4: Create calendar event (async)
    # print("\n📅 Example 4: Create Calendar Event\n")
    # asyncio.run(example_create_calendar_event())

    # Example 5: Sales Agent with tools (async)
    print("\n💼 Example 5: Sales Agent with Tools\n")
    asyncio.run(example_sales_agent_with_tools())

    # Example 6: Multi-tenant
    # print("\n🏢 Example 6: Multi-Tenant Usage\n")
    # asyncio.run(example_multi_tenant())

    print("\n" + "=" * 60)
    print("✅ Examples completed!")
    print("=" * 60)
