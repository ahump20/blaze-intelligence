// Dynamic Validation System
// Fetches real-time validation data from APIs to replace hard-coded metrics
// Ensures transparency and credibility for Blaze Intelligence platform

class DynamicValidationSystem {
    constructor() {
        this.validationCache = null;
        this.dataSourcesCache = null;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.lastValidationFetch = 0;
        this.lastDataSourcesFetch = 0;
        
        // Default fallback values - only shown when API is unavailable
        this.fallbackData = {
            digitalCombine: {
                accuracy: null,
                status: 'Validation data unavailable',
                austinValidated: false
            },
            nilValuation: {
                accuracy: null,
                status: 'Validation data unavailable',
                austinValidated: false
            },
            pressureAnalytics: {
                accuracy: null,
                status: 'Validation data unavailable',
                austinValidated: false
            }
        };
    }
    
    async fetchValidationData() {
        const now = Date.now();
        
        // Return cached data if still valid
        if (this.validationCache && (now - this.lastValidationFetch) < this.cacheTimeout) {
            return this.validationCache;
        }
        
        try {
            console.log('🔍 Fetching real-time validation data...');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            
            const response = await fetch('/api/metrics/validation', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Validation API returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Process real API data into standardized format
            this.validationCache = {
                digitalCombine: {
                    accuracy: data.byModel?.digitalCombine?.biomechanicalAccuracy || null,
                    status: data.byModel?.digitalCombine?.status || 'unknown',
                    sampleSize: data.byModel?.digitalCombine?.sampleSize || 0,
                    note: data.byModel?.digitalCombine?.note || '',
                    austinValidated: data.byModel?.digitalCombine?.status === 'validated' || false,
                    lastUpdate: data.timestamp || new Date().toISOString()
                },
                nilValuation: {
                    accuracy: data.byModel?.nilValuation?.accuracy || null,
                    marketCorrelation: data.byModel?.nilValuation?.marketCorrelation || null,
                    sampleSize: data.byModel?.nilValuation?.sampleSize || 0,
                    austinValidated: (data.byModel?.nilValuation?.accuracy && 
                                    parseFloat(data.byModel.nilValuation.accuracy.replace(/[^\d.-]/g, '')) >= 75) || false,
                    lastUpdate: data.byModel?.nilValuation?.lastUpdate || new Date().toISOString()
                },
                pressureAnalytics: {
                    accuracy: data.byModel?.pressureAnalytics?.accuracy || null,
                    precision: data.byModel?.pressureAnalytics?.precision || null,
                    f1Score: data.byModel?.pressureAnalytics?.f1Score || null,
                    sampleSize: data.byModel?.pressureAnalytics?.sampleSize || 0,
                    austinValidated: (data.byModel?.pressureAnalytics?.accuracy && 
                                    parseFloat(data.byModel.pressureAnalytics.accuracy.replace(/[^\d.-]/g, '')) >= 80) || false,
                    lastUpdate: data.byModel?.pressureAnalytics?.lastUpdate || new Date().toISOString()
                },
                metadata: {
                    systemAccuracy: data.overall?.systemAccuracy || null,
                    totalPredictions: data.overall?.totalPredictions || 0,
                    validationWindow: data.overall?.validationWindow || '30 days',
                    lastValidation: data.overall?.lastValidation || new Date().toISOString(),
                    timestamp: data.timestamp || new Date().toISOString()
                }
            };
            
            this.lastValidationFetch = now;
            console.log('✅ Validation data loaded successfully:', this.validationCache);
            return this.validationCache;
            
        } catch (error) {
            console.warn('⚠️ Failed to fetch validation data:', error.message);
            
            // Return fallback data with error indication
            return {
                ...this.fallbackData,
                error: error.message,
                timestamp: new Date().toISOString(),
                fallbackMode: true
            };
        }
    }
    
    async fetchDataSources() {
        const now = Date.now();
        
        // Return cached data if still valid
        if (this.dataSourcesCache && (now - this.lastDataSourcesFetch) < this.cacheTimeout) {
            return this.dataSourcesCache;
        }
        
        try {
            console.log('🔍 Fetching data sources...');
            
            const response = await fetch('/api/docs/data-sources', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Data sources API returned ${response.status}`);
            }
            
            const data = await response.json();
            this.dataSourcesCache = data;
            this.lastDataSourcesFetch = now;
            
            console.log('✅ Data sources loaded successfully');
            return this.dataSourcesCache;
            
        } catch (error) {
            console.warn('⚠️ Failed to fetch data sources:', error.message);
            return {
                error: error.message,
                timestamp: new Date().toISOString(),
                fallbackMode: true
            };
        }
    }
    
    async updateDigitalCombineValidation(containerId = '.validation-status') {
        try {
            const validationData = await this.fetchValidationData();
            const container = document.querySelector(containerId);
            
            if (!container) {
                console.warn('Digital Combine validation container not found');
                return;
            }
            
            const digitalCombineData = validationData.digitalCombine;
            
            // Update accuracy display
            const accuracyElement = container.querySelector('.accuracy-value');
            if (accuracyElement) {
                if (digitalCombineData.accuracy && digitalCombineData.accuracy !== 'pending_validation') {
                    accuracyElement.textContent = digitalCombineData.accuracy;
                    accuracyElement.classList.remove('loading');
                } else {
                    accuracyElement.textContent = 'Validation in progress';
                    accuracyElement.classList.add('loading');
                }
            }
            
            // Update Austin Validated badge
            const austinBadge = container.querySelector('.austin-validated-badge');
            if (austinBadge) {
                if (digitalCombineData.austinValidated) {
                    austinBadge.style.display = 'inline-block';
                    austinBadge.textContent = 'Austin Validated';
                } else {
                    austinBadge.style.display = 'none';
                }
            }
            
            // Update sample size
            const sampleElement = container.querySelector('.sample-size');
            if (sampleElement && digitalCombineData.sampleSize) {
                sampleElement.textContent = `Sample size: ${digitalCombineData.sampleSize.toLocaleString()}`;
            }
            
            // Update last validation time
            const timestampElement = container.querySelector('.last-validation');
            if (timestampElement) {
                const lastUpdate = new Date(digitalCombineData.lastUpdate || validationData.metadata.timestamp);
                timestampElement.textContent = `Last validated: ${lastUpdate.toLocaleDateString()}`;
            }
            
            // Show error state if in fallback mode
            if (validationData.fallbackMode) {
                const errorElement = container.querySelector('.validation-error') || 
                                   this.createErrorElement('Validation data temporarily unavailable');
                container.appendChild(errorElement);
            }
            
        } catch (error) {
            console.error('Error updating Digital Combine validation:', error);
            this.showValidationError(containerId, 'Failed to load validation data');
        }
    }
    
    async updateNILValidation(containerId = '.nil-validation-status') {
        try {
            const validationData = await this.fetchValidationData();
            const container = document.querySelector(containerId);
            
            if (!container) {
                console.warn('NIL validation container not found');
                return;
            }
            
            const nilData = validationData.nilValuation;
            
            // Update accuracy display
            const accuracyElement = container.querySelector('.accuracy-value');
            if (accuracyElement && nilData.accuracy) {
                accuracyElement.textContent = nilData.accuracy;
                accuracyElement.classList.remove('loading');
            } else if (accuracyElement) {
                accuracyElement.textContent = 'Loading validation data...';
                accuracyElement.classList.add('loading');
            }
            
            // Update market correlation
            const correlationElement = container.querySelector('.market-correlation');
            if (correlationElement && nilData.marketCorrelation) {
                correlationElement.textContent = `Market correlation: ${(nilData.marketCorrelation * 100).toFixed(1)}%`;
            }
            
            // Update Austin Validated badge
            const austinBadge = container.querySelector('.austin-validated-badge');
            if (austinBadge) {
                if (nilData.austinValidated) {
                    austinBadge.style.display = 'inline-block';
                    austinBadge.textContent = 'Austin Validated';
                } else {
                    austinBadge.style.display = 'none';
                }
            }
            
            // Update sample size
            const sampleElement = container.querySelector('.sample-size');
            if (sampleElement && nilData.sampleSize) {
                sampleElement.textContent = `Sample size: ${nilData.sampleSize.toLocaleString()}`;
            }
            
        } catch (error) {
            console.error('Error updating NIL validation:', error);
            this.showValidationError(containerId, 'Failed to load validation data');
        }
    }
    
    async updatePressureAnalyticsValidation(containerId = '.pressure-validation-status') {
        try {
            const validationData = await this.fetchValidationData();
            const container = document.querySelector(containerId);
            
            if (!container) {
                console.warn('Pressure Analytics validation container not found');
                return;
            }
            
            const pressureData = validationData.pressureAnalytics;
            
            // Update accuracy display
            const accuracyElement = container.querySelector('.accuracy-value');
            if (accuracyElement && pressureData.accuracy) {
                accuracyElement.textContent = pressureData.accuracy;
                accuracyElement.classList.remove('loading');
            } else if (accuracyElement) {
                accuracyElement.textContent = 'Loading validation data...';
                accuracyElement.classList.add('loading');
            }
            
            // Update precision score
            const precisionElement = container.querySelector('.precision-score');
            if (precisionElement && pressureData.precision) {
                precisionElement.textContent = `Precision: ${(pressureData.precision * 100).toFixed(1)}%`;
            }
            
            // Update F1 Score
            const f1Element = container.querySelector('.f1-score');
            if (f1Element && pressureData.f1Score) {
                f1Element.textContent = `F1 Score: ${pressureData.f1Score.toFixed(3)}`;
            }
            
            // Update Austin Validated badge
            const austinBadge = container.querySelector('.austin-validated-badge');
            if (austinBadge) {
                if (pressureData.austinValidated) {
                    austinBadge.style.display = 'inline-block';
                    austinBadge.textContent = 'Austin Validated';
                } else {
                    austinBadge.style.display = 'none';
                }
            }
            
        } catch (error) {
            console.error('Error updating Pressure Analytics validation:', error);
            this.showValidationError(containerId, 'Failed to load validation data');
        }
    }
    
    createErrorElement(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.style.cssText = `
            color: #FF5555;
            font-size: 0.875rem;
            padding: 0.5rem;
            border: 1px solid rgba(255, 85, 85, 0.3);
            border-radius: 4px;
            background: rgba(255, 85, 85, 0.1);
            margin-top: 0.5rem;
        `;
        errorDiv.textContent = message;
        return errorDiv;
    }
    
    showValidationError(containerId, message) {
        const container = document.querySelector(containerId);
        if (container) {
            const existingError = container.querySelector('.validation-error');
            if (existingError) {
                existingError.remove();
            }
            
            const errorElement = this.createErrorElement(message);
            container.appendChild(errorElement);
        }
    }
    
    // Initialize validation updates for all supported pages
    async initializePageValidation() {
        const currentPath = window.location.pathname;
        
        console.log(`🚀 Initializing dynamic validation for: ${currentPath}`);
        
        if (currentPath.includes('digital-combine')) {
            await this.updateDigitalCombineValidation();
            
            // Refresh every 5 minutes
            setInterval(() => {
                this.updateDigitalCombineValidation();
            }, this.cacheTimeout);
            
        } else if (currentPath.includes('nil')) {
            await this.updateNILValidation();
            
            setInterval(() => {
                this.updateNILValidation();
            }, this.cacheTimeout);
            
        } else if (currentPath.includes('pressure-dashboard')) {
            await this.updatePressureAnalyticsValidation();
            
            setInterval(() => {
                this.updatePressureAnalyticsValidation();
            }, this.cacheTimeout);
        }
        
        console.log('✅ Dynamic validation system initialized');
    }
    
    // Clear caches (useful for development/testing)
    clearCaches() {
        this.validationCache = null;
        this.dataSourcesCache = null;
        this.lastValidationFetch = 0;
        this.lastDataSourcesFetch = 0;
        console.log('🧹 Validation caches cleared');
    }
}

// Global instance
window.dynamicValidation = new DynamicValidationSystem();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dynamicValidation.initializePageValidation();
    });
} else {
    // DOM already loaded
    window.dynamicValidation.initializePageValidation();
}