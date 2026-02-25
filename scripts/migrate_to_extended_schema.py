#!/usr/bin/env python3
"""
Migration script to upgrade from schema.sql to schema_extended.sql

This script:
1. Adds missing columns to existing tables
2. Renames embeddings to tenant_embeddings
3. Drops and recreates RLS policies
4. Creates new tables (customer_data, customer_memories, agent sessions)
"""

import os
import asyncio
import asyncpg
import logging
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set in environment")


async def migrate_schema():
    """Apply migration from old schema to extended schema"""

    logger.info("="*60)
    logger.info("  AI-01 Schema Migration to Extended Schema")
    logger.info("="*60)

    # Connect to database
    logger.info("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Start transaction
        async with conn.transaction():

            # ============================================
            # STEP 1: ALTER EXISTING TABLES
            # ============================================
            logger.info("\n=== Step 1: Altering existing tables ===")

            # Add columns to messages table
            logger.info("Adding columns to messages table...")
            await conn.execute("""
                ALTER TABLE messages
                ADD COLUMN IF NOT EXISTS agent_id UUID,
                ADD COLUMN IF NOT EXISTS customer_id TEXT,
                ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text',
                ADD COLUMN IF NOT EXISTS tool_calls JSONB,
                ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
            """)

            # Rename timestamp to created_at if exists
            logger.info("Renaming timestamp column...")
            try:
                await conn.execute("""
                    DO $$
                    BEGIN
                        IF EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_name = 'messages' AND column_name = 'timestamp'
                        ) THEN
                            ALTER TABLE messages RENAME COLUMN timestamp TO created_at_old;
                        END IF;
                    END $$;
                """)
            except Exception as e:
                logger.warning(f"Could not rename timestamp column: {e}")

            # Add columns to conversations table
            logger.info("Adding columns to conversations table...")
            await conn.execute("""
                ALTER TABLE conversations
                ADD COLUMN IF NOT EXISTS channel_id UUID,
                ADD COLUMN IF NOT EXISTS customer_id TEXT,
                ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
                ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
                ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW();
            """)

            # ============================================
            # STEP 2: RENAME embeddings TO tenant_embeddings
            # ============================================
            logger.info("\n=== Step 2: Renaming embeddings table ===")

            # Check if embeddings table exists
            exists = await conn.fetchval("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_name = 'embeddings'
                )
            """)

            if exists:
                logger.info("Renaming embeddings to tenant_embeddings...")
                # Drop existing RLS policy first
                try:
                    await conn.execute("DROP POLICY IF EXISTS embedding_isolation_policy ON embeddings;")
                except Exception as e:
                    logger.warning(f"Could not drop policy: {e}")

                # Rename table
                await conn.execute("""
                    ALTER TABLE embeddings RENAME TO tenant_embeddings;
                """)
                logger.info("✅ Renamed embeddings → tenant_embeddings")
            else:
                logger.info("embeddings table doesn't exist, skipping rename")

            # ============================================
            # STEP 3: CREATE NEW TABLES
            # ============================================
            logger.info("\n=== Step 3: Creating new tables ===")

            # Create customer_data table
            logger.info("Creating customer_data table...")
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS customer_data (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
                  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,

                  customer_id TEXT NOT NULL,
                  customer_type TEXT DEFAULT 'lead',

                  name TEXT,
                  email TEXT,
                  phone TEXT,
                  company TEXT,

                  qualification_status TEXT DEFAULT 'not_qualified',
                  qualification_score INTEGER,
                  qualification_data JSONB DEFAULT '{}',

                  tags TEXT[],
                  custom_fields JSONB DEFAULT '{}',
                  notes TEXT,

                  source TEXT,
                  metadata JSONB DEFAULT '{}',

                  created_at TIMESTAMPTZ DEFAULT NOW(),
                  updated_at TIMESTAMPTZ DEFAULT NOW(),
                  last_contact_at TIMESTAMPTZ DEFAULT NOW(),

                  UNIQUE(tenant_id, agent_id, customer_id)
                );

                CREATE INDEX IF NOT EXISTS customer_data_lookup_idx
                  ON customer_data(tenant_id, agent_id, customer_id);
            """)
            logger.info("✅ Created customer_data table")

            # Create platform_agent_sessions table
            logger.info("Creating platform_agent_sessions table...")
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS platform_agent_sessions (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  session_id TEXT NOT NULL UNIQUE,
                  user_id TEXT,
                  tenant_id UUID,

                  messages JSONB DEFAULT '[]',
                  metadata JSONB DEFAULT '{}',
                  summary TEXT,

                  created_at TIMESTAMPTZ DEFAULT NOW(),
                  updated_at TIMESTAMPTZ DEFAULT NOW()
                );
            """)
            logger.info("✅ Created platform_agent_sessions table")

            # Create sales_agent_sessions table
            logger.info("Creating sales_agent_sessions table...")
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS sales_agent_sessions (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  session_id TEXT NOT NULL,
                  user_id TEXT,
                  tenant_id UUID,
                  agent_id UUID,

                  messages JSONB DEFAULT '[]',
                  metadata JSONB DEFAULT '{}',
                  summary TEXT,

                  created_at TIMESTAMPTZ DEFAULT NOW(),
                  updated_at TIMESTAMPTZ DEFAULT NOW(),

                  UNIQUE(tenant_id, session_id)
                );
            """)
            logger.info("✅ Created sales_agent_sessions table")

            # Create customer_memories table
            logger.info("Creating customer_memories table...")
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS customer_memories (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
                  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
                  user_id TEXT NOT NULL,

                  memory TEXT NOT NULL,
                  memory_type TEXT DEFAULT 'fact',
                  confidence REAL DEFAULT 1.0,

                  metadata JSONB DEFAULT '{}',

                  created_at TIMESTAMPTZ DEFAULT NOW(),
                  updated_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS customer_memories_lookup_idx
                  ON customer_memories(tenant_id, agent_id, user_id);
            """)
            logger.info("✅ Created customer_memories table")

            # ============================================
            # STEP 4: DROP AND RECREATE RLS POLICIES
            # ============================================
            logger.info("\n=== Step 4: Updating RLS policies ===")

            # Drop existing policies
            logger.info("Dropping old policies...")
            policies_to_drop = [
                ("messages", "message_isolation_policy"),
                ("conversations", "conversation_isolation_policy"),
                ("agents", "agent_isolation_policy"),
                ("agent_channels", "agent_channel_isolation_policy"),
                ("knowledge_sources", "ks_isolation_policy"),
                ("tenant_embeddings", "embedding_isolation_policy"),
                ("users", "user_isolation_policy"),
                ("tenants", "tenant_isolation_policy"),
            ]

            for table, policy in policies_to_drop:
                try:
                    await conn.execute(f"DROP POLICY IF EXISTS {policy} ON {table};")
                except Exception as e:
                    logger.warning(f"Could not drop {policy}: {e}")

            # Enable RLS on new tables
            logger.info("Enabling RLS on all tables...")
            tables_for_rls = [
                "tenants", "users", "agents", "agent_channels",
                "knowledge_sources", "tenant_embeddings", "customer_data",
                "conversations", "messages", "platform_agent_sessions",
                "sales_agent_sessions", "customer_memories"
            ]

            for table in tables_for_rls:
                try:
                    await conn.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;")
                except Exception as e:
                    logger.warning(f"Could not enable RLS on {table}: {e}")

            # Create new policies
            logger.info("Creating new RLS policies...")

            await conn.execute("""
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
            """)

            logger.info("✅ RLS policies updated")

            # ============================================
            # STEP 5: CREATE HELPER FUNCTIONS
            # ============================================
            logger.info("\n=== Step 5: Creating helper functions ===")

            await conn.execute("""
                CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
                RETURNS VOID AS $$
                BEGIN
                  PERFORM set_config('app.current_tenant', tenant_uuid::text, false);
                END;
                $$ LANGUAGE plpgsql;

                CREATE OR REPLACE FUNCTION get_tenant_context()
                RETURNS UUID AS $$
                BEGIN
                  RETURN current_setting('app.current_tenant', true)::uuid;
                END;
                $$ LANGUAGE plpgsql;
            """)

            logger.info("✅ Helper functions created")

            # ============================================
            # STEP 6: CREATE MIGRATION TRACKING
            # ============================================
            logger.info("\n=== Step 6: Recording migration ===")

            await conn.execute("""
                CREATE TABLE IF NOT EXISTS schema_migrations (
                  id SERIAL PRIMARY KEY,
                  version TEXT NOT NULL UNIQUE,
                  description TEXT,
                  executed_at TIMESTAMPTZ DEFAULT NOW()
                );

                INSERT INTO schema_migrations (version, description)
                VALUES ('1.0.0', 'Extended schema with 3-level isolation')
                ON CONFLICT (version) DO NOTHING;
            """)

            logger.info("✅ Migration recorded")

        logger.info("\n" + "="*60)
        logger.info("  ✅ Migration Complete!")
        logger.info("="*60)
        logger.info("\nTables created/updated:")
        logger.info("  ✅ customer_data (NEW)")
        logger.info("  ✅ platform_agent_sessions (NEW)")
        logger.info("  ✅ sales_agent_sessions (NEW)")
        logger.info("  ✅ customer_memories (NEW)")
        logger.info("  ✅ tenant_embeddings (renamed from embeddings)")
        logger.info("  ✅ messages (added columns)")
        logger.info("  ✅ conversations (added columns)")
        logger.info("\nRLS policies updated on all tables")
        logger.info("\nNext steps:")
        logger.info("  1. Run Agno MigrationManager (optional)")
        logger.info("  2. Test Platform Agent")
        logger.info("  3. Test Sales Agent with customer data")
        logger.info("")

    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        raise
    finally:
        await conn.close()


async def run_agno_migrations():
    """Run Agno's MigrationManager (optional)"""
    logger.info("\n=== Running Agno MigrationManager ===")

    try:
        from agno.db.postgres import AsyncPostgresDb
        from agno.db.migrations import MigrationManager

        db = AsyncPostgresDb(db_url=DATABASE_URL)
        await MigrationManager(db).up()

        logger.info("✅ Agno migrations complete")
    except Exception as e:
        logger.warning(f"⚠️  Agno migrations failed (this is OK if tables already exist): {e}")


if __name__ == "__main__":
    print("============================================================")
    print("  AI-01 Schema Migration")
    print("============================================================")
    print("")
    print("This will:")
    print("  1. Add columns to existing tables")
    print("  2. Rename embeddings → tenant_embeddings")
    print("  3. Create new tables (customer_data, memories, sessions)")
    print("  4. Update RLS policies")
    print("")

    response = input("Continue with migration? (yes/no): ")
    if response.lower() != "yes":
        print("Migration cancelled")
        exit(0)

    print("")
    asyncio.run(migrate_schema())

    # Optional: Run Agno migrations
    print("")
    response = input("Run Agno MigrationManager? (yes/no): ")
    if response.lower() == "yes":
        asyncio.run(run_agno_migrations())
