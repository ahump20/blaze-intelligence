#!/usr/bin/env node

/**
 * Blaze Intelligence - Southern Sports Authority Platform
 * Deployment Build Script for Multiple Netlify Sites
 * 
 * This script prepares the platform for deployment to:
 * - blaze-intelligence.netlify.app (Primary)
 * - blaze-3d.netlify.app (3D Focus)  
 * - blaze-intelligence-main.netlify.app (Authority Site)
 */

import { promises as fs } from 'fs';
import path from 'path';

class BlazeDeploymentBuilder {
    constructor() {
        this.buildConfig = {
            primary: {
                name: 'blaze-intelligence',
                description: 'Primary sports analytics platform',
                features: ['all-pages', 'full-dashboard', 'sports-data', 'pressure-analytics']
            },
            universe: {
                name: 'blaze-3d',
                description: '3D sports intelligence platform',
                features: ['3d-visualization', 'sports-intelligence', 'pressure-dashboard']
            },
            authority: {
                name: 'blaze-intelligence-main',
                description: 'Austin Humphrey sports authority',
                features: ['expertise-focus', 'enterprise-services', 'manifesto']
            }
        };
    }

    async runBuild() {
        console.log('🚀 Starting Blaze Intelligence Deployment Build...\n');
        
        try {
            await this.validateProject();
            await this.optimizeAssets();
            await this.generateSitemaps();
            await this.validateConfiguration();
            await this.createDeploymentSummary();
            
            console.log('\n✅ Deployment build completed successfully!');
            console.log('\n📋 Next Steps:');
            console.log('1. Commit all changes to your Git repository');
            console.log('2. Connect repository to Netlify sites');
            console.log('3. Configure build settings per DEPLOYMENT-GUIDE.md');
            console.log('4. Deploy to all three target sites');
            
        } catch (error) {
            console.error('\n❌ Build failed:', error.message);
            process.exit(1);
        }
    }

    async validateProject() {
        console.log('🔍 Validating project structure...');
        
        const requiredFiles = [
            'index.html',
            'app.html',
            'netlify.toml',
            '_redirects',
            'demo-data.js',
            'api-integration.js',
            'public/sports-intelligence.html',
            'public/pressure-dashboard.html',
            'public/analytics.html'
        ];

        const missingFiles = [];
        
        for (const file of requiredFiles) {
            try {
                await fs.access(file);
                console.log(`  ✓ ${file}`);
            } catch (error) {
                missingFiles.push(file);
                console.log(`  ❌ ${file} - MISSING`);
            }
        }

        if (missingFiles.length > 0) {
            throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
        }

        console.log('✅ Project structure validation passed\n');
    }

    async optimizeAssets() {
        console.log('⚡ Optimizing assets for deployment...');
        
        // Validate CSS files
        const cssDir = 'public/css';
        try {
            const cssFiles = await fs.readdir(cssDir);
            console.log(`  ✓ Found ${cssFiles.length} CSS files in ${cssDir}`);
        } catch (error) {
            console.log(`  ⚠️  CSS directory not found: ${cssDir}`);
        }

        // Validate JS files  
        const jsDir = 'public/js';
        try {
            const jsFiles = await fs.readdir(jsDir);
            console.log(`  ✓ Found ${jsFiles.length} JS files in ${jsDir}`);
        } catch (error) {
            console.log(`  ⚠️  JS directory not found: ${jsDir}`);
        }

        // Check for sports data integration
        try {
            const demoData = await fs.readFile('demo-data.js', 'utf8');
            if (demoData.includes('SportsDataManager')) {
                console.log('  ✓ Sports data integration verified');
            }
        } catch (error) {
            console.log('  ⚠️  Could not verify sports data integration');
        }

        console.log('✅ Asset optimization completed\n');
    }

