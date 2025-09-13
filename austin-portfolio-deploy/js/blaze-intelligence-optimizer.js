/**
 * Blaze Intelligence Content Optimization System
 * AI-powered content validation and enhancement engine
 * Ensures championship-level executive presentation standards
 */

class BlazeIntelligenceOptimizer {
    constructor() {
        this.config = {
            // Approved metrics and claims
            approvedMetrics: {
                costSavings: { min: 67, max: 80, unit: '%', context: 'vs competitor pricing' },
                responseTime: { value: 'real-time', context: 'data processing' },
                dataProcessing: { value: 'extensive', context: 'data sources' },
                platformStatus: { value: 'operational', context: 'system health' },
                analysisMode: { value: 'live', context: 'intelligence feeds' }
            },
            
            // Prohibited claims (require Methods & Definitions links)
            prohibitedClaims: [
                '94.6%', '94.6% accuracy', 'prediction accuracy',
                '<100ms', '100ms response', 'response latency',
                '2.8M+', '2.8 million', 'data points',
                'predict championship', 'championship runs', '6 weeks before',
                '89% prevented', 'season-ending injuries', 'injury prevention rate'
            ],
            
            // Brand consistency requirements
            brandStandards: {
                companyName: 'Blaze Intelligence',
                logoIcon: '🔥',
                primaryColor: '#BF5700',
                secondaryColor: '#9BCBEB',
                teamExamples: ['Cardinals', 'Titans', 'Longhorns', 'Grizzlies'],
                excludedSports: ['soccer', 'football' /* not American football */]
            }
        };
        
        this.violations = [];
        this.optimizations = [];
        this.init();
    }
    
    init() {
        // Initialize on page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.validateAndOptimize());
        } else {
            this.validateAndOptimize();
        }
        
