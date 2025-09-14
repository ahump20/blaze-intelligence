/**
 * Blaze Intelligence Real-Time Decision Engine
 * Fast rule-based decision making with optional LLM explanations
 * Implements the reference architecture's decision layer
 */

class RTIDecisionEngine {
    constructor(config = {}) {
        this.config = {
            maxDecisionLatencyMs: config.maxDecisionLatencyMs || 5,
            rateLimitMs: config.rateLimitMs || 1000,
            ttlMs: config.ttlMs || 3000,
            maxConcurrentLLM: config.maxConcurrentLLM || 2,
            enableLLMExplanations: config.enableLLMExplanations || true,
            ...config
        };

        // Rule engine
        this.rules = new Map();
        this.ruleGroups = new Map();

        // Decision state
        this.lastDecisions = new Map();
        this.rateLimitTimers = new Map();

        // LLM integration
        this.llmQueue = [];
        this.activeLLMRequests = 0;

        // Metrics
        this.metrics = {
            decisionsCount: 0,
            ruleExecutionTime: 0,
            llmExplanations: 0,
            rateLimitedDecisions: 0,
            errorCount: 0
        };

        // Event handlers
        this.eventHandlers = new Map();

        // Initialize default rules
        this.loadDefaultRules();
    }

    // Load default sports rules
    loadDefaultRules() {
        const sportsRules = [
            {
                name: 'zone_switch_response',
                triggers: ['zone_switch'],
                conditions: {
                    minConfidence: 0.75,
                    context: {
                        gameState: ['active', 'timeout'],
                        quarter: [1, 2, 3, 4]
                    }
                },
                actions: {
                    advice: 'Exploit left wing with quick screen play',
                    urgency: 'medium',
                    ttl: 3000,
                    audioCue: 'zone_alert'
                },
                cooldown: 5000
            },
            {
                name: 'fast_break_opportunity',
                triggers: ['fast_break'],
                conditions: {
                    minConfidence: 0.70,
                    context: {
                        possession: 'own_team'
                    }
                },
                actions: {
                    advice: 'Push tempo - numbers advantage detected',
                    urgency: 'high',
                    ttl: 2000,
                    audioCue: 'fast_break'
                },
                cooldown: 3000
            },
            {
                name: 'defensive_adjustment',
                triggers: ['formation_change'],
                conditions: {
                    minConfidence: 0.65,
                    context: {
                        gameState: 'active'
                    }
                },
                actions: {
                    advice: 'Adjust defensive positioning',
                    urgency: 'low',
                    ttl: 4000
                },
                cooldown: 8000
            },
            {
                name: 'timeout_strategy',
                triggers: ['timeout_called'],
                conditions: {
                    minConfidence: 0.80
                },
                actions: {
                    advice: 'Review strategy - momentum shift opportunity',
                    urgency: 'high',
                    ttl: 15000,
                    requiresLLM: true
                },
                cooldown: 30000
            },
            {
                name: 'score_celebration',
                triggers: ['score_event'],
                conditions: {
                    minConfidence: 0.75
                },
                actions: {
                    advice: 'Maintain intensity - capitalize on momentum',
                    urgency: 'medium',
                    ttl: 5000,
                    audioCue: 'positive'
                },
                cooldown: 10000
            }
        ];

        sportsRules.forEach(rule => this.addRule(rule));
    }

    // Add rule to engine
    addRule(rule) {
        // Validate rule structure
        if (!this.validateRule(rule)) {
            throw new Error(`Invalid rule structure: ${rule.name}`);
        }

        // Store rule
        this.rules.set(rule.name, {
            ...rule,
            executionCount: 0,
            lastExecuted: 0,
            averageLatency: 0
        });

        // Group by triggers
        rule.triggers.forEach(trigger => {
            if (!this.ruleGroups.has(trigger)) {
                this.ruleGroups.set(trigger, []);
            }
            this.ruleGroups.get(trigger).push(rule.name);
        });

        console.log(`Rule added: ${rule.name}`);
    }

