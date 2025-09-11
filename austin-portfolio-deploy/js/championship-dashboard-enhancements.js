/**
 * Championship Dashboard Enhancements
 * Advanced Analytics Interface for Texas Football Authority
 * Built for Blaze Intelligence - Friday Night Lights Meet Championship Analytics
 */

class ChampionshipDashboardEnhancements {
    constructor() {
        this.texasColors = {
            burntOrange: '#BF5700',
            cardinalSky: '#9BCBEB', 
            oilerNavy: '#002244',
            grizzlyTeal: '#00B2A9',
            platinum: '#E5E4E2',
            graphite: '#36454F'
        };
        
        this.dashboardElements = new Map();
        this.animationQueue = [];
        this.performanceMetrics = new Map();
        
        this.init();
    }
    
    init() {
        this.setupChampionshipCards();
        this.createAdvancedCharts();
        this.implementFridayNightTheme();
        this.setupRealTimeUpdates();
        this.createChampionshipNotifications();
        this.optimizePerformance();
    }
    
    setupChampionshipCards() {
        const cardConfigs = [
            {
                id: 'texas-football-tradition',
                title: 'Texas Football Heritage',
                metric: '75+ Years',
                description: 'Decades of Friday Night Lights wisdom',
                color: this.texasColors.burntOrange,
                icon: '🏈'
            },
            {
                id: 'high-school-coverage',
                title: 'Championship Programs',
                metric: '1,200+',
                description: 'High schools in the network',
                color: this.texasColors.cardinalSky,
                icon: '🏟️'
            },
            {
                id: 'prediction-accuracy',
                title: 'Championship Calls',
                metric: '94.6%',
                description: 'State title prediction accuracy',
                color: this.texasColors.grizzlyTeal,
                icon: '🏆'
            },
            {
                id: 'friday-night-games',
                title: 'Friday Night Lights',
                metric: '2.8M+',
                description: 'Games analyzed and archived',
                color: this.texasColors.oilerNavy,
                icon: '💡'
            }
        ];
        
        cardConfigs.forEach(config => {
            this.createChampionshipCard(config);
        });
    }
    
