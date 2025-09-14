/**
 * Project Management Module
 * Handles project data, generation, and portfolio management
 */

export default class ProjectManager {
    constructor(core) {
        this.core = core;
        this.projects = new Map();
        this.categories = ['Analytics', 'AI/ML', 'Finance', 'Strategy', 'Research', 'Performance'];
        this.templates = new Map();
        this.generatedProjects = [];
        this.featuredProjects = [];
    }

    async initialize() {
        try {
            await this.loadProjectTemplates();
            await this.loadFeaturedProjects();
            this.setupEventListeners();
            this.renderInitialProjects();
            
            console.log('✓ Project Manager initialized');
        } catch (error) {
            console.error('Failed to initialize Project Manager:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Listen for project generation requests
        this.core.on('project:generate', (event) => {
            this.generateProject(event.detail);
        });

        // Listen for project updates
        this.core.on('project:update', (event) => {
            this.updateProject(event.detail);
        });

        // Setup UI event listeners
        this.setupUIEventListeners();
    }

    setupUIEventListeners() {
        // Project generation button
        const generateBtn = document.getElementById('generate-project-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.handleProjectGeneration();
            });
        }

        // Project category filters
        this.setupCategoryFilters();

        // Project search
        this.setupProjectSearch();
    }

    setupCategoryFilters() {
        const filterContainer = document.getElementById('project-filters');
        if (!filterContainer) return;

        const filtersHTML = this.categories.map(category => `
            <button class="category-filter px-4 py-2 rounded-lg glass hover:bg-orange-500/20 transition-colors" 
                    data-category="${category}">
                ${category}
            </button>
        `).join('');

        filterContainer.innerHTML = `
            <div class="flex flex-wrap gap-2 mb-6">
                <button class="category-filter px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 transition-colors active" 
                        data-category="all">
                    All Projects
                </button>
                ${filtersHTML}
            </div>
        `;

        // Add event listeners
        filterContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('category-filter')) {
                this.filterProjects(event.target.dataset.category);
                this.updateActiveFilter(event.target);
            }
        });
    }

    setupProjectSearch() {
        const searchInput = document.getElementById('project-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', (event) => {
            this.searchProjects(event.target.value);
        });
    }

    async loadProjectTemplates() {
        this.templates.set('analytics', {
            category: 'Analytics',
            baseStructure: {
                keyFeatures: [
                    'Real-time data processing',
                    'Interactive dashboards',
                    'Predictive modeling',
                    'Performance metrics'
                ],
                techStack: [
                    'Python/R for analysis',
                    'JavaScript for visualization',
                    'SQL for data management',
                    'Chart.js/D3.js for charts'
                ]
            }
        });

        this.templates.set('ai', {
            category: 'AI/ML',
            baseStructure: {
                keyFeatures: [
                    'Machine learning models',
                    'Natural language processing',
                    'Computer vision',
                    'Model optimization'
                ],
                techStack: [
                    'TensorFlow/PyTorch',
                    'Python/Jupyter',
                    'REST APIs',
                    'Cloud ML platforms'
                ]
            }
        });

        this.templates.set('finance', {
            category: 'Finance',
            baseStructure: {
                keyFeatures: [
                    'Financial modeling',
                    'Risk assessment',
                    'Portfolio optimization',
                    'Market analysis'
                ],
                techStack: [
                    'Python/pandas',
                    'Excel/VBA',
                    'SQL databases',
                    'Financial APIs'
                ]
            }
        });

        this.templates.set('strategy', {
            category: 'Strategy',
            baseStructure: {
                keyFeatures: [
                    'Strategic planning',
                    'Competitive analysis',
                    'Market research',
                    'Performance tracking'
                ],
                techStack: [
                    'Business intelligence tools',
                    'Data visualization',
                    'Statistical analysis',
                    'Reporting systems'
                ]
            }
        });
    }

    async loadFeaturedProjects() {
        this.featuredProjects = [
            {
                id: 'nba-animation-analysis',
                title: 'NBA 2K Animation Threshold Analysis',
                category: 'Analytics',
                excerpt: 'Reverse-engineered NBA 2K25 animation requirements to reveal hidden attribute thresholds, providing competitive insights for gamers optimizing player builds.',
                keyFeatures: [
                    'Data mining from game mechanics',
                    'Statistical threshold analysis',
                    'Performance optimization metrics',
                    'Competitive gaming insights'
                ],
                techStack: [
                    'Python for data analysis',
                    'SQL for data management',
                    'Matplotlib for visualization',
                    'Game API integration'
                ],
                status: 'completed',
                impact: 'High engagement from gaming community',
                dateCompleted: '2024-12',
                featured: true
            },
            {
                id: 'womens-soccer-market-surge',
                title: 'Women\'s Soccer Market Analysis',
                category: 'Strategy',
                excerpt: 'Identified 30% surge in women\'s soccer interest post-World Cup, developing targeted marketing strategies for sports brands.',
                keyFeatures: [
                    'Market trend analysis',
                    'Consumer behavior modeling',
                    'Brand positioning strategy',
                    'ROI optimization'
                ],
                techStack: [
                    'Google Analytics',
                    'Social media APIs',
                    'R for statistical analysis',
                    'Tableau for dashboards'
                ],
                status: 'completed',
                impact: 'Strategic insights for sports marketing',
                dateCompleted: '2024-11',
                featured: true
            },
            {
                id: 'betting-odds-analysis',
                title: 'Cardinals Betting Odds Intelligence',
                category: 'Finance',
                excerpt: 'Analyzed betting market movements for Cardinals playoff performance, providing insights for odds-setting algorithms.',
                keyFeatures: [
                    'Real-time odds tracking',
                    'Market movement analysis',
                    'Predictive modeling',
                    'Risk assessment'
                ],
                techStack: [
                    'Python for modeling',
                    'APIs for odds data',
                    'Machine learning algorithms',
                    'Real-time dashboards'
                ],
                status: 'completed',
                impact: 'Improved betting market efficiency',
                dateCompleted: '2024-10',
                featured: true
            }
        ];

        // Store in projects map
        this.featuredProjects.forEach(project => {
            this.projects.set(project.id, project);
        });
    }

    renderInitialProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;

        const projectsHTML = this.featuredProjects.map(project => 
            this.createProjectHTML(project)
        ).join('');

        container.innerHTML = projectsHTML;

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    async handleProjectGeneration() {
        const inputElement = document.getElementById('project-idea-input');
        const buttonElement = document.getElementById('generate-project-btn');
        
        if (!inputElement || !buttonElement) return;

        const domain = inputElement.value.trim();
        if (!domain) {
            this.showError('Please enter a project domain or idea.');
            return;
        }

        try {
            // Update UI
            this.core.getModule('ui')?.setButtonLoading(buttonElement, true);
            
            // Generate project using AI
            const aiManager = this.core.getModule('ai');
            if (!aiManager) {
                throw new Error('AI Manager not available');
            }

            const projectData = await this.generateProjectWithAI(domain);
            
            // Add to generated projects
            this.addGeneratedProject(projectData);
            
            // Update analytics
            this.core.updateAnalytics('projectIdeas', 1);
            
            // Clear input
            inputElement.value = '';
            
        } catch (error) {
            this.handleError('Project generation failed', error);
        } finally {
            this.core.getModule('ui')?.setButtonLoading(buttonElement, false);
        }
    }

    async generateProjectWithAI(domain) {
        const aiManager = this.core.getModule('ai');
        
        const prompt = this.buildProjectPrompt(domain);
        const schema = this.getProjectSchema();
        
        const response = await aiManager.generateResponse({
            prompt: prompt,
            type: 'project',
            schema: schema
        });

        let projectData;
        try {
            projectData = JSON.parse(response);
        } catch (error) {
            throw new Error('Failed to parse AI response');
        }

        // Enhance with metadata
        projectData.id = this.generateProjectId();
        projectData.dateGenerated = new Date().toISOString();
        projectData.status = 'concept';
        projectData.generated = true;

        return projectData;
    }

    buildProjectPrompt(domain) {
        return `Generate a comprehensive project idea for my professional portfolio based on the domain: "${domain}".

The project should align with my background in:
- Cognitive performance analysis
- Financial strategy and analytics
- Sports and competitive intelligence
- Strategic decision-making

Create a project that demonstrates:
1. Analytical thinking and data-driven insights
2. Real-world application and business value
3. Technical sophistication and innovation
4. Clear measurable outcomes

The project should be realistic, implementable, and showcase skills relevant to high-performance environments.`;
    }

    getProjectSchema() {
        return {
            type: 'object',
            properties: {
                title: { 
                    type: 'string',
                    description: 'Compelling project title'
                },
                category: { 
                    type: 'string',
                    enum: this.categories
                },
                excerpt: { 
                    type: 'string',
                    description: 'Brief description of the project (2-3 sentences)'
                },
                keyFeatures: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'List of 4-6 key features or capabilities'
                },
                techStack: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'List of 4-6 technologies and tools'
                },
                businessValue: {
                    type: 'string',
                    description: 'Clear statement of business impact'
                },
                complexity: {
                    type: 'string',
                    enum: ['Low', 'Medium', 'High'],
                    description: 'Project complexity level'
                }
            },
            required: ['title', 'category', 'excerpt', 'keyFeatures', 'techStack', 'businessValue', 'complexity']
        };
    }

    addGeneratedProject(projectData) {
        // Add to generated projects array
        this.generatedProjects.unshift(projectData);
        
        // Store in projects map
        this.projects.set(projectData.id, projectData);
        
        // Render the new project
        this.renderGeneratedProject(projectData);
        
        // Update state
        this.core.updateState('projects.generated', this.generatedProjects);
    }

    renderGeneratedProject(projectData) {
        const container = document.getElementById('generated-projects-container');
        if (!container) return;

        const projectHTML = this.createProjectHTML(projectData, true);
        
        // Add to beginning of container
        container.insertAdjacentHTML('afterbegin', projectHTML);
        
        // Animate in
        const newElement = container.firstElementChild;
        setTimeout(() => {
            newElement.classList.add('visible');
        }, 50);
        
        // Reinitialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    createProjectHTML(project, isGenerated = false) {
        const statusColor = this.getStatusColor(project.status);
        const complexityColor = this.getComplexityColor(project.complexity);
        
        return `
            <div class="project-card glass p-8 rounded-2xl reveal opacity-0 transform translate-y-4 transition-all duration-500" 
                 data-category="${project.category}" data-project-id="${project.id}">
                
                <!-- Header -->
                <div class="flex items-start justify-between mb-6">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h3 class="text-2xl font-bold text-white">${project.title}</h3>
                            ${project.featured ? '<i data-lucide="star" class="w-5 h-5 text-yellow-400"></i>' : ''}
                            ${isGenerated ? '<i data-lucide="sparkles" class="w-5 h-5 text-orange-400" title="AI Generated"></i>' : ''}
                        </div>
                        
                        <div class="flex items-center gap-4 mb-3">
                            <span class="text-sm font-semibold tracking-wider uppercase text-orange-400">
                                ${project.category}
                            </span>
                            
                            ${project.status ? `
                                <span class="text-xs font-bold px-2 py-1 rounded-full ${statusColor} border">
                                    ${project.status}
                                </span>
                            ` : ''}
                            
                            ${project.complexity ? `
                                <span class="text-xs font-bold px-2 py-1 rounded-full ${complexityColor} border">
                                    ${project.complexity} Complexity
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <button class="project-action-btn p-2 rounded-lg glass hover:bg-orange-500/20 transition-colors" 
                                title="View Details" onclick="blazeCore.getModule('projects').viewProject('${project.id}')">
                            <i data-lucide="eye" class="w-4 h-4"></i>
                        </button>
                        <button class="project-action-btn p-2 rounded-lg glass hover:bg-orange-500/20 transition-colors" 
                                title="Edit Project" onclick="blazeCore.getModule('projects').editProject('${project.id}')">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        ${isGenerated ? `
                            <button class="project-action-btn p-2 rounded-lg glass hover:bg-red-500/20 transition-colors" 
                                    title="Remove Project" onclick="blazeCore.getModule('projects').removeProject('${project.id}')">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Description -->
                <p class="text-slate-400 mb-6 leading-relaxed">${project.excerpt}</p>
                
                <!-- Business Value (if available) -->
                ${project.businessValue ? `
                    <div class="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <h4 class="font-semibold text-orange-300 mb-2 flex items-center gap-2">
                            <i data-lucide="trending-up" class="w-4 h-4"></i>
                            Business Value
                        </h4>
                        <p class="text-slate-300 text-sm">${project.businessValue}</p>
                    </div>
                ` : ''}
                
                <!-- Features and Tech Stack -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-white mb-3 flex items-center gap-2">
                            <i data-lucide="check-circle" class="w-4 h-4 text-orange-400"></i>
                            Key Features
                        </h4>
                        <ul class="space-y-2">
                            ${project.keyFeatures.map(feature => `
                                <li class="flex items-start gap-2 text-slate-400">
                                    <i data-lucide="arrow-right" class="w-3 h-3 mt-1 text-orange-400 flex-shrink-0"></i>
                                    <span class="text-sm">${feature}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div>
                        <h4 class="font-semibold text-white mb-3 flex items-center gap-2">
                            <i data-lucide="code" class="w-4 h-4 text-orange-400"></i>
                            Tech Stack
                        </h4>
                        <ul class="space-y-2">
                            ${project.techStack.map(tech => `
                                <li class="flex items-start gap-2 text-slate-400">
                                    <i data-lucide="arrow-right" class="w-3 h-3 mt-1 text-orange-400 flex-shrink-0"></i>
                                    <span class="text-sm">${tech}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                
                <!-- Footer -->
                ${(project.impact || project.dateCompleted || project.dateGenerated) ? `
                    <div class="mt-6 pt-6 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            ${project.impact ? `<span>Impact: ${project.impact}</span>` : ''}
                        </div>
                        <div>
                            ${project.dateCompleted ? `Completed: ${new Date(project.dateCompleted).toLocaleDateString()}` : ''}
                            ${project.dateGenerated ? `Generated: ${new Date(project.dateGenerated).toLocaleDateString()}` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getStatusColor(status) {
        const colors = {
            'completed': 'border-green-500/50 text-green-400 bg-green-500/10',
            'in-progress': 'border-blue-500/50 text-blue-400 bg-blue-500/10',
            'concept': 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10',
            'planning': 'border-purple-500/50 text-purple-400 bg-purple-500/10'
        };
        return colors[status] || colors.concept;
    }

    getComplexityColor(complexity) {
        const colors = {
            'Low': 'border-green-500/50 text-green-400 bg-green-500/10',
            'Medium': 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10',
            'High': 'border-red-500/50 text-red-400 bg-red-500/10'
        };
        return colors[complexity] || colors.Medium;
    }

    // Project management methods
    viewProject(projectId) {
        const project = this.projects.get(projectId);
        if (!project) return;

        const uiManager = this.core.getModule('ui');
        if (uiManager) {
            const content = this.createProjectDetailHTML(project);
            uiManager.showModal(`Project: ${project.title}`, content);
        }
    }

    editProject(projectId) {
        const project = this.projects.get(projectId);
        if (!project) return;

        const uiManager = this.core.getModule('ui');
        if (uiManager) {
            const content = this.createProjectEditHTML(project);
            uiManager.showModal(`Edit: ${project.title}`, content);
        }
    }

    removeProject(projectId) {
        const project = this.projects.get(projectId);
        if (!project) return;

        if (confirm(`Are you sure you want to remove "${project.title}"?`)) {
            // Remove from data structures
            this.projects.delete(projectId);
            this.generatedProjects = this.generatedProjects.filter(p => p.id !== projectId);
            
            // Remove from DOM
            const element = document.querySelector(`[data-project-id="${projectId}"]`);
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(-20px)';
                setTimeout(() => element.remove(), 300);
            }
            
            // Update state
            this.core.updateState('projects.generated', this.generatedProjects);
            this.core.updateAnalytics('projectsRemoved', 1);
        }
    }

    createProjectDetailHTML(project) {
        return `
            <div class="project-details space-y-6">
                <!-- Project Header -->
                <div class="border-b border-slate-700 pb-6">
                    <div class="flex items-center gap-3 mb-3">
                        <h2 class="text-2xl font-bold text-white">${project.title}</h2>
                        ${project.featured ? '<i data-lucide="star" class="w-6 h-6 text-yellow-400"></i>' : ''}
                        ${project.generated ? '<i data-lucide="sparkles" class="w-6 h-6 text-orange-400"></i>' : ''}
                    </div>
                    
                    <div class="flex items-center gap-4 mb-4">
                        <span class="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-semibold">
                            ${project.category}
                        </span>
                        ${project.status ? `
                            <span class="px-3 py-1 rounded-full ${this.getStatusColor(project.status)} text-sm font-semibold">
                                ${project.status}
                            </span>
                        ` : ''}
                        ${project.complexity ? `
                            <span class="px-3 py-1 rounded-full ${this.getComplexityColor(project.complexity)} text-sm font-semibold">
                                ${project.complexity}
                            </span>
                        ` : ''}
                    </div>
                    
                    <p class="text-slate-300 leading-relaxed">${project.excerpt}</p>
                </div>
                
                <!-- Business Value -->
                ${project.businessValue ? `
                    <div class="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-lg p-6">
                        <h3 class="text-lg font-bold text-orange-300 mb-3 flex items-center gap-2">
                            <i data-lucide="trending-up" class="w-5 h-5"></i>
                            Business Value
                        </h3>
                        <p class="text-slate-300">${project.businessValue}</p>
                    </div>
                ` : ''}
                
                <!-- Key Features -->
                <div>
                    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <i data-lucide="check-circle" class="w-5 h-5 text-orange-400"></i>
                        Key Features
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${project.keyFeatures.map(feature => `
                            <div class="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                                <i data-lucide="arrow-right" class="w-4 h-4 mt-0.5 text-orange-400 flex-shrink-0"></i>
                                <span class="text-slate-300">${feature}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Tech Stack -->
                <div>
                    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <i data-lucide="code" class="w-5 h-5 text-orange-400"></i>
                        Technology Stack
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${project.techStack.map(tech => `
                            <div class="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                                <i data-lucide="arrow-right" class="w-4 h-4 mt-0.5 text-orange-400 flex-shrink-0"></i>
                                <span class="text-slate-300">${tech}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Project Timeline/Metadata -->
                <div class="border-t border-slate-700 pt-6">
                    <h3 class="text-lg font-bold text-white mb-4">Project Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        ${project.dateCompleted ? `
                            <div class="flex items-center gap-2">
                                <i data-lucide="calendar-check" class="w-4 h-4 text-green-400"></i>
                                <span class="text-slate-400">Completed:</span>
                                <span class="text-white">${new Date(project.dateCompleted).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                        ${project.dateGenerated ? `
                            <div class="flex items-center gap-2">
                                <i data-lucide="calendar-plus" class="w-4 h-4 text-orange-400"></i>
                                <span class="text-slate-400">Generated:</span>
                                <span class="text-white">${new Date(project.dateGenerated).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                        ${project.impact ? `
                            <div class="flex items-center gap-2 md:col-span-2">
                                <i data-lucide="target" class="w-4 h-4 text-blue-400"></i>
                                <span class="text-slate-400">Impact:</span>
                                <span class="text-white">${project.impact}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    createProjectEditHTML(project) {
        return `
            <div class="project-edit-form space-y-6">
                <form id="edit-project-form-${project.id}">
                    <!-- Basic Information -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-2">Project Title</label>
                            <input type="text" name="title" value="${project.title}" 
                                   class="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-2">Category</label>
                            <select name="category" class="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500">
                                ${this.categories.map(cat => `
                                    <option value="${cat}" ${cat === project.category ? 'selected' : ''}>${cat}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-2">Description</label>
                            <textarea name="excerpt" rows="3" 
                                      class="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500">${project.excerpt}</textarea>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex gap-3 pt-6 border-t border-slate-700">
                        <button type="submit" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                            Save Changes
                        </button>
                        <button type="button" onclick="document.getElementById('ai-modal').style.display='none'" 
                                class="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            
            <script>
                document.getElementById('edit-project-form-${project.id}').addEventListener('submit', function(e) {
                    e.preventDefault();
                    const formData = new FormData(this);
                    const updatedProject = {
                        id: '${project.id}',
                        title: formData.get('title'),
                        category: formData.get('category'),
                        excerpt: formData.get('excerpt')
                    };
                    window.blazeCore.getModule('projects').updateProject(updatedProject);
                    document.getElementById('ai-modal').style.display = 'none';
                });
            </script>
        `;
    }

    updateProject(updatedData) {
        const project = this.projects.get(updatedData.id);
        if (!project) return;

        // Update project data
        Object.assign(project, updatedData);
        
        // Update in generated projects array if applicable
        const generatedIndex = this.generatedProjects.findIndex(p => p.id === updatedData.id);
        if (generatedIndex !== -1) {
            this.generatedProjects[generatedIndex] = project;
        }
        
        // Re-render the project
        this.rerenderProject(project);
        
        // Update state
        this.core.updateState('projects.generated', this.generatedProjects);
        this.core.updateAnalytics('projectsUpdated', 1);
    }

    rerenderProject(project) {
        const element = document.querySelector(`[data-project-id="${project.id}"]`);
        if (element) {
            const newHTML = this.createProjectHTML(project, project.generated);
            element.outerHTML = newHTML;
            
            // Reinitialize icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    // Filter and search methods
    filterProjects(category) {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const shouldShow = category === 'all' || cardCategory === category;
            
            if (shouldShow) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    updateActiveFilter(activeButton) {
        // Remove active class from all filter buttons
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active', 'bg-orange-500/20', 'text-orange-400');
        });
        
        // Add active class to clicked button
        activeButton.classList.add('active', 'bg-orange-500/20', 'text-orange-400');
    }

    searchProjects(query) {
        const projectCards = document.querySelectorAll('.project-card');
        const searchTerm = query.toLowerCase();
        
        projectCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const excerpt = card.querySelector('p').textContent.toLowerCase();
            const category = card.dataset.category.toLowerCase();
            
            const matches = title.includes(searchTerm) || 
                          excerpt.includes(searchTerm) || 
                          category.includes(searchTerm);
            
            if (matches || query === '') {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    // Utility methods
    generateProjectId() {
        return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    showError(message) {
        const uiManager = this.core.getModule('ui');
        if (uiManager) {
            uiManager.showNotification(message, 'error');
        }
    }

    handleError(message, error) {
        console.error(message, error);
        this.showError(`${message}: ${error.message}`);
    }

    // Export methods
    exportProjects() {
        const exportData = {
            featured: this.featuredProjects,
            generated: this.generatedProjects,
            categories: this.categories,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blaze-projects-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Debug methods
    debug() {
        return {
            totalProjects: this.projects.size,
            featuredCount: this.featuredProjects.length,
            generatedCount: this.generatedProjects.length,
            categories: this.categories,
            templates: Array.from(this.templates.keys())
        };
    }
}