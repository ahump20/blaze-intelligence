# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Blaze Intelligence is a championship-level sports analytics platform featuring real-time data integration, AI-powered video analysis, character assessment, and 3D visualizations. The platform is deployed on Netlify and operates as a Progressive Web App (PWA) with offline capabilities.

## Development & Deployment

### Deploy to Production
```bash
PATH="/Users/AustinHumphrey/.npm-global/bin:$PATH" netlify deploy --prod --message "Your deployment message" --timeout 600
```

### Local Development
```bash
# Start local server
python3 -m http.server 8080

# Test locally
open http://localhost:8080
```

### Check Deployment Status
```bash
curl -s -o /dev/null -w "%{http_code}" https://blaze-intelligence.netlify.app/
```

## Architecture & Core Systems

### 1. Real-Time Intelligence (RTI) System
The RTI system (`/js/rti-*.js`) provides sub-100ms multimodal analysis:
- **rti-fusion-engine.js**: Combines multiple data streams (video, audio, sensor)
- **rti-decision-engine.js**: Makes real-time decisions based on patterns
- **webrtc-gateway.js**: Handles WebRTC connections for live streaming
- **sports-pattern-library.js**: Contains sport-specific pattern recognition

### 2. Sports Data Integration
- **API Layer** (`/api/sports-data-connector.js`): Centralized sports data fetching
  - MLB (Cardinals focus), NFL (Titans), NBA (Grizzlies), NCAA (Longhorns)
  - Perfect Game youth baseball, Texas HS football
  - International pipeline (Latin America, Japan, Korea)
- **Real-time Handler** (`/js/realtime-data-handler.js`): WebSocket-ready, 10-30 second update intervals
- **Caching**: 30-second cache timeout for API responses

### 3. Character Assessment Engine
- **Micro-Expression Detection** (`/js/character-assessment-micro-expression.js`)
  - Detects patterns <500ms duration
  - 6 core traits: Grit, Leadership, Resilience, Coachability, Competitiveness, Teamwork
- **Biomechanical Analysis**: Posture, balance, tension, movement quality
- **Video Processing**: Frame extraction, real-time analysis, comprehensive reporting

### 4. 3D Visualization System
- **Three.js Integration** (`/js/three-data-visualizer.js`)
  - MLB diamond visualization with real-time stats
  - NCAA football field with performance metrics
  - Perfect Game prospect hub with rankings
  - Holographic displays with data rings
- **Particle Systems**: Interactive backgrounds with team colors

### 5. PWA & Service Workers
- **Primary Service Worker** (`sw.js`): RTI-focused caching
- **Enhanced Service Worker** (`sw-enhanced.js`): Full PWA capabilities
- **Caching Strategy**:
  - Static assets: Cache first
  - API calls: Network first with cache fallback
  - Images: Cache first with background revalidation
- **Offline Support**: Complete offline page with cached data access

### 6. Video Intelligence Upload
- **Upload System** (`video-intelligence-upload.html`):
  - Drag-and-drop file upload
  - Live camera capture with MediaRecorder API
  - 6 analysis types available
  - Progress tracking pipeline

## Key File Patterns

### HTML Pages (28 total)
- **Main**: `index.html` (enhanced with dropdowns)
- **Analytics**: `analytics.html`, `nil-calculator-advanced.html`, `sec-nil-analytics.html`
- **Sports**: `sec-football-enhanced.html`, `championship-ai-analytics.html`, `digital-combine.html`
- **Intelligence**: `cardinals-intelligence-dashboard.html`, `perfect-game-enhanced.html`
- **Video**: `video-intelligence-upload.html`

### JavaScript Architecture
```
/js/
├── rti-*.js              # Real-time intelligence system
├── character-assessment-*.js  # Character & micro-expression analysis
├── three-data-visualizer.js   # 3D visualizations
├── realtime-data-handler.js   # Live data updates
├── performance-optimizer.js   # Performance monitoring
└── professional-animations.js # GSAP animations

/api/
├── sports-data-connector.js   # Unified sports data API
└── advanced-nil-calculator.js # NIL valuation calculations
```

## Netlify Configuration

The platform uses Netlify with the following setup:
- **Build Command**: `npm run build:unified || echo 'Unified platform ready'`
- **Publish Directory**: Root directory
- **Functions**: `/netlify/functions` (not currently used)
- **Headers**: Security headers, cache control for static assets
- **Redirects**: API routes to functions, legacy URL redirects

## Performance Targets

- **Latency**: <100ms for real-time analysis
- **Accuracy**: 94.6% pattern recognition target
- **Data Points**: 2.8M+ across all sports
- **Update Intervals**: 10-30 seconds for live data
- **Cache Duration**: 30 seconds for API, 1 year for static assets

## Color Palette & Branding

- **Primary Orange**: #BF5700 (Texas Longhorns heritage)
- **Championship Gold**: #FFD700
- **Cardinal Blue**: #9BCBEB
- **Background**: #0a0e27 to #1a1a2e gradient

## External Dependencies

The platform uses CDN-hosted libraries:
- Three.js: `https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js`
- Particles.js: `https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js`
- GSAP: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js`

## Data Update Patterns

Real-time data updates follow this hierarchy:
1. MLB/Cardinals: 10-second intervals
2. NFL/NCAA: 20-second intervals
3. Perfect Game/Texas HS: 30-second intervals
4. Character assessment: Real-time during video analysis

## Testing & Verification

```bash
# Check page availability
for page in "" "analytics.html" "video-intelligence-upload.html"; do
  curl -s -o /dev/null -w "%{http_code}" "https://blaze-intelligence.netlify.app/$page"
done

# Verify feature integration
curl -s https://blaze-intelligence.netlify.app/ | grep -c "three-data-visualizer.js"
```

## Critical Implementation Notes

1. **Sports Focus**: MLB Cardinals, NFL Titans, NBA Grizzlies, NCAA Longhorns only - no soccer/international football
2. **Data Sources**: Uses public APIs (MLB Stats API, ESPN) - no authenticated endpoints currently
3. **Video Processing**: Client-side only, no server-side processing implemented
4. **Character Assessment**: Simulated analysis for demo - real ML models not loaded
5. **WebSocket**: Architecture ready but no active WebSocket server deployed