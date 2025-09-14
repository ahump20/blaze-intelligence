/**
 * Blaze Intelligence Real-Time Fusion Engine
 * Based on the reference architecture for <100ms multimodal processing
 * Implements time-aligned event correlation with ring buffers
 */

class RingBuffer {
    constructor(capacity = 512) {
        this.buffer = new Array(capacity);
        this.capacity = capacity;
        this.writeIndex = 0;
        this.size = 0;
    }

    push(item) {
        this.buffer[this.writeIndex] = item;
        this.writeIndex = (this.writeIndex + 1) % this.capacity;
        if (this.size < this.capacity) this.size++;
    }

    between(startNs, endNs) {
        const result = [];
        const start = Math.max(0, this.writeIndex - this.size);

        for (let i = 0; i < this.size; i++) {
            const idx = (start + i) % this.capacity;
            const item = this.buffer[idx];

            if (!item) continue;

            const itemStart = item.mono_ns || item.start_ns || 0;
            const itemEnd = item.mono_ns || item.end_ns || itemStart;

            if (itemEnd >= startNs && itemStart <= endNs) {
                result.push(item);
            }
        }

        return result;
    }

    latest() {
        if (this.size === 0) return null;
        const idx = (this.writeIndex - 1 + this.capacity) % this.capacity;
        return this.buffer[idx];
    }

    clear() {
        this.buffer = new Array(this.capacity);
        this.writeIndex = 0;
        this.size = 0;
    }
}

class RTIFusionEngine {
    constructor(config = {}) {
        this.config = {
            windowMs: config.windowMs || 120,
            syncToleranceMs: config.syncToleranceMs || 60,
            fusionPollRateHz: config.fusionPollRateHz || 250,
            maxStalenessMs: config.maxStalenessMs || 100,
            ...config
        };

        // Ring buffers for features
        this.videoBuffer = new RingBuffer(512);
        this.audioBuffer = new RingBuffer(512);

        // Pattern library
        this.patterns = new Map();

        // Metrics
        this.metrics = {
            fusionCount: 0,
            unimodalCount: 0,
            syncErrors: 0,
            avgLatencyMs: 0,
            lastSyncErrorMs: 0
        };

        // Output queues
        this.eventQueue = [];
        this.subscribers = new Set();

        // Timing
        this.startTime = performance.now();
        this.clockOffset = 0; // NTP offset in ms

        // Start fusion loop
        this.fusionInterval = null;
        this.startFusionLoop();
    }

    // Get monotonic timestamp in nanoseconds
    nowNs() {
        return BigInt(Math.floor(performance.now() * 1e6));
    }

    // Get synchronized timestamp
    getSyncTimestamp() {
        return {
            mono_ns: this.nowNs(),
            ntp_unix_ns: BigInt(Date.now() * 1e6) + BigInt(this.clockOffset * 1e6),
            source: 'fusion'
        };
    }

    // Push video features
    pushVideoFeatures(features) {
        const timestamped = {
            ...features,
            mono_ns: features.mono_ns || this.nowNs(),
            type: 'VideoFeatures'
        };
        this.videoBuffer.push(timestamped);
        this.onVideoFeatures(timestamped);
    }

    // Push audio features
    pushAudioFeatures(features) {
        const timestamped = {
            ...features,
            start_ns: features.start_ns || this.nowNs(),
            end_ns: features.end_ns || this.nowNs() + BigInt(20e6), // 20ms window
            type: 'AudioFeatures'
        };
        this.audioBuffer.push(timestamped);
        this.onAudioFeatures(timestamped);
    }

    // Confidence mixing function
    confidenceMix(videoConf, audioConf, contextConf = 0.7, deltaMs = 0) {
        // Adaptive weights based on signal quality
        const alphaV = 0.5;
        const alphaA = 0.35;
        const alphaC = 0.15;
        const lambdaStaleness = 0.2;

        // Calculate staleness penalty
        const staleness = Math.max(0, (Math.abs(deltaMs) - 40) / 60);
        const stalenessPenalty = lambdaStaleness * Math.min(1, staleness);

        // Mix confidences
        const total = alphaV * videoConf +
                     alphaA * audioConf +
                     alphaC * contextConf -
                     stalenessPenalty;

        return Math.max(0, Math.min(1, total));
    }

    // Main fusion loop
    startFusionLoop() {
        const intervalMs = 1000 / this.config.fusionPollRateHz;

        this.fusionInterval = setInterval(() => {
            this.fusionTick();
        }, intervalMs);
    }