    // Validate rule structure
    validateRule(rule) {
        if (!rule.name || !rule.triggers || !rule.actions) {
            return false;
        }

        if (!Array.isArray(rule.triggers) || rule.triggers.length === 0) {
            return false;
        }

        return true;
    }

    // Process pattern event and make decisions
    async processPatternEvent(patternEvent) {
        const startTime = performance.now();

        try {
            // Find applicable rules
            const applicableRules = this.findApplicableRules(patternEvent);

            if (applicableRules.length === 0) {
                return null;
            }

            // Execute rules in priority order
            const decisions = [];

            for (const ruleName of applicableRules) {
                const rule = this.rules.get(ruleName);
                if (!rule) continue;

                // Check rate limiting
                if (this.isRateLimited(ruleName)) {
                    this.metrics.rateLimitedDecisions++;
                    continue;
                }

                // Execute rule
                const decision = await this.executeRule(rule, patternEvent);

                if (decision) {
                    decisions.push(decision);

                    // Update rate limiting
                    this.updateRateLimit(ruleName);

                    // Queue LLM explanation if needed
                    if (rule.actions.requiresLLM && this.config.enableLLMExplanations) {
                        this.queueLLMExplanation(decision, patternEvent);
                    }
                }
            }

            // Merge decisions if multiple
            const finalDecision = this.mergeDecisions(decisions);

            if (finalDecision) {
                // Update metrics
                const executionTime = performance.now() - startTime;
                this.metrics.ruleExecutionTime =
                    this.metrics.ruleExecutionTime * 0.9 + executionTime * 0.1;
                this.metrics.decisionsCount++;

                // Emit decision event
                this.emit('decision', finalDecision);

                return finalDecision;
            }

        } catch (error) {
            console.error('Decision engine error:', error);
            this.metrics.errorCount++;
            this.emit('error', error);
        }

        return null;
    }

    // Find applicable rules for pattern
    findApplicableRules(patternEvent) {
        const applicableRules = [];
        const patternName = patternEvent.name || patternEvent.type;

        // Get rules that match this pattern
        const ruleNames = this.ruleGroups.get(patternName) || [];

        for (const ruleName of ruleNames) {
            const rule = this.rules.get(ruleName);
            if (!rule) continue;

            // Check conditions
            if (this.evaluateConditions(rule, patternEvent)) {
                applicableRules.push(ruleName);
            }
        }

        // Sort by priority (urgency, confidence, etc.)
        return applicableRules.sort((a, b) => {
            const ruleA = this.rules.get(a);
            const ruleB = this.rules.get(b);

            // Sort by urgency first
            const urgencyOrder = { high: 3, medium: 2, low: 1 };
            const urgencyA = urgencyOrder[ruleA.actions.urgency] || 1;
            const urgencyB = urgencyOrder[ruleB.actions.urgency] || 1;

            if (urgencyA !== urgencyB) {
                return urgencyB - urgencyA; // Higher urgency first
            }

            // Then by confidence requirement
            const confA = ruleA.conditions?.minConfidence || 0;
            const confB = ruleB.conditions?.minConfidence || 0;

            return confB - confA; // Higher confidence requirement first
        });
    }

    // Evaluate rule conditions
    evaluateConditions(rule, patternEvent) {
        const conditions = rule.conditions || {};

        // Check minimum confidence
        if (conditions.minConfidence) {
            const confidence = patternEvent.confidence || 0;
            if (confidence < conditions.minConfidence) {
                return false;
            }
        }

        // Check context conditions
        if (conditions.context) {
            for (const [key, allowedValues] of Object.entries(conditions.context)) {
                const contextValue = this.getContextValue(key, patternEvent);
                if (Array.isArray(allowedValues)) {
                    if (!allowedValues.includes(contextValue)) {
                        return false;
                    }
                } else if (contextValue !== allowedValues) {
                    return false;
                }
            }
        }

        // Check cooldown
        if (rule.cooldown) {
            const lastExecution = rule.lastExecuted || 0;
            const now = performance.now();
            if (now - lastExecution < rule.cooldown) {
                return false;
            }
        }

        return true;
    }

