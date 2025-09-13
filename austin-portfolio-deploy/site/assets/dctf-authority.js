// DCTF Authority Platform JavaScript
// Blaze Intelligence - The Deep South Sports Authority

class DCTFAuthority {
    constructor() {
        this.init();
        this.initStats();
        this.initTabs();
        this.initAnimations();
    }

    init() {
        // Initialize hero stats animation
        this.animateStats();
        
        // Initialize trust badge rotation
        this.rotateTrustBadges();
        
        // Initialize scroll effects
        this.initScrollEffects();
        
        console.log('🔥 DCTF Authority Platform Initialized');
    }

    initStats() {
        // Stats that animate on load
        const stats = [
            { element: '.stat-number', finalValue: 1437, suffix: '' },
            { element: '.stat-number', finalValue: 127000, suffix: '+' },
            { element: '.stat-number', finalValue: 94.6, suffix: '%' }
        ];

        const statElements = document.querySelectorAll('.stat-number');
        
        statElements.forEach((element, index) => {
            if (stats[index]) {
                this.animateNumber(element, 0, stats[index].finalValue, 2000, stats[index].suffix);
            }
        });
    }

    animateNumber(element, start, end, duration, suffix = '') {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = start + (end - start) * easeOut;
            
            if (end > 1000) {
                element.textContent = Math.floor(currentValue).toLocaleString() + suffix;
            } else {
                element.textContent = currentValue.toFixed(1) + suffix;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    rotateTrustBadges() {
        const badges = [
            'Perfect Game Analytics Partner Since 2024',
            'Dave Campbell\'s Texas Football Data Provider',
            'SEC Network Intelligence Source',
            'Official THSCA Analytics Partner'
        ];
        
        const badgeElement = document.querySelector('.badge-text');
        let currentIndex = 0;
        
        if (badgeElement) {
            setInterval(() => {
                badgeElement.style.opacity = '0';
                
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % badges.length;
                    badgeElement.textContent = badges[currentIndex];
                    badgeElement.style.opacity = '1';
                }, 500);
            }, 4000);
        }
    }

    initTabs() {
        const tabs = document.querySelectorAll('.tab');
        const panels = document.querySelectorAll('.product-panel');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs and panels
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                // Add active to clicked tab
                tab.classList.add('active');
                
                // Show corresponding panel
                const product = tab.dataset.product;
                const panel = document.getElementById(product);
                if (panel) {
                    panel.classList.add('active');
                }
            });
        });
    }

    initScrollEffects() {
        // Intersection Observer for proof cards animation
        const proofCards = document.querySelectorAll('.proof-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.style.opacity = '1';
                    }, index * 200);
                }
            });
        }, {
            threshold: 0.1
        });

        proofCards.forEach(card => {
            card.style.transform = 'translateY(50px)';
            card.style.opacity = '0';
            card.style.transition = 'all 0.6s ease';
            observer.observe(card);
        });
    }

    initAnimations() {
        // Add floating animation to hero elements
        const heroElements = document.querySelectorAll('.stat-card');
        
        heroElements.forEach((element, index) => {
            element.style.animation = `float 6s ease-in-out infinite`;
            element.style.animationDelay = `${index * 0.5}s`;
        });
        
        // Add CSS animation keyframes
        if (!document.getElementById('authority-animations')) {
            const style = document.createElement('style');
            style.id = 'authority-animations';
            style.textContent = `
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                
                .authority-badge {
                    animation: pulse 3s ease-in-out infinite;
                }
                
                .proof-icon {
                    animation: float 4s ease-in-out infinite;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Method to update live stats (called by external data)
    updateStats(newStats) {
        if (newStats.schools) {
            const schoolElement = document.querySelector('.stat-number[data-stat="schools"]');
            if (schoolElement) {
                this.animateNumber(schoolElement, parseInt(schoolElement.textContent.replace(/,/g, '')), newStats.schools, 1000);
            }
        }
        
        if (newStats.players) {
            const playerElement = document.querySelector('.stat-number[data-stat="players"]');
            if (playerElement) {
                this.animateNumber(playerElement, parseInt(playerElement.textContent.replace(/[,+]/g, '')), newStats.players, 1000, '+');
            }
        }
        
        if (newStats.accuracy) {
            const accuracyElement = document.querySelector('.stat-number[data-stat="accuracy"]');
            if (accuracyElement) {
                this.animateNumber(accuracyElement, parseFloat(accuracyElement.textContent.replace('%', '')), newStats.accuracy, 1000, '%');
            }
        }
    }

    // Method to add new trust badges dynamically
    addTrustBadge(badge) {
        const badgeElement = document.querySelector('.badge-text');
        if (badgeElement && !this.trustBadges.includes(badge)) {
            this.trustBadges.push(badge);
        }
    }
}

// Button click handlers
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DCTF Authority platform
    window.dcTFAuthority = new DCTFAuthority();
    
    // Add click handlers for CTA buttons
    document.querySelector('.btn-primary')?.addEventListener('click', () => {
        console.log('🏈 Texas Football Annual requested');
        // Could trigger modal or redirect to purchase page
        alert('🏈 The 2025 Texas Football Annual will be available for pre-order soon!\n\nGet notified when it launches: ahump20@outlook.com');
    });
    
    document.querySelector('.btn-secondary')?.addEventListener('click', () => {
        console.log('🔐 Scout Portal login requested');
        alert('🔐 Scout Portal Access\n\nFor scout credentials, please contact:\nahump20@outlook.com');
    });
    
    document.querySelector('.btn-tertiary')?.addEventListener('click', () => {
        console.log('🔍 Free player lookup requested');
        alert('🔍 Free Player Lookup\n\nSearch our database of 127,000+ players:\nComing Soon - Full launch expected Q1 2025');
    });
    
    // Subscribe button handler
    document.querySelector('.btn-subscribe')?.addEventListener('click', () => {
        console.log('💰 Subscription requested');
        alert('💰 Blaze Intelligence Subscription\n\nChoose your plan:\n• Basic: $19.99/month\n• Pro: $49.99/month\n• Elite: $99.99/month\n\nContact: ahump20@outlook.com');
    });
    
    // Login button handler
    document.querySelector('.btn-login')?.addEventListener('click', () => {
        console.log('👤 Login requested');
        alert('👤 Scout Login\n\nAccess your scout dashboard and reporting tools.\n\nCredentials required - Contact: ahump20@outlook.com');
    });
});

// Export for potential external use
window.DCTFAuthority = DCTFAuthority;