# 🏆 Hawk-Eye MCP Bridge

**Hawk-Eye Innovations MCP Bridge for Blaze Intelligence Platform**

A Model Context Protocol (MCP) server that provides advanced ball tracking, strike zone analysis, and trajectory prediction capabilities using Hawk-Eye's precision sports analytics technology.

## 🎯 Features

### Core MCP Tools
- **Ball Tracking CSV Parser** - Process tracking data with 2.6mm accuracy
- **Strike Zone Analysis** - MLB-compliant zone detection and classification
- **Trajectory Prediction** - Physics-based ball flight simulation with Magnus effect
- **Partner API Passthrough** - Direct integration with Hawk-Eye partner APIs (when available)

### Resources
- **Health Status** - Server health and configuration monitoring
- **Real-Time Ball Tracking** - Live ball position, velocity, and spin data

## 🚀 Quick Start

### Development Setup
```bash
cd services/hawkeye-mcp
npm install
cp .env.example .env
npm run dev
```

### Production Deployment (Render)
```bash
# Deploy using Infrastructure as Code
render deploy

# Or manual deployment via Render dashboard
# 1. Connect GitHub repository
# 2. Use render.yaml configuration
# 3. Set environment variables in dashboard
```

### MCP Client Integration
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "hawkeye-analytics": {
      "command": "node",
      "args": ["/path/to/hawkeye-mcp/dist/server.js"]
    }
  }
}
```

## 🏈 Usage Examples

### CSV Ball Tracking Analysis
```typescript
// Process ball tracking data
const trackingData = `
timestamp,playerId,x,y,z,speed,spin_rate
2024-01-15T19:30:00Z,player_1,0.5,60.5,3.2,95.4,2150
2024-01-15T19:30:01Z,player_1,15.2,45.3,8.7,89.2,2080
`;

const analysis = await mcp.call("parse_tracking_csv", { csv: trackingData });
```

### Strike Zone Analysis
```typescript
// Analyze pitch location
const strikeZone = await mcp.call("analyze_strike_zone", {
  pitch_x: 0.2,  // feet from center
  pitch_z: 2.8,  // feet from ground
  batter_height: 74  // inches
});
```

### Trajectory Prediction
```typescript
// Predict ball flight path
const trajectory = await mcp.call("predict_trajectory", {
  initial_velocity: { vx: 5, vy: -95, vz: 15 },
  spin_rate: 2200,
  release_height: 6.2
});
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `HEI_API_BASE` - Hawk-Eye Partner API base URL
- `HEI_API_KEY` - Partner API authentication key
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)

### Partner API Access
To enable full Hawk-Eye integration:
1. Obtain partner credentials from Hawk-Eye Innovations
2. Set `HEI_API_BASE` and `HEI_API_KEY` environment variables
3. Use `hei_passthrough` tool for direct API calls

## 🏟️ Architecture

### MCP Server (TypeScript/Node.js)
- Express.js HTTP server with CORS
- Session-managed Streamable HTTP transport
- TypeScript for type safety and development experience
- Zod for input validation

### Netlify Integration
- Proxy function at `/mcp/*` endpoints
- CORS headers configured for MCP-Session-Id
- Automatic deployment with Infrastructure as Code

### Render Deployment
- Auto-scaling web service
- Health check monitoring
- Environment variable management
- Optional database and worker support

## 📊 API Endpoints

- `POST /mcp` - Main MCP protocol endpoint
- `GET /mcp` - Session management
- `DELETE /mcp` - Session cleanup
- `GET /healthz` - Health check
- `GET /` - Service information

## 🔒 Security

- CORS configuration for allowed origins
- API key authentication for partner access
- Input validation with Zod schemas
- Session isolation via Durable Objects
- No sensitive data logging

## 🏆 Blaze Intelligence Integration

This MCP server is designed specifically for the Blaze Intelligence platform:
- Branded API responses and headers
- Championship-level performance optimization
- Integration with existing sports analytics pipelines
- Real-time data processing capabilities

## 📈 Performance

- **Target Latency**: <100ms for real-time feedback
- **Accuracy**: 2.6mm tracking precision (Hawk-Eye standard)
- **Frame Rate**: 340 FPS tracking capability
- **Concurrency**: Multi-session support via MCP protocol

## 🤝 Contributing

This is part of the Blaze Intelligence sports analytics platform. For contributions:
1. Follow TypeScript best practices
2. Maintain <100ms response times for real-time tools
3. Include comprehensive error handling
4. Update documentation for new tools/resources

## 📄 License

MIT License - Built with ⚾ for championship-level sports intelligence.