/**
 * UI Management Module
 * Handles all user interface interactions and animations
 */

export default class UIManager {
    constructor(core) {
        this.core = core;
        this.elements = {};
        this.animations = {
            observers: new Map(),
            timers: new Map()
        };
        this.notifications = [];
    }

    async initialize() {
        this.cacheElements();
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupKeyboardShortcuts();
        this.initializeTheme();
        
        // Listen for core events
        this.core.on('state:changed', (event) => {
            this.handleStateChange(event.detail);
        });
        
        this.core.on('analytics:updated', (event) => {
            this.updateAnalyticsDisplay(event.detail);
        });
    }

    cacheElements() {
        this.elements = {
            // Navigation
            navbar: document.getElementById('navbar'),
            mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
            mobileMenu: document.getElementById('mobile-menu'),
            
            // Modals
            modal: document.getElementById('ai-modal'),
            modalContent: document.getElementById('modal-content-wrapper'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            modalCloseBtn: document.getElementById('modal-close-btn'),
            
            // Chat
            chatDisplay: document.getElementById('chatDisplay'),
            aiPromptInput: document.getElementById('ai-prompt-input'),
            getAiBtn: document.getElementById('get-ai-btn'),
            imageUpload: document.getElementById('ai-img-upload'),
            imgPreview: document.getElementById('img-preview'),
            
            // Analytics
            analyticsElements: {
                totalVisits: document.getElementById('total-visits'),
                aiInteractions: document.getElementById('ai-interactions'),
                codeGenerations: document.getElementById('code-generations'),
                trajectoryAnalyses: document.getElementById('trajectory-analyses'),
                projectIdeas: document.getElementById('project-ideas'),
                codeAnalyses: document.getElementById('code-analyses'),
                avgResponseTime: document.getElementById('avg-response-time'),
                lastModel: document.getElementById('last-model'),
                apiCalls: document.getElementById('api-calls'),
                visitorCount: document.getElementById('visitor-count')
            },
            
            // Project generation
            projectIdeaInput: document.getElementById('project-idea-input'),
            generateProjectBtn: document.getElementById('generate-project-btn'),
            projectsContainer: document.getElementById('projects-container'),
            generatedProjectsContainer: document.getElementById('generated-projects-container'),
            
            // Code lab
            codePrompt: document.getElementById('code-prompt'),
            codeLanguage: document.getElementById('code-language'),
            generateCodeBtn: document.getElementById('generate-code-btn'),
            analyzeCodeBtn: document.getElementById('analyze-code-btn'),
            
            // Other interactive elements
            analyzeTrajectoryBtn: document.getElementById('analyze-trajectory-btn'),
            loader: document.getElementById('loader')
        };
    }

    setupEventListeners() {
        // Mobile menu
        if (this.elements.mobileMenuToggle) {
            this.elements.mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Modal controls
        if (this.elements.modalCloseBtn) {
            this.elements.modalCloseBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }

        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.hideModal();
                }
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    this.smoothScrollTo(target);
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Image upload preview
        if (this.elements.imageUpload) {
            this.elements.imageUpload.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }

        // Enter key support for inputs
        [this.elements.aiPromptInput, this.elements.projectIdeaInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        this.triggerAssociatedButton(input);
                    }
                });
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    initializeAnimations() {
        // Reveal animation observer
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateReveal(entry.target);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all reveal elements
        document.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });

        this.animations.observers.set('reveal', revealObserver);

        // Parallax effect for hero section
        this.setupParallaxEffects();
    }

    setupParallaxEffects() {
        const heroSection = document.getElementById('home');
        if (heroSection) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.3;
                heroSection.style.transform = `translateY(${rate}px)`;
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus AI input
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusAIInput();
            }
            
            // Escape to close modal
            if (e.key === 'Escape') {
                this.hideModal();
                this.closeMobileMenu();
            }
            
            // Ctrl/Cmd + Enter to submit AI prompt
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (document.activeElement === this.elements.aiPromptInput) {
                    this.elements.getAiBtn?.click();
                }
            }
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('blazeTheme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }

    // UI State Management
    handleStateChange(change) {
        if (change.path?.startsWith('ui.')) {
            this.updateUIFromState();
        }
    }

    updateUIFromState() {
        const uiState = this.core.getState('ui');
        
        // Update mobile menu
        if (uiState.mobileMenuOpen) {
            this.elements.mobileMenu?.classList.remove('hidden');
            this.elements.mobileMenu?.classList.add('flex');
        } else {
            this.elements.mobileMenu?.classList.add('hidden');
            this.elements.mobileMenu?.classList.remove('flex');
        }
    }

    // Navigation
    toggleMobileMenu() {
        const isOpen = this.core.getState('ui.mobileMenuOpen');
        this.core.updateState('ui.mobileMenuOpen', !isOpen);
        this.core.updateAnalytics('mobileMenuToggle', 1);
    }

    closeMobileMenu() {
        this.core.updateState('ui.mobileMenuOpen', false);
    }

    handleScroll() {
        const scrollY = window.scrollY;
        
        // Navbar glass effect
        if (this.elements.navbar) {
            this.elements.navbar.classList.toggle('glass-nav', scrollY > 50);
        }
        
        // Update scroll-based animations
        this.updateScrollAnimations(scrollY);
    }

    updateScrollAnimations(scrollY) {
        // Add scroll-based effects here
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (inView) {
                section.classList.add('in-view');
            }
        });
    }

    smoothScrollTo(target) {
        const offsetTop = target.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }

    // Modal Management
    showModal(title, content, options = {}) {
        if (this.elements.modalTitle) {
            this.elements.modalTitle.innerHTML = title;
        }
        
        if (this.elements.modalBody) {
            this.elements.modalBody.innerHTML = content;
        }
        
        if (this.elements.modal) {
            this.elements.modal.style.display = 'flex';
            this.elements.modal.style.opacity = '0';
            
            // Animate in
            requestAnimationFrame(() => {
                this.elements.modal.style.opacity = '1';
                this.elements.modal.style.backdropFilter = 'blur(8px)';
                
                if (this.elements.modalContent) {
                    this.elements.modalContent.classList.add('opacity-100', 'translate-y-0');
                    this.elements.modalContent.classList.remove('opacity-0', '-translate-y-4');
                }
            });
        }
        
        this.core.updateState('ui.modalOpen', true);
        this.core.updateAnalytics('modalOpened', 1);
    }

    hideModal() {
        if (this.elements.modal && this.elements.modalContent) {
            this.elements.modal.style.opacity = '0';
            this.elements.modal.style.backdropFilter = 'blur(0px)';
            
            this.elements.modalContent.classList.remove('opacity-100', 'translate-y-0');
            this.elements.modalContent.classList.add('opacity-0', '-translate-y-4');
            
            setTimeout(() => {
                this.elements.modal.style.display = 'none';
            }, 300);
        }
        
        this.core.updateState('ui.modalOpen', false);
    }

    // Notifications
    showNotification(message, type = 'info', duration = 5000) {
        const notification = this.createNotificationElement(message, type);
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        this.notifications.push(notification);
    }

    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '10000',
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-out',
            backgroundColor: this.getNotificationColor(type),
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        });
        
        return notification;
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            info: '#3B82F6',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444'
        };
        return colors[type] || colors.info;
    }

    removeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    // Animation utilities
    animateReveal(element) {
        element.classList.add('visible');
        
        // Add additional entrance animations based on element type
        if (element.classList.contains('project-card')) {
            this.animateProjectCard(element);
        } else if (element.classList.contains('insight-card')) {
            this.animateInsightCard(element);
        }
    }

    animateProjectCard(card) {
        card.style.transform = 'translateY(30px)';
        card.style.opacity = '0';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
            card.style.transform = 'translateY(0)';
            card.style.opacity = '1';
        }, 100);
    }

    animateInsightCard(card) {
        card.style.transform = 'scale(0.9)';
        card.style.opacity = '0';
        
        setTimeout(() => {
            card.style.transition = 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
        }, 100);
    }

    // Analytics display updates
    updateAnalyticsDisplay(data) {
        const { metric, value } = data;
        const state = this.core.getState('analytics');
        
        // Update individual metrics
        Object.entries(this.elements.analyticsElements).forEach(([key, element]) => {
            if (element && state[key] !== undefined) {
                this.animateCounterUpdate(element, state[key]);
            }
        });
        
        // Update response time
        if (state.responseTimes.length > 0 && this.elements.analyticsElements.avgResponseTime) {
            const avgTime = state.responseTimes.reduce((a, b) => a + b, 0) / state.responseTimes.length;
            this.elements.analyticsElements.avgResponseTime.textContent = `${(avgTime / 1000).toFixed(2)}s`;
        }
    }

    animateCounterUpdate(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = Math.ceil((newValue - currentValue) / 10);
        
        if (increment === 0) return;
        
        const timer = setInterval(() => {
            const current = parseInt(element.textContent) || 0;
            const next = current + increment;
            
            if ((increment > 0 && next >= newValue) || (increment < 0 && next <= newValue)) {
                element.textContent = newValue;
                clearInterval(timer);
            } else {
                element.textContent = next;
            }
        }, 50);
    }

    // Image handling
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            if (this.elements.imgPreview) {
                this.elements.imgPreview.style.display = 'none';
            }
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.elements.imgPreview) {
                this.elements.imgPreview.src = e.target.result;
                this.elements.imgPreview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }

    // Helper methods
    triggerAssociatedButton(input) {
        if (input === this.elements.aiPromptInput) {
            this.elements.getAiBtn?.click();
        } else if (input === this.elements.projectIdeaInput) {
            this.elements.generateProjectBtn?.click();
        }
    }

    focusAIInput() {
        if (this.elements.aiPromptInput) {
            this.elements.aiPromptInput.focus();
            this.elements.aiPromptInput.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }

    handleResize() {
        // Update any size-dependent elements
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    // Loading states
    showLoader() {
        if (this.elements.loader) {
            this.elements.loader.style.display = 'flex';
            this.elements.loader.style.opacity = '1';
        }
    }

    hideLoader() {
        if (this.elements.loader) {
            this.elements.loader.style.opacity = '0';
            setTimeout(() => {
                this.elements.loader.style.display = 'none';
            }, 500);
        }
    }

    // Button loading states
    setButtonLoading(button, loading = true) {
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<div class="spinner"></div>';
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || 'Submit';
        }
    }

    // Theme switching
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('blazeTheme', newTheme);
        
        this.core.updateState('ui.darkMode', newTheme === 'dark');
        this.core.updateAnalytics('themeToggle', 1);
    }

    // Utility for creating elements
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }
}