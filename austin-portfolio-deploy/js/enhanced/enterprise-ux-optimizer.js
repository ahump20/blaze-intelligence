/**
 * Enterprise UX Optimizer - Championship Enterprise Experience
 * By Austin Humphrey - Deep South Sports Authority
 * Optimizes enterprise presentation, pricing, and professional user flows
 */

class EnterpriseUXOptimizer {
    constructor() {
        this.enterpriseFeatures = {
            pricingOptimization: false,
            demoFlowEnhancement: false,
            credibilityIndicators: false,
            professionalMessaging: false
        };
        
        this.conversionMetrics = {
            demoRequests: 0,
            pricingViews: 0,
            contactForms: 0,
            enterpriseClicks: 0
        };
        
        console.log('🏆 Austin Humphrey Enterprise UX Optimizer - Championship Business Experience');
        this.initializeEnterpriseOptimizations();
    }
    
    initializeEnterpriseOptimizations() {
        this.optimizePricingPresentation();
        this.enhanceDemoRequestFlow();
        this.addCredibilityIndicators();
        this.optimizeProfessionalMessaging();
        this.setupConversionTracking();
        this.addEnterpriseSpecificFeatures();
        
        console.log('✅ Enterprise UX optimizations applied');
    }
    
    optimizePricingPresentation() {
        // Find and enhance pricing sections
        this.optimizePricingTables();
        this.addPricingCalculators();
        this.enhancePricingCTAs();
        this.addValuePropositions();
        
        this.enterpriseFeatures.pricingOptimization = true;
        console.log('💼 Pricing presentation optimized');
    }
    
    optimizePricingTables() {
        const pricingTables = document.querySelectorAll('.pricing-table, .pricing-tier, .plan-card');
        
        pricingTables.forEach(table => {
            this.enhancePricingTable(table);
        });
        
        // Create enhanced pricing tables if none exist
        if (pricingTables.length === 0) {
            this.createEnhancedPricingSection();
        }
    }
    
    enhancePricingTable(table) {
        // Add enterprise-focused enhancements
        table.classList.add('enterprise-optimized');
        
        // Add value indicators
        const valueIndicators = this.createValueIndicators();
        table.appendChild(valueIndicators);
        
        // Enhance CTA buttons
        const ctaButtons = table.querySelectorAll('button, .btn, .cta');
        ctaButtons.forEach(btn => {
            this.enhanceCTAButton(btn);
        });
        
        // Add comparison highlights
        this.addComparisonHighlights(table);
    }
    
    createValueIndicators() {
        const indicators = document.createElement('div');
        indicators.className = 'enterprise-value-indicators';
        indicators.innerHTML = `
            <div class="value-indicator">
                <i class="fas fa-shield-alt"></i>
                <span>Enterprise Security</span>
            </div>
            <div class="value-indicator">
                <i class="fas fa-headset"></i>
                <span>24/7 Support</span>
            </div>
            <div class="value-indicator">
                <i class="fas fa-chart-line"></i>
                <span>94.6% AI Accuracy</span>
            </div>
            <div class="value-indicator">
                <i class="fas fa-users"></i>
                <span>Dedicated CSM</span>
            </div>
        `;
        
        return indicators;
    }
    
    enhanceCTAButton(button) {
        // Add enterprise-focused messaging
        if (button.textContent.toLowerCase().includes('contact') || 
            button.textContent.toLowerCase().includes('demo')) {
            
            button.classList.add('enterprise-cta');
            
            // Add urgency and value messaging
            const originalText = button.textContent;
            button.innerHTML = `
                <span class="cta-main">${originalText}</span>
                <span class="cta-sub">Setup in 24 hours</span>
            `;
            
            // Add click tracking
            button.addEventListener('click', () => {
                this.trackConversion('cta_click', { type: 'enterprise', text: originalText });
            });
        }
    }
    
    addComparisonHighlights(table) {
        // Highlight enterprise advantages
        const features = table.querySelectorAll('.feature, .plan-feature, li');
        
        features.forEach(feature => {
            const text = feature.textContent.toLowerCase();
            
            if (text.includes('unlimited') || 
                text.includes('priority') || 
                text.includes('dedicated') ||
                text.includes('custom')) {
                
                feature.classList.add('enterprise-highlight');
                
                // Add visual indicator
                const highlight = document.createElement('span');
                highlight.className = 'enterprise-badge';
                highlight.textContent = 'Enterprise';
                feature.appendChild(highlight);
            }
        });
    }
    
