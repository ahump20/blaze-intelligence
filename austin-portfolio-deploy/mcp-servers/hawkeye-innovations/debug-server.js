#!/usr/bin/env node

/**
 * Debug script to inspect the MCP Server API
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';

console.log('🔍 Inspecting MCP Server API');
console.log('=' .repeat(50));

const server = new Server({
    name: 'debug-server',
    version: '1.0.0'
}, {
    capabilities: {
        tools: {}
    }
});

console.log('\n📋 Available methods on Server:');
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(server))
    .filter(name => typeof server[name] === 'function')
    .sort();

methods.forEach(method => {
    console.log(`   • ${method}`);
});

console.log('\n🔧 Server prototype chain:');
let proto = Object.getPrototypeOf(server);
let level = 0;
while (proto && level < 5) {
    const constructorName = proto.constructor?.name || 'Object';
    const methods = Object.getOwnPropertyNames(proto)
        .filter(name => typeof proto[name] === 'function' && !name.startsWith('__'))
        .filter(name => name !== 'constructor');

    console.log(`Level ${level}: ${constructorName}`);
    if (methods.length > 0) {
        console.log(`  Methods: ${methods.join(', ')}`);
    }

    proto = Object.getPrototypeOf(proto);
    level++;
}

console.log('\n✅ Debug complete!');