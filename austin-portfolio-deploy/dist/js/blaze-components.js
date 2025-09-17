/**
 * Blaze Intelligence Component Library
 * Reusable components for consistent UI across the platform
 * Championship-level professional interface components
 */

class BlazeComponents {
    constructor() {
        this.initialized = false;
        this.theme = {
            // Brand Colors
            primaryOrange: '#BF5700',
            cardinalBlue: '#9BCBEB',
            deepNavy: '#002244',
            grizzlyTeal: '#00B2A9',
            neuralGreen: '#00ff7f',
            championshipGold: '#FFD700',
            executivePlatinum: '#E5E4E2',
            executiveGraphite: '#36454F',

            // Backgrounds
            bgPrimary: '#0a0e27',
            bgSecondary: '#1a1a2e',
            bgExecutive: '#0f1419',

            // Text
            textPrimary: '#e0e6ed',
            textSecondary: '#8892b0',
            textExecutive: '#c9d1d9'
        };
    }

    /**
     * Initialize all components on the page
     */
    init() {
        if (this.initialized) return;

        console.log('🔥 Initializing Blaze Components...');

        // Auto-initialize components with data attributes
        this.initNavigation();
        this.initCards();
        this.initCharts();
        this.initForms();
        this.initModals();
        this.initTooltips();
        this.initAnimations();

        this.initialized = true;
        console.log('✅ Blaze Components initialized');
    }

