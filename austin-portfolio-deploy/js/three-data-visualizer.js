// Blaze Intelligence Three.js Data Visualizer
// Real-time 3D visualization of sports analytics data

class ThreeDataVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.dataConnector = new SportsDataConnector();
        this.visualizations = new Map();
        this.animationId = null;
        this.clock = new THREE.Clock();
    }

    async initialize() {
        if (!this.container) {
            console.error('Container not found');
            return;
        }

        this.setupScene();
        this.setupLights();
        await this.createVisualizations();
        this.setupEventHandlers();
        this.animate();
    }

    setupScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e27);
        this.scene.fog = new THREE.Fog(0x0a0e27, 10, 100);

        // Camera setup
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 5, 20);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Add orbit controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = false;
            this.controls.maxPolarAngle = Math.PI / 2;
        }
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);

        // Point lights for accent
        const pointLight1 = new THREE.PointLight(0xBF5700, 0.8, 100); // Burnt orange
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xFFD700, 0.6, 100); // Gold
        pointLight2.position.set(-10, 10, -10);
        this.scene.add(pointLight2);
    }

    async createVisualizations() {
        // Create different visualization types
        await this.createMLBVisualization();
        await this.createNCAAVisualization();
        await this.createPerfectGameVisualization();
        this.createDataParticles();
        this.createHolographicDisplay();
    }

    async createMLBVisualization() {
        const data = await this.dataConnector.getCardinalsAnalytics();

        // Create a baseball diamond visualization
        const diamondGroup = new THREE.Group();
        diamondGroup.name = 'mlb-diamond';

        // Base paths
        const baseGeometry = new THREE.BoxGeometry(1, 0.1, 1);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

        const positions = [
            [0, 0, -10],    // Home
            [7, 0, -3],     // First
            [0, 0, 4],      // Second
            [-7, 0, -3]     // Third
        ];

        positions.forEach((pos, index) => {
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.set(...pos);
            base.castShadow = true;
            base.receiveShadow = true;
            diamondGroup.add(base);

            // Add data visualization at each base
            if (data && data.performance) {
                const dataValue = index === 0 ? data.performance.wins :
                                index === 1 ? data.performance.runsScored :
                                index === 2 ? data.performance.losses :
                                data.performance.runsAllowed;

                const barHeight = dataValue / 10;
                const barGeometry = new THREE.CylinderGeometry(0.3, 0.3, barHeight, 8);
                const barMaterial = new THREE.MeshPhongMaterial({
                    color: index % 2 === 0 ? 0xBF5700 : 0xFFD700,
                    emissive: index % 2 === 0 ? 0xBF5700 : 0xFFD700,
                    emissiveIntensity: 0.3
                });

                const bar = new THREE.Mesh(barGeometry, barMaterial);
                bar.position.set(pos[0], barHeight / 2, pos[2]);
                bar.castShadow = true;
                diamondGroup.add(bar);

                // Add floating text
                this.addFloatingText(dataValue.toString(),
                    [pos[0], barHeight + 1, pos[2]],
                    diamondGroup);
            }
        });

        // Connect bases with glowing lines
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x9BCBEB,
            linewidth: 2,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < positions.length; i++) {
            const points = [];
            points.push(new THREE.Vector3(...positions[i]));
            points.push(new THREE.Vector3(...positions[(i + 1) % positions.length]));

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            diamondGroup.add(line);
        }

        diamondGroup.position.x = -15;
        this.scene.add(diamondGroup);
        this.visualizations.set('mlb', diamondGroup);
    }

    async createNCAAVisualization() {
        const data = await this.dataConnector.getNCAAfootball();

        // Create a football field visualization
        const fieldGroup = new THREE.Group();
        fieldGroup.name = 'ncaa-field';

        // Field surface
        const fieldGeometry = new THREE.PlaneGeometry(20, 10);
        const fieldMaterial = new THREE.MeshPhongMaterial({
            color: 0x2d5016,
            side: THREE.DoubleSide
        });
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.rotation.x = -Math.PI / 2;
        field.receiveShadow = true;
        fieldGroup.add(field);

        // Yard lines
        for (let i = -8; i <= 8; i += 2) {
            const lineGeometry = new THREE.PlaneGeometry(0.1, 10);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(i, 0.01, 0);
            line.rotation.x = -Math.PI / 2;
            fieldGroup.add(line);
        }

        // Data visualization pillars
        if (data && data.analytics) {
            const metrics = [
                { value: data.analytics.strengthOfSchedule, label: 'SOS', color: 0xBF5700 },
                { value: data.analytics.playoffProbability, label: 'Playoff %', color: 0xFFD700 },
                { value: data.analytics.nilValuation / 100000, label: 'NIL Value', color: 0x9BCBEB }
            ];

            metrics.forEach((metric, index) => {
                const height = metric.value / 20;
                const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, height, 16);
                const pillarMaterial = new THREE.MeshPhongMaterial({
                    color: metric.color,
                    emissive: metric.color,
                    emissiveIntensity: 0.2,
                    transparent: true,
                    opacity: 0.9
                });

                const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
                pillar.position.set((index - 1) * 4, height / 2, -7);
                pillar.castShadow = true;
                fieldGroup.add(pillar);

                // Add label
                this.addFloatingText(metric.label,
                    [(index - 1) * 4, height + 1, -7],
                    fieldGroup);
            });
        }

        fieldGroup.position.x = 15;
        this.scene.add(fieldGroup);
        this.visualizations.set('ncaa', fieldGroup);
    }

    async createPerfectGameVisualization() {
        const data = await this.dataConnector.getPerfectGameData();

        // Create a prospect ranking visualization
        const prospectGroup = new THREE.Group();
        prospectGroup.name = 'perfect-game';

        if (data && data.topProspects) {
            data.topProspects.forEach((prospect, index) => {
                // Create star-shaped prospect indicator
                const starGeometry = new THREE.ConeGeometry(0.5, 1, 5);
                const starMaterial = new THREE.MeshPhongMaterial({
                    color: prospect.rating > 9 ? 0xFFD700 : 0xBF5700,
                    emissive: prospect.rating > 9 ? 0xFFD700 : 0xBF5700,
                    emissiveIntensity: 0.3
                });

                const star = new THREE.Mesh(starGeometry, starMaterial);
                const angle = (index / data.topProspects.length) * Math.PI * 2;
                const radius = 5;
                star.position.set(
                    Math.cos(angle) * radius,
                    prospect.rating / 2,
                    Math.sin(angle) * radius
                );
                star.rotation.z = Math.PI;
                star.castShadow = true;
                prospectGroup.add(star);

                // Add connecting lines to center
                const points = [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(
                        Math.cos(angle) * radius,
                        prospect.rating / 2,
                        Math.sin(angle) * radius
                    )
                ];

                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: 0x9BCBEB,
                    transparent: true,
                    opacity: 0.5
                });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                prospectGroup.add(line);
            });
        }

        // Add central hub
        const hubGeometry = new THREE.SphereGeometry(1, 32, 32);
        const hubMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x9BCBEB,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        hub.position.y = 2;
        prospectGroup.add(hub);

        prospectGroup.position.z = -10;
        this.scene.add(prospectGroup);
        this.visualizations.set('perfectgame', prospectGroup);
    }

    createDataParticles() {
        // Create floating data particles
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color = new THREE.Color();
        const palette = [0xBF5700, 0xFFD700, 0x9BCBEB, 0xffffff];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            positions[i3] = (Math.random() - 0.5) * 50;
            positions[i3 + 1] = Math.random() * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 50;

            color.setHex(palette[Math.floor(Math.random() * palette.length)]);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createHolographicDisplay() {
        // Create a holographic data display
        const displayGroup = new THREE.Group();
        displayGroup.name = 'holographic-display';

        // Create hologram base
        const baseGeometry = new THREE.CylinderGeometry(3, 3, 0.2, 32);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        displayGroup.add(base);

        // Create holographic projection
        const projectionGeometry = new THREE.CylinderGeometry(2.5, 2.5, 5, 32, 1, true);
        const projectionMaterial = new THREE.MeshPhongMaterial({
            color: 0x9BCBEB,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            emissive: 0x9BCBEB,
            emissiveIntensity: 0.5
        });
        const projection = new THREE.Mesh(projectionGeometry, projectionMaterial);
        projection.position.y = 2.5;
        displayGroup.add(projection);

        // Add rotating data rings
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(2, 0.1, 8, 32);
            const ringMaterial = new THREE.MeshPhongMaterial({
                color: [0xBF5700, 0xFFD700, 0x9BCBEB][i],
                emissive: [0xBF5700, 0xFFD700, 0x9BCBEB][i],
                emissiveIntensity: 0.5
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.y = 1 + i * 1.5;
            ring.rotation.x = Math.PI / 2;
            ring.name = `data-ring-${i}`;
            displayGroup.add(ring);
        }

        displayGroup.position.set(0, 0, 5);
        this.scene.add(displayGroup);
        this.visualizations.set('holographic', displayGroup);
    }

    addFloatingText(text, position, parent) {
        // In a real implementation, this would create 3D text
        // For now, we'll create a simple sprite placeholder
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        context.fillStyle = '#ffffff';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(text, 128, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(...position);
        sprite.scale.set(2, 0.5, 1);

        parent.add(sprite);
    }

    setupEventHandlers() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });

        // Handle mouse interactions
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        this.container.addEventListener('mousemove', (event) => {
            const rect = this.container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.scene.children, true);

            if (intersects.length > 0) {
                this.container.style.cursor = 'pointer';
            } else {
                this.container.style.cursor = 'default';
            }
        });

        // Subscribe to real-time data updates
        if (window.blazeRealtimeData) {
            window.blazeRealtimeData.subscribe('mlb', (data) => {
                this.updateMLBVisualization(data);
            });

            window.blazeRealtimeData.subscribe('ncaa', (data) => {
                this.updateNCAAVisualization(data);
            });

            window.blazeRealtimeData.subscribe('perfectgame', (data) => {
                this.updatePerfectGameVisualization(data);
            });
        }
    }

    updateMLBVisualization(data) {
        const mlbGroup = this.visualizations.get('mlb');
        if (!mlbGroup || !data) return;

        // Update bar heights based on new data
        // Animation would be implemented here
    }

    updateNCAAVisualization(data) {
        const ncaaGroup = this.visualizations.get('ncaa');
        if (!ncaaGroup || !data) return;

        // Update pillars based on new data
        // Animation would be implemented here
    }

    updatePerfectGameVisualization(data) {
        const pgGroup = this.visualizations.get('perfectgame');
        if (!pgGroup || !data) return;

        // Update prospect positions based on new data
        // Animation would be implemented here
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        // Rotate visualizations
        const mlb = this.visualizations.get('mlb');
        if (mlb) mlb.rotation.y += 0.001;

        const ncaa = this.visualizations.get('ncaa');
        if (ncaa) ncaa.rotation.y -= 0.001;

        const pg = this.visualizations.get('perfectgame');
        if (pg) pg.rotation.y += 0.002;

        // Animate holographic display
        const holo = this.visualizations.get('holographic');
        if (holo) {
            holo.children.forEach((child, index) => {
                if (child.name.startsWith('data-ring')) {
                    child.rotation.z += 0.01 * (index + 1);
                    child.rotation.y += 0.005 * (index + 1);
                }
            });
        }

        // Animate particles
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += Math.sin(elapsed + i) * 0.01;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }

        this.visualizations.clear();
    }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('three-visualization');
        if (container) {
            window.blazeThreeVisualizer = new ThreeDataVisualizer('three-visualization');
            window.blazeThreeVisualizer.initialize();
        }
    });
}