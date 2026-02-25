#!/usr/bin/env python3
"""
Apply Extended Schema with Multi-Level Isolation

Applies schema_extended.sql to database and runs Agno migrations

Usage:
    python scripts/apply_extended_schema.py
"""

import asyncio
import asyncpg
import os
from pathlib import Path
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set in environment")


async def apply_schema():
    """Apply extended schema to database"""

    logger.info("=== Applying Extended Schema ===")

    # Read schema file
    schema_path = Path(__file__).parent.parent / "schema_extended.sql"

    if not schema_path.exists():
        logger.error(f"Schema file not found: {schema_path}")
        return False

    logger.info(f"Reading schema from {schema_path}")

    with open(schema_path, 'r') as f:
        schema_sql = f.read()

    # Connect to database
    logger.info("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Apply schema
        logger.info("Applying schema...")
        await conn.execute(schema_sql)
        logger.info("✅ Schema applied successfully!")

        # Verify tables
        logger.info("\n=== Verifying Tables ===")
        tables = await conn.fetch("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)

        logger.info(f"Found {len(tables)} tables:")
        for table in tables:
            logger.info(f"  - {table['table_name']}")

        # Verify RLS
        logger.info("\n=== Verifying RLS ===")
        rls_tables = await conn.fetch("""
            SELECT tablename, rowsecurity
            FROM pg_tables
            WHERE schemaname = 'public' AND rowsecurity = true
            ORDER BY tablename
        """)

        logger.info(f"RLS enabled on {len(rls_tables)} tables:")
        for table in rls_tables:
            logger.info(f"  - {table['tablename']}")

        return True

    except Exception as e:
        logger.error(f"❌ Error applying schema: {e}")
        return False

    finally:
        await conn.close()


async def run_agno_migrations():
    """Run Agno MigrationManager"""

    logger.info("\n=== Running Agno Migrations ===")

    try:
        from agno.db.postgres import AsyncPostgresDb
        from agno.db.migrations import MigrationManager

        logger.info("Initializing Agno database...")
        db = AsyncPostgresDb(db_url=DATABASE_URL)

        logger.info("Running MigrationManager...")
        await MigrationManager(db).up()

        logger.info("✅ Agno migrations completed!")

        # Verify agno tables
        logger.info("\n=== Verifying Agno Tables ===")
        conn = await asyncpg.connect(DATABASE_URL)

        try:
            agno_tables = await conn.fetch("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name LIKE 'agno_%'
                ORDER BY table_name
            """)

            logger.info(f"Found {len(agno_tables)} Agno tables:")
            for table in agno_tables:
                logger.info(f"  - {table['table_name']}")

        finally:
            await conn.close()

        return True

    except ImportError:
        logger.warning("⚠️  Agno not installed, skipping migrations")
        logger.info("   Install with: pip install agno")
        return False

    except Exception as e:
        logger.error(f"❌ Error running Agno migrations: {e}")
        return False


async def verify_isolation():
    """Verify multi-tenant isolation"""

    logger.info("\n=== Verifying Multi-Tenant Isolation ===")

    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Create test tenant
        test_tenant_id = "test-tenant-" + os.urandom(4).hex()

        logger.info(f"Creating test tenant: {test_tenant_id}")
        await conn.execute("""
            INSERT INTO tenants (id, name, plan_tier)
            VALUES ($1, 'Test Tenant', 'free')
        """, test_tenant_id)

        # Set tenant context
        logger.info("Setting tenant context...")
        await conn.execute(f"SET app.current_tenant = '{test_tenant_id}'")

        # Verify RLS works
        logger.info("Testing RLS isolation...")
        tenants = await conn.fetch("SELECT * FROM tenants")

        if len(tenants) == 1 and str(tenants[0]['id']) == test_tenant_id:
            logger.info("✅ RLS working correctly - can only see own tenant")
        else:
            logger.error("❌ RLS not working - seeing other tenants!")
            return False

        # Cleanup
        logger.info("Cleaning up test data...")
        await conn.execute("RESET app.current_tenant")
        await conn.execute("DELETE FROM tenants WHERE id = $1", test_tenant_id)

        logger.info("✅ Multi-tenant isolation verified!")
        return True

    except Exception as e:
        logger.error(f"❌ Error verifying isolation: {e}")
        return False

    finally:
        await conn.close()


async def main():
    """Main migration script"""

    print("\n" + "="*60)
    print("  AI-01 Extended Schema Migration")
    print("="*60 + "\n")

    # Step 1: Apply schema
    success = await apply_schema()
    if not success:
        logger.error("\n❌ Schema application failed!")
        return

    # Step 2: Run Agno migrations
    success = await run_agno_migrations()
    if not success:
        logger.warning("\n⚠️  Agno migrations failed or skipped")

    # Step 3: Verify isolation
    success = await verify_isolation()
    if not success:
        logger.error("\n❌ Isolation verification failed!")
        return

    # Success!
    print("\n" + "="*60)
    print("  ✅ Migration Complete!")
    print("="*60)
    print("\nNext steps:")
    print("  1. Test Platform Agent:")
    print("     python backend/main.py")
    print("     # Visit http://localhost:8000/v1/agents")
    print()
    print("  2. Test Sales Agent:")
    print("     python backend/agents/sales_full.py")
    print()
    print("  3. Test Customer Service:")
    print("     python backend/services/customer_data.py")
    print()


if __name__ == "__main__":
    asyncio.run(main())