    fusionTick() {
        const now = this.nowNs();

        // Get latest video feature
        const videoFeature = this.videoBuffer.latest();
        if (!videoFeature) return;

        // Define correlation window
        const windowNs = BigInt(this.config.windowMs * 1e6);
        const startWindow = videoFeature.mono_ns - windowNs / 2n;
        const endWindow = videoFeature.mono_ns + windowNs / 2n;

        // Find correlated audio features
        const audioCandidates = this.audioBuffer.between(
            Number(startWindow),
            Number(endWindow)
        );

        if (audioCandidates.length === 0) {
            // Unimodal path - process video only
            this.processUnimodal(videoFeature, 'vision');
            return;
        }

        // Find best audio match
        let bestAudio = null;
        let bestScore = -1;

        for (const audio of audioCandidates) {
            const deltaMs = Number(videoFeature.mono_ns - BigInt(audio.end_ns || audio.start_ns)) / 1e6;

            // Calculate video confidence
            const videoConf = this.getVideoConfidence(videoFeature);

            // Calculate audio confidence
            const audioConf = this.getAudioConfidence(audio);

            // Mix confidences
            const score = this.confidenceMix(videoConf, audioConf, 0.7, deltaMs);

            if (score > bestScore) {
                bestScore = score;
                bestAudio = audio;
            }
        }

        if (bestAudio && bestScore >= 0.75) {
            // Multimodal fusion
            this.processMultimodal(videoFeature, bestAudio, bestScore);
        } else {
            // Weak correlation - process as unimodal
            this.processUnimodal(videoFeature, 'vision');
        }

        // Update metrics
        this.updateMetrics(now);
    }

    // Process unimodal features
    processUnimodal(feature, modality) {
        const confidence = modality === 'vision'
            ? this.getVideoConfidence(feature)
            : this.getAudioConfidence(feature);

        if (confidence < 0.6) return; // Skip weak signals

        const pattern = this.detectPattern(feature, null, modality);
        if (pattern) {
            this.emitPatternEvent(pattern);
        }

        this.metrics.unimodalCount++;
    }

    // Process multimodal fusion
    processMultimodal(videoFeature, audioFeature, confidence) {
        const pattern = this.detectPattern(videoFeature, audioFeature, 'multimodal');

        if (pattern) {
            pattern.confidence = confidence;
            pattern.evidence = {
                vision: this.getVideoConfidence(videoFeature),
                audio: this.getAudioConfidence(audioFeature),
                context: 0.7
            };

            this.emitPatternEvent(pattern);
        }

        this.metrics.fusionCount++;
    }

    // Pattern detection
    detectPattern(video, audio, modality) {
        // Check against pattern library
        for (const [name, patternDef] of this.patterns) {
            if (this.matchesPattern(patternDef, video, audio, modality)) {
                return {
                    type: 'PatternEvent',
                    name: name,
                    modality: modality,
                    timestamp: this.getSyncTimestamp(),
                    window_mono_ns: [
                        video?.mono_ns || audio?.start_ns,
                        video?.mono_ns || audio?.end_ns
                    ]
                };
            }
        }

        return null;
    }

    // Pattern matching logic
    matchesPattern(patternDef, video, audio, modality) {
        if (modality === 'vision' && patternDef.requires?.vision) {
            return this.matchesVideoPattern(patternDef.requires.vision, video);
        }

        if (modality === 'audio' && patternDef.requires?.audio) {
            return this.matchesAudioPattern(patternDef.requires.audio, audio);
        }

        if (modality === 'multimodal') {
            const videoMatch = !patternDef.requires?.vision ||
                              this.matchesVideoPattern(patternDef.requires.vision, video);
            const audioMatch = !patternDef.requires?.audio ||
                              this.matchesAudioPattern(patternDef.requires.audio, audio);
            return videoMatch && audioMatch;
        }

        return false;
    }

    // Video pattern matching
    matchesVideoPattern(pattern, video) {
        if (!video?.detections) return false;

        // Example: Check for specific detection types
        if (pattern.detection) {
            return video.detections.some(d =>
                d.label === pattern.detection &&
                d.conf >= (pattern.minConf || 0.5)
            );
        }

        if (pattern.formation_change) {
            // Check for formation changes (placeholder logic)
            return video.detections.length >= 5;
        }

        return true;
    }

    // Audio pattern matching
    matchesAudioPattern(pattern, audio) {
        if (!audio) return false;

        // Check for keywords
        if (pattern.keywords) {
            const hasKeyword = pattern.keywords.some(kw =>
                audio.keywords?.includes(kw) ||
                audio.tokens_partial?.includes(kw)
            );
            if (!hasKeyword) return false;
        }

        // Check for sound events
        if (pattern.events) {
            const hasEvent = pattern.events.some(evt =>
                audio.events?.some(e => e.kind === evt)
            );
            if (!hasEvent) return false;
        }

        return true;
    }

