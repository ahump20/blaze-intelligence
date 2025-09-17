/**
 * Deep South Sports Authority - Status Badge Manager
 * Professional Feature Status Component System
 */

class StatusBadgeManager {
    constructor() {
        this.statusTypes = {
            LIVE: {
                class: 'status-badge--live',
                icon: '●',
                label: 'LIVE',
                description: 'Fully functional with real data'
            },
            BETA: {
                class: 'status-badge--beta',
                icon: '◐',
                label: 'BETA',
                description: 'Working prototype, results may vary'
            },
            RESEARCH: {
                class: 'status-badge--research',
                icon: '◯',
                label: 'RESEARCH',
                description: 'Experimental concept, limited functionality'
            },
            COMING_SOON: {
                class: 'status-badge--coming-soon',
                icon: '⏳',
                label: 'COMING SOON',
                description: 'Planned feature, not yet available'
            },
            AUSTIN_VERIFIED: {
                class: 'status-badge--austin-verified',
                icon: '🏈',
                label: 'AUSTIN VERIFIED',
                description: 'Authenticated expertise from championship experience'
            }
        };
        
        this.init();
    }

    init() {
        // Auto-initialize badges on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeExistingBadges();
            this.attachEventListeners();
        });
    }

    /**
     * Create a status badge element
     * @param {string} statusType - One of the status types
     * @param {Object} options - Configuration options
     * @returns {HTMLElement} - The badge element
     */
    createBadge(statusType, options = {}) {
        const {
            size = 'default', // 'default', 'large', 'xl'
            showIcon = true,
            showDescription = false,
            customText = null,
            id = null
        } = options;

        const status = this.statusTypes[statusType];
        if (!status) {
            console.error(`Invalid status type: ${statusType}`);
            return null;
        }

        const badge = document.createElement('span');
        badge.className = `status-badge ${status.class}`;
        
        // Add size modifier
        if (size !== 'default') {
            badge.classList.add(`status-badge--${size}`);
        }

        // Add ID if provided
        if (id) {
            badge.id = id;
        }

        // Build badge content
        let content = '';
        
        if (showIcon) {
            content += `<span class="status-badge-icon" aria-hidden="true"></span>`;
        }
        
        content += `<span class="status-badge-text">${customText || status.label}</span>`;
        
        badge.innerHTML = content;

        // Add description tooltip if requested
        if (showDescription) {
            badge.title = status.description;
        }

        return badge;
    }

    /**
     * Create a feature status card with badge
     * @param {Object} config - Feature configuration
     * @returns {HTMLElement} - The feature card element
     */
    createFeatureCard(config) {
        const {
            title,
            description,
            statusType,
            details = null,
            actionButton = null
        } = config;

        const card = document.createElement('div');
        card.className = 'feature-status-card';

        const header = document.createElement('div');
        header.className = 'feature-status-header';

        const titleElement = document.createElement('h3');
        titleElement.className = 'feature-status-title';
        titleElement.textContent = title;

        const badge = this.createBadge(statusType, { showDescription: true });

        header.appendChild(titleElement);
        header.appendChild(badge);

        const descElement = document.createElement('p');
        descElement.className = 'feature-status-description';
        descElement.textContent = description;

        card.appendChild(header);
        card.appendChild(descElement);

        // Add footer if details or action provided
        if (details || actionButton) {
            const footer = document.createElement('div');
            footer.className = 'feature-status-footer';

            if (details) {
                const detailsElement = document.createElement('span');
                detailsElement.className = 'feature-status-details';
                detailsElement.textContent = details;
                footer.appendChild(detailsElement);
            }

            if (actionButton) {
                footer.appendChild(actionButton);
            }

            card.appendChild(footer);
        }

        return card;
    }

    /**
     * Create a capability disclaimer
     * @param {string} statusType - Status type for styling
     * @param {string} message - Disclaimer message
     * @returns {HTMLElement} - The disclaimer element
     */
    createDisclaimer(statusType, message) {
        const disclaimer = document.createElement('div');
        disclaimer.className = `capability-disclaimer capability-disclaimer--${statusType.toLowerCase()}`;

        const icon = document.createElement('i');
        icon.className = 'capability-disclaimer__icon fas fa-info-circle';

        const text = document.createElement('p');
        text.className = 'capability-disclaimer__text';
        text.innerHTML = message;

        disclaimer.appendChild(icon);
        disclaimer.appendChild(text);

        return disclaimer;
    }

    /**
     * Create Austin authority badge
     * @param {Object} options - Configuration options
     * @returns {HTMLElement} - The authority badge
     */
    createAuthorityBadge(options = {}) {
        const {
            text = '🏈 Founded by Austin Humphrey • Texas #20 • Perfect Game Elite',
            showIcon = true
        } = options;

        const badge = document.createElement('div');
        badge.className = 'authority-badge';

        if (showIcon) {
            const icon = document.createElement('span');
            icon.className = 'authority-badge__icon';
            icon.textContent = '🏈';
            badge.appendChild(icon);
        }

        const textElement = document.createElement('span');
        textElement.textContent = text.replace('🏈 ', '');
        badge.appendChild(textElement);

        return badge;
    }

    /**
     * Update existing badge status
     * @param {string} badgeId - Badge element ID
     * @param {string} newStatusType - New status type
     */
    updateBadgeStatus(badgeId, newStatusType) {
        const badge = document.getElementById(badgeId);
        if (!badge) {
            console.error(`Badge with ID ${badgeId} not found`);
            return;
        }

        const newStatus = this.statusTypes[newStatusType];
        if (!newStatus) {
            console.error(`Invalid status type: ${newStatusType}`);
            return;
        }

        // Remove old status class
        Object.values(this.statusTypes).forEach(status => {
            badge.classList.remove(status.class);
        });

        // Add new status class
        badge.classList.add(newStatus.class);

        // Update text content
        const textElement = badge.querySelector('.status-badge-text');
        if (textElement) {
            textElement.textContent = newStatus.label;
        }

        // Update description
        badge.title = newStatus.description;
    }

    /**
     * Add status indicator strip to container
     * @param {HTMLElement} container - Container element
     * @param {Array} statuses - Array of status objects
     */
    addStatusStrip(container, statuses) {
        const strip = document.createElement('div');
        strip.className = 'status-indicator-strip';

        const label = document.createElement('span');
        label.className = 'status-indicator-strip__label';
        label.textContent = 'Feature Status:';
        strip.appendChild(label);

        statuses.forEach(({ statusType, customText }) => {
            const badge = this.createBadge(statusType, { 
                customText, 
                showDescription: true,
                size: 'default'
            });
            strip.appendChild(badge);
        });

        container.appendChild(strip);
    }

    /**
     * Initialize existing badges with data attributes
     */
    initializeExistingBadges() {
        const badges = document.querySelectorAll('[data-status-badge]');
        badges.forEach(element => {
            const statusType = element.getAttribute('data-status-badge');
            const size = element.getAttribute('data-badge-size') || 'default';
            const showDescription = element.hasAttribute('data-show-description');
            const customText = element.getAttribute('data-custom-text');

            const badge = this.createBadge(statusType, {
                size,
                showDescription,
                customText
            });

            if (badge) {
                element.appendChild(badge);
            }
        });
    }

    /**
     * Attach event listeners for interactive features
     */
    attachEventListeners() {
        // Add hover effects for feature cards
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('feature-status-card')) {
                e.target.style.transform = 'translateY(-2px)';
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('feature-status-card')) {
                e.target.style.transform = 'translateY(0)';
            }
        }, true);
    }

    /**
     * Utility: Get all current platform feature statuses
     * @returns {Object} - Current feature status mapping
     */
    getPlatformFeatureStatuses() {
        return {
            austinExpertise: 'AUSTIN_VERIFIED',
            nilCalculator: 'BETA',
            digitalCombine: 'BETA', 
            pressureDashboard: 'RESEARCH',
            aiConsciousness: 'RESEARCH',
            enterpriseAPI: 'COMING_SOON',
            advancedBiometrics: 'RESEARCH',
            realTimeAnalytics: 'BETA',
            teamIntegration: 'COMING_SOON'
        };
    }

    /**
     * Utility: Add transparency disclaimers to sections
     * @param {string} sectionId - Section ID to add disclaimer to
     * @param {string} statusType - Feature status type
     * @param {string} message - Disclaimer message
     */
    addTransparencyDisclaimer(sectionId, statusType, message) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const disclaimer = this.createDisclaimer(statusType, message);
        
        // Insert at beginning of section
        const firstChild = section.firstElementChild;
        if (firstChild) {
            section.insertBefore(disclaimer, firstChild);
        } else {
            section.appendChild(disclaimer);
        }
    }
}

// Global instance
window.StatusBadgeManager = new StatusBadgeManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatusBadgeManager;
}