# DNS Configuration Guide for Blaze Intelligence Domains

## Current Domains Requiring Verification

### Primary Domains
1. **blaze-intelligence.replit.app** ✅ (Active)
2. **a4dc795e.blaze-intelligence.pages.dev** 🔄 (Verifying)
3. **blaze-3d.netlify.app** 🔄 (Verifying)
4. **new.express.adobe.com** 🔄 (Verifying)
5. **70d41e32.blaze-intelligence-platform.pages.dev** 🔄 (Verifying)
6. **j8r5k8b9jg.wixsite.com** 🔄 (Verifying)
7. **blaze-intelligence.netlify.app** 🔄 (Verifying)

## DNS Configuration Steps

### For Custom Domain Setup

#### Step 1: Add CNAME Records
For each domain, add the following DNS records at your domain registrar:

```dns
# For Replit Apps
CNAME   @   blaze-intelligence.replit.app
CNAME   www blaze-intelligence.replit.app

# For Cloudflare Pages
CNAME   @   a4dc795e.blaze-intelligence.pages.dev
TXT     _cf-custom-hostname   a4dc795e.blaze-intelligence.pages.dev

# For Netlify
CNAME   @   blaze-intelligence.netlify.app
CNAME   www blaze-intelligence.netlify.app
```

#### Step 2: Add Verification Records

##### Replit Verification
```dns
TXT   _replit-verify   <verification-token-from-replit>
```

##### Cloudflare Pages Verification
```dns
TXT   _cf-pages   <verification-token-from-cloudflare>
```

##### Netlify Verification
```dns
TXT   _netlify   <verification-token-from-netlify>
```

### For Subdomain Configuration

#### blaze-3d.netlify.app
```dns
CNAME   blaze-3d   blaze-3d.netlify.app
```

#### Express Adobe Integration
```dns
CNAME   new.express   new.express.adobe.com
TXT     _adobe-verify   <adobe-verification-token>
```

## Verification Process

### 1. Replit Domain Verification
```bash
# Check DNS propagation
dig blaze-intelligence.replit.app
dig TXT _replit-verify.blaze-intelligence.replit.app

# Verify in Replit Dashboard
# Go to Replit → Project Settings → Custom Domains → Verify
```

### 2. Cloudflare Pages Verification
```bash
# Check CNAME record
dig a4dc795e.blaze-intelligence.pages.dev

# Verify custom hostname
dig TXT _cf-custom-hostname.blaze-intelligence.pages.dev

# Check SSL status
curl -I https://a4dc795e.blaze-intelligence.pages.dev
```

### 3. Netlify Verification
```bash
# Check primary domain
dig blaze-intelligence.netlify.app

# Check DNS configuration
dig CNAME www.blaze-intelligence.netlify.app

# Verify SSL certificate
openssl s_client -connect blaze-intelligence.netlify.app:443 -servername blaze-intelligence.netlify.app
```

## DNS Settings for Performance

### Recommended DNS Configuration

```dns
# A Records for root domain (if not using CNAME flattening)
A   @   76.76.21.21  # Cloudflare IPv4
A   @   76.76.21.22  # Cloudflare IPv4 backup

# AAAA Records for IPv6
AAAA   @   2606:4700:3030::6815:1  # Cloudflare IPv6
AAAA   @   2606:4700:3031::6815:1  # Cloudflare IPv6 backup

# MX Records (if needed for email)
MX   10   mx1.emailprovider.com
MX   20   mx2.emailprovider.com

# SPF Record for email authentication
TXT   @   "v=spf1 include:_spf.emailprovider.com ~all"

# CAA Records for SSL certificate authority
CAA   0   issue   "letsencrypt.org"
CAA   0   issuewild   "letsencrypt.org"
```

### TTL Recommendations

- **A/AAAA Records**: 300 seconds (5 minutes) during setup, 3600 (1 hour) after verification
- **CNAME Records**: 300 seconds during setup, 3600 after verification
- **TXT Records**: 300 seconds for verification, can increase to 86400 (24 hours) after
- **MX Records**: 3600 seconds (1 hour)

## Multi-Platform Integration

### Unified Domain Strategy

1. **Primary Domain**: `blazeintelligence.com` (to be acquired)
   - Points to main Netlify deployment

2. **Subdomains by Function**:
   - `app.blazeintelligence.com` → Replit app
   - `3d.blazeintelligence.com` → 3D visualization platform
   - `api.blazeintelligence.com` → API endpoints
   - `cdn.blazeintelligence.com` → Static assets

3. **Development Domains**:
   - `dev.blazeintelligence.com` → Development environment
   - `staging.blazeintelligence.com` → Staging environment

## SSL/TLS Configuration

### Certificate Setup
1. **Let's Encrypt** (Free, auto-renewal)
   - Supported by Netlify, Cloudflare, Replit

2. **Cloudflare SSL**
   - Full (strict) mode recommended
   - Edge certificates automatic

3. **HSTS Headers**
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## Monitoring & Validation

### DNS Health Checks

```bash
# Complete DNS audit
#!/bin/bash

DOMAINS=(
  "blaze-intelligence.replit.app"
  "a4dc795e.blaze-intelligence.pages.dev"
  "blaze-3d.netlify.app"
  "blaze-intelligence.netlify.app"
)

for domain in "${DOMAINS[@]}"; do
  echo "Checking $domain..."

  # Check A record
  dig +short A $domain

  # Check CNAME
  dig +short CNAME $domain

  # Check SSL
  echo | openssl s_client -connect $domain:443 -servername $domain 2>/dev/null | grep "Verify return code"

  # Check HTTP status
  curl -Is https://$domain | head -1

  echo "---"
done
```

### Uptime Monitoring Services

1. **UptimeRobot** (Free tier available)
2. **Pingdom** (More detailed analytics)
3. **StatusCake** (Good free tier)

## Troubleshooting

### Common Issues & Solutions

1. **"Verification Pending" Status**
   - DNS propagation can take 24-48 hours
   - Use `nslookup` or `dig` to verify records
   - Clear DNS cache: `sudo dscacheutil -flushcache` (Mac)

2. **SSL Certificate Errors**
   - Ensure CAA records allow certificate authority
   - Check for mixed content (HTTP resources on HTTPS page)
   - Verify domain ownership through DNS TXT records

3. **CNAME Flattening Issues**
   - Some registrars don't support CNAME at root
   - Use ALIAS or ANAME records if available
   - Otherwise use A records with IP addresses

## Next Steps

1. **Immediate Actions**:
   - [ ] Add verification TXT records for all pending domains
   - [ ] Configure CNAME records for primary domains
   - [ ] Set up SSL certificates
   - [ ] Test DNS propagation

2. **Within 24 Hours**:
   - [ ] Verify all domains in respective platforms
   - [ ] Set up monitoring for all endpoints
   - [ ] Configure email authentication (SPF, DKIM, DMARC)

3. **Within 1 Week**:
   - [ ] Acquire primary domain (blazeintelligence.com)
   - [ ] Consolidate all services under unified domain
   - [ ] Implement CDN for static assets
   - [ ] Set up automated SSL renewal

## Support Contacts

- **Replit Support**: support@replit.com
- **Cloudflare Pages**: Via dashboard support ticket
- **Netlify Support**: Via dashboard or support@netlify.com
- **DNS Propagation Check**: https://dnschecker.org

---

*Last Updated: September 2024*
*Configuration valid for Blaze Intelligence multi-platform deployment*