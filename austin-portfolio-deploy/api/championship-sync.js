/**
 * Championship Platform Sync API
 * Serverless function to sync content from all championship platforms
 * Based on unified-blaze-upgrade/scripts/sync.mjs
 */

const https = require('https');

// Championship Platform Configuration
const CHAMPIONSHIP_PLATFORMS = [
    {
        slug: "main-platform",
        url: "https://blaze-intelligence.netlify.app",
        title: "Main Blaze Intelligence Platform",
        description: "Championship-level sports intelligence with AI consciousness and AR coaching",
        priority: 1
    },
    {
        slug: "unified-championship",
        url: "https://blaze-intelligence.netlify.app/blaze-unified-championship.html",
        title: "Unified Championship Platform",
        description: "All Replit features merged with neural visualization and real-time analytics",
        priority: 2
    },
    {
        slug: "ar-coaching",
        url: "https://blaze-intelligence.netlify.app/blaze-ar-coaching-enhanced.html",
        title: "AR Coaching Platform",
        description: "MediaPipe-powered biomechanical analysis with championship character assessment",
        priority: 3
    },
    {
        slug: "replit-main",
        url: "https://35179f3c-00f3-409f-95da-bed1c6ba912c-00-3tftlc85yrdac.spock.replit.dev:8000",
        title: "Replit Development Platform",
        description: "Live development environment for Blaze Intelligence features",
        priority: 4
    },
    {
        slug: "replit-netlify",
        url: "https://blaze-intelligence-replit.netlify.app",
        title: "Replit Netlify Deployment",
        description: "Replit platform deployed on Netlify infrastructure",
        priority: 5
    },
    {
        slug: "nil-calculator",
        url: "https://blaze-intelligence.netlify.app/nil-calculator.html",
        title: "NIL Valuation Calculator",
        description: "Championship-level Name, Image, Likeness calculator for college athletes",
        priority: 6
    }
];

// Fetch page content with timeout
function fetchPage(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const request = https.get(url, { timeout }, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const responseTime = Date.now() - startTime;

                if (res.statusCode >= 200 && res.statusCode < 400) {
                    resolve({
                        html: data,
                        statusCode: res.statusCode,
                        responseTime: responseTime
                    });
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });

        }).on('error', reject).on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Extract metadata and features from HTML
function extractChampionshipFeatures(html, url) {
    try {
        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        let title = titleMatch ? titleMatch[1].trim() : 'Untitled Page';

        // Extract description
        const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) ||
                         html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
        let description = descMatch ? descMatch[1].trim() : '';

        if (!description) {
            // Try to get first paragraph
            const pMatch = html.match(/<p[^>]*>([^<]+)<\/p>/i);
            if (pMatch) {
                description = pMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 160);
            }
        }

        // Championship feature detection
        const features = [];
        if (html.includes('three.js') || html.includes('THREE.')) features.push('Three.js');
        if (html.includes('neural') || html.includes('consciousness')) features.push('Neural AI');
        if (html.includes('MediaPipe') || html.includes('holistic')) features.push('AR Coaching');
        if (html.includes('analytics') || html.includes('intelligence')) features.push('Analytics');
        if (html.includes('nil') || html.includes('NIL')) features.push('NIL');
        if (html.includes('championship') || html.includes('Championship')) features.push('Championship');
        if (html.includes('replit') || html.includes('Replit')) features.push('Replit');
        if (html.includes('blazer') || html.includes('blaze')) features.push('Blaze Intelligence');

        // Performance indicators
        const hasModernJS = html.includes('import ') || html.includes('export ');
        const hasAsyncCode = html.includes('async ') || html.includes('await ');
        const hasWebGL = html.includes('webgl') || html.includes('WebGL');
        const hasWebSocket = html.includes('WebSocket') || html.includes('ws:');

        if (hasModernJS) features.push('Modern JS');
        if (hasAsyncCode) features.push('Async/Await');
        if (hasWebGL) features.push('WebGL');
        if (hasWebSocket) features.push('Real-time');

        return {
            title: title.length > 5 ? title : 'Championship Platform',
            description: description.length > 10 ? description : 'Blaze Intelligence championship platform',
            features: features,
            hasChampionshipFeatures: features.length > 0,
            modernFeatures: {
                hasModernJS,
                hasAsyncCode,
                hasWebGL,
                hasWebSocket
            }
        };

    } catch (error) {
        console.error(`Error extracting metadata from ${url}:`, error.message);
        return {
            title: 'Error Loading Page',
            description: 'Could not extract page metadata',
            features: [],
            hasChampionshipFeatures: false,
            modernFeatures: {}
        };
    }
}

// Sync single platform
async function syncPlatform(platform) {
    const syncStart = Date.now();

    try {
        const response = await fetchPage(platform.url);
        const metadata = extractChampionshipFeatures(response.html, platform.url);

        const result = {
            ...platform,
            status: 'active',
            lastSync: new Date().toISOString(),
            responseTime: response.responseTime,
            syncDuration: Date.now() - syncStart,
            metadata: {
                title: metadata.title.includes('Blaze') ? metadata.title : platform.title,
                description: metadata.description.length > 10 ? metadata.description : platform.description,
                features: metadata.features,
                hasChampionshipFeatures: metadata.hasChampionshipFeatures,
                modernFeatures: metadata.modernFeatures
            },
            health: {
                status: response.statusCode,
                responseTime: response.responseTime,
                contentLength: response.html.length,
                timestamp: new Date().toISOString()
            }
        };

        console.log(`✅ Synced ${platform.slug}: ${response.statusCode} (${response.responseTime}ms) - ${metadata.features.length} features`);

        return result;

    } catch (error) {
        console.log(`❌ Failed ${platform.slug}: ${error.message}`);

        return {
            ...platform,
            status: 'error',
            error: error.message,
            lastSync: new Date().toISOString(),
            syncDuration: Date.now() - syncStart,
            metadata: {
                title: platform.title,
                description: platform.description,
                features: [],
                hasChampionshipFeatures: false,
                modernFeatures: {}
            },
            health: {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            }
        };
    }
}

// Main sync function
async function syncAllPlatforms() {
    console.log('🔥 CHAMPIONSHIP PLATFORM SYNC INITIATED');
    console.log(`Syncing ${CHAMPIONSHIP_PLATFORMS.length} platforms...`);

    const syncPromises = CHAMPIONSHIP_PLATFORMS.map(platform => syncPlatform(platform));
    const results = await Promise.all(syncPromises);

    // Generate comprehensive summary
    const successful = results.filter(r => r.status === 'active').length;
    const withFeatures = results.filter(r => r.metadata?.hasChampionshipFeatures).length;
    const avgResponseTime = results
        .filter(r => r.responseTime)
        .reduce((acc, r, _, arr) => acc + r.responseTime / arr.length, 0);

    const summary = {
        timestamp: new Date().toISOString(),
        totalPlatforms: CHAMPIONSHIP_PLATFORMS.length,
        activePlatforms: successful,
        failedPlatforms: CHAMPIONSHIP_PLATFORMS.length - successful,
        platformsWithChampionshipFeatures: withFeatures,
        averageResponseTime: Math.round(avgResponseTime),
        platforms: results,
        performance: {
            successRate: (successful / CHAMPIONSHIP_PLATFORMS.length) * 100,
            championshipFeaturesCoverage: (withFeatures / CHAMPIONSHIP_PLATFORMS.length) * 100,
            overallHealth: successful >= 4 ? 'excellent' : successful >= 3 ? 'good' : 'needs-attention'
        }
    };

    console.log(`🏆 SYNC COMPLETE: ${successful}/${CHAMPIONSHIP_PLATFORMS.length} active, ${withFeatures} with championship features`);

    return summary;
}

// Netlify Function Handler
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        console.log('Championship Sync API called:', {
            method: event.httpMethod,
            path: event.path,
            timestamp: new Date().toISOString()
        });

        if (event.httpMethod === 'GET') {
            // Get latest sync results
            const syncResults = await syncAllPlatforms();

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    sync: syncResults,
                    message: 'Championship platform sync completed successfully'
                })
            };
        }

        if (event.httpMethod === 'POST') {
            const { platform } = JSON.parse(event.body || '{}');

            if (platform) {
                // Sync specific platform
                const targetPlatform = CHAMPIONSHIP_PLATFORMS.find(p => p.slug === platform);
                if (!targetPlatform) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Platform not found',
                            availablePlatforms: CHAMPIONSHIP_PLATFORMS.map(p => p.slug)
                        })
                    };
                }

                const result = await syncPlatform(targetPlatform);

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        platform: result,
                        message: `${platform} sync completed`
                    })
                };
            } else {
                // Full sync
                const syncResults = await syncAllPlatforms();

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        sync: syncResults,
                        message: 'Full championship platform sync completed'
                    })
                };
            }
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Method not allowed',
                allowedMethods: ['GET', 'POST', 'OPTIONS']
            })
        };

    } catch (error) {
        console.error('Championship Sync Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Championship sync failed',
                details: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};