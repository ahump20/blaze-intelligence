#!/bin/bash

# Blaze Intelligence - Netlify Environment Setup Script
# This script sets up all environment variables for the Netlify deployment

echo "🏆 Setting up Blaze Intelligence environment variables on Netlify..."

# Set SportsDataIO API Key
netlify env:set SPORTSDATAIO_API_KEY "6ca2adb39404482da5406f0a6cd7aa37"

# Set Database Configuration
netlify env:set DATABASE_URL "postgresql://neondb_owner:npg_Gh5znmB4lokX@ep-blue-glitter-a5w82vok.us-east-2.aws.neon.tech/neondb?sslmode=require"
netlify env:set PGDATABASE "neondb"
netlify env:set PGHOST "ep-blue-glitter-a5w82vok.us-east-2.aws.neon.tech"
netlify env:set PGPORT "5432"
netlify env:set PGUSER "neondb_owner"
netlify env:set PGPASSWORD "npg_Gh5znmB4lokX"

# Set Authentication
netlify env:set SESSION_SECRET "Ehqesfa33ZJxHqh6izbuXWe9yjt2V6IFkY+FBXjwgsGqsecSIU/L8EvaUT+FQPDu57wPUX5Efs0s2gQiCeS02w=="

# Set Championship Configuration
netlify env:set CHAMPIONSHIP_MODE "true"
netlify env:set REAL_TIME_UPDATES "true"
netlify env:set MCP_SERVER_URL "https://blaze-intelligence.netlify.app/.netlify/functions"

echo "✅ Environment variables configured successfully!"
echo "🚀 Deploy with: netlify deploy --prod"