        // Monitor dynamic content changes
        this.setupMutationObserver();
    }
    
    /**
     * Main validation and optimization engine
     */
    validateAndOptimize() {
        console.log('🔥 Blaze Intelligence Optimizer: Validating championship standards...');
        
        this.violations = [];
        this.optimizations = [];
        
        // Core validations
        this.validateProhibitedClaims();
        this.validateBrandConsistency();
        this.validateNavigationStructure();
        this.optimizePerformanceMetrics();
        this.enhanceExecutivePresentation();
        
        // Apply optimizations
        this.applyOptimizations();
        
        // Report results
        this.generateReport();
    }
    
    /**
     * Validate prohibited claims and suggest replacements
     */
    validateProhibitedClaims() {
        const textNodes = this.getAllTextNodes();
        
        textNodes.forEach(node => {
            this.config.prohibitedClaims.forEach(claim => {
                if (node.textContent.toLowerCase().includes(claim.toLowerCase())) {
                    this.violations.push({
                        type: 'prohibited-claim',
                        element: node.parentElement,
                        claim: claim,
                        suggestion: this.getSafeReplacement(claim),
                        severity: 'high'
                    });
                }
            });
        });
    }
    
    /**
     * Get safe replacement for prohibited claims
     */
    getSafeReplacement(claim) {
        const replacements = {
            '94.6%': 'Advanced',
            '94.6% accuracy': 'Advanced Analytics',
            'prediction accuracy': 'Pattern Recognition',
            '<100ms': 'Real-time',
            '100ms response': 'Real-time Processing',
            'response latency': 'Processing Speed',
            '2.8M+': 'Extensive',
            '2.8 million': 'Extensive',
            'data points': 'Data Sources',
            'predict championship': 'Analyze competitive patterns for',
            'championship runs': 'championship preparation',
            '6 weeks before': 'with strategic foresight',
            '89% prevented': 'Advanced risk assessment for',
            'season-ending injuries': 'injury prevention strategies',
            'injury prevention rate': 'biomechanical analysis'
        };
        
        return replacements[claim] || 'Strategic Intelligence';
    }
    
    /**
     * Validate brand consistency
     */
    validateBrandConsistency() {
        // Check logo consistency
        const logoElements = document.querySelectorAll('.nav-logo-icon, .logo-icon, [class*="logo"]');
        logoElements.forEach(element => {
            if (element.textContent && element.textContent.trim() === 'B') {
                this.optimizations.push({
                    type: 'brand-logo',
                    element: element,
                    current: 'B',
                    optimized: this.config.brandStandards.logoIcon,
                    priority: 'high'
                });
            }
        });
        
        // Check company name consistency
        const textNodes = this.getAllTextNodes();
        textNodes.forEach(node => {
            const text = node.textContent;
            if (text.includes('AMSI') || text.includes('B Blaze Intelligence')) {
                this.optimizations.push({
                    type: 'brand-name',
                    element: node.parentElement,
                    current: text,
                    optimized: text.replace(/AMSI|B Blaze Intelligence/g, this.config.brandStandards.companyName),
                    priority: 'medium'
                });
            }
        });
    }
    
    /**
     * Validate navigation structure for consistency
     */
    validateNavigationStructure() {
        const navElements = document.querySelectorAll('nav, .nav, .navigation, [class*="nav"]');
        
        navElements.forEach(nav => {
            // Check for season info redundancy
            const seasonElements = nav.querySelectorAll('[class*="season"]');
            if (seasonElements.length > 1) {
                this.optimizations.push({
                    type: 'navigation-cleanup',
                    element: nav,
                    issue: 'Redundant season information',
                    priority: 'medium'
                });
            }
            
            // Check for proper Blaze Vision integration
            const blazeVisionLinks = nav.querySelectorAll('a[href*="ahump20.github.io/BI"]');
            if (blazeVisionLinks.length === 0) {
                this.optimizations.push({
                    type: 'navigation-enhancement',
                    element: nav,
                    enhancement: 'Add Blaze Vision link to MLB dropdown',
                    priority: 'medium'
                });
            }
        });
    }
    
    /**
     * Optimize performance metrics display
     */
    optimizePerformanceMetrics() {
        // Find metric display elements
        const metricElements = document.querySelectorAll(
            '[data-metric], .metric-value, .stat-value, .badge-value, [class*="metric"]'
        );
        
        metricElements.forEach(element => {
            const text = element.textContent;
            
            // Check if displaying prohibited metrics
            if (this.config.prohibitedClaims.some(claim => text.includes(claim))) {
                this.optimizations.push({
                    type: 'metric-compliance',
                    element: element,
                    current: text,
                    optimized: this.getSafeReplacement(text),
                    priority: 'high'
                });
            }
        });
    }
    
    /**
     * Enhance executive presentation elements
     */
    enhanceExecutivePresentation() {
        // Add Three.js canvas placeholders where missing
        const heroSections = document.querySelectorAll(
            '.hero, .hero-section, [class*="hero"], .intelligence-showcase, .dashboard-section'
        );
        
        heroSections.forEach(section => {
            const hasCanvas = section.querySelector('canvas');
            if (!hasCanvas && section.offsetHeight > 200) {
                this.optimizations.push({
                    type: 'visual-enhancement',
                    element: section,
                    enhancement: 'Add Three.js championship visualization',
                    priority: 'medium'
                });
            }
        });
        
        // Ensure proper loading states
        const buttons = document.querySelectorAll('button, .btn, [class*="button"]');
        buttons.forEach(button => {
            if (!button.hasAttribute('data-loading-text')) {
                this.optimizations.push({
                    type: 'ux-enhancement',
                    element: button,
                    enhancement: 'Add executive-grade loading states',
                    priority: 'low'
                });
            }
        });
    }
    
    /**
     * Apply all optimizations
     */
    applyOptimizations() {
        this.optimizations.forEach(optimization => {
            try {
                switch (optimization.type) {
                    case 'brand-logo':
                        optimization.element.textContent = optimization.optimized;
                        break;
                        
                    case 'brand-name':
                        optimization.element.textContent = optimization.optimized;
                        break;
                        
                    case 'metric-compliance':
                        optimization.element.textContent = optimization.optimized;
                        break;
                        
                    case 'visual-enhancement':
                        this.addChampionshipCanvas(optimization.element);
                        break;
                        
                    case 'ux-enhancement':
                        this.enhanceButtonStates(optimization.element);
                        break;
                }
            } catch (error) {
                console.warn('Optimization failed:', optimization.type, error);
            }
        });
    }
    
    /**
     * Add championship-grade Three.js canvas to elements
     */
    addChampionshipCanvas(element) {
        const canvas = document.createElement('canvas');
        const canvasId = `blaze-canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        canvas.id = canvasId;
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.4;
            pointer-events: none;
        `;
        
        // Ensure parent is relatively positioned
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(canvas);
        
        // Initialize with championship visual if available
        if (window.BlazeVisuals) {
            window.BlazeVisuals.createIntelligenceHero(canvasId);
        }
    }
    
    /**
     * Enhance button states for executive presentation
     */
    enhanceButtonStates(button) {
        button.setAttribute('data-loading-text', 'Processing...');
        
        const originalClickHandler = button.onclick;
        button.onclick = function(e) {
            const originalText = this.textContent;
            this.textContent = this.getAttribute('data-loading-text');
            this.disabled = true;
            
            // Execute original handler
            if (originalClickHandler) {
                originalClickHandler.call(this, e);
            }
            
            // Reset after delay (simulated processing)
            setTimeout(() => {
                this.textContent = originalText;
                this.disabled = false;
            }, 1500);
        };
    }
    
    /**
     * Setup mutation observer for dynamic content
     */
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldValidate = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    shouldValidate = true;
                }
            });
            
            if (shouldValidate) {
                // Debounce validation
                clearTimeout(this.validationTimeout);
                this.validationTimeout = setTimeout(() => {
                    this.validateAndOptimize();
                }, 1000);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
    
    /**
     * Get all text nodes in document
     */
    getAllTextNodes() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.textContent.trim()) {
                textNodes.push(node);
            }
        }
        
        return textNodes;
    }
    
    /**
     * Generate optimization report
     */
    generateReport() {
        const highPriorityViolations = this.violations.filter(v => v.severity === 'high');
        const highPriorityOptimizations = this.optimizations.filter(o => o.priority === 'high');
        
        if (highPriorityViolations.length > 0 || highPriorityOptimizations.length > 0) {
            console.log('🚨 Championship Standards Report:');
            console.log(`High Priority Violations: ${highPriorityViolations.length}`);
            console.log(`High Priority Optimizations Applied: ${highPriorityOptimizations.length}`);
            
            if (highPriorityViolations.length > 0) {
                console.table(highPriorityViolations.map(v => ({
                    Type: v.type,
                    Claim: v.claim,
                    Suggestion: v.suggestion
                })));
            }
        } else {
            console.log('✅ Championship standards validated - All systems operational');
        }
        
        // Store for debugging
        window.BlazeOptimizationReport = {
            violations: this.violations,
            optimizations: this.optimizations,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Manual validation trigger for development
     */
    static validate() {
        if (window.BlazeOptimizer) {
            window.BlazeOptimizer.validateAndOptimize();
        }
    }
}

// Initialize global optimizer
window.BlazeOptimizer = new BlazeIntelligenceOptimizer();

// Development helpers
if (typeof window !== 'undefined') {
    window.validateBlaze = () => BlazeIntelligenceOptimizer.validate();
    
    // Performance monitoring
    if (performance && performance.mark) {
        performance.mark('blaze-optimizer-loaded');
    }
}