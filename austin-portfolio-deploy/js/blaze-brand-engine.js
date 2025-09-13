/**
 * Blaze Intelligence Unified Brand Consistency Engine
 * Ensures championship-level brand standards across all touchpoints
 * Real-time brand compliance and enhancement system
 */

class BlazeBrandEngine {
    constructor() {
        this.brandConfig = {
            // Core brand identity
            identity: {
                companyName: 'Blaze Intelligence',
                tagline: 'Intelligence. Integrity. Innovation.',
                logoIcon: '🔥',
                logoText: 'Blaze Intelligence'
            },
            
            // Championship color system
            colors: {
                primary: {
                    blazeOrange: '#BF5700',
                    cardinalBlue: '#9BCBEB'
                },
                secondary: {
                    blazeNavy: '#0A192F',
                    grizzlyTeal: '#00B2A9'
                },
                functional: {
                    success: '#10B981',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    info: '#3B82F6'
                },
                neutral: {
                    white: '#FFFFFF',
                    gray100: '#F3F4F6',
                    gray800: '#1F2937',
                    gray900: '#111827'
                }
            },
            
            // Typography system
            typography: {
                primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                secondary: 'JetBrains Mono, monospace',
                scale: {
                    xs: '0.75rem',
                    sm: '0.875rem',
                    base: '1rem',
                    lg: '1.125rem',
                    xl: '1.25rem',
                    '2xl': '1.5rem',
                    '3xl': '1.875rem',
                    '4xl': '2.25rem'
                }
            },
            
            // Team examples (canonical)
            teams: {
                mlb: ['Cardinals', 'Orioles'],
                nfl: ['Titans'],
                ncaa: ['Longhorns'],
                nba: ['Grizzlies']
            },
            
            // Approved metrics and messaging
            messaging: {
                costSavings: '67-80% vs competitor pricing',
                responseTime: 'Real-time processing',
                dataVolume: 'Extensive data sources',
                accuracy: 'Advanced analytics',
                platform: 'Championship Intelligence'
            },
            
            // Navigation structure
            navigation: {
                primary: [
                    { label: 'Home', href: '/' },
                    { label: 'Executive Intelligence', href: '/orioles-executive-intelligence.html' },
                    { label: 'Live Analytics', href: '/live-demo.html' },
                    { label: 'NIL Engine', href: '/nil-calculator.html' },
                    { label: 'Dashboard', href: '/dashboard.html' },
                    { label: 'API Status', href: '/status.html' },
                    { label: 'Get Started', href: '/get-started.html' }
                ],
                sports: {
                    'College Football': [{ label: 'Longhorns Intelligence', href: '/longhorns-intelligence.html' }],
                    'NFL': [{ label: 'Titans Intelligence', href: '/titans-intelligence.html' }],
                    'MLB': [
                        { label: 'Cardinals Intelligence', href: '/cardinals-intelligence.html' },
                        { label: 'Blaze Vision', href: 'https://ahump20.github.io/BI/', external: true }
                    ]
                }
            }
        };
        
        this.brandViolations = [];
        this.appliedEnhancements = [];
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.enforceStandards());
        } else {
            this.enforceStandards();
        }
        
        // Monitor for dynamic changes
        this.setupBrandMonitoring();
        
        // Initialize CSS custom properties
        this.injectBrandVariables();
    }
    
    /**
     * Enforce all brand standards across the page
     */
    enforceStandards() {
        console.log('🔥 Brand Engine: Enforcing championship standards...');
        
        this.brandViolations = [];
        this.appliedEnhancements = [];
        
        // Core brand enforcement
        this.enforceLogoStandards();
        this.enforceColorStandards();
        this.enforceTypographyStandards();
        this.enforceNavigationStandards();
        this.enforceMessagingStandards();
        this.enforceSeasonStandards();
        
        // Apply enhancements
        this.generateBrandReport();
    }
    
    /**
     * Inject CSS custom properties for consistent theming
     */
    injectBrandVariables() {
        const style = document.createElement('style');
        style.id = 'blaze-brand-variables';
        
        const cssVars = `
            :root {
                /* Primary Colors */
                --blaze-orange: ${this.brandConfig.colors.primary.blazeOrange};
                --blaze-blue: ${this.brandConfig.colors.primary.cardinalBlue};
                
                /* Secondary Colors */
                --blaze-navy: ${this.brandConfig.colors.secondary.blazeNavy};
                --blaze-teal: ${this.brandConfig.colors.secondary.grizzlyTeal};
                
                /* Functional Colors */
                --success: ${this.brandConfig.colors.functional.success};
                --warning: ${this.brandConfig.colors.functional.warning};
                --error: ${this.brandConfig.colors.functional.error};
                --info: ${this.brandConfig.colors.functional.info};
                
                /* Typography */
                --font-primary: ${this.brandConfig.typography.primary};
                --font-secondary: ${this.brandConfig.typography.secondary};
                
                /* Brand gradients */
                --gradient-primary: linear-gradient(135deg, var(--blaze-orange), #FF8C00);
                --gradient-secondary: linear-gradient(135deg, var(--blaze-blue), #7DD3FC);
                --gradient-championship: linear-gradient(135deg, var(--blaze-orange), var(--blaze-blue));
            }
            
            /* Championship button styles */
            .btn-championship {
                background: var(--gradient-primary);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                font-weight: 600;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .btn-championship:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(191, 87, 0, 0.3);
            }
            
            /* Executive card styles */
            .card-executive {
                background: rgba(26, 26, 46, 0.9);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(191, 87, 0, 0.3);
                border-radius: 1rem;
                padding: 1.5rem;
                transition: all 0.3s ease;
            }
            
            .card-executive:hover {
                border-color: var(--blaze-orange);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            /* Championship animations */
            @keyframes blazePulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }
            
            .blaze-pulse {
                animation: blazePulse 2s infinite;
            }
        `;
        
        style.textContent = cssVars;
        
        // Remove existing and add new
        const existing = document.getElementById('blaze-brand-variables');
        if (existing) existing.remove();
        
        document.head.appendChild(style);
    }
    
    /**
     * Enforce logo standards
     */
    enforceLogoStandards() {
        // Fix logo icons
        const logoIcons = document.querySelectorAll(
            '.nav-logo-icon, .logo-icon, [class*="logo-icon"], [data-logo]'
        );
        
        logoIcons.forEach(icon => {
            const currentText = icon.textContent.trim();
            if (currentText === 'B' || currentText === 'BI' || !currentText) {
                icon.textContent = this.brandConfig.identity.logoIcon;
                this.appliedEnhancements.push({
                    type: 'logo-icon',
                    element: icon,
                    before: currentText,
                    after: this.brandConfig.identity.logoIcon
                });
            }
        });
        
        // Fix company name
        const brandTexts = document.querySelectorAll(
            '.nav-logo-text, .brand-text, [class*="brand"], [data-brand]'
        );
        
        brandTexts.forEach(text => {
            const currentContent = text.textContent;
            if (currentContent.includes('B Blaze Intelligence') || currentContent.includes('AMSI')) {
                const newContent = currentContent
                    .replace(/B Blaze Intelligence/g, this.brandConfig.identity.companyName)
                    .replace(/AMSI/g, this.brandConfig.identity.companyName);
                
                text.textContent = newContent;
                this.appliedEnhancements.push({
                    type: 'brand-name',
                    element: text,
                    before: currentContent,
                    after: newContent
                });
            }
        });
    }
    
    /**
     * Enforce color standards
     */
    enforceColorStandards() {
        // Update deprecated color references
        const elementsWithStyle = document.querySelectorAll('[style]');
        
        elementsWithStyle.forEach(element => {
            let style = element.getAttribute('style');
            let updated = false;
            
            // Color mappings
            const colorMappings = {
                '#bf5700': 'var(--blaze-orange)',
                '#BF5700': 'var(--blaze-orange)',
                '#9bcbeb': 'var(--blaze-blue)',
                '#9BCBEB': 'var(--blaze-blue)',
                '#0a192f': 'var(--blaze-navy)',
                '#0A192F': 'var(--blaze-navy)'
            };
            
            Object.entries(colorMappings).forEach(([old, replacement]) => {
                if (style.includes(old)) {
                    style = style.replace(new RegExp(old, 'g'), replacement);
                    updated = true;
                }
            });
            
            if (updated) {
                element.setAttribute('style', style);
                this.appliedEnhancements.push({
                    type: 'color-standardization',
                    element: element
                });
            }
        });
    }
    
    /**
     * Enforce typography standards
     */
    enforceTypographyStandards() {
        // Ensure primary font is applied
        const bodyFont = getComputedStyle(document.body).fontFamily;
        if (!bodyFont.includes('Inter')) {
            document.body.style.fontFamily = this.brandConfig.typography.primary;
            this.appliedEnhancements.push({
                type: 'typography',
                element: document.body,
                enhancement: 'Applied primary font family'
            });
        }
        
        // Apply championship typography classes
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            if (!heading.style.fontFamily) {
                heading.style.fontFamily = this.brandConfig.typography.primary;
            }
        });
    }
    
    /**
     * Enforce navigation standards
     */
    enforceNavigationStandards() {
        const navContainers = document.querySelectorAll('nav, .nav, [class*="navigation"]');
        
        navContainers.forEach(nav => {
            // Check for proper Blaze Vision integration
            const blazeVisionExists = nav.querySelector('a[href*="ahump20.github.io/BI"]');
            if (!blazeVisionExists) {
                const mlbDropdown = nav.querySelector('[class*="dropdown"]');
                if (mlbDropdown) {
                    const blazeVisionLink = document.createElement('a');
                    blazeVisionLink.href = 'https://ahump20.github.io/BI/';
                    blazeVisionLink.target = '_blank';
                    blazeVisionLink.className = 'nav-link';
                    blazeVisionLink.textContent = 'Blaze Vision';
                    
                    const dropdownMenu = mlbDropdown.querySelector('[class*="dropdown-menu"]');
                    if (dropdownMenu) {
                        dropdownMenu.appendChild(blazeVisionLink);
                        this.appliedEnhancements.push({
                            type: 'navigation-enhancement',
                            element: nav,
                            enhancement: 'Added Blaze Vision link'
                        });
                    }
                }
            }
            
            // Remove navigation redundancy
            const seasonInfos = nav.querySelectorAll('[class*="season"]');
            if (seasonInfos.length > 1) {
                // Keep the first one, remove others
                for (let i = 1; i < seasonInfos.length; i++) {
                    seasonInfos[i].remove();
                }
                this.appliedEnhancements.push({
                    type: 'navigation-cleanup',
                    element: nav,
                    enhancement: 'Removed redundant season information'
                });
            }
        });
    }
    
    /**
     * Enforce messaging standards
     */
    enforceMessagingStandards() {
        const textElements = this.getAllTextElements();
        
        textElements.forEach(element => {
            let content = element.textContent;
            let updated = false;
            
            // Replace prohibited claims
            const replacements = {
                '94.6%': 'Advanced',
                '94.6% accuracy': 'Advanced Analytics',
                '94.6% prediction accuracy': 'Advanced Pattern Recognition',
                '<100ms': 'Real-time',
                '2.8M+': 'Extensive',
                '2.8M+ data points': 'Extensive Data Sources',
                'predict championship runs 6 weeks before they happen': 'identify competitive patterns for strategic advantage',
                'Prevented 89% of season-ending injuries': 'Advanced biomechanical analysis for injury risk assessment'
            };
            
            Object.entries(replacements).forEach(([prohibited, approved]) => {
                if (content.includes(prohibited)) {
                    content = content.replace(new RegExp(prohibited, 'g'), approved);
                    updated = true;
                }
            });
            
            if (updated) {
                element.textContent = content;
                this.appliedEnhancements.push({
                    type: 'messaging-compliance',
                    element: element,
                    enhancement: 'Replaced prohibited claims'
                });
            }
        });
    }
    
    /**
     * Enforce season standards (current season)
     */
    enforceSeasonStandards() {
        const currentSeason = '2025-2026';
        const seasonElements = document.querySelectorAll('[class*="season"], [data-season]');
        
        seasonElements.forEach(element => {
            if (element.textContent.includes('2023-2024') || element.textContent.includes('2024-2025')) {
                element.textContent = element.textContent.replace(/(2023-2024|2024-2025)/g, currentSeason);
                this.appliedEnhancements.push({
                    type: 'season-update',
                    element: element,
                    enhancement: `Updated to ${currentSeason}`
                });
            }
        });
    }
    
    /**
     * Setup brand monitoring for dynamic content
     */
    setupBrandMonitoring() {
        const observer = new MutationObserver((mutations) => {
            let shouldEnforce = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' || 
                    (mutation.type === 'attributes' && 
                     ['class', 'style', 'data-brand'].includes(mutation.attributeName))) {
                    shouldEnforce = true;
                }
            });
            
            if (shouldEnforce) {
                // Debounce brand enforcement
                clearTimeout(this.brandTimeout);
                this.brandTimeout = setTimeout(() => {
                    this.enforceStandards();
                }, 500);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'data-brand']
        });
    }
    
    /**
     * Get all text-containing elements
     */
    getAllTextElements() {
        const elements = [];
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: (node) => {
                    return node.textContent && node.textContent.trim() ? 
                           NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
                }
            }
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.children.length === 0 && node.textContent.trim()) {
                elements.push(node);
            }
        }
        
        return elements;
    }
    
    /**
     * Generate brand compliance report
     */
    generateBrandReport() {
        const highImpactEnhancements = this.appliedEnhancements.filter(e => 
            ['logo-icon', 'brand-name', 'messaging-compliance'].includes(e.type)
        );
        
        if (this.appliedEnhancements.length > 0) {
            console.log('🏆 Brand Engine Report:');
            console.log(`Total enhancements applied: ${this.appliedEnhancements.length}`);
            console.log(`High-impact fixes: ${highImpactEnhancements.length}`);
            
            const enhancementSummary = {};
            this.appliedEnhancements.forEach(e => {
                enhancementSummary[e.type] = (enhancementSummary[e.type] || 0) + 1;
            });
            
            console.table(enhancementSummary);
        } else {
            console.log('✅ Brand Engine: All championship standards maintained');
        }
        
        // Store for debugging
        window.BlazeBrandReport = {
            violations: this.brandViolations,
            enhancements: this.appliedEnhancements,
            config: this.brandConfig,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Manual brand enforcement for development
     */
    static enforce() {
        if (window.BlazeBrand) {
            window.BlazeBrand.enforceStandards();
        }
    }
    
    /**
     * Get brand configuration
     */
    static getConfig() {
        return window.BlazeBrand ? window.BlazeBrand.brandConfig : null;
    }
}

// Initialize global brand engine
window.BlazeBrand = new BlazeBrandEngine();

// Development helpers
if (typeof window !== 'undefined') {
    window.enforceBrandStandards = () => BlazeBrandEngine.enforce();
    window.getBrandConfig = () => BlazeBrandEngine.getConfig();
    
    // Performance monitoring
    if (performance && performance.mark) {
        performance.mark('blaze-brand-engine-loaded');
    }
}