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