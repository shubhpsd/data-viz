#!/bin/bash

# DataViz Pro - First-Time Setup Script
# This script helps new users set up the project quickly

set -e

# Add Homebrew to PATH if it exists
if [ -d "/opt/homebrew/bin" ]; then
    export PATH="/opt/homebrew/bin:$PATH"
fi

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║     DataViz Pro - First-Time Setup      ║"
echo "╔══════════════════════════════════════════╗"
echo -e "${NC}"

# Check Node.js
echo -e "${BLUE}[1/6] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js 20+ from: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Node.js version is $NODE_VERSION, recommend 20+${NC}"
fi
echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# Check Python
echo -e "\n${BLUE}[2/6] Checking Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed!${NC}"
    echo "Please install Python 3.11+ from: https://python.org/"
    exit 1
fi
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"

# Setup environment files
echo -e "\n${BLUE}[3/6] Setting up environment files...${NC}"
./manage_services.sh setup > /dev/null 2>&1
echo -e "${GREEN}✓ Environment files created${NC}"

# Check for API key
echo -e "\n${BLUE}[4/6] Checking API configuration...${NC}"
if ! grep -q "GOOGLE_API_KEY=AI" backend_py/.env 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Google Gemini API key not found!${NC}"
    echo ""
    echo "To complete setup:"
    echo "  1. Get a FREE API key: https://aistudio.google.com/app/apikey"
    echo "  2. Edit backend_py/.env"
    echo "  3. Add your key: GOOGLE_API_KEY=your_key_here"
    echo ""
    read -p "Press Enter to continue setup (you can add the key later)..."
else
    echo -e "${GREEN}✓ API key configured${NC}"
fi

# Install Python dependencies
echo -e "\n${BLUE}[5/6] Installing Python dependencies...${NC}"
cd backend_py
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "Installing packages (this may take a minute)..."
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"
cd ..

# Install Frontend dependencies
echo -e "\n${BLUE}[6/6] Installing Frontend dependencies...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing Node packages (this may take a few minutes)..."
    yarn install --silent || npm install --silent
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi
cd ..

# Success message
echo -e "\n${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✓ Setup Complete!                ║${NC}"
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"

echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo ""
echo "  1️⃣  Add your API keys to backend_py/.env:"
echo "     ${YELLOW}GOOGLE_API_KEY${NC}     - Required (get at: https://aistudio.google.com/app/apikey)"
echo "     ${YELLOW}LANGSMITH_API_KEY${NC}  - Optional for debugging (get at: https://smith.langchain.com/)"
echo ""
echo "  2️⃣  Start all services:"
echo "     ${YELLOW}./manage_services.sh start${NC}"
echo ""
echo "  3️⃣  In a NEW terminal, start LangGraph:"
echo "     ${YELLOW}cd backend_py && langgraph dev --port 8123${NC}"
echo ""
echo "  4️⃣  Open your browser:"
echo "     ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  • README.md         - Full documentation"
echo "  • CONTRIBUTING.md   - Contribution guidelines"
echo "  • ./manage_services.sh help  - Service management"
echo ""
echo -e "${GREEN}Happy visualizing! 🎉${NC}"
