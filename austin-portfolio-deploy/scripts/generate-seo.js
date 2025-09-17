#!/usr/bin/env node

/**
 * Blaze Intelligence - Dynamic SEO File Generator
 * Generates sitemap.xml and robots.txt based on deployment environment
 */

import { promises as fs } from 'fs';

class SEOGenerator {
    constructor() {
        this.baseUrl = process.env.URL || 
                      process.env.DEPLOY_URL || 
                      process.env.NETLIFY_URL ||
                      'https://blaze-intelligence.netlify.app';
        
        this.buildDate = new Date().toISOString().split('T')[0];
        this.siteName = this.getSiteName();
    }

    getSiteName() {
        if (this.baseUrl.includes('blaze-3d')) return '3D Sports Intelligence';
        if (this.baseUrl.includes('blaze-intelligence-main')) return 'Austin Humphrey Authority';
        return 'Blaze Intelligence Platform';
    }

    async generate() {
        console.log('🔍 SEO Generator Starting...');
        console.log(`📍 Base URL: ${this.baseUrl}`);
        console.log(`🏷️  Site Name: ${this.siteName}`);
        console.log(`📅 Build Date: ${this.buildDate}`);
        
        try {
            await this.generateSitemap();
            await this.generateRobots();
            await this.generateMetaTags();
            
            console.log('✅ SEO files generated successfully');
            
        } catch (error) {
            console.error('❌ SEO generation failed:', error);
            process.exit(1);
        }
    }

    async generateSitemap() {
        console.log('🗺️  Generating sitemap.xml...');
        
        const pages = [
            { path: '', priority: '1.0' },
            { path: 'app', priority: '0.9' },
            { path: 'sports-intelligence', priority: '0.8' },
            { path: 'pressure-dashboard', priority: '0.8' },
            { path: 'analytics', priority: '0.7' },
            { path: 'athlete-dashboard', priority: '0.7' },
            { path: 'manifesto', priority: '0.6' },
            { path: 'proof', priority: '0.6' },
            { path: 'neural-coach', priority: '0.5' },
            { path: 'digital-combine', priority: '0.5' },
            { path: 'nil', priority: '0.5' },
            { path: 'live-demo', priority: '0.4' },
            { path: 'enterprise-services', priority: '0.4' }
        ];

        const sitemap = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">
${pages.map(page => `  <url>
    <loc>${this.baseUrl}/${page.path}</loc>
    <lastmod>${this.buildDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\\n')}
</urlset>`;

        await fs.writeFile('sitemap.xml', sitemap);
        console.log('  ✓ sitemap.xml generated');
    }

    async generateRobots() {
        console.log('🤖 Generating robots.txt...');
        
        const robots = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl-delay for bots
Crawl-delay: 1

# Disallow admin paths (if any)
Disallow: /admin/
Disallow: /.netlify/
Disallow: /functions/`;

        await fs.writeFile('robots.txt', robots);
        console.log('  ✓ robots.txt generated');
    }

    async generateMetaTags() {
        console.log('🏷️  Generating meta tags...');
        
        const metaTags = {
            title: this.siteName,
            description: this.getDescription(),
            url: this.baseUrl,
            image: `${this.baseUrl}/assets/images/og-image.png`,
            type: 'website'
        };

        const metaHtml = `<!-- Generated Meta Tags for ${this.siteName} -->
<meta property=\"og:title\" content=\"${metaTags.title}\">
<meta property=\"og:description\" content=\"${metaTags.description}\">
<meta property=\"og:url\" content=\"${metaTags.url}\">
<meta property=\"og:image\" content=\"${metaTags.image}\">
<meta property=\"og:type\" content=\"${metaTags.type}\">
<meta name=\"twitter:card\" content=\"summary_large_image\">
<meta name=\"twitter:title\" content=\"${metaTags.title}\">
<meta name=\"twitter:description\" content=\"${metaTags.description}\">
<meta name=\"twitter:image\" content=\"${metaTags.image}\">
<link rel=\"canonical\" href=\"${metaTags.url}\">`;

        await fs.writeFile('meta-tags.html', metaHtml);
        console.log('  ✓ meta-tags.html generated');
    }

    getDescription() {
        if (this.baseUrl.includes('blaze-3d')) {
            return 'Advanced 3D sports intelligence platform with real-time analytics and pressure monitoring for championship-level insights.';
        }
        if (this.baseUrl.includes('blaze-intelligence-main')) {
            return 'Austin Humphrey - Former Texas Longhorn #20, sports authority delivering professional-grade analytics and deep south expertise.';
        }
        return 'Blaze Intelligence - Southern Sports Authority platform combining real-time analytics, pressure monitoring, and championship insights.';
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new SEOGenerator();
    generator.generate().catch(console.error);
}

export default SEOGenerator;