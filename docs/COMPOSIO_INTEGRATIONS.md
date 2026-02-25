# Composio Integration Guide — X100 Platform

**Complete guide for using Composio tools in Agno agents**

Last Updated: 2026-02-17

---

## Table of Contents

1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Authentication & Connected Accounts](#authentication--connected-accounts)
4. [Using Composio Tools](#using-composio-tools)
5. [Building Custom Toolkits](#building-custom-toolkits)
6. [Multi-Tenant Integration](#multi-tenant-integration)
7. [Complete Examples](#complete-examples)
8. [Best Practices](#best-practices)

---

## Overview

**Composio** is a unified platform that provides AI agents with access to **800+ tools** across different categories:

- **CRM**: HubSpot, Salesforce, Pipedrive, Attio
- **Communication**: Gmail, Outlook, Slack, Microsoft Teams
- **Productivity**: Google Calendar, Google Drive, Notion, Asana
- **Development**: GitHub, GitLab, Jira, Linear
- **And many more...**

### Key Features

✅ **Unified Interface**: One API for 800+ tools  
✅ **Managed Authentication**: OAuth2, API Keys, Bearer tokens handled automatically  
✅ **Multi-tenant Support**: Connect different accounts per user/tenant  
✅ **Agno Compatible**: Works seamlessly with Agno agents  
✅ **Type-safe**: Full TypeScript/Python type definitions  

---

## Installation & Setup

### Install Composio

```bash
# Core package
pip install composio-core

# With specific integrations (optional)
pip install composio-openai     # For OpenAI agents
pip install composio-langchain  # For LangChain agents
```

### Environment Variables

```env
# .env.local or .env
COMPOSIO_API_KEY="your_composio_api_key_here"

# Get your API key from: https://app.composio.dev/settings
```

### Initialize Composio Client

```python
from composio import Composio

composio_client = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
```

---

## Authentication & Connected Accounts

### Understanding Composio Authentication

Composio uses **Entity IDs** to manage multi-tenant authentication:

- **Entity ID**: Unique identifier for each user/tenant (e.g., `tenant_123` or `user@example.com`)
- **Connected Account**: Authenticated connection to a third-party service (Gmail, HubSpot, etc.)
- **Auth Config**: Blueprint defining how authentication works for a toolkit

```
┌─────────────────────────────────────────┐
│         User/Tenant (Entity)             │
│         entity_id = "tenant_123"         │
└──────────────┬──────────────────────────┘
               │
      ┌────────┼────────┐
      │        │        │
      ▼        ▼        ▼
  ┌─────┐  ┌─────┐  ┌─────┐
  │Gmail│  │Slack│  │ CRM │  ← Connected Accounts
  └─────┘  └─────┘  └─────┘
```

### Creating Connected Accounts

#### Method 1: Hosted Auth Flow (Recommended for Users)

```python
from composio import Composio, App

composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))

# Generate auth URL for a user
auth_url = composio.get_connected_account_redirect_url(
    entity_id="tenant_123",  # Your user/tenant ID
    app=App.HUBSPOT,         # App to connect
    redirect_url="https://your-app.com/integrations/callback"
)

# Send this URL to your user
print(f"Connect your HubSpot: {auth_url}")

# After user authenticates, they'll be redirected to your callback URL
# The connection is automatically stored in Composio
```

#### Method 2: CLI (For Development/Testing)

```bash
# Authenticate with a service
composio add gmail

# Authenticate for a specific entity
composio add hubspot --entity-id tenant_123
```

#### Method 3: Programmatic (For API Keys)

```python
# For services that use API keys (not OAuth)
composio.get_entity(entity_id="tenant_123").initiate_connection(
    app=App.OPENWEATHERMAP,
    auth_mode="API_KEY",
    auth_config={
        "api_key": "user_provided_api_key"
    }
)
```

### Listing Connected Accounts

```python
# Get all connections for an entity
entity = composio.get_entity(entity_id="tenant_123")
connections = entity.get_connections()

for connection in connections:
    print(f"App: {connection.app_name}, Status: {connection.status}")
```

---

## Using Composio Tools

### Available Actions

Composio provides **Actions** for each tool. Example actions:

```python
from composio import Action

# Gmail
Action.GMAIL_SEND_EMAIL
Action.GMAIL_READ_EMAIL
Action.GMAIL_SEARCH_EMAIL

# HubSpot CRM
Action.HUBSPOT_CREATE_CONTACT
Action.HUBSPOT_CREATE_DEAL
Action.HUBSPOT_UPDATE_CONTACT

# Google Calendar
Action.GCAL_CREATE_EVENT
Action.GCAL_LIST_EVENTS
Action.GCAL_UPDATE_EVENT

# Slack
Action.SLACKBOT_SEND_MESSAGE_TO_CHANNEL
Action.SLACKBOT_SEND_DIRECT_MESSAGE

# GitHub
Action.GITHUB_CREATE_ISSUE
Action.GITHUB_CREATE_PULL_REQUEST
Action.GITHUB_STAR_A_REPOSITORY
```

### Execute Actions Directly

```python
from composio import Composio, Action

composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))

# Execute an action for a specific entity
result = composio.execute_action(
    action=Action.GMAIL_SEND_EMAIL,
    params={
        "to": "customer@example.com",
        "subject": "Welcome to X100!",
        "body": "Thank you for signing up..."
    },
    entity_id="tenant_123"  # Uses this tenant's Gmail connection
)

print(result)
```

### Using Tools with Agno Agents

Composio provides a direct integration with Agno agents:

```python
from agno.agent import Agent
from agno.models.anthropic import Claude
from composio import ComposioToolSet, App, Action

# Create Composio toolset
toolset = ComposioToolSet(
    api_key=os.getenv("COMPOSIO_API_KEY"),
    entity_id="tenant_123"  # Important: Set tenant/user ID
)

# Get specific tools
tools = toolset.get_tools(
    apps=[App.GMAIL, App.GCAL],  # Get all Gmail & Calendar tools
)

# Or get specific actions only (recommended for performance)
tools = toolset.get_tools(
    apps=[App.GMAIL],
   actions=[
        Action.GMAIL_SEND_EMAIL,
        Action.GMAIL_READ_EMAIL,
    ]
)

# Create agent with Composio tools
agent = Agent(
    name="EmailAssistant",
    model=Claude(id="claude-sonnet-4-5-20250929"),
    instructions=[
        "You are an email assistant.",
        "You can read and send emails using Gmail.",
        "Always be professional and helpful.",
    ],
    tools=tools,  # Attach Composio tools
)

# Run agent
response = await agent.arun(
    "Send an email to john@example.com thanking them for their purchase"
)
```

---

## Building Custom Toolkits

### Pattern 1: Composio Toolkit Wrapper

```python
from agno.tools import Toolkit
from composio import Composio, Action
from agno.utils.log import logger

class GmailToolkit(Toolkit):
    """Gmail integration using Composio."""

    def __init__(self, composio_api_key: str, entity_id: str, **kwargs):
        """
        Initialize Gmail toolkit.

        Args:
            composio_api_key: Composio API key
            entity_id: User/tenant identifier
        """
        self.composio = Composio(api_key=composio_api_key)
        self.entity_id = entity_id

        tools = [
            self.send_email,
            self.read_latest_emails,
        ]

        super().__init__(name="gmail_tools", tools=tools, **kwargs)

    async def send_email(
        self,
        to: str,
        subject: str,
        body: str,
    ) -> str:
        """
        Send an email via Gmail.

        Args:
            to: Recipient email address
            subject: Email subject
            body: Email body text

        Returns:
            str: Success message or error
        """
        try:
            result = await self.composio.execute_action(
                action=Action.GMAIL_SEND_EMAIL,
                params={
                    "to": to,
                    "subject": subject,
                    "body": body,
                },
                entity_id=self.entity_id,
            )
            
            return f"Email sent successfully to {to}"
        except Exception as e:
            logger.error(f"GmailToolkit.send_email failed: {e}")
            return f"error: Failed to send email - {str(e)}"

    async def read_latest_emails(
        self,
        max_results: int = 5,
    ) -> str:
        """
        Read latest emails from Gmail inbox.

        Args:
            max_results: Maximum number of emails to return

        Returns:
            str: Email summaries or error
        """
        try:
            result = await self.composio.execute_action(
                action=Action.GMAIL_READ_EMAIL,
                params={
                    "max_results": max_results,
                },
                entity_id=self.entity_id,
            )
            
            # Format emails for agent
            emails = result.get("messages", [])
            if not emails:
                return "No emails found"

            summary = f"Found {len(emails)} emails:\n\n"
            for email in emails:
                summary += f"From: {email.get('from', 'Unknown')}\n"
                summary += f"Subject: {email.get('subject', 'No subject')}\n"
                summary += f"Preview: {email.get('snippet', '')[:100]}...\n\n"

            return summary
        except Exception as e:
            logger.error(f"GmailToolkit.read_latest_emails failed: {e}")
            return f"error: Failed to read emails - {str(e)}"
```

### Pattern 2: CRM Toolkit (HubSpot Example)

```python
class CRMToolkit(Toolkit):
    """HubSpot CRM integration using Composio."""

    def __init__(self, composio_api_key: str, entity_id: str, **kwargs):
        self.composio = Composio(api_key=composio_api_key)
        self.entity_id = entity_id

        tools = [
            self.create_contact,
            self.create_deal,
            self.update_deal_stage,
        ]

        super().__init__(name="crm_tools", tools=tools, **kwargs)

    async def create_contact(
        self,
        email: str,
        first_name: str,
        last_name: str,
        phone: str = None,
        company: str = None,
    ) -> str:
        """
        Create a new contact in HubSpot.

        Args:
            email: Contact email
            first_name: First name
            last_name: Last name
            phone: Phone number (optional)
            company: Company name (optional)

        Returns:
            str: Contact ID or error
        """
        try:
            properties = {
                "email": email,
                "firstname": first_name,
                "lastname": last_name,
            }
            
            if phone:
                properties["phone"] = phone
            if company:
                properties["company"] = company

            result = await self.composio.execute_action(
                action=Action.HUBSPOT_CREATE_CONTACT,
                params={"properties": properties},
                entity_id=self.entity_id,
            )
            
            contact_id = result.get("id")
            return f"contact_created: {contact_id}"
        except Exception as e:
            logger.error(f"CRMToolkit.create_contact failed: {e}")
            return f"error: {str(e)}"

    async def create_deal(
        self,
        deal_name: str,
        amount: float,
        contact_email: str,
        stage: str = "qualifiedtobuy",
    ) -> str:
        """
        Create a new deal in HubSpot CRM.

        Args:
            deal_name: Name of the deal
            amount: Deal value in USD
            contact_email: Associated contact email
            stage: Deal stage (default: qualifiedtobuy)

        Returns:
            str: Deal ID or error
        """
        try:
            result = await self.composio.execute_action(
                action=Action.HUBSPOT_CREATE_DEAL,
                params={
                    "properties": {
                        "dealname": deal_name,
                        "amount": str(amount),
                        "dealstage": stage,
                        "pipeline": "default",
                    }
                },
                entity_id=self.entity_id,
            )
            
            deal_id = result.get("id")
            return f"deal_created: {deal_id}"
        except Exception as e:
            logger.error(f"CRMToolkit.create_deal failed: {e}")
            return f"error: {str(e)}"
```

---

## Multi-Tenant Integration

### Pattern: Entity ID = Tenant ID

In X100, each tenant has their own Composio connections:

```python
def create_tenant_toolkits(tenant_id: str) -> list:
    """
    Create Composio-based toolkits for a specific tenant.

    Args:
        tenant_id: X100 tenant UUID

    Returns:
        list: List of Toolkit instances
    """
    composio_api_key = os.getenv("COMPOSIO_API_KEY")

    # Each tenant has their own entity_id in Composio
    entity_id = f"tenant_{tenant_id}"

    # Create toolkits
    gmail = GmailToolkit(
        composio_api_key=composio_api_key,
        entity_id=entity_id,
    )

    crm = CRMToolkit(
        composio_api_key=composio_api_key,
        entity_id=entity_id,
    )

    calendar = CalendarToolkit(
        composio_api_key=composio_api_key,
        entity_id=entity_id,
    )

    return [gmail, crm, calendar]
```

### Agent Invocation with Multi-Tenant Composio

```python
async def invoke_agent_with_integrations(
    agent_id: str,
    tenant_id: str,
    customer_id: str,
    message: str,
) -> str:
    """
    Invoke agent with tenant-specific Composio integrations.
    """
    # Load agent config
    agent_config = await get_agent_config(agent_id, tenant_id)

    # Create Composio toolkits for this tenant
    toolkits = create_tenant_toolkits(tenant_id)

    # Create agent
    agent = Agent(
        name=agent_config["name"],
        model=Claude(id="claude-sonnet-4-5-20250929"),
        instructions=agent_config["instructions"],
        tools=toolkits,  # Tenant-specific integrations
        db=db,
    )

    # Run agent
    response = await agent.arun(
        input=message,
        user_id=f"{tenant_id}_{customer_id}",
        session_id=f"session_{tenant_id}_{customer_id}",
    )

    return response.content
```

---

## Complete Examples

### Example 1: Sales Agent with CRM + Email

```python
from agno.agent import Agent
from agno.models.anthropic import Claude
from composio import Composio

# Setup Composio toolkits
composio_api_key = os.getenv("COMPOSIO_API_KEY")
entity_id = "tenant_123"

gmail = GmailToolkit(composio_api_key, entity_id)
crm = CRMToolkit(composio_api_key, entity_id)

# Create agent
sales_agent = Agent(
    name="SalesAgent",
    model=Claude(id="claude-sonnet-4-5-20250929"),
    instructions=[
        "You are a sales agent for X100 AI platform.",
        "When a lead shows interest:",
        "1. Create a contact in CRM with their information",
        "2. Send them a welcome email",
        "3. Create a deal in CRM",
        "Always be professional and helpful.",
    ],
    tools=[gmail, crm],
    db=db,
    enable_user_memories=True,
)

# Run agent
response = await sales_agent.arun(
    input="Hi, I'm interested in your AI agents for my e-commerce business. My email is john@shopify.com",
    user_id="tenant_123_lead_001",
    session_id="session_tenant_123_lead_001",
)

print(response.content)
# Agent will:
# 1. Create contact in HubSpot: john@shopify.com
# 2. Send welcome email
# 3. Create deal in HubSpot
# 4. Respond to the lead
```

### Example 2: Support Agent with Gmail + Slack

```python
gmail = GmailToolkit(composio_api_key, entity_id)
slack = SlackToolkit(composio_api_key, entity_id)

support_agent = Agent(
    name="SupportAgent",
    model=Claude(id="claude-sonnet-4-5-20250929"),
    instructions=[
        "You are a customer support agent.",
        "Read customer emails and respond appropriately.",
        "For urgent issues, notify the team in Slack #support channel.",
    ],
    tools=[gmail, slack],
    db=db,
)

response = await support_agent.arun(
    input="Check if there are any urgent support emails and handle them",
    user_id="tenant_123_support",
    session_id="session_support_daily",
)
```

---

## Best Practices

### 1. Use Specific Actions (Not All Tools)

```python
# ❌ BAD: Loads 100+ tools (slow, expensive)
tools = toolset.get_tools(apps=[App.GMAIL])

# ✅ GOOD: Load only needed actions
tools = toolset.get_tools(
    apps=[App.GMAIL],
    actions=[
        Action.GMAIL_SEND_EMAIL,
        Action.GMAIL_READ_EMAIL,
    ]
)
```

### 2. One Entity ID Per Tenant

```python
# ❌ BAD: Sharing entity across tenants
entity_id = "shared_entity"

# ✅ GOOD: Unique entity per tenant
entity_id = f"tenant_{tenant_id}"
```

### 3. Handle Connection Errors Gracefully

```python
async def send_email_safe(
    composio: Composio,
    entity_id: str,
    to: str,
    subject: str,
    body: str,
) -> str:
    try:
        result = await composio.execute_action(
            action=Action.GMAIL_SEND_EMAIL,
            params={"to": to, "subject": subject, "body": body},
            entity_id=entity_id,
        )
        return "success"
    except Exception as e:
        error_msg = str(e)
        
        # Check if connection doesn't exist
        if "not connected" in error_msg.lower():
            return "error: Gmail not connected. Please connect your account first."
        
        # Other errors
        return f"error: {error_msg}"
```

### 4. Use Meta-Tools for Runtime Auth

Composio provides **meta-tools** that let agents request connections:

```python
from composio import Action

# Add meta-tool to agent
tools = toolset.get_tools(
    actions=[
        Action.COMPOSIO_MANAGE_CONNECTIONS,  # Lets agent request OAuth
    ]
)

# Agent can now say:
# "I need access to Gmail. Please connect your account: [link]"
```

### 5. Monitor Usage & Rate Limits

```python
# Check entity's connections
entity = composio.get_entity(entity_id="tenant_123")
connections = entity.get_connections()

for conn in connections:
    print(f"App: {conn.app_name}")
    print(f"Status: {conn.status}")
    print(f"Last used: {conn.updated_at}")
```

---

## Additional Resources

- **Composio Documentation**: https://docs.composio.dev
- **Available Tools**: https://composio.dev/tools
- **Python SDK**: https://github.com/composiohq/composio
- **API Reference**: https://docs.composio.dev/api-reference

---

## Support

For X100-specific integration questions:
- **Email**: dev@x100.ai
- **Documentation**: `docs/AGNO_INTEGRATION.md`

For Composio platform issues:
- **Discord**: https://discord.gg/composio
- **GitHub**: https://github.com/composiohq/composio
