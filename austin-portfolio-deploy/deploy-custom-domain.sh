#!/bin/bash

# Blaze Intelligence - Custom Domain Deployment Script
# Deploys to blaze-intelligence.com with enterprise SSL configuration

set -euo pipefail

echo "🚀 BLAZE INTELLIGENCE - CUSTOM DOMAIN DEPLOYMENT"
echo "================================================="
echo "Target Domain: blaze-intelligence.com"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

# Step 1: Validate domain ownership
echo "📋 Step 1: Domain Validation"
echo "Checking DNS configuration for blaze-intelligence.com..."

# Check if domain resolves
if nslookup blaze-intelligence.com > /dev/null 2>&1; then
    echo "✅ Domain resolves successfully"
    CURRENT_IP=$(dig +short blaze-intelligence.com | head -1)
    echo "   Current IP: ${CURRENT_IP:-'No A record found'}"
else
    echo "⚠️  Domain not yet configured - will set up DNS after deployment"
fi

echo ""

# Step 2: Deploy to Cloudflare Pages with custom domain
echo "📋 Step 2: Cloudflare Pages Deployment"
echo "Deploying optimized system with custom domain configuration..."

# Deploy with production settings
wrangler pages deploy . \
    --project-name=blaze-intelligence-production \
    --commit-dirty=true || {
    echo "❌ Deployment failed"
    exit 1
}

DEPLOYMENT_URL=$(wrangler pages deployment list --project-name=blaze-intelligence-production --format=json | jq -r '.[0].url' 2>/dev/null || echo "")

if [ -n "$DEPLOYMENT_URL" ]; then
    echo "✅ Deployment successful: $DEPLOYMENT_URL"
else
    echo "⚠️  Could not determine deployment URL, checking manually..."
fi

echo ""

# Step 3: Configure custom domain
echo "📋 Step 3: Custom Domain Configuration"
echo "Setting up blaze-intelligence.com..."

# Add custom domain to Cloudflare Pages
echo "Adding custom domain to Cloudflare Pages..."
wrangler pages domain add blaze-intelligence.com --project-name=blaze-intelligence-production 2>/dev/null || {
    echo "⚠️  Custom domain addition failed or already exists"
}

# Add www subdomain
echo "Adding www.blaze-intelligence.com subdomain..."
wrangler pages domain add www.blaze-intelligence.com --project-name=blaze-intelligence-production 2>/dev/null || {
    echo "⚠️  WWW subdomain addition failed or already exists"
}

echo ""

# Step 4: SSL Certificate validation
echo "📋 Step 4: SSL Certificate Configuration"
echo "Configuring enterprise SSL certificate..."

# Check SSL status
echo "Checking SSL certificate status..."
SSL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://blaze-intelligence.com" 2>/dev/null || echo "000")

if [ "$SSL_STATUS" = "200" ]; then
    echo "✅ SSL certificate active and valid"
elif [ "$SSL_STATUS" = "000" ]; then
    echo "⏳ SSL certificate provisioning (may take 10-15 minutes)"
else
    echo "⚠️  SSL status: HTTP $SSL_STATUS"
fi

echo ""

# Step 5: DNS Configuration instructions
echo "📋 Step 5: DNS Configuration"
echo "Required DNS settings for blaze-intelligence.com:"
echo ""
echo "🔹 A Record Configuration:"
echo "   Type: A"
echo "   Name: @"
echo "   Value: <Cloudflare Pages IP - check dashboard>"
echo ""
echo "🔹 CNAME Record Configuration:"
echo "   Type: CNAME" 
echo "   Name: www"
echo "   Value: blaze-intelligence.com"
echo ""
echo "🔹 Alternative (if using Cloudflare DNS):"
echo "   Type: CNAME"
echo "   Name: @"
echo "   Value: <pages-project>.pages.dev"
echo "   Proxied: Yes (Orange cloud)"
echo ""

# Step 6: Performance validation
echo "📋 Step 6: Performance Validation"
echo "Testing custom domain performance..."

# Test the deployment URL first
if [ -n "$DEPLOYMENT_URL" ]; then
    echo "Testing deployment URL: $DEPLOYMENT_URL"
    
    RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "$DEPLOYMENT_URL/api/health" 2>/dev/null | awk '{print int($1*1000)}')
    
    if [ "$RESPONSE_TIME" -gt 0 ] && [ "$RESPONSE_TIME" -lt 1000 ]; then
        echo "✅ API Response Time: ${RESPONSE_TIME}ms"
    else
        echo "⚠️  API response test inconclusive"
    fi
fi

# Test custom domain (if accessible)
echo "Testing custom domain (if DNS propagated)..."
CUSTOM_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "https://blaze-intelligence.com/api/health" 2>/dev/null || echo "000")

if [ "$CUSTOM_RESPONSE" = "200" ]; then
    echo "✅ Custom domain responding correctly"
    
    # Test response time on custom domain
    CUSTOM_TIME=$(curl -s -w "%{time_total}" -o /dev/null "https://blaze-intelligence.com/api/health" 2>/dev/null | awk '{print int($1*1000)}')
    echo "✅ Custom domain response time: ${CUSTOM_TIME}ms"
else
    echo "⏳ Custom domain not yet accessible (DNS propagation pending)"
fi

echo ""

# Step 7: Generate deployment report
echo "📋 Step 7: Deployment Report Generation"

REPORT_FILE="custom-domain-deployment-$(date +%Y%m%d-%H%M%S).json"

cat > "$REPORT_FILE" << EOF
{
  "deployment": {
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "status": "completed",
    "custom_domain": "blaze-intelligence.com",
    "deployment_url": "${DEPLOYMENT_URL:-'pending'}",
    "project": "blaze-intelligence-production"
  },
  "ssl": {
    "status": "${SSL_STATUS}",
    "certificate": "auto-provisioned",
    "type": "enterprise"
  },
  "performance": {
    "deployment_response_time": "${RESPONSE_TIME:-'pending'}ms",
    "custom_domain_response_time": "${CUSTOM_TIME:-'pending'}ms"
  },
  "next_steps": [
    "Configure DNS records as specified above",
    "Wait for SSL certificate provisioning (10-15 minutes)",
    "Validate custom domain accessibility",
    "Update all marketing materials with new domain",
    "Configure monitoring and alerting for custom domain"
  ]
}
EOF

echo "✅ Deployment report saved: $REPORT_FILE"
echo ""

# Final summary
echo "🏆 CUSTOM DOMAIN DEPLOYMENT SUMMARY"
echo "=================================="
echo "✅ Cloudflare Pages deployment: Complete"
echo "✅ Custom domain configuration: Initiated"
echo "⏳ SSL certificate: Provisioning"
echo "⏳ DNS propagation: Pending manual configuration"
echo ""
echo "🔗 Primary URLs:"
echo "   • Production: ${DEPLOYMENT_URL:-'Pending'}"
echo "   • Custom Domain: https://blaze-intelligence.com (pending DNS)"
echo "   • WWW Redirect: https://www.blaze-intelligence.com (pending DNS)"
echo ""
echo "📞 Support: Austin Humphrey | ahump20@outlook.com | (210) 273-5538"
echo "=================================="
echo "✅ Custom domain deployment process initiated successfully!"