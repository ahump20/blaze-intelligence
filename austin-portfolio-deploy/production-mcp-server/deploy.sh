#!/bin/bash

# Blaze Intelligence MCP Server Production Deployment Script
# Championship Infrastructure - Phase 1

set -e

echo "🏆 BLAZE INTELLIGENCE MCP SERVER DEPLOYMENT"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"

    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed${NC}"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is not installed${NC}"
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        echo -e "${RED}Error: git is not installed${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ All dependencies found${NC}"
}

# Setup project
setup_project() {
    echo -e "${BLUE}Setting up MCP server project...${NC}"

    # Create logs directory
    mkdir -p logs

    # Copy environment template if .env doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Created .env file from template. Please update with your API keys.${NC}"
    fi

    # Install dependencies
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install

    echo -e "${GREEN}✓ Project setup complete${NC}"
}

# Run tests
run_tests() {
    echo -e "${BLUE}Running tests...${NC}"

    # Create test file if it doesn't exist
    if [ ! -f "test/test-endpoints.js" ]; then
        mkdir -p test
        cat > test/test-endpoints.js << 'EOF'
// Basic endpoint tests
const http = require('http');

const testEndpoint = (path, expectedStatus = 200) => {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3002${path}`, (res) => {
            if (res.statusCode === expectedStatus) {
                console.log(`✓ ${path} - ${res.statusCode}`);
                resolve();
            } else {
                console.log(`✗ ${path} - Expected ${expectedStatus}, got ${res.statusCode}`);
                reject(new Error(`Wrong status code for ${path}`));
            }
        });

        req.on('error', (error) => {
            console.log(`✗ ${path} - ${error.message}`);
            reject(error);
        });
    });
};

const runTests = async () => {
    console.log('🏆 Blaze Intelligence MCP Server Tests');
    console.log('=====================================');

    try {
        await testEndpoint('/health');
        await testEndpoint('/');
        console.log('\n✓ All tests passed!');
    } catch (error) {
        console.error('\n✗ Tests failed:', error.message);
        process.exit(1);
    }
};

runTests();
EOF
    fi

    # Start server in background for testing
    echo -e "${BLUE}Starting server for testing...${NC}"
    npm start &
    SERVER_PID=$!

    # Wait for server to start
    sleep 5

    # Run tests
    npm test

    # Kill test server
    kill $SERVER_PID 2>/dev/null || true

    echo -e "${GREEN}✓ Tests completed${NC}"
}

# Deploy to Render.com
deploy_to_render() {
    echo -e "${BLUE}Deploying to Render.com...${NC}"

    # Check if this is a git repository
    if [ ! -d ".git" ]; then
        echo -e "${BLUE}Initializing git repository...${NC}"
        git init
        git add .
        git commit -m "Initial commit: Blaze Intelligence MCP Server"
    fi

    # Add Render.com deploy instructions
    echo -e "${YELLOW}Manual Render.com Deployment Steps:${NC}"
    echo "1. Go to https://render.com and create a new Web Service"
    echo "2. Connect your GitHub repository"
    echo "3. Use the following settings:"
    echo "   - Environment: Node"
    echo "   - Build Command: npm install"
    echo "   - Start Command: npm start"
    echo "   - Health Check Path: /health"
    echo "   - Port: 10000 (Render default)"
    echo "4. Add environment variables from .env.example"
    echo "5. Deploy!"

    echo -e "${GREEN}✓ Deployment configuration ready${NC}"
}

# Update Netlify functions to use new server
update_netlify_proxy() {
    echo -e "${BLUE}Updating Netlify MCP proxy...${NC}"

    # Update the MCP proxy function
    cat > ../netlify/functions/hawkeye-mcp-proxy.js << 'EOF'
// Updated Hawk-Eye MCP Proxy Function for Production
// Points to production MCP server on Render.com

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    const body = JSON.parse(event.body);

    // Production MCP server URL (update after Render deployment)
    const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://blaze-intelligence-mcp.onrender.com';

    const mcpResponse = await fetch(`${MCP_SERVER_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const responseData = await mcpResponse.json();

    return {
      statusCode: mcpResponse.status,
      headers,
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.error('MCP Proxy Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'MCP Proxy Error - Championship Server Temporarily Unavailable',
          data: error.message
        },
        id: null
      })
    };
  }
};
EOF

    echo -e "${GREEN}✓ Netlify proxy updated for production${NC}"
}

# Create monitoring script
create_monitoring() {
    echo -e "${BLUE}Creating monitoring script...${NC}"

    cat > monitor.js << 'EOF'
#!/usr/bin/env node

// Production MCP Server Monitoring Script
const http = require('http');
const https = require('https');

const PRODUCTION_URL = process.env.MCP_SERVER_URL || 'https://blaze-intelligence-mcp.onrender.com';

const checkHealth = () => {
    const url = new URL('/health', PRODUCTION_URL);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                const health = JSON.parse(data);
                console.log(`✓ ${new Date().toISOString()} - Server healthy`);
                console.log(`  Uptime: ${Math.floor(health.uptime / 60)}m`);
                console.log(`  WebSocket clients: ${health.services.websocket}`);
                console.log(`  Championship mode: ${health.championship_mode}`);
            } else {
                console.log(`✗ ${new Date().toISOString()} - Server unhealthy (${res.statusCode})`);
            }
        });
    });

    req.on('error', (error) => {
        console.log(`✗ ${new Date().toISOString()} - Connection failed: ${error.message}`);
    });

    req.setTimeout(5000, () => {
        console.log(`✗ ${new Date().toISOString()} - Health check timeout`);
        req.destroy();
    });
};

console.log('🏆 Blaze Intelligence MCP Server Monitor');
console.log(`Monitoring: ${PRODUCTION_URL}`);
console.log('=========================================');

// Check immediately and then every 30 seconds
checkHealth();
setInterval(checkHealth, 30000);
EOF

    chmod +x monitor.js

    echo -e "${GREEN}✓ Monitoring script created${NC}"
}

# Main deployment process
main() {
    echo -e "${GREEN}🏆 CHAMPIONSHIP INFRASTRUCTURE DEPLOYMENT${NC}"
    echo -e "${GREEN}Phase 1: Production MCP Server Setup${NC}"
    echo ""

    check_dependencies
    setup_project
    run_tests
    update_netlify_proxy
    create_monitoring
    deploy_to_render

    echo ""
    echo -e "${GREEN}🏆 MCP SERVER DEPLOYMENT COMPLETE!${NC}"
    echo -e "${GREEN}=================================${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Deploy to Render.com using the instructions above"
    echo "2. Update MCP_SERVER_URL environment variable with your Render URL"
    echo "3. Deploy updated Netlify functions"
    echo "4. Run monitoring script: node monitor.js"
    echo "5. Test MCP endpoints with Claude Desktop"
    echo ""
    echo -e "${BLUE}Production URL will be: https://blaze-intelligence-mcp.onrender.com${NC}"
    echo -e "${BLUE}Health endpoint: https://blaze-intelligence-mcp.onrender.com/health${NC}"
    echo ""
    echo -e "${GREEN}Championship mode activated! 🏆${NC}"
}

# Run main function
main "$@"