    /**
     * Create Professional Navigation with Mega Menu
     */
    createNavigation(config = {}) {
        const defaults = {
            brand: 'Blaze Intelligence',
            logo: '🔥',
            sticky: true,
            transparent: false,
            megaMenu: true
        };

        const settings = { ...defaults, ...config };

        const nav = document.createElement('nav');
        nav.className = 'blaze-nav';
        if (settings.sticky) nav.classList.add('sticky');
        if (settings.transparent) nav.classList.add('transparent');

        nav.innerHTML = `
            <div class="nav-container">
                <div class="nav-brand">
                    <span class="nav-logo">${settings.logo}</span>
                    <span class="nav-title">${settings.brand}</span>
                </div>
                <div class="nav-menu">
                    <div class="nav-links"></div>
                    <div class="nav-actions">
                        <button class="nav-search-btn" aria-label="Search">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </button>
                        <button class="nav-mobile-toggle" aria-label="Menu">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.addNavigationStyles();
        return nav;
    }

    /**
     * Create Executive Dashboard Card
     */
    createCard(config = {}) {
        const defaults = {
            title: '',
            subtitle: '',
            value: '',
            change: null,
            icon: '',
            type: 'default', // default, kpi, feature, team, nil
            actions: [],
            content: '',
            interactive: true
        };

        const settings = { ...defaults, ...config };

        const card = document.createElement('div');
        card.className = `blaze-card blaze-card--${settings.type}`;
        if (settings.interactive) card.classList.add('interactive');

        let changeIndicator = '';
        if (settings.change !== null) {
            const changeClass = settings.change >= 0 ? 'positive' : 'negative';
            const changeIcon = settings.change >= 0 ? '↗' : '↘';
            changeIndicator = `
                <span class="card-change ${changeClass}">
                    ${changeIcon} ${Math.abs(settings.change)}%
                </span>
            `;
        }

        let actionsHtml = '';
        if (settings.actions.length > 0) {
            actionsHtml = `
                <div class="card-actions">
                    ${settings.actions.map(action => `
                        <a href="${action.href}" class="card-action-btn">${action.label}</a>
                    `).join('')}
                </div>
            `;
        }

        card.innerHTML = `
            ${settings.icon ? `<div class="card-icon">${settings.icon}</div>` : ''}
            <div class="card-header">
                <h3 class="card-title">${settings.title}</h3>
                ${changeIndicator}
            </div>
            ${settings.subtitle ? `<p class="card-subtitle">${settings.subtitle}</p>` : ''}
            ${settings.value ? `<div class="card-value">${settings.value}</div>` : ''}
            ${settings.content ? `<div class="card-content">${settings.content}</div>` : ''}
            ${actionsHtml}
        `;

        if (settings.interactive) {
            card.addEventListener('mouseenter', () => this.animateCard(card, 'enter'));
            card.addEventListener('mouseleave', () => this.animateCard(card, 'leave'));
        }

        return card;
    }

    /**
     * Create Live Data Chart
     */
    createChart(config = {}) {
        const defaults = {
            type: 'line', // line, bar, doughnut, radar, area
            title: '',
            height: 300,
            realtime: false,
            updateInterval: 10000,
            data: {
                labels: [],
                datasets: []
            }
        };

        const settings = { ...defaults, ...config };

        const container = document.createElement('div');
        container.className = 'blaze-chart-container';
        container.style.height = `${settings.height}px`;

        container.innerHTML = `
            ${settings.title ? `<h3 class="chart-title">${settings.title}</h3>` : ''}
            <canvas class="blaze-chart"></canvas>
            ${settings.realtime ? '<div class="chart-status">Live</div>' : ''}
        `;

        const canvas = container.querySelector('.blaze-chart');

        if (typeof Chart !== 'undefined') {
            const chartConfig = this.getChartConfig(settings.type, settings.data);
            const chart = new Chart(canvas, chartConfig);

            if (settings.realtime) {
                setInterval(() => {
                    this.updateChartData(chart);
                }, settings.updateInterval);
            }

            container.chart = chart;
        }

        return container;
    }

    /**
     * Create Interactive Form
     */
    createForm(config = {}) {
        const defaults = {
            title: '',
            fields: [],
            submitLabel: 'Submit',
            submitAction: null,
            validation: true,
            ajax: true
        };

        const settings = { ...defaults, ...config };

        const form = document.createElement('form');
        form.className = 'blaze-form';
        if (settings.validation) form.classList.add('validated');

        const fieldsHtml = settings.fields.map(field => {
            const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;

            let inputHtml = '';
            switch (field.type) {
                case 'select':
                    inputHtml = `
                        <select id="${fieldId}" name="${field.name}" class="form-input" ${field.required ? 'required' : ''}>
                            ${field.options.map(opt => `
                                <option value="${opt.value}">${opt.label}</option>
                            `).join('')}
                        </select>
                    `;
                    break;
                case 'textarea':
                    inputHtml = `
                        <textarea id="${fieldId}" name="${field.name}" class="form-input"
                                  rows="${field.rows || 4}" ${field.required ? 'required' : ''}
                                  placeholder="${field.placeholder || ''}"></textarea>
                    `;
                    break;
                case 'range':
                    inputHtml = `
                        <div class="form-range-wrapper">
                            <input type="range" id="${fieldId}" name="${field.name}" class="form-range"
                                   min="${field.min || 0}" max="${field.max || 100}"
                                   value="${field.value || 50}" ${field.required ? 'required' : ''}>
                            <span class="form-range-value">${field.value || 50}</span>
                        </div>
                    `;
                    break;
                default:
                    inputHtml = `
                        <input type="${field.type}" id="${fieldId}" name="${field.name}"
                               class="form-input" placeholder="${field.placeholder || ''}"
                               value="${field.value || ''}" ${field.required ? 'required' : ''}>
                    `;
            }

            return `
                <div class="form-group">
                    <label for="${fieldId}" class="form-label">
                        ${field.label}
                        ${field.required ? '<span class="required">*</span>' : ''}
                    </label>
                    ${inputHtml}
                    ${field.helper ? `<small class="form-helper">${field.helper}</small>` : ''}
                    <div class="form-error"></div>
                </div>
            `;
        }).join('');

        form.innerHTML = `
            ${settings.title ? `<h2 class="form-title">${settings.title}</h2>` : ''}
            <div class="form-fields">
                ${fieldsHtml}
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">
                    ${settings.submitLabel}
                </button>
            </div>
        `;

        if (settings.ajax) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form, settings.submitAction);
            });
        }

        // Add range slider value updates
        form.querySelectorAll('.form-range').forEach(range => {
            range.addEventListener('input', (e) => {
                e.target.nextElementSibling.textContent = e.target.value;
            });
        });

        return form;
    }

    /**
     * Create Modal Dialog
     */
    createModal(config = {}) {
        const defaults = {
            title: '',
            content: '',
            size: 'medium', // small, medium, large, fullscreen
            closeButton: true,
            backdrop: true,
            keyboard: true,
            actions: []
        };

        const settings = { ...defaults, ...config };

        const modal = document.createElement('div');
        modal.className = `blaze-modal blaze-modal--${settings.size}`;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        const actionsHtml = settings.actions.map(action => `
            <button class="btn-${action.type || 'secondary'}" data-action="${action.action}">
                ${action.label}
            </button>
        `).join('');

        modal.innerHTML = `
            ${settings.backdrop ? '<div class="modal-backdrop"></div>' : ''}
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">${settings.title}</h2>
                        ${settings.closeButton ? `
                            <button class="modal-close" aria-label="Close">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M18 6L6 18M6 6l12 12"></path>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                    <div class="modal-body">
                        ${settings.content}
                    </div>
                    ${actionsHtml ? `
                        <div class="modal-footer">
                            ${actionsHtml}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Event handlers
        if (settings.closeButton) {
            modal.querySelector('.modal-close').addEventListener('click', () => {
                this.closeModal(modal);
            });
        }

        if (settings.backdrop) {
            modal.querySelector('.modal-backdrop').addEventListener('click', () => {
                this.closeModal(modal);
            });
        }

        if (settings.keyboard) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.closeModal(modal);
                }
            });
        }

        // Action button handlers
        modal.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = settings.actions.find(a => a.action === btn.dataset.action);
                if (action && action.handler) {
                    action.handler(modal);
                }
            });
        });

        return modal;
    }

    /**
     * Create Data Table
     */
    createTable(config = {}) {
        const defaults = {
            columns: [],
            data: [],
            sortable: true,
            searchable: true,
            pagination: true,
            pageSize: 10,
            responsive: true
        };

        const settings = { ...defaults, ...config };

        const container = document.createElement('div');
        container.className = 'blaze-table-container';
        if (settings.responsive) container.classList.add('responsive');

        const searchHtml = settings.searchable ? `
            <div class="table-search">
                <input type="text" placeholder="Search..." class="table-search-input">
            </div>
        ` : '';

        const tableHtml = `
            <thead>
                <tr>
                    ${settings.columns.map(col => `
                        <th class="${settings.sortable ? 'sortable' : ''}" data-field="${col.field}">
                            ${col.label}
                            ${settings.sortable ? '<span class="sort-icon">⇅</span>' : ''}
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody></tbody>
        `;

        container.innerHTML = `
            <div class="table-controls">
                ${searchHtml}
            </div>
            <table class="blaze-table">
                ${tableHtml}
            </table>
            ${settings.pagination ? `
                <div class="table-pagination">
                    <button class="pagination-prev">Previous</button>
                    <span class="pagination-info"></span>
                    <button class="pagination-next">Next</button>
                </div>
            ` : ''}
        `;

        // Initialize table data
        this.populateTable(container, settings);

        // Add event handlers
        if (settings.searchable) {
            container.querySelector('.table-search-input').addEventListener('input', (e) => {
                this.filterTable(container, e.target.value, settings);
            });
        }

        if (settings.sortable) {
            container.querySelectorAll('th.sortable').forEach(th => {
                th.addEventListener('click', () => {
                    this.sortTable(container, th.dataset.field, settings);
                });
            });
        }

        return container;
    }

    /**
     * Create Progress Indicator
     */
    createProgress(config = {}) {
        const defaults = {
            type: 'bar', // bar, circle, steps
            value: 0,
            max: 100,
            label: '',
            showValue: true,
            animated: true,
            color: this.theme.primaryOrange
        };

        const settings = { ...defaults, ...config };
        const percentage = (settings.value / settings.max) * 100;

        const container = document.createElement('div');
        container.className = `blaze-progress blaze-progress--${settings.type}`;
        if (settings.animated) container.classList.add('animated');

        switch (settings.type) {
            case 'circle':
                const radius = 45;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (percentage / 100) * circumference;

                container.innerHTML = `
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="${radius}" fill="none"
                                stroke="rgba(255,255,255,0.1)" stroke-width="6"/>
                        <circle cx="50" cy="50" r="${radius}" fill="none"
                                stroke="${settings.color}" stroke-width="6"
                                stroke-dasharray="${circumference}"
                                stroke-dashoffset="${offset}"
                                transform="rotate(-90 50 50)"/>
                    </svg>
                    <div class="progress-value">${percentage.toFixed(0)}%</div>
                `;
                break;

            case 'steps':
                const steps = settings.steps || 5;
                const currentStep = Math.floor((settings.value / settings.max) * steps);

                container.innerHTML = `
                    <div class="progress-steps">
                        ${Array.from({ length: steps }, (_, i) => `
                            <div class="progress-step ${i <= currentStep ? 'active' : ''}">
                                <div class="step-circle">${i + 1}</div>
                                ${i < steps - 1 ? '<div class="step-line"></div>' : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
                break;

            default: // bar
                container.innerHTML = `
                    ${settings.label ? `<div class="progress-label">${settings.label}</div>` : ''}
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%; background: ${settings.color};">
                            ${settings.showValue ? `<span class="progress-value">${percentage.toFixed(0)}%</span>` : ''}
                        </div>
                    </div>
                `;
        }

        return container;
    }

    /**
     * Create Alert/Notification
     */
    createAlert(config = {}) {
        const defaults = {
            type: 'info', // info, success, warning, error
            title: '',
            message: '',
            dismissible: true,
            autoClose: 0,
            position: 'top-right',
            icon: true
        };

        const settings = { ...defaults, ...config };

        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        const alert = document.createElement('div');
        alert.className = `blaze-alert blaze-alert--${settings.type} position-${settings.position}`;

        alert.innerHTML = `
            ${settings.icon ? `<div class="alert-icon">${icons[settings.type]}</div>` : ''}
            <div class="alert-content">
                ${settings.title ? `<h4 class="alert-title">${settings.title}</h4>` : ''}
                <p class="alert-message">${settings.message}</p>
            </div>
            ${settings.dismissible ? `
                <button class="alert-close" aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            ` : ''}
        `;

        if (settings.dismissible) {
            alert.querySelector('.alert-close').addEventListener('click', () => {
                this.dismissAlert(alert);
            });
        }

        if (settings.autoClose > 0) {
            setTimeout(() => {
                this.dismissAlert(alert);
            }, settings.autoClose);
        }

        return alert;
    }

    /**
     * Helper Functions
     */

    animateCard(card, action) {
        if (action === 'enter') {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 15px 50px rgba(191, 87, 0, 0.3)';
        } else {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
        }
    }

    getChartConfig(type, data) {
        const baseConfig = {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: this.theme.textPrimary }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: this.theme.textSecondary },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: this.theme.textSecondary },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        };

        // Customize based on chart type
        if (type === 'doughnut' || type === 'pie') {
            delete baseConfig.options.scales;
        }

        return baseConfig;
    }

    updateChartData(chart) {
        // Simulate real-time data updates
        chart.data.datasets.forEach(dataset => {
            dataset.data = dataset.data.map(value => {
                const change = (Math.random() - 0.5) * 10;
                return Math.max(0, value + change);
            });
        });
        chart.update();
    }

    handleFormSubmit(form, action) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Show loading state
        const submitBtn = form.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            if (action) {
                action(data);
            } else {
                console.log('Form submitted:', data);
                this.showNotification('Form submitted successfully!', 'success');
            }

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            form.reset();
        }, 1500);
    }

    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    dismissAlert(alert) {
        alert.classList.add('dismissing');
        setTimeout(() => {
            alert.remove();
        }, 300);
    }

    populateTable(container, settings) {
        const tbody = container.querySelector('tbody');
        const { columns, data, pageSize } = settings;

        // Clear existing rows
        tbody.innerHTML = '';

        // Add rows
        const startIndex = 0;
        const endIndex = pageSize ? Math.min(pageSize, data.length) : data.length;

        for (let i = startIndex; i < endIndex; i++) {
            const row = document.createElement('tr');
            columns.forEach(col => {
                const cell = document.createElement('td');
                cell.textContent = data[i][col.field] || '';
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        }

        // Update pagination info
        if (settings.pagination) {
            const info = container.querySelector('.pagination-info');
            info.textContent = `Showing 1-${endIndex} of ${data.length}`;
        }
    }

    filterTable(container, searchTerm, settings) {
        const filteredData = settings.data.filter(row => {
            return Object.values(row).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        settings.data = filteredData;
        this.populateTable(container, settings);
    }

    sortTable(container, field, settings) {
        settings.data.sort((a, b) => {
            if (a[field] < b[field]) return -1;
            if (a[field] > b[field]) return 1;
            return 0;
        });

        this.populateTable(container, settings);
    }

    showNotification(message, type = 'info') {
        const notification = this.createAlert({
            type: type,
            message: message,
            autoClose: 5000,
            position: 'top-right'
        });

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }

    /**
     * Initialize component behaviors
     */
    initNavigation() {
        // Mobile menu toggle
        document.querySelectorAll('.nav-mobile-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const nav = toggle.closest('.blaze-nav');
                nav.classList.toggle('mobile-open');
            });
        });
    }

    initCards() {
        // Auto-animate cards with data-animate attribute
        document.querySelectorAll('[data-animate="card"]').forEach(card => {
            card.addEventListener('mouseenter', () => this.animateCard(card, 'enter'));
            card.addEventListener('mouseleave', () => this.animateCard(card, 'leave'));
        });
    }

    initCharts() {
        // Auto-initialize charts with data-chart attribute
        document.querySelectorAll('[data-chart]').forEach(element => {
            const config = JSON.parse(element.dataset.chart);
            const chart = this.createChart(config);
            element.appendChild(chart);
        });
    }

    initForms() {
        // Form validation
        document.querySelectorAll('.blaze-form.validated').forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!form.checkValidity()) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                form.classList.add('was-validated');
            });
        });
    }

    initModals() {
        // Modal triggers
        document.querySelectorAll('[data-modal]').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modalId = trigger.dataset.modal;
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('active');
                }
            });
        });
    }

    initTooltips() {
        // Simple tooltip implementation
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'blaze-tooltip';
                tooltip.textContent = e.target.dataset.tooltip;
                document.body.appendChild(tooltip);

                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

                e.target.tooltip = tooltip;
            });

            element.addEventListener('mouseleave', (e) => {
                if (e.target.tooltip) {
                    e.target.tooltip.remove();
                }
            });
        });
    }

    initAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('[data-animate-on-scroll]').forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Add component styles to the page
     */
    addNavigationStyles() {
        if (document.getElementById('blaze-nav-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'blaze-nav-styles';
        styles.textContent = `
            .blaze-nav {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: rgba(15, 20, 25, 0.95);
                backdrop-filter: blur(20px);
                border-bottom: 2px solid ${this.theme.primaryOrange};
                padding: 0 2rem;
                height: 70px;
                display: flex;
                align-items: center;
                z-index: 10000;
                transition: all 0.3s ease;
            }

            .blaze-nav.transparent {
                background: transparent;
                border-bottom-color: transparent;
            }

            .blaze-nav.transparent:hover {
                background: rgba(15, 20, 25, 0.95);
                border-bottom-color: ${this.theme.primaryOrange};
            }

            .nav-container {
                width: 100%;
                max-width: 1400px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .nav-brand {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 1.5rem;
                font-weight: 900;
                background: linear-gradient(135deg, ${this.theme.primaryOrange}, ${this.theme.championshipGold});
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                cursor: pointer;
                transition: transform 0.3s ease;
            }

            .nav-brand:hover {
                transform: scale(1.05);
            }

            .nav-menu {
                display: flex;
                align-items: center;
                gap: 2rem;
            }

            .nav-links {
                display: flex;
                gap: 1rem;
            }

            .nav-actions {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .nav-search-btn, .nav-mobile-toggle {
                background: none;
                border: none;
                color: ${this.theme.textPrimary};
                cursor: pointer;
                padding: 0.5rem;
                transition: color 0.3s ease;
            }

            .nav-search-btn:hover {
                color: ${this.theme.primaryOrange};
            }

            .nav-mobile-toggle {
                display: none;
                flex-direction: column;
                gap: 4px;
            }

            .nav-mobile-toggle span {
                width: 24px;
                height: 2px;
                background: ${this.theme.textPrimary};
                transition: all 0.3s ease;
            }

            @media (max-width: 768px) {
                .nav-mobile-toggle {
                    display: flex;
                }

                .nav-links {
                    display: none;
                }

                .blaze-nav.mobile-open .nav-links {
                    display: flex;
                    position: absolute;
                    top: 70px;
                    left: 0;
                    right: 0;
                    flex-direction: column;
                    background: rgba(15, 20, 25, 0.98);
                    padding: 1rem;
                    border-bottom: 2px solid ${this.theme.primaryOrange};
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Export for global use
window.BlazeComponents = new BlazeComponents();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.BlazeComponents.init();
    });
} else {
    window.BlazeComponents.init();
}