    // Calculate video confidence
    getVideoConfidence(video) {
        if (!video?.detections || video.detections.length === 0) return 0;

        // Average confidence of all detections
        const sum = video.detections.reduce((acc, d) => acc + (d.conf || 0), 0);
        return sum / video.detections.length;
    }

    // Calculate audio confidence
    getAudioConfidence(audio) {
        if (!audio) return 0;

        let conf = 0;

        // VAD contribution
        if (audio.vad) conf += 0.3;

        // Keywords contribution
        if (audio.keywords && audio.keywords.length > 0) {
            conf += 0.4 * Math.min(1, audio.keywords.length / 3);
        }

        // Events contribution
        if (audio.events && audio.events.length > 0) {
            conf += 0.3;
        }

        return Math.min(1, conf);
    }

    // Emit pattern event
    emitPatternEvent(pattern) {
        const envelope = {
            stream_id: this.config.streamId || 'default',
            seq: this.eventQueue.length,
            ...this.getSyncTimestamp(),
            payload: pattern
        };

        this.eventQueue.push(envelope);

        // Notify subscribers
        for (const subscriber of this.subscribers) {
            try {
                subscriber(envelope);
            } catch (error) {
                console.error('Subscriber error:', error);
            }
        }
    }

    // Subscribe to events
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    // Update metrics
    updateMetrics(nowNs) {
        // Calculate average latency
        const processingTime = Number(nowNs - this.videoBuffer.latest()?.mono_ns || 0n) / 1e6;
        this.metrics.avgLatencyMs = this.metrics.avgLatencyMs * 0.9 + processingTime * 0.1;

        // Check for sync errors
        const video = this.videoBuffer.latest();
        const audio = this.audioBuffer.latest();

        if (video && audio) {
            const deltaMs = Math.abs(Number(video.mono_ns - BigInt(audio.end_ns || 0n)) / 1e6);
            if (deltaMs > this.config.maxStalenessMs) {
                this.metrics.syncErrors++;
                this.metrics.lastSyncErrorMs = deltaMs;
            }
        }
    }

    // Add pattern to library
    addPattern(name, definition) {
        this.patterns.set(name, definition);
    }

    // Load pattern library from config
    loadPatternLibrary(patterns) {
        for (const pattern of patterns) {
            this.addPattern(pattern.name, pattern);
        }
    }

    // Get current metrics
    getMetrics() {
        return {
            ...this.metrics,
            bufferSizes: {
                video: this.videoBuffer.size,
                audio: this.audioBuffer.size
            },
            uptimeMs: performance.now() - this.startTime
        };
    }

    // Cleanup
    destroy() {
        if (this.fusionInterval) {
            clearInterval(this.fusionInterval);
            this.fusionInterval = null;
        }

        this.videoBuffer.clear();
        this.audioBuffer.clear();
        this.subscribers.clear();
        this.eventQueue = [];
    }

    // Handle video features (hook for custom processing)
    onVideoFeatures(features) {
        // Override in subclass for custom processing
    }

    // Handle audio features (hook for custom processing)
    onAudioFeatures(features) {
        // Override in subclass for custom processing
    }
}

// Default pattern library for sports
const SPORTS_PATTERN_LIBRARY = [
    {
        name: 'zone_switch',
        requires: {
            vision: { formation_change: 'zone' },
            audio: { keywords: ['zone', 'switch'] }
        },
        window_ms: 120,
        score: {
            weights: { vision: 0.55, audio: 0.35, context: 0.10 },
            threshold: 0.75
        }
    },
    {
        name: 'fast_break',
        requires: {
            vision: { detection: 'player', minConf: 0.8 },
            audio: { keywords: ['break', 'go', 'fast'] }
        },
        window_ms: 100,
        score: {
            weights: { vision: 0.6, audio: 0.3, context: 0.1 },
            threshold: 0.7
        }
    },
    {
        name: 'timeout_called',
        requires: {
            audio: { events: ['whistle'], keywords: ['timeout', 'time'] }
        },
        window_ms: 150,
        score: {
            weights: { vision: 0.2, audio: 0.7, context: 0.1 },
            threshold: 0.8
        }
    },
    {
        name: 'score_event',
        requires: {
            vision: { detection: 'ball' },
            audio: { events: ['crowd_cheer', 'whistle'] }
        },
        window_ms: 200,
        score: {
            weights: { vision: 0.4, audio: 0.5, context: 0.1 },
            threshold: 0.75
        }
    }
];

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RTIFusionEngine, RingBuffer, SPORTS_PATTERN_LIBRARY };
} else {
    window.RTIFusionEngine = RTIFusionEngine;
    window.RingBuffer = RingBuffer;
    window.SPORTS_PATTERN_LIBRARY = SPORTS_PATTERN_LIBRARY;
}