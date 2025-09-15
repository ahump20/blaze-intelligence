import type { Context } from "@netlify/functions";

// Local MCP Server URL for development - update for production
const LOCAL_MCP_URL = process.env.LOCAL_MCP_URL || "http://localhost:3002";
const PRODUCTION_MCP_URL = process.env.HAWKEYE_MCP_URL || "https://hawkeye-mcp-bridge-production.onrender.com";

// Use local MCP server if available, fallback to production
const MCP_BASE_URL = process.env.NODE_ENV === "development" ? LOCAL_MCP_URL : PRODUCTION_MCP_URL;

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const targetPath = url.pathname.replace(/^\/api\/mcp/, "");
  const targetUrl = `${MCP_BASE_URL}/mcp${targetPath}${url.search}`;

  // Handle preflight CORS requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, mcp-session-id",
        "Access-Control-Expose-Headers": "Mcp-Session-Id",
        "Access-Control-Max-Age": "86400"
      }
    });
  }

  try {
    // Initialize MCP session if this is a tools call
    let sessionId = request.headers.get("mcp-session-id");

    if (!sessionId && request.method === "POST") {
      const bodyText = await request.text();
      const bodyData = JSON.parse(bodyText);

      // If this is a tool call without session, initialize first
      if (bodyData.method === "tools/call" && !sessionId) {
        console.log("🚀 Initializing MCP session for tools call...");

        // Initialize MCP session
        const initResponse = await fetch(`${MCP_BASE_URL}/mcp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-By": "Blaze-3D-Intelligence-Platform",
            "X-Proxy-Source": "netlify-3d"
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
              protocolVersion: "2024-11-05",
              capabilities: {}
            }
          })
        });

        sessionId = initResponse.headers.get("mcp-session-id");
        console.log("✅ MCP session initialized:", sessionId);
      }

      // Forward the original request with session
      const proxyHeaders = new Headers();
      proxyHeaders.set("Content-Type", "application/json");
      proxyHeaders.set("X-Forwarded-By", "Blaze-3D-Intelligence-Platform");
      proxyHeaders.set("X-Proxy-Source", "netlify-3d");

      if (sessionId) {
        proxyHeaders.set("mcp-session-id", sessionId);
      }

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: bodyText
      });

      console.log(`🌌 Proxying 3D ${request.method} ${url.pathname} -> ${targetUrl} (${response.status})`);

      // Create response with CORS headers
      const responseHeaders = new Headers();

      // Copy response headers
      for (const [key, value] of response.headers.entries()) {
        responseHeaders.set(key, value);
      }

      // Add CORS headers
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, mcp-session-id");
      responseHeaders.set("Access-Control-Expose-Headers", "Mcp-Session-Id");

      // Add Blaze 3D branding
      responseHeaders.set("X-Powered-By", "Blaze-3D-Intelligence");
      responseHeaders.set("X-Sports-Analytics", "Championship-3D-Platform");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });

    } else {
      // Handle non-POST requests or requests with existing session
      const proxyHeaders = new Headers();

      // Copy relevant headers
      for (const [key, value] of request.headers.entries()) {
        if (["content-type", "authorization", "mcp-session-id", "user-agent"].includes(key.toLowerCase())) {
          proxyHeaders.set(key, value);
        }
      }

      // Add Blaze 3D identification
      proxyHeaders.set("X-Forwarded-By", "Blaze-3D-Intelligence-Platform");
      proxyHeaders.set("X-Proxy-Source", "netlify-3d");

      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null
      });

      const response = await fetch(proxyRequest);

      // Create response with CORS headers
      const responseHeaders = new Headers();

      // Copy response headers
      for (const [key, value] of response.headers.entries()) {
        responseHeaders.set(key, value);
      }

      // Add CORS headers
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, mcp-session-id");
      responseHeaders.set("Access-Control-Expose-Headers", "Mcp-Session-Id");

      // Add Blaze 3D branding
      responseHeaders.set("X-Powered-By", "Blaze-3D-Intelligence");
      responseHeaders.set("X-Sports-Analytics", "Championship-3D-Platform");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    }

  } catch (error) {
    console.error("🚨 3D MCP Proxy Error:", error);

    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "MCP Bridge Connection Failed",
          data: {
            error: error instanceof Error ? error.message : "Unknown error",
            service: "hawkeye-mcp-bridge",
            platform: "blaze-3d-intelligence",
            target_url: targetUrl
          }
        },
        id: null
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, mcp-session-id",
          "Access-Control-Expose-Headers": "Mcp-Session-Id",
          "X-Powered-By": "Blaze-3D-Intelligence",
          "X-Error-Source": "mcp-proxy"
        }
      }
    );
  }
};

export const config = {
  path: "/api/mcp/*"
};