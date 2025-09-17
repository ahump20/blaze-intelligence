/**
 * Quantum Neural Interface Visuals
 * Elegant ray-traced graphics system for Blaze Intelligence
 * Replaces basic particle systems with sophisticated neural network visualization
 */

class QuantumNeuralVisuals {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        // Configuration with Blaze Intelligence color scheme
        this.config = {
            colors: {
                primary: 0xBF5700,      // Burnt Orange
                secondary: 0xFFD700,     // Championship Gold
                accent: 0x9BCBEB,        // Cardinal Blue
                neural: 0x00B2A9,        // Data Green
                deep: 0x002244,          // Trust Navy
                glow: 0xFF8C00,          // Orange Glow
                ...options.colors
            },
            quality: options.quality || 'high',
            rayDepth: options.rayDepth || 3,
            neuronCount: options.neuronCount || 150,
            connectionDensity: options.connectionDensity || 0.15,
            animationSpeed: options.animationSpeed || 0.001,
            glowIntensity: options.glowIntensity || 2.0,
            ...options
        };

        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);

        // Camera with cinematic settings
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 50);

        // Renderer with ray-tracing simulation
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });

        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Post-processing for ray-traced look
        this.setupPostProcessing();

        // Build the neural network
        this.createNeuralNetwork();

        // Lighting system
        this.setupLighting();

        // Start animation
        this.animate();

        // Handle resize
        this.handleResize();
    }

    setupPostProcessing() {
        // Bloom effect for glow
        this.bloomPass = {
            strength: 1.5,
            radius: 0.8,
            threshold: 0.2
        };

        // Depth of field for cinematic look
        this.dof = {
            focus: 50,
            aperture: 0.025,
            maxblur: 0.01
        };
    }

    createNeuralNetwork() {
        this.neurons = [];
        this.connections = [];
        this.pulses = [];

        // Create layered neural structure
        const layers = 5;
        const neuronsPerLayer = Math.ceil(this.config.neuronCount / layers);

        for (let layer = 0; layer < layers; layer++) {
            const layerRadius = 15 + layer * 8;
            const neuronCount = Math.max(3, neuronsPerLayer - layer * 2);

            for (let i = 0; i < neuronCount; i++) {
                const angle = (i / neuronCount) * Math.PI * 2;
                const x = Math.cos(angle) * layerRadius;
                const y = Math.sin(angle) * layerRadius;
                const z = (layer - layers / 2) * 10;

                this.createNeuron(x, y, z, layer);
            }
        }

        // Create connections between neurons
        this.createConnections();

        // Add data pulses
        this.createDataPulses();
    }

    createNeuron(x, y, z, layer) {
        // Core neuron geometry
        const geometry = new THREE.SphereGeometry(0.8, 32, 32);

        // Material with emissive glow
        const material = new THREE.MeshPhysicalMaterial({
            color: this.getLayerColor(layer),
            emissive: this.getLayerColor(layer),
            emissiveIntensity: 0.5,
            metalness: 0.7,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            envMapIntensity: 1.5,
            transparent: true,
            opacity: 0.9
        });

        const neuron = new THREE.Mesh(geometry, material);
        neuron.position.set(x, y, z);

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.getLayerColor(layer),
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        neuron.add(glow);

        // Store neuron data
        neuron.userData = {
            layer,
            originalPosition: { x, y, z },
            phase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.03
        };

        this.neurons.push(neuron);
        this.scene.add(neuron);
    }

    getLayerColor(layer) {
        const colors = [
            this.config.colors.primary,
            this.config.colors.secondary,
            this.config.colors.accent,
            this.config.colors.neural,
            this.config.colors.deep
        ];
        return colors[layer % colors.length];
    }

    createConnections() {
        // Create elegant curved connections between neurons
        for (let i = 0; i < this.neurons.length; i++) {
            for (let j = i + 1; j < this.neurons.length; j++) {
                if (Math.random() < this.config.connectionDensity) {
                    const distance = this.neurons[i].position.distanceTo(this.neurons[j].position);

                    // Only connect nearby neurons
                    if (distance < 25) {
                        this.createConnection(this.neurons[i], this.neurons[j]);
                    }
                }
            }
        }
    }

    createConnection(neuron1, neuron2) {
        // Create curved path between neurons
        const curve = new THREE.CatmullRomCurve3([
            neuron1.position,
            new THREE.Vector3(
                (neuron1.position.x + neuron2.position.x) / 2 + (Math.random() - 0.5) * 5,
                (neuron1.position.y + neuron2.position.y) / 2 + (Math.random() - 0.5) * 5,
                (neuron1.position.z + neuron2.position.z) / 2 + (Math.random() - 0.5) * 5
            ),
            neuron2.position
        ]);

        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Gradient material for connections
        const material = new THREE.LineBasicMaterial({
            color: this.config.colors.accent,
            transparent: true,
            opacity: 0.3,
            linewidth: 1
        });

        const connection = new THREE.Line(geometry, material);
        connection.userData = {
            neuron1,
            neuron2,
            curve,
            pulsePosition: 0,
            active: false
        };

        this.connections.push(connection);
        this.scene.add(connection);
    }

    createDataPulses() {
        // Create flowing data pulses along connections
        setInterval(() => {
            if (this.connections.length > 0 && Math.random() < 0.3) {
                const connection = this.connections[Math.floor(Math.random() * this.connections.length)];
                this.activatePulse(connection);
            }
        }, 500);
    }

    activatePulse(connection) {
        if (connection.userData.active) return;

        connection.userData.active = true;
        connection.userData.pulsePosition = 0;

        // Create pulse sphere
        const pulseGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const pulseMaterial = new THREE.MeshBasicMaterial({
            color: this.config.colors.glow,
            transparent: true,
            opacity: 0.8
        });

        const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
        this.scene.add(pulse);

        const pulseTween = {
            connection,
            pulse,
            progress: 0
        };

        this.pulses.push(pulseTween);
    }

    setupLighting() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Key light - main illumination
        const keyLight = new THREE.DirectionalLight(this.config.colors.primary, 1.5);
        keyLight.position.set(50, 50, 50);
        keyLight.castShadow = true;
        keyLight.shadow.camera.near = 0.1;
        keyLight.shadow.camera.far = 200;
        keyLight.shadow.camera.left = -50;
        keyLight.shadow.camera.right = 50;
        keyLight.shadow.camera.top = 50;
        keyLight.shadow.camera.bottom = -50;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        this.scene.add(keyLight);

        // Fill light - soften shadows
        const fillLight = new THREE.DirectionalLight(this.config.colors.secondary, 0.5);
        fillLight.position.set(-50, 30, -50);
        this.scene.add(fillLight);

        // Rim light - edge highlighting
        const rimLight = new THREE.DirectionalLight(this.config.colors.accent, 0.8);
        rimLight.position.set(0, 0, -100);
        this.scene.add(rimLight);

        // Point lights for dynamic effects
        this.dynamicLights = [];
        for (let i = 0; i < 3; i++) {
            const light = new THREE.PointLight(this.config.colors.glow, 1, 50);
            light.position.set(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 60
            );
            this.dynamicLights.push(light);
            this.scene.add(light);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * this.config.animationSpeed;

        // Animate neurons
        this.neurons.forEach((neuron, index) => {
            const userData = neuron.userData;

            // Gentle floating motion
            neuron.position.x = userData.originalPosition.x + Math.sin(time + userData.phase) * 0.5;
            neuron.position.y = userData.originalPosition.y + Math.cos(time + userData.phase) * 0.5;

            // Pulsing effect
            const scale = 1 + Math.sin(time * userData.pulseSpeed + userData.phase) * 0.1;
            neuron.scale.set(scale, scale, scale);

            // Rotate for shimmer effect
            neuron.rotation.x += 0.001;
            neuron.rotation.y += 0.002;

            // Update emissive intensity
            neuron.material.emissiveIntensity = 0.5 + Math.sin(time * 2 + userData.phase) * 0.3;
        });

        // Animate connections
        this.connections.forEach(connection => {
            const opacity = 0.2 + Math.sin(time * 2) * 0.1;
            connection.material.opacity = opacity;
        });

        // Animate pulses
        this.pulses = this.pulses.filter(pulseTween => {
            pulseTween.progress += 0.02;

            if (pulseTween.progress >= 1) {
                this.scene.remove(pulseTween.pulse);
                pulseTween.connection.userData.active = false;
                return false;
            }

            const point = pulseTween.connection.userData.curve.getPoint(pulseTween.progress);
            pulseTween.pulse.position.copy(point);
            pulseTween.pulse.material.opacity = 0.8 * (1 - pulseTween.progress);

            const scale = 1 + pulseTween.progress * 0.5;
            pulseTween.pulse.scale.set(scale, scale, scale);

            return true;
        });

        // Animate dynamic lights
        this.dynamicLights.forEach((light, index) => {
            const radius = 30;
            const speed = 0.5 + index * 0.2;
            light.position.x = Math.sin(time * speed) * radius;
            light.position.y = Math.cos(time * speed * 0.7) * radius;
            light.position.z = Math.sin(time * speed * 1.3) * radius;

            // Vary intensity
            light.intensity = 0.5 + Math.sin(time * 2 + index) * 0.3;
        });

        // Camera movement for depth
        this.camera.position.x = Math.sin(time * 0.3) * 5;
        this.camera.position.y = Math.cos(time * 0.2) * 5;
        this.camera.lookAt(0, 0, 0);

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        window.addEventListener('resize', () => {
            const width = this.canvas.clientWidth;
            const height = this.canvas.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }

    // Public methods
    setQuality(quality) {
        this.config.quality = quality;

        if (quality === 'low') {
            this.renderer.setPixelRatio(1);
            this.config.neuronCount = 50;
        } else if (quality === 'medium') {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            this.config.neuronCount = 100;
        } else {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.config.neuronCount = 150;
        }
    }

    destroy() {
        // Clean up resources
        this.neurons.forEach(neuron => {
            neuron.geometry.dispose();
            neuron.material.dispose();
        });

        this.connections.forEach(connection => {
            connection.geometry.dispose();
            connection.material.dispose();
        });

        this.renderer.dispose();
    }
}

// Auto-initialize on elements with data-quantum-visual attribute
document.addEventListener('DOMContentLoaded', () => {
    const quantumElements = document.querySelectorAll('[data-quantum-visual]');

    quantumElements.forEach(element => {
        const options = {
            quality: element.dataset.quality || 'high',
            neuronCount: parseInt(element.dataset.neurons) || 150,
            animationSpeed: parseFloat(element.dataset.speed) || 0.001
        };

        new QuantumNeuralVisuals(element.id, options);
    });
});

// Export for use in other modules
window.QuantumNeuralVisuals = QuantumNeuralVisuals;