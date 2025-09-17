# Blaze Intelligence - Southern Sports Authority Platform
## Multi-Site Netlify Deployment Guide

### 🎯 Target Deployments

This platform deploys to three distinct Netlify sites:

1. **Primary Platform**: `blaze-intelligence.netlify.app`
2. **3D Universe**: `blaze-3d.netlify.app`
3. **Main Authority**: `blaze-intelligence-main.netlify.app`

### 🏗️ Project Structure

```
├── index.html              # Main landing page (Austin Humphrey authority)
├── app.html                # Dashboard application 
├── athlete-dashboard.html  # Athlete-specific dashboard
├── manifesto.html          # Platform manifesto
├── proof.html              # Proof of concept/credentials
├── demo-data.js            # Real sports data integration
├── api-integration.js      # API connectivity layer
├── netlify.toml            # Netlify configuration
├── _redirects              # URL routing and redirects
├── public/                 # Static assets and additional pages
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript modules
│   ├── assets/            # Images and media
│   ├── sports-intelligence.html
│   ├── pressure-dashboard.html
│   ├── analytics.html
│   └── [50+ additional pages]
├── server.js              # Development server (not deployed)
└── src/                   # Development source files
```

### 🔧 Configuration Files

#### netlify.toml
- Defines build settings and environment
- Sets up HTTP headers for performance and security
- Configures URL redirects for clean routing
- Maps API endpoints to Netlify functions (when available)

#### _redirects
- Provides clean URL routing (`/app` → `/app.html`)
- Maps public directory assets (`/css/*` → `/public/css/*`)
- Handles legacy URL redirects for SEO
- Fallback routing for SPA behavior

### 🚀 Deployment Process

#### Option 1: Git-Based Deployment (Recommended)

1. **Connect Repository to Netlify**
   ```bash
   # Ensure your repository is up to date
   git add .
   git commit -m "Deploy Blaze Intelligence Platform"
   git push origin main
   ```

2. **Configure Netlify Site Settings**
   - Build command: `echo 'Static deployment ready'`
   - Publish directory: `.` (root directory)
   - Node version: `18`

3. **Deploy to Multiple Sites**
   
   **Site 1: blaze-intelligence.netlify.app**
   - Primary platform with full feature set
   - All pages and functionality enabled
   
   **Site 2: blaze-3d.netlify.app**  
   - Focus on 3D visualizations and sports intelligence
   - Emphasis on `/sports-intelligence` and `/pressure-dashboard`
   
   **Site 3: blaze-intelligence-main.netlify.app**
   - Main authority site emphasizing Austin Humphrey expertise
   - Corporate/enterprise focused presentation

#### Option 2: Drag & Drop Deployment

1. **Prepare Deployment Package**
   ```bash
   npm run build:deployment
   ```

2. **Upload to Netlify Dashboard**
   - Create new site in Netlify dashboard
   - Drag the entire project folder
   - Netlify will automatically detect configuration

### 🔗 Navigation Structure

The platform supports clean URL routing:

```
/ → index.html (Main landing)
/app → app.html (Dashboard)
/sports-intelligence → public/sports-intelligence.html
/pressure-dashboard → public/pressure-dashboard.html
/analytics → public/analytics.html
/athlete-dashboard → athlete-dashboard.html
/manifesto → manifesto.html
/proof → proof.html
/neural-coach → public/neural-coach.html
/digital-combine → public/digital-combine.html
/nil → public/nil.html
/live-demo → public/live-demo.html
/enterprise-services → public/enterprise-services.html
```

### 📊 Sports Data Integration

The platform integrates real sports data through:

- **API Endpoints**: Configured in `demo-data.js` and `api-integration.js`
- **Data Sources**: NFL, MLB, NCAA with real-time updates
- **Fallback System**: Graceful degradation when APIs are unavailable
- **Caching Layer**: Optimized performance for repeated requests

#### Key Data Features:
- Live game scores and updates
- Team standings and statistics  
- Player performance metrics
- Pressure analytics and momentum tracking
- Austin Humphrey's insider insights and commentary

### 🎨 Brand & Design System

#### Austin Humphrey Authority Positioning:
- Former Texas Longhorn #20 running back
- Deep South sports expertise and insider knowledge
- SEC and Texas Football authority
- Championship-level analytics and insights

#### Brand Colors:
```css
--burnt-orange: #BF5700;  /* Texas Longhorn signature */
--texas-gold: #FFB81C;    /* Accent highlights */
--dark-navy: #0A192F;     /* Professional backgrounds */
--accent-cyan: #64FFDA;   /* Analytics highlights */
```

#### Typography:
- Primary: Inter (clean, professional)
- Monospace: JetBrains Mono (technical data)
- Display: Various weights for hierarchy

### 🔒 Security & Performance

#### Security Headers (Configured in netlify.toml):
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

#### Performance Optimizations:
- Static asset caching (31536000 seconds / 1 year)
- Optimized image formats and compression
- Minimized CSS and JavaScript bundles
- CDN delivery for external libraries

### 🧪 Testing & Validation

#### Pre-Deployment Checklist:
- [ ] All internal links resolve correctly
- [ ] CSS and JavaScript assets load properly
- [ ] Sports data APIs respond with fallback data
- [ ] Mobile responsive design functions correctly
- [ ] Page load speeds are optimized
- [ ] SEO metadata is properly configured

#### Post-Deployment Verification:
- [ ] Test all navigation links on each deployed site
- [ ] Verify sports data displays correctly
- [ ] Check mobile and desktop rendering
- [ ] Validate form submissions and interactive elements
- [ ] Confirm analytics tracking is operational

### 🔧 Build Scripts

The project includes several build scripts:

```bash
npm run start          # Development server
npm run dev            # Development with hot reload
npm run build          # Production build
npm run build:production # Optimized production build
npm run deploy:vercel  # Deploy to Vercel (alternative)
```

### 📝 Environment Variables

For production deployments, configure:

```
NODE_ENV=production
SPORTS_API_KEY=your_api_key_here
ANALYTICS_ID=your_analytics_id
```

### 🆘 Troubleshooting

#### Common Issues:

1. **404 Errors on Navigation**
   - Verify `_redirects` file is in root directory
   - Check that all referenced HTML files exist

2. **CSS/JS Not Loading**
   - Confirm asset paths in HTML files
   - Verify redirect rules for `/css/*` and `/js/*`

3. **API Calls Failing**
   - Check browser console for CORS errors
   - Verify API endpoints are accessible
   - Confirm fallback data is displaying

4. **Mobile Rendering Issues**
   - Test viewport meta tags
   - Verify responsive CSS breakpoints
   - Check touch interaction handlers

### 📞 Support & Maintenance

For deployment issues or updates:
- Check Netlify deployment logs
- Verify build settings and environment variables
- Test locally before deploying changes
- Monitor performance metrics post-deployment

---

## 🎯 Success Metrics

A successful deployment includes:
- All three sites loading correctly with working navigation
- Real sports data integration functioning
- Austin Humphrey positioning and expertise clearly presented
- Mobile-optimized responsive design across all devices
- Fast page load times and smooth user experience
- Professional presentation worthy of enterprise clients

This platform establishes Austin Humphrey as the definitive Southern Sports Authority with cutting-edge analytics and championship-level insights.