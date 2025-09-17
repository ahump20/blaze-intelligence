#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('⚡ Optimizing Blaze Intelligence assets for production...');

// Optimize CSS files
optimizeCSS();

// Optimize JavaScript files
optimizeJS();

// Optimize HTML files
optimizeHTML();

// Create manifest files
createManifests();

console.log('✨ Asset optimization completed!');

function optimizeCSS() {
  const cssFiles = findFiles(path.join(projectRoot, 'docs'), '.css');
  
  cssFiles.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      
      // Basic CSS minification
      content = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
        .replace(/\s*{\s*/g, '{') // Clean braces
        .replace(/;\s*/g, ';') // Clean semicolons
        .trim();
      
      fs.writeFileSync(file, content);
      console.log(`✅ Optimized CSS: ${path.relative(projectRoot, file)}`);
    } catch (error) {
      console.warn(`⚠️  Failed to optimize CSS: ${file} - ${error.message}`);
    }
  });
}

function optimizeJS() {
  const jsFiles = findFiles(path.join(projectRoot, 'docs'), '.js');
  
  jsFiles.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      
      // Basic JavaScript optimization
      content = content
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/;\s*}/g, '}') // Clean up
        .trim();
      
      fs.writeFileSync(file, content);
      console.log(`✅ Optimized JS: ${path.relative(projectRoot, file)}`);
    } catch (error) {
      console.warn(`⚠️  Failed to optimize JS: ${file} - ${error.message}`);
    }
  });
}

function optimizeHTML() {
  const htmlFiles = findFiles(path.join(projectRoot, 'docs'), '.html');
  
  htmlFiles.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      
      // Add production optimizations
      content = content
        .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/>\s+</g, '><') // Remove whitespace between tags
        .trim();
      
      // Add performance headers
      if (content.includes('<head>')) {
        const performanceHeaders = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://blaze-intelligence.vercel.app">
    <meta name="theme-color" content="#0A192F">`;
        
        content = content.replace('<head>', `<head>${performanceHeaders}`);
      }
      
      fs.writeFileSync(file, content);
      console.log(`✅ Optimized HTML: ${path.relative(projectRoot, file)}`);
    } catch (error) {
      console.warn(`⚠️  Failed to optimize HTML: ${file} - ${error.message}`);
    }
  });
}

function createManifests() {
  const docsPath = path.join(projectRoot, 'docs');
  
  // Create web app manifest
  const manifest = {
    name: "Blaze Intelligence",
    short_name: "Blaze",
    description: "Championship-Level Sports Analytics Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#0A192F",
    theme_color: "#BF5700",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon"
      }
    ]
  };
  
  fs.writeFileSync(
    path.join(docsPath, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  // Create robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://blaze-intelligence.com/sitemap.xml
`;
  
  fs.writeFileSync(path.join(docsPath, 'robots.txt'), robotsTxt);
  
  // Create sitemap.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://blaze-intelligence.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://blaze-intelligence.com/enhanced-platform.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://blaze-intelligence.com/dashboard.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
  
  fs.writeFileSync(path.join(docsPath, 'sitemap.xml'), sitemap);
  
  console.log('✅ Created manifest and SEO files');
}

function findFiles(dir, extension) {
  const files = [];
  
  if (!fs.existsSync(dir)) return files;
  
  function searchDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else if (path.extname(item) === extension) {
        files.push(fullPath);
      }
    });
  }
  
  searchDir(dir);
  return files;
}