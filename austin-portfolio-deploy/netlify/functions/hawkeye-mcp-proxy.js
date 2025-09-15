// Hawk-Eye MCP Proxy Function for Netlify
// Championship Sports Analytics Integration

exports.handler = async (event, context) => {
  // Enable CORS for the frontend
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);

    // Determine the MCP server URL (use environment variable or local)
    const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://blaze-intelligence-mcp.onrender.com';

    // Forward the request to the MCP server
    const mcpResponse = await fetch(`${MCP_SERVER_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    // Get the response
    const responseData = await mcpResponse.json();

    // Return the response with CORS headers
    return {
      statusCode: mcpResponse.status,
      headers,
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.error('MCP Proxy Error:', error);

    // Return error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'MCP Proxy Error',
          data: error.message
        },
        id: null
      })
    };
  }
};