/**
 * Comprehensive Hawk-Eye Integration Test Suite
 * Tests all Netlify deployments and Hawk-Eye MCP server integration
 * @version 1.0.0
 * @author Blaze Intelligence
 */

const fs = require('fs').promises;
const path = require('path');

class HawkEyeIntegrationTester {
    constructor() {
        this.testResults = {
            deployments: [],
            functions: [],
            clients: [],
            configurations: [],
            overall: { passed: 0, failed: 0, warnings: 0 }
        };

        this.sites = [
            {
                name: 'austin-portfolio-deploy',
                path: '/Users/AustinHumphrey/austin-portfolio-deploy',
                type: 'main-site',
                netlifyUrl: 'https://blaze-3d.netlify.app'
            },
            {
                name: 'blaze-rti-deploy',
                path: '/Users/AustinHumphrey/blaze-rti-deploy',
                type: 'rti-platform',
                netlifyUrl: 'https://blaze-intelligence.netlify.app'
            },
            {
                name: 'blaze-intelligence-platform',
                path: '/Users/AustinHumphrey/blaze-intelligence-platform',
                type: 'intelligence-platform',
                netlifyUrl: 'TBD'
            },
            {
                name: 'ar-coach-deploy',
                path: '/Users/AustinHumphrey/ar-coach-deploy/production-terminal-deploy',
                type: 'ar-coach',
                netlifyUrl: 'TBD'
            },
            {
                name: 'blaze-command-center',
                path: '/Users/AustinHumphrey/blaze-command-center',
                type: 'command-center',
                netlifyUrl: 'TBD'
            }
        ];

        this.requiredHawkEyeFiles = [
            'netlify.toml',
            'netlify/functions/hawkeye-track.js',
            'netlify/functions/hawkeye-predict.js',
            'netlify/functions/hawkeye-strike-zone.js',
            'netlify/functions/hawkeye-mcp-proxy.js'
        ];

        this.requiredClientFiles = [
            'js/hawkeye-mcp-client.js',
            'js/hawkeye-3d-visualization.js'
        ];
    }

    async runFullTestSuite() {
        console.log('🏆 Starting Comprehensive Hawk-Eye Integration Test Suite');
        console.log('=' .repeat(80));

        await this.testNetlifyConfigurations();
        await this.testHawkEyeFunctions();
        await this.testJavaScriptClients();
        await this.testHTMLIntegrations();
        await this.testMCPServerEndpoints();

        this.generateReport();
        return this.testResults;
    }

    async testNetlifyConfigurations() {
        console.log('\\n🔧 Testing Netlify Configurations...');

        for (const site of this.sites) {
            const configPath = path.join(site.path, 'netlify.toml');

            try {
                const configContent = await fs.readFile(configPath, 'utf8');
                const result = this.validateNetlifyConfig(configContent, site);

                this.testResults.configurations.push({
                    site: site.name,
                    status: result.status,
                    details: result.details,
                    warnings: result.warnings
                });

                console.log(`  ✅ ${site.name}: ${result.status}`);
                if (result.warnings.length > 0) {
                    result.warnings.forEach(warning => console.log(`    ⚠️  ${warning}`));
                }

            } catch (error) {
                console.log(`  ❌ ${site.name}: Missing netlify.toml`);
                this.testResults.configurations.push({
                    site: site.name,
                    status: 'FAILED',
                    details: 'netlify.toml not found',
                    warnings: []
                });
                this.testResults.overall.failed++;
            }
        }
    }

    validateNetlifyConfig(content, site) {
        const warnings = [];
        let status = 'PASSED';

        // Check for required redirects
        const requiredRedirects = [
            '/api/hawkeye/track',
            '/api/hawkeye/predict',
            '/api/hawkeye/strike-zone',
            '/mcp/*'
        ];

        requiredRedirects.forEach(redirect => {
            if (!content.includes(redirect)) {
                warnings.push(`Missing redirect for ${redirect}`);
                status = 'WARNING';
            }
        });

        // Check for functions directory
        if (!content.includes('functions = "netlify/functions"')) {
            warnings.push('Functions directory not configured');
            status = 'WARNING';
        }

        // Check for MCP server URL
        if (!content.includes('MCP_SERVER_URL')) {
            warnings.push('MCP_SERVER_URL environment variable not set');
            status = 'WARNING';
        }

        // Check for CORS headers
        if (!content.includes('Access-Control-Allow-Origin')) {
            warnings.push('CORS headers not configured for MCP endpoints');
            status = 'WARNING';
        }

        return { status, details: 'Configuration validated', warnings };
    }

