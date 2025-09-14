/**
 * Blaze Intelligence WebRTC Gateway
 * Real-time media capture and processing with <100ms latency target
 * Implements the reference architecture's ingest layer
 */

class WebRTCGateway {
    constructor(config = {}) {
        this.config = {
            iceServers: config.iceServers || [
                { urls: 'stun:stun.l.google.com:19302' }
            ],
            videoCodec: config.videoCodec || 'VP8',
            audioCodec: config.audioCodec || 'opus',
            videoBitrate: config.videoBitrate || 2500000, // 2.5 Mbps
            audioBitrate: config.audioBitrate || 128000,   // 128 kbps
            maxLatency: config.maxLatency || 100,           // Target 100ms
            ...config
        };

        // WebRTC components
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
        this.dataChannel = null;

        // Media processors
        this.videoProcessor = null;
        this.audioProcessor = null;

        // Timing and metrics
        this.captureTimestamps = new Map();
        this.metrics = {
            frameCount: 0,
            audioChunks: 0,
            avgCaptureLatency: 0,
            avgNetworkLatency: 0,
            droppedFrames: 0,
            jitterMs: 0
        };

        // State
        this.isConnected = false;
        this.isProcessing = false;

        // Event handlers
        this.eventHandlers = new Map();
    }

    // Initialize media capture
    async initializeCapture(constraints = {}) {
        try {
            const defaultConstraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30, max: 60 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000
                }
            };

            // Merge constraints
            const finalConstraints = {
                video: { ...defaultConstraints.video, ...constraints.video },
                audio: { ...defaultConstraints.audio, ...constraints.audio }
            };

            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia(finalConstraints);

            // Setup media processors
            await this.setupVideoProcessor();
            await this.setupAudioProcessor();