    // Get context value for evaluation
    getContextValue(key, patternEvent) {
        // Mock game context - in production, this would come from game state
        const context = {
            gameState: 'active',
            quarter: 2,
            possession: 'own_team',
            timeRemaining: 450, // seconds
            score: { home: 14, away: 10 }
        };

        return context[key];
    }

    // Execute rule and create decision
    async executeRule(rule, patternEvent) {
        const startTime = performance.now();

        try {
            const decision = {
                type: 'DecisionEvent',
                name: rule.name,
                advice: rule.actions.advice,
                urgency: rule.actions.urgency || 'medium',
                ttl: rule.actions.ttl || this.config.ttlMs,
                timestamp: performance.now(),
                confidence: patternEvent.confidence,
                trigger: patternEvent.name,
                evidence: patternEvent.evidence,
                audioCue: rule.actions.audioCue,
                metadata: {
                    ruleName: rule.name,
                    patternId: patternEvent.id,
                    executionTime: 0 // Will be updated
                }
            };

            // Update rule metrics
            const executionTime = performance.now() - startTime;
            rule.executionCount++;
            rule.lastExecuted = performance.now();
            rule.averageLatency = rule.averageLatency * 0.9 + executionTime * 0.1;

            decision.metadata.executionTime = executionTime;

            return decision;

        } catch (error) {
            console.error(`Rule execution error (${rule.name}):`, error);
            return null;
        }
    }

    // Merge multiple decisions
    mergeDecisions(decisions) {
        if (decisions.length === 0) return null;
        if (decisions.length === 1) return decisions[0];

        // For multiple decisions, prioritize by urgency and combine advice
        const sortedDecisions = decisions.sort((a, b) => {
            const urgencyOrder = { high: 3, medium: 2, low: 1 };
            const urgencyA = urgencyOrder[a.urgency] || 1;
            const urgencyB = urgencyOrder[b.urgency] || 1;
            return urgencyB - urgencyA;
        });

        const primary = sortedDecisions[0];
        const secondary = sortedDecisions.slice(1);

        // Combine advice
        let combinedAdvice = primary.advice;
        if (secondary.length > 0) {
            const additionalAdvice = secondary
                .map(d => d.advice)
                .join('; ');
            combinedAdvice += `. Additional: ${additionalAdvice}`;
        }

        return {
            ...primary,
            advice: combinedAdvice,
            metadata: {
                ...primary.metadata,
                mergedDecisions: decisions.length,
                secondaryTriggers: secondary.map(d => d.trigger)
            }
        };
    }

    // Check if rule is rate limited
    isRateLimited(ruleName) {
        const rule = this.rules.get(ruleName);
        if (!rule || !rule.cooldown) return false;

        const lastExecution = rule.lastExecuted || 0;
        const now = performance.now();

        return (now - lastExecution) < rule.cooldown;
    }

    // Update rate limiting
    updateRateLimit(ruleName) {
        const rule = this.rules.get(ruleName);
        if (rule) {
            rule.lastExecuted = performance.now();
        }
    }

    // Queue LLM explanation (async, off hot path)
    queueLLMExplanation(decision, patternEvent) {
        if (this.activeLLMRequests >= this.config.maxConcurrentLLM) {
            return; // Skip if too many active requests
        }

        const task = {
            decision: { ...decision },
            pattern: { ...patternEvent },
            timestamp: performance.now()
        };

        this.llmQueue.push(task);
        this.processLLMQueue();
    }

    // Process LLM explanation queue
    async processLLMQueue() {
        if (this.llmQueue.length === 0 ||
            this.activeLLMRequests >= this.config.maxConcurrentLLM) {
            return;
        }

        const task = this.llmQueue.shift();
        this.activeLLMRequests++;

        try {
            const explanation = await this.generateLLMExplanation(task);
            if (explanation) {
                this.emit('llmExplanation', {
                    decision: task.decision,
                    explanation: explanation,
                    latency: performance.now() - task.timestamp
                });
                this.metrics.llmExplanations++;
            }
        } catch (error) {
            console.error('LLM explanation error:', error);
        } finally {
            this.activeLLMRequests--;
            // Process next item
            setTimeout(() => this.processLLMQueue(), 100);
        }
    }