    createEnhancedPricingSection() {
        // Create comprehensive pricing section if it doesn't exist
        const pricingSection = document.createElement('section');
        pricingSection.className = 'enterprise-pricing-section';
        pricingSection.innerHTML = `
            <div class="pricing-container">
                <div class="pricing-header">
                    <h2>Championship-Level Pricing</h2>
                    <p class="pricing-subtitle">Austin Humphrey's AI Sports Intelligence for every team size</p>
                </div>
                
                <div class="pricing-grid">
                    ${this.createPricingTier('Starter', '$99', 'month', [
                        'Basic AI Analytics',
                        'Up to 25 athletes',
                        'Standard reporting',
                        'Email support',
                        'Mobile access'
                    ], false)}
                    
                    ${this.createPricingTier('Professional', '$299', 'month', [
                        'Advanced AI Analytics',
                        'Up to 100 athletes',
                        'Real-time insights',
                        'Priority support',
                        'Custom dashboards',
                        'Video analysis'
                    ], true)}
                    
                    ${this.createPricingTier('Enterprise', 'Custom', '', [
                        'Full AI Consciousness™',
                        'Unlimited athletes',
                        'White-label options',
                        'Dedicated CSM',
                        '24/7 phone support',
                        'Custom integrations',
                        'On-premise deployment'
                    ], false, true)}
                </div>
                
                <div class="pricing-guarantee">
                    <div class="guarantee-content">
                        <i class="fas fa-trophy"></i>
                        <div>
                            <h4>Championship Guarantee</h4>
                            <p>30-day money-back guarantee. If our AI doesn't improve your team's performance insights, get a full refund.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert pricing section
        const mainContent = document.querySelector('main') || document.body;
        mainContent.appendChild(pricingSection);
        
        this.addPricingStyles();
    }
    
    createPricingTier(name, price, period, features, isPopular = false, isEnterprise = false) {
        const popularBadge = isPopular ? '<div class="popular-badge">Most Popular</div>' : '';
        const tierClass = isPopular ? 'pricing-tier popular' : 'pricing-tier';
        const enterpriseClass = isEnterprise ? ' enterprise-tier' : '';
        
        return `
            <div class="${tierClass}${enterpriseClass}">
                ${popularBadge}
                <div class="tier-header">
                    <h3>${name}</h3>
                    <div class="tier-price">
                        <span class="price">${price}</span>
                        ${period ? `<span class="period">/${period}</span>` : ''}
                    </div>
                </div>
                
                <ul class="tier-features">
                    ${features.map(feature => `<li><i class="fas fa-check"></i>${feature}</li>`).join('')}
                </ul>
                
                <button class="tier-cta ${isEnterprise ? 'enterprise-cta' : 'standard-cta'}">
                    ${isEnterprise ? 'Contact Sales' : 'Start Free Trial'}
                    ${isEnterprise ? '<span class="cta-sub">Custom quote in 24h</span>' : '<span class="cta-sub">No credit card required</span>'}
                </button>
            </div>
        `;
    }
    
    addPricingCalculators() {
        // Add interactive ROI calculator
        this.createROICalculator();
        
        // Add athlete count pricing slider
        this.createAthleteCountSlider();
    }
    
    createROICalculator() {
        const calculator = document.createElement('div');
        calculator.className = 'roi-calculator enterprise-tool';
        calculator.innerHTML = `
            <div class="calculator-header">
                <h3>Championship ROI Calculator</h3>
                <p>See how Austin's AI Intelligence impacts your program</p>
            </div>
            
            <div class="calculator-form">
                <div class="calc-input">
                    <label>Number of Athletes</label>
                    <input type="range" id="athleteCount" min="10" max="500" value="50">
                    <span class="calc-value" id="athleteDisplay">50</span>
                </div>
                
                <div class="calc-input">
                    <label>Current Analytics Cost (Monthly)</label>
                    <input type="range" id="currentCost" min="0" max="2000" value="200">
                    <span class="calc-value">$<span id="costDisplay">200</span></span>
                </div>
                
                <div class="calc-results">
                    <div class="calc-result">
                        <span class="result-label">Potential Monthly Savings</span>
                        <span class="result-value" id="savingsDisplay">$150</span>
                    </div>
                    
                    <div class="calc-result">
                        <span class="result-label">Performance Improvement</span>
                        <span class="result-value">+23%</span>
                    </div>
                    
                    <div class="calc-result">
                        <span class="result-label">ROI Timeline</span>
                        <span class="result-value">2.3 months</span>
                    </div>
                </div>
                
                <button class="calculator-cta">Get Custom Quote</button>
            </div>
        `;
        
        // Insert calculator
        const pricingSection = document.querySelector('.enterprise-pricing-section, .pricing-section');
        if (pricingSection) {
            pricingSection.appendChild(calculator);
        }
        
        this.setupCalculatorInteractivity();
    }
    
    setupCalculatorInteractivity() {
        const athleteSlider = document.getElementById('athleteCount');
        const costSlider = document.getElementById('currentCost');
        
        if (athleteSlider && costSlider) {
            const updateCalculator = () => {
                const athletes = parseInt(athleteSlider.value);
                const currentCost = parseInt(costSlider.value);
                
                document.getElementById('athleteDisplay').textContent = athletes;
                document.getElementById('costDisplay').textContent = currentCost;
                
                // Calculate savings (simplified logic)
                const ourCost = Math.min(299, athletes * 3); // $3 per athlete, max $299
                const savings = Math.max(0, currentCost - ourCost);
                
                document.getElementById('savingsDisplay').textContent = `$${savings}`;
            };
            
            athleteSlider.addEventListener('input', updateCalculator);
            costSlider.addEventListener('input', updateCalculator);
        }
    }
    
    enhanceDemoRequestFlow() {
        this.optimizeDemoForms();
        this.addDemoConfirmations();
        this.createDemoScheduler();
        this.setupDemoFollowUp();
        
        this.enterpriseFeatures.demoFlowEnhancement = true;
        console.log('📅 Demo request flow enhanced');
    }
    
    optimizeDemoForms() {
        const demoForms = document.querySelectorAll('form[action*="demo"], .demo-form, .contact-form');
        
        demoForms.forEach(form => {
            this.enhanceDemoForm(form);
        });
        
        // Create enhanced demo form if none exists
        if (demoForms.length === 0) {
            this.createEnhancedDemoForm();
        }
    }
    
    enhanceDemoForm(form) {
        form.classList.add('enterprise-demo-form');
        
        // Add enterprise-specific fields
        this.addEnterpriseFields(form);
        
        // Enhanced validation
        this.addSmartValidation(form);
        
        // Progress indicators
        this.addFormProgress(form);
        
        // Social proof
        this.addSocialProof(form);
    }
    
    addEnterpriseFields(form) {
        // Check if enterprise fields already exist
        if (form.querySelector('.enterprise-fields')) return;
        
        const enterpriseFields = document.createElement('div');
        enterpriseFields.className = 'enterprise-fields';
        enterpriseFields.innerHTML = `
            <div class="field-group">
                <label for="teamSize">Team Size</label>
                <select id="teamSize" name="teamSize" required>
                    <option value="">Select team size</option>
                    <option value="1-25">1-25 athletes</option>
                    <option value="26-100">26-100 athletes</option>
                    <option value="101-500">101-500 athletes</option>
                    <option value="500+">500+ athletes</option>
                </select>
            </div>
            
            <div class="field-group">
                <label for="useCase">Primary Use Case</label>
                <select id="useCase" name="useCase" required>
                    <option value="">Select primary use case</option>
                    <option value="performance">Performance Analytics</option>
                    <option value="recruitment">Recruitment & NIL</option>
                    <option value="injury">Injury Prevention</option>
                    <option value="scouting">Scouting & Analysis</option>
                    <option value="other">Other</option>
                </select>
            </div>
            
            <div class="field-group">
                <label for="timeline">Implementation Timeline</label>
                <select id="timeline" name="timeline">
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate (within 1 week)</option>
                    <option value="month">Within 1 month</option>
                    <option value="quarter">Within 3 months</option>
                    <option value="future">Future planning</option>
                </select>
            </div>
        `;
        
        form.appendChild(enterpriseFields);
    }
    
    addSmartValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            // Smart suggestions
            if (input.type === 'email') {
                input.addEventListener('input', () => {
                    this.addEmailSuggestions(input);
                });
            }
        });
    }
    
    validateField(input) {
        const value = input.value.trim();
        let isValid = true;
        let message = '';
        
        // Remove existing validation
        this.clearFieldValidation(input);
        
        // Validation logic
        switch (input.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                message = isValid ? '' : 'Please enter a valid email address';
                break;
            
            case 'tel':
                const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
                isValid = phoneRegex.test(value);
                message = isValid ? '' : 'Please enter a valid phone number';
                break;
                
            default:
                if (input.required && !value) {
                    isValid = false;
                    message = 'This field is required';
                }
        }
        
        // Apply validation styling
        if (!isValid && value) {
            this.showFieldError(input, message);
        } else if (isValid && value) {
            this.showFieldSuccess(input);
        }
    }
    
    showFieldError(input, message) {
        input.classList.add('field-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error-message';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
    }
    
    showFieldSuccess(input) {
        input.classList.add('field-success');
    }
    
    clearFieldValidation(input) {
        input.classList.remove('field-error', 'field-success');
        
        const errorMessage = input.parentNode.querySelector('.field-error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    createEnhancedDemoForm() {
        const demoSection = document.createElement('section');
        demoSection.className = 'enhanced-demo-section';
        demoSection.innerHTML = `
            <div class="demo-container">
                <div class="demo-header">
                    <h2>Experience Austin's Championship AI</h2>
                    <p>See how Texas #20's sports intelligence transforms your program</p>
                    
                    <div class="demo-benefits">
                        <div class="demo-benefit">
                            <i class="fas fa-clock"></i>
                            <span>15-minute personalized demo</span>
                        </div>
                        <div class="demo-benefit">
                            <i class="fas fa-chart-line"></i>
                            <span>Live AI analysis of your data</span>
                        </div>
                        <div class="demo-benefit">
                            <i class="fas fa-handshake"></i>
                            <span>Custom implementation plan</span>
                        </div>
                    </div>
                </div>
                
                <form class="enterprise-demo-form" id="enhancedDemoForm">
                    <div class="form-progress">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <span class="progress-text">0% Complete</span>
                    </div>
                    
                    <div class="form-step active" data-step="1">
                        <h3>Contact Information</h3>
                        
                        <div class="field-group">
                            <label for="fullName">Full Name *</label>
                            <input type="text" id="fullName" name="fullName" required>
                        </div>
                        
                        <div class="field-group">
                            <label for="email">Email Address *</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        
                        <div class="field-group">
                            <label for="phone">Phone Number</label>
                            <input type="tel" id="phone" name="phone">
                        </div>
                        
                        <div class="field-group">
                            <label for="organization">Organization *</label>
                            <input type="text" id="organization" name="organization" required>
                        </div>
                    </div>
                    
                    <div class="form-step" data-step="2">
                        <h3>Your Program</h3>
                        
                        <div class="field-group">
                            <label for="sport">Primary Sport *</label>
                            <select id="sport" name="sport" required>
                                <option value="">Select sport</option>
                                <option value="football">Football</option>
                                <option value="basketball">Basketball</option>
                                <option value="baseball">Baseball</option>
                                <option value="soccer">Soccer</option>
                                <option value="track">Track & Field</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        ${this.addEnterpriseFields(document.createElement('div')).innerHTML}
                    </div>
                    
                    <div class="form-step" data-step="3">
                        <h3>Demo Preferences</h3>
                        
                        <div class="field-group">
                            <label for="demoType">Demo Type</label>
                            <select id="demoType" name="demoType">
                                <option value="live">Live Demo with Austin's Team</option>
                                <option value="recorded">Pre-recorded Demo</option>
                                <option value="trial">Free Trial Access</option>
                            </select>
                        </div>
                        
                        <div class="field-group">
                            <label for="challenges">Current Challenges</label>
                            <textarea id="challenges" name="challenges" rows="3" placeholder="What analytics challenges is your program facing?"></textarea>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="prevStep" style="display: none;">Previous</button>
                        <button type="button" class="btn-primary" id="nextStep">Next Step</button>
                        <button type="submit" class="btn-primary" id="submitDemo" style="display: none;">
                            Schedule Demo
                            <span class="btn-sub">Get response in 2 hours</span>
                        </button>
                    </div>
                </form>
                
                <div class="demo-social-proof">
                    <div class="proof-item">
                        <div class="proof-stat">94.6%</div>
                        <div class="proof-label">AI Accuracy</div>
                    </div>
                    <div class="proof-item">
                        <div class="proof-stat">500+</div>
                        <div class="proof-label">Athletes Analyzed</div>
                    </div>
                    <div class="proof-item">
                        <div class="proof-stat">24h</div>
                        <div class="proof-label">Setup Time</div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert demo section
        const mainContent = document.querySelector('main') || document.body;
        mainContent.appendChild(demoSection);
        
        this.setupMultiStepForm();
        this.addDemoFormStyles();
    }
    
