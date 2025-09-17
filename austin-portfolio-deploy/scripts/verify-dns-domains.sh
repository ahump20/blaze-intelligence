#!/bin/bash

# Blaze Intelligence DNS Verification Script
# Checks all domains and their DNS configuration status

echo "================================================"
echo "  Blaze Intelligence DNS Verification Tool"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# List of domains to verify
declare -a DOMAINS=(
  "blaze-intelligence.replit.app"
  "a4dc795e.blaze-intelligence.pages.dev"
  "blaze-3d.netlify.app"
  "new.express.adobe.com"
  "70d41e32.blaze-intelligence-platform.pages.dev"
  "j8r5k8b9jg.wixsite.com"
  "blaze-intelligence.netlify.app"
)

# Function to check DNS records
check_dns() {
  local domain=$1
  echo -e "${BLUE}Checking DNS for: $domain${NC}"
  echo "----------------------------------------"

  # Check A record
  echo -n "A Record: "
  A_RECORD=$(dig +short A $domain 2>/dev/null)
  if [ -z "$A_RECORD" ]; then
    echo -e "${YELLOW}No A record found${NC}"
  else
    echo -e "${GREEN}$A_RECORD${NC}"
  fi

  # Check CNAME record
  echo -n "CNAME Record: "
  CNAME_RECORD=$(dig +short CNAME $domain 2>/dev/null)
  if [ -z "$CNAME_RECORD" ]; then
    echo -e "${YELLOW}No CNAME record found${NC}"
  else
    echo -e "${GREEN}$CNAME_RECORD${NC}"
  fi

  # Check TXT records for verification
  echo -n "TXT Records: "
  TXT_RECORDS=$(dig +short TXT $domain 2>/dev/null)
  if [ -z "$TXT_RECORDS" ]; then
    echo -e "${YELLOW}No TXT records found${NC}"
  else
    echo -e "${GREEN}Found TXT records${NC}"
  fi

  # Check SSL certificate
  echo -n "SSL Certificate: "
  SSL_CHECK=$(echo | timeout 2 openssl s_client -connect $domain:443 -servername $domain 2>/dev/null | grep "Verify return code")
  if [[ $SSL_CHECK == *"ok"* ]]; then
    echo -e "${GREEN}Valid SSL certificate${NC}"
  else
    echo -e "${YELLOW}SSL certificate issue or timeout${NC}"
  fi

  # Check HTTP status
  echo -n "HTTP Status: "
  HTTP_STATUS=$(curl -Is --connect-timeout 5 https://$domain 2>/dev/null | head -1)
  if [[ $HTTP_STATUS == *"200"* ]] || [[ $HTTP_STATUS == *"301"* ]] || [[ $HTTP_STATUS == *"302"* ]]; then
    echo -e "${GREEN}$HTTP_STATUS${NC}"
  elif [ -z "$HTTP_STATUS" ]; then
    echo -e "${RED}No response (timeout)${NC}"
  else
    echo -e "${YELLOW}$HTTP_STATUS${NC}"
  fi

  # Check nameservers
  echo -n "Nameservers: "
  NS_RECORDS=$(dig +short NS $domain 2>/dev/null | head -2 | tr '\n' ' ')
  if [ -z "$NS_RECORDS" ]; then
    echo -e "${YELLOW}Using default/inherited nameservers${NC}"
  else
    echo -e "${GREEN}$NS_RECORDS${NC}"
  fi

  echo ""
}

# Function to generate DNS configuration suggestions
suggest_dns_config() {
  local domain=$1
  echo -e "${BLUE}Suggested DNS Configuration for $domain:${NC}"
  echo "----------------------------------------"

  # Determine platform and suggest configuration
  if [[ $domain == *"replit.app"* ]]; then
    echo "Platform: Replit"
    echo "Add these DNS records at your registrar:"
    echo "  CNAME  @     replit.com"
    echo "  CNAME  www   replit.com"
    echo "  TXT    @     replit-verify=<your-token>"
  elif [[ $domain == *"pages.dev"* ]]; then
    echo "Platform: Cloudflare Pages"
    echo "Add these DNS records:"
    echo "  CNAME  @     $domain"
    echo "  TXT    _cf-custom-hostname  $domain"
  elif [[ $domain == *"netlify.app"* ]]; then
    echo "Platform: Netlify"
    echo "Add these DNS records:"
    echo "  CNAME  @     $domain"
    echo "  CNAME  www   $domain"
  elif [[ $domain == *"adobe.com"* ]]; then
    echo "Platform: Adobe Express"
    echo "This is an Adobe-hosted domain"
    echo "Verification handled through Adobe account"
  elif [[ $domain == *"wixsite.com"* ]]; then
    echo "Platform: Wix"
    echo "This is a Wix-hosted subdomain"
    echo "Configure through Wix dashboard"
  fi

  echo ""
}

# Function to test connectivity
test_connectivity() {
  local domain=$1
  echo -e "${BLUE}Testing connectivity for $domain:${NC}"
  echo "----------------------------------------"

  # Ping test (3 packets)
  echo -n "Ping Test: "
  if ping -c 1 -W 2 $domain > /dev/null 2>&1; then
    echo -e "${GREEN}Responsive${NC}"
  else
    echo -e "${YELLOW}Not pingable (may be blocked)${NC}"
  fi

  # Traceroute (first 5 hops)
  echo "Route (first 5 hops):"
  traceroute -m 5 -w 2 $domain 2>/dev/null | head -6 | tail -5

  echo ""
}

# Main execution
echo "Starting DNS verification for all Blaze Intelligence domains..."
echo ""

# Summary counters
VERIFIED=0
PENDING=0
FAILED=0

# Check each domain
for domain in "${DOMAINS[@]}"; do
  echo "================================================"
  echo " Domain: $domain"
  echo "================================================"

  check_dns "$domain"

  # Determine status
  HTTP_STATUS=$(curl -Is --connect-timeout 5 https://$domain 2>/dev/null | head -1)
  if [[ $HTTP_STATUS == *"200"* ]]; then
    echo -e "${GREEN}✓ Status: VERIFIED${NC}"
    ((VERIFIED++))
  elif [[ $HTTP_STATUS == *"301"* ]] || [[ $HTTP_STATUS == *"302"* ]]; then
    echo -e "${YELLOW}⚠ Status: REDIRECTING (likely OK)${NC}"
    ((VERIFIED++))
  elif [ -z "$HTTP_STATUS" ]; then
    echo -e "${RED}✗ Status: UNREACHABLE${NC}"
    suggest_dns_config "$domain"
    ((FAILED++))
  else
    echo -e "${YELLOW}⚠ Status: PENDING VERIFICATION${NC}"
    suggest_dns_config "$domain"
    ((PENDING++))
  fi

  echo ""
  sleep 1  # Brief pause between checks
done

# Summary Report
echo "================================================"
echo " DNS Verification Summary"
echo "================================================"
echo -e "${GREEN}Verified: $VERIFIED${NC}"
echo -e "${YELLOW}Pending: $PENDING${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

# Generate action items
if [ $PENDING -gt 0 ] || [ $FAILED -gt 0 ]; then
  echo "Action Items:"
  echo "-------------"
  echo "1. Log into your domain registrar(s)"
  echo "2. Add the suggested DNS records above"
  echo "3. Wait 15-30 minutes for DNS propagation"
  echo "4. Run this script again to verify"
  echo "5. Complete platform-specific verification steps"
  echo ""
  echo "Useful DNS tools:"
  echo "- Check propagation: https://dnschecker.org"
  echo "- DNS lookup: https://mxtoolbox.com/DNSLookup.aspx"
  echo "- SSL test: https://www.ssllabs.com/ssltest/"
fi

echo ""
echo "DNS verification complete!"
echo "================================================"

# Export results to JSON for programmatic use
cat > dns-verification-results.json << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "summary": {
    "verified": $VERIFIED,
    "pending": $PENDING,
    "failed": $FAILED
  },
  "domains": [
EOF

first=true
for domain in "${DOMAINS[@]}"; do
  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> dns-verification-results.json
  fi

  HTTP_STATUS=$(curl -Is --connect-timeout 5 https://$domain 2>/dev/null | head -1)
  STATUS="unknown"
  if [[ $HTTP_STATUS == *"200"* ]] || [[ $HTTP_STATUS == *"301"* ]] || [[ $HTTP_STATUS == *"302"* ]]; then
    STATUS="verified"
  elif [ -z "$HTTP_STATUS" ]; then
    STATUS="failed"
  else
    STATUS="pending"
  fi

  cat >> dns-verification-results.json << EOF
    {
      "domain": "$domain",
      "status": "$STATUS",
      "http_response": "$(echo $HTTP_STATUS | tr -d '\r\n')"
    }
EOF
done

cat >> dns-verification-results.json << EOF

  ]
}
EOF

echo "Results exported to: dns-verification-results.json"