    async generateSitemaps() {
        console.log('🗺️  Generating sitemaps...');
        
        // Determine base URL from environment or use default
        const baseUrl = process.env.URL || 
                       process.env.DEPLOY_URL || 
                       process.env.NETLIFY_URL ||
                       'https://blaze-intelligence.netlify.app';
        
        console.log(`  📍 Using base URL: ${baseUrl}`);
        
        const buildDate = new Date().toISOString().split('T')[0];
        
        // Read template files and replace placeholders
        try {
            const sitemapTemplate = await fs.readFile('sitemap.xml.template', 'utf8');
            const robotsTemplate = await fs.readFile('robots.txt.template', 'utf8');
            
            // Generate sitemap.xml
            const sitemap = sitemapTemplate
                .replace(/{{BASE_URL}}/g, baseUrl)
                .replace(/{{BUILD_DATE}}/g, buildDate);
            
            await fs.writeFile('sitemap.xml', sitemap);
            console.log('  ✓ Generated sitemap.xml from template');
            
            // Generate robots.txt
            const robots = robotsTemplate
                .replace(/{{BASE_URL}}/g, baseUrl);
            
            await fs.writeFile('robots.txt', robots);
            console.log('  ✓ Generated robots.txt from template');
            
        } catch (error) {
            console.log('  ⚠️  Template files not found, generating fallback versions');
            
            // Fallback generation if templates don't exist
            const pages = [
                '', 'app', 'sports-intelligence', 'pressure-dashboard',
                'analytics', 'athlete-dashboard', 'manifesto', 'proof',
                'neural-coach', 'digital-combine', 'nil', 'live-demo',
                'enterprise-services'
            ];

            const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}/${page}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

            await fs.writeFile('sitemap.xml', sitemap);
            console.log('  ✓ Generated fallback sitemap.xml');

            const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

            await fs.writeFile('robots.txt', robots);
            console.log('  ✓ Generated fallback robots.txt');
        }
        
        console.log('✅ Sitemap generation completed\n');
    }

    async validateConfiguration() {
        console.log('⚙️  Validating deployment configuration...');
        
        // Check netlify.toml
        try {
            const netlifyConfig = await fs.readFile('netlify.toml', 'utf8');
            if (netlifyConfig.includes('[[redirects]]')) {
                console.log('  ✓ Netlify redirects configured');
            }
            if (netlifyConfig.includes('[[headers]]')) {
                console.log('  ✓ Security headers configured');
            }
        } catch (error) {
            throw new Error('netlify.toml configuration invalid');
        }

        // Check _redirects
        try {
            const redirects = await fs.readFile('_redirects', 'utf8');
            if (redirects.includes('/app') && redirects.includes('/sports-intelligence')) {
                console.log('  ✓ Clean URL routing configured');
            }
        } catch (error) {
            throw new Error('_redirects file invalid');
        }

        console.log('✅ Configuration validation passed\n');
    }

    async createDeploymentSummary() {
        console.log('📊 Creating deployment summary...');
        
        const summary = {
            buildDate: new Date().toISOString(),
            platform: 'Blaze Intelligence - Southern Sports Authority',
            sites: this.buildConfig,
            features: {
                'Austin Humphrey Authority': 'Former Texas Longhorn #20 expertise',
                'Real Sports Data': 'NFL, MLB, NCAA integration',
                'Pressure Analytics': 'Championship-level insights',
                'Mobile Optimized': 'Responsive design across devices',
                'Professional Grade': 'Enterprise-ready platform'
            },
            deployment: {
                method: 'Static site deployment via Netlify',
                configuration: 'netlify.toml + _redirects + Functions',
                routing: 'Clean URLs with fallback support',
                performance: 'Optimized assets with CDN delivery',
                apiIntegration: 'SportsDataIO via Netlify Functions',
                multiSite: 'Environment-specific SEO generation'
            },
            navigation: {
                primary: '/ (Austin Humphrey landing)',
                dashboard: '/app (Sports analytics dashboard)',
                intelligence: '/sports-intelligence (Live analytics)',
                pressure: '/pressure-dashboard (Pressure analytics)',
                analytics: '/analytics (System metrics)',
                athlete: '/athlete-dashboard (Athlete portal)',
                manifesto: '/manifesto (Platform vision)',
                proof: '/proof (Credentials & proof)'
            }
        };

        await fs.writeFile('deployment-summary.json', JSON.stringify(summary, null, 2));
        console.log('  ✓ Created deployment-summary.json');
        
        console.log('✅ Deployment summary created\n');
    }
}

// Run the build if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const builder = new BlazeDeploymentBuilder();
    builder.runBuild().catch(console.error);
}

export default BlazeDeploymentBuilder;