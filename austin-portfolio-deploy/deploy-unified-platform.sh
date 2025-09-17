#!/bin/bash

# Blaze Intelligence Unified Platform Deployment Script
# ======================================================

echo "🚀 BLAZE INTELLIGENCE UNIFIED PLATFORM DEPLOYMENT"
echo "=================================================="
echo ""

# Check if files exist
echo "✅ Checking required files..."

if [ -f "unified-platform-hub.html" ]; then
    echo "  ✓ unified-platform-hub.html found"
else
    echo "  ✗ unified-platform-hub.html missing!"
    exit 1
fi

if [ -f "js/unified-platform-connector.js" ]; then
    echo "  ✓ unified-platform-connector.js found"
else
    echo "  ✗ unified-platform-connector.js missing!"
    exit 1
fi

if [ -f "js/babylon-sports-components.js" ]; then
    echo "  ✓ babylon-sports-components.js found"
else
    echo "  ✗ babylon-sports-components.js missing!"
fi

if [ -f "_redirects" ]; then
    echo "  ✓ _redirects configuration found"
else
    echo "  ✗ _redirects configuration missing!"
fi

if [ -f "netlify.toml" ]; then
    echo "  ✓ netlify.toml configuration found"
else
    echo "  ✗ netlify.toml configuration missing!"
fi

echo ""
echo "📊 Platform Statistics:"
echo "  • Main site: https://blaze-intelligence.netlify.app"
echo "  • Analytics hub: https://blaze-intelligence-main.netlify.app"
echo "  • 3D Universe: https://blaze-3d.netlify.app"
echo ""
echo "🔄 New Unified Routes:"
echo "  • /hub → unified-platform-hub.html"
echo "  • /platform → unified-platform-hub.html"
echo "  • /platforms → unified-platform-hub.html"
echo ""
echo "🎯 Features Deployed:"
echo "  • Babylon.js 3D background with ray tracing support"
echo "  • Cross-domain navigation system"
echo "  • Unified platform connector JavaScript module"
echo "  • Netlify redirect configuration"
echo "  • Sports-specific 3D components"
echo ""

# Deploy with Netlify CLI
echo "📦 Starting Netlify deployment..."
echo ""

PATH="/Users/AustinHumphrey/.npm-global/bin:$PATH" netlify deploy --prod --message "🏆 UNIFIED PLATFORM HUB: Linking three Netlify sites - Main Platform + Analytics Hub + 3D Universe with Babylon.js integration" --timeout 600

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Access the unified platform at:"
echo "   https://blaze-intelligence.netlify.app/hub"
echo ""
echo "📱 Or use the quick access links:"
echo "   • https://blaze-intelligence.netlify.app/platform"
echo "   • https://blaze-intelligence.netlify.app/platforms"
echo ""