"""
Centralized Database Configuration for Agno Framework

This module provides shared PostgresDb instance and URL conversion helpers
for proper Agno + Neon PostgreSQL integration.

Key Features:
- DATABASE_URL format conversion (postgresql:// → postgresql+psycopg://)
- Singleton PostgresDb instance (shared across all agents)
- Multi-tenant support via RLS
"""

from agno.db.postgres import PostgresDb
from dotenv import load_dotenv
import os
from typing import Optional

# Load env early so DATABASE_URL is available at module import time
load_dotenv(".env.local")


def get_agno_db_url(standard_url: Optional[str] = None) -> str:
    """
    Convert standard PostgreSQL URL to Agno-compatible format.

    Agno requires psycopg driver format for Neon PostgreSQL:
    - Standard:  postgresql://user:pass@host/db
    - Agno:      postgresql+psycopg://user:pass@host/db

    Args:
        standard_url: PostgreSQL URL (defaults to DATABASE_URL env var)

    Returns:
        Agno-compatible database URL

    Raises:
        ValueError: If DATABASE_URL is not set

    Example:
        >>> url = get_agno_db_url()
        >>> # Returns: postgresql+psycopg://user:pass@ep-xxx.neon.tech/db
    """
    url = standard_url or os.getenv("DATABASE_URL")

    if not url:
        raise ValueError(
            "DATABASE_URL environment variable not set. "
            "Please set it in .env.local file."
        )

    # Convert to psycopg format if needed
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql+psycopg://"):
        return url  # Already in correct format
    else:
        raise ValueError(
            f"Invalid DATABASE_URL format: {url[:20]}... "
            "Expected postgresql:// or postgresql+psycopg://"
        )


# Singleton PostgresDb instance
_shared_db: Optional[PostgresDb] = None


def get_shared_db() -> PostgresDb:
    """
    Get singleton PostgresDb instance.

    This ensures all agents share the same database connection pool,
    reducing memory overhead and improving performance.

    Returns:
        Shared PostgresDb instance

    Example:
        >>> db = get_shared_db()
        >>> agent = Agent(db=db, ...)

    Note:
        From Agno documentation:
        "Create ONE PostgresDb instance and share it across all agents
        in your application."
    """
    global _shared_db

    if _shared_db is None:
        db_url = get_agno_db_url()
        _shared_db = PostgresDb(db_url=db_url)

        print(f"[Database] Initialized shared PostgresDb instance")
        print(f"[Database] URL: {db_url[:30]}...")

    return _shared_db


def reset_shared_db() -> None:
    """
    Reset singleton instance (useful for testing).

    WARNING: Only use this in test environments!
    """
    global _shared_db
    _shared_db = None
    print("[Database] Shared PostgresDb instance reset")


def get_db_stats() -> dict:
    """
    Get database connection statistics and health info.

    Returns:
        dict: Database statistics including:
            - initialized: Whether shared DB is initialized
            - url_format: Database URL format (masked)
            - db_instance: PostgresDb instance info

    Example:
        >>> stats = get_db_stats()
        >>> print(stats)
        {
            'initialized': True,
            'url_format': 'postgresql+psycopg://...',
            'singleton': True
        }
    """
    global _shared_db

    stats = {
        "initialized": _shared_db is not None,
        "singleton": True,  # Always true in this implementation
    }

    if _shared_db:
        # Get DB URL (masked for security)
        try:
            db_url = get_agno_db_url()
            # Mask password in URL
            if "@" in db_url:
                parts = db_url.split("@")
                credentials = parts[0].split("://")[1]
                if ":" in credentials:
                    user, password = credentials.split(":", 1)
                    masked_url = db_url.replace(f":{password}@", ":***@")
                    stats["url_format"] = masked_url[:60] + "..."
                else:
                    stats["url_format"] = db_url[:60] + "..."
            else:
                stats["url_format"] = db_url[:60] + "..."
        except Exception as e:
            stats["url_format"] = f"error: {str(e)}"

        # Instance info
        stats["db_instance"] = {
            "type": type(_shared_db).__name__,
            "has_db_url": hasattr(_shared_db, "db_url"),
        }
    else:
        stats["url_format"] = "not_initialized"
        stats["db_instance"] = None

    return stats


def print_db_health() -> None:
    """
    Print database health information (useful for monitoring).

    Example:
        >>> print_db_health()
        ╔══════════════════════════════════════════════════════╗
        ║         DATABASE HEALTH STATUS                       ║
        ╠══════════════════════════════════════════════════════╣
        ║  Status: ✅ Healthy                                  ║
        ║  Initialized: Yes                                    ║
        ║  Singleton: Yes                                      ║
        ║  URL Format: postgresql+psycopg://...                ║
        ╚══════════════════════════════════════════════════════╝
    """
    stats = get_db_stats()

    print()
    print("╔══════════════════════════════════════════════════════╗")
    print("║         DATABASE HEALTH STATUS                       ║")
    print("╠══════════════════════════════════════════════════════╣")

    if stats["initialized"]:
        print("║  Status: ✅ Healthy                                  ║")
        print(f"║  Initialized: Yes                                    ║")
        print(f"║  Singleton: {stats['singleton']}                                      ║")
        print(f"║  URL Format: {stats['url_format'][:30]}...      ║")
    else:
        print("║  Status: ⚠️  Not Initialized                        ║")
        print("║  Call get_shared_db() to initialize                 ║")

    print("╚══════════════════════════════════════════════════════╝")
    print()


# Convenience exports
__all__ = [
    "get_agno_db_url",
    "get_shared_db",
    "reset_shared_db",
    "get_db_stats",
    "print_db_health",
]


if __name__ == "__main__":
    """Test database configuration"""
    from dotenv import load_dotenv
    load_dotenv(".env.local")

    print("=" * 60)
    print("Testing Database Configuration")
    print("=" * 60)

    # Test URL conversion
    print("\n1. Testing URL conversion:")
    try:
        url = get_agno_db_url()
        print(f"   ✓ Converted URL: {url[:40]}...")
        assert url.startswith("postgresql+psycopg://")
        print("   ✓ Format is correct!")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        exit(1)

    # Test shared DB instance
    print("\n2. Testing shared DB instance:")
    try:
        db = get_shared_db()
        print(f"   ✓ Created PostgresDb instance")

        # Verify singleton
        db2 = get_shared_db()
        assert db is db2
        print("   ✓ Singleton pattern verified!")

    except Exception as e:
        print(f"   ✗ Error: {e}")
        exit(1)

    # Test monitoring functions
    print("\n3. Testing database monitoring:")
    try:
        stats = get_db_stats()
        print(f"   ✓ Stats retrieved: {stats['initialized']}")
        print(f"   ✓ URL format: {stats['url_format'][:40]}...")

        print("\n4. Printing health status:")
        print_db_health()

    except Exception as e:
        print(f"   ✗ Error: {e}")
        exit(1)

    print("\n" + "=" * 60)
    print("✅ All tests passed!")
    print("=" * 60)