            console.log('✅ Media capture initialized');
            return this.localStream;

        } catch (error) {
            console.error('❌ Failed to initialize capture:', error);
            throw error;
        }
    }

    // Setup video processing pipeline
    async setupVideoProcessor() {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (!videoTrack) return;

        // Create video processor using Insertable Streams (Chrome 94+)
        if ('MediaStreamTrackProcessor' in window) {
            const processor = new MediaStreamTrackProcessor({ track: videoTrack });
            const { readable } = processor;

            // Create transform stream for video processing
            const transformer = new TransformStream({
                transform: async (frame, controller) => {
                    const timestamp = this.getMonotonicTimestamp();

                    // Store capture timestamp
                    this.captureTimestamps.set(frame.timestamp, {
                        mono_ns: timestamp,
                        pts: frame.timestamp,
                        capture_time: performance.now()
                    });

                    // Process frame (placeholder for CV operations)
                    await this.processVideoFrame(frame, timestamp);

                    // Pass frame through
                    controller.enqueue(frame);

                    this.metrics.frameCount++;
                }
            });

            // Connect streams
            readable.pipeThrough(transformer).pipeTo(new WritableStream({
                write(frame) {
                    frame.close();
                }
            }));

            this.videoProcessor = { processor, transformer };
        } else {
            // Fallback: Use requestVideoFrameCallback (Safari) or canvas capture
            this.setupVideoFallbackProcessor(videoTrack);
        }
    }

    // Fallback video processor for browsers without Insertable Streams
    setupVideoFallbackProcessor(track) {
        const video = document.createElement('video');
        video.srcObject = new MediaStream([track]);
        video.play();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const processFrame = () => {
            if (!this.isProcessing) return;

            const settings = track.getSettings();
            canvas.width = settings.width;
            canvas.height = settings.height;

            ctx.drawImage(video, 0, 0);

            const timestamp = this.getMonotonicTimestamp();
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Process frame
            this.processVideoFrame({
                data: imageData,
                timestamp: timestamp,
                width: canvas.width,
                height: canvas.height
            }, timestamp);

            requestAnimationFrame(processFrame);
        };

        this.isProcessing = true;
        processFrame();
    }

    // Setup audio processing pipeline
    async setupAudioProcessor() {
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (!audioTrack) return;

        // Create audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 48000,
            latencyHint: 'interactive'
        });

        // Create source and processor
        const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
        const processor = audioContext.createScriptProcessor(2048, 1, 1);

        processor.onaudioprocess = (event) => {
            const timestamp = this.getMonotonicTimestamp();
            const inputData = event.inputBuffer.getChannelData(0);

            // Process audio chunk
            this.processAudioChunk({
                data: new Float32Array(inputData),
                timestamp: timestamp,
                sampleRate: audioContext.sampleRate,
                duration: event.inputBuffer.duration
            }, timestamp);

            this.metrics.audioChunks++;
        };

        // Connect audio graph
        source.connect(processor);
        processor.connect(audioContext.destination);

        this.audioProcessor = { audioContext, source, processor };
    }

    // Process video frame
    async processVideoFrame(frame, timestamp) {
        // Emit frame data for downstream processing
        this.emit('videoFrame', {
            type: 'VideoFrame',
            mono_ns: timestamp,
            frame_id: this.metrics.frameCount,
            width: frame.width || frame.codedWidth,
            height: frame.height || frame.codedHeight,
            data: frame.data || frame,
            timestamp: frame.timestamp
        });

        // Update capture latency
        const captureData = this.captureTimestamps.get(frame.timestamp);
        if (captureData) {
            const latency = performance.now() - captureData.capture_time;
            this.metrics.avgCaptureLatency =
                this.metrics.avgCaptureLatency * 0.9 + latency * 0.1;
        }
    }

    // Process audio chunk
    processAudioChunk(chunk, timestamp) {
        // Emit audio data for downstream processing
        this.emit('audioChunk', {
            type: 'AudioChunk',
            start_ns: timestamp,
            end_ns: timestamp + BigInt(Math.floor(chunk.duration * 1e9)),
            data: chunk.data,
            sampleRate: chunk.sampleRate,
            duration: chunk.duration
        });
    }

    // Create WebRTC peer connection
    async createPeerConnection() {
        this.peerConnection = new RTCPeerConnection({
            iceServers: this.config.iceServers,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require'
        });

        // Add local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
        }

        // Create data channel for low-latency signaling
        this.dataChannel = this.peerConnection.createDataChannel('blazeData', {
            ordered: false,
            maxRetransmits: 0
        });

        this.setupDataChannel();
        this.setupPeerConnectionHandlers();

        return this.peerConnection;
    }

    // Setup data channel for metadata/control
    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('✅ Data channel opened');
            this.isConnected = true;
            this.emit('connected');
        };

        this.dataChannel.onclose = () => {
            console.log('❌ Data channel closed');
            this.isConnected = false;
            this.emit('disconnected');
        };

        this.dataChannel.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleDataChannelMessage(message);
            } catch (error) {
                console.error('Error parsing data channel message:', error);
            }
        };

        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
            this.emit('error', error);
        };
    }

    // Setup peer connection event handlers
    setupPeerConnectionHandlers() {
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.emit('iceCandidate', event.candidate);
            }
        };

        this.peerConnection.ontrack = (event) => {
            console.log('Remote track received:', event.track.kind);
            if (!this.remoteStream) {
                this.remoteStream = new MediaStream();
            }
            this.remoteStream.addTrack(event.track);
            this.emit('remoteTrack', event.track);
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection.connectionState);
            this.emit('connectionStateChange', this.peerConnection.connectionState);
        };

        // Monitor stats for QoS
        this.startStatsMonitoring();
    }

    // Monitor WebRTC statistics
    startStatsMonitoring() {
        const monitorInterval = setInterval(async () => {
            if (!this.peerConnection ||
                this.peerConnection.connectionState !== 'connected') {
                return;
            }

            const stats = await this.peerConnection.getStats();
            this.processStats(stats);

        }, 1000); // Check every second

        // Store interval for cleanup
        this._statsInterval = monitorInterval;
    }

    // Process WebRTC stats
    processStats(stats) {
        stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                // Video stats
                if (report.framesDropped) {
                    this.metrics.droppedFrames = report.framesDropped;
                }
                if (report.jitter) {
                    this.metrics.jitterMs = report.jitter * 1000;
                }
            }

            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                // Network stats
                if (report.currentRoundTripTime) {
                    this.metrics.avgNetworkLatency =
                        this.metrics.avgNetworkLatency * 0.9 +
                        (report.currentRoundTripTime * 1000) * 0.1;
                }
            }
        });

        // Emit metrics update
        this.emit('metrics', this.metrics);
    }

    // Handle data channel messages
    handleDataChannelMessage(message) {
        switch (message.type) {
            case 'sync':
                this.handleSyncMessage(message);
                break;
            case 'control':
                this.handleControlMessage(message);
                break;
            case 'pattern':
                this.emit('pattern', message.data);
                break;
            default:
                this.emit('message', message);
        }
    }

    // Handle time synchronization
    handleSyncMessage(message) {
        if (message.serverTime) {
            const now = Date.now();
            const rtt = now - message.clientTime;
            const serverTime = message.serverTime + rtt / 2;
            const offset = serverTime - now;

            // Update clock offset
            this.clockOffset = offset;

            this.emit('timeSync', {
                offset: offset,
                rtt: rtt,
                accuracy: rtt / 2
            });
        }
    }

    // Handle control messages
    handleControlMessage(message) {
        switch (message.command) {
            case 'adjustBitrate':
                this.adjustBitrate(message.video, message.audio);
                break;
            case 'requestKeyframe':
                this.requestKeyframe();
                break;
            case 'changeResolution':
                this.changeResolution(message.width, message.height);
                break;
        }
    }

    // Send data via data channel
    sendData(data) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            try {
                const message = typeof data === 'string' ? data : JSON.stringify(data);
                this.dataChannel.send(message);
                return true;
            } catch (error) {
                console.error('Failed to send data:', error);
                return false;
            }
        }
        return false;
    }

    // Adjust bitrate dynamically
    async adjustBitrate(videoBitrate, audioBitrate) {
        const senders = this.peerConnection.getSenders();

        for (const sender of senders) {
            const params = sender.getParameters();

            if (sender.track?.kind === 'video' && videoBitrate) {
                if (params.encodings && params.encodings[0]) {
                    params.encodings[0].maxBitrate = videoBitrate;
                }
            }

            if (sender.track?.kind === 'audio' && audioBitrate) {
                if (params.encodings && params.encodings[0]) {
                    params.encodings[0].maxBitrate = audioBitrate;
                }
            }

            await sender.setParameters(params);
        }
    }

    // Request keyframe
    requestKeyframe() {
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');

        if (videoSender && 'generateKeyFrame' in videoSender) {
            videoSender.generateKeyFrame();
        }
    }

    // Change video resolution
    async changeResolution(width, height) {
        const videoTrack = this.localStream?.getVideoTracks()[0];
        if (!videoTrack) return;

        await videoTrack.applyConstraints({
            width: { ideal: width },
            height: { ideal: height }
        });
    }

    // Get monotonic timestamp in nanoseconds
    getMonotonicTimestamp() {
        return BigInt(Math.floor(performance.now() * 1e6));
    }

    // Get synchronized timestamp
    getSyncTimestamp() {
        return {
            mono_ns: this.getMonotonicTimestamp(),
            ntp_unix_ns: BigInt((Date.now() + this.clockOffset) * 1e6),
            capture_time: performance.now()
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

    // Create offer for WebRTC connection
    async createOffer() {
        const offer = await this.peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        });

        await this.peerConnection.setLocalDescription(offer);
        return offer;
    }

    // Create answer for WebRTC connection
    async createAnswer(offer) {
        await this.peerConnection.setRemoteDescription(offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        return answer;
    }

    // Set remote description
    async setRemoteDescription(description) {
        await this.peerConnection.setRemoteDescription(description);
    }

    // Add ICE candidate
    async addIceCandidate(candidate) {
        await this.peerConnection.addIceCandidate(candidate);
    }

    // Get current metrics
    getMetrics() {
        return {
            ...this.metrics,
            isConnected: this.isConnected,
            connectionState: this.peerConnection?.connectionState,
            dataChannelState: this.dataChannel?.readyState,
            clockOffset: this.clockOffset
        };
    }

    // Cleanup
    async destroy() {
        this.isProcessing = false;

        // Stop stats monitoring
        if (this._statsInterval) {
            clearInterval(this._statsInterval);
        }

        // Close data channel
        if (this.dataChannel) {
            this.dataChannel.close();
        }

        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
        }

        // Stop media tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        // Cleanup audio processor
        if (this.audioProcessor) {
            this.audioProcessor.source.disconnect();
            this.audioProcessor.processor.disconnect();
            await this.audioProcessor.audioContext.close();
        }

        // Clear event handlers
        this.eventHandlers.clear();

        console.log('WebRTC Gateway destroyed');
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebRTCGateway;
} else {
    window.WebRTCGateway = WebRTCGateway;
}