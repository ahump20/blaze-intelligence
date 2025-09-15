/**
 * Championship Three.js Hero Animation System
 * By Austin Humphrey - Deep South Sports Authority
 * Professional, breathtakingly stunning visual experience
 * Optimized for championship-level performance and visual impact
 */

class ChampionshipThreeHero {
    constructor(options = {}) {
        // Configuration
        this.config = {
            containerId: options.containerId || 'three-hero-container',
            particleCount: options.particleCount || 5000,
            enablePostProcessing: options.enablePostProcessing !== false,
            enableLighting: options.enableLighting !== false,
            enableInteractivity: options.enableInteractivity !== false,
            debugMode: options.debugMode || false,
            ...options
        };
        
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        
        // Post-processing
        this.composer = null;
        this.renderPass = null;
        this.bloomPass = null;
        
        // Visual systems
        this.particles = {
            system: null,
            geometry: null,
            material: null,
            positions: null,
            velocities: null,
            colors: null
        };
        
        this.neuralNetwork = {
            nodes: [],
            connections: [],
            group: null
        };
        
        this.centerpiece = {
            sphere: null,
            rings: [],
            lights: []
        };
        
        // Animation state
        this.animationId = null;
        this.isRunning = false;
        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.performance = {
            frameCount: 0,
            lastTime: 0,
            fps: 60,
            averageFPS: 60
        };
        
        // Austin's championship branding
        this.brandPalette = {
            burntorange: 0xBF5700,
            texasgold: 0xFFB81C,
            hootorange: 0xFF7A00,
            championship: 0xFF4500,
            neural: 0x64FFDA,
            accent: 0x8B5CF6,
            white: 0xFFFFFF,
            navy: 0x0A192F
        };
        
        console.log('🏆 Austin Humphrey Championship Three.js System - Initializing');
        this.init();
    }
    
    async init() {
        try {
            await this.ensureThreeJS();
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupLighting();
            this.setupParticleSystem();
            this.setupNeuralNetwork();
            this.setupCenterpiece();
            this.setupPostProcessing();
            this.setupInteractivity();
            this.startAnimation();
            
            console.log('✅ Championship Three.js Hero System Ready');
        } catch (error) {
            console.error('🚨 Championship Three.js initialization failed:', error);
            this.createFallbackVisualization();
        }
    }
    
    async ensureThreeJS() {
        // Check if Three.js is available
        if (typeof THREE === 'undefined') {
            console.log('📦 Loading Three.js for championship experience...');
            
            // Load Three.js if not available
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
            
            if (typeof THREE === 'undefined') {
                throw new Error('Failed to load Three.js');
            }
        }
        
        console.log('✅ Three.js ready for championship visuals');
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0A192F);
        this.scene.fog = new THREE.FogExp2(0x0A192F, 0.0008);
        this.clock = new THREE.Clock();
    }
    
    setupCamera() {
        const container = this.getContainer();
        const aspect = container.clientWidth / container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000);
        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupRenderer() {
        const container = this.getContainer();
        
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Clear and append to container
        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);
        
        // Setup resize handling
        this.setupResize();
    }
    
    setupLighting() {
        if (!this.config.enableLighting) return;
        
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Key light (championship orange)
        const keyLight = new THREE.DirectionalLight(this.brandPalette.burntorange, 1.2);
        keyLight.position.set(50, 50, 50);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        this.scene.add(keyLight);
        
        // Fill light (gold accent)
        const fillLight = new THREE.DirectionalLight(this.brandPalette.texasgold, 0.8);
        fillLight.position.set(-50, 30, 50);
        this.scene.add(fillLight);
        
        // Rim light (neural cyan)
        const rimLight = new THREE.DirectionalLight(this.brandPalette.neural, 0.5);
        rimLight.position.set(0, -50, -50);
        this.scene.add(rimLight);
        
        // Point lights for dynamic effects
        const pointLight1 = new THREE.PointLight(this.brandPalette.championship, 1, 200);
        pointLight1.position.set(0, 0, 0);
        this.scene.add(pointLight1);
        
        this.centerpiece.lights.push(keyLight, fillLight, rimLight, pointLight1);
    }
    
    setupParticleSystem() {
        const count = this.config.particleCount;
        
        // Create geometry and attributes
        this.particles.geometry = new THREE.BufferGeometry();
        this.particles.positions = new Float32Array(count * 3);
        this.particles.velocities = new Float32Array(count * 3);
        this.particles.colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        // Initialize particles in sophisticated patterns
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Create multiple distribution patterns
            if (i < count * 0.6) {
                // Spherical distribution (60%)
                const radius = 30 + Math.random() * 150;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                this.particles.positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
                this.particles.positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                this.particles.positions[i3 + 2] = radius * Math.cos(phi);
            } else if (i < count * 0.8) {
                // Spiral distribution (20%)
                const t = (i - count * 0.6) / (count * 0.2) * Math.PI * 10;
                const radius = 50 + t * 5;
                
                this.particles.positions[i3] = radius * Math.cos(t);
                this.particles.positions[i3 + 1] = t * 10 - 50;
                this.particles.positions[i3 + 2] = radius * Math.sin(t);
            } else {
                // Ring distribution (20%)
                const angle = ((i - count * 0.8) / (count * 0.2)) * Math.PI * 2;
                const radius = 80 + Math.random() * 20;
                
                this.particles.positions[i3] = radius * Math.cos(angle);
                this.particles.positions[i3 + 1] = (Math.random() - 0.5) * 20;
                this.particles.positions[i3 + 2] = radius * Math.sin(angle);
            }
            
            // Set velocities
            this.particles.velocities[i3] = (Math.random() - 0.5) * 0.1;
            this.particles.velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
            this.particles.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
            
            // Set colors (championship palette)
            const colorChoice = Math.random();
            let color;
            
            if (colorChoice < 0.4) {
                color = new THREE.Color(this.brandPalette.burntorange);
            } else if (colorChoice < 0.7) {
                color = new THREE.Color(this.brandPalette.texasgold);
            } else if (colorChoice < 0.9) {
                color = new THREE.Color(this.brandPalette.neural);
            } else {
                color = new THREE.Color(this.brandPalette.accent);
            }
            
            // Add brightness variation
            const brightness = 0.7 + Math.random() * 0.3;
            color.multiplyScalar(brightness);
            
            this.particles.colors[i3] = color.r;
            this.particles.colors[i3 + 1] = color.g;
            this.particles.colors[i3 + 2] = color.b;
            
            // Particle sizes
            sizes[i] = 0.5 + Math.random() * 2;
        }
        
        // Set geometry attributes
        this.particles.geometry.setAttribute('position', new THREE.BufferAttribute(this.particles.positions, 3));
        this.particles.geometry.setAttribute('color', new THREE.BufferAttribute(this.particles.colors, 3));
        this.particles.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create material
        this.particles.material = new THREE.PointsMaterial({
            size: 2,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create particle system
        this.particles.system = new THREE.Points(this.particles.geometry, this.particles.material);
        this.scene.add(this.particles.system);
    }
    
    setupNeuralNetwork() {
        this.neuralNetwork.group = new THREE.Group();
        
        // Create neural nodes
        const nodeGeometry = new THREE.SphereGeometry(0.8, 12, 12);
        const nodeMaterial = new THREE.MeshPhongMaterial({
            color: this.brandPalette.neural,
            transparent: true,
            opacity: 0.7,
            emissive: this.brandPalette.neural,
            emissiveIntensity: 0.2
        });
        
        // Node positions in 3D neural network pattern
        const nodePositions = [
            // Input layer
            [-30, 20, 0], [-30, 0, 0], [-30, -20, 0],
            // Hidden layers
            [0, 25, 0], [0, 5, 0], [0, -15, 0], [0, -35, 0],
            [30, 15, 0], [30, -5, 0], [30, -25, 0],
            // Output layer
            [60, 10, 0], [60, -10, 0]
        ];
        
        // Create nodes
        nodePositions.forEach((pos, i) => {
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
            node.position.set(pos[0], pos[1], pos[2]);
            
            // Add pulsing animation offset
            node.userData = { 
                pulseOffset: i * 0.5,
                originalScale: 1
            };
            
            this.neuralNetwork.nodes.push(node);
            this.neuralNetwork.group.add(node);
        });
        
        // Create connections between nodes
        const connectionMaterial = new THREE.LineBasicMaterial({
            color: this.brandPalette.accent,
            transparent: true,
            opacity: 0.3
        });
        
        // Define connection patterns
        const connections = [
            // Input to hidden layer 1
            [0, 3], [0, 4], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [2, 6],
            // Hidden layer 1 to hidden layer 2
            [3, 7], [3, 8], [4, 7], [4, 8], [4, 9], [5, 8], [5, 9], [6, 9],
            // Hidden layer 2 to output
            [7, 10], [8, 10], [8, 11], [9, 11]
        ];
        
        connections.forEach(([fromIdx, toIdx]) => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array([
                ...nodePositions[fromIdx],
                ...nodePositions[toIdx]
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const line = new THREE.Line(geometry, connectionMaterial.clone());
            this.neuralNetwork.connections.push(line);
            this.neuralNetwork.group.add(line);
        });
        
        // Position the neural network
        this.neuralNetwork.group.position.set(0, 0, -20);
        this.neuralNetwork.group.scale.set(0.8, 0.8, 0.8);
        this.scene.add(this.neuralNetwork.group);
    }
    
    setupCenterpiece() {
        // Central championship sphere
        const sphereGeometry = new THREE.SphereGeometry(12, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: this.brandPalette.burntorange,
            transparent: true,
            opacity: 0.4,
            wireframe: true,
            emissive: this.brandPalette.burntorange,
            emissiveIntensity: 0.1
        });
        
        this.centerpiece.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.scene.add(this.centerpiece.sphere);
        
        // Championship rings
        for (let i = 0; i < 3; i++) {
            const radius = 18 + i * 8;
            const ringGeometry = new THREE.RingGeometry(radius, radius + 1, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: i === 0 ? this.brandPalette.texasgold : 
                       i === 1 ? this.brandPalette.neural : this.brandPalette.accent,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2 + (i * Math.PI / 6);
            ring.rotation.z = i * Math.PI / 3;
            
            this.centerpiece.rings.push(ring);
            this.scene.add(ring);
        }
    }
    
    setupPostProcessing() {
        if (!this.config.enablePostProcessing || typeof THREE.EffectComposer === 'undefined') {
            return;
        }
        
        // Implementation would go here if post-processing libraries are available
        console.log('Post-processing setup skipped (libraries not available)');
    }
    
    setupInteractivity() {
        if (!this.config.enableInteractivity) return;
        
        const container = this.getContainer();
        
        // Mouse movement interaction
        container.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            this.mouse.targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.targetY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        });
        
        // Touch interaction for mobile
        container.addEventListener('touchmove', (event) => {
            if (event.touches.length > 0) {
                const rect = container.getBoundingClientRect();
                const touch = event.touches[0];
                this.mouse.targetX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
                this.mouse.targetY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            }
        });
    }
    
    setupResize() {
        const handleResize = () => {
            const container = this.getContainer();
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
            
            if (this.composer) {
                this.composer.setSize(width, height);
            }
        };
        
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call
    }
    
    startAnimation() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
        console.log('🚀 Championship Three.js animation started');
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        const deltaTime = this.clock.getDelta();
        
        // Update performance monitoring
        this.updatePerformanceStats();
        
        // Smooth mouse interaction
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;
        
        // Animate particles
        this.animateParticles(time, deltaTime);
        
        // Animate neural network
        this.animateNeuralNetwork(time);
        
        // Animate centerpiece
        this.animateCenterpiece(time);
        
        // Update camera based on mouse interaction
        this.updateCamera(time);
        
        // Render
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    animateParticles(time, deltaTime) {
        if (!this.particles.system) return;
        
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.particles.velocities;
        
        // Update particle positions with sophisticated motion
        for (let i = 0; i < positions.length; i += 3) {
            const idx = i / 3;
            
            // Apply gentle orbital motion
            const orbitRadius = Math.sqrt(positions[i] * positions[i] + positions[i + 2] * positions[i + 2]);
            const angle = Math.atan2(positions[i + 2], positions[i]) + deltaTime * 0.1;
            
            positions[i] = orbitRadius * Math.cos(angle);
            positions[i + 2] = orbitRadius * Math.sin(angle);
            
            // Add vertical floating motion
            positions[i + 1] += Math.sin(time * 0.5 + idx * 0.01) * 0.02;
            
            // Mouse interaction effect
            const mouseInfluence = 0.1;
            positions[i] += this.mouse.x * mouseInfluence * Math.sin(time + idx);
            positions[i + 1] += this.mouse.y * mouseInfluence * Math.cos(time + idx);
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
        
        // Rotate entire particle system
        this.particles.system.rotation.y += 0.001;
        this.particles.system.rotation.x += 0.0005;
    }
    
    animateNeuralNetwork(time) {
        if (!this.neuralNetwork.group) return;
        
        // Pulse neural nodes
        this.neuralNetwork.nodes.forEach((node, i) => {
            const pulsePhase = time * 2 + node.userData.pulseOffset;
            const scale = 1 + Math.sin(pulsePhase) * 0.2;
            node.scale.setScalar(scale);
            
            // Vary opacity
            node.material.opacity = 0.5 + Math.sin(pulsePhase) * 0.3;
        });
        
        // Animate connection opacity
        this.neuralNetwork.connections.forEach((connection, i) => {
            const phase = time * 3 + i * 0.5;
            connection.material.opacity = 0.2 + Math.sin(phase) * 0.2;
        });
        
        // Gentle rotation
        this.neuralNetwork.group.rotation.y += 0.002;
    }
    
    animateCenterpiece(time) {
        if (!this.centerpiece.sphere) return;
        
        // Rotate central sphere
        this.centerpiece.sphere.rotation.y += 0.01;
        this.centerpiece.sphere.rotation.x += 0.005;
        
        // Pulse effect
        const pulse = 1 + Math.sin(time * 2) * 0.1;
        this.centerpiece.sphere.scale.setScalar(pulse);
        
        // Animate rings
        this.centerpiece.rings.forEach((ring, i) => {
            ring.rotation.z += (0.005 + i * 0.002);
            ring.rotation.x += 0.001;
            
            // Vary opacity
            const opacityPhase = time + i * Math.PI / 3;
            ring.material.opacity = 0.2 + Math.sin(opacityPhase) * 0.2;
        });
    }
    
    updateCamera(time) {
        // Gentle camera movement based on mouse
        const cameraOffset = {
            x: this.mouse.x * 10,
            y: this.mouse.y * 10
        };
        
        this.camera.position.x = 0 + cameraOffset.x;
        this.camera.position.y = 0 + cameraOffset.y;
        this.camera.lookAt(0, 0, 0);
        
        // Add subtle breathing motion
        this.camera.position.z = 100 + Math.sin(time * 0.5) * 5;
    }
    
    updatePerformanceStats() {
        this.performance.frameCount++;
        const now = performance.now();
        
        if (now >= this.performance.lastTime + 1000) {
            this.performance.fps = Math.round((this.performance.frameCount * 1000) / (now - this.performance.lastTime));
            this.performance.averageFPS = (this.performance.averageFPS + this.performance.fps) / 2;
            this.performance.frameCount = 0;
            this.performance.lastTime = now;
            
            if (this.config.debugMode) {
                console.log(`🏆 FPS: ${this.performance.fps}, Avg: ${Math.round(this.performance.averageFPS)}`);
            }
        }
    }
    
    getContainer() {
        let container = document.getElementById(this.config.containerId);
        if (!container) {
            container = this.createDefaultContainer();
        }
        return container;
    }
    
    createDefaultContainer() {
        const container = document.createElement('div');
        container.id = this.config.containerId;
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            z-index: 1;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }
    
    createFallbackVisualization() {
        console.log('🎨 Creating championship fallback visualization...');
        const container = this.getContainer();
        
        container.innerHTML = `
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0A192F 0%, #112240 50%, #002244 100%);
                overflow: hidden;
            ">
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 300px;
                    height: 300px;
                    border: 2px solid #BF5700;
                    border-radius: 50%;
                    animation: championship-pulse 3s ease-in-out infinite alternate;
                "></div>
                
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 200px;
                    height: 200px;
                    border: 1px solid #FFB81C;
                    border-radius: 50%;
                    animation: championship-pulse 2s ease-in-out infinite alternate-reverse;
                "></div>
            </div>
            
            <style>
                @keyframes championship-pulse {
                    0% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
                }
            </style>
        `;
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        console.log('🛑 Championship Three.js animation stopped');
    }
    
    destroy() {
        this.stop();
        
        const container = this.getContainer();
        if (container) {
            container.innerHTML = '';
        }
        
        // Cleanup Three.js objects
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        console.log('🧹 Championship Three.js system destroyed');
    }
}

// Initialize championship hero when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏆 Initializing Austin Humphrey Championship Three.js Hero');
    
    // Create the hero container if it doesn't exist
    let heroContainer = document.getElementById('three-hero-container');
    if (!heroContainer) {
        heroContainer = document.createElement('div');
        heroContainer.id = 'three-hero-container';
        heroContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            z-index: 1;
            pointer-events: none;
        `;
        
        // Insert before hero content
        const heroSection = document.querySelector('.hero-section') || document.body;
        heroSection.appendChild(heroContainer);
    }
    
    // Initialize the championship Three.js hero
    window.championshipHero = new ChampionshipThreeHero({
        containerId: 'three-hero-container',
        particleCount: 4000,
        enablePostProcessing: false, // Disabled for compatibility
        enableLighting: true,
        enableInteractivity: true,
        debugMode: false
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChampionshipThreeHero;
}