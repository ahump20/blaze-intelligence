// Blaze Intelligence Championship Configuration
// Deep South Sports Authority - Team Selection & Branding

window.BlazeChampionshipConfig = {
    // Brand Identity
    brand: {
        name: 'Blaze Intelligence',
        tagline: 'Where Friday Night Lights Meet Silicon Valley Innovation',
        description: 'Championship-caliber intelligence from Texas high school football to SEC glory',
        logo: '🔥',
        colors: {
            primary: '#BF5700', // Burnt Orange Heritage
            secondary: '#9BCBEB', // Cardinal Sky Blue
            accent: '#00B2A9', // Vancouver Throwback Teal
            dark: '#002244', // Tennessee Deep
            light: '#E5E4E2' // Platinum
        }
    },

    // Team Configurations - Customizable per deployment
    teams: {
        featured: [
            {
                id: 'cardinals',
                sport: 'mlb',
                apiId: 'STL',
                name: 'St. Louis Cardinals',
                icon: '⚾',
                colors: {
                    primary: '#C41E3A',
                    secondary: '#FEDB00'
                },
                enabled: true,
                priority: 1
            },
            {
                id: 'titans',
                sport: 'nfl',
                apiId: 'TEN',
                name: 'Tennessee Titans',
                icon: '🏈',
                colors: {
                    primary: '#002244',
                    secondary: '#4B92DB'
                },
                enabled: true,
                priority: 2
            },
            {
                id: 'longhorns',
                sport: 'ncaa',
                apiId: 'TEX',
                name: 'Texas Longhorns',
                icon: '🤘',
                colors: {
                    primary: '#BF5700',
                    secondary: '#FFFFFF'
                },
                enabled: true,
                priority: 3
            },
            {
                id: 'grizzlies',
                sport: 'nba',
                apiId: 'MEM',
                name: 'Memphis Grizzlies',
                icon: '🏀',
                colors: {
                    primary: '#5D76A9',
                    secondary: '#F5B112'
                },
                enabled: true,
                priority: 4
            }
        ],

        // Additional Deep South teams available for selection
        available: {
            mlb: [
                { id: 'astros', apiId: 'HOU', name: 'Houston Astros', icon: '⚾' },
                { id: 'rangers', apiId: 'TEX', name: 'Texas Rangers', icon: '⚾' }
            ],
            nfl: [
                { id: 'texans', apiId: 'HOU', name: 'Houston Texans', icon: '🏈' },
                { id: 'cowboys', apiId: 'DAL', name: 'Dallas Cowboys', icon: '🏈' },
                { id: 'saints', apiId: 'NO', name: 'New Orleans Saints', icon: '🏈' }
            ],
            nba: [
                { id: 'mavericks', apiId: 'DAL', name: 'Dallas Mavericks', icon: '🏀' },
                { id: 'spurs', apiId: 'SA', name: 'San Antonio Spurs', icon: '🏀' },
                { id: 'pelicans', apiId: 'NO', name: 'New Orleans Pelicans', icon: '🏀' }
            ],
            ncaa: [
                { id: 'aggies', apiId: 'TAMU', name: 'Texas A&M Aggies', icon: '👍' },
                { id: 'lsu', apiId: 'LSU', name: 'LSU Tigers', icon: '🐅' },
                { id: 'alabama', apiId: 'ALA', name: 'Alabama Crimson Tide', icon: '🐘' },
                { id: 'auburn', apiId: 'AUB', name: 'Auburn Tigers', icon: '🦅' },
                { id: 'ole_miss', apiId: 'MISS', name: 'Ole Miss Rebels', icon: '🔴' },
                { id: 'tennessee', apiId: 'TENN', name: 'Tennessee Volunteers', icon: '🍊' }
            ]
        }
    },

    // Data Update Settings
    dataSettings: {
        updateInterval: 30000, // 30 seconds for live games
        cacheTimeout: 300000, // 5 minutes for non-live data
        maxRetries: 3,
        endpoints: {
            live: '/.netlify/functions/auto-fetch-sports',
            scores: '/.netlify/functions/live-scores',
            recruitment: '/.netlify/functions/perfect-game-data'
        }
    },

    // Display Settings
    display: {
        showLiveIndicator: true,
        showWinProbability: true,
        showKeyPlayers: true,
        showLastPlay: true,
        showVenue: true,
        showBroadcast: true,
        animations: {
            enabled: true,
            championshipGlow: true,
            neuralBackground: true,
            dataRefresh: true
        }
    },

    // Feature Flags
    features: {
        visionAI: true,
        recruitmentPipeline: true,
        perfectGameIntegration: true,
        advancedAnalytics: true,
        neuralPatternRecognition: true,
        liveVideoIntelligence: true,
        microExpressionAnalysis: true,
        biomechanicalTracking: true
    },

    // Deep South Authority Messaging
    messaging: {
        hero: {
            title: 'Where Friday Night Lights Meet Silicon Valley Innovation',
            subtitle: 'Championship intelligence from the gridiron to the diamond',
            cta: 'Launch Vision AI Coaching'
        },
        features: [
            {
                title: 'Neural Pattern Recognition',
                description: 'Reading the game like a grizzled coach who\'s seen a thousand Friday nights under the lights'
            },
            {
                title: 'Vision AI Coaching',
                description: 'Biomechanics meets grit detection - finding champions by reading the fire in their eyes'
            },
            {
                title: 'Perfect Game Integration',
                description: 'From select ball diamonds to the Show - tracking every swing, every pitch, every dream'
            }
        ],
        testimonials: [
            {
                quote: 'This platform delivers intelligence that would make Bear Bryant tip his houndstooth hat',
                author: 'SEC Analytics Director'
            },
            {
                quote: 'Finally, technology that understands the heart of Texas football',
                author: 'High School Coach, Southlake Carroll'
            }
        ]
    },

    // Performance Metrics Display
    metrics: {
        dataPoints: '2.8M+',
        accuracy: '94.6%',
        responseTime: '<100ms',
        costSavings: '67-80%',
        showMethodsLink: true,
        methodsUrl: '/methods-definitions'
    },

    // API Keys and External Services (use environment variables in production)
    services: {
        perfectGame: {
            enabled: true,
            apiKey: process.env.PERFECT_GAME_API_KEY || 'mock',
            endpoint: 'https://api.perfectgame.org/v1'
        },
        espn: {
            enabled: true,
            rateLimit: 100, // requests per minute
            timeout: 5000
        }
    },

    // Customization Functions
    customize: {
        // Add or remove teams dynamically
        addTeam: function(team) {
            this.teams.featured.push(team);
            this.saveConfig();
        },

        removeTeam: function(teamId) {
            this.teams.featured = this.teams.featured.filter(t => t.id !== teamId);
            this.saveConfig();
        },

        // Update brand colors
        updateColors: function(colors) {
            Object.assign(this.brand.colors, colors);
            this.applyColors();
        },

        // Apply color changes to CSS variables
        applyColors: function() {
            const root = document.documentElement;
            Object.entries(this.brand.colors).forEach(([key, value]) => {
                root.style.setProperty(`--blaze-${key}`, value);
            });
        },

        // Save configuration to localStorage
        saveConfig: function() {
            localStorage.setItem('blazeChampionshipConfig', JSON.stringify({
                teams: this.teams,
                display: this.display,
                features: this.features
            }));
        },

        // Load saved configuration
        loadConfig: function() {
            const saved = localStorage.getItem('blazeChampionshipConfig');
            if (saved) {
                const config = JSON.parse(saved);
                Object.assign(this, config);
            }
        }
    },

    // Initialize configuration
    init: function() {
        // Load saved preferences
        this.customize.loadConfig.call(this);

        // Apply brand colors
        this.customize.applyColors.call(this);

        // Set up auto-refresh for live games
        if (this.dataSettings.updateInterval) {
            setInterval(() => {
                if (window.BlazeChampionship && window.BlazeChampionship.refreshData) {
                    window.BlazeChampionship.refreshData();
                }
            }, this.dataSettings.updateInterval);
        }

        console.log('🔥 Blaze Intelligence Championship Platform Initialized');
        console.log('📊 Teams Enabled:', this.teams.featured.filter(t => t.enabled).map(t => t.name));
        console.log('⚡ Features Active:', Object.entries(this.features).filter(([k, v]) => v).map(([k]) => k));
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.BlazeChampionshipConfig.init();
    });
} else {
    window.BlazeChampionshipConfig.init();
}