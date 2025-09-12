/* Blaze Intelligence SPA Router - Championship Navigation System
 * Handles seamless client-side routing for /site/* paths
 * Optimized for mobile performance with preloading and caching
 */
class BlazeRouter {
  constructor() {
    this.routes = new Map();
    this.cache = new Map();
    this.currentPath = '';
    this.isLoading = false;
    
    // Championship-level routes
    this.registerRoutes();
    this.init();
  }
  
  registerRoutes() {
    // Core championship pages
    this.routes.set('/', { 
      file: '/site/index.html', 
      title: 'Blaze Intelligence — SEC/Texas Baseball & Football Analytics' 
    });
    this.routes.set('/quantum-platform', { 
      file: '/site/quantum-platform.html', 
      title: 'Quantum Platform — Blaze Intelligence' 
    });
    this.routes.set('/nil-calculator', { 
      file: '/site/nil-calculator.html', 
      title: 'NIL Engine — Blaze Intelligence' 
    });
    this.routes.set('/orioles-executive-intelligence', { 
      file: '/site/orioles-executive-intelligence.html', 
      title: 'Cardinals Executive Intelligence — Blaze Intelligence' 
    });
    this.routes.set('/live-demo', { 
      file: '/site/live-demo.html', 
      title: 'Live Demo — Blaze Intelligence' 
    });
    this.routes.set('/get-started', { 
      file: '/site/get-started.html', 
      title: 'Get Started — Blaze Intelligence' 
    });
    this.routes.set('/status', { 
      file: '/site/status.html', 
      title: 'System Status — Blaze Intelligence' 
    });
    
    // Legacy dashboard compatibility
    this.routes.set('/dashboard', { 
      file: '/dashboard.html', 
      title: 'Championship Dashboard — Blaze Intelligence' 
    });
  }
  
