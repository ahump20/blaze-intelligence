import type { Context } from "@netlify/functions";

const HAWKEYE_MCP_URL = process.env.HAWKEYE_MCP_URL || "https://hawkeye-mcp-bridge-production.onrender.com";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const targetPath = url.pathname.replace(/^\/mcp/, "");
  const targetUrl = `${HAWKEYE_MCP_URL}/mcp${targetPath}${url.search}`;

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
    // Forward the request to the MCP server
    const proxyHeaders = new Headers();

    // Copy relevant headers
    for (const [key, value] of request.headers.entries()) {
      if (["content-type", "authorization", "mcp-session-id", "user-agent"].includes(key.toLowerCase())) {
        proxyHeaders.set(key, value);
      }
    }

    // Add Blaze Intelligence identification
    proxyHeaders.set("X-Forwarded-By", "Blaze-Intelligence-Platform");
    proxyHeaders.set("X-Proxy-Source", "netlify");

    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: proxyHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null
    });

    console.log(`🏆 Proxying ${request.method} ${url.pathname} -> ${targetUrl}`);

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

    // Add Blaze branding
    responseHeaders.set("X-Powered-By", "Blaze-Intelligence");
    responseHeaders.set("X-Sports-Analytics", "Championship-Platform");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    console.error("🚨 MCP Proxy Error:", error);

    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "MCP Bridge Connection Failed",
          data: {
            error: error instanceof Error ? error.message : "Unknown error",
            service: "hawkeye-mcp-bridge",
            platform: "blaze-intelligence"
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
          "Access-Control-Expose-Headers": "Mcp-Session-Id"
        }
      }
    );
  }
};

export const config = {
  path: "/mcp/*"
};