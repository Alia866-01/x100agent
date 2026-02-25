/**
 * TypeScript interfaces for AI-01 Backend API
 * Auto-generated from backend API schemas
 */

// ============================================================================
// Authentication & Users
// ============================================================================

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  role: 'admin' | 'member';
  auth_provider_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tenant {
  id: string;
  name: string;
  plan_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  created_at?: string;
  updated_at?: string;
}

export interface SyncUserResponse {
  user: User;
  tenant: Tenant;
  is_new: boolean;
}

// ============================================================================
// Agents
// ============================================================================

export interface AgentConfig {
  role: string;
  instructions: string;
  tools?: string[];
  model?: string;
  temperature?: number;
  knowledge_base?: {
    enabled: boolean;
    sources?: string[];
  };
  integrations?: string[];
  greeting_message?: string;
  fallback_message?: string;
  context_length?: number;
}

export interface Agent {
  id: string;
  tenant_id: string;
  name: string;
  config: AgentConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentRequest {
  tenant_id: string;
  name: string;
  config: AgentConfig;
  whatsapp_number?: string;
  telegram_username?: string;
  email?: string;
}

export interface UpdateAgentRequest {
  config?: AgentConfig;
  name?: string;
  is_active?: boolean;
}

export interface InvokeAgentRequest {
  agent_id: string;
  message: string;
  context?: string;
  tenant_id: string;
  customer_id: string;
  conversation_id?: string;
  metadata?: Record<string, any>;
}

export interface InvokeAgentResponse {
  content: string;
  tool_calls?: Array<{
    name: string;
    arguments: any;
    result?: any;
  }>;
  metadata?: {
    agent_id: string;
    conversation_id?: string;
    session_id?: string;
    timestamp: string;
  };
}

export interface AgentStats {
  agent_id: string;
  total_messages: number;
  total_conversations: number;
  last_activity: string | null;
  avg_response_time_seconds: number | null;
  conversion_rate: number | null;
}

// ============================================================================
// Channels
// ============================================================================

export type ChannelType = 'whatsapp' | 'telegram' | 'instagram' | 'email' | 'web';

export interface ChannelConfig {
  phone_number?: string;
  username?: string;
  email?: string;
  bot_token?: string;
  page_id?: string;
  webhook_url?: string;
}

export interface Channel {
  id: string;
  agent_id: string;
  channel_type: ChannelType;
  channel_config: ChannelConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateChannelRequest {
  agent_id: string;
  channel_type: ChannelType;
  channel_config: ChannelConfig;
}

export interface ToggleChannelRequest {
  is_active: boolean;
}

// ============================================================================
// Integrations (OAuth Apps)
// ============================================================================

export interface Integration {
  name: string;
  display_name: string;
  description: string;
  icon_url?: string;
  is_connected: boolean;
  scopes?: string[];
  category?: string;
  auth_type?: 'oauth2' | 'api_key' | 'basic';
}

export interface IntegrationApp extends Integration {}

export interface ConnectIntegrationRequest {
  agent_id: string;
  app_name: string;
  tenant_id?: string;
  redirect_url?: string;
}

export interface ConnectIntegrationResponse {
  redirect_url?: string;
  oauth_url?: string;
  state: string;
  connection_id?: string;
}

export interface ConnectedIntegration {
  app_name: string;
  connected_at: string;
  scopes: string[];
  entity_id: string;
}

// ============================================================================
// Health & Monitoring
// ============================================================================

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  timestamp?: string;
  version?: string;
  services?: {
    database?: {
      status: string;
      initialized: boolean;
      singleton: boolean;
      url_format?: string;
    };
    environment?: Record<string, string>;
    composio?: {
      status: string;
      configured: boolean;
    };
  };
}

// ============================================================================
// API Error Response
// ============================================================================

export interface APIError {
  detail: string;
  status?: number;
  status_code?: number;
  errors?: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

// Alias for backwards compatibility
export type ApiError = APIError;

// ============================================================================
// Authentication Responses
// ============================================================================

export interface AuthResponse {
  user: User;
  token: string;
  tenant_id: string;
  expires_at?: string;
}
