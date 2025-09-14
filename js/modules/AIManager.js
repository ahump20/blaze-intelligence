/**
 * AI Management Module
 * Handles all AI interactions, API calls, and model management
 */

export default class AIManager {
    constructor(core) {
        this.core = core;
        this.models = {
            'gemini-2.0-flash': {
                name: 'Gemini 2.0 Flash',
                provider: 'google',
                endpoint: '/api/ai/gemini',
                capabilities: ['text', 'image', 'code', 'json'],
                maxTokens: 8192,
                temperature: 0.7
            },
            'claude-3-sonnet': {
                name: 'Claude 3 Sonnet',
                provider: 'anthropic',
                endpoint: '/api/ai/claude',
                capabilities: ['text', 'image', 'code', 'analysis'],
                maxTokens: 4096,
                temperature: 0.6
            }
        };
        
        this.currentModel = 'gemini-2.0-flash';
        this.conversationHistory = [];
        this.rateLimiter = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
    }

    async initialize() {
        this.setupEventListeners();
        await this.validateModels();
        this.startRequestProcessor();
        
        // Listen for UI events
        this.core.on('ui:ai-request', (event) => {
            this.handleUIRequest(event.detail);
        });
    }

    setupEventListeners() {
        // Chat functionality
        const getAiBtn = document.getElementById('get-ai-btn');
        const aiPromptInput = document.getElementById('ai-prompt-input');
        
        if (getAiBtn) {
            getAiBtn.addEventListener('click', () => {
                this.handleChatRequest();
            });
        }

        // Project generation
        const generateProjectBtn = document.getElementById('generate-project-btn');
        if (generateProjectBtn) {
            generateProjectBtn.addEventListener('click', () => {
                this.handleProjectGeneration();
            });
        }

        // Code generation
        const generateCodeBtn = document.getElementById('generate-code-btn');
        if (generateCodeBtn) {
            generateCodeBtn.addEventListener('click', () => {
                this.handleCodeGeneration();
            });
        }

        // Code analysis
        const analyzeCodeBtn = document.getElementById('analyze-code-btn');
        if (analyzeCodeBtn) {
            analyzeCodeBtn.addEventListener('click', () => {
                this.handleCodeAnalysis();
            });
        }

        // Career trajectory analysis
        const analyzeTrajectoryBtn = document.getElementById('analyze-trajectory-btn');
        if (analyzeTrajectoryBtn) {
            analyzeTrajectoryBtn.addEventListener('click', () => {
                this.handleTrajectoryAnalysis();
            });
        }
    }

    async validateModels() {
        // Test model availability
        for (const [modelId, model] of Object.entries(this.models)) {
            try {
                await this.testModel(modelId);
                console.log(`✓ Model ${modelId} is available`);
            } catch (error) {
                console.warn(`✗ Model ${modelId} failed validation:`, error);
                model.available = false;
            }
        }
    }

    async testModel(modelId) {
        const model = this.models[modelId];
        if (!model) throw new Error(`Model ${modelId} not found`);
        
        // Simple test request
        const testRequest = {
            model: modelId,
            prompt: 'Test connection. Respond with "OK".',
            maxTokens: 10
        };
        
        try {
            const response = await this.makeRequest(testRequest);
            return response.includes('OK');
        } catch (error) {
            throw new Error(`Model test failed: ${error.message}`);
        }
    }

    // Request handling
    async handleChatRequest() {
        const promptInput = document.getElementById('ai-prompt-input');
        const imageInput = document.getElementById('ai-img-upload');
        const getAiBtn = document.getElementById('get-ai-btn');
        
        if (!promptInput || !getAiBtn) return;
        
        const text = promptInput.value.trim();
        const imageFile = imageInput?.files[0];
        
        if (!text && !imageFile) {
            this.showError('Please enter a message or upload an image.');
            return;
        }

        try {
            // Update UI
            this.appendMessage('user', text || '[Image Attached]');
            this.core.getModule('ui').setButtonLoading(getAiBtn, true);
            
            // Make AI request
            const response = await this.generateResponse({
                prompt: text,
                image: imageFile,
                type: 'chat'
            });
            
            // Display response
            this.appendMessage('assistant', response, this.currentModel);
            
            // Update analytics
            this.core.updateAnalytics('aiInteractions', 1);
            
            // Clear inputs
            promptInput.value = '';
            if (imageInput) imageInput.value = '';
            this.clearImagePreview();
            
        } catch (error) {
            this.handleError('Chat request failed', error);
        } finally {
            this.core.getModule('ui').setButtonLoading(getAiBtn, false);
        }
    }

