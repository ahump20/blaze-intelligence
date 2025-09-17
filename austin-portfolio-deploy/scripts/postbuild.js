#!/usr/bin/env node

/**
 * Blaze Intelligence Post-Build Script
 * Ensures stable asset URLs, optimizes output, and prepares for deployment
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const distPath = path.join(projectRoot, 'dist');

// Asset manifest for stable URLs
const assetManifest = {};

/**
 * Generate hash for file content
 */
function generateHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

/**
 * Process and optimize HTML files
 */
function processHTMLFiles() {
  console.log('📄 Processing HTML files...');

  const htmlFiles = fs.readdirSync(distPath).filter(file => file.endsWith('.html'));

  htmlFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add PWA tags if missing
    if (!content.includes('manifest.json')) {
      content = content.replace('</head>', `
    <!-- PWA Support -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#BF5700">
    <link rel="apple-touch-icon" href="/images/brand/blaze-tagline.png">

    <!-- Service Worker Registration -->
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw-pwa.js')
          .then(reg => console.log('Service Worker registered'))
          .catch(err => console.error('Service Worker registration failed:', err));
      }
    </script>
  </head>`);
    }

    // Remove Babel references
    content = content.replace(/<script[^>]*babel[^>]*><\/script>\n?/gi, '');

    // Update asset URLs with manifest
    Object.keys(assetManifest).forEach(original => {
      const hashed = assetManifest[original];
      content = content.replace(new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), hashed);
    });

    // Optimize inline scripts
    content = content.replace(/<script type="text\/babel">/g, '<script>');

    // Add preload hints for critical resources
    const preloads = [
      '<link rel="preload" href="/css/blaze-professional.css" as="style">',
      '<link rel="preload" href="/js/navigation-manager.js" as="script">',
      '<link rel="preload" href="/images/brand/blaze-hero.png" as="image">',
      '<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">',
      '<link rel="dns-prefetch" href="https://api.sportsdataio.com">'
    ];

    if (!content.includes('rel="preload"')) {
      content = content.replace('</head>', `${preloads.join('\n    ')}\n  </head>`);
    }

    fs.writeFileSync(filePath, content);
  });

  console.log(`✅ Processed ${htmlFiles.length} HTML files`);
}

/**
 * Copy static assets to dist
 */
function copyStaticAssets() {
  console.log('📦 Copying static assets...');

  const assetDirs = ['css', 'js', 'images', 'api', 'icons', 'netlify'];

  assetDirs.forEach(dir => {
    const srcPath = path.join(projectRoot, dir);
    const destPath = path.join(distPath, dir);

    if (fs.existsSync(srcPath)) {
      copyRecursiveSync(srcPath, destPath);
      console.log(`  ✓ Copied ${dir}/`);
    }
  });

  // Copy root files
  const rootFiles = ['manifest.json', 'sw-pwa.js', 'robots.txt', '_redirects'];
  rootFiles.forEach(file => {
    const srcFile = path.join(projectRoot, file);
    const destFile = path.join(distPath, file);

    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`  ✓ Copied ${file}`);
    }
  });
}

/**
 * Recursive copy function
 */
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (!exists) return;

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

/**
 * Generate asset manifest for cache busting
 */
function generateAssetManifest() {
  console.log('🔗 Generating asset manifest...');

  const assetsPath = path.join(distPath, 'assets');

  if (fs.existsSync(assetsPath)) {
    walkDir(assetsPath, (filePath) => {
      const relativePath = path.relative(distPath, filePath);
      const content = fs.readFileSync(filePath);
      const hash = generateHash(content);
      const ext = path.extname(filePath);
      const baseName = path.basename(filePath, ext);
      const hashedName = `${baseName}-${hash}${ext}`;

      assetManifest[`/${relativePath}`] = `/${path.dirname(relativePath)}/${hashedName}`;
    });
  }

  // Write manifest
  fs.writeFileSync(
    path.join(distPath, 'asset-manifest.json'),
    JSON.stringify(assetManifest, null, 2)
  );

  console.log(`✅ Generated manifest with ${Object.keys(assetManifest).length} assets`);
}

/**
 * Walk directory recursively
 */
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

/**
 * Create offline.html if it doesn't exist
 */
function createOfflinePage() {
  const offlinePath = path.join(distPath, 'offline.html');

  if (!fs.existsSync(offlinePath)) {
    console.log('📱 Creating offline page...');

    const offlineContent = `<!DOCTYPE html>
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
            padding: 20px;
        }
        .offline-container {
            text-align: center;
            max-width: 600px;
        }
        h1 {
            color: #BF5700;
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .tagline {
            font-size: 1.5rem;
            color: #9BCBEB;
            margin-bottom: 2rem;
        }
        p {
            font-size: 1.1rem;
            line-height: 1.6;
            opacity: 0.9;
        }
        .retry-button {
            display: inline-block;
            margin-top: 2rem;
            padding: 12px 30px;
            background: linear-gradient(135deg, #BF5700, #FF7A00);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .retry-button:hover {
            transform: scale(1.05);
        }
        .logo {
            width: 200px;
            height: auto;
            margin-bottom: 2rem;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <img src="/images/brand/blaze-tagline.png" alt="Blaze Intelligence" class="logo">
        <h1>You're Offline</h1>
        <p class="tagline">See the game. Shape the outcome.</p>
        <p>
            It looks like you've lost your internet connection.
            Blaze Intelligence needs to connect to our servers to provide real-time sports analytics.
        </p>
        <p>
            Please check your connection and try again.
        </p>
        <a href="/" class="retry-button" onclick="window.location.reload()">Try Again</a>
    </div>
</body>
</html>`;

    fs.writeFileSync(offlinePath, offlineContent);
    console.log('✅ Created offline.html');
  }
}

/**
 * Generate build report
 */
function generateBuildReport() {
  console.log('\n📊 Build Report');
  console.log('================');

  const stats = {
    htmlFiles: 0,
    cssFiles: 0,
    jsFiles: 0,
    imageFiles: 0,
    totalSize: 0
  };

  walkDir(distPath, (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const size = fs.statSync(filePath).size;
    stats.totalSize += size;

    switch(ext) {
      case '.html': stats.htmlFiles++; break;
      case '.css': stats.cssFiles++; break;
      case '.js': stats.jsFiles++; break;
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.gif':
      case '.svg':
        stats.imageFiles++;
        break;
    }
  });

  console.log(`HTML Files: ${stats.htmlFiles}`);
  console.log(`CSS Files: ${stats.cssFiles}`);
  console.log(`JS Files: ${stats.jsFiles}`);
  console.log(`Image Files: ${stats.imageFiles}`);
  console.log(`Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('================\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Blaze Intelligence Post-Build Process\n');

  // Ensure dist directory exists
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  // Execute build steps
  copyStaticAssets();
  generateAssetManifest();
  processHTMLFiles();
  createOfflinePage();
  generateBuildReport();

  console.log('✨ Post-build process complete!');
  console.log('📦 Output directory:', distPath);
}

// Run the script
main().catch(console.error);