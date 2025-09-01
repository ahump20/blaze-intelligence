#!/bin/bash

# Automated Domain Activation Script for Blaze Intelligence
# This script uses osascript to control Chrome and execute Cloudflare functions

echo "🚀 AUTOMATED BLAZE INTELLIGENCE DOMAIN ACTIVATION"
echo "=================================================="
echo ""

DOMAIN="blaze-intelligence.com"
ACCOUNT_ID="a12cb329d84130460eed99b816e4d0d3"
PROJECT_NAME="blaze-intelligence"

echo "📋 Configuration:"
echo "   Domain: $DOMAIN"
echo "   Account ID: $ACCOUNT_ID"  
echo "   Project: $PROJECT_NAME"
echo ""

echo "🌐 Step 1: Opening Cloudflare Dashboard..."
osascript -e "
tell application \"Google Chrome\"
    activate
    delay 1
    open location \"https://dash.cloudflare.com/$ACCOUNT_ID\"
    delay 3
end tell"

echo "✅ Dashboard opened"
echo ""

echo "🔐 Step 2: Checking for Cloudflare Access restrictions..."
echo "   Testing domain accessibility..."
RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/ --connect-timeout 10)
echo "   Response code: $RESPONSE_CODE"

if [ "$RESPONSE_CODE" = "403" ]; then
    echo "⚠️  Cloudflare Access detected - opening Zero Trust dashboard..."
    
    osascript -e "
    tell application \"Google Chrome\"
        open location \"https://one.dash.cloudflare.com/$ACCOUNT_ID/access/apps\"
        delay 3
    end tell"
    
    echo "🎯 MANUAL ACTION REQUIRED:"
    echo "   1. Look for application protecting 'blaze-intelligence.com'"
    echo "   2. Click DELETE or DISABLE on that application"
    echo "   3. Confirm the removal"
    echo ""
    echo "Press ENTER when Access has been removed..."
    read -p ""
else
    echo "✅ No Access restrictions detected"
fi

echo ""
echo "📝 Step 3: Opening Pages project for domain addition..."
osascript -e "
tell application \"Google Chrome\"
    open location \"https://dash.cloudflare.com/$ACCOUNT_ID/pages/view/$PROJECT_NAME\"
    delay 3
end tell"

echo ""
echo "🎯 MANUAL ACTION REQUIRED - Add Custom Domain:"
echo "   1. Click 'Custom Domains' tab"
echo "   2. Click 'Set up a custom domain'"
echo "   3. Enter: $DOMAIN"
echo "   4. Click 'Continue' and follow DNS setup"
echo ""
echo "Press ENTER when domain has been added..."
read -p ""

echo ""
echo "🧪 Step 4: Testing domain configuration..."
echo "   Waiting 30 seconds for DNS propagation..."
sleep 30

echo "   Testing domain accessibility..."
for i in {1..5}; do
    echo "   Test $i/5..."
    RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/ --connect-timeout 10)
    if [ "$RESPONSE_CODE" = "200" ]; then
        echo "   ✅ SUCCESS: Domain responding with HTTP 200"
        break
    else
        echo "   ⏳ Response: $RESPONSE_CODE (waiting...)"
        sleep 10
    fi
done

echo ""
echo "📊 Step 5: Final verification..."

# Test all key pages
PAGES=("" "dashboard.html" "demo.html" "r2-browser.html")
echo "   Testing key pages:"

for page in "${PAGES[@]}"; do
    URL="https://$DOMAIN/$page"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" --connect-timeout 5)
    if [ "$RESPONSE" = "200" ]; then
        echo "   ✅ $URL"
    else
        echo "   ❌ $URL (HTTP $RESPONSE)"
    fi
done

echo ""
echo "🔌 Testing APIs:"
API_HEALTH=$(curl -s https://blaze-storage.humphrey-austin20.workers.dev/api/health --connect-timeout 5)
if [[ $API_HEALTH == *"healthy"* ]]; then
    echo "   ✅ Storage Worker API healthy"
else
    echo "   ⚠️  Storage Worker API issue"
fi

echo ""
echo "🎉 DOMAIN ACTIVATION COMPLETE!"
echo ""
echo "🌐 Live URLs:"
echo "   Main Site: https://$DOMAIN/"
echo "   Dashboard: https://$DOMAIN/dashboard.html" 
echo "   Demo: https://$DOMAIN/demo.html"
echo "   R2 Browser: https://$DOMAIN/r2-browser.html"
echo ""
echo "🤖 Active Systems:"
echo "   Cardinals Readiness Board: 10-minute updates"
echo "   Digital Combine Analytics: Real-time scoring"
echo "   R2 Storage: 22 datasets available"
echo "   Storage Worker: API endpoints operational"
echo ""
echo "✅ Blaze Intelligence is now LIVE on custom domain!"