    async handleProjectGeneration() {
        const projectInput = document.getElementById('project-idea-input');
        const generateBtn = document.getElementById('generate-project-btn');
        const container = document.getElementById('generated-projects-container');
        
        if (!projectInput || !generateBtn || !container) return;
        
        const domain = projectInput.value.trim();
        if (!domain) {
            this.showError('Please enter a project domain.');
            return;
        }

        try {
            this.core.getModule('ui').setButtonLoading(generateBtn, true);
            
            const response = await this.generateResponse({
                prompt: `Generate a new "Signature Project" idea for my portfolio based on the domain of "${domain}". The project should fit the theme of cognitive performance, finance, and strategic analysis.`,
                type: 'project',
                schema: this.getProjectSchema()
            });
            
            const projectData = JSON.parse(response);
            this.renderProject(projectData, container);
            
            this.core.updateAnalytics('projectIdeas', 1);
            projectInput.value = '';
            
        } catch (error) {
            this.handleError('Project generation failed', error);
        } finally {
            this.core.getModule('ui').setButtonLoading(generateBtn, false);
        }
    }

    async handleCodeGeneration() {
        const promptInput = document.getElementById('code-prompt');
        const languageSelect = document.getElementById('code-language');
        const generateBtn = document.getElementById('generate-code-btn');
        
        if (!promptInput || !languageSelect || !generateBtn) return;
        
        const prompt = promptInput.value.trim();
        const language = languageSelect.value;
        
        if (!prompt) {
            this.showError('Please describe what you want to build.');
            return;
        }

        try {
            this.core.getModule('ui').setButtonLoading(generateBtn, true);
            this.updateCodeEditor(`// Generating ${language} code for: ${prompt}...`);
            
            const response = await this.generateResponse({
                prompt: `Generate a complete, runnable code snippet in ${language} for the following prompt: "${prompt}". Provide only the code, without any explanation or markdown formatting.`,
                type: 'code',
                language: language
            });
            
            this.updateCodeEditor(response, language);
            this.core.updateAnalytics('codeGenerations', 1);
            
        } catch (error) {
            this.handleError('Code generation failed', error);
            this.updateCodeEditor(`// Error generating code: ${error.message}`);
        } finally {
            this.core.getModule('ui').setButtonLoading(generateBtn, false);
        }
    }