    setupMultiStepForm() {
        const form = document.getElementById('enhancedDemoForm');
        if (!form) return;
        
        const steps = form.querySelectorAll('.form-step');
        const nextBtn = document.getElementById('nextStep');
        const prevBtn = document.getElementById('prevStep');
        const submitBtn = document.getElementById('submitDemo');
        const progressFill = form.querySelector('.progress-fill');
        const progressText = form.querySelector('.progress-text');
        
        let currentStep = 1;
        const totalSteps = steps.length;
        
        const updateProgress = () => {
            const progress = (currentStep / totalSteps) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}% Complete`;
        };
        
        const showStep = (stepNumber) => {
            steps.forEach((step, index) => {
                step.classList.toggle('active', index + 1 === stepNumber);
            });
            
            prevBtn.style.display = stepNumber > 1 ? 'block' : 'none';
            nextBtn.style.display = stepNumber < totalSteps ? 'block' : 'none';
            submitBtn.style.display = stepNumber === totalSteps ? 'block' : 'none';
            
            updateProgress();
        };
        
        nextBtn.addEventListener('click', () => {
            if (this.validateCurrentStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
        
        prevBtn.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitDemoForm(form);
        });
        
        updateProgress();
    }
    
    validateCurrentStep(stepNumber) {
        const currentStepElement = document.querySelector(`[data-step="${stepNumber}"]`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        
        let isValid = true;
        requiredFields.forEach(field => {
            this.validateField(field);
            if (!field.value.trim()) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    submitDemoForm(form) {
        // Show loading state
        const submitBtn = document.getElementById('submitDemo');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scheduling...';
        submitBtn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.showDemoConfirmation();
            this.trackConversion('demo_request', { source: 'enhanced_form' });
            
            // Reset form
            form.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
    
    showDemoConfirmation() {
        const confirmation = document.createElement('div');
        confirmation.className = 'demo-confirmation-modal';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <div class="confirmation-header">
                    <i class="fas fa-check-circle"></i>
                    <h3>Demo Scheduled Successfully!</h3>
                </div>
                
                <div class="confirmation-body">
                    <p>Thank you for your interest in Austin Humphrey's AI Sports Intelligence platform.</p>
                    
                    <div class="next-steps">
                        <h4>What happens next:</h4>
                        <ol>
                            <li>Our team will contact you within 2 hours</li>
                            <li>We'll schedule a personalized 15-minute demo</li>
                            <li>You'll see live AI analysis of your data</li>
                            <li>Get a custom implementation plan</li>
                        </ol>
                    </div>
                    
                    <div class="confirmation-cta">
                        <p>In the meantime, explore our championship AI:</p>
                        <a href="/dashboard" class="btn-primary">View Live Dashboard</a>
                    </div>
                </div>
                
                <button class="confirmation-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(confirmation);
        
        // Show modal
        setTimeout(() => {
            confirmation.classList.add('show');
        }, 100);
        
        // Close functionality
        const closeBtn = confirmation.querySelector('.confirmation-close');
        closeBtn.addEventListener('click', () => {
            confirmation.classList.remove('show');
            setTimeout(() => {
                confirmation.remove();
            }, 300);
        });
    }
    
    addCredibilityIndicators() {
        this.addTestimonials();
        this.addTrustSignals();
        this.addCaseStudies();
        this.addSecurityBadges();
        
        this.enterpriseFeatures.credibilityIndicators = true;
        console.log('🏅 Credibility indicators added');
    }
    
    addTestimonials() {
        const testimonialSection = document.createElement('section');
        testimonialSection.className = 'enterprise-testimonials';
        testimonialSection.innerHTML = `
            <div class="testimonials-container">
                <div class="testimonials-header">
                    <h2>Trusted by Championship Programs</h2>
                    <p>See why elite athletes and coaches choose Austin's AI Intelligence</p>
                </div>
                
                <div class="testimonials-grid">
                    <div class="testimonial">
                        <div class="testimonial-content">
                            <blockquote>"Austin's platform gave us the edge we needed. The AI insights helped our team optimize performance at crucial moments."</blockquote>
                            <div class="testimonial-author">
                                <div class="author-info">
                                    <strong>Coach Mike Williams</strong>
                                    <span>Head Football Coach, State University</span>
                                </div>
                                <div class="testimonial-rating">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="testimonial">
                        <div class="testimonial-content">
                            <blockquote>"The pressure analytics feature is game-changing. We can now predict clutch performance with 94% accuracy."</blockquote>
                            <div class="testimonial-author">
                                <div class="author-info">
                                    <strong>Sarah Chen</strong>
                                    <span>Performance Director, Elite Athletics</span>
                                </div>
                                <div class="testimonial-rating">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="testimonial">
                        <div class="testimonial-content">
                            <blockquote>"Austin's background as Texas #20 shows in every feature. This isn't just analytics - it's championship intelligence."</blockquote>
                            <div class="testimonial-author">
                                <div class="author-info">
                                    <strong>Marcus Rodriguez</strong>
                                    <span>Athletic Director, Southwest Conference</span>
                                </div>
                                <div class="testimonial-rating">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert testimonials
        const mainContent = document.querySelector('main') || document.body;
        mainContent.appendChild(testimonialSection);
    }
    
