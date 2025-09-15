#!/usr/bin/env node

/**
 * Test script for Hawk-Eye Innovations MCP tools
 * Tests each tool with sample data to validate functionality
 */

import server from './index.js';

console.log('🎯 Testing Hawk-Eye Innovations MCP Tools');
console.log('=' .repeat(50));

// Test data for each tool
const testCases = [
    {
        name: 'trackBall',
        args: {
            cameras: [
                {
                    intrinsics: [1000, 1000, 320, 240],
                    extrinsics: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]
                },
                {
                    intrinsics: [1000, 1000, 320, 240],
                    extrinsics: [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0]
                }
            ],
            measurements: [
                [320, 240], [330, 250]
            ]
        }
    },
    {
        name: 'predictTrajectory',
        args: {
            position: { x: 0, y: 1.2, z: 18.4 },
            velocity: { vx: 35.0, vy: -12.0, vz: 25.0 },
            spin: 2400
        }
    },
    {
        name: 'analyzeStrikeZone',
        args: {
            plateX: 0.05,
            plateY: 0.3,
            plateZ: 0.42
        }
    },
    {
        name: 'txHsFootballSchedule',
        args: {
            school: 'Champion High School',
            date: '2025-09-20'
        }
    },
    {
        name: 'secTxBaseballSchedule',
        args: {
            team: 'TEXAS',
            season: '2025'
        }
    }
];

async function testTools() {
    console.log('\n📋 Running Tool Tests...\n');

    for (const testCase of testCases) {
        try {
            console.log(`🔧 Testing ${testCase.name}...`);

            // Simulate the MCP tools/call request
            const mockRequest = {
                params: {
                    name: testCase.name,
                    arguments: testCase.args
                }
            };

            // Get the tools/call handler from the server
            const handler = server._requestHandlers?.['tools/call'];
            if (!handler) {
                console.log(`❌ No handler found for tools/call`);
                continue;
            }

            const result = await handler(mockRequest);

            if (result && result.content && result.content[0] && result.content[0].text) {
                console.log('✅ Success! Output preview:');
                const output = result.content[0].text;
                const lines = output.split('\n');
                console.log(lines.slice(0, 3).join('\n') + '...\n');
            } else {
                console.log('❌ Invalid response format\n');
            }

        } catch (error) {
            console.log(`❌ Error testing ${testCase.name}: ${error.message}\n`);
        }
    }
}

// Test tools list functionality
async function testToolsList() {
    console.log('📝 Testing Tools List...');

    try {
        const listHandler = server._requestHandlers?.['tools/list'];
        if (!listHandler) {
            console.log('❌ No handler found for tools/list');
            return;
        }

        const result = await listHandler();
        if (result && result.tools && Array.isArray(result.tools)) {
            console.log(`✅ Tools list contains ${result.tools.length} tools:`);
            result.tools.forEach(tool => {
                console.log(`   • ${tool.name}: ${tool.description}`);
            });
            console.log('');
        } else {
            console.log('❌ Invalid tools list response\n');
        }
    } catch (error) {
        console.log(`❌ Error testing tools list: ${error.message}\n`);
    }
}

// Run all tests
await testToolsList();
await testTools();

console.log('🏆 All tests completed!');
console.log('\n💡 Next Steps:');
console.log('1. Restart Claude Desktop to load the new MCP server');
console.log('2. Test the tools in Claude Desktop chat');
console.log('3. Configure environment variables for live data (optional)');