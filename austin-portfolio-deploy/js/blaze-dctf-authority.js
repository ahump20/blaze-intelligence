/**
 * Blaze Intelligence DCTF Authority Features
 * The Deep South Sports Authority Implementation
 */

class BlazeAuthority {
    constructor() {
        this.initLiveStats();
        this.initInteractiveMap();
        this.initProductTabs();
        this.initTrustBadges();
        this.initMegaMenus();
    }
    
    initLiveStats() {
        // Animate statistics on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        document.querySelectorAll('.stat-number').forEach(stat => {
            observer.observe(stat);
        });
    }
    
    animateNumber(element) {
        if (element.dataset.animated) return;
        element.dataset.animated = 'true';
        
        const finalText = element.textContent;
        const hasPlus = finalText.includes('+');
        const hasComma = finalText.includes(',');
        const target = parseInt(finalText.replace(/[^0-9]/g, ''));
        
        if (isNaN(target)) return; // Skip non-numeric values
        
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            let displayValue = this.formatNumber(Math.floor(current));
            if (hasPlus) displayValue += '+';
            element.textContent = displayValue;
        }, 16);
    }
    
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    initInteractiveMap() {
        // Interactive state map functionality
        document.querySelectorAll('.state-path').forEach(state => {
            state.addEventListener('mouseenter', (e) => {
                this.showStateStats(e.target.dataset.state);
            });
            
            state.addEventListener('click', (e) => {
                this.navigateToState(e.target.dataset.state);
            });
        });
    }
    
    showStateStats(state) {
        const stats = this.getStateStats(state);
        this.updateMapStats(stats);
    }
    
    getStateStats(state) {
        const stateData = {
            'TX': {
                highSchools: 1437,
                colleges: 12,
                prospects: 45000,
                draftPicks2024: 127,
                keyPrograms: ['Allen', 'Westlake', 'Duncanville', 'Katy', 'North Shore']
            },
            'LA': {
                highSchools: 287,
                colleges: 4,
                prospects: 8500,
                draftPicks2024: 34,
                keyPrograms: ['John Curtis', 'Karr', 'Catholic BR', 'Acadiana']
            },
            'AL': {
                highSchools: 356,
                colleges: 5,
                prospects: 12000,
                draftPicks2024: 45,
                keyPrograms: ['Hoover', 'Thompson', 'Central-Phenix City']
            },
            'MS': {
                highSchools: 240,
                colleges: 3,
                prospects: 6500,
                draftPicks2024: 28,
                keyPrograms: ['Starkville', 'Madison Central', 'Brandon']
            },
            'AR': {
                highSchools: 290,
                colleges: 2,
                prospects: 5500,
                draftPicks2024: 18,
                keyPrograms: ['Bentonville', 'Bryant', 'North Little Rock']
            }
        };
        
        return stateData[state] || {};
    }
    
    updateMapStats(stats) {
        // Update the map statistics display
        if (!stats.highSchools) return;
        
        const mapStats = document.querySelector('.map-stats');
        if (mapStats) {
            // Update displayed statistics
            mapStats.innerHTML = `
                <div class="region-stat">
                    <h4>High Schools</h4>
                    <span>${stats.highSchools}</span>
                </div>
                <div class="region-stat">
                    <h4>Prospects</h4>
                    <span>${this.formatNumber(stats.prospects)}</span>
                </div>
                <div class="region-stat">
                    <h4>2024 Draft Picks</h4>
                    <span>${stats.draftPicks2024}</span>
                </div>
            `;
        }
    }
    
    navigateToState(state) {
        // Navigate to state-specific page
        const stateUrls = {
            'TX': '/texas',
            'LA': '/louisiana',
            'AL': '/alabama',
            'MS': '/mississippi',
            'AR': '/arkansas'
        };
        
        if (stateUrls[state]) {
            window.location.href = stateUrls[state];
        }
    }
    
    initProductTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchProduct(e.target.dataset.product);
            });
        });
    }
    
    switchProduct(product) {
        // Remove active classes
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.product-panel').forEach(p => p.classList.remove('active'));
        
        // Add active classes
        const activeTab = document.querySelector(`[data-product="${product}"]`);
        const activePanel = document.getElementById(product);
        
        if (activeTab) activeTab.classList.add('active');
        if (activePanel) activePanel.classList.add('active');
    }
    
    initTrustBadges() {
        // Rotate through trust badges
        const badges = [
            'The Official Intelligence Partner of Championship Programs',
            'Dave Campbell\'s Texas Football Partner',
            'SEC Network Data Provider',
            'Perfect Game Analytics Partner',
            'Trusted by 500+ High Schools',
            'The Deep South Sports Authority'
        ];
        
        let current = 0;
        const badgeText = document.querySelector('.badge-text');
        
        if (badgeText) {
            setInterval(() => {
                current = (current + 1) % badges.length;
                
                // Fade out
                badgeText.style.opacity = '0';
                
                setTimeout(() => {
                    badgeText.textContent = badges[current];
                    // Fade in
                    badgeText.style.opacity = '1';
                }, 300);
            }, 5000);
        }
    }
    
    initMegaMenus() {
        // Enhanced mega menu interactions
        document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
            const menu = dropdown.querySelector('.mega-menu');
            if (!menu) return;
            
            // Smooth hover effects
            dropdown.addEventListener('mouseenter', () => {
                menu.style.opacity = '0';
                menu.style.display = 'grid';
                
                // Trigger reflow
                menu.offsetHeight;
                
                // Fade in
                menu.style.transition = 'opacity 0.3s ease';
                menu.style.opacity = '1';
            });
            
            dropdown.addEventListener('mouseleave', () => {
                menu.style.opacity = '0';
                setTimeout(() => {
                    if (menu.style.opacity === '0') {
                        menu.style.display = 'none';
                    }
                }, 300);
            });
        });
    }
    
    // Initialize real-time data feeds
    initRealTimeFeeds() {
        // Simulate real-time updates
        setInterval(() => {
            this.updateLiveScores();
            this.updateRecruitingAlerts();
        }, 30000); // Update every 30 seconds
    }
    
    updateLiveScores() {
        const liveScoreElement = document.querySelector('.live-scores');
        if (!liveScoreElement) return;
        
        // Simulate live score updates
        const scores = [
            'Allen 28 - Westlake 21 (4Q)',
            'Duncanville 35 - DeSoto 28 (Final)',
            'Katy 14 - North Shore 17 (3Q)',
            'John Curtis 42 - Karr 35 (Final)'
        ];
        
        const randomScore = scores[Math.floor(Math.random() * scores.length)];
        liveScoreElement.textContent = randomScore;
    }
    
    updateRecruitingAlerts() {
        const alertElement = document.querySelector('.recruiting-alert');
        if (!alertElement) return;
        
        const alerts = [
            '⭐⭐⭐⭐⭐ QB commits to Texas',
            '⭐⭐⭐⭐ RB decommits from LSU',
            '⭐⭐⭐⭐⭐ WR visiting Alabama',
            'Transfer Portal: SEC starter enters'
        ];
        
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        
        // Fade out, change, fade in
        alertElement.style.opacity = '0';
        setTimeout(() => {
            alertElement.textContent = randomAlert;
            alertElement.style.opacity = '1';
        }, 300);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize authority features
    const blazeAuthority = new BlazeAuthority();
    
    // Start real-time feeds
    blazeAuthority.initRealTimeFeeds();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add loading animation for data fetches
    window.addEventListener('beforeunload', () => {
        document.body.style.opacity = '0.5';
    });
});

// Export for use in other modules
window.BlazeAuthority = BlazeAuthority;