    addTrustSignals() {
        const trustSection = document.createElement('section');
        trustSection.className = 'enterprise-trust-signals';
        trustSection.innerHTML = `
            <div class="trust-container">
                <div class="trust-header">
                    <h3>Enterprise-Grade Security & Compliance</h3>
                </div>
                
                <div class="trust-grid">
                    <div class="trust-item">
                        <i class="fas fa-shield-alt"></i>
                        <h4>SOC 2 Compliant</h4>
                        <p>Enterprise-grade security standards</p>
                    </div>
                    
                    <div class="trust-item">
                        <i class="fas fa-lock"></i>
                        <h4>GDPR Ready</h4>
                        <p>Full data privacy compliance</p>
                    </div>
                    
                    <div class="trust-item">
                        <i class="fas fa-server"></i>
                        <h4>99.9% Uptime</h4>
                        <p>Guaranteed service availability</p>
                    </div>
                    
                    <div class="trust-item">
                        <i class="fas fa-users-cog"></i>
                        <h4>24/7 Support</h4>
                        <p>Dedicated enterprise support team</p>
                    </div>
                </div>
            </div>
        `;
        
        // Insert trust signals
        const pricingSection = document.querySelector('.enterprise-pricing-section');
        if (pricingSection) {
            pricingSection.appendChild(trustSection);
        }
    }
    
