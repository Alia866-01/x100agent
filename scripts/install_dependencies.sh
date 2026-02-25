#!/bin/bash

# AI-01 Dependencies Installation Script
# Устанавливает все Python зависимости для backend

set -e  # Exit on error

echo "======================================"
echo "  AI-01 Dependencies Installation"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Error: backend/requirements.txt not found"
    echo "   Please run this script from /Users/user/ai-01"
    exit 1
fi

echo "📦 Installing Python dependencies..."
echo ""

# Install all dependencies
pip install -r backend/requirements.txt

echo ""
echo "======================================"
echo "  ✅ Installation Complete!"
echo "======================================"
echo ""
echo "Installed packages:"
echo "  ✅ agno - AI agent framework"
echo "  ✅ fastapi - API framework"
echo "  ✅ composio-core - Tool Router"
echo "  ✅ asyncpg - Async PostgreSQL"
echo "  ✅ httpx - Async HTTP client"
echo "  ✅ PyJWT[crypto] - JWT verification"
echo "  ✅ ... and more"
echo ""
echo "Next steps:"
echo "  1. python backend/main.py         # Start FastAPI"
echo "  2. python test_agno_motia_integration.py  # Test integration"
echo ""
