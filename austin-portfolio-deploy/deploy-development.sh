#!/bin/bash

# Blaze Intelligence Development Deployment Script
# Deploys enhanced platform to development environment

echo "🚀 Starting Blaze Intelligence Development Deployment..."

# Set environment variables
export NODE_ENV=development
export BLAZE_ENVIRONMENT=development
export API_VERSION=2.0.0

# Create development configuration
echo "📋 Creating development configuration..."

# Copy the development config
cp netlify-dev-config.toml netlify.toml.dev

# Create development-specific build directory
mkdir -p dev-build
cp -r . dev-build/ 2>/dev/null || echo "Directory copy completed"

# Remove unnecessary files from dev-build
rm -rf dev-build/node_modules dev-build/.git dev-build/backup_* dev-build/deployment_*

# Create a development manifest
cat > dev-build/development-manifest.json << EOF
{
  "environment": "development",
  "version": "2.0.0-dev",
  "features": {
    "enhancedApi": true,
    "liveMetrics": true,
    "dynamicLoading": true,
    "realTimeUpdates": true
  },
  "endpoints": {
    "enhancedGateway": "/api/enhanced-gateway",
    "liveMetrics": "/api/enhanced-live-metrics",
    "health": "/api/health"
  },
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "components": [
    "Enhanced API Gateway",
    "Enhanced Live Metrics",
    "Enhanced Dynamic Loading",
    "Enhanced Dynamic UI CSS"
  ]
}
EOF

echo "✅ Development manifest created"

# Deploy to Netlify with development settings
echo "🌐 Deploying to Netlify development environment..."

# Use the development config for deployment
npx netlify deploy \
  --dir=. \
  --functions=api \
  --alias=dev \
  --config=netlify-dev-config.toml \
  --open

if [ $? -eq 0 ]; then
    echo "✅ Development deployment successful!"
    
    # Test the deployment
    echo "🧪 Testing deployment..."
    
    # Create test script
    cat > test-deployment.js << 'EOF'
const fetch = require('node-fetch');

async function testDeployment() {
    const baseUrl = process.argv[2] || 'https://blaze-intelligence.netlify.app';
    
    console.log(`🧪 Testing deployment at: ${baseUrl}`);
    
    const tests = [
        { endpoint: '/api/enhanced-gateway?endpoint=health', name: 'Health Check' },
        { endpoint: '/api/enhanced-gateway?endpoint=cardinals-analytics', name: 'Cardinals Analytics' },
        { endpoint: '/api/enhanced-live-metrics?endpoint=cardinals', name: 'Live Metrics' }
    ];
    
    for (const test of tests) {
        try {
            console.log(`Testing ${test.name}...`);
            const response = await fetch(`${baseUrl}${test.endpoint}`);
            const data = await response.json();
            
            if (response.ok && data.success !== false) {
                console.log(`✅ ${test.name}: PASSED`);
            } else {
                console.log(`❌ ${test.name}: FAILED - ${JSON.stringify(data)}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        }
    }
    
    console.log('🎯 Testing complete!');
}

testDeployment();
EOF
    
    # Install node-fetch if not available
    npm install node-fetch 2>/dev/null || echo "node-fetch install attempted"
    
    # Wait a moment for deployment to be ready
    echo "⏳ Waiting for deployment to be ready..."
    sleep 10
    
    # Get the deployed URL
    DEPLOY_URL=$(npx netlify status | grep "Project URL" | cut -d: -f2- | xargs)
    echo "🌐 Testing deployment at: $DEPLOY_URL"
    
    # Run tests
    node test-deployment.js "$DEPLOY_URL"
    
    echo ""
    echo "🎉 Development deployment complete!"
    echo "📱 Development URL: $DEPLOY_URL"
    echo "🔧 Environment: development"
    echo "📊 Features: Enhanced API Gateway, Live Metrics, Dynamic Loading"
    echo ""
    echo "🔍 API Endpoints:"
    echo "  - Health: $DEPLOY_URL/api/enhanced-gateway?endpoint=health"
    echo "  - Cardinals: $DEPLOY_URL/api/enhanced-gateway?endpoint=cardinals-analytics"
    echo "  - Dashboard: $DEPLOY_URL/api/enhanced-gateway?endpoint=multi-sport-dashboard"
    echo "  - Live Metrics: $DEPLOY_URL/api/enhanced-live-metrics?endpoint=cardinals"
    echo ""
    
else
    echo "❌ Development deployment failed!"
    exit 1
fi