    async testHawkEyeFunctions() {
        console.log('\\n⚡ Testing Hawk-Eye Functions...');

        for (const site of this.sites) {
            const functionsPath = path.join(site.path, 'netlify/functions');

            for (const functionFile of ['hawkeye-track.js', 'hawkeye-predict.js', 'hawkeye-strike-zone.js', 'hawkeye-mcp-proxy.js']) {
                const functionPath = path.join(functionsPath, functionFile);

                try {
                    const functionContent = await fs.readFile(functionPath, 'utf8');
                    const result = this.validateFunction(functionContent, functionFile);

                    this.testResults.functions.push({
                        site: site.name,
                        function: functionFile,
                        status: result.status,
                        details: result.details
                    });

                    console.log(`  ✅ ${site.name}/${functionFile}: ${result.status}`);

                } catch (error) {
                    console.log(`  ❌ ${site.name}/${functionFile}: Missing`);
                    this.testResults.functions.push({
                        site: site.name,
                        function: functionFile,
                        status: 'FAILED',
                        details: 'Function file not found'
                    });
                    this.testResults.overall.failed++;
                }
            }
        }
    }

    validateFunction(content, functionName) {
        let status = 'PASSED';
        let details = 'Function structure valid';

        // Check for exports.handler
        if (!content.includes('exports.handler')) {
            status = 'FAILED';
            details = 'Missing exports.handler';
            return { status, details };
        }

        // Check for CORS handling
        if (!content.includes('Access-Control-Allow-Origin')) {
            status = 'WARNING';
            details = 'CORS headers might be missing';
        }

        // Check for error handling
        if (!content.includes('try') || !content.includes('catch')) {
            status = 'WARNING';
            details = 'Error handling might be insufficient';
        }

        // Function-specific checks
        switch (functionName) {
            case 'hawkeye-track.js':
                if (!content.includes('triangulation') && !content.includes('camera')) {
                    status = 'WARNING';
                    details = 'Ball tracking logic might be incomplete';
                }
                break;
            case 'hawkeye-predict.js':
                if (!content.includes('trajectory') && !content.includes('physics')) {
                    status = 'WARNING';
                    details = 'Prediction logic might be incomplete';
                }
                break;
            case 'hawkeye-strike-zone.js':
                if (!content.includes('zone') && !content.includes('MLB')) {
                    status = 'WARNING';
                    details = 'Strike zone logic might be incomplete';
                }
                break;
            case 'hawkeye-mcp-proxy.js':
                if (!content.includes('MCP_SERVER_URL')) {
                    status = 'WARNING';
                    details = 'MCP server URL handling might be missing';
                }
                break;
        }

        return { status, details };
    }

    async testJavaScriptClients() {
        console.log('\\n📱 Testing JavaScript Clients...');

        for (const site of this.sites) {
            for (const clientFile of this.requiredClientFiles) {
                const basePath = site.name === 'blaze-command-center' ?
                    path.join(site.path, 'frontend', clientFile) :
                    path.join(site.path, clientFile);
                const clientPath = basePath;

                try {
                    const clientContent = await fs.readFile(clientPath, 'utf8');
                    const result = this.validateJavaScriptClient(clientContent, clientFile);

                    this.testResults.clients.push({
                        site: site.name,
                        client: clientFile,
                        status: result.status,
                        details: result.details
                    });

                    console.log(`  ✅ ${site.name}/${clientFile}: ${result.status}`);

                } catch (error) {
                    console.log(`  ❌ ${site.name}/${clientFile}: Missing`);
                    this.testResults.clients.push({
                        site: site.name,
                        client: clientFile,
                        status: 'FAILED',
                        details: 'Client file not found'
                    });
                    this.testResults.overall.failed++;
                }
            }
        }
    }

    validateJavaScriptClient(content, clientFile) {
        let status = 'PASSED';
        let details = 'Client structure valid';

        if (clientFile === 'js/hawkeye-mcp-client.js') {
            // Check for essential MCP client components
            if (!content.includes('HawkEyeMCPClient')) {
                status = 'FAILED';
                details = 'HawkEyeMCPClient class missing';
                return { status, details };
            }

            if (!content.includes('initialize') || !content.includes('callTool')) {
                status = 'WARNING';
                details = 'Essential MCP methods might be missing';
            }

            if (!content.includes('BlazeRealTimeIntegration')) {
                status = 'WARNING';
                details = 'Real-time integration class might be missing';
            }
        }

        if (clientFile === 'js/hawkeye-3d-visualization.js') {
            // Check for Three.js visualization components
            if (!content.includes('HawkEye3DVisualization')) {
                status = 'FAILED';
                details = 'HawkEye3DVisualization class missing';
                return { status, details };
            }

            if (!content.includes('THREE.') && !content.includes('scene')) {
                status = 'WARNING';
                details = 'Three.js integration might be incomplete';
            }
        }

        return { status, details };
    }

    async testHTMLIntegrations() {
        console.log('\\n🌐 Testing HTML Integrations...');

        for (const site of this.sites) {
            const indexPath = path.join(site.path, site.name === 'blaze-command-center' ? 'frontend/index.html' : 'index.html');

            try {
                const htmlContent = await fs.readFile(indexPath, 'utf8');
                const result = this.validateHTMLIntegration(htmlContent, site.name);

                console.log(`  ✅ ${site.name}: ${result.status}`);
                if (result.warnings.length > 0) {
                    result.warnings.forEach(warning => console.log(`    ⚠️  ${warning}`));
                }

            } catch (error) {
                console.log(`  ❌ ${site.name}: index.html not found`);
                this.testResults.overall.failed++;
            }
        }
    }

