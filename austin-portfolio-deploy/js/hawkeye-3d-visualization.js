/**
 * Hawk-Eye 3D Ball Tracking Visualization
 * Championship-level 3D visualization for ball trajectory tracking
 * @version 1.0.0
 * @author Blaze Intelligence
 */

class HawkEye3DVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with ID '${containerId}' not found`);
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Baseball field components
        this.field = null;
        this.homeplate = null;
        this.pitcherMound = null;
        this.strikeZone = null;

        // Ball tracking components
        this.ball = null;
        this.trajectory = null;
        this.trajectoryPoints = [];
        this.velocityVector = null;

        // Animation
        this.animationId = null;
        this.isAnimating = false;

        // Colors using Blaze Intelligence brand
        this.colors = {
            field: 0x2d5a27,           // Field green
            dirt: 0x8B4513,           // Dirt brown
            homeplate: 0xFFFFFF,      // White
            strikeZone: 0x9BCBEB,     // Cardinal blue
            ball: 0xFFFFFF,           // White baseball
            trajectory: 0xBF5700,     // Burnt orange
            velocity: 0x00ff7f,       // Neural green
            prediction: 0xFFD700      // Championship gold
        };

        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createField();
        this.createStrikeZone();
        this.createBall();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e27); // Blaze deep navy
        this.scene.fog = new THREE.Fog(0x0a0e27, 50, 200);
    }

    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 10, 30);
        this.camera.lookAt(0, 2, 0);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        this.container.appendChild(this.renderer.domElement);
    }

    createLights() {
        // Stadium lighting setup
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Main stadium lights
        const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
        light1.position.set(50, 50, 50);
        light1.castShadow = true;
        light1.shadow.mapSize.width = 2048;
        light1.shadow.mapSize.height = 2048;
        light1.shadow.camera.near = 0.5;
        light1.shadow.camera.far = 500;
        light1.shadow.camera.left = -50;
        light1.shadow.camera.right = 50;
        light1.shadow.camera.top = 50;
        light1.shadow.camera.bottom = -50;
        this.scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff, 0.6);
        light2.position.set(-30, 40, -30);
        this.scene.add(light2);

        // Home plate spotlight
        const spotlight = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 6, 0.25, 1);
        spotlight.position.set(0, 20, 5);
        spotlight.target.position.set(0, 0, 0);
        spotlight.castShadow = true;
        this.scene.add(spotlight);
        this.scene.add(spotlight.target);
    }

    createField() {
        // Create baseball field
        const fieldGeometry = new THREE.PlaneGeometry(120, 120);
        const fieldMaterial = new THREE.MeshLambertMaterial({ color: this.colors.field });
        this.field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        this.field.rotation.x = -Math.PI / 2;
        this.field.receiveShadow = true;
        this.scene.add(this.field);

        // Pitcher's mound
        const moundGeometry = new THREE.CylinderGeometry(4, 4, 0.3, 32);
        const moundMaterial = new THREE.MeshLambertMaterial({ color: this.colors.dirt });
        this.pitcherMound = new THREE.Mesh(moundGeometry, moundMaterial);
        this.pitcherMound.position.set(0, 0.15, -18.44); // 60 feet 6 inches from home
        this.pitcherMound.castShadow = true;
        this.scene.add(this.pitcherMound);

        // Home plate
        const plateGeometry = new THREE.BoxGeometry(0.43, 0.05, 0.43); // Official dimensions
        const plateMaterial = new THREE.MeshLambertMaterial({ color: this.colors.homeplate });
        this.homeplate = new THREE.Mesh(plateGeometry, plateMaterial);
        this.homeplate.position.set(0, 0.025, 0);
        this.homeplate.castShadow = true;
        this.scene.add(this.homeplate);

        // Batter's boxes
        this.createBattersBoxes();
    }

    createBattersBoxes() {
        const boxGeometry = new THREE.BoxGeometry(1.22, 0.02, 1.83); // Official dimensions
        const boxMaterial = new THREE.MeshLambertMaterial({ color: this.colors.dirt });

        // Left batter's box
        const leftBox = new THREE.Mesh(boxGeometry, boxMaterial);
        leftBox.position.set(-0.76, 0.01, 0);
        this.scene.add(leftBox);

        // Right batter's box
        const rightBox = new THREE.Mesh(boxGeometry, boxMaterial);
        rightBox.position.set(0.76, 0.01, 0);
        this.scene.add(rightBox);
    }

    createStrikeZone() {
        // Create 3D strike zone visualization
        const zoneGeometry = new THREE.BoxGeometry(0.43, 0.7, 0.05);
        const zoneMaterial = new THREE.MeshBasicMaterial({
            color: this.colors.strikeZone,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });

        this.strikeZone = new THREE.Mesh(zoneGeometry, zoneMaterial);
        this.strikeZone.position.set(0, 0.8, -0.2); // Above home plate
        this.scene.add(this.strikeZone);

        // Create zone grid (9 zones)
        this.createStrikeZoneGrid();
    }

    createStrikeZoneGrid() {
        const gridGroup = new THREE.Group();

        // Create 9 zone grid
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const zoneGeometry = new THREE.PlaneGeometry(0.43/3, 0.7/3);
                const zoneMaterial = new THREE.MeshBasicMaterial({
                    color: this.colors.strikeZone,
                    transparent: true,
                    opacity: 0.1,
                    side: THREE.DoubleSide
                });

                const zone = new THREE.Mesh(zoneGeometry, zoneMaterial);
                zone.position.set(
                    (col - 1) * (0.43/3),
                    0.8 - (row - 1) * (0.7/3),
                    -0.19
                );
                zone.userData = { zoneNumber: row * 3 + col + 1 };
                gridGroup.add(zone);
            }
        }

        this.scene.add(gridGroup);
        this.strikeZoneGrid = gridGroup;
    }

    createBall() {
        const ballGeometry = new THREE.SphereGeometry(0.037, 16, 16); // Official baseball radius
        const ballMaterial = new THREE.MeshPhongMaterial({
            color: this.colors.ball,
            shininess: 100,
            specular: 0x222222
        });

        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.position.set(0, 2, -18.44); // Start at pitcher's mound
        this.ball.castShadow = true;
        this.scene.add(this.ball);

        // Create ball seams for realism
        this.createBallSeams();
    }

    createBallSeams() {
        const seamMaterial = new THREE.MeshBasicMaterial({ color: 0x660000 });

        // Simple seam representation
        const seamGeometry = new THREE.TorusGeometry(0.035, 0.002, 8, 16);
        const seam1 = new THREE.Mesh(seamGeometry, seamMaterial);
        seam1.rotation.x = Math.PI / 4;

        const seam2 = new THREE.Mesh(seamGeometry, seamMaterial);
        seam2.rotation.x = -Math.PI / 4;
        seam2.rotation.z = Math.PI / 2;

        this.ball.add(seam1);
        this.ball.add(seam2);
    }

    setupControls() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going underground
            this.controls.minDistance = 5;
            this.controls.maxDistance = 100;
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Double click to reset view
        this.renderer.domElement.addEventListener('dblclick', () => {
            this.resetCamera();
        });
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    resetCamera() {
        if (this.controls) {
            this.camera.position.set(0, 10, 30);
            this.camera.lookAt(0, 2, 0);
            this.controls.target.set(0, 2, 0);
            this.controls.update();
        }
    }

    /**
     * Animate ball trajectory based on Hawk-Eye data
     * @param {Object} trackingData - Ball position and velocity data
     * @param {Object} trajectoryData - Predicted trajectory data
     */
    animateBallTrajectory(trackingData, trajectoryData) {
        this.clearTrajectory();

        if (!trackingData || !trajectoryData) return;

        // Start ball at release point
        const startPos = trackingData.position || { x: 0, y: 2, z: -18.44 };
        this.ball.position.set(startPos.x, startPos.y, startPos.z);

        // Create trajectory path
        const trajectory = this.createTrajectoryPath(trackingData, trajectoryData);
        this.animateBallAlongPath(trajectory);
    }

    createTrajectoryPath(trackingData, trajectoryData) {
        const points = [];
        const { position, velocity } = trackingData;
        const { time, landing } = trajectoryData;

        const steps = 60; // 60 frames for smooth animation

        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * time;

            // Physics calculation with gravity
            const x = position.x + velocity.vx * t;
            const y = position.y + velocity.vy * t - 0.5 * 9.81 * t * t;
            const z = position.z + velocity.vz * t;

            points.push(new THREE.Vector3(x, y, z));
        }

        return points;
    }

    animateBallAlongPath(trajectoryPoints) {
        if (trajectoryPoints.length === 0) return;

        this.isAnimating = true;
        let currentPoint = 0;

        const animate = () => {
            if (currentPoint >= trajectoryPoints.length || !this.isAnimating) {
                this.isAnimating = false;
                return;
            }

            const point = trajectoryPoints[currentPoint];
            this.ball.position.copy(point);

            // Add rotation for realism
            this.ball.rotation.x += 0.2;
            this.ball.rotation.y += 0.1;

            // Update trajectory visualization
            this.updateTrajectoryVisualization(trajectoryPoints, currentPoint);

            currentPoint++;

            requestAnimationFrame(animate);
        };

        animate();
    }

    updateTrajectoryVisualization(points, currentIndex) {
        // Remove previous trajectory
        if (this.trajectory) {
            this.scene.remove(this.trajectory);
        }

        // Create visible trajectory up to current point
        const visiblePoints = points.slice(0, currentIndex + 1);
        if (visiblePoints.length < 2) return;

        const curve = new THREE.CatmullRomCurve3(visiblePoints);
        const tubeGeometry = new THREE.TubeGeometry(curve, visiblePoints.length, 0.01, 8, false);
        const tubeMaterial = new THREE.MeshBasicMaterial({
            color: this.colors.trajectory,
            transparent: true,
            opacity: 0.8
        });

        this.trajectory = new THREE.Mesh(tubeGeometry, tubeMaterial);
        this.scene.add(this.trajectory);
    }

    /**
     * Highlight strike zone based on analysis
     * @param {Object} strikeZoneData - Zone analysis data
     */
    highlightStrikeZone(strikeZoneData) {
        if (!strikeZoneData || !this.strikeZoneGrid) return;

        const { zone, strikeProbability } = strikeZoneData;

        // Reset all zones
        this.strikeZoneGrid.children.forEach(zoneChild => {
            zoneChild.material.color.setHex(this.colors.strikeZone);
            zoneChild.material.opacity = 0.1;
        });

        // Highlight the specific zone
        if (zone >= 1 && zone <= 9) {
            const targetZone = this.strikeZoneGrid.children[zone - 1];
            if (targetZone) {
                const color = strikeProbability > 0.5 ? this.colors.neural : this.colors.warning;
                targetZone.material.color.setHex(color);
                targetZone.material.opacity = 0.6;

                // Add pulsing animation
                this.animateZonePulse(targetZone);
            }
        }
    }

    animateZonePulse(zone) {
        const originalOpacity = zone.material.opacity;
        let increasing = true;
        let currentOpacity = originalOpacity;

        const pulse = () => {
            if (increasing) {
                currentOpacity += 0.02;
                if (currentOpacity >= 0.8) increasing = false;
            } else {
                currentOpacity -= 0.02;
                if (currentOpacity <= originalOpacity) return; // Stop pulsing
            }

            zone.material.opacity = currentOpacity;
            requestAnimationFrame(pulse);
        };

        pulse();
    }

    /**
     * Create velocity vector visualization
     * @param {Object} velocity - Velocity vector {vx, vy, vz}
     * @param {Object} position - Starting position
     */
    showVelocityVector(velocity, position) {
        this.clearVelocityVector();

        const origin = new THREE.Vector3(position.x, position.y, position.z);
        const direction = new THREE.Vector3(velocity.vx, velocity.vy, velocity.vz).normalize();
        const length = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy + velocity.vz * velocity.vz) / 10;

        this.velocityVector = new THREE.ArrowHelper(direction, origin, length, this.colors.velocity, length * 0.2, length * 0.1);
        this.scene.add(this.velocityVector);
    }

    clearTrajectory() {
        if (this.trajectory) {
            this.scene.remove(this.trajectory);
            this.trajectory = null;
        }
    }

    clearVelocityVector() {
        if (this.velocityVector) {
            this.scene.remove(this.velocityVector);
            this.velocityVector = null;
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));

        if (this.controls) {
            this.controls.update();
        }

        // Subtle field lighting animation
        if (this.scene.fog) {
            this.scene.fog.near = 50 + Math.sin(Date.now() * 0.001) * 5;
        }

        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.isAnimating = false;

        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.controls) {
            this.controls.dispose();
        }

        // Clean up geometries and materials
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}

// Export for global use
window.HawkEye3DVisualization = HawkEye3DVisualization;

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('hawkeye-3d-container');
    if (container) {
        window.hawkEye3D = new HawkEye3DVisualization('hawkeye-3d-container');
        console.log('🎯 Hawk-Eye 3D Visualization initialized');
    }
});

// Integration with Hawk-Eye MCP Client
if (window.HawkEyeClient) {
    window.HawkEyeClient.onUpdate('trackingUpdate', (data) => {
        if (window.hawkEye3D && data.position && data.velocity) {
            window.hawkEye3D.showVelocityVector(data.velocity, data.position);
        }
    });

    window.HawkEyeClient.onUpdate('trajectoryPrediction', (data) => {
        if (window.hawkEye3D) {
            const trackingData = window.HawkEyeClient.getTrackingData();
            const latestTracking = trackingData[trackingData.length - 1];
            if (latestTracking) {
                window.hawkEye3D.animateBallTrajectory(latestTracking, data);
            }
        }
    });

    window.HawkEyeClient.onUpdate('strikeZoneAnalysis', (data) => {
        if (window.hawkEye3D) {
            window.hawkEye3D.highlightStrikeZone(data);
        }
    });
}