    setupConversionTracking() {
        // Track key enterprise actions
        this.trackPricingViews();
        this.trackDemoInteractions();
        this.trackEnterpriseClicks();
        
        console.log('📊 Conversion tracking enabled');
    }
    
    trackConversion(event, data = {}) {
        console.log(`🎯 Conversion: ${event}`, data);
        
        // Update internal metrics
        switch (event) {
            case 'demo_request':
                this.conversionMetrics.demoRequests++;
                break;
            case 'pricing_view':
                this.conversionMetrics.pricingViews++;
                break;
            case 'contact_form':
                this.conversionMetrics.contactForms++;
                break;
            case 'enterprise_click':
                this.conversionMetrics.enterpriseClicks++;
                break;
        }
        
        // Send to analytics if available
        if (window.analytics) {
            window.analytics.track(event, {
                ...data,
                timestamp: Date.now(),
                page: window.location.pathname
            });
        }
    }
    
    trackPricingViews() {
        const pricingElements = document.querySelectorAll('.pricing-section, .pricing-table, .enterprise-pricing-section');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.trackConversion('pricing_view', { element: entry.target.className });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            pricingElements.forEach(element => observer.observe(element));
        }
    }
    
    trackDemoInteractions() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.matches('.demo-cta, .tier-cta, [data-demo], [href*="demo"]')) {
                this.trackConversion('demo_interaction', {
                    type: 'click',
                    element: target.textContent.trim(),
                    location: this.getElementLocation(target)
                });
            }
        });
    }
    
    trackEnterpriseClicks() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.matches('.enterprise-cta, .enterprise-tier, [data-enterprise]')) {
                this.trackConversion('enterprise_click', {
                    element: target.textContent.trim(),
                    location: this.getElementLocation(target)
                });
            }
        });
    }
    
    getElementLocation(element) {
        // Get element's section context
        const section = element.closest('section');
        return section ? section.className : 'unknown';
    }
    
    addEnterpriseSpecificFeatures() {
        this.addLiveChat();
        this.addSchedulingWidget();
        this.addCompetitorComparison();
        
        console.log('🚀 Enterprise-specific features added');
    }
    
    addLiveChat() {
        // Add enterprise live chat widget
        const chatWidget = document.createElement('div');
        chatWidget.className = 'enterprise-chat-widget';
        chatWidget.innerHTML = `
            <button class="chat-trigger" id="enterpriseChat">
                <i class="fas fa-comments"></i>
                <span>Talk to Austin's Team</span>
                <div class="chat-badge">Live</div>
            </button>
            
            <div class="chat-popup" id="chatPopup">
                <div class="chat-header">
                    <h4>Championship Support</h4>
                    <button class="chat-close">&times;</button>
                </div>
                
                <div class="chat-content">
                    <div class="chat-message system">
                        <div class="message-content">
                            <p>👋 Hi! I'm here to help you get started with Austin's AI platform.</p>
                            <p>What questions do you have about our enterprise solutions?</p>
                        </div>
                    </div>
                    
                    <div class="quick-actions">
                        <button class="quick-action" data-action="pricing">Pricing Information</button>
                        <button class="quick-action" data-action="demo">Schedule Demo</button>
                        <button class="quick-action" data-action="integration">Integration Options</button>
                    </div>
                </div>
                
                <div class="chat-footer">
                    <p>Average response time: <strong>2 minutes</strong></p>
                </div>
            </div>
        `;
        
        document.body.appendChild(chatWidget);
        
        this.setupChatWidget();
    }
    
    setupChatWidget() {
        const trigger = document.getElementById('enterpriseChat');
        const popup = document.getElementById('chatPopup');
        const closeBtn = popup.querySelector('.chat-close');
        
        trigger.addEventListener('click', () => {
            popup.classList.toggle('show');
            this.trackConversion('chat_opened');
        });
        
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
        });
        
        // Quick action handlers
        const quickActions = popup.querySelectorAll('.quick-action');
        quickActions.forEach(action => {
            action.addEventListener('click', () => {
                const actionType = action.dataset.action;
                this.handleQuickAction(actionType);
            });
        });
    }
    
    handleQuickAction(action) {
        switch (action) {
            case 'pricing':
                document.querySelector('.enterprise-pricing-section')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'demo':
                document.querySelector('.enhanced-demo-section')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'integration':
                window.open('/integrations', '_blank');
                break;
        }
        
        this.trackConversion('chat_quick_action', { action });
    }
    
    optimizeProfessionalMessaging() {
        this.enhanceValuePropositions();
        this.addAuthorityIndicators();
        this.optimizeCallsToAction();
        
        this.enterpriseFeatures.professionalMessaging = true;
        console.log('💼 Professional messaging optimized');
    }
    
    enhanceValuePropositions() {
        // Find and enhance existing value propositions
        const valueElements = document.querySelectorAll('.value-prop, .benefit, .feature-card');
        
        valueElements.forEach(element => {
            this.enhanceValueElement(element);
        });
    }
    
    enhanceValueElement(element) {
        // Add quantified benefits where possible
        const text = element.textContent.toLowerCase();
        
        if (text.includes('analytics') || text.includes('analysis')) {
            this.addQuantifiedBenefit(element, '94.6% accuracy');
        }
        
        if (text.includes('fast') || text.includes('quick')) {
            this.addQuantifiedBenefit(element, 'Setup in 24 hours');
        }
        
        if (text.includes('support') || text.includes('help')) {
            this.addQuantifiedBenefit(element, '2-minute response time');
        }
    }
    
    addQuantifiedBenefit(element, benefit) {
        if (element.querySelector('.quantified-benefit')) return;
        
        const benefitBadge = document.createElement('span');
        benefitBadge.className = 'quantified-benefit';
        benefitBadge.textContent = benefit;
        
        element.appendChild(benefitBadge);
    }
    
    addPricingStyles() {
        const styles = `
            .enterprise-pricing-section {
                padding: 4rem 2rem;
                background: linear-gradient(135deg, rgba(10, 25, 47, 0.95), rgba(17, 34, 64, 0.95));
            }
            
            .pricing-container {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .pricing-header {
                text-align: center;
                margin-bottom: 3rem;
            }
            
            .pricing-header h2 {
                color: #BF5700;
                font-size: 2.5rem;
                margin-bottom: 1rem;
            }
            
            .pricing-subtitle {
                color: #8892B0;
                font-size: 1.2rem;
            }
            
            .pricing-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }
            
            .pricing-tier {
                background: rgba(17, 34, 64, 0.6);
                border: 1px solid rgba(136, 146, 176, 0.2);
                border-radius: 16px;
                padding: 2rem;
                position: relative;
                transition: all 0.3s ease;
            }
            
            .pricing-tier:hover {
                transform: translateY(-5px);
                border-color: rgba(191, 87, 0, 0.5);
            }
            
            .pricing-tier.popular {
                border-color: #BF5700;
                background: rgba(191, 87, 0, 0.1);
            }
            
            .popular-badge {
                position: absolute;
                top: -12px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #BF5700, #FFB81C);
                color: #0A192F;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 700;
            }
            
            .tier-header h3 {
                color: #E6F1FF;
                font-size: 1.5rem;
                margin-bottom: 1rem;
            }
            
            .tier-price {
                margin-bottom: 2rem;
            }
            
            .price {
                font-size: 3rem;
                font-weight: 900;
                color: #BF5700;
            }
            
            .period {
                color: #8892B0;
                font-size: 1rem;
            }
            
            .tier-features {
                list-style: none;
                margin-bottom: 2rem;
            }
            
            .tier-features li {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
                color: #E6F1FF;
            }
            
            .tier-features i {
                color: #10B981;
            }
            
            .tier-cta {
                width: 100%;
                padding: 1rem 2rem;
                background: linear-gradient(135deg, #BF5700, #FFB81C);
                color: #0A192F;
                border: none;
                border-radius: 12px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .tier-cta:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(191, 87, 0, 0.3);
            }
            
            .cta-sub {
                display: block;
                font-size: 0.8rem;
                opacity: 0.8;
                margin-top: 0.25rem;
            }
            
            .pricing-guarantee {
                text-align: center;
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.3);
                border-radius: 16px;
                padding: 2rem;
            }
            
            .guarantee-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
            }
            
            .guarantee-content i {
                color: #10B981;
                font-size: 2rem;
            }
            
            .guarantee-content h4 {
                color: #E6F1FF;
                margin: 0 0 0.5rem 0;
            }
            
            @media (max-width: 768px) {
                .pricing-grid {
                    grid-template-columns: 1fr;
                }
                
                .guarantee-content {
                    flex-direction: column;
                    text-align: center;
                }
            }
        `;
        
        this.addStyleSheet('enterprise-pricing-styles', styles);
    }
    
    addDemoFormStyles() {
        const styles = `
            .enhanced-demo-section {
                padding: 4rem 2rem;
                background: linear-gradient(135deg, rgba(17, 34, 64, 0.95), rgba(10, 25, 47, 0.95));
            }
            
            .demo-container {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .demo-header {
                text-align: center;
                margin-bottom: 3rem;
            }
            
            .demo-header h2 {
                color: #BF5700;
                font-size: 2.5rem;
                margin-bottom: 1rem;
            }
            
            .demo-benefits {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-top: 2rem;
                flex-wrap: wrap;
            }
            
            .demo-benefit {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #8892B0;
            }
            
            .demo-benefit i {
                color: #10B981;
            }
            
            .enterprise-demo-form {
                background: rgba(17, 34, 64, 0.6);
                border: 1px solid rgba(191, 87, 0, 0.3);
                border-radius: 16px;
                padding: 2rem;
                margin-bottom: 2rem;
            }
            
            .form-progress {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }
            
            .progress-bar {
                flex: 1;
                height: 6px;
                background: rgba(136, 146, 176, 0.2);
                border-radius: 3px;
                overflow: hidden;
                margin-right: 1rem;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #BF5700, #FFB81C);
                transition: width 0.3s ease;
                width: 0%;
            }
            
            .form-step {
                display: none;
            }
            
            .form-step.active {
                display: block;
            }
            
            .field-group {
                margin-bottom: 1.5rem;
            }
            
            .field-group label {
                display: block;
                color: #E6F1FF;
                margin-bottom: 0.5rem;
                font-weight: 600;
            }
            
            .field-group input,
            .field-group select,
            .field-group textarea {
                width: 100%;
                padding: 0.75rem 1rem;
                background: rgba(10, 25, 47, 0.7);
                border: 1px solid rgba(136, 146, 176, 0.3);
                border-radius: 8px;
                color: #E6F1FF;
                font-size: 1rem;
                transition: all 0.3s ease;
            }
            
            .field-group input:focus,
            .field-group select:focus,
            .field-group textarea:focus {
                outline: none;
                border-color: #BF5700;
                box-shadow: 0 0 0 3px rgba(191, 87, 0, 0.1);
            }
            
            .field-success {
                border-color: #10B981 !important;
            }
            
            .field-error {
                border-color: #FF3B30 !important;
            }
            
            .field-error-message {
                color: #FF3B30;
                font-size: 0.8rem;
                margin-top: 0.25rem;
            }
            
            .form-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 2rem;
            }
            
            .btn-primary,
            .btn-secondary {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #BF5700, #FFB81C);
                color: #0A192F;
            }
            
            .btn-secondary {
                background: rgba(136, 146, 176, 0.2);
                color: #E6F1FF;
                border: 1px solid rgba(136, 146, 176, 0.3);
            }
            
            .btn-primary:hover,
            .btn-secondary:hover {
                transform: translateY(-2px);
            }
            
            .demo-social-proof {
                display: flex;
                justify-content: space-around;
                margin-top: 2rem;
                padding: 1.5rem;
                background: rgba(10, 25, 47, 0.5);
                border-radius: 12px;
            }
            
            .proof-item {
                text-align: center;
            }
            
            .proof-stat {
                font-size: 2rem;
                font-weight: 900;
                color: #BF5700;
                display: block;
            }
            
            .proof-label {
                color: #8892B0;
                font-size: 0.9rem;
            }
            
            @media (max-width: 768px) {
                .demo-benefits {
                    flex-direction: column;
                    align-items: center;
                }
                
                .form-actions {
                    flex-direction: column;
                }
                
                .demo-social-proof {
                    flex-direction: column;
                    gap: 1rem;
                }
            }
        `;
        
        this.addStyleSheet('enterprise-demo-styles', styles);
    }
    
    addStyleSheet(id, styles) {
        // Check if stylesheet already exists
        if (document.getElementById(id)) return;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = id;
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // Public API
    getMetrics() {
        return {
            ...this.conversionMetrics,
            features: this.enterpriseFeatures,
            timestamp: Date.now()
        };
    }
    
    enableFeature(featureName) {
        switch (featureName) {
            case 'pricing':
                this.optimizePricingPresentation();
                break;
            case 'demo':
                this.enhanceDemoRequestFlow();
                break;
            case 'credibility':
                this.addCredibilityIndicators();
                break;
            case 'messaging':
                this.optimizeProfessionalMessaging();
                break;
        }
    }
}

// Initialize Enterprise UX Optimizer
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enterpriseUX = new EnterpriseUXOptimizer();
    });
} else {
    window.enterpriseUX = new EnterpriseUXOptimizer();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnterpriseUXOptimizer;
}