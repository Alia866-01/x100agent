#!/usr/bin/env python3
"""
Environment Variables Checker
Проверяет все необходимые environment variables перед запуском в продакшен
"""

import os
from dotenv import load_dotenv
from typing import Dict, List, Tuple

# Загружаем .env.local
load_dotenv(".env.local")

# Цветные коды для терминала
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"


class EnvChecker:
    def __init__(self):
        self.results: List[Tuple[str, str, str, str]] = []  # (name, status, value_preview, priority)

    def check(self, name: str, priority: str = "CRITICAL", show_value: bool = False):
        """Проверить environment variable"""
        value = os.getenv(name)

        if value:
            status = f"{GREEN}✅ SET{RESET}"
            if show_value:
                preview = value[:30] + "..." if len(value) > 30 else value
            else:
                preview = "***" + value[-4:] if len(value) >= 4 else "***"
        else:
            status = f"{RED}❌ MISSING{RESET}"
            preview = "NOT SET"

        self.results.append((name, status, preview, priority))
        return bool(value)

    def print_results(self):
        """Вывести результаты проверки"""
        print("\n" + "=" * 80)
        print("🔍 ENVIRONMENT VARIABLES CHECK")
        print("=" * 80)

        # Группировка по приоритету
        priorities = {
            "CRITICAL": [],
            "IMPORTANT": [],
            "OPTIONAL": []
        }

        for name, status, preview, priority in self.results:
            priorities[priority].append((name, status, preview))

        # Вывод по группам
        for priority, items in priorities.items():
            if not items:
                continue

            print(f"\n{'🔴' if priority == 'CRITICAL' else '🟡' if priority == 'IMPORTANT' else '🟢'} {priority}")
            print("-" * 80)

            for name, status, preview in items:
                padding = " " * (35 - len(name))
                print(f"{name}{padding} {status}  {preview}")

        # Сводка
        total = len(self.results)
        set_count = sum(1 for _, status, _, _ in self.results if "✅" in status)
        missing_count = total - set_count

        print("\n" + "=" * 80)
        print(f"📊 SUMMARY: {set_count}/{total} variables set")

        if missing_count == 0:
            print(f"{GREEN}✅ All environment variables are configured!{RESET}")
        else:
            print(f"{RED}❌ {missing_count} variables are missing{RESET}")

        # Критические переменные
        critical_missing = [
            name for name, status, _, priority in self.results
            if priority == "CRITICAL" and "❌" in status
        ]

        if critical_missing:
            print(f"\n{RED}⚠️  CRITICAL MISSING:{RESET}")
            for name in critical_missing:
                print(f"   - {name}")
            print(f"\n{RED}Cannot start in production without these!{RESET}")
            return False
        else:
            print(f"\n{GREEN}✅ All critical variables are set{RESET}")
            return True


def main():
    checker = EnvChecker()

    print("\n🚀 Checking environment configuration...")

    # === CRITICAL ===
    print("\nChecking CRITICAL variables...")
    checker.check("JWT_SECRET_KEY", "CRITICAL")
    checker.check("DATABASE_URL", "CRITICAL", show_value=True)
    checker.check("ANTHROPIC_API_KEY", "CRITICAL")
    checker.check("COMPOSIO_API_KEY", "CRITICAL")

    # === IMPORTANT ===
    print("Checking IMPORTANT variables...")
    checker.check("BACKEND_URL", "IMPORTANT", show_value=True)
    checker.check("FRONTEND_URL", "IMPORTANT", show_value=True)
    checker.check("WHATSAPP_VERIFY_TOKEN", "IMPORTANT")
    checker.check("INSTAGRAM_VERIFY_TOKEN", "IMPORTANT")
    checker.check("DEBUG", "IMPORTANT", show_value=True)

    # === OPTIONAL ===
    print("Checking OPTIONAL variables...")
    checker.check("CLICKHOUSE_HOST", "OPTIONAL", show_value=True)
    checker.check("CLICKHOUSE_PORT", "OPTIONAL", show_value=True)
    checker.check("CLICKHOUSE_DATABASE", "OPTIONAL", show_value=True)
    checker.check("UPSTASH_REDIS_REST_URL", "OPTIONAL")
    checker.check("GOOGLE_CLIENT_ID", "OPTIONAL")
    checker.check("GOOGLE_CLIENT_SECRET", "OPTIONAL")
    checker.check("OPENROUTER_API_KEY", "OPTIONAL")

    # Вывод результатов
    is_ready = checker.print_results()

    # Дополнительные проверки
    print("\n" + "=" * 80)
    print("🔍 ADDITIONAL CHECKS")
    print("=" * 80)

    # Проверка DEBUG mode
    debug = os.getenv("DEBUG", "false").lower()
    if debug == "true":
        print(f"{YELLOW}⚠️  DEBUG mode is ENABLED{RESET}")
        print(f"   This should be 'false' in production!")
    else:
        print(f"{GREEN}✅ DEBUG mode is disabled{RESET}")

    # Проверка формата DATABASE_URL
    db_url = os.getenv("DATABASE_URL", "")
    if db_url:
        if db_url.startswith("postgresql://") or db_url.startswith("postgresql+psycopg://"):
            print(f"{GREEN}✅ DATABASE_URL format is correct{RESET}")
        else:
            print(f"{RED}❌ DATABASE_URL format is invalid{RESET}")
            print(f"   Expected: postgresql:// or postgresql+psycopg://")

    # Проверка длины JWT_SECRET_KEY
    jwt_secret = os.getenv("JWT_SECRET_KEY", "")
    if jwt_secret:
        if len(jwt_secret) >= 32:
            print(f"{GREEN}✅ JWT_SECRET_KEY length is sufficient ({len(jwt_secret)} chars){RESET}")
        else:
            print(f"{YELLOW}⚠️  JWT_SECRET_KEY is too short ({len(jwt_secret)} chars){RESET}")
            print(f"   Recommended: at least 32 characters")

    # Финальный статус
    print("\n" + "=" * 80)
    if is_ready and debug != "true":
        print(f"{GREEN}✅ READY FOR PRODUCTION{RESET}")
        print("\nNext steps:")
        print("1. Uncomment Platform Agent in backend/main.py")
        print("2. Verify RLS policies in database")
        print("3. Run tests: pytest backend/tests/")
        print("4. Deploy! 🚀")
        return 0
    else:
        print(f"{RED}❌ NOT READY FOR PRODUCTION{RESET}")
        print("\nPlease fix the issues above before deployment.")
        print("See MISSING_CONFIG.md for detailed setup instructions.")
        return 1


if __name__ == "__main__":
    exit(main())