    async handleCodeAnalysis() {
        const editor = window.monaco?.editor?.getModels()?.[0];
        if (!editor) {
            this.showError('No code to analyze. Please generate code first.');
            return;
        }

        const code = editor.getValue();
        if (!code || code.trim().startsWith('//')) {
            this.showError('Please generate or enter code to analyze.');
            return;
        }

        try {
            const uiManager = this.core.getModule('ui');
            uiManager.showModal('Analyzing Code...', '<div class="flex justify-center p-8"><div class="spinner"></div></div>');
            
            const response = await this.generateResponse({
                prompt: `Analyze this code for improvements, potential bugs, and adherence to best practices. Provide a concise summary of your findings.\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
                type: 'analysis'
            });
            
            uiManager.showModal('Code Analysis', this.formatAnalysisResponse(response));
            this.core.updateAnalytics('codeAnalyses', 1);
            
        } catch (error) {
            this.handleError('Code analysis failed', error);
        }
    }

    async handleTrajectoryAnalysis() {
        try {
            const uiManager = this.core.getModule('ui');
            uiManager.showModal('Analyzing Career Trajectory', '<div class="flex justify-center p-8"><div class="spinner"></div></div>');
            
            const response = await this.generateResponse({
                prompt: 'Analyze my career trajectory based on the timeline provided on the page. Identify the core narrative thread, project a likely future trajectory for the next 5-10 years, and suggest one "game-changing" strategic move I could make.',
                type: 'analysis'
            });
            
            uiManager.showModal('Career Trajectory Analysis', this.formatAnalysisResponse(response));
            this.core.updateAnalytics('trajectoryAnalyses', 1);
            
        } catch (error) {
            this.handleError('Trajectory analysis failed', error);
        }
    }

    // Core AI functionality
    async generateResponse(request) {
        const startTime = Date.now();
        
        try {
            // Rate limiting check
            if (!this.checkRateLimit(request.type)) {
                throw new Error('Rate limit exceeded. Please wait before making another request.');
            }
            
            // Queue the request
            return await this.queueRequest(request);
            
        } finally {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            // Update analytics
            this.core.updateAnalytics('apiCalls', 1);
            this.core.state.analytics.responseTimes.push(responseTime);
            this.core.state.analytics.lastModel = this.currentModel;
        }
    }

    async queueRequest(request) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ request, resolve, reject });
            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }

    async processQueue() {
        if (this.requestQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const { request, resolve, reject } = this.requestQueue.shift();

        try {
            const response = await this.makeRequest(request);
            resolve(response);
        } catch (error) {
            reject(error);
        }

        // Process next request after a brief delay
        setTimeout(() => {
            this.processQueue();
        }, 100);
    }

    async makeRequest(request) {
        const model = this.models[this.currentModel];
        if (!model) {
            throw new Error(`Model ${this.currentModel} not available`);
        }

        const payload = this.buildPayload(request, model);
        const securityManager = this.core.getModule('security');
        
        try {
            const securePayload = securityManager ? 
                await securityManager.secureAIRequest(payload) : payload;
            
            const response = await fetch(model.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': this.generateRequestId(),
                    ...securePayload.headers
                },
                body: JSON.stringify(securePayload.body || payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            return this.extractResponse(result, model);
            
        } catch (error) {
            console.error('AI request failed:', error);
            throw error;
        }
    }

    buildPayload(request, model) {
        const payload = {
            model: this.currentModel,
            messages: [],
            max_tokens: model.maxTokens,
            temperature: model.temperature
        };

        // Add conversation history for chat requests
        if (request.type === 'chat') {
            payload.messages = [...this.conversationHistory];
        }

        // Build user message
        const userMessage = {
            role: 'user',
            content: []
        };

        // Add text content
        if (request.prompt) {
            userMessage.content.push({
                type: 'text',
                text: request.prompt
            });
        }

        // Add image content
        if (request.image) {
            userMessage.content.push({
                type: 'image',
                image: request.image
            });
        }

        payload.messages.push(userMessage);

        // Add structured output for specific request types
        if (request.schema) {
            payload.response_format = {
                type: 'json_object',
                schema: request.schema
            };
        }

        return payload;
    }

    extractResponse(result, model) {
        // Handle different response formats based on model
        if (model.provider === 'google') {
            return result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
        } else if (model.provider === 'anthropic') {
            return result.content?.[0]?.text || 'No response';
        }
        
        return result.response || result.text || 'No response';
    }

    // Rate limiting
    checkRateLimit(requestType) {
        const now = Date.now();
        const limits = {
            chat: { max: 10, window: 60000 }, // 10 requests per minute
            code: { max: 5, window: 60000 },  // 5 requests per minute
            analysis: { max: 3, window: 60000 }, // 3 requests per minute
            project: { max: 3, window: 60000 }   // 3 requests per minute
        };

        const limit = limits[requestType] || limits.chat;
        const key = `${requestType}_${Math.floor(now / limit.window)}`;
        
        const currentCount = this.rateLimiter.get(key) || 0;
        if (currentCount >= limit.max) {
            return false;
        }

        this.rateLimiter.set(key, currentCount + 1);
        return true;
    }

    // UI helpers
    appendMessage(role, content, model = null) {
        const chatDisplay = document.getElementById('chatDisplay');
        if (!chatDisplay) return;

        const roleDisplay = role === 'user' ? 'You' : 'Blaze AI';
        const modelBadge = model ? `<span class="text-xs ml-2 opacity-60 mono-font bg-slate-700 px-2 py-1 rounded-md">${model}</span>` : '';
        const msgClass = role === 'user' ? 'user-msg' : 'assistant-msg';
        
        const sanitizedContent = this.sanitizeHTML(content);
        const formattedContent = this.formatMessageContent(sanitizedContent, role);

        const messageElement = document.createElement('div');
        messageElement.className = `message ${msgClass}`;
        messageElement.innerHTML = `
            <div class="flex items-center mb-1">
                <b style="color: var(--accent-orange);">${roleDisplay}</b>
                ${role === 'assistant' ? modelBadge : ''}
            </div>
            <div class="text-slate-300">${formattedContent}</div>
        `;

        chatDisplay.appendChild(messageElement);
        
        // Animate in
        setTimeout(() => {
            messageElement.classList.add('visible');
        }, 10);
        
        // Scroll to bottom
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        
        // Update conversation history
        if (role === 'user') {
            this.conversationHistory.push({ role: 'user', content: content });
        } else {
            this.conversationHistory.push({ role: 'assistant', content: content });
        }
    }

    formatMessageContent(content, role) {
        if (role === 'assistant') {
            // Format markdown-like content
            return content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-slate-700 px-1 py-0.5 rounded text-sm">$1</code>')
                .replace(/\n/g, '<br>');
        }
        
        return content.replace(/\n/g, '<br>');
    }

    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    updateCodeEditor(code, language = 'javascript') {
        if (window.monaco?.editor) {
            const editor = window.monaco.editor.getModels()?.[0];
            if (editor) {
                window.monaco.editor.setModelLanguage(editor, language);
                editor.setValue(code);
            }
        }
    }

    clearImagePreview() {
        const imgPreview = document.getElementById('img-preview');
        if (imgPreview) {
            imgPreview.style.display = 'none';
            imgPreview.src = '';
        }
    }

    renderProject(projectData, container) {
        const projectCard = this.createProjectCard(projectData);
        container.insertAdjacentHTML('afterbegin', projectCard);
        
        // Animate in
        const newCard = container.firstElementChild;
        setTimeout(() => {
            newCard.classList.add('visible');
        }, 50);
        
        // Reinitialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    createProjectCard(data) {
        return `
            <div class="project-card glass p-8 rounded-2xl reveal opacity-0 transform translate-y-4">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-2xl font-bold text-white mb-2">${data.title}</h3>
                        <span class="text-sm font-semibold tracking-wider uppercase text-orange-400">
                            ${data.category}
                        </span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-slate-400">
                        <i data-lucide="sparkles" class="w-4 h-4"></i>
                        <span>AI Generated</span>
                    </div>
                </div>
                
                <p class="text-slate-400 mb-6">${data.excerpt}</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-white mb-3 flex items-center gap-2">
                            <i data-lucide="check-circle" class="w-4 h-4 text-orange-400"></i>
                            Key Features
                        </h4>
                        <ul class="text-slate-400 space-y-1">
                            ${data.key_features.map(feature => `<li class="flex items-start gap-2">
                                <i data-lucide="arrow-right" class="w-3 h-3 mt-1 text-orange-400"></i>
                                <span>${feature}</span>
                            </li>`).join('')}
                        </ul>
                    </div>
                    
                    <div>
                        <h4 class="font-semibold text-white mb-3 flex items-center gap-2">
                            <i data-lucide="code" class="w-4 h-4 text-orange-400"></i>
                            Tech Stack
                        </h4>
                        <ul class="text-slate-400 space-y-1">
                            ${data.tech_stack.map(tech => `<li class="flex items-start gap-2">
                                <i data-lucide="arrow-right" class="w-3 h-3 mt-1 text-orange-400"></i>
                                <span>${tech}</span>
                            </li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    formatAnalysisResponse(response) {
        return response
            .replace(/### (.*)/g, '<h3 class="text-xl font-bold mt-6 mb-3 text-gradient">$1</h3>')
            .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-6 mb-4 text-gradient">$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-400">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-slate-700 px-2 py-1 rounded text-sm">$1</code>')
            .replace(/\n/g, '<br>');
    }

    // Schemas
    getProjectSchema() {
        return {
            type: 'object',
            properties: {
                title: { type: 'string' },
                category: { type: 'string' },
                excerpt: { type: 'string' },
                key_features: { 
                    type: 'array', 
                    items: { type: 'string' } 
                },
                tech_stack: { 
                    type: 'array', 
                    items: { type: 'string' } 
                }
            },
            required: ['title', 'category', 'excerpt', 'key_features', 'tech_stack']
        };
    }

    // Error handling
    handleError(message, error) {
        console.error(message, error);
        
        const errorMessage = error?.message || 'An unexpected error occurred';
        const userMessage = `${message}: ${errorMessage}`;
        
        const uiManager = this.core.getModule('ui');
        if (uiManager) {
            uiManager.showNotification(userMessage, 'error');
        }
        
        // Log to analytics
        this.core.updateAnalytics('aiErrors', 1);
    }

    showError(message) {
        const uiManager = this.core.getModule('ui');
        if (uiManager) {
            uiManager.showNotification(message, 'error');
        }
    }

    // Utility methods
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Model management
    switchModel(modelId) {
        if (this.models[modelId] && this.models[modelId].available !== false) {
            this.currentModel = modelId;
            this.core.updateAnalytics('modelSwitch', 1);
            return true;
        }
        return false;
    }

    getAvailableModels() {
        return Object.entries(this.models)
            .filter(([, model]) => model.available !== false)
            .map(([id, model]) => ({ id, ...model }));
    }

    // Conversation management
    clearConversation() {
        this.conversationHistory = [];
        const chatDisplay = document.getElementById('chatDisplay');
        if (chatDisplay) {
            chatDisplay.innerHTML = '';
        }
    }

    exportConversation() {
        const conversation = {
            timestamp: new Date().toISOString(),
            model: this.currentModel,
            messages: this.conversationHistory
        };
        
        const blob = new Blob([JSON.stringify(conversation, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blaze-conversation-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}