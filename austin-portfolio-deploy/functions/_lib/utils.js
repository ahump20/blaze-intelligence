/**
 * Shared utilities for Netlify Functions
 */

export function scheduleLog(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Client-Version, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};