    createChampionshipCard(config) {
        const existingCard = document.querySelector(`[data-card-id="${config.id}"]`);
        if (existingCard) {
            this.enhanceExistingCard(existingCard, config);
            return;
        }
        
        const cardHTML = `
            <div class="championship-card" data-card-id="${config.id}" style="
                background: linear-gradient(135deg, ${config.color}20 0%, ${config.color}10 100%);
                border: 2px solid ${config.color}30;
                border-radius: 16px;
                padding: 24px;
                margin: 16px;
                position: relative;
                overflow: hidden;
                backdrop-filter: blur(10px);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            ">
                <div class="card-glow" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, ${config.color}, transparent);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                "></div>
                
                <div class="card-header" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                ">
                    <div class="card-icon" style="
                        font-size: 28px;
                        filter: drop-shadow(0 2px 4px ${config.color}40);
                    ">${config.icon}</div>
                    <h3 style="
                        color: #FFFFFF;
                        font-weight: 700;
                        font-size: 18px;
                        margin: 0;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    ">${config.title}</h3>
                </div>
                
                <div class="card-metric" style="
                    font-size: 36px;
                    font-weight: 900;
                    color: ${config.color};
                    margin-bottom: 8px;
                    text-shadow: 0 2px 8px ${config.color}60;
                    font-family: 'SF Pro Display', -apple-system, system-ui, sans-serif;
                ">${config.metric}</div>
                
                <p class="card-description" style="
                    color: rgba(255, 255, 255, 0.8);
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.4;
                ">${config.description}</p>
                
                <div class="card-progress" style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: ${config.color};
                    transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
                    width: 0%;
                "></div>
            </div>
        `;
        
        // Find championship cards container or create one
        let container = document.querySelector('.championship-cards-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'championship-cards-container';
            container.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                padding: 20px;
                max-width: 1400px;
                margin: 0 auto;
            `;
            
            // Insert after hero section
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.insertAdjacentElement('afterend', container);
            }
        }
        
        container.insertAdjacentHTML('beforeend', cardHTML);
        
        // Animate card in
        const newCard = container.querySelector(`[data-card-id="${config.id}"]`);
        this.animateCardEntrance(newCard);
        this.setupCardInteractions(newCard, config);
    }
    
    enhanceExistingCard(card, config) {
        // Enhanced hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = `0 20px 40px ${config.color}40`;
            
            const glow = card.querySelector('.card-glow');
            if (glow) glow.style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
            
            const glow = card.querySelector('.card-glow');
            if (glow) glow.style.opacity = '0';
        });
    }
    
    animateCardEntrance(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px) scale(0.9)';
        
        // Intersection observer for scroll-triggered animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                    
                    // Animate progress bar
                    setTimeout(() => {
                        const progress = entry.target.querySelector('.card-progress');
                        if (progress) {
                            progress.style.width = '100%';
                        }
                    }, 400);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(card);
    }
    
    setupCardInteractions(card, config) {
        // Championship pulse animation
        const pulseInterval = setInterval(() => {
            if (!document.contains(card)) {
                clearInterval(pulseInterval);
                return;
            }
            
            const icon = card.querySelector('.card-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1)';
                }, 200);
            }
        }, 3000 + Math.random() * 2000);
        
        // Click interaction
        card.addEventListener('click', () => {
            this.triggerChampionshipEffect(card, config);
        });
    }
    
    createAdvancedCharts() {
        this.createChampionshipPredictionChart();
        this.createFridayNightPerformanceChart();
        this.createTexasFootballTrendsChart();
    }
    
    createChampionshipPredictionChart() {
        const chartContainer = document.createElement('div');
        chartContainer.id = 'championship-prediction-chart';
        chartContainer.style.cssText = `
            background: linear-gradient(135deg, ${this.texasColors.oilerNavy}90 0%, ${this.texasColors.graphite}60 100%);
            border-radius: 16px;
            padding: 24px;
            margin: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid ${this.texasColors.burntOrange}30;
        `;
        
        chartContainer.innerHTML = `
            <h3 style="color: ${this.texasColors.burntOrange}; margin-bottom: 20px; font-weight: 700;">
                🏆 Championship Prediction Accuracy
            </h3>
            <canvas id="prediction-chart" width="400" height="200"></canvas>
        `;
        
        // Insert after championship cards
        const cardsContainer = document.querySelector('.championship-cards-container');
        if (cardsContainer) {
            cardsContainer.insertAdjacentElement('afterend', chartContainer);
        }
        
        // Initialize Chart.js
        this.initializePredictionChart();
    }
    
    initializePredictionChart() {
        const canvas = document.getElementById('prediction-chart');
        if (!canvas || !window.Chart) return;
        
        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 4', 'Week 8', 'Playoffs', 'Semifinals', 'Championship'],
                datasets: [{
                    label: 'Prediction Accuracy',
                    data: [85, 89, 92, 94, 96, 94.6],
                    borderColor: this.texasColors.burntOrange,
                    backgroundColor: `${this.texasColors.burntOrange}20`,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.texasColors.cardinalSky,
                    pointBorderColor: this.texasColors.burntOrange,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: `${this.texasColors.platinum}20`
                        },
                        ticks: {
                            color: this.texasColors.platinum
                        }
                    },
                    y: {
                        grid: {
                            color: `${this.texasColors.platinum}20`
                        },
                        ticks: {
                            color: this.texasColors.platinum,
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        min: 80,
                        max: 100
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutCubic'
                }
            }
        });
    }
    
    implementFridayNightTheme() {
        // Stadium lights effect
        const createStadiumLights = () => {
            const lightsContainer = document.createElement('div');
            lightsContainer.className = 'friday-night-lights';
            lightsContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 100vh;
                pointer-events: none;
                z-index: -1;
                overflow: hidden;
            `;
            
            // Create light beams
            for (let i = 0; i < 6; i++) {
                const lightBeam = document.createElement('div');
                lightBeam.style.cssText = `
                    position: absolute;
                    top: ${Math.random() * 20}%;
                    left: ${i * 16 + Math.random() * 10}%;
                    width: 2px;
                    height: 100%;
                    background: linear-gradient(180deg, 
                        ${this.texasColors.cardinalSky}60 0%, 
                        transparent 50%
                    );
                    animation: lightFlicker ${3 + Math.random() * 2}s infinite;
                    transform: rotate(${-10 + Math.random() * 20}deg);
                `;
                lightsContainer.appendChild(lightBeam);
            }
            
            document.body.appendChild(lightsContainer);
        };
        
        // Add CSS for light animations
        const lightStyles = document.createElement('style');
        lightStyles.textContent = `
            @keyframes lightFlicker {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.8; }
            }
        `;
        document.head.appendChild(lightStyles);
        
        createStadiumLights();
    }
    
    setupRealTimeUpdates() {
        // Simulate real-time championship data updates
        setInterval(() => {
            this.updateChampionshipMetrics();
        }, 5000);
        
        // WebSocket connection for live data (when available)
        this.connectToLiveData();
    }
    
