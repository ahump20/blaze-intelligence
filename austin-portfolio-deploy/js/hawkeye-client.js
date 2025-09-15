/**
 * Hawk-Eye Client Helper
 * Provides easy API access to Hawk-Eye MCP server functions
 * Championship-level sports analytics with 340fps tracking and ±2.6mm precision
 */

class HawkEyeClient {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.endpoints = {
            track: '/api/hawkeye/track',
            predict: '/api/hawkeye/predict',
            strikeZone: '/api/hawkeye/strike-zone'
        };
    }

    /**
     * Track ball position using multi-camera triangulation
     * @param {Array} cameras - Camera calibration data
     * @param {Array} measurements - Pixel coordinates from each camera
     * @returns {Promise} Ball position, velocity, and confidence
     */
    async trackBall(cameras = [], measurements = []) {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.track, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cameras, measurements })
            });

            const data = await response.json();

            if (data.success) {
                console.log('🎯 Hawk-Eye Tracking:', data.data);
                return data.data;
            } else {
                throw new Error(data.error || 'Tracking failed');
            }
        } catch (error) {
            console.error('❌ Hawk-Eye tracking error:', error);
            throw error;
        }
    }

    /**
     * Predict ball trajectory with physics simulation
     * @param {Object} position - Starting position {x, y, z}
     * @param {Object} velocity - Initial velocity {vx, vy, vz}
     * @param {Number} spin - Ball spin rate (rpm)
     * @returns {Promise} Trajectory prediction with landing point
     */
    async predictTrajectory(position, velocity, spin = 2400) {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.predict, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ position, velocity, spin })
            });

            const data = await response.json();

            if (data.success) {
                console.log('🚀 Trajectory Prediction:', data.data);
                return data.data;
            } else {
                throw new Error(data.error || 'Prediction failed');
            }
        } catch (error) {
            console.error('❌ Trajectory prediction error:', error);
            throw error;
        }
    }

    /**
     * Analyze strike zone location
     * @param {Number} plateX - Horizontal position at plate (meters)
     * @param {Number} plateY - Vertical position at plate (meters)
     * @param {Number} plateZ - Depth position across plate (meters)
     * @returns {Promise} Zone classification and strike probability
     */
    async analyzeStrikeZone(plateX = 0, plateY = 0.3, plateZ = 0.42) {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.strikeZone, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plateX, plateY, plateZ })
            });

            const data = await response.json();

            if (data.success) {
                console.log('⚾ Strike Zone Analysis:', data.data);
                return data.data;
            } else {
                throw new Error(data.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('❌ Strike zone analysis error:', error);
            throw error;
        }
    }

    /**
     * Simulate a complete pitch sequence
     * @returns {Promise} Full pitch data with tracking, trajectory, and zone
     */
    async simulatePitch() {
        // Generate realistic pitch parameters
        const pitchTypes = [
            { name: 'Fastball', velocity: { vx: 35, vy: -2, vz: 8 }, spin: 2200 },
            { name: 'Curveball', velocity: { vx: 25, vy: -8, vz: 12 }, spin: 2800 },
            { name: 'Slider', velocity: { vx: 30, vy: -4, vz: 10 }, spin: 2500 },
            { name: 'Changeup', velocity: { vx: 28, vy: -3, vz: 6 }, spin: 1800 }
        ];

        const pitch = pitchTypes[Math.floor(Math.random() * pitchTypes.length)];
        const position = { x: 0, y: 1.2, z: 18.4 }; // Mound position

        try {
            // Track the ball
            const tracking = await this.trackBall();

            // Predict trajectory
            const trajectory = await this.predictTrajectory(position, pitch.velocity, pitch.spin);

            // Analyze strike zone
            const strikeZone = await this.analyzeStrikeZone(
                trajectory.prediction.landingPoint.x / 100,
                0.3 + Math.random() * 0.3,
                0.42
            );

            return {
                pitchType: pitch.name,
                tracking,
                trajectory,
                strikeZone,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Pitch simulation error:', error);
            throw error;
        }
    }

    /**
     * Create visual representation of strike zone
     * @param {HTMLElement} container - DOM element to render into
     * @param {Object} zoneData - Strike zone analysis data
     */
    renderStrikeZone(container, zoneData) {
        if (!container) return;

        const zoneColors = {
            1: '#ff6b6b', 2: '#ffd93d', 3: '#ff6b6b',
            4: '#ffd93d', 5: '#6bcf7f', 6: '#ffd93d',
            7: '#ff6b6b', 8: '#ffd93d', 9: '#ff6b6b'
        };

        const html = `
            <div class="strike-zone-display" style="
                width: 300px;
                height: 400px;
                border: 3px solid #BF5700;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(3, 1fr);
                gap: 2px;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 8px;
                padding: 10px;
                position: relative;
            ">
                ${[7, 8, 9, 4, 5, 6, 1, 2, 3].map(zone => `
                    <div class="zone zone-${zone}" style="
                        background: ${zoneData.zone === zone ? zoneColors[zone] : 'rgba(255, 255, 255, 0.1)'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 24px;
                        border-radius: 4px;
                        opacity: ${zoneData.zone === zone ? '1' : '0.3'};
                        transition: all 0.3s ease;
                    ">
                        ${zone}
                    </div>
                `).join('')}

                <div class="pitch-marker" style="
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background: #FFD700;
                    border-radius: 50%;
                    left: ${150 + zoneData.pitchLocation.x * 300}px;
                    top: ${200 - zoneData.pitchLocation.y * 300}px;
                    box-shadow: 0 0 20px #FFD700;
                    animation: pulse 1s infinite;
                "></div>
            </div>

            <div class="zone-info" style="
                margin-top: 20px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.9);
                border-radius: 8px;
                border: 1px solid #BF5700;
            ">
                <h3 style="color: #FFD700; margin: 0 0 10px 0;">Zone ${zoneData.zone}: ${zoneData.zoneDescription}</h3>
                <p style="color: #9BCBEB; margin: 5px 0;">Strike Probability: ${zoneData.strikeProbability}</p>
                <p style="color: #9BCBEB; margin: 5px 0;">Call Confidence: ${zoneData.callConfidence}</p>
                <p style="color: #8892b0; margin: 5px 0; font-size: 12px;">Precision: ${zoneData.mlbRegulation.precision}</p>
            </div>

            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
            </style>
        `;

        container.innerHTML = html;
    }

    /**
     * Start real-time pitch tracking demo
     * @param {HTMLElement} container - DOM element for display
     * @param {Number} interval - Update interval in milliseconds
     */
    startLiveDemo(container, interval = 3000) {
        if (!container) return;

        const updatePitch = async () => {
            try {
                const pitch = await this.simulatePitch();

                // Update display
                const displayHtml = `
                    <div class="live-pitch-display" style="
                        padding: 20px;
                        background: linear-gradient(135deg, #0a0e27, #1a1a2e);
                        border-radius: 12px;
                        border: 2px solid #BF5700;
                    ">
                        <h2 style="color: #FFD700; margin: 0 0 20px 0;">
                            🎯 Live Hawk-Eye Tracking
                        </h2>

                        <div class="pitch-info" style="
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                            margin-bottom: 20px;
                        ">
                            <div style="padding: 10px; background: rgba(0, 0, 0, 0.5); border-radius: 8px;">
                                <span style="color: #8892b0; font-size: 12px;">Pitch Type</span>
                                <div style="color: #FFD700; font-size: 20px; font-weight: bold;">
                                    ${pitch.pitchType}
                                </div>
                            </div>

                            <div style="padding: 10px; background: rgba(0, 0, 0, 0.5); border-radius: 8px;">
                                <span style="color: #8892b0; font-size: 12px;">Velocity</span>
                                <div style="color: #9BCBEB; font-size: 20px; font-weight: bold;">
                                    ${Math.round(Math.sqrt(
                                        pitch.trajectory.initialVelocity.vx ** 2 +
                                        pitch.trajectory.initialVelocity.vy ** 2 +
                                        pitch.trajectory.initialVelocity.vz ** 2
                                    ) * 2.237)} mph
                                </div>
                            </div>

                            <div style="padding: 10px; background: rgba(0, 0, 0, 0.5); border-radius: 8px;">
                                <span style="color: #8892b0; font-size: 12px;">Spin Rate</span>
                                <div style="color: #00B2A9; font-size: 20px; font-weight: bold;">
                                    ${pitch.trajectory.spinRate} rpm
                                </div>
                            </div>

                            <div style="padding: 10px; background: rgba(0, 0, 0, 0.5); border-radius: 8px;">
                                <span style="color: #8892b0; font-size: 12px;">Confidence</span>
                                <div style="color: #00ff7f; font-size: 20px; font-weight: bold;">
                                    ${(pitch.tracking.confidence * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        <div class="tracking-stats" style="
                            padding: 15px;
                            background: rgba(0, 0, 0, 0.7);
                            border-radius: 8px;
                            margin-bottom: 20px;
                        ">
                            <div style="color: #8892b0; font-size: 12px; margin-bottom: 10px;">
                                TRACKING PERFORMANCE
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #9BCBEB;">Frame Rate: ${pitch.tracking.frameRate}</span>
                                <span style="color: #9BCBEB;">Precision: ${pitch.tracking.precision}</span>
                                <span style="color: #9BCBEB;">Cameras: ${pitch.tracking.cameras}</span>
                            </div>
                        </div>

                        <div id="strike-zone-container"></div>
                    </div>
                `;

                container.innerHTML = displayHtml;

                // Render strike zone
                const zoneContainer = container.querySelector('#strike-zone-container');
                if (zoneContainer) {
                    this.renderStrikeZone(zoneContainer, pitch.strikeZone);
                }

            } catch (error) {
                console.error('Demo update error:', error);
            }
        };

        // Initial update
        updatePitch();

        // Set interval for updates
        return setInterval(updatePitch, interval);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HawkEyeClient;
}

// Initialize global instance for immediate use
window.hawkEyeClient = new HawkEyeClient();