    validateHTMLIntegration(content, siteName) {
        const warnings = [];
        let status = 'PASSED';

        // Check for Hawk-Eye script includes
        if (!content.includes('hawkeye-mcp-client.js')) {
            warnings.push('hawkeye-mcp-client.js script not included');
            status = 'WARNING';
        }

        if (!content.includes('hawkeye-3d-visualization.js')) {
            warnings.push('hawkeye-3d-visualization.js script not included');
            status = 'WARNING';
        }

        // Check for Three.js dependency
        if (content.includes('hawkeye-3d-visualization.js') && !content.includes('three.js') && !content.includes('three.min.js')) {
            warnings.push('Three.js dependency might be missing');
            status = 'WARNING';
        }

        return { status, warnings };
    }

    async testMCPServerEndpoints() {
        console.log('\\n🔌 Testing MCP Server Endpoints...');

        try {
            // Test if local MCP server is running
            const response = await fetch('http://localhost:3002/health').catch(() => null);

            if (response && response.ok) {
                console.log('  ✅ MCP Server: Running on port 3002');
                this.testResults.overall.passed++;
            } else {
                console.log('  ⚠️  MCP Server: Not running on port 3002');
                console.log('     Make sure to start the Hawk-Eye MCP server before testing');
                this.testResults.overall.warnings++;
            }
        } catch (error) {
            console.log('  ❌ MCP Server: Connection failed');
            this.testResults.overall.failed++;
        }
    }

    generateReport() {
        console.log('\\n' + '=' .repeat(80));
        console.log('🏆 HAWK-EYE INTEGRATION TEST RESULTS');
        console.log('=' .repeat(80));

        // Summary stats
        const totalTests = this.testResults.configurations.length +
                          this.testResults.functions.length +
                          this.testResults.clients.length;

        const passedTests = this.testResults.configurations.filter(t => t.status === 'PASSED').length +
                           this.testResults.functions.filter(t => t.status === 'PASSED').length +
                           this.testResults.clients.filter(t => t.status === 'PASSED').length;

        const warningTests = this.testResults.configurations.filter(t => t.status === 'WARNING').length +
                            this.testResults.functions.filter(t => t.status === 'WARNING').length +
                            this.testResults.clients.filter(t => t.status === 'WARNING').length;

        const failedTests = totalTests - passedTests - warningTests;

        console.log(`\\n📊 TEST SUMMARY:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   ✅ Passed: ${passedTests}`);
        console.log(`   ⚠️  Warnings: ${warningTests}`);
        console.log(`   ❌ Failed: ${failedTests}`);

        // Site-by-site breakdown
        console.log(`\\n🌐 SITE BREAKDOWN:`);
        this.sites.forEach(site => {
            const siteTests = [
                ...this.testResults.configurations.filter(t => t.site === site.name),
                ...this.testResults.functions.filter(t => t.site === site.name),
                ...this.testResults.clients.filter(t => t.site === site.name)
            ];

            const sitePassed = siteTests.filter(t => t.status === 'PASSED').length;
            const siteWarnings = siteTests.filter(t => t.status === 'WARNING').length;
            const siteFailed = siteTests.filter(t => t.status === 'FAILED').length;

            const status = siteFailed > 0 ? '❌ NEEDS ATTENTION' :
                          siteWarnings > 0 ? '⚠️  HAS WARNINGS' : '✅ READY';

            console.log(`   ${site.name}: ${status} (${sitePassed}✅ ${siteWarnings}⚠️ ${siteFailed}❌)`);
        });

        // Next steps
        console.log(`\\n🚀 NEXT STEPS:`);
        console.log(`   1. Start Hawk-Eye MCP server: npm run mcp-server`);
        console.log(`   2. Test endpoints: curl http://localhost:3002/api/hawkeye/track`);
        console.log(`   3. Deploy to Netlify and test live endpoints`);
        console.log(`   4. Verify 3D visualizations load properly`);
        console.log(`   5. Test real-time data integration`);

        if (failedTests === 0 && warningTests === 0) {
            console.log(`\\n🏆 ALL INTEGRATIONS READY FOR CHAMPIONSHIP DEPLOYMENT! 🏆`);
        } else if (failedTests === 0) {
            console.log(`\\n✅ Integrations ready with minor warnings to address`);
        } else {
            console.log(`\\n⚠️  Some integrations need attention before deployment`);
        }

        console.log('\\n' + '=' .repeat(80));
    }
}

// Run the test suite
async function main() {
    const tester = new HawkEyeIntegrationTester();
    await tester.runFullTestSuite();
}

// Execute if run directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = HawkEyeIntegrationTester;