    updateChampionshipMetrics() {
        const cards = document.querySelectorAll('.championship-card');
        
        cards.forEach(card => {
            const metric = card.querySelector('.card-metric');
            if (metric && Math.random() < 0.1) { // 10% chance to update
                // Subtle metric animation
                metric.style.transform = 'scale(1.05)';
                metric.style.color = this.texasColors.burntOrange;
                
                setTimeout(() => {
                    metric.style.transform = 'scale(1)';
                }, 300);
            }
        });
    }
    
    connectToLiveData() {
        // Placeholder for WebSocket connection
        // Will connect to real-time sports data feeds
        console.log('🏈 Championship data stream initialized');
        
        // Simulate championship events
        setTimeout(() => {
            this.triggerChampionshipAlert('Texas State Championship game starting!');
        }, 10000);
    }
    
    createChampionshipNotifications() {
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'championship-notifications';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(notificationContainer);
    }
    
    triggerChampionshipAlert(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: linear-gradient(135deg, ${this.texasColors.burntOrange} 0%, ${this.texasColors.cardinalSky} 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            margin-bottom: 12px;
            box-shadow: 0 8px 32px rgba(191, 87, 0, 0.4);
            transform: translateX(420px);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            font-weight: 600;
            backdrop-filter: blur(10px);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 20px;">🏆</span>
                <span>${message}</span>
            </div>
        `;
        
        const container = document.getElementById('championship-notifications');
        container.appendChild(notification);
        
        // Slide in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(420px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 5000);
    }
    
    triggerChampionshipEffect(card, config) {
        // Championship celebration effect
        card.style.animation = 'championshipCelebration 1s ease-out';
        
        // Create confetti effect
        this.createConfettiEffect(card, config.color);
        
        // Trigger victory notification
        this.triggerChampionshipAlert(`🏈 ${config.title} Championship Mode Activated!`);
    }
    
    createConfettiEffect(element, color) {
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                width: 8px;
                height: 8px;
                background: ${color};
                pointer-events: none;
                z-index: 9999;
                border-radius: 50%;
            `;
            
            document.body.appendChild(confetti);
            
            // Animate confetti
            const animation = confetti.animate([
                {
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${(Math.random() - 0.5) * 200}px, ${Math.random() * 150 + 50}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 1000 + Math.random() * 500,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            animation.onfinish = () => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            };
        }
    }
    
    optimizePerformance() {
        // Lazy load heavy animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '50px'
        };
        
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in-view');
                }
            });
        }, observerOptions);
        
        // Observe all championship elements
        document.querySelectorAll('.championship-card, .championship-chart').forEach(el => {
            animationObserver.observe(el);
        });
        
        // Performance monitoring
        this.monitorPerformance();
    }
    
    monitorPerformance() {
        if (window.performance && window.performance.mark) {
            window.performance.mark('championship-dashboard-init');
            
            // Monitor frame rate
            let frameCount = 0;
            let lastTime = performance.now();
            
            const checkFrameRate = () => {
                frameCount++;
                const currentTime = performance.now();
                
                if (currentTime - lastTime >= 1000) {
                    const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                    this.performanceMetrics.set('fps', fps);
                    
                    // Adjust quality based on performance
                    if (fps < 30) {
                        this.reduceAnimationComplexity();
                    }
                    
                    frameCount = 0;
                    lastTime = currentTime;
                }
                
                requestAnimationFrame(checkFrameRate);
            };
            
            checkFrameRate();
        }
    }
    
    reduceAnimationComplexity() {
        // Reduce animation complexity for better performance
        document.querySelectorAll('.championship-card').forEach(card => {
            card.style.transition = 'transform 0.2s ease';
        });
        
        console.log('🏈 Championship dashboard: Performance mode activated');
    }
}

// CSS Animations
const championshipStyles = document.createElement('style');
championshipStyles.textContent = `
    @keyframes championshipCelebration {
        0% { transform: scale(1); }
        50% { transform: scale(1.05) rotate(2deg); }
        100% { transform: scale(1); }
    }
    
    .animate-in-view {
        animation: slideInFromBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    
    @keyframes slideInFromBottom {
        from {
            opacity: 0;
            transform: translateY(40px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(championshipStyles);

// Initialize Championship Dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.championshipDashboard = new ChampionshipDashboardEnhancements();
    
    // Championship mode event listener
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'c') {
            // Ctrl+C triggers championship celebration
            window.championshipDashboard.triggerChampionshipAlert('🏆 Championship Mode: ACTIVATED!');
        }
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChampionshipDashboardEnhancements;
}