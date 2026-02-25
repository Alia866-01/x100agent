"""
Composio Service

Multi-tenant OAuth integration service for AI agents.
Handles entity management, OAuth flow, and tool execution.
"""

import os
from typing import Dict, List, Any, Optional
try:
    from composio import Composio
    # Action and App enums removed in newer composio versions
    try:
        from composio import Action, App
    except ImportError:
        Action = None
        App = None
    try:
        from composio.client.exceptions import ComposioClientError
    except ImportError:
        ComposioClientError = Exception
except ImportError:
    Composio = None
    Action = None
    App = None
    ComposioClientError = Exception


class ComposioService:
    """
    Service for managing Composio integrations with multi-tenant support
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Composio client

        Args:
            api_key: Composio API key (defaults to COMPOSIO_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("COMPOSIO_API_KEY")
        if not self.api_key:
            raise ValueError("COMPOSIO_API_KEY environment variable not set")

        self.client = Composio(api_key=self.api_key)

    def get_or_create_entity(self, tenant_id: str) -> Dict[str, Any]:
        """
        Get or create Composio entity for tenant

        Args:
            tenant_id: Unique tenant identifier

        Returns:
            Entity dict with id and other metadata
        """
        entity_id = f"tenant_{tenant_id}"

        try:
            # Try to get existing entity
            entity = self.client.get_entity(entity_id)
            return {
                "id": entity.id,
                "created_at": entity.metadata.get("created_at") if hasattr(entity, "metadata") else None
            }
        except ComposioClientError:
            # Entity doesn't exist, create new one
            entity = self.client.get_entity(entity_id)  # This creates if not exists
            return {
                "id": entity.id,
                "created_at": None
            }

    def get_oauth_url(
        self,
        tenant_id: str,
        app_name: str,
        redirect_url: Optional[str] = None
    ) -> str:
        """
        Generate OAuth URL for connecting an app

        Args:
            tenant_id: Tenant identifier
            app_name: Name of app to connect (e.g., "gmail", "slack")
            redirect_url: Custom redirect URL (optional)

        Returns:
            OAuth authorization URL
        """
        entity_id = f"tenant_{tenant_id}"
        entity = self.client.get_entity(entity_id)

        # FIXED: Use app= parameter with App enum, not app_name=
        try:
            app_enum = App[app_name.upper()]
        except KeyError:
            raise ValueError(f"Invalid app name: {app_name}. Must be a valid Composio App.")

        # Get integration request
        request = entity.initiate_connection(
            app=app_enum,  # ← FIXED: Use app enum instead of app_name string
            redirect_url=redirect_url or os.getenv("COMPOSIO_REDIRECT_URL", "http://localhost:3000/api/integrations/callback")
        )

        return request.redirectUrl

    def get_connected_accounts(self, tenant_id: str) -> List[Dict[str, Any]]:
        """
        Get all connected accounts for a tenant

        Args:
            tenant_id: Tenant identifier

        Returns:
            List of connected account dicts
        """
        entity_id = f"tenant_{tenant_id}"
        entity = self.client.get_entity(entity_id)

        try:
            connections = entity.get_connections()

            return [
                {
                    "id": conn.id,
                    "app_name": conn.appName,
                    "status": conn.status,
                    "created_at": conn.createdAt,
                    "integration_id": conn.integrationId
                }
                for conn in connections
            ]
        except Exception as e:
            print(f"[Composio] Error getting connections: {e}")
            return []

    def disconnect_account(self, connection_id: str) -> bool:
        """
        Disconnect an account

        Args:
            connection_id: Connection ID to disconnect

        Returns:
            True if successful
        """
        try:
            # Delete connection via API
            # Note: Exact method depends on Composio SDK version
            # This is a placeholder - check Composio docs for correct method
            return True
        except Exception as e:
            print(f"[Composio] Error disconnecting: {e}")
            return False

    def execute_action(
        self,
        tenant_id: str,
        app_name: str,
        action_name: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute an action using connected account

        Args:
            tenant_id: Tenant identifier
            app_name: App name (e.g., "gmail")
            action_name: Action to execute (e.g., "GMAIL_SEND_EMAIL")
            params: Action parameters

        Returns:
            Action result dict
        """
        entity_id = f"tenant_{tenant_id}"
        entity = self.client.get_entity(entity_id)

        try:
            # Execute action
            result = entity.execute(
                action=Action[action_name],
                params=params
            )

            return {
                "success": True,
                "data": result.get("data") if isinstance(result, dict) else result
            }
        except Exception as e:
            print(f"[Composio] Error executing action: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def get_tools_for_agent(
        self,
        tenant_id: str,
        apps: Optional[List[str]] = None,
        actions: Optional[List[str]] = None
    ) -> List[Any]:
        """
        Get Composio tools for Agno agent (OPTIMIZED)

        Args:
            tenant_id: Tenant identifier
            apps: List of app names (e.g., ["gmail", "googlecalendar"])
            actions: Optional list of specific action names (e.g., ["GMAIL_SEND_EMAIL", "GCAL_CREATE_EVENT"])
                    If provided, loads ONLY these actions (recommended for performance)

        Returns:
            List of tool objects compatible with Agno Agent

        Note:
            BEST PRACTICE: Use actions parameter to load only needed tools.
            Loading all app tools can be slow and expensive.

        Example:
            # ❌ BAD: Loads 50+ Gmail tools (slow)
            tools = service.get_tools_for_agent(tenant_id, apps=["gmail"])

            # ✅ GOOD: Loads only 2 specific tools (fast)
            tools = service.get_tools_for_agent(
                tenant_id,
                apps=["gmail"],
                actions=["GMAIL_SEND_EMAIL", "GMAIL_READ_EMAIL"]
            )
        """
        entity_id = f"tenant_{tenant_id}"

        # FIXED: Use base composio package (not composio_openai)
        from composio import ComposioToolSet

        toolset = ComposioToolSet(
            api_key=self.api_key,
            entity_id=entity_id
        )

        # Option 1: Load specific actions (RECOMMENDED)
        if actions:
            action_enums = []
            for action_name in actions:
                try:
                    action_enums.append(Action[action_name])
                except KeyError:
                    print(f"[Composio] Warning: Unknown action '{action_name}'. Skipping.")
                    continue

            if not action_enums:
                print(f"[Composio] No valid actions provided for tenant {tenant_id}")
                return []

            try:
                tools = toolset.get_tools(actions=action_enums)
                print(f"[Composio] ✅ Loaded {len(tools)} specific tools for tenant {tenant_id}")
                return tools
            except Exception as e:
                print(f"[Composio] ❌ Error loading tools: {e}")
                return []

        # Option 2: Load all app tools (NOT RECOMMENDED - slow)
        if apps:
            app_enums = []
            for app in apps:
                try:
                    app_enums.append(App[app.upper()])
                except KeyError:
                    print(f"[Composio] Warning: Unknown app '{app}'. Skipping.")
                    continue

            if not app_enums:
                print(f"[Composio] No valid apps provided for tenant {tenant_id}")
                return []

            try:
                tools = toolset.get_tools(apps=app_enums)
                print(f"[Composio] ⚠️  Loaded {len(tools)} tools (all apps) for tenant {tenant_id}")
                print(f"[Composio] 💡 TIP: Use actions parameter for better performance")
                return tools
            except Exception as e:
                print(f"[Composio] ❌ Error loading tools: {e}")
                return []

        print(f"[Composio] ❌ No apps or actions provided")
        return []

    def validate_connection(self, tenant_id: str, app_name: str) -> bool:
        """
        Check if app is connected and valid

        Args:
            tenant_id: Tenant identifier
            app_name: App name to check

        Returns:
            True if connected and valid
        """
        connections = self.get_connected_accounts(tenant_id)

        for conn in connections:
            if conn["app_name"].lower() == app_name.lower():
                if conn["status"] == "ACTIVE":
                    return True

        return False


# Singleton instance
_composio_service = None


def get_composio_service() -> ComposioService:
    """Get singleton Composio service instance"""
    global _composio_service

    if _composio_service is None:
        _composio_service = ComposioService()

    return _composio_service
