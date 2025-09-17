#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🏗️  Building Blaze Intelligence for production...');

// Create production directories
const dirs = ['dist', 'docs', 'dist/src', 'dist/public'];
dirs.forEach(dir => {
  const fullPath = path.join(projectRoot, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Copy essential files for Vercel deployment
const filesToCopy = [
  { src: 'server.js', dest: 'dist/server.js' },
  { src: 'package.json', dest: 'dist/package.json' },
  { src: 'vercel.json', dest: 'dist/vercel.json' },
  { src: '.env.example', dest: 'dist/.env.example', optional: true }
];

filesToCopy.forEach(({ src, dest, optional }) => {
  const srcPath = path.join(projectRoot, src);
  const destPath = path.join(projectRoot, dest);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied: ${src} → ${dest}`);
  } else if (!optional) {
    console.warn(`⚠️  File not found: ${src}`);
  }
});

// Copy directories
const dirsToCopy = [
  { src: 'src', dest: 'dist/src' },
  { src: 'public', dest: 'dist/public' },
  { src: 'server', dest: 'dist/server' },
  { src: 'lib', dest: 'dist/lib' },
  { src: 'uploads', dest: 'dist/uploads' }
];

dirsToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(projectRoot, src);
  const destPath = path.join(projectRoot, dest);
  
  if (fs.existsSync(srcPath)) {
    copyDirRecursive(srcPath, destPath);
    console.log(`✅ Copied directory: ${src} → ${dest}`);
  } else {
    console.warn(`⚠️  Directory not found: ${src}`);
  }
});

// Copy public files to docs for GitHub Pages
const publicPath = path.join(projectRoot, 'public');
const docsPath = path.join(projectRoot, 'docs');

if (fs.existsSync(publicPath)) {
  copyDirRecursive(publicPath, docsPath);
  console.log('✅ Copied public files to docs for GitHub Pages');
  
  // Create GitHub Pages specific files
  createGitHubPagesConfig(docsPath);
} else {
  console.warn('⚠️  Public directory not found for GitHub Pages');
}

// Update package.json for production
updatePackageJsonForProduction();

console.log('🎉 Production build completed successfully!');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function createGitHubPagesConfig(docsPath) {
  // Create _config.yml for Jekyll
  const configContent = `# Blaze Intelligence GitHub Pages Configuration
plugins: []
include: ['_*']
exclude: ['node_modules', 'package*.json', 'server.js']

# Site settings
title: "Blaze Intelligence"
description: "Championship-Level Sports Analytics Platform"
url: "https://blaze-intelligence.github.io"
baseurl: ""

# Build settings
markdown: kramdown
highlighter: rouge
`;

  fs.writeFileSync(path.join(docsPath, '_config.yml'), configContent);
  
  // Create CNAME for custom domain
  fs.writeFileSync(path.join(docsPath, 'CNAME'), 'blaze-intelligence.com');
  
  // Create .nojekyll to prevent Jekyll processing if needed
  fs.writeFileSync(path.join(docsPath, '.nojekyll'), '');
  
  console.log('✅ Created GitHub Pages configuration files');
}

function updatePackageJsonForProduction() {
  const packagePath = path.join(projectRoot, 'dist', 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Update for production deployment
    packageJson.engines = {
      "node": ">=18.0.0",
      "npm": ">=8.0.0"
    };
    
    // Add production dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "@vercel/node": "^3.0.0"
    };
    
    // Remove dev-only scripts
    const prodScripts = {
      "start": "node server.js",
      "build": "echo 'Build completed'",
      "deploy": "vercel --prod"
    };
    
    packageJson.scripts = prodScripts;
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json for production');
  }
}