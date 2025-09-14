/**
 * BLAZE MULTIMODAL EDGE PROCESSOR
 * Cloudflare Workers + Containers for Real-Time Video/Audio Analysis
 *
 * Architecture:
 * - Worker: API gateway and orchestrator (lightweight, <10ms)
 * - Containers: Heavy AI processing (YOLO, speech recognition, etc.)
 * - Durable Objects: Session state management
 * - Queues: Buffering and scaling
 * - WebSockets: Real-time feedback delivery
 */

// Main Worker Entry Point
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle different endpoints
        switch (url.pathname) {
            case '/api/multimodal/stream':
                return handleStreamRequest(request, env, ctx);

            case '/api/multimodal/process':
                return handleProcessRequest(request, env, ctx);

            case '/api/multimodal/websocket':
                return handleWebSocketUpgrade(request, env, ctx);

            case '/api/multimodal/status':
                return handleStatusRequest(env);

            default:
                return new Response('Multimodal Edge Processor Ready', { status: 200 });
        }
    }
};

/**
 * STREAM HANDLER
 * Manages continuous video/audio stream processing
 */
async function handleStreamRequest(request, env, ctx) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { videoUrl, audioUrl, sessionId } = await request.json();

        // Create or get Durable Object for this session
        const durableId = env.MULTIMODAL_SESSIONS.idFromName(sessionId);
        const durableObj = env.MULTIMODAL_SESSIONS.get(durableId);

        // Initialize session
        const sessionResponse = await durableObj.fetch(request.url, {
            method: 'POST',
            body: JSON.stringify({
                action: 'initSession',
                videoUrl,
                audioUrl,
                timestamp: Date.now()
            })
        });

        // Queue initial processing job
        await env.PROCESSING_QUEUE.send({
            sessionId,
            type: 'stream_init',
            videoUrl,
            audioUrl,
            timestamp: Date.now()
        });

        return new Response(JSON.stringify({
            success: true,
            sessionId,
            message: 'Stream processing initiated',
            websocketUrl: `wss://${request.headers.get('host')}/api/multimodal/websocket?session=${sessionId}`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Stream initialization error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to initialize stream',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * PROCESS HANDLER
 * Handles single frame/chunk processing requests
 */
async function handleProcessRequest(request, env, ctx) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const startTime = Date.now();

    try {
        // Parse multipart form data (video frame + audio chunk)
        const formData = await request.formData();
        const videoFrame = formData.get('video');
        const audioChunk = formData.get('audio');
        const sessionId = formData.get('sessionId') || generateSessionId();

        // Parallel processing in containers
        const [visualResult, audioResult] = await Promise.all([
            processInContainer(env, 'visual', videoFrame),
            processInContainer(env, 'audio', audioChunk)
        ]);

        // Fusion and decision making
        const fusionResult = await fuseMultimodal(visualResult, audioResult, env);
        const decision = await makeDecision(fusionResult, env);

        // Calculate latency
        const totalLatency = Date.now() - startTime;

        // Store results in Durable Object
        if (sessionId) {
            await updateSession(env, sessionId, {
                visualResult,
                audioResult,
                fusionResult,
                decision,
                latency: totalLatency
            });
        }

        // Return championship-level response
        const response = {
            success: true,
            sessionId,
            decision: decision.action,
            confidence: decision.confidence,
            championMetrics: decision.championMetrics,
            latency: totalLatency,
            meetingTarget: totalLatency < 100, // Sub-100ms target
            timestamp: Date.now()
        };

        // Queue async tasks (logging, learning, etc.)
        ctx.waitUntil(
            logAnalytics(env, response)
        );

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'X-Processing-Time': totalLatency.toString()
            }
        });

    } catch (error) {
        console.error('Processing error:', error);
        return new Response(JSON.stringify({
            error: 'Processing failed',
            message: error.message,
            latency: Date.now() - startTime
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * CONTAINER PROCESSING
 * Offloads heavy AI processing to Cloudflare Containers
 */
async function processInContainer(env, type, data) {
    // Container endpoints for different processing types
    const containerEndpoints = {
        visual: env.VISUAL_CONTAINER_URL || 'http://visual-processor:8080',
        audio: env.AUDIO_CONTAINER_URL || 'http://audio-processor:8080',
        fusion: env.FUSION_CONTAINER_URL || 'http://fusion-processor:8080'
    };

    const endpoint = containerEndpoints[type];
    if (!endpoint) {
        throw new Error(`Unknown processing type: ${type}`);
    }

    try {
        // Send to container for processing
        const response = await fetch(endpoint, {
            method: 'POST',
            body: data,
            headers: {
                'Content-Type': type === 'visual' ? 'image/jpeg' : 'audio/wav',
                'X-Session-ID': generateSessionId(),
                'X-Timestamp': Date.now().toString()
            }
        });

        if (!response.ok) {
            throw new Error(`Container processing failed: ${response.status}`);
        }

        const result = await response.json();

        // Validate container response
        if (!result.features || !result.confidence) {
            throw new Error('Invalid container response format');
        }

        return {
            type,
            features: result.features,
            detections: result.detections || [],
            confidence: result.confidence,
            processingTime: result.processingTime || 0,
            timestamp: Date.now()
        };

    } catch (error) {
        console.error(`Container processing error (${type}):`, error);

        // Fallback to edge processing if container fails
        return fallbackProcessing(type, data);
    }
}

/**
 * MULTIMODAL FUSION
 * Combines visual and audio insights
 */
async function fuseMultimodal(visual, audio, env) {
    const fusionStart = Date.now();

    // Check temporal alignment
    const timeDiff = Math.abs(visual.timestamp - audio.timestamp);
    const syncQuality = timeDiff < 20 ? 'excellent' :
                       timeDiff < 50 ? 'good' : 'poor';

    // Cross-modal attention (simplified for edge)
    const correlations = {
        visualToAudio: calculateCorrelation(visual.features, audio.features),
        audioToVisual: calculateCorrelation(audio.features, visual.features)
    };

    // Pattern detection
    const patterns = await detectPatterns(visual, audio, env);

    // Championship signal detection
    const championshipSignals = detectChampionshipSignals(visual, audio, patterns);

    return {
        timestamp: Math.min(visual.timestamp, audio.timestamp),
        syncQuality,
        correlations,
        patterns,
        championshipSignals,
        combinedConfidence: (visual.confidence + audio.confidence) / 2,
        fusionLatency: Date.now() - fusionStart
    };
}

/**
 * DECISION ENGINE
 * Makes real-time decisions based on fused data
 */
async function makeDecision(fusionResult, env) {
    const decisionStart = Date.now();

    // Rule-based rapid decisions
    const rapidDecision = applyRules(fusionResult);
    if (rapidDecision && rapidDecision.confidence > 0.9) {
        return {
            ...rapidDecision,
            decisionTime: Date.now() - decisionStart,
            type: 'rapid'
        };
    }

    // AI-enhanced decision (could call to Gemini/Claude API here)
    const aiDecision = await generateAIDecision(fusionResult, env);

    // Champion metrics calculation
    const championMetrics = calculateChampionMetrics(fusionResult);

    // Synthesize final decision
    const confidence = Math.min(
        1.0,
        aiDecision.confidence + (championMetrics.overall / 100) * 0.2
    );

    return {
        action: aiDecision.action,
        confidence,
        reasoning: aiDecision.reasoning,
        championMetrics,
        decisionTime: Date.now() - decisionStart,
        type: 'ai_enhanced'
    };
}

/**
 * PATTERN DETECTION
 */
async function detectPatterns(visual, audio, env) {
    const patterns = [];

    // Visual patterns
    if (visual.detections) {
        if (visual.detections.some(d => d.type === 'formation')) {
            patterns.push({
                type: 'tactical_formation',
                subtype: visual.detections.find(d => d.type === 'formation').value,
                confidence: 0.87,
                source: 'visual'
            });
        }
    }

    // Audio patterns
    if (audio.features) {
        if (audio.features.speechKeywords?.includes('blitz')) {
            patterns.push({
                type: 'play_call',
                subtype: 'blitz',
                confidence: 0.92,
                source: 'audio'
            });
        }
    }

    // Multimodal patterns (require both modalities)
    if (visual.detections?.some(d => d.type === 'player_movement') &&
        audio.features?.intensity > 0.8) {
        patterns.push({
            type: 'high_intensity_play',
            confidence: 0.85,
            source: 'multimodal'
        });
    }

    return patterns;
}

/**
 * CHAMPIONSHIP SIGNAL DETECTION
 */
function detectChampionshipSignals(visual, audio, patterns) {
    const signals = [];

    // Clutch moment detection
    if (patterns.some(p => p.type === 'high_intensity_play')) {
        signals.push('clutch_moment');
    }

    // Mental fortitude indicators
    if (visual.features?.microExpressions?.confidence > 0.8) {
        signals.push('high_confidence');
    }

    // Leadership detection
    if (audio.features?.voiceAnalysis?.authority > 0.7) {
        signals.push('leadership_displayed');
    }

    // Determination markers
    if (visual.features?.bodyLanguage?.determination > 0.75) {
        signals.push('unwavering_determination');
    }

    return signals;
}

/**
 * CHAMPION METRICS CALCULATION
 */
function calculateChampionMetrics(fusionResult) {
    const metrics = {
        clutch: 0,
        killerInstinct: 0,
        mentalFortress: 0,
        physicalDominance: 0,
        adaptability: 0,
        leadership: 0,
        determination: 0,
        confidence: 0
    };

    // Update based on detected signals
    if (fusionResult.championshipSignals.includes('clutch_moment')) {
        metrics.clutch = 85;
    }

    if (fusionResult.championshipSignals.includes('high_confidence')) {
        metrics.confidence = 90;
        metrics.mentalFortress = 88;
    }

    if (fusionResult.championshipSignals.includes('leadership_displayed')) {
        metrics.leadership = 92;
    }

    if (fusionResult.championshipSignals.includes('unwavering_determination')) {
        metrics.determination = 95;
        metrics.killerInstinct = 87;
    }

    // Calculate overall score
    metrics.overall = Object.values(metrics).reduce((a, b) => a + b, 0) / 8;

    return metrics;
}

/**
 * WEBSOCKET HANDLER
 * Manages real-time bidirectional communication
 */
async function handleWebSocketUpgrade(request, env, ctx) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session');

    if (!sessionId) {
        return new Response('Session ID required', { status: 400 });
    }

    // Get Durable Object for WebSocket management
    const durableId = env.MULTIMODAL_SESSIONS.idFromName(sessionId);
    const durableObj = env.MULTIMODAL_SESSIONS.get(durableId);

    // Forward to Durable Object for WebSocket handling
    return durableObj.fetch(request);
}

/**
 * DURABLE OBJECT CLASS
 * Manages session state and WebSocket connections
 */
export class MultimodalSession {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.sessions = new Map();
        this.websockets = new Set();
    }

    async fetch(request) {
        const url = new URL(request.url);

        // Handle WebSocket upgrade
        if (request.headers.get('Upgrade') === 'websocket') {
            const pair = new WebSocketPair();
            const [client, server] = Object.values(pair);

            await this.handleWebSocket(server);

            return new Response(null, {
                status: 101,
                webSocket: client
            });
        }

        // Handle regular HTTP requests
        const body = await request.json();

        switch (body.action) {
            case 'initSession':
                return this.initSession(body);

            case 'updateSession':
                return this.updateSession(body);

            case 'getStatus':
                return this.getStatus();

            default:
                return new Response('Unknown action', { status: 400 });
        }
    }

    async handleWebSocket(websocket) {
        websocket.accept();
        this.websockets.add(websocket);

        websocket.addEventListener('message', async (event) => {
            try {
                const data = JSON.parse(event.data);
                await this.processWebSocketMessage(data, websocket);
            } catch (error) {
                websocket.send(JSON.stringify({
                    error: 'Invalid message format'
                }));
            }
        });

        websocket.addEventListener('close', () => {
            this.websockets.delete(websocket);
        });
    }

    async processWebSocketMessage(data, websocket) {
        // Handle real-time updates
        if (data.type === 'frame') {
            // Process frame and broadcast results
            const result = await this.processFrame(data);
            this.broadcast(result);
        }
    }

    broadcast(data) {
        const message = JSON.stringify(data);
        this.websockets.forEach(ws => {
            try {
                ws.send(message);
            } catch (error) {
                // Remove dead connections
                this.websockets.delete(ws);
            }
        });
    }

    async initSession(data) {
        const sessionData = {
            id: generateSessionId(),
            startTime: Date.now(),
            videoUrl: data.videoUrl,
            audioUrl: data.audioUrl,
            frameCount: 0,
            decisions: [],
            metrics: {
                avgLatency: 0,
                maxLatency: 0,
                minLatency: Infinity
            }
        };

        await this.state.storage.put(`session_${sessionData.id}`, sessionData);

        return new Response(JSON.stringify({
            success: true,
            sessionId: sessionData.id
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async updateSession(data) {
        const session = await this.state.storage.get(`session_${data.sessionId}`);
        if (!session) {
            return new Response('Session not found', { status: 404 });
        }

        // Update metrics
        session.frameCount++;
        session.decisions.push(data.decision);

        const latency = data.latency || 0;
        session.metrics.avgLatency = (
            (session.metrics.avgLatency * (session.frameCount - 1) + latency) /
            session.frameCount
        );
        session.metrics.maxLatency = Math.max(session.metrics.maxLatency, latency);
        session.metrics.minLatency = Math.min(session.metrics.minLatency, latency);

        await this.state.storage.put(`session_${data.sessionId}`, session);

        // Broadcast update to connected clients
        this.broadcast({
            type: 'session_update',
            sessionId: data.sessionId,
            metrics: session.metrics,
            decision: data.decision
        });

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async getStatus() {
        const sessions = [];
        const list = await this.state.storage.list();

        for (const [key, value] of list) {
            if (key.startsWith('session_')) {
                sessions.push({
                    id: value.id,
                    frameCount: value.frameCount,
                    metrics: value.metrics,
                    duration: Date.now() - value.startTime
                });
            }
        }

        return new Response(JSON.stringify({
            activeSessions: sessions.length,
            sessions,
            websocketConnections: this.websockets.size
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * QUEUE CONSUMER
 * Processes queued video/audio analysis jobs
 */
export async function queue(batch, env) {
    for (const message of batch.messages) {
        try {
            const job = message.body;

            // Process based on job type
            switch (job.type) {
                case 'stream_init':
                    await initializeStream(job, env);
                    break;

                case 'frame_process':
                    await processFrame(job, env);
                    break;

                case 'batch_analysis':
                    await processBatch(job, env);
                    break;

                default:
                    console.warn('Unknown job type:', job.type);
            }

            // Acknowledge message
            message.ack();

        } catch (error) {
            console.error('Queue processing error:', error);
            // Retry or send to DLQ
            message.retry();
        }
    }
}

/**
 * HELPER FUNCTIONS
 */

function generateSessionId() {
    return `multimodal_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function calculateCorrelation(features1, features2) {
    // Simplified correlation calculation
    if (!features1 || !features2) return 0;

    // In production, implement proper correlation algorithm
    return Math.random() * 0.3 + 0.6; // Mock 60-90% correlation
}

function applyRules(fusionResult) {
    // Fast rule-based decisions
    const rules = [
        {
            condition: (data) => data.patterns.some(p => p.type === 'play_call' && p.subtype === 'blitz'),
            action: 'Recommend screen pass to counter blitz',
            confidence: 0.95
        },
        {
            condition: (data) => data.championshipSignals.includes('clutch_moment'),
            action: 'Elevate focus - championship moment detected',
            confidence: 0.92
        },
        {
            condition: (data) => data.syncQuality === 'poor',
            action: 'Resynchronize multimodal streams',
            confidence: 1.0
        }
    ];

    for (const rule of rules) {
        if (rule.condition(fusionResult)) {
            return {
                action: rule.action,
                confidence: rule.confidence
            };
        }
    }

    return null;
}

async function generateAIDecision(fusionResult, env) {
    // In production, call to AI model API (Gemini, Claude, etc.)
    // For now, return mock decision based on patterns

    if (fusionResult.patterns.length === 0) {
        return {
            action: 'Continue monitoring - no patterns detected',
            confidence: 0.6,
            reasoning: 'Insufficient pattern data for high-confidence decision'
        };
    }

    const primaryPattern = fusionResult.patterns[0];
    const actions = {
        'tactical_formation': 'Adjust defensive alignment to counter formation',
        'play_call': 'Prepare counter-play based on detected call',
        'high_intensity_play': 'Manage player energy - high intensity detected'
    };

    return {
        action: actions[primaryPattern.type] || 'Analyze pattern further',
        confidence: primaryPattern.confidence * 0.9,
        reasoning: `Based on ${primaryPattern.type} pattern detected with ${primaryPattern.confidence} confidence`
    };
}

function fallbackProcessing(type, data) {
    // Edge-based fallback when containers are unavailable
    console.warn(`Falling back to edge processing for ${type}`);

    return {
        type,
        features: {
            basic: true,
            fallback: true
        },
        confidence: 0.5,
        processingTime: 10,
        timestamp: Date.now()
    };
}

async function updateSession(env, sessionId, data) {
    const durableId = env.MULTIMODAL_SESSIONS.idFromName(sessionId);
    const durableObj = env.MULTIMODAL_SESSIONS.get(durableId);

    await durableObj.fetch('https://internal/update', {
        method: 'POST',
        body: JSON.stringify({
            action: 'updateSession',
            sessionId,
            ...data
        })
    });
}

async function logAnalytics(env, response) {
    // Log to analytics service or KV store
    const analyticsKey = `analytics_${Date.now()}_${response.sessionId}`;

    await env.ANALYTICS_KV.put(analyticsKey, JSON.stringify({
        ...response,
        timestamp: new Date().toISOString()
    }), {
        expirationTtl: 86400 // 24 hours
    });

    // If championship latency achieved, log separately
    if (response.meetingTarget) {
        await env.CHAMPIONSHIP_METRICS.put(
            `champion_${Date.now()}`,
            JSON.stringify(response)
        );
    }
}

async function handleStatusRequest(env) {
    // Gather system status
    const status = {
        operational: true,
        endpoints: {
            stream: 'ready',
            process: 'ready',
            websocket: 'ready'
        },
        performance: {
            avgLatency: await getAverageLatency(env),
            activeSessions: await getActiveSessions(env),
            queueDepth: await getQueueDepth(env)
        },
        timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(status), {
        headers: { 'Content-Type': 'application/json' }
    });
}

async function getAverageLatency(env) {
    // Retrieve from KV store or calculate
    return 85; // Mock 85ms average
}

async function getActiveSessions(env) {
    // Count active Durable Objects
    return 12; // Mock 12 active sessions
}

async function getQueueDepth(env) {
    // Check queue size
    return 3; // Mock 3 messages in queue
}