// Blaze Multimodal Intelligence Configuration
// This file manages API keys and configuration for the multimodal system

class MultimodalConfig {
    constructor() {
        // API Keys (stored in localStorage for security)
        this.apiKeys = {
            openai: this.getStoredKey('openai_api_key'),
            anthropic: this.getStoredKey('anthropic_api_key'),
            gemini: this.getStoredKey('gemini_api_key'),
            huggingface: this.getStoredKey('huggingface_api_key'),
            stripe: this.getStoredKey('stripe_public_key')
        };

        // WebSocket Configuration
        this.websocket = {
            url: window.location.hostname === 'localhost'
                ? 'ws://localhost:8080/ws'
                : 'wss://blaze-intelligence.netlify.app/ws',
            reconnectInterval: 5000,
            maxReconnectAttempts: 10
        };

        // Performance Targets
        this.performance = {
            targetLatency: 100, // ms
            videoFPS: 30,
            audioSampleRate: 16000,
            decisionThreshold: 0.85,
            syncTolerance: 20 // ms
        };

        // Championship Metrics Configuration
        this.championMetrics = {
            focusIntensity: { min: 0, max: 100, unit: '%' },
            mentalResilience: { min: 0, max: 100, unit: '%' },
            emotionalControl: { min: 0, max: 100, unit: '%' },
            decisionSpeed: { min: 0, max: 200, unit: 'ms' },
            patternRecognition: { min: 0, max: 100, unit: '%' },
            biomechanicalScore: { min: 0, max: 100, unit: 'pts' },
            characterAssessment: {
                levels: ['Emerging', 'Developing', 'Strong', 'Elite', 'Championship']
            },
            championshipLevel: { min: 0, max: 10, unit: 'level' }
        };

        // Model Configurations
        this.models = {
            vision: {
                type: 'coco-ssd', // or 'yolo', 'mediapipe'
                confidence: 0.5,
                maxDetections: 20
            },
            audio: {
                type: 'web-speech-api', // or 'whisper', 'riva'
                language: 'en-US',
                continuous: true,
                interimResults: true
            },
            llm: {
                provider: 'openai', // or 'anthropic', 'gemini'
                model: 'gpt-4-turbo-preview',
                temperature: 0.7,
                maxTokens: 1000
            }
        };

        // Sports Team Configuration
        this.teams = {
            mlb: { primary: 'Cardinals', secondary: ['Astros', 'Yankees'] },
            nfl: { primary: 'Titans', secondary: ['Chiefs', 'Cowboys'] },
            ncaa: { primary: 'Longhorns', secondary: ['Alabama', 'Georgia'] },
            nba: { primary: 'Grizzlies', secondary: ['Lakers', 'Celtics'] }
        };

        // Data Sources
        this.dataSources = {
            live: {
                mlb: 'https://statsapi.mlb.com/api/v1',
                nfl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
                ncaa: 'https://api.collegefootballdata.com',
                perfectGame: 'https://www.perfectgame.org/api'
            },
            cache: {
                enabled: true,
                ttl: 300000, // 5 minutes
                storage: 'localStorage'
            }
        };
    }

    // Store API key securely in localStorage
    setApiKey(provider, key) {
        if (!key) return false;

        try {
            localStorage.setItem(`blaze_${provider}_api_key`, this.encrypt(key));
            this.apiKeys[provider] = key;
            return true;
        } catch (error) {
            console.error(`Error storing ${provider} API key:`, error);
            return false;
        }
    }

    // Get stored API key
    getStoredKey(keyName) {
        try {
            const encrypted = localStorage.getItem(`blaze_${keyName}`);
            return encrypted ? this.decrypt(encrypted) : null;
        } catch (error) {
            console.error(`Error retrieving ${keyName}:`, error);
            return null;
        }
    }

    // Simple encryption (use a proper encryption library in production)
    encrypt(text) {
        // This is a simple obfuscation - use proper encryption in production
        return btoa(text);
    }

    decrypt(text) {
        // This is a simple deobfuscation - use proper decryption in production
        return atob(text);
    }

    // Validate API keys
    async validateApiKeys() {
        const results = {};

        // Validate OpenAI
        if (this.apiKeys.openai) {
            results.openai = await this.testOpenAI();
        }

        // Validate Anthropic
        if (this.apiKeys.anthropic) {
            results.anthropic = await this.testAnthropic();
        }

        // Validate Gemini
        if (this.apiKeys.gemini) {
            results.gemini = await this.testGemini();
        }

        return results;
    }

    // Test OpenAI API
    async testOpenAI() {
        if (!this.apiKeys.openai) return false;

        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.openai}`
                }
            });
            return response.ok;
        } catch (error) {
            console.error('OpenAI API test failed:', error);
            return false;
        }
    }

    // Test Anthropic API
    async testAnthropic() {
        if (!this.apiKeys.anthropic) return false;

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKeys.anthropic,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 10,
                    messages: [{ role: 'user', content: 'test' }]
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Anthropic API test failed:', error);
            return false;
        }
    }

    // Test Gemini API
    async testGemini() {
        if (!this.apiKeys.gemini) return false;

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKeys.gemini}`
            );
            return response.ok;
        } catch (error) {
            console.error('Gemini API test failed:', error);
            return false;
        }
    }

    // Get configuration for specific component
    getConfig(component) {
        switch(component) {
            case 'vision':
                return this.models.vision;
            case 'audio':
                return this.models.audio;
            case 'llm':
                return this.models.llm;
            case 'performance':
                return this.performance;
            case 'metrics':
                return this.championMetrics;
            case 'teams':
                return this.teams;
            case 'websocket':
                return this.websocket;
            default:
                return null;
        }
    }

    // Update configuration
    updateConfig(component, updates) {
        if (this[component]) {
            Object.assign(this[component], updates);
            this.saveConfiguration();
            return true;
        }
        return false;
    }

    // Save configuration to localStorage
    saveConfiguration() {
        try {
            const config = {
                performance: this.performance,
                models: this.models,
                teams: this.teams,
                dataSources: this.dataSources
            };
            localStorage.setItem('blaze_multimodal_config', JSON.stringify(config));
            return true;
        } catch (error) {
            console.error('Error saving configuration:', error);
            return false;
        }
    }

    // Load configuration from localStorage
    loadConfiguration() {
        try {
            const saved = localStorage.getItem('blaze_multimodal_config');
            if (saved) {
                const config = JSON.parse(saved);
                Object.assign(this, config);
                return true;
            }
        } catch (error) {
            console.error('Error loading configuration:', error);
        }
        return false;
    }

    // Export configuration (without sensitive data)
    exportConfig() {
        return {
            performance: this.performance,
            models: this.models,
            teams: this.teams,
            championMetrics: this.championMetrics,
            dataSources: this.dataSources,
            websocket: {
                url: this.websocket.url,
                reconnectInterval: this.websocket.reconnectInterval
            }
        };
    }

    // Import configuration
    importConfig(config) {
        try {
            if (config.performance) this.performance = config.performance;
            if (config.models) this.models = config.models;
            if (config.teams) this.teams = config.teams;
            if (config.championMetrics) this.championMetrics = config.championMetrics;
            if (config.dataSources) this.dataSources = config.dataSources;
            this.saveConfiguration();
            return true;
        } catch (error) {
            console.error('Error importing configuration:', error);
            return false;
        }
    }
}

// Create and export singleton instance
const multimodalConfig = new MultimodalConfig();

// Auto-load saved configuration
multimodalConfig.loadConfiguration();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = multimodalConfig;
} else {
    window.BlazeMultimodalConfig = multimodalConfig;
}