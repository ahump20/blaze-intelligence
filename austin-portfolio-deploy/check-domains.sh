#!/bin/bash

echo "=== Domain Connectivity Check ==="
echo

domains=(
  "blaze-intelligence.replit.app"
  "blaze-3d.netlify.app"
  "blaze-intelligence.netlify.app"
  "70d41e32.blaze-intelligence-platform.pages.dev"
  "a4dc795e.blaze-intelligence.pages.dev"
  "j8r5k8b9jg.wixsite.com"
)

for domain in "${domains[@]}"; do
  echo "Testing $domain:"
  
  # Check HTTP status
  status=$(curl -s -o /dev/null -w "%{http_code}" -L "https://$domain" 2>/dev/null || echo "Failed")
  echo "  HTTPS Status: $status"
  
  # Check DNS
  dns_result=$(nslookup "$domain" 2>&1 | grep -A1 "Name:" | tail -1 | grep -oE "Address: .+" || echo "  DNS: Not resolved")
  echo "  $dns_result"
  
  echo
done
