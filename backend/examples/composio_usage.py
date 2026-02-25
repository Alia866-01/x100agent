"""
Composio Usage Examples

Демонстрация использования Composio в разных сценариях.
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.services.composio_service import get_composio_service
from backend.agents.sales_full import create_sales_agent_full


# ===== Example 1: Get OAuth URL для Gmail =====
def example_get_oauth_url():
    """
    Получить OAuth URL для подключения Gmail
    """
    composio = get_composio_service()

    tenant_id = "tenant_123"  # ID вашего tenant

    oauth_url = composio.get_oauth_url(
        tenant_id=tenant_id,
        app_name="gmail"
    )

    print(f"OAuth URL: {oauth_url}")
    print("Откройте этот URL в браузере для авторизации")


# ===== Example 2: Получить подключенные аккаунты =====
def example_list_connections():
    """
    Получить список подключенных интеграций для tenant
    """
    composio = get_composio_service()

    tenant_id = "tenant_123"

    connections = composio.get_connected_accounts(tenant_id)

    print(f"Connected accounts for tenant {tenant_id}:")
    for conn in connections:
        print(f"  - {conn['app_name']}: {conn['status']} (ID: {conn['id']})")


# ===== Example 3: Отправить email через Gmail =====
def example_send_email():
    """
    Отправить email используя подключенный Gmail
    """
    composio = get_composio_service()

    tenant_id = "tenant_123"

    # Проверить, что Gmail подключен
    if not composio.validate_connection(tenant_id, "gmail"):
        print("Gmail не подключен! Сначала подключите Gmail.")
        return

    # Отправить email
    result = composio.execute_action(
        tenant_id=tenant_id,
        app_name="gmail",
        action_name="GMAIL_SEND_EMAIL",
        params={
            "to": "customer@example.com",
            "subject": "Hello from AI Agent",
            "body": "This email was sent by your AI Sales Agent!"
        }
    )

    if result["success"]:
        print("Email sent successfully!")
    else:
        print(f"Error: {result['error']}")


# ===== Example 4: Создать событие в Google Calendar =====
def example_create_calendar_event():
    """
    Создать встречу в Google Calendar
    """
    composio = get_composio_service()

    tenant_id = "tenant_123"

    result = composio.execute_action(
        tenant_id=tenant_id,
        app_name="googlecalendar",
        action_name="GOOGLECALENDAR_CREATE_EVENT",
        params={
            "summary": "Demo with Customer",
            "description": "Product demonstration",
            "start": {
                "dateTime": "2025-03-01T10:00:00",
                "timeZone": "America/New_York"
            },
            "end": {
                "dateTime": "2025-03-01T11:00:00",
                "timeZone": "America/New_York"
            },
            "attendees": [
                {"email": "customer@example.com"}
            ]
        }
    )

    if result["success"]:
        print("Calendar event created!")
        print(f"Event ID: {result['data'].get('id')}")
    else:
        print(f"Error: {result['error']}")


# ===== Example 5: Создать Sales Agent с Composio tools =====
def example_create_agent_with_tools():
    """
    Создать Sales Agent с подключенными Composio tools
    """
    tenant_id = "tenant_123"

    agent_config = {
        "company_name": "Acme Corp",
        "sales_goal": "Book demo calls",
        "product_description": "AI-powered sales automation platform",
        "tone_of_voice": "Professional and friendly",
        "qualification_questions": [
            "What is your company size?",
            "What tools do you currently use for sales?"
        ],
        "composio_apps": ["gmail", "googlecalendar", "hubspot"]
    }

    # Создать агента с tools
    # Note: For demo purposes, using placeholder customer_id and agent_id
    agent = create_sales_agent_full(
        config=agent_config,
        tenant_id=tenant_id,
        customer_id="demo_customer_123",
        session_id="demo_session_123",
        agent_id="demo_agent_123"
    )

    print(f"Sales Agent created with {len(agent.tools) if agent.tools else 0} tools")

    # Использовать агента
    response = agent.run(
        "Can you send an email to john@example.com introducing our product?"
    )

    print(f"Agent response: {response.content}")


# ===== Example 6: Workflow - Complete Sales Process =====
def example_complete_sales_workflow():
    """
    Полный workflow: получить лида, отправить email, создать встречу
    """
    composio = get_composio_service()
    tenant_id = "tenant_123"

    # 1. Создать contact в HubSpot
    print("Step 1: Creating contact in HubSpot...")
    contact_result = composio.execute_action(
        tenant_id=tenant_id,
        app_name="hubspot",
        action_name="HUBSPOT_CREATE_CONTACT",
        params={
            "email": "newlead@example.com",
            "firstname": "John",
            "lastname": "Doe",
            "company": "Example Inc"
        }
    )

    if not contact_result["success"]:
        print(f"Failed to create contact: {contact_result['error']}")
        return

    contact_id = contact_result["data"].get("id")
    print(f"Contact created: {contact_id}")

    # 2. Отправить welcome email
    print("\nStep 2: Sending welcome email...")
    email_result = composio.execute_action(
        tenant_id=tenant_id,
        app_name="gmail",
        action_name="GMAIL_SEND_EMAIL",
        params={
            "to": "newlead@example.com",
            "subject": "Welcome to Acme Corp!",
            "body": "Hi John,\n\nThanks for your interest in our product...",
        }
    )

    if email_result["success"]:
        print("Welcome email sent!")

    # 3. Создать demo call в календаре
    print("\nStep 3: Scheduling demo call...")
    event_result = composio.execute_action(
        tenant_id=tenant_id,
        app_name="googlecalendar",
        action_name="GOOGLECALENDAR_CREATE_EVENT",
        params={
            "summary": "Demo Call - Example Inc",
            "start": {
                "dateTime": "2025-03-05T14:00:00",
                "timeZone": "America/New_York"
            },
            "end": {
                "dateTime": "2025-03-05T14:30:00",
                "timeZone": "America/New_York"
            },
            "attendees": [
                {"email": "newlead@example.com"}
            ]
        }
    )

    if event_result["success"]:
        print("Demo call scheduled!")

    print("\n✓ Complete sales workflow executed successfully!")


# ===== Run Examples =====
if __name__ == "__main__":
    print("=== Composio Usage Examples ===\n")

    # Uncomment the example you want to run:

    # example_get_oauth_url()
    # example_list_connections()
    # example_send_email()
    # example_create_calendar_event()
    # example_create_agent_with_tools()
    # example_complete_sales_workflow()

    print("\nNote: Make sure COMPOSIO_API_KEY is set in your environment")
    print("and that you have connected the required apps via OAuth first.")
