#!/bin/bash

# Oathbreakers Frontend Build Script

set -e

echo "🔨 Building Oathbreakers Frontend Assets..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Build CSS
echo "🎨 Building Tailwind CSS..."
npm run build:css
echo "✅ CSS built successfully"
echo ""

# Build JavaScript
echo "⚛️  Building React with Webpack..."
npm run build:js
echo "✅ JavaScript built successfully"
echo ""

echo "🎉 Build complete!"
echo ""
echo "Generated files:"
echo "  - game/static/game/css/tailwind.css"
echo "  - game/static/game/dist/app.js"
echo "  - game/static/game/dist/vendor.js"
