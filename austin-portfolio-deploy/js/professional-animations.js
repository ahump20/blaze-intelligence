/**
 * Professional Loading Animations & Transitions
 * Blaze Intelligence - Executive-Level User Experience
 */

class ProfessionalAnimations {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;

        // Animation configurations
        this.animations = {
            fadeIn: { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
            slideUp: { duration: 800, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
            scaleIn: { duration: 500, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
            morphing: { duration: 1200, easing: 'cubic-bezier(0.23, 1, 0.320, 1)' }
        };

        // Color palette for animations
        this.colors = {
            primary: '#BF5700',
            secondary: '#9BCBEB',
            accent: '#00B2A9',
            neural: '#00ff7f',
            gold: '#FFD700'
        };

        this.loadingElements = new Map();
        this.activeAnimations = new Set();

        this.initialize();
    }

    initialize() {
        console.log('🎨 Initializing Professional Animations...');
        this.createAnimationStyles();
        this.setupAnimationObserver();
        this.initialized = true;
        console.log('✅ Professional Animations ready');
    }

    createAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Professional Loading Animations */
            .blaze-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0a0e27, #1a1a2e);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(10px);
                transition: opacity 0.8s ease-out;
            }

            .blaze-loader {
                position: relative;
                width: 120px;
                height: 120px;
            }

            .blaze-spinner {
                width: 100%;
                height: 100%;
                border: 3px solid rgba(191, 87, 0, 0.1);
                border-top: 3px solid #BF5700;
                border-radius: 50%;
                animation: blazeSpin 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
                position: relative;
            }

            .blaze-spinner::after {
                content: '';
                position: absolute;
                top: -3px;
                left: -3px;
                right: -3px;
                bottom: -3px;
                border: 2px solid rgba(155, 203, 235, 0.2);
                border-bottom: 2px solid #9BCBEB;
                border-radius: 50%;
                animation: blazeSpinReverse 1.8s linear infinite;
            }

            @keyframes blazeSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes blazeSpinReverse {
                0% { transform: rotate(360deg); }
                100% { transform: rotate(0deg); }
            }

            .blaze-loading-text {
                position: absolute;
                bottom: -50px;
                left: 50%;
                transform: translateX(-50%);
                color: #e0e6ed;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 1px;
                text-transform: uppercase;
                animation: blazePulse 1.5s ease-in-out infinite;
            }

            @keyframes blazePulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }

            /* Neural Network Loading Animation */
            .neural-loader {
                position: relative;
                width: 80px;
                height: 80px;
                margin: 20px auto;
            }

            .neural-node {
                position: absolute;
                width: 12px;
                height: 12px;
                background: #00ff7f;
                border-radius: 50%;
                animation: neuralPulse 2s ease-in-out infinite;
            }

            .neural-node:nth-child(1) { top: 0; left: 34px; animation-delay: 0s; }
            .neural-node:nth-child(2) { top: 17px; left: 60px; animation-delay: 0.2s; }
            .neural-node:nth-child(3) { top: 34px; left: 68px; animation-delay: 0.4s; }
            .neural-node:nth-child(4) { top: 51px; left: 60px; animation-delay: 0.6s; }
            .neural-node:nth-child(5) { top: 68px; left: 34px; animation-delay: 0.8s; }
            .neural-node:nth-child(6) { top: 51px; left: 8px; animation-delay: 1s; }
            .neural-node:nth-child(7) { top: 34px; left: 0; animation-delay: 1.2s; }
            .neural-node:nth-child(8) { top: 17px; left: 8px; animation-delay: 1.4s; }

