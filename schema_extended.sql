-- ============================================
-- AI-01 Extended Schema with Multi-Level Isolation
--
-- Level 1: Platform (tenants, users)
-- Level 2: Tenant (agents, knowledge, embeddings)
-- Level 3: Customer (customer_data, memories, messages)
-- ============================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LEVEL 1: PLATFORM TABLES
-- ============================================

-- Tenants table (ваши клиенты)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  plan_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  settings JSONB DEFAULT '{}'
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'member', -- owner, admin, member
  auth_provider_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEVEL 2: TENANT TABLES
-- ============================================

-- Agents table (конфигурации агентов)
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_description TEXT,
  status TEXT DEFAULT 'setup', -- setup, active, paused, archived
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Channels table (multi-channel support)
CREATE TABLE IF NOT EXISTS agent_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL, -- 'whatsapp', 'telegram', 'instagram', 'email', 'web'
  channel_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, channel_type)
);

-- Knowledge Sources table (tenant documents)
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT,
  file_url TEXT,
  file_size BIGINT,
  processed BOOLEAN DEFAULT FALSE,
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant Embeddings table (RAG для каждого tenant)
CREATE TABLE IF NOT EXISTS tenant_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  source_id UUID REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  chunk_index INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS tenant_embeddings_vector_idx
  ON tenant_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for tenant isolation
CREATE INDEX IF NOT EXISTS tenant_embeddings_tenant_idx
  ON tenant_embeddings(tenant_id);

-- ============================================
-- LEVEL 3: CUSTOMER TABLES (End Customers)
-- ============================================

-- Customer Data table (клиенты ваших клиентов)
CREATE TABLE IF NOT EXISTS customer_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,

  -- Customer identifiers
  customer_id TEXT NOT NULL, -- External ID (phone, email, telegram_id, etc)
  customer_type TEXT DEFAULT 'lead', -- lead, prospect, customer, churned

  -- Basic info
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,

  -- Qualification data
  qualification_status TEXT DEFAULT 'not_qualified', -- not_qualified, in_progress, qualified, disqualified
  qualification_score INTEGER, -- 0-100
  qualification_data JSONB DEFAULT '{}', -- answers to qualification questions

  -- CRM fields
  tags TEXT[], -- array of tags
  custom_fields JSONB DEFAULT '{}', -- flexible custom fields
  notes TEXT,

  -- Metadata
  source TEXT, -- whatsapp, telegram, web, referral
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contact_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique customer per tenant
  UNIQUE(tenant_id, agent_id, customer_id)
);

-- Index for fast customer lookup
CREATE INDEX IF NOT EXISTS customer_data_lookup_idx
  ON customer_data(tenant_id, agent_id, customer_id);

-- Conversations table (разговоры с end customers)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES agent_channels(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL, -- External customer identifier

  status TEXT DEFAULT 'active', -- active, archived, closed
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for conversation lookup
CREATE INDEX IF NOT EXISTS conversations_lookup_idx
  ON conversations(tenant_id, agent_id, customer_id);

-- Messages table (все сообщения)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id),
  customer_id TEXT NOT NULL,

  sender TEXT NOT NULL, -- 'user' or 'agent'
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, image, document, audio, video

  -- Tool usage tracking
  tool_calls JSONB, -- which tools were called
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for message history
CREATE INDEX IF NOT EXISTS messages_conversation_idx
  ON messages(conversation_id, created_at DESC);

-- Index for customer messages
CREATE INDEX IF NOT EXISTS messages_customer_idx
  ON messages(tenant_id, customer_id, created_at DESC);

-- ============================================
-- AGNO-MANAGED TABLES
-- These tables are auto-created by Agno when agents run
-- We define them here for completeness and RLS policies
-- ============================================

-- Platform Agent Sessions (created by Agno)
CREATE TABLE IF NOT EXISTS platform_agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id TEXT,
  tenant_id UUID, -- FK to tenants

  -- Agno-managed fields
  messages JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  summary TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Agent Sessions (created by Agno)
CREATE TABLE IF NOT EXISTS sales_agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL, -- conversation_id from WhatsApp
  user_id TEXT, -- customer_id
  tenant_id UUID, -- FK to tenants
  agent_id UUID, -- FK to agents

  -- Agno-managed fields
  messages JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  summary TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, session_id)
);

-- Customer Memories (created by Agno MemoryManager)
CREATE TABLE IF NOT EXISTS customer_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- customer_id

  -- Agno-managed memory fields
  memory TEXT NOT NULL,
  memory_type TEXT DEFAULT 'fact', -- fact, preference, event
  confidence REAL DEFAULT 1.0,

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for memory retrieval
CREATE INDEX IF NOT EXISTS customer_memories_lookup_idx
  ON customer_memories(tenant_id, agent_id, user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_memories ENABLE ROW LEVEL SECURITY;

-- Level 1: Platform isolation
CREATE POLICY tenant_isolation_policy ON tenants
    USING (id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY user_isolation_policy ON users
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Level 2: Tenant isolation
CREATE POLICY agent_isolation_policy ON agents
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY agent_channel_isolation_policy ON agent_channels
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY ks_isolation_policy ON knowledge_sources
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY embedding_isolation_policy ON tenant_embeddings
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY platform_sessions_isolation_policy ON platform_agent_sessions
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Level 3: Customer isolation
CREATE POLICY customer_data_isolation_policy ON customer_data
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY conversation_isolation_policy ON conversations
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY message_isolation_policy ON messages
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY sales_sessions_isolation_policy ON sales_agent_sessions
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY customer_memories_isolation_policy ON customer_memories
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_uuid::text, false);
END;
$$ LANGUAGE plpgsql;

-- Function to get tenant context
CREATE OR REPLACE FUNCTION get_tenant_context()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant', true)::uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Create a default platform tenant (for testing)
INSERT INTO tenants (id, name, plan_tier)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Platform',
  'enterprise'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MIGRATION TRACKING
-- ============================================

-- Agno will create agno_schema_versions table automatically
-- when MigrationManager runs

-- Manual migration tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  description TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO schema_migrations (version, description)
VALUES ('1.0.0', 'Initial schema with multi-level isolation')
ON CONFLICT (version) DO NOTHING;
