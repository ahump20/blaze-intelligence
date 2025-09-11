/**
 * Mobile Championship Interface
 * Responsive Texas Football Authority Experience
 * Built for Blaze Intelligence - Championship Analytics in Your Pocket
 */

class MobileChampionshipInterface {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.activeGestures = new Set();
        
        this.texasColors = {
            burntOrange: '#BF5700',
            cardinalSky: '#9BCBEB',
            oilerNavy: '#002244',
            grizzlyTeal: '#00B2A9',
            platinum: '#E5E4E2'
        };
        
        this.mobileElements = new Map();
        this.gestureHandlers = new Map();
        
        this.init();
    }
    
    init() {
        this.detectDeviceCapabilities();
        this.setupMobileNavigation();
        this.createMobileChampionshipDashboard();
        this.setupTouchGestures();
        this.optimizeForMobile();
        this.setupMobileAnimations();
        this.handleOrientationChange();
    }
    
    detectDeviceCapabilities() {
        this.deviceInfo = {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
            isAndroid: /Android/.test(navigator.userAgent),
            hasTouch: 'ontouchstart' in window,
            supportsVibration: 'vibrate' in navigator,
            pixelRatio: window.devicePixelRatio || 1,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height
        };
        
        console.log('📱 Championship Mobile: Device detected -', this.deviceInfo);
    }
    
    setupMobileNavigation() {
        // Enhanced mobile navigation for championship experience
        const nav = document.querySelector('nav');
        if (!nav) return;
        
        // Create championship mobile menu
        this.createChampionshipMobileMenu();
        this.setupMobileMenuInteractions();
        this.addMobileNavigationIndicators();
    }
    
    createChampionshipMobileMenu() {
        const mobileMenu = document.createElement('div');
        mobileMenu.id = 'championship-mobile-menu';
        mobileMenu.className = 'championship-mobile-menu';
        mobileMenu.style.cssText = `
            position: fixed;
            top: 0;
            left: -100%;
            width: 80%;
            max-width: 320px;
            height: 100vh;
            background: linear-gradient(180deg, ${this.texasColors.oilerNavy} 0%, ${this.texasColors.oilerNavy}CC 100%);
            backdrop-filter: blur(20px);
            z-index: 10000;
            transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            overflow-y: auto;
            border-right: 2px solid ${this.texasColors.burntOrange}40;
        `;
        
        mobileMenu.innerHTML = `
            <div class="mobile-menu-header" style="
                padding: 24px 20px;
                border-bottom: 1px solid ${this.texasColors.burntOrange}30;
                background: linear-gradient(135deg, ${this.texasColors.burntOrange}20 0%, transparent 100%);
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: ${this.texasColors.burntOrange};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 900;
                        color: white;
                        font-size: 18px;
                    ">B</div>
                    <div>
                        <div style="color: white; font-weight: 700; font-size: 16px;">Blaze Intelligence</div>
                        <div style="color: ${this.texasColors.cardinalSky}; font-size: 12px;">Texas Football Authority</div>
                    </div>
                </div>
                <button id="mobile-menu-close" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: transparent;
                    border: none;
                    color: ${this.texasColors.platinum};
                    font-size: 24px;
                    cursor: pointer;
                    padding: 4px;
                ">✕</button>
            </div>
            
            <nav class="mobile-navigation" style="padding: 20px 0;">
                ${this.createMobileMenuItems()}
            </nav>
            
            <div class="mobile-championship-status" style="
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 20px;
                background: linear-gradient(180deg, transparent 0%, ${this.texasColors.oilerNavy} 100%);
            ">
                <div style="
                    background: ${this.texasColors.burntOrange}20;
                    border: 1px solid ${this.texasColors.burntOrange}40;
                    border-radius: 8px;
                    padding: 12px;
                    text-align: center;
                ">
                    <div style="color: ${this.texasColors.burntOrange}; font-size: 12px; text-transform: uppercase;">Championship Status</div>
                    <div style="color: white; font-weight: 700; margin-top: 4px;">Elite Ready 🏆</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(mobileMenu);
        this.mobileElements.set('menu', mobileMenu);
    }
    
    createMobileMenuItems() {
        const menuItems = [
            { href: '/', label: 'Texas Football HQ', icon: '🏠' },
            { href: '#platform', label: 'Championship Intel', icon: '🏆' },
            { href: '/pressure-dashboard', label: 'Game Film Analysis', icon: '🎬' },
            { href: '#analytics', label: 'Friday Night Insights', icon: '💡' },
            { href: '/neural-coach', label: 'Texas Football Wisdom™', icon: '🧠' },
            { href: '#digital-combine', label: 'Elite Scouting™', icon: '🔍' },
            { href: '#pricing', label: 'Join the Network', icon: '🤝' },
            { href: '/live-demo', label: 'Watch Game Tape', icon: '📹' },
            { href: '#contact', label: 'Start Your Season', icon: '🏈' }
        ];
        
        return menuItems.map(item => `
            <a href="${item.href}" class="mobile-menu-item" style="
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px 24px;
                color: white;
                text-decoration: none;
                transition: all 0.3s ease;
                border-left: 3px solid transparent;
            " data-mobile-nav="${item.href}">
                <span style="font-size: 20px; width: 24px; text-align: center;">${item.icon}</span>
                <span style="font-weight: 500;">${item.label}</span>
            </a>
        `).join('');
    }
    
    setupMobileMenuInteractions() {
        const menuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenu = this.mobileElements.get('menu');
        const menuClose = document.getElementById('mobile-menu-close');
        
        if (!menuToggle || !mobileMenu) return;
        
        // Menu toggle
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });
        
        // Close button
        if (menuClose) {
            menuClose.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        // Menu item interactions
        mobileMenu.querySelectorAll('.mobile-menu-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = `${this.texasColors.burntOrange}20`;
                item.style.borderLeftColor = this.texasColors.burntOrange;
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
                item.style.borderLeftColor = 'transparent';
            });
            
            item.addEventListener('click', () => {
                this.vibrate(50); // Haptic feedback
                setTimeout(() => this.closeMobileMenu(), 200);
            });
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleMobileMenu() {
        const mobileMenu = this.mobileElements.get('menu');
        const isOpen = mobileMenu.style.left === '0px';
        
        if (isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        const mobileMenu = this.mobileElements.get('menu');
        mobileMenu.style.left = '0px';
        
        // Create overlay
        this.createMenuOverlay();
        this.vibrate(30);
        
        // Animate menu items
        const menuItems = mobileMenu.querySelectorAll('.mobile-menu-item');
        menuItems.forEach((item, index) => {
            item.style.transform = 'translateX(-20px)';
            item.style.opacity = '0';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.transform = 'translateX(0)';
                item.style.opacity = '1';
            }, index * 50);
        });
    }
    
    closeMobileMenu() {
        const mobileMenu = this.mobileElements.get('menu');
        mobileMenu.style.left = '-100%';
        
        // Remove overlay
        this.removeMenuOverlay();
    }
    
    createMenuOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'mobile-menu-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
        
        overlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });
    }
    
    removeMenuOverlay() {
        const overlay = document.getElementById('mobile-menu-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }
    
    createMobileChampionshipDashboard() {
        if (!this.isMobile) return;
        
        // Create mobile-optimized championship cards
        this.createMobileChampionshipCards();
        this.createMobileSwipeCards();
        this.setupMobileChartOptimizations();
    }
    
    createMobileChampionshipCards() {
        const existingContainer = document.querySelector('.championship-cards-container');
        if (existingContainer && this.isMobile) {
            existingContainer.style.cssText = `
                display: grid;
                grid-template-columns: 1fr;
                gap: 16px;
                padding: 16px;
                margin: 0;
            `;
            
            // Optimize cards for mobile
            const cards = existingContainer.querySelectorAll('.championship-card');
            cards.forEach(card => {
                card.style.margin = '0';
                card.style.padding = '20px';
                card.style.borderRadius = '12px';
            });
        }
    }
    
    createMobileSwipeCards() {
        const swipeContainer = document.createElement('div');
        swipeContainer.className = 'mobile-swipe-cards';
        swipeContainer.style.cssText = `
            display: ${this.isMobile ? 'block' : 'none'};
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            padding: 20px 0;
            margin: 20px 0;
        `;
        
        swipeContainer.innerHTML = `
            <div class="swipe-cards-wrapper" style="
                display: flex;
                gap: 16px;
                padding: 0 20px;
                min-width: min-content;
            ">
                ${this.createSwipeCardItems()}
            </div>
        `;
        
        // Insert after hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.insertAdjacentElement('afterend', swipeContainer);
        }
        
        this.setupSwipeInteractions(swipeContainer);
    }
    
    createSwipeCardItems() {
        const swipeCards = [
            {
                title: 'Championship Intel',
                metric: '94.6%',
                description: 'State title prediction accuracy',
                color: this.texasColors.burntOrange,
                icon: '🏆'
            },
            {
                title: 'Friday Night Network',
                metric: '1,200+',
                description: 'Texas high school programs',
                color: this.texasColors.cardinalSky,
                icon: '🏟️'
            },
            {
                title: 'Game Film Library',
                metric: '2.8M+',
                description: 'Analyzed plays and drives',
                color: this.texasColors.grizzlyTeal,
                icon: '🎬'
            }
        ];
        
        return swipeCards.map(card => `
            <div class="swipe-card" style="
                min-width: 280px;
                background: linear-gradient(135deg, ${card.color}20 0%, ${card.color}10 100%);
                border: 2px solid ${card.color}30;
                border-radius: 16px;
                padding: 24px;
                scroll-snap-align: start;
                backdrop-filter: blur(10px);
            ">
                <div style="font-size: 32px; margin-bottom: 12px;">${card.icon}</div>
                <div style="
                    font-size: 28px;
                    font-weight: 900;
                    color: ${card.color};
                    margin-bottom: 8px;
                    font-family: 'SF Pro Display', -apple-system, system-ui, sans-serif;
                ">${card.metric}</div>
                <h3 style="color: #FFFFFF; font-weight: 700; margin-bottom: 8px;">${card.title}</h3>
                <p style="color: rgba(255, 255, 255, 0.8); margin: 0; font-size: 14px;">${card.description}</p>
            </div>
        `).join('');
    }
    
    setupSwipeInteractions(container) {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        const wrapper = container.querySelector('.swipe-cards-wrapper');
        
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.vibrate(10);
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const diffX = startX - currentX;
            
            // Smooth scrolling
            container.scrollLeft += diffX * 0.1;
        });
        
        container.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
    
    setupTouchGestures() {
        if (!this.deviceInfo.hasTouch) return;
        
        this.setupSwipeGestures();
        this.setupPinchToZoom();
        this.setupLongPress();
    }
    
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Detect swipe gestures
            if (deltaTime < 500 && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
            }
            
            if (deltaTime < 500 && Math.abs(deltaY) > 50) {
                if (deltaY > 0) {
                    this.handleSwipeDown();
                } else {
                    this.handleSwipeUp();
                }
            }
        });
    }
    
    handleSwipeRight() {
        console.log('🏈 Championship Swipe: Right');
        // Navigate to previous section or open menu
        if (!document.querySelector('.championship-mobile-menu[style*="left: 0"]')) {
            this.openMobileMenu();
        }
    }
    
    handleSwipeLeft() {
        console.log('🏈 Championship Swipe: Left');
        // Navigate to next section or close menu
        this.closeMobileMenu();
    }
    
    handleSwipeUp() {
        console.log('🏈 Championship Swipe: Up');
        // Scroll to top or show championship status
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    handleSwipeDown() {
        console.log('🏈 Championship Swipe: Down');
        // Show mobile-specific championship shortcuts
        this.showMobileChampionshipShortcuts();
    }
    
    setupPinchToZoom() {
        let initialDistance = 0;
        let currentScale = 1;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                
                const currentDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                
                currentScale = Math.min(Math.max(0.8, scale), 2);
                
                // Apply zoom to championship elements
                this.applyZoomToChampionshipElements(currentScale);
            }
        });
    }
    
    getTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    applyZoomToChampionshipElements(scale) {
        const elements = document.querySelectorAll('.championship-card, .swipe-card');
        elements.forEach(element => {
            element.style.transform = `scale(${scale})`;
        });
    }
    
    setupLongPress() {
        let pressTimer;
        
        document.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                this.handleLongPress(e);
            }, 800);
        });
        
        document.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
        
        document.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    }
    
    handleLongPress(e) {
        const target = e.target.closest('.championship-card, .swipe-card');
        if (target) {
            this.vibrate(100);
            this.showChampionshipCardActions(target);
        }
    }
    
    showChampionshipCardActions(card) {
        const actionsMenu = document.createElement('div');
        actionsMenu.className = 'championship-card-actions';
        actionsMenu.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: ${this.texasColors.oilerNavy};
            border: 2px solid ${this.texasColors.burntOrange};
            border-radius: 16px;
            padding: 20px;
            z-index: 10001;
            backdrop-filter: blur(20px);
            animation: slideUpMobile 0.3s ease-out;
        `;
        
        actionsMenu.innerHTML = `
            <h3 style="color: ${this.texasColors.burntOrange}; margin: 0 0 16px 0; font-weight: 700;">Championship Actions</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <button class="action-btn" data-action="analyze" style="
                    background: ${this.texasColors.cardinalSky}20;
                    border: 1px solid ${this.texasColors.cardinalSky};
                    color: ${this.texasColors.cardinalSky};
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 600;
                ">📊 Analyze</button>
                <button class="action-btn" data-action="share" style="
                    background: ${this.texasColors.grizzlyTeal}20;
                    border: 1px solid ${this.texasColors.grizzlyTeal};
                    color: ${this.texasColors.grizzlyTeal};
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 600;
                ">📤 Share</button>
                <button class="action-btn" data-action="favorite" style="
                    background: ${this.texasColors.burntOrange}20;
                    border: 1px solid ${this.texasColors.burntOrange};
                    color: ${this.texasColors.burntOrange};
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 600;
                ">⭐ Favorite</button>
                <button class="action-btn" data-action="close" style="
                    background: transparent;
                    border: 1px solid ${this.texasColors.platinum}40;
                    color: ${this.texasColors.platinum};
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 600;
                ">✕ Close</button>
            </div>
        `;
        
        document.body.appendChild(actionsMenu);
        
        // Setup action handlers
        actionsMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.handleChampionshipAction(action, card);
                document.body.removeChild(actionsMenu);
            }
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(actionsMenu)) {
                document.body.removeChild(actionsMenu);
            }
        }, 5000);
    }
    
    handleChampionshipAction(action, card) {
        this.vibrate(50);
        
        switch (action) {
            case 'analyze':
                console.log('🏆 Championship Action: Analyzing card data');
                break;
            case 'share':
                if (navigator.share) {
                    navigator.share({
                        title: 'Blaze Intelligence - Championship Data',
                        text: 'Check out this championship insight!',
                        url: window.location.href
                    });
                }
                break;
            case 'favorite':
                card.classList.toggle('favorited');
                break;
        }
    }
    
    showMobileChampionshipShortcuts() {
        const shortcuts = document.createElement('div');
        shortcuts.className = 'mobile-championship-shortcuts';
        shortcuts.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(180deg, transparent 0%, ${this.texasColors.oilerNavy} 20%);
            padding: 20px;
            z-index: 10000;
            backdrop-filter: blur(20px);
            animation: slideUpMobile 0.3s ease-out;
        `;
        
        shortcuts.innerHTML = `
            <div style="
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
                max-width: 400px;
                margin: 0 auto;
            ">
                <div class="shortcut-btn" data-shortcut="home" style="
                    background: ${this.texasColors.burntOrange}20;
                    border: 1px solid ${this.texasColors.burntOrange}40;
                    border-radius: 12px;
                    padding: 16px 8px;
                    text-align: center;
                    cursor: pointer;
                ">
                    <div style="font-size: 20px; margin-bottom: 4px;">🏠</div>
                    <div style="color: ${this.texasColors.burntOrange}; font-size: 10px; font-weight: 600;">Home</div>
                </div>
                <div class="shortcut-btn" data-shortcut="analytics" style="
                    background: ${this.texasColors.cardinalSky}20;
                    border: 1px solid ${this.texasColors.cardinalSky}40;
                    border-radius: 12px;
                    padding: 16px 8px;
                    text-align: center;
                    cursor: pointer;
                ">
                    <div style="font-size: 20px; margin-bottom: 4px;">📊</div>
                    <div style="color: ${this.texasColors.cardinalSky}; font-size: 10px; font-weight: 600;">Analytics</div>
                </div>
                <div class="shortcut-btn" data-shortcut="gamefilm" style="
                    background: ${this.texasColors.grizzlyTeal}20;
                    border: 1px solid ${this.texasColors.grizzlyTeal}40;
                    border-radius: 12px;
                    padding: 16px 8px;
                    text-align: center;
                    cursor: pointer;
                ">
                    <div style="font-size: 20px; margin-bottom: 4px;">🎬</div>
                    <div style="color: ${this.texasColors.grizzlyTeal}; font-size: 10px; font-weight: 600;">Film</div>
                </div>
                <div class="shortcut-btn" data-shortcut="contact" style="
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    padding: 16px 8px;
                    text-align: center;
                    cursor: pointer;
                ">
                    <div style="font-size: 20px; margin-bottom: 4px;">📞</div>
                    <div style="color: ${this.texasColors.platinum}; font-size: 10px; font-weight: 600;">Contact</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(shortcuts);
        
        // Setup shortcut interactions
        shortcuts.addEventListener('click', (e) => {
            const shortcut = e.target.closest('.shortcut-btn');
            if (shortcut) {
                this.handleMobileShortcut(shortcut.dataset.shortcut);
                document.body.removeChild(shortcuts);
            }
        });
        
        // Auto-remove
        setTimeout(() => {
            if (document.body.contains(shortcuts)) {
                document.body.removeChild(shortcuts);
            }
        }, 4000);
    }
    
    handleMobileShortcut(shortcut) {
        this.vibrate(30);
        
        switch (shortcut) {
            case 'home':
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'analytics':
                document.querySelector('#analytics')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'gamefilm':
                window.location.href = '/live-demo';
                break;
            case 'contact':
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                break;
        }
    }
    
    setupMobileChartOptimizations() {
        // Optimize charts for mobile viewing
        const charts = document.querySelectorAll('canvas[id*="chart"]');
        charts.forEach(canvas => {
            if (this.isMobile) {
                canvas.style.maxWidth = '100%';
                canvas.style.height = 'auto';
                canvas.style.touchAction = 'pan-y';
            }
        });
    }
    
    optimizeForMobile() {
        if (!this.isMobile) return;
        
        // Mobile-specific CSS optimizations
        const mobileStyles = document.createElement('style');
        mobileStyles.id = 'mobile-championship-styles';
        mobileStyles.textContent = `
            @media (max-width: 768px) {
                .hero-section {
                    padding: 60px 20px 40px;
                    min-height: 80vh;
                }
                
                .section-title {
                    font-size: clamp(24px, 8vw, 36px);
                }
                
                .championship-card {
                    margin: 8px !important;
                    padding: 16px !important;
                }
                
                .analytics-grid {
                    grid-template-columns: 1fr !important;
                    gap: 16px !important;
                }
                
                .features-grid {
                    grid-template-columns: 1fr !important;
                    gap: 16px !important;
                }
            }
            
            @keyframes slideUpMobile {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(mobileStyles);
        
        // Touch-friendly interactions
        this.makeTouchFriendly();
    }
    
    makeTouchFriendly() {
        // Increase touch targets
        const interactiveElements = document.querySelectorAll('button, a, .championship-card');
        interactiveElements.forEach(el => {
            el.style.minHeight = '44px';
            el.style.touchAction = 'manipulation';
        });
        
        // Add touch feedback
        interactiveElements.forEach(el => {
            el.addEventListener('touchstart', () => {
                el.style.transform = 'scale(0.98)';
                this.vibrate(10);
            });
            
            el.addEventListener('touchend', () => {
                el.style.transform = 'scale(1)';
            });
        });
    }
    
    setupMobileAnimations() {
        // Reduced motion for better mobile performance
        if (this.deviceInfo.pixelRatio > 2) {
            document.documentElement.style.setProperty('--animation-duration', '0.2s');
        }
        
        // Mobile-optimized scroll animations
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -20% 0px'
        };
        
        const mobileObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'mobileSlideIn 0.5s ease-out forwards';
                }
            });
        }, observerOptions);
        
        // Observe elements for mobile animations
        document.querySelectorAll('.championship-card, .analytics-card, .feature-card').forEach(el => {
            mobileObserver.observe(el);
        });
    }
    
    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.detectDeviceCapabilities();
                this.optimizeForOrientation();
            }, 200);
        });
    }
    
    optimizeForOrientation() {
        const isLandscape = window.innerHeight < window.innerWidth;
        
        if (this.isMobile && isLandscape) {
            // Landscape optimizations
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.style.minHeight = '100vh';
                heroSection.style.padding = '40px 20px';
            }
        }
    }
    
    vibrate(duration = 50) {
        if (this.deviceInfo.supportsVibration) {
            navigator.vibrate(duration);
        }
    }
    
    // Public API
    isMobileDevice() {
        return this.isMobile;
    }
    
    getDeviceInfo() {
        return this.deviceInfo;
    }
    
    showMobileNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            background: ${type === 'success' ? this.texasColors.grizzlyTeal : 
                        type === 'warning' ? this.texasColors.burntOrange : 
                        this.texasColors.cardinalSky};
            color: white;
            padding: 16px;
            border-radius: 12px;
            z-index: 10002;
            font-weight: 600;
            text-align: center;
            animation: slideDownMobile 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideUpMobile 0.3s ease-in forwards';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }
}

// Additional mobile styles
const additionalMobileStyles = document.createElement('style');
additionalMobileStyles.textContent = `
    @keyframes mobileSlideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideDownMobile {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(additionalMobileStyles);

// Initialize Mobile Championship Interface
document.addEventListener('DOMContentLoaded', () => {
    window.mobileChampionshipInterface = new MobileChampionshipInterface();
    
    // Global mobile interface access
    window.showMobileNotification = (message, type) => {
        window.mobileChampionshipInterface.showMobileNotification(message, type);
    };
    
    console.log('📱 Mobile Championship Interface: Initialized');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileChampionshipInterface;
}