            @keyframes neuralPulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: 0.7;
                }
                50% {
                    transform: scale(1.5);
                    opacity: 1;
                }
            }

            /* Professional Fade In Animation */
            .fade-in-up {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .fade-in-up.animate {
                opacity: 1;
                transform: translateY(0);
            }

            /* Scale In Animation */
            .scale-in {
                opacity: 0;
                transform: scale(0.8);
                transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }

            .scale-in.animate {
                opacity: 1;
                transform: scale(1);
            }

            /* Slide In Animations */
            .slide-in-left {
                opacity: 0;
                transform: translateX(-50px);
                transition: all 0.7s cubic-bezier(0.23, 1, 0.320, 1);
            }

            .slide-in-left.animate {
                opacity: 1;
                transform: translateX(0);
            }

            .slide-in-right {
                opacity: 0;
                transform: translateX(50px);
                transition: all 0.7s cubic-bezier(0.23, 1, 0.320, 1);
            }

            .slide-in-right.animate {
                opacity: 1;
                transform: translateX(0);
            }

            /* Morphing Button Animation */
            .morphing-button {
                position: relative;
                overflow: hidden;
                transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
            }

            .morphing-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.8s ease;
            }

            .morphing-button:hover::before {
                left: 100%;
            }

            /* Loading Bar Animation */
            .loading-bar {
                width: 100%;
                height: 4px;
                background: rgba(191, 87, 0, 0.1);
                border-radius: 2px;
                overflow: hidden;
                position: relative;
            }

            .loading-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, #BF5700, #9BCBEB, #00B2A9);
                animation: loadingProgress 2s ease-in-out infinite;
            }

            @keyframes loadingProgress {
                0% { left: -100%; }
                100% { left: 100%; }
            }

            /* Stagger Animation for Lists */
            .stagger-item {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .stagger-item.animate {
                opacity: 1;
                transform: translateY(0);
            }

            /* Championship Glow Animation */
            .championship-glow {
                position: relative;
            }

            .championship-glow::after {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(45deg, #BF5700, #FFD700, #9BCBEB, #00B2A9);
                border-radius: inherit;
                z-index: -1;
                opacity: 0;
                transition: opacity 0.3s ease;
                filter: blur(8px);
            }

            .championship-glow:hover::after {
                opacity: 0.7;
                animation: glowRotate 2s linear infinite;
            }

            @keyframes glowRotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Typing Animation */
            .typing-animation {
                overflow: hidden;
                border-right: 3px solid #BF5700;
                white-space: nowrap;
                animation: typing 3s steps(40, end), blinkCaret 1s step-end infinite;
            }

            @keyframes typing {
                from { width: 0; }
                to { width: 100%; }
            }

            @keyframes blinkCaret {
                from, to { border-color: transparent; }
                50% { border-color: #BF5700; }
            }

            /* Professional Card Hover */
            .professional-card {
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                transform-style: preserve-3d;
            }

            .professional-card:hover {
                transform: translateY(-8px) rotateX(5deg);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(style);
    }

    setupAnimationObserver() {
        // Intersection Observer for scroll-triggered animations
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerAnimation(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
    }

    // Main Loading Animation
    showLoadingOverlay(message = 'Initializing Championship Intelligence') {
        const overlay = document.createElement('div');
        overlay.className = 'blaze-loading-overlay';
        overlay.innerHTML = `
            <div class="blaze-loader">
                <div class="blaze-spinner"></div>
                <div class="blaze-loading-text">${message}</div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.loadingElements.set('main', overlay);

        return overlay;
    }

    hideLoadingOverlay(delay = 500) {
        setTimeout(() => {
            const overlay = this.loadingElements.get('main');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                    this.loadingElements.delete('main');
                }, 800);
            }
        }, delay);
    }

    // Neural Network Loading
    showNeuralLoader(container, message = 'Processing Neural Patterns') {
        const loader = document.createElement('div');
        loader.className = 'neural-loader-container';
        loader.innerHTML = `
            <div class="neural-loader">
                ${Array.from({length: 8}, (_, i) => `<div class="neural-node"></div>`).join('')}
            </div>
            <div style="text-align: center; color: #00ff7f; font-size: 12px; margin-top: 10px;">
                ${message}
            </div>
        `;

        if (typeof container === 'string') {
            container = document.getElementById(container);
        }

        container.appendChild(loader);
        return loader;
    }

    hideNeuralLoader(loader, delay = 300) {
        setTimeout(() => {
            if (loader && loader.parentNode) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.parentNode.removeChild(loader);
                }, 300);
            }
        }, delay);
    }

    // Professional Loading Bar
    showLoadingBar(container, duration = 3000) {
        const bar = document.createElement('div');
        bar.className = 'loading-bar';

        if (typeof container === 'string') {
            container = document.getElementById(container);
        }

        container.appendChild(bar);

        setTimeout(() => {
            if (bar && bar.parentNode) {
                bar.parentNode.removeChild(bar);
            }
        }, duration);

        return bar;
    }

    // Animation Triggers
    triggerAnimation(element) {
        if (element.classList.contains('fade-in-up')) {
            element.classList.add('animate');
        } else if (element.classList.contains('scale-in')) {
            element.classList.add('animate');
        } else if (element.classList.contains('slide-in-left') || element.classList.contains('slide-in-right')) {
            element.classList.add('animate');
        }
    }

    // Stagger Animation for Lists
    animateStaggeredList(container, delay = 100) {
        const items = container.querySelectorAll('.stagger-item');

        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate');
            }, index * delay);
        });
    }

    // Morphing Button Effect
    applyMorphingEffect(button) {
        button.classList.add('morphing-button');

        button.addEventListener('mouseenter', () => {
            this.activeAnimations.add(`morph-${Date.now()}`);
        });
    }

    // Championship Glow Effect
    applyChampionshipGlow(element) {
        element.classList.add('championship-glow');
    }

    // Professional Card Hover
    applyProfessionalCardEffect(card) {
        card.classList.add('professional-card');
    }

    // Typing Animation
    startTypingAnimation(element, text, speed = 50) {
        element.classList.add('typing-animation');
        element.textContent = '';

        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                element.style.borderRight = 'none';
            }
        };

        typeWriter();
    }

    // Smooth Scroll with Animation
    smoothScrollTo(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800;

        let start = null;

        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);

            // Easing function
            const ease = this.easeInOutCubic(progress);

            window.scrollTo(0, startPosition + distance * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }

    // Easing Functions
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    // Counter Animation
    animateCounter(element, start = 0, end = 100, duration = 2000, suffix = '') {
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = start + (end - start) * this.easeInOutCubic(progress);
            element.textContent = Math.floor(current) + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Page Transition
    pageTransition(callback, duration = 800) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #BF5700, #9BCBEB);
            z-index: 9999;
            transform: translateX(-100%);
            transition: transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;

        document.body.appendChild(overlay);

        // Slide in
        setTimeout(() => {
            overlay.style.transform = 'translateX(0)';
        }, 10);

        // Execute callback at middle of animation
        setTimeout(() => {
            if (callback) callback();
        }, duration / 2);

        // Slide out
        setTimeout(() => {
            overlay.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, duration);
        }, duration);
    }

    // Initialize animations for elements
    initializeAnimations() {
        // Set up observers for all animation classes
        const animatedElements = document.querySelectorAll('.fade-in-up, .scale-in, .slide-in-left, .slide-in-right');
        animatedElements.forEach(element => {
            this.observer.observe(element);
        });

        // Apply effects to buttons and cards
        const buttons = document.querySelectorAll('.control-btn, .nav-item');
        buttons.forEach(button => this.applyMorphingEffect(button));

        const cards = document.querySelectorAll('.metric-card, .dashboard-section, .feed-item');
        cards.forEach(card => this.applyProfessionalCardEffect(card));
    }

    // Utility method to add animation classes to elements
    addAnimation(element, animationType, delay = 0) {
        setTimeout(() => {
            element.classList.add(animationType);
            if (this.observer) {
                this.observer.observe(element);
            }
        }, delay);
    }

    // Clean up animations
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
        }

        this.loadingElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });

        this.loadingElements.clear();
        this.activeAnimations.clear();
    }
}

// Global instance
window.ProfessionalAnimations = new ProfessionalAnimations();