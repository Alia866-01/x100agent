-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  plan_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT
);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'member',
  auth_provider_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  role_description TEXT,
  status TEXT DEFAULT 'setup', -- setup, active, paused
  config JSONB DEFAULT '{}',
  whatsapp_number_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agent_channels table (multi-channel support)
CREATE TABLE agent_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL, -- 'whatsapp', 'telegram', 'instagram', 'email'
  channel_config JSONB NOT NULL DEFAULT '{}', -- Stores tokens, credentials, channel-specific settings
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, channel_type) -- One channel config per agent per type
);

-- Create knowledge_sources table
CREATE TABLE knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  agent_id UUID REFERENCES agents(id),
  filename TEXT NOT NULL,
  file_type TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create embeddings table (using pgvector)
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  content TEXT,
  embedding vector(1536), -- Assuming OpenAI dimension
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  agent_id UUID REFERENCES agents(id),
  channel_id UUID REFERENCES agent_channels(id), -- Which channel this conversation is on
  user_identifier TEXT NOT NULL, -- Phone, email, username, etc (depends on channel)
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  tenant_id UUID REFERENCES tenants(id), -- Denormalized for RLS efficiency
  sender TEXT NOT NULL, -- 'user' or 'agent'
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- We assume the application will set a config variable 'app.current_tenant' 
-- or we use the user's UUID mapping to tenant. 
-- For simplicity in this SQL, we'll assume the app sets the current tenant ID in a session variable.

-- Tenants: Users can only see their own tenant
CREATE POLICY tenant_isolation_policy ON tenants
    USING (id = current_setting('app.current_tenant', true)::uuid);

-- Users: Users can see users in their tenant
CREATE POLICY user_isolation_policy ON users
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Agents: Users can see agents in their tenant
CREATE POLICY agent_isolation_policy ON agents
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Agent Channels: Users can see channels in their tenant
CREATE POLICY agent_channel_isolation_policy ON agent_channels
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Knowledge Sources
CREATE POLICY ks_isolation_policy ON knowledge_sources
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Embeddings
CREATE POLICY embedding_isolation_policy ON embeddings
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Conversations
CREATE POLICY conversation_isolation_policy ON conversations
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Messages
CREATE POLICY message_isolation_policy ON messages
    USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
