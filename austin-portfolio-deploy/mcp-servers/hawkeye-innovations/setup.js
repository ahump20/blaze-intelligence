#!/usr/bin/env node

/**
 * Hawk-Eye Innovations MCP Server Setup Script
 * Validates environment and provides configuration guidance
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🎯 Hawk-Eye Innovations MCP Server Setup');
console.log('=' .repeat(50));

// Check dependencies
console.log('\n1. Checking Dependencies...');
const packagePath = join(__dirname, 'package.json');
if (existsSync(packagePath)) {
    const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
    console.log(`✅ Package: ${pkg.name} v${pkg.version}`);

    // Check if dependencies are installed
    const nodeModulesPath = join(__dirname, 'node_modules');
    if (existsSync(nodeModulesPath)) {
        console.log('✅ Dependencies installed');
    } else {
        console.log('❌ Dependencies not installed. Run: npm install');
        process.exit(1);
    }
} else {
    console.log('❌ package.json not found');
    process.exit(1);
}

// Check environment configuration
console.log('\n2. Checking Environment Configuration...');
const envPath = join(__dirname, '.env');
const envExamplePath = join(__dirname, '.env.example');

if (existsSync(envPath)) {
    console.log('✅ .env file exists');
    const envContent = readFileSync(envPath, 'utf8');

    // Check for key environment variables
    const hasHsApi = envContent.includes('HS_BASE_URL') && envContent.includes('HS_API_KEY');
    const hasBaseballApi = envContent.includes('BASEBALL_BASE_URL') && envContent.includes('BASEBALL_API_KEY');

    if (hasHsApi) {
        console.log('✅ Texas HS Football API configured');
    } else {
        console.log('⚠️  Texas HS Football API not configured (will use demo data)');
    }

    if (hasBaseballApi) {
        console.log('✅ SEC/TX Baseball API configured');
    } else {
        console.log('⚠️  SEC/TX Baseball API not configured (will use demo data)');
    }
} else {
    console.log('⚠️  .env file not found');
    if (existsSync(envExamplePath)) {
        console.log('💡 Copy .env.example to .env and configure your API keys');
    }
}

// Check MCP tools
console.log('\n3. Available MCP Tools:');
const tools = [
    'trackBall - Multi-camera ball triangulation',
    'predictTrajectory - Physics-based trajectory prediction',
    'analyzeStrikeZone - MLB strike zone classification (zones 1-14)',
    'txHsFootballSchedule - Texas high school football schedules',
    'secTxBaseballSchedule - SEC/TX college baseball schedules'
];

tools.forEach(tool => console.log(`✅ ${tool}`));

// Test server startup
console.log('\n4. Testing Server Startup...');
try {
    // Import the main server file to check for syntax errors
    await import('./index.js');
    console.log('✅ Server syntax valid');
} catch (error) {
    console.log(`❌ Server startup error: ${error.message}`);
    process.exit(1);
}

console.log('\n🎯 Setup Complete!');
console.log('\nNext Steps:');
console.log('1. Configure API keys in .env file (optional, uses demo data otherwise)');
console.log('2. Restart Claude Desktop to load the new MCP server');
console.log('3. Test the tools in Claude Desktop');
console.log('\nDemo Usage:');
console.log('- "Track a baseball from multiple camera angles"');
console.log('- "Predict the trajectory of a ball hit at 95 mph at 30 degrees"');
console.log('- "Analyze where a pitch crosses the strike zone"');
console.log('- "Get the Texas high school football schedule for Champion High"');
console.log('- "Show SEC baseball schedule for Texas Longhorns"');

console.log('\n🏆 Hawk-Eye Innovations MCP Server is ready for championship-level sports analytics!');