    // Generate LLM explanation (mock implementation)
    async generateLLMExplanation(task) {
        // Mock LLM explanation - in production, integrate with OpenAI/Claude/Gemini
        return new Promise((resolve) => {
            setTimeout(() => {
                const explanations = [
                    "This decision was triggered by detected formation changes indicating a zone defense switch. Quick ball movement to the weak side is recommended.",
                    "Pattern recognition identified a fast break opportunity with numerical advantage. Immediate tempo increase maximizes scoring probability.",
                    "Timeout situation creates strategic reset opportunity. Consider adjusting defensive scheme based on opponent tendencies.",
                    "Scoring event momentum should be maintained through aggressive defensive pressure and continued offensive tempo."
                ];

                const explanation = explanations[Math.floor(Math.random() * explanations.length)];
                resolve({
                    text: explanation,
                    confidence: 0.85,
                    reasoning: "Based on game context and pattern analysis",
                    timestamp: performance.now()
                });
            }, 200 + Math.random() * 300); // 200-500ms latency
        });
    }

    // Load rules from configuration
    loadRulesFromConfig(rulesConfig) {
        if (Array.isArray(rulesConfig)) {
            rulesConfig.forEach(rule => {
                try {
                    this.addRule(rule);
                } catch (error) {
                    console.error(`Failed to load rule ${rule.name}:`, error);
                }
            });
        } else if (typeof rulesConfig === 'object') {
            // Load from object format
            Object.values(rulesConfig).forEach(rule => {
                try {
                    this.addRule(rule);
                } catch (error) {
                    console.error(`Failed to load rule:`, error);
                }
            });
        }
    }

    // Remove rule
    removeRule(ruleName) {
        const rule = this.rules.get(ruleName);
        if (!rule) return false;

        // Remove from rule groups
        rule.triggers.forEach(trigger => {
            const group = this.ruleGroups.get(trigger);
            if (group) {
                const index = group.indexOf(ruleName);
                if (index > -1) {
                    group.splice(index, 1);
                }
            }
        });

        // Remove rule
        this.rules.delete(ruleName);
        console.log(`Rule removed: ${ruleName}`);
        return true;
    }

    // Update rule
    updateRule(ruleName, updates) {
        const rule = this.rules.get(ruleName);
        if (!rule) return false;

        // Remove old rule
        this.removeRule(ruleName);

        // Add updated rule
        const updatedRule = { ...rule, ...updates };
        this.addRule(updatedRule);

        return true;
    }

    // Get rule metrics
    getRuleMetrics() {
        const ruleStats = {};

        for (const [name, rule] of this.rules) {
            ruleStats[name] = {
                executionCount: rule.executionCount,
                lastExecuted: rule.lastExecuted,
                averageLatency: rule.averageLatency,
                isRateLimited: this.isRateLimited(name)
            };
        }

        return ruleStats;
    }

    // Get engine metrics
    getMetrics() {
        return {
            ...this.metrics,
            totalRules: this.rules.size,
            queuedLLMTasks: this.llmQueue.length,
            activeLLMRequests: this.activeLLMRequests,
            ruleGroups: this.ruleGroups.size
        };
    }

    // Event emitter pattern
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event).add(handler);
    }

    off(event, handler) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    emit(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    // Cleanup
    destroy() {
        // Clear queues
        this.llmQueue = [];

        // Clear rules and groups
        this.rules.clear();
        this.ruleGroups.clear();

        // Clear rate limits
        this.rateLimitTimers.clear();

        // Clear event handlers
        this.eventHandlers.clear();

        console.log('Decision engine destroyed');
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RTIDecisionEngine;
} else {
    window.RTIDecisionEngine = RTIDecisionEngine;
}