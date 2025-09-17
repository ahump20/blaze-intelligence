/**
 * Blaze Intelligence Championship Platform Proxy
 * Handles CORS issues for embedded Replit applications
 */

export const handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'text/html; charset=utf-8'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { target } = event.queryStringParameters || {};

        if (!target) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing target parameter',
                    usage: '/proxy?target=https://example.com'
                })
            };
        }

        // Allowlist of permitted domains for security
        const allowedDomains = [
            'blaze-intelligence.replit.app',
            'blaze-intelligence-replit.netlify.app',
            '.replit.dev',
            '.replit.app',
            '.repl.run',
            '.spock.prod.repl.run'
        ];

        const targetUrl = new URL(target);
        const isAllowed = allowedDomains.some(domain =>
            domain.startsWith('.') ?
                targetUrl.hostname.endsWith(domain) :
                targetUrl.hostname === domain
        );

        if (!isAllowed) {
            console.error(`🚨 Blocked proxy request to unauthorized domain: ${targetUrl.hostname}`);
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    error: 'Domain not allowed',
                    allowed_domains: allowedDomains
                })
            };
        }

        console.log(`🔄 Proxying request to: ${target}`);

        // Fetch the target URL
        const response = await fetch(target, {
            method: event.httpMethod,
            headers: {
                'User-Agent': 'Blaze-Intelligence-Proxy/1.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            // Include body for POST/PUT requests
            ...(event.body && ['POST', 'PUT', 'PATCH'].includes(event.httpMethod) && {
                body: event.body
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || 'text/html';
        let responseBody = await response.text();

        // If it's HTML, inject CORS and frame-friendly modifications
        if (contentType.includes('text/html')) {
            responseBody = injectFrameEnhancements(responseBody, target);
        }

        // Forward relevant headers
        const responseHeaders = { ...headers };

        // Preserve important headers from the original response
        ['content-type', 'cache-control', 'expires', 'last-modified', 'etag'].forEach(header => {
            const value = response.headers.get(header);
            if (value) {
                responseHeaders[header] = value;
            }
        });

        return {
            statusCode: response.status,
            headers: responseHeaders,
            body: responseBody
        };

    } catch (error) {
        console.error('🚨 Proxy error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Proxy request failed',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};

/**
 * Inject frame-friendly enhancements into HTML content
 */
function injectFrameEnhancements(html, originalUrl) {
    // Remove X-Frame-Options headers that might block embedding
    html = html.replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '');

    // Add frame-friendly meta tags
    const frameMetaTags = `
        <meta name="blaze-intelligence-frame" content="true">
        <meta http-equiv="Content-Security-Policy" content="frame-ancestors *">
        <style>
            /* Frame-friendly styles */
            body { margin: 0; padding: 0; }
            .frame-notification {
                background: #BF5700;
                color: white;
                padding: 0.5rem;
                text-align: center;
                font-size: 0.875rem;
                border-bottom: 1px solid rgba(255,255,255,0.2);
            }
        </style>
    `;

    // Inject meta tags before closing head tag
    html = html.replace('</head>', `${frameMetaTags}</head>`);

    // Add frame notification
    const frameNotification = `
        <div class="frame-notification">
            🏆 Running in Blaze Intelligence Championship Frame
            <a href="${originalUrl}" target="_blank" style="color: #FFD700; margin-left: 1rem;">Open Full Screen →</a>
        </div>
    `;

    // Inject notification after body tag
    html = html.replace('<body>', `<body>${frameNotification}`);

    // Add postMessage communication for frame events
    const frameScript = `
        <script>
        (function() {
            // Notify parent frame when loaded
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'blaze-intelligence',
                    action: 'loaded',
                    url: '${originalUrl}',
                    timestamp: Date.now()
                }, '*');
            }

            // Handle errors
            window.addEventListener('error', function(e) {
                if (window.parent !== window) {
                    window.parent.postMessage({
                        type: 'blaze-intelligence',
                        action: 'error',
                        error: e.message,
                        url: '${originalUrl}'
                    }, '*');
                }
            });

            // Add championship styling
            const championshipStyles = document.createElement('style');
            championshipStyles.textContent = \`
                .blaze-enhanced { border-left: 3px solid #BF5700; }
                .championship-badge {
                    background: linear-gradient(135deg, #BF5700, #FFD700);
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    margin-left: 0.5rem;
                }
            \`;
            document.head.appendChild(championshipStyles);

            console.log('🏆 Blaze Intelligence Frame Enhancement Active');
        })();
        </script>
    `;

    // Inject script before closing body tag
    html = html.replace('</body>', `${frameScript}</body>`);

    return html;
}