  init() {
    // Handle browser navigation
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.path) {
        this.navigateTo(e.state.path, false);
      }
    });
    
    // Intercept all navigation clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) {
        return; // External links, email, or anchors
      }
      
      // Handle internal navigation
      if (this.routes.has(href) || href.startsWith('/site/')) {
        e.preventDefault();
        this.navigateTo(href);
      }
    });
    
    // Load initial route
    const currentPath = window.location.pathname;
    if (currentPath !== '/' && (this.routes.has(currentPath) || currentPath.startsWith('/site/'))) {
      this.navigateTo(currentPath, false);
    }
    
    // Preload critical pages for championship performance
    this.preloadCriticalPages();
  }
  
  async navigateTo(path, updateHistory = true) {
    if (this.isLoading || path === this.currentPath) return;
    
    this.isLoading = true;
    this.showLoadingState();
    
    try {
      const content = await this.loadPage(path);
      if (content) {
        this.renderPage(content, path);
        
        if (updateHistory) {
          history.pushState({ path }, '', path);
        }
        
        this.currentPath = path;
        
        // Update page title
        const route = this.routes.get(path);
        if (route && route.title) {
          document.title = route.title;
        }
        
        // Scroll to top for new page
        window.scrollTo(0, 0);
        
        // Reinitialize Three.js heroes if present
        this.reinitializeHeroes();
        
        // Track navigation for analytics
        this.trackPageView(path);
      }
    } catch (error) {
      console.error('Navigation failed:', error);
      this.showErrorState(path);
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }
  
  async loadPage(path) {
    // Check cache first
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }
    
    const route = this.routes.get(path);
    const filePath = route ? route.file : path;
    
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load ${filePath}: ${response.status}`);
      }
      
      const content = await response.text();
      
      // Cache for championship performance
      this.cache.set(path, content);
      
      return content;
    } catch (error) {
      console.error('Failed to load page:', error);
      return null;
    }
  }
  
  renderPage(content, path) {
    // Extract content between <div class="container"> tags or use full body
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Get the main content area
    const container = doc.querySelector('.container') || doc.body;
    const nav = doc.querySelector('.nav');
    const hero = doc.querySelector('#hero');
    const scripts = Array.from(doc.querySelectorAll('script'));
    
    // Update navigation if present
    if (nav) {
      const currentNav = document.querySelector('.nav');
      if (currentNav) {
        currentNav.replaceWith(nav.cloneNode(true));
      }
    }
    
    // Update hero canvas if present
    if (hero) {
      const currentHero = document.querySelector('#hero');
      if (currentHero) {
        currentHero.replaceWith(hero.cloneNode(true));
      }
    }
    
    // Update main container
    const currentContainer = document.querySelector('.container');
    if (currentContainer && container) {
      currentContainer.replaceWith(container.cloneNode(true));
    }
    
    // Execute page-specific scripts
    scripts.forEach(script => {
      if (script.src) {
        // External scripts - check if already loaded
        if (!document.querySelector(`script[src="${script.src}"]`)) {
          const newScript = document.createElement('script');
          newScript.src = script.src;
          document.head.appendChild(newScript);
        }
      } else if (script.textContent && !script.textContent.includes('BlazeRouter')) {
        // Inline scripts - execute in new context
        try {
          eval(script.textContent);
        } catch (e) {
          console.warn('Script execution failed:', e);
        }
      }
    });
  }
  
  reinitializeHeroes() {
    // Reinitialize Three.js heroes for new pages
    const heroCanvas = document.querySelector('#hero');
    if (heroCanvas && window.THREE) {
      // Clear existing renderer
      if (heroCanvas._blazeRenderer) {
        heroCanvas._blazeRenderer.dispose();
      }
      
      // Reinitialize hero animation
      setTimeout(() => {
        if (window.initializeHero) {
          window.initializeHero();
        } else {
          // Load hero script if not available
          const script = document.createElement('script');
          script.src = '/assets/hero.js';
          document.head.appendChild(script);
        }
      }, 100);
    }
  }
  
  showLoadingState() {
    // Create subtle loading indicator
    const loader = document.createElement('div');
    loader.id = 'spa-loader';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, #BF5700, #ff7a1a);
      z-index: 9999;
      animation: blazeLoad 1s ease-in-out infinite;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#blaze-loader-style')) {
      const style = document.createElement('style');
      style.id = 'blaze-loader-style';
      style.textContent = `
        @keyframes blazeLoad {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(loader);
  }
  
  hideLoadingState() {
    const loader = document.querySelector('#spa-loader');
    if (loader) {
      loader.remove();
    }
  }
  
  showErrorState(path) {
    const container = document.querySelector('.container');
    if (container) {
      container.innerHTML = `
        <div class="card" style="text-align:center;margin-top:40px;border-color:var(--sport-cfb)">
          <div class="h1" style="color:var(--sport-cfb)">Championship Timeout</div>
          <p class="p">Unable to load ${path}. The system is checking routes and will be back shortly.</p>
          <button onclick="location.reload()" class="cta" style="margin-top:20px">🔄 Reload Platform</button>
        </div>
      `;
    }
  }
  
  async preloadCriticalPages() {
    // Preload high-traffic championship pages
    const criticalPages = ['/quantum-platform', '/nil-calculator', '/live-demo'];
    
    for (const page of criticalPages) {
      setTimeout(async () => {
        try {
          await this.loadPage(page);
        } catch (e) {
          // Silent preload failure
        }
      }, 1000 + Math.random() * 2000); // Staggered preloading
    }
  }
  
  trackPageView(path) {
    // Track championship navigation for analytics
    if (window.gtag) {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path,
        page_title: document.title
      });
    }
    
    // Custom analytics for Blaze Intelligence
    if (window.blazeAnalytics) {
      window.blazeAnalytics.track('navigation', {
        path,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      });
    }
  }
  
  // Public API for manual navigation
  go(path) {
    this.navigateTo(path);
  }
  
  back() {
    history.back();
  }
  
  forward() {
    history.forward();
  }
  
  // Cache management
  clearCache() {
    this.cache.clear();
  }
  
  preload(path) {
    return this.loadPage(path);
  }
}

// Initialize championship router when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.blazeRouter = new BlazeRouter();
  });
} else {
  window.blazeRouter = new BlazeRouter();
}

// Global navigation helper
window.navigateTo = (path) => {
  if (window.blazeRouter) {
    window.blazeRouter.go(path);
  }
};