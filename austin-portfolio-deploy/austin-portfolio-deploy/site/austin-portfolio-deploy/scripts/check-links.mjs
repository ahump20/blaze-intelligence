#!/usr/bin/env node
import https from 'https';
import http from 'http';
import { URL } from 'url';

const SITE_BASE = process.env.SITE_BASE || 'https://blaze-intelligence.netlify.app';

const links = [
  // Core site structure
  '/',
  '/site/index.html',
  '/site/quantum-platform.html',
  '/site/nil-calculator.html', 
  '/site/orioles-executive-intelligence.html',
  '/site/live-demo.html',
  '/site/status.html',
  '/site/get-started.html',
  
  // Assets
  '/site/assets/brand.css',
  '/site/assets/hero.js',
  
  // Original dashboard structure
  '/dashboard.html',
  '/status.html',
  '/api/health',
  '/api/status',
  
  // Key pages
  '/nil-calculator.html',
  '/live-demo.html',
  '/get-started.html'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const fullUrl = url.startsWith('http') ? url : `${SITE_BASE}${url}`;
    const urlObj = new URL(fullUrl);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(fullUrl, { method: 'HEAD', timeout: 10000 }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 400
      });
    });
    
    req.on('error', () => {
      resolve({ url, status: 0, ok: false, error: 'Connection failed' });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, status: 0, ok: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

console.log(`🔍 Checking ${links.length} links against ${SITE_BASE}`);

const results = await Promise.all(links.map(checkUrl));
const failed = results.filter(r => !r.ok);

console.log(`\n📊 Results: ${results.filter(r => r.ok).length} working, ${failed.length} broken\n`);

if (failed.length > 0) {
  console.log('❌ Failed links:');
  failed.forEach(r => console.log(`  ${r.status} ${r.url} ${r.error || ''}`));
  process.exit(1);
} else {
  console.log('✅ All championship-level links operational!');
  process.exit(0);
}
