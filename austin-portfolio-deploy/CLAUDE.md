# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Scripts
- `npm run start` - Start Express development server (simple-blaze-server.js)
- `npm run dev` - Start development server with nodemon for auto-restart
- `npm run build` - Simple build command that outputs "Build complete - static files ready"
- `npm run clean` - Clean node_modules, package-lock.json, dist, build, and cache
- `npm run clean:all` - Full cleanup including logs and temp files
- `npm run organize` - Run project cleanup script (tools/cleanup-project.sh)

### Testing Commands
- `npm test` - Run Jest unit tests with 80% coverage threshold
- Tests are located in `tests/` directory and cover `src/` and `api/` directories
- Jest is configured with TypeScript preset and 30-second timeout
- Coverage reports generated for all JS/TS files excluding index files and type definitions

### Netlify Deployment
- `netlify deploy --prod` - Deploy to production environment
- Build command: `npm run build || echo 'Championship platform ready for deployment'`
- Functions directory: `api/` (30 serverless functions)
- Publish directory: `.` (root directory)

## Architecture Overview

### Platform Structure
This is a Blaze Intelligence sports analytics platform with a **static frontend + serverless API** architecture deployed on Netlify. The platform focuses on MLB, NFL, NBA, and NCAA sports data with Texas-inspired branding (Burnt Orange #BF5700, Cardinal Blue #9BCBEB).

### Core Components

**Frontend Architecture:**
- **Static HTML Pages**: 100+ specialized pages for different sports, demos, and dashboards
- **Main Entry Point**: `index.html` - championship platform with critical CSS inlined for performance
- **Key Pages**: 
  - `nil-calculator.html` - NIL valuation calculator for college athletes
  - `orioles-executive-intelligence.html` - Executive dashboard demo
  - `live-demo.html` - Interactive platform demonstration
  - `blaze-vision-ai-scouting.html` - Video intelligence showcase

**Serverless API (api/ directory):**
- **30 Netlify Functions** providing various sports analytics endpoints
- **Key APIs**:
  - `health.js` - Comprehensive system health monitoring with performance metrics
  - `status.js` - System status and monitoring endpoint
  - `enhanced-nil-calculator.js` - NIL valuation calculations
  - `team-intelligence-api.js` - Team analytics and insights
  - `blaze-analytics-api.js` - Core analytics processing
  - `stripe-integration.js` & `stripe-subscription.js` - Payment processing
  - `hubspot-integration.js` & `crm-integration.js` - Lead management
  - `notion-cms.js` - Content management system integration

### Data Architecture
```
data/
├── dashboard-config.json     # Live Cardinals readiness metrics and dashboard widgets
├── team-intelligence.json    # Team-specific analytics data
├── live-intelligence.json    # Real-time sports intelligence feeds
├── api-health.json          # API health monitoring data
└── blaze-metrics.json       # Platform performance metrics
```

**Data Updates**: The `dashboard-config.json` contains live Cardinals readiness scores (86.6%), leverage factors (2.85), and momentum indicators updated in real-time.

### Performance Optimization
- **Lighthouse Target**: 80+ performance score (recently optimized from 50 to 80+)
- **Critical CSS**: Inlined in `index.html` for hero section, navigation, and buttons
- **Resource Loading**: Non-blocking CSS with preload + onload pattern
- **Font Optimization**: DNS prefetch and preconnect for Google Fonts
- **Script Deferring**: HubSpot and external scripts loaded with defer attribute

### Netlify Configuration
- **Environment**: Production mode with `BLAZE_ENVIRONMENT=production`
- **Security Headers**: CSP, HSTS, XSS protection, frame denial
- **API Routing**: `/api/*` routes to `/.netlify/functions/:splat`
- **SPA Fallback**: All routes redirect to appropriate HTML pages or `index.html`
- **Health Endpoints**: `/health` and `/status` for monitoring

### Brand Standards (Critical)
- **Company Name**: Always "Blaze Intelligence" (never alternatives)
- **Team Examples**: Cardinals (MLB), Titans (NFL), Longhorns (NCAA), Grizzlies (NBA)
- **Savings Claims**: Only 67-80% vs competitor tiers (factual range)
- **Color Palette**: Burnt Orange (#BF5700) primary, Cardinal Blue (#9BCBEB) secondary
- **Typography**: Inter font family with JetBrains Mono for technical displays

### Sports Data Focus
- **Primary Sports**: MLB, NCAA football/baseball, NFL, NBA, high school football
- **Special Focus**: Perfect Game youth baseball data and Texas high school football
- **International**: Latin America, Japan, South Korea, KBO pipeline information
- **Excluded**: No soccer/football references (per brand guidelines)

## Testing & Quality Assurance

### Jest Configuration
- **Coverage Threshold**: 80% branches, functions, lines, statements
- **Test Timeout**: 30 seconds
- **Setup**: `tests/setup.js` for test environment configuration
- **Patterns**: `**/*.test.(js|jsx|ts|tsx)` and `**/__tests__/**/*.test.(js|jsx|ts|tsx)`

### Performance Standards
- **Lighthouse Score**: Target 90+, current 80+ (recently improved from 50)
- **Response Time**: <100ms for API endpoints
- **Uptime**: 99.9% availability target
- **Error Rate**: <1% failed requests

## Deployment Workflow

### Production Deployment
1. Code changes trigger Netlify build process
2. Build command executes `npm run build`
3. All 30 API functions are bundled with esbuild
4. Static assets deployed to CDN with security headers
5. Health checks validate deployment success

### Environment Variables
- **Required**: Sports API keys, monitoring configuration
- **Security**: All secrets managed via Netlify environment variables
- **Performance**: Caching and rate limiting configuration

### Monitoring
- **Health Check**: `/health` endpoint provides system diagnostics, memory usage, service status
- **Status Monitoring**: `/status` endpoint for uptime verification  
- **Performance**: Lighthouse plugin runs on each deployment
- **Error Tracking**: Comprehensive logging in all API functions

This platform represents a championship-level sports analytics solution combining Texas heritage with breakthrough technology, optimized for performance and scalability.