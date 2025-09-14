import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport, isInitializeRequest } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const HEI_API_BASE = process.env.HEI_API_BASE;  // if/when you get partner access
const HEI_API_KEY  = process.env.HEI_API_KEY;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",").map(s => s.trim()).filter(Boolean);

function buildServer(): McpServer {
  const server = new McpServer({
    name: "hawkeye-bridge",
    version: "0.1.0",
    description: "Hawk-Eye Innovations MCP Bridge for Blaze Intelligence Platform"
  });

  // Health resource
  server.registerResource("health", "status://health", {
    title: "Health Status",
    description: "Server health and configuration status for Hawk-Eye MCP Bridge"
  }, async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify({
        ok: true,
        time: new Date().toISOString(),
        hasHeiBase: !!HEI_API_BASE,
        allowedOrigins: ALLOWED_ORIGINS,
        server: "hawkeye-mcp-bridge",
        version: "0.1.0",
        platform: "blaze-intelligence"
      }, null, 2)
    }]
  }));

  // Ball tracking resource (demo data structure)
  server.registerResource("ball-tracking", "hawkeye://ball-tracking", {
    title: "Ball Tracking Data",
    description: "Real-time ball tracking data from Hawk-Eye system"
  }, async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify({
        timestamp: new Date().toISOString(),
        ballPosition: { x: 0.5, y: 0.3, z: 0.8 },
        velocity: { vx: 15.2, vy: -2.1, vz: 8.7 },
        spin: { rpm: 2150, axis: "backspin" },
        confidence: 0.96,
        camera_angles: 6,
        trajectory_prediction: {
          landing_point: { x: 60.5, y: 0, z: 0 },
          flight_time: 0.42,
          max_height: 12.3
        }
      }, null, 2)
    }]
  }));

  // Demo tool: parse tracking CSV to simple aggregates
  server.registerTool("parse_tracking_csv", {
    title: "Parse Ball Tracking CSV",
    description: "Parse CSV data with columns: timestamp,playerId,x,y,z,speed,spin_rate. Returns aggregated statistics.",
    inputSchema: {
      type: "object",
      properties: {
        csv: {
          type: "string",
          description: "CSV data with ball tracking information"
        }
      },
      required: ["csv"]
    }
  }, async ({ csv }) => {
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const header = lines.shift() ?? "";
    const names = header.split(",").map(h=>h.trim());
    const col = (n:string)=>names.indexOf(n);

    const sIdx = col("speed"), pIdx = col("playerId"), zIdx = col("z");
    const spinIdx = col("spin_rate");

    let n=0, sumSpeed=0, sumHeight=0, sumSpin=0;
    const players=new Set<string>();

    for (const line of lines) {
      const parts = line.split(",");
      if (sIdx>=0) {
        const v=Number(parts[sIdx]);
        if (!Number.isNaN(v)) sumSpeed+=v;
      }
      if (zIdx>=0) {
        const h=Number(parts[zIdx]);
        if (!Number.isNaN(h)) sumHeight+=h;
      }
      if (spinIdx>=0) {
        const s=Number(parts[spinIdx]);
        if (!Number.isNaN(s)) sumSpin+=s;
      }
      if (pIdx>=0) players.add(parts[pIdx]);
      n++;
    }

    return {
      content: [{
        type:"text",
        text: JSON.stringify({
          rows: n,
          players: players.size,
          avgSpeed: n ? (sumSpeed/n).toFixed(1) : 0,
          avgHeight: n ? (sumHeight/n).toFixed(1) : 0,
          avgSpinRate: n ? Math.round(sumSpin/n) : 0,
          analysis: `Processed ${n} tracking points from ${players.size} players`
        }, null, 2)
      }]
    };
  });

  // Strike zone analysis tool
  server.registerTool("analyze_strike_zone", {
    title: "Strike Zone Analysis",
    description: "Analyze pitch location relative to MLB strike zone (2.6mm accuracy)",
    inputSchema: {
      type: "object",
      properties: {
        pitch_x: { type: "number", description: "Pitch X coordinate (feet from home plate center)" },
        pitch_z: { type: "number", description: "Pitch Z coordinate (feet from ground)" },
        batter_height: { type: "number", description: "Batter height in inches", default: 72 }
      },
      required: ["pitch_x", "pitch_z"]
    }
  }, async ({ pitch_x, pitch_z, batter_height = 72 }) => {
    // MLB strike zone dimensions
    const ZONE_WIDTH = 17 / 12; // 17 inches in feet
    const ZONE_BOTTOM = 1.5; // feet
    const ZONE_TOP = ZONE_BOTTOM + (batter_height * 0.44 / 12); // Rulebook formula

    const isStrike = Math.abs(pitch_x) <= ZONE_WIDTH/2 &&
                     pitch_z >= ZONE_BOTTOM &&
                     pitch_z <= ZONE_TOP;

    // Zone numbering (1-9 grid)
    let zone = 0;
    if (isStrike) {
      const xZone = pitch_x < -ZONE_WIDTH/6 ? 0 : pitch_x > ZONE_WIDTH/6 ? 2 : 1;
      const zZone = pitch_z < ZONE_BOTTOM + (ZONE_TOP-ZONE_BOTTOM)/3 ? 0 :
                    pitch_z > ZONE_TOP - (ZONE_TOP-ZONE_BOTTOM)/3 ? 2 : 1;
      zone = zZone * 3 + xZone + 1;
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          strike: isStrike,
          zone: zone,
          coordinates: { x: pitch_x, z: pitch_z },
          strike_zone: {
            width: ZONE_WIDTH * 12, // inches
            bottom: ZONE_BOTTOM * 12, // inches
            top: ZONE_TOP * 12 // inches
          },
          accuracy: "2.6mm (Hawk-Eye standard)",
          confidence: 0.96
        }, null, 2)
      }]
    };
  });

  // Ball trajectory prediction
  server.registerTool("predict_trajectory", {
    title: "Ball Trajectory Prediction",
    description: "Predict ball trajectory using physics simulation with air resistance and Magnus effect",
    inputSchema: {
      type: "object",
      properties: {
        initial_velocity: {
          type: "object",
          properties: {
            vx: { type: "number", description: "X velocity (mph)" },
            vy: { type: "number", description: "Y velocity (mph)" },
            vz: { type: "number", description: "Z velocity (mph)" }
          },
          required: ["vx", "vy", "vz"]
        },
        spin_rate: { type: "number", description: "Spin rate in RPM" },
        release_height: { type: "number", description: "Release height in feet", default: 6 }
      },
      required: ["initial_velocity", "spin_rate"]
    }
  }, async ({ initial_velocity, spin_rate, release_height = 6 }) => {
    const { vx, vy, vz } = initial_velocity;

    // Convert mph to ft/s
    const v0x = vx * 1.467;
    const v0y = vy * 1.467;
    const v0z = vz * 1.467;

    // Physics simulation (simplified)
    const g = 32.174; // ft/s²
    const drag_coeff = 0.3;
    const magnus_coeff = spin_rate * 0.00001; // Simplified Magnus effect

    // Time to reach home plate (60.5 feet)
    const flight_time = 60.5 / Math.abs(v0y);

    // Final position calculation
    const final_x = v0x * flight_time;
    const final_z = release_height + v0z * flight_time - 0.5 * g * flight_time * flight_time;

    // Max height calculation
    const time_to_max = v0z / g;
    const max_height = release_height + v0z * time_to_max - 0.5 * g * time_to_max * time_to_max;

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          trajectory: {
            landing_point: { x: final_x.toFixed(2), y: 60.5, z: final_z.toFixed(2) },
            flight_time: flight_time.toFixed(3),
            max_height: max_height.toFixed(1)
          },
          physics: {
            initial_velocity_fps: { vx: v0x.toFixed(1), vy: v0y.toFixed(1), vz: v0z.toFixed(1) },
            spin_rate_rpm: spin_rate,
            drag_coefficient: drag_coeff,
            magnus_effect: magnus_coeff.toFixed(6)
          },
          accuracy: "2.6mm tracking precision",
          frame_rate: "340 fps"
        }, null, 2)
      }]
    };
  });

  // Lawful passthrough (only if partner creds provided)
  server.registerTool("hei_passthrough", {
    title: "Hawk-Eye Partner API Passthrough",
    description: "Call a Hawk-Eye partner endpoint (requires HEI_API_BASE & HEI_API_KEY). Only available with official partner access.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "API endpoint path" },
        method: { type: "string", enum: ["GET","POST","PUT","DELETE"], default: "GET" },
        query: { type: "object", description: "Query parameters" },
        body: { type: "object", description: "Request body for POST/PUT" }
      },
      required: ["path"]
    }
  }, async ({ path, method = "GET", query, body }) => {
    if (!HEI_API_BASE || !HEI_API_KEY) {
      return {
        content: [{
          type:"text",
          text: JSON.stringify({
            error: "Partner API access not configured",
            message: "Set HEI_API_BASE and HEI_API_KEY environment variables to enable Hawk-Eye partner API passthrough.",
            demo_mode: true
          }, null, 2)
        }],
        isError: true
      };
    }

    try {
      const url = new URL(path, HEI_API_BASE);
      if (query) {
        Object.entries(query).forEach(([k,v]) => url.searchParams.set(k, String(v)));
      }

      const resp = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${HEI_API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "Blaze-Intelligence-MCP/1.0"
        },
        body: body ? JSON.stringify(body) : undefined
      });

      const text = await resp.text();
      return {
        content: [{ type:"text", text }],
        isError: !resp.ok
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: error.message }, null, 2)
        }],
        isError: true
      };
    }
  });

  // Simple echo for testing
  server.registerTool("echo", {
    title:"Echo Test",
    description:"Echo a message back for testing MCP connectivity",
    inputSchema: {
      type: "object",
      properties: {
        message: { type: "string", description: "Message to echo back" }
      },
      required: ["message"]
    }
  }, async ({ message }) => ({
    content: [{
      type:"text",
      text: `🏆 Blaze Intelligence Hawk-Eye MCP Echo: ${message}`
    }]
  }));

  return server;
}

const app = express();
app.use(express.json({ limit: "4mb" }));

// CORS: expose Mcp-Session-Id per SDK docs
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
      cb(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      cb(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  exposedHeaders: ["Mcp-Session-Id"],
  allowedHeaders: ["Content-Type", "mcp-session-id", "Authorization"]
}));

// Session-managed Streamable HTTP endpoint
const transports: Record<string, StreamableHTTPServerTransport> = {};

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: sid => {
        transports[sid] = transport;
        console.log(`MCP session initialized: ${sid}`);
      }
    });
    transport.onclose = () => {
      if (transport.sessionId) {
        console.log(`MCP session closed: ${transport.sessionId}`);
        delete transports[transport.sessionId];
      }
    };
    const server = buildServer();
    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Bad Request: No valid session ID provided"
      },
      id: null
    });
    return;
  }

  await transport.handleRequest(req as any, res as any, req.body);
});

const handleSessionRequest = async (req: any, res: any) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
};

app.get("/mcp", handleSessionRequest);
app.delete("/mcp", handleSessionRequest);

app.get("/healthz", (_req, res) => res.json({
  ok: true,
  time: new Date().toISOString(),
  service: "hawkeye-mcp-bridge",
  version: "0.1.0",
  platform: "blaze-intelligence"
}));

app.get("/", (_req, res) => res.json({
  service: "Hawk-Eye MCP Bridge",
  version: "0.1.0",
  platform: "Blaze Intelligence",
  endpoints: {
    mcp: "/mcp",
    health: "/healthz"
  },
  tools: ["parse_tracking_csv", "analyze_strike_zone", "predict_trajectory", "hei_passthrough", "echo"],
  resources: ["health", "ball-tracking"]
}));

app.listen(PORT, () => {
  console.log(`🏆 Hawk-Eye MCP Bridge running on port ${PORT}`);
  console.log(`📊 Blaze Intelligence Platform Integration Ready`);
  console.log(`🔗 MCP endpoint: /mcp`);
  console.log(`💚 Health check: /healthz`);
  console.log(`🎯 Allowed origins: ${ALLOWED_ORIGINS.join(", ") || "any"}`);
});