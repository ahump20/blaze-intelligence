#!/usr/bin/env node

/**
 * Blaze Intelligence Build Script
 * Simple build process that copies and optimizes files without complex bundling
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist');

// Clean dist directory
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true });
}
fs.mkdirSync(distPath, { recursive: true });

// Copy all HTML files
console.log('📄 Copying HTML files...');
const htmlFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
htmlFiles.forEach(file => {
  let content = fs.readFileSync(path.join(__dirname, file), 'utf8');

  // Remove Babel references
  content = content.replace(/<script[^>]*babel[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<script[^>]*@babel\/standalone[^>]*>[\s\S]*?<\/script>/gi, '');

  // Add PWA support if missing
  if (!content.includes('manifest.json') && content.includes('</head>')) {
    content = content.replace('</head>', `
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#BF5700">
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw-pwa.js');
      }
    </script>
  </head>`);
  }

  fs.writeFileSync(path.join(distPath, file), content);
});
console.log(`✓ Copied ${htmlFiles.length} HTML files`);

// Copy directories
const directories = ['css', 'js', 'images', 'api', 'icons', 'netlify', 'public'];
directories.forEach(dir => {
  const srcPath = path.join(__dirname, dir);
  const destPath = path.join(distPath, dir);

  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
    console.log(`✓ Copied ${dir}/`);
  }
});

// Copy root files
const rootFiles = ['manifest.json', 'sw-pwa.js', 'robots.txt', '_redirects'];
rootFiles.forEach(file => {
  const srcFile = path.join(__dirname, file);
  const destFile = path.join(distPath, file);

  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`✓ Copied ${file}`);
  }
});

// Create offline.html
const offlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blaze Intelligence - Offline</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%);
            color: #E5E7EB;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            text-align: center;
        }
        h1 { color: #BF5700; }
        .tagline { color: #9BCBEB; font-size: 1.5rem; }
    </style>
</head>
<body>
    <div>
        <img src="/images/brand/blaze-tagline.png" alt="Blaze Intelligence" style="max-width: 300px;">
        <h1>You're Offline</h1>
        <p class="tagline">See the game. Shape the outcome.</p>
        <p>Please check your connection and try again.</p>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(distPath, 'offline.html'), offlineHtml);
console.log('✓ Created offline.html');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(item => {
      copyRecursive(path.join(src, item), path.join(dest, item));
    });
  } else if (stat.isFile()) {
    // Ensure destination directory exists
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

console.log('\n✨ Build complete! Output in:', distPath);