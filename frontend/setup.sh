#!/bin/bash

# OathBreakers Frontend Setup Script

echo "🎮 OathBreakers Frontend Setup"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "⚠️  Please run this script from the frontend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp .env.local.example .env.local
    echo "✅ .env.local created from .env.local.example"
    echo ""
    echo "⚠️  Please update NEXT_PUBLIC_API_BASE_URL in .env.local if needed"
else
    echo "ℹ️  .env.local already exists, skipping"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "The frontend will be available at: http://localhost:3000"
echo ""
echo "Make sure the Django backend is running at: http://localhost:8000"
