#!/bin/bash

# PulseFlow Development Setup Script
# Automated setup for development environment

set -e

echo "🚀 PulseFlow Development Setup"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
echo -e "${BLUE}[1/6]${NC} Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$MAJOR_VERSION" -lt 18 ]; then
  echo -e "${YELLOW}⚠️  Warning: Node.js 18+ recommended (you have $NODE_VERSION)${NC}"
else
  echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION"
fi

# Install dependencies
echo -e "${BLUE}[2/6]${NC} Installing dependencies..."
npm install --legacy-peer-deps > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Dependencies installed"

# Create environment file
echo -e "${BLUE}[3/6]${NC} Setting up environment..."
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo -e "${GREEN}✓${NC} Created .env.local"
  echo -e "${YELLOW}⚠️  Edit .env.local with your Supabase credentials${NC}"
else
  echo -e "${GREEN}✓${NC} .env.local already exists"
fi

# Run database setup
echo -e "${BLUE}[4/6]${NC} Setting up database..."
echo -e "${YELLOW}ℹ️  Database setup required:${NC}"
echo "   1. Create Supabase project at https://supabase.com"
echo "   2. Copy project URL and keys to .env.local"
echo "   3. Run supabase/schema.sql in SQL editor"
echo "   4. Create test user in Auth section"
echo ""
read -p "Press Enter when database is ready..." 

# Build TypeScript
echo -e "${BLUE}[5/6]${NC} Checking TypeScript..."
npm run build > /dev/null 2>&1
echo -e "${GREEN}✓${NC} TypeScript check passed"

# Summary
echo ""
echo -e "${BLUE}[6/6]${NC} Setup complete!"
echo ""
echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}✅ Ready for development!${NC}"
echo -e "${GREEN}===================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local with your Supabase credentials"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000"
echo "  4. Login with your test user"
echo ""
