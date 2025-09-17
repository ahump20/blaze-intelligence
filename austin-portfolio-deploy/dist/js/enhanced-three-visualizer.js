/**
 * Enhanced Three.js Data Visualizer for Blaze Intelligence
 * Championship-level sports data visualization with quantum neural aesthetics
 */

class EnhancedThreeVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.visualizations = new Map();
        this.animationId = null;
        this.clock = new THREE.Clock();

        // Enhanced visual configurations
        this.config = {
            colors: {
                primary: 0xBF5700,      // Burnt Orange
                secondary: 0xFFD700,     // Championship Gold
                accent: 0x9BCBEB,        // Cardinal Blue
                neural: 0x00B2A9,        // Data Green
                deep: 0x002244,          // Trust Navy
                glow: 0xFF8C00,          // Orange Glow
                cardinals: 0xC41E3A,     // Cardinals Red
                titans: 0x0C2340,        // Titans Navy
                longhorns: 0xBF5700,     // Texas Orange
                grizzlies: 0x12173D      // Grizzlies Navy
            },
            effects: {
                bloom: true,
                glow: true,
                particles: true,
                raytracing: true
            }
        };
    }

    async initialize() {
        if (!this.container) {
            console.error('Container not found');
            return;
        }

        this.setupScene();
        this.setupAdvancedLighting();
        await this.createEnhancedVisualizations();
        this.setupEventHandlers();
        this.animate();
    }

    setupScene() {
        // Scene with deep gradient background
        this.scene = new THREE.Scene();

        // Create gradient background
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#0a0e27');
        gradient.addColorStop(0.5, '#112240');
        gradient.addColorStop(1, '#002244');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 2, 512);

        const texture = new THREE.CanvasTexture(canvas);
        this.scene.background = texture;
        this.scene.fog = new THREE.FogExp2(0x0a0e27, 0.015);

        // Camera with cinematic perspective
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(0, 10, 30);
        this.camera.lookAt(0, 0, 0);

        // Enhanced renderer with post-processing capabilities
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);

        // Advanced orbit controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = false;
            this.controls.maxPolarAngle = Math.PI / 2;
            this.controls.minDistance = 10;
            this.controls.maxDistance = 100;
        }
    }

    setupAdvancedLighting() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Key light with shadows
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(20, 30, 20);
        keyLight.castShadow = true;
        keyLight.shadow.camera.near = 0.1;
        keyLight.shadow.camera.far = 100;
        keyLight.shadow.camera.left = -30;
        keyLight.shadow.camera.right = 30;
        keyLight.shadow.camera.top = 30;
        keyLight.shadow.camera.bottom = -30;
        keyLight.shadow.mapSize.width = 4096;
        keyLight.shadow.mapSize.height = 4096;
        keyLight.shadow.bias = -0.0005;
        this.scene.add(keyLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(this.config.colors.secondary, 0.5);
        fillLight.position.set(-20, 20, -20);
        this.scene.add(fillLight);

        // Rim light for edge definition
        const rimLight = new THREE.DirectionalLight(this.config.colors.accent, 0.8);
        rimLight.position.set(0, 10, -30);
        this.scene.add(rimLight);

        // Dynamic point lights for team colors
        this.teamLights = [];
        const teams = ['cardinals', 'titans', 'longhorns', 'grizzlies'];
        teams.forEach((team, index) => {
            const angle = (index / teams.length) * Math.PI * 2;
            const light = new THREE.PointLight(this.config.colors[team], 0.6, 50);
            light.position.set(
                Math.cos(angle) * 25,
                10,
                Math.sin(angle) * 25
            );
            this.teamLights.push(light);
            this.scene.add(light);
        });

        // Spot light for focal emphasis
        this.spotLight = new THREE.SpotLight(this.config.colors.primary, 2);
        this.spotLight.position.set(0, 40, 0);
        this.spotLight.angle = Math.PI / 6;
        this.spotLight.penumbra = 0.2;
        this.spotLight.decay = 2;
        this.spotLight.distance = 100;
        this.spotLight.castShadow = true;
        this.scene.add(this.spotLight);
        this.scene.add(this.spotLight.target);
    }

    async createEnhancedVisualizations() {
        // Create championship data sphere
        this.createChampionshipSphere();

        // Create team-specific visualizations
        this.createTeamVisualizations();

        // Create neural data network
        this.createNeuralDataNetwork();

        // Create holographic displays
        this.createHolographicDisplays();

        // Create particle field
        this.createParticleField();
    }

    createChampionshipSphere() {
        // Central championship data sphere with ray-traced appearance
        const sphereGeometry = new THREE.SphereGeometry(5, 64, 64);
        const sphereMaterial = new THREE.MeshPhysicalMaterial({
            color: this.config.colors.primary,
            metalness: 0.7,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            envMapIntensity: 2.0,
            transparent: true,
            opacity: 0.8,
            emissive: this.config.colors.glow,
            emissiveIntensity: 0.2
        });

        this.championshipSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.championshipSphere.position.set(0, 0, 0);
        this.championshipSphere.castShadow = true;
        this.championshipSphere.receiveShadow = true;
        this.scene.add(this.championshipSphere);

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(5.5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.config.colors.glow,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
        this.championshipSphere.add(glowSphere);

        // Add data rings
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(7 + i * 2, 0.1, 8, 100);
            const ringMaterial = new THREE.MeshPhysicalMaterial({
                color: this.config.colors.accent,
                metalness: 0.9,
                roughness: 0.1,
                emissive: this.config.colors.accent,
                emissiveIntensity: 0.3
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.random() * Math.PI;
            ring.rotation.y = Math.random() * Math.PI;
            this.championshipSphere.add(ring);

            // Store for animation
            ring.userData = {
                rotationSpeed: 0.001 + Math.random() * 0.002,
                axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
            };
            this.visualizations.set(`ring_${i}`, ring);
        }
    }

    createTeamVisualizations() {
        const teams = [
            { name: 'Cardinals', color: this.config.colors.cardinals, position: new THREE.Vector3(15, 0, 0) },
            { name: 'Titans', color: this.config.colors.titans, position: new THREE.Vector3(-15, 0, 0) },
            { name: 'Longhorns', color: this.config.colors.longhorns, position: new THREE.Vector3(0, 0, 15) },
            { name: 'Grizzlies', color: this.config.colors.grizzlies, position: new THREE.Vector3(0, 0, -15) }
        ];

        teams.forEach((team, index) => {
            // Team data crystal
            const geometry = new THREE.OctahedronGeometry(2, 0);
            const material = new THREE.MeshPhysicalMaterial({
                color: team.color,
                metalness: 0.8,
                roughness: 0.2,
                clearcoat: 1.0,
                clearcoatRoughness: 0.0,
                emissive: team.color,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.9
            });

            const crystal = new THREE.Mesh(geometry, material);
            crystal.position.copy(team.position);
            crystal.castShadow = true;
            crystal.receiveShadow = true;

            // Add team label
            crystal.userData = {
                team: team.name,
                floatSpeed: 0.001 + Math.random() * 0.001,
                rotationSpeed: 0.002 + Math.random() * 0.002,
                originalY: team.position.y
            };

            this.scene.add(crystal);
            this.visualizations.set(`team_${team.name}`, crystal);

            // Connect to central sphere
            const points = [team.position, new THREE.Vector3(0, 0, 0)];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: team.color,
                transparent: true,
                opacity: 0.3,
                linewidth: 1
            });
            const connection = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(connection);
        });
    }

    createNeuralDataNetwork() {
        // Create interconnected neural network of data points
        const nodeCount = 50;
        const nodes = [];
        const connections = [];

        for (let i = 0; i < nodeCount; i++) {
            const radius = 20 + Math.random() * 15;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            // Create node
            const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const nodeMaterial = new THREE.MeshPhysicalMaterial({
                color: this.config.colors.neural,
                emissive: this.config.colors.neural,
                emissiveIntensity: 0.5,
                metalness: 0.9,
                roughness: 0.1
            });

            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set(x, y, z);
            nodes.push(node);
            this.scene.add(node);

            // Store node data
            node.userData = {
                originalPosition: new THREE.Vector3(x, y, z),
                pulsePhase: Math.random() * Math.PI * 2,
                connections: []
            };
        }

        // Create connections
        nodes.forEach((node, i) => {
            const nearbyNodes = nodes.filter((other, j) => {
                if (i === j) return false;
                const distance = node.position.distanceTo(other.position);
                return distance < 10 && Math.random() < 0.3;
            });

            nearbyNodes.forEach(other => {
                const points = [node.position, other.position];
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: this.config.colors.neural,
                    transparent: true,
                    opacity: 0.2
                });
                const connection = new THREE.Line(lineGeometry, lineMaterial);
                this.scene.add(connection);
                connections.push(connection);
                node.userData.connections.push(connection);
            });
        });

        this.visualizations.set('neural_nodes', nodes);
        this.visualizations.set('neural_connections', connections);
    }

    createHolographicDisplays() {
        // Create floating holographic data displays
        const displays = [
            { position: new THREE.Vector3(10, 10, 10), data: 'MLB' },
            { position: new THREE.Vector3(-10, 10, 10), data: 'NFL' },
            { position: new THREE.Vector3(10, 10, -10), data: 'NCAA' },
            { position: new THREE.Vector3(-10, 10, -10), data: 'Perfect Game' }
        ];

        displays.forEach((display, index) => {
            // Holographic panel
            const panelGeometry = new THREE.PlaneGeometry(4, 3);
            const panelMaterial = new THREE.MeshPhysicalMaterial({
                color: this.config.colors.accent,
                metalness: 0.0,
                roughness: 1.0,
                transparent: true,
                opacity: 0.1,
                emissive: this.config.colors.accent,
                emissiveIntensity: 0.5,
                side: THREE.DoubleSide
            });

            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panel.position.copy(display.position);
            panel.lookAt(0, 0, 0);

            // Add scan lines effect
            panel.userData = {
                type: display.data,
                scanOffset: 0,
                glowIntensity: 0.5
            };

            this.scene.add(panel);
            this.visualizations.set(`hologram_${display.data}`, panel);

            // Add frame
            const frameGeometry = new THREE.BoxGeometry(4.2, 3.2, 0.1);
            const frameMaterial = new THREE.MeshPhysicalMaterial({
                color: this.config.colors.primary,
                metalness: 0.9,
                roughness: 0.1,
                emissive: this.config.colors.primary,
                emissiveIntensity: 0.2
            });
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            panel.add(frame);
            frame.position.z = -0.1;
        });
    }

    createParticleField() {
        // Create ambient particle field for atmosphere
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;

            // Random team colors
            const colorChoice = Math.random();
            let color;
            if (colorChoice < 0.25) color = new THREE.Color(this.config.colors.primary);
            else if (colorChoice < 0.5) color = new THREE.Color(this.config.colors.secondary);
            else if (colorChoice < 0.75) color = new THREE.Color(this.config.colors.accent);
            else color = new THREE.Color(this.config.colors.neural);

            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = Math.random() * 0.5 + 0.1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particleField = new THREE.Points(geometry, material);
        this.scene.add(this.particleField);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Animate championship sphere
        if (this.championshipSphere) {
            this.championshipSphere.rotation.y += 0.001;
            const scale = 1 + Math.sin(elapsed * 2) * 0.05;
            this.championshipSphere.scale.set(scale, scale, scale);
        }

        // Animate data rings
        this.visualizations.forEach((visual, key) => {
            if (key.startsWith('ring_')) {
                visual.rotateOnAxis(visual.userData.axis, visual.userData.rotationSpeed);
            }
        });

        // Animate team crystals
        this.visualizations.forEach((visual, key) => {
            if (key.startsWith('team_')) {
                visual.rotation.y += visual.userData.rotationSpeed;
                visual.rotation.x += visual.userData.rotationSpeed * 0.5;
                visual.position.y = visual.userData.originalY + Math.sin(elapsed * visual.userData.floatSpeed * 100) * 2;
            }
        });

        // Animate neural network
        const nodes = this.visualizations.get('neural_nodes');
        if (nodes) {
            nodes.forEach(node => {
                const intensity = 0.5 + Math.sin(elapsed * 2 + node.userData.pulsePhase) * 0.5;
                node.material.emissiveIntensity = intensity;

                // Gentle drift
                const drift = Math.sin(elapsed + node.userData.pulsePhase) * 0.1;
                node.position.x = node.userData.originalPosition.x + drift;
                node.position.y = node.userData.originalPosition.y + Math.cos(elapsed + node.userData.pulsePhase) * 0.1;
            });
        }

        // Animate holographic displays
        this.visualizations.forEach((visual, key) => {
            if (key.startsWith('hologram_')) {
                visual.userData.scanOffset += 0.01;
                visual.material.emissiveIntensity = 0.3 + Math.sin(elapsed * 3) * 0.2;
                visual.rotation.y = Math.sin(elapsed * 0.5) * 0.1;
            }
        });

        // Animate team lights
        this.teamLights.forEach((light, index) => {
            const angle = (index / this.teamLights.length) * Math.PI * 2 + elapsed * 0.2;
            light.position.x = Math.cos(angle) * 25;
            light.position.z = Math.sin(angle) * 25;
            light.intensity = 0.4 + Math.sin(elapsed * 2 + index) * 0.2;
        });

        // Animate spotlight
        if (this.spotLight) {
            this.spotLight.target.position.x = Math.sin(elapsed * 0.3) * 10;
            this.spotLight.target.position.z = Math.cos(elapsed * 0.3) * 10;
            this.spotLight.target.updateMatrixWorld();
        }

        // Animate particle field
        if (this.particleField) {
            this.particleField.rotation.y += 0.0001;
            this.particleField.rotation.x += 0.0001;
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    setupEventHandlers() {
        // Handle window resize
        window.addEventListener('resize', () => {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });

        // Handle quality settings
        window.addEventListener('quality-change', (event) => {
            this.updateQuality(event.detail.quality);
        });
    }

    updateQuality(quality) {
        if (quality === 'low') {
            this.renderer.setPixelRatio(1);
            this.renderer.shadowMap.enabled = false;
        } else if (quality === 'medium') {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            this.renderer.shadowMap.enabled = true;
        } else {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
        }
    }

    // Update data visualization with real sports data
    async updateWithData(data) {
        // Update team crystals with real data
        if (data.teams) {
            data.teams.forEach(teamData => {
                const crystal = this.visualizations.get(`team_${teamData.name}`);
                if (crystal) {
                    // Scale based on performance
                    const scale = 1 + (teamData.winPercentage || 0.5);
                    crystal.scale.set(scale, scale, scale);

                    // Update color intensity based on recent performance
                    crystal.material.emissiveIntensity = 0.3 + (teamData.recentForm || 0.5) * 0.4;
                }
            });
        }

        // Update neural network activity
        if (data.activity) {
            const nodes = this.visualizations.get('neural_nodes');
            if (nodes) {
                nodes.forEach((node, index) => {
                    if (data.activity[index]) {
                        node.material.emissiveIntensity = data.activity[index];
                    }
                });
            }
        }
    }

    destroy() {
        // Clean up resources
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.visualizations.forEach(visual => {
            if (visual.geometry) visual.geometry.dispose();
            if (visual.material) visual.material.dispose();
        });

        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.container && this.renderer.domElement) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Auto-initialize on specific containers
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('[data-three-visualizer]');

    containers.forEach(container => {
        const visualizer = new EnhancedThreeVisualizer(container.id);
        visualizer.initialize();

        // Store instance for external access
        window[`visualizer_${container.id}`] = visualizer;
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedThreeVisualizer;
} else {
    window.EnhancedThreeVisualizer = EnhancedThreeVisualizer;
}