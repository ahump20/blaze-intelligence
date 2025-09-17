# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Scripts
- `npm run start` - Execute multi-AI analysis and integration pipeline
- `npm run update` - Process pending content updates for portfolio
- `npm run watch` - Start continuous monitoring of content changes
- `npm run deploy` - Deploy updates to portfolio system
- `npm run mcp-server` - Start Cardinals Analytics MCP server
- `npm run build` - Build static files (minimal build process)
- `npm run serve` - Start local development server on port 8000

### System Operations
- `npm run status` - Check system status via master automation controller
- `npm run health-check` - Run comprehensive health monitoring
- `npm run security-scan` - Execute security scanning and backup operations
- `npm run backup` - Create system backups
- `npm run ingest-data` - Run priority sports data ingestion
- `npm run test-ai` - Test AI orchestration deployment
- `npm run generate-reports` - Generate analytics reports pipeline

### GitHub Management
- `npm run github-analyze` - Analyze GitHub repository structure
- `npm run github-cleanup` - Preview GitHub repository cleanup operations
- `npm run github-cleanup-execute` - Execute GitHub repository cleanup
- `npm run github-plan` - Generate GitHub organization plan

### MCP Server Commands (via Claude Code)
```bash
# Start MCP server
./start-cardinals-server.sh

# Analyze trajectory from baseball stats to business metrics
/mcp call cardinals-analytics analyzeTrajectory --data path/to/baseball-data.json --comparison path/to/business-metrics.json

# Generate insights from sports data
/mcp call cardinals-analytics generateInsights --gameData '{"team": "Cardinals"}' --playerMetrics '{"performance": "metrics"}'

# Update portfolio sections with new content
/mcp call cardinals-analytics updatePortfolio --content "analysis content" --section "analytics"
```

## Architecture Overview

### Multi-AI Orchestration System
This codebase implements a comprehensive sports intelligence platform that orchestrates multiple AI models (Claude, ChatGPT, Gemini) for analytics and content generation.

**Core Components:**
- **Cardinals Analytics MCP Server** (`BI/cardinals-analytics-server.js`) - Model Context Protocol server providing sports analytics functions
- **Multi-AI Integration** (`scripts/multi_ai_integration.js`) - Orchestrates parallel processing across AI models
- **Dynamic Content Updater** (`dynamic-content-updater.js`) - Automated content processing and deployment system
- **Workflow Triggers** (`workflow-triggers.js`) - Scheduled tasks, webhooks, and automation management

### Data Architecture
```
/data/
├── analytics/          # Sports analytics by league (MLB/NFL/NBA/College)
├── live/              # Real-time sports data feeds
├── clients/           # Client-specific data and proposals
└── youth-baseball/    # Perfect Game and youth sports integration
```

### Project Directories
- **austin-portfolio-deploy/** - Production website with 90+ HTML pages, API endpoints, and deployment scripts
- **BI/** - Business Intelligence platform core with MCP server and automation
- **blaze-rti-deploy/** - Real-Time Intelligence platform deployment
- **blaze-worlds-game/** - Interactive gaming platform integration
- **vision-ai/** - Computer vision and biomechanical analysis components
- **mobile-app/** - React Native application (if present)

### Portfolio Integration
The `austin-portfolio-deploy/` directory contains the live portfolio system with:
- **API Endpoints** (`api/`) - Lead capture, NIL calculator, Cardinals readiness, sports data integration
- **Interactive Dashboards** - Sport-specific dashboards for Cardinals, Titans, Longhorns, Grizzlies
- **SportsDataIO Integration** - Live NFL, MLB, NBA, NCAA data feeds
- **Netlify Functions** - Serverless API endpoints for real-time data
- **Monitoring** - Comprehensive logging and performance tracking

### Cloudflare Workers Integration
Multiple Wrangler configurations support different deployment environments:
- `wrangler.toml` - Youth sports data ingestion with R2 and KV storage
- Environment configurations for production/staging deployments

### Vision AI Platform
The system includes computer vision capabilities for sports analytics:
- Biomechanical analysis and form assessment
- Micro-expression detection for character evaluation
- Neural coaching interfaces with AR/VR integration
- Real-time performance feedback systems

## Development Workflow

### Local Development
1. Install dependencies: `npm install`
2. Set up environment variables in `.env` file
3. Register MCP server: Use Claude Code to register cardinals-analytics server
4. Start development server: `npm run serve`

### Content Pipeline
The system automatically processes content updates through:
1. Multi-AI analysis generates insights
2. Dynamic content updater processes changes
3. Portfolio deployment system publishes updates
4. Health monitoring tracks system performance

### Data Integration
Sports data flows through multiple pipelines:
- Real-time APIs for live game data (SportsDataIO)
- Historical data analysis for trend identification
- Youth/Perfect Game data for recruitment analytics
- NIL calculations for college athlete valuations
- Texas high school football integration

## Key Technologies

- **Node.js/ES Modules** - Core runtime environment
- **Model Context Protocol** - AI integration framework
- **Express.js** - Web server and API framework
- **Cloudflare Workers** - Edge computing and deployment
- **R2 Storage** - Sports data storage and retrieval
- **Redis/KV** - Caching and session management
- **TensorFlow.js** - Machine learning and analytics
- **Three.js** - 3D visualizations and interfaces
- **Socket.io** - Real-time data streaming
- **Netlify** - Primary hosting platform with serverless functions

## Blaze Intelligence Brand Standards

- **Company Name**: Always use "Blaze Intelligence" (canonical, exclusive)
- **Example Teams**: Cardinals, Titans, Longhorns, Grizzlies (expand beyond these four as needed)
- **Savings Claims**: 67–80% vs named competitor tiers (factual range only)
- **Performance Claims**: Require "Methods & Definitions" link for benchmarks
- **Style**: Neutral, factual tone - avoid adversarial "vs competitors" language
- **Sports Focus**: MLB, NCAA football/baseball, NFL, NBA, high school sports, Perfect Game baseball data
- **Regional Focus**: Deep South Sports Authority - Texas, SEC region emphasis
- **Exclusions**: No soccer/football references in demos or examples

## Security Considerations

- Never commit API keys or secrets to repository
- Use environment variables for sensitive configuration
- Implement rate limiting for all external API calls
- Maintain audit logs for all data processing operations
- Regular security scans via `npm run security-scan`
- Automated backup systems for critical data

## Monitoring and Maintenance

- Health checks run automatically via cron jobs
- Performance metrics tracked in JSON logs
- Error handling with comprehensive logging via Winston
- Automated deployment verification
- System status dashboard available via `npm run status`

## Current Active Development

### Live Deployments
- **Production Site**: https://blaze-intelligence.netlify.app
- **Status Page**: deployment-status.html with real-time monitoring
- **Active Dashboards**: Multiple sport-specific analytics dashboards

### Recent Updates (October 2025)
- Node 22 LTS modernization
- SportsDataIO proxy implementation for secure API access
- Perfect Game youth baseball integration
- Accessibility enhancements with reduced motion support
- NBA Grizzlies dashboard implementation

### Known Issues & Workarounds
- Port conflicts: Default server runs on port 8000, use 8001 if occupied
- ES Module errors: Ensure `"type": "module"` in package.json
- MCP Server: Restart with `./start-cardinals-server.sh` if connection drops