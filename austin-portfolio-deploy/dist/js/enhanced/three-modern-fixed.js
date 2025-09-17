/**
 * Modern Three.js Initialization - Championship Visual System
 * By Austin Humphrey - Deep South Sports Authority
 * Fixes Three.js loading issues and provides smooth neural network visuals
 */

class ModernThreeManager {
    constructor() {
        this.scenes = new Map();
        this.renderers = new Map();
        this.isThreeLoaded = false;
        this.loadingPromise = null;
        
        console.log('🏆 Austin Humphrey Three.js Manager - Championship Visual System');
        this.initializeThree();
    }
    
    async initializeThree() {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }
        
        this.loadingPromise = this.loadThreeJS();
        return this.loadingPromise;
    }
    
    async loadThreeJS() {
        try {
            // Check if Three.js is already loaded
            if (window.THREE) {
                console.log('✅ Three.js already loaded');
                this.isThreeLoaded = true;
                return true;
            }
            
            // Try loading from CDN first
            console.log('📦 Loading Three.js from CDN...');
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
            
            if (window.THREE) {
                console.log('✅ Three.js loaded successfully from CDN');
                this.isThreeLoaded = true;
                this.initializeDefaultScenes();
                return true;
            }
            
            // Fallback: Try alternative CDN
            console.log('📦 Trying alternative Three.js CDN...');
            await this.loadScript('https://unpkg.com/three@0.128.0/build/three.min.js');
            
            if (window.THREE) {
                console.log('✅ Three.js loaded from alternative CDN');
                this.isThreeLoaded = true;
                this.initializeDefaultScenes();
                return true;
            }
            
            throw new Error('Failed to load Three.js from all CDN sources');
            
        } catch (error) {
            console.error('🚨 Failed to load Three.js:', error);
            this.isThreeLoaded = false;
            this.provideFallbackVisuals();
            return false;
        }
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
    
    async createScene(containerId, config = {}) {
        if (!this.isThreeLoaded) {
            console.warn('⚠️ Three.js not loaded, using fallback visuals');
            this.createFallbackScene(containerId, config);
            return null;
        }
        
        const container = document.getElementById(containerId) || document.querySelector(containerId);
        if (!container) {
            console.error(`🚨 Container ${containerId} not found`);
            return null;
        }
        
        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(
                config.fov || 75,
                container.clientWidth / container.clientHeight,
                config.near || 0.1,
                config.far || 1000
            );
            
            const renderer = new THREE.WebGLRenderer({
                antialias: config.antialias !== false,
                alpha: config.alpha !== false,
                powerPreference: "high-performance"
            });
            
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            
            // Clear existing content
            container.innerHTML = '';
            container.appendChild(renderer.domElement);
            
            // Store references
            const sceneData = {
                scene,
                camera,
                renderer,
                container,
                config,
                animationId: null,
                isRunning: false
            };
            
            this.scenes.set(containerId, sceneData);
            this.renderers.set(containerId, renderer);
            
            // Handle resize
            this.setupResize(containerId);
            
            console.log(`✅ Three.js scene created for ${containerId}`);
            return sceneData;
            
        } catch (error) {
            console.error(`🚨 Failed to create Three.js scene for ${containerId}:`, error);
            this.createFallbackScene(containerId, config);
            return null;
        }
    }
    
    setupResize(containerId) {
        const resizeObserver = new ResizeObserver(entries => {
            const sceneData = this.scenes.get(containerId);
            if (!sceneData) return;
            
            const { camera, renderer, container } = sceneData;
            const entry = entries[0];
            const { width, height } = entry.contentRect;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
        
        const sceneData = this.scenes.get(containerId);
        if (sceneData) {
            resizeObserver.observe(sceneData.container);
        }
    }
    
    createNeuralNetworkScene(containerId) {
        this.createScene(containerId, {
            fov: 75,
            antialias: true,
            alpha: true
        }).then(sceneData => {
            if (!sceneData) return;
            
            const { scene, camera, renderer } = sceneData;
            
            // Create neural network visualization
            this.createNeuralNetwork(scene);
            
            // Position camera
            camera.position.z = 5;
            
            // Animation loop
            const animate = () => {
                sceneData.animationId = requestAnimationFrame(animate);
                
                // Rotate network slowly
                scene.rotation.y += 0.005;
                scene.rotation.x += 0.002;
                
                renderer.render(scene, camera);
            };
            
            sceneData.isRunning = true;
            animate();
            
            console.log(`🧠 Neural network scene created for ${containerId}`);
        });
    }
    
    createNeuralNetwork(scene) {
        if (!window.THREE) return;
        
        // Create nodes
        const nodeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const nodeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xBF5700,
            transparent: true,
            opacity: 0.8 
        });
        
        const nodes = [];
        const layers = [8, 12, 10, 6]; // Neural network structure
        
        layers.forEach((nodeCount, layerIndex) => {
            const layerNodes = [];
            const layerZ = (layerIndex - layers.length / 2) * 2;
            
            for (let i = 0; i < nodeCount; i++) {
                const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
                const angle = (i / nodeCount) * Math.PI * 2;
                const radius = 1.5;
                
                node.position.x = Math.cos(angle) * radius;
                node.position.y = Math.sin(angle) * radius;
                node.position.z = layerZ;
                
                scene.add(node);
                layerNodes.push(node);
            }
            
            nodes.push(layerNodes);
        });
        
        // Create connections
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x64FFDA,
            transparent: true,
            opacity: 0.3 
        });
        
        for (let i = 0; i < nodes.length - 1; i++) {
            const currentLayer = nodes[i];
            const nextLayer = nodes[i + 1];
            
            currentLayer.forEach(node1 => {
                nextLayer.forEach(node2 => {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        node1.position,
                        node2.position
                    ]);
                    
                    const line = new THREE.Line(geometry, lineMaterial);
                    scene.add(line);
                });
            });
        }
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        
        // Add point light
        const pointLight = new THREE.PointLight(0xBF5700, 1, 100);
        pointLight.position.set(0, 0, 10);
        scene.add(pointLight);
    }
    
    createFallbackScene(containerId, config) {
        const container = document.getElementById(containerId) || document.querySelector(containerId);
        if (!container) return;
        
        console.log(`🎨 Creating fallback canvas for ${containerId}`);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        const resize = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        };
        
        resize();
        window.addEventListener('resize', resize);
        
        container.innerHTML = '';
        container.appendChild(canvas);
        
        // Animated neural network fallback
        this.animateFallbackNetwork(ctx, canvas);
    }
    
    animateFallbackNetwork(ctx, canvas) {
        let frame = 0;
        
        const animate = () => {
            frame++;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw animated neural network
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) * 0.3;
            
            // Draw nodes
            ctx.fillStyle = 'rgba(191, 87, 0, 0.8)';
            
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2 + frame * 0.01;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw connections
            ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)';
            ctx.lineWidth = 1;
            
            for (let i = 0; i < 12; i++) {
                const angle1 = (i / 12) * Math.PI * 2 + frame * 0.01;
                const angle2 = ((i + 1) / 12) * Math.PI * 2 + frame * 0.01;
                
                const x1 = centerX + Math.cos(angle1) * radius;
                const y1 = centerY + Math.sin(angle1) * radius;
                const x2 = centerX + Math.cos(angle2) * radius;
                const y2 = centerY + Math.sin(angle2) * radius;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            
            // Draw center pulse
            const pulseRadius = 20 + Math.sin(frame * 0.1) * 10;
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
            gradient.addColorStop(0, 'rgba(191, 87, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(191, 87, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
            ctx.fill();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    provideFallbackVisuals() {
        // Find all elements that expect Three.js and provide fallbacks
        const threeContainers = document.querySelectorAll('[data-three], .three-scene, #hero-canvas, #neural-network-canvas');
        
        threeContainers.forEach(container => {
            if (!container.innerHTML.trim()) {
                this.createFallbackScene(container.id || 'fallback-' + Date.now(), {});
            }
        });
    }
    
    initializeDefaultScenes() {
        // Initialize common Three.js scenes after loading
        setTimeout(() => {
            const heroCanvas = document.getElementById('hero-canvas');
            if (heroCanvas) {
                this.createNeuralNetworkScene('hero-canvas');
            }
            
            const neuralCanvas = document.getElementById('neural-network-canvas');
            if (neuralCanvas) {
                this.createNeuralNetworkScene('neural-network-canvas');
            }
        }, 100);
    }
    
    destroyScene(containerId) {
        const sceneData = this.scenes.get(containerId);
        if (sceneData) {
            if (sceneData.animationId) {
                cancelAnimationFrame(sceneData.animationId);
            }
            
            if (sceneData.renderer) {
                sceneData.renderer.dispose();
            }
            
            this.scenes.delete(containerId);
            this.renderers.delete(containerId);
            
            console.log(`🧹 Three.js scene destroyed for ${containerId}`);
        }
    }
    
    getScene(containerId) {
        return this.scenes.get(containerId);
    }
    
    isReady() {
        return this.isThreeLoaded;
    }
}

// Initialize global Three.js manager
window.threeManager = new ModernThreeManager();

// Auto-initialize common scenes when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for other scripts to load
        setTimeout(() => {
            if (window.threeManager.isReady()) {
                window.threeManager.initializeDefaultScenes();
            }
        }, 500);
    });
} else {
    setTimeout(() => {
        if (window.threeManager.isReady()) {
            window.threeManager.initializeDefaultScenes();
        }
    }, 500);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernThreeManager;
}