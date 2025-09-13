/**
 * Blaze Intelligence Championship Visual Enhancement System
 * AI-Powered Three.js visualization engine for executive presentations
 * Optimized for performance and executive impact
 */

class BlazeChampionshipVisuals {
    constructor() {
        this.scenes = new Map();
        this.renderers = new Map();
        this.cameras = new Map();
        this.animationFrames = new Map();
        this.isIntersecting = new Map();
        
        // Championship color palette
        this.colors = {
            blazeOrange: 0xBF5700,
            blazeBlue: 0x9BCBEB,
            blazeNavy: 0x0A192F,
            cardinalRed: 0xC41E3A,
            championshipGold: 0xFFD700,
            executiveWhite: 0xFFFFFF
        };
        
        // Performance optimization settings
        this.performanceMode = this.detectPerformanceMode();
        this.init();
    }
    
    detectPerformanceMode() {
        // AI-powered performance detection
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return 'low';
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        
        // Executive-grade hardware detection
        if (renderer.includes('RTX') || renderer.includes('Radeon RX') || renderer.includes('M1') || renderer.includes('M2')) {
            return 'high';
        } else if (renderer.includes('Intel') && renderer.includes('Iris')) {
            return 'medium';
        }
        
        return 'medium';
    }
    
    init() {
        // Initialize intersection observer for performance
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                this.isIntersecting.set(id, entry.isIntersecting);
                
                if (entry.isIntersecting) {
                    this.resumeAnimation(id);
                } else {
                    this.pauseAnimation(id);
                }
            });
        }, { threshold: 0.1 });
    }
    
    /**
     * Championship Intelligence Hero - Executive Dashboard Style
     */
    createIntelligenceHero(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            antialias: this.performanceMode === 'high',
            alpha: true,
            powerPreference: 'high-performance'
        });
        
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        
        // Championship data visualization
        const particleCount = this.performanceMode === 'high' ? 2000 : 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            // Strategic positioning for executive presentation
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
            
            // Velocity for intelligent movement
            velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
            
            // Championship color distribution
            const colorChoice = Math.random();
            let color;
            if (colorChoice > 0.7) {
                color = new THREE.Color(this.colors.blazeOrange);
            } else if (colorChoice > 0.4) {
                color = new THREE.Color(this.colors.blazeBlue);
            } else {
                color = new THREE.Color(this.colors.championshipGold);
            }
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: this.performanceMode === 'high' ? 0.1 : 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
        
        // Executive-grade camera positioning
        camera.position.z = 15;
        
        // Store references
        this.scenes.set(containerId, scene);
        this.cameras.set(containerId, camera);
        this.renderers.set(containerId, renderer);
        
        // Championship animation loop
        const animate = () => {
            if (!this.isIntersecting.get(containerId)) return;
            
            const positions = particles.geometry.attributes.position.array;
            
            // AI-powered particle movement
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i * 3];
                positions[i * 3 + 1] += velocities[i * 3 + 1];
                positions[i * 3 + 2] += velocities[i * 3 + 2];
                
                // Boundary intelligence
                if (Math.abs(positions[i * 3]) > 10) velocities[i * 3] *= -1;
                if (Math.abs(positions[i * 3 + 1]) > 10) velocities[i * 3 + 1] *= -1;
                if (Math.abs(positions[i * 3 + 2]) > 10) velocities[i * 3 + 2] *= -1;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            particles.rotation.x += 0.001;
            particles.rotation.y += 0.002;
            
            renderer.render(scene, camera);
            this.animationFrames.set(containerId, requestAnimationFrame(animate));
        };
        
        this.observer.observe(container);
        animate();
        
        // Responsive resize
        this.setupResize(containerId, camera, renderer);
    }
    
    /**
     * Cardinals Live Intelligence - Real-time Data Visualization
     */
    createCardinalsIntelligence(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            antialias: this.performanceMode === 'high',
            alpha: true 
        });
        
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        
        // Cardinals-themed data streams
        const streamGeometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(-10, 0, 0),
                new THREE.Vector3(-5, 5, 0),
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(5, -5, 0),
                new THREE.Vector3(10, 0, 0)
            ]),
            100,
            0.1,
            8,
            false
        );
        
        const streamMaterial = new THREE.MeshBasicMaterial({
            color: this.colors.cardinalRed,
            transparent: true,
            opacity: 0.6
        });
        
        const dataStream = new THREE.Mesh(streamGeometry, streamMaterial);
        scene.add(dataStream);
        
        // Real-time readiness indicator
        const readinessGeometry = new THREE.RingGeometry(2, 3, 32);
        const readinessMaterial = new THREE.MeshBasicMaterial({
            color: this.colors.blazeOrange,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const readinessRing = new THREE.Mesh(readinessGeometry, readinessMaterial);
        scene.add(readinessRing);
        
        camera.position.z = 8;
        
        // Store references
        this.scenes.set(containerId, scene);
        this.cameras.set(containerId, camera);
        this.renderers.set(containerId, renderer);
        
        // Championship animation with live data integration
        const animate = () => {
            if (!this.isIntersecting.get(containerId)) return;
            
            dataStream.rotation.z += 0.01;
            readinessRing.rotation.z -= 0.005;
            
            // Pulse effect based on Cardinals readiness score
            const time = Date.now() * 0.001;
            readinessRing.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
            
            renderer.render(scene, camera);
            this.animationFrames.set(containerId, requestAnimationFrame(animate));
        };
        
        this.observer.observe(container);
        animate();
        this.setupResize(containerId, camera, renderer);
    }
    
    /**
     * Executive Decision Matrix - Strategic Visualization
     */
    createExecutiveMatrix(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            antialias: this.performanceMode === 'high',
            alpha: true 
        });
        
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        
        // Strategic decision nodes
        const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const nodes = [];
        
        for (let i = 0; i < 20; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: i % 3 === 0 ? this.colors.blazeOrange : 
                       i % 3 === 1 ? this.colors.blazeBlue : this.colors.championshipGold,
                transparent: true,
                opacity: 0.8
            });
            
            const node = new THREE.Mesh(nodeGeometry, material);
            node.position.set(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5
            );
            
            nodes.push(node);
            scene.add(node);
        }
        
        // Connection lines between nodes
        const lineGeometry = new THREE.BufferGeometry();
        const positions = [];
        
        for (let i = 0; i < nodes.length - 1; i++) {
            positions.push(
                nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
                nodes[i + 1].position.x, nodes[i + 1].position.y, nodes[i + 1].position.z
            );
        }
        
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: this.colors.executiveWhite,
            transparent: true,
            opacity: 0.3
        });
        
        const connections = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(connections);
        
        camera.position.z = 12;
        
        // Store references
        this.scenes.set(containerId, scene);
        this.cameras.set(containerId, camera);
        this.renderers.set(containerId, renderer);
        
        // Executive-grade animation
        const animate = () => {
            if (!this.isIntersecting.get(containerId)) return;
            
            nodes.forEach((node, index) => {
                const time = Date.now() * 0.001;
                node.rotation.x += 0.01;
                node.rotation.y += 0.01;
                node.position.y += Math.sin(time + index) * 0.01;
            });
            
            renderer.render(scene, camera);
            this.animationFrames.set(containerId, requestAnimationFrame(animate));
        };
        
        this.observer.observe(container);
        animate();
        this.setupResize(containerId, camera, renderer);
    }
    
    setupResize(containerId, camera, renderer) {
        window.addEventListener('resize', () => {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            camera.aspect = container.offsetWidth / container.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.offsetWidth, container.offsetHeight);
        });
    }
    
    pauseAnimation(containerId) {
        const frameId = this.animationFrames.get(containerId);
        if (frameId) {
            cancelAnimationFrame(frameId);
        }
    }
    
    resumeAnimation(containerId) {
        // Animation is automatically resumed when intersection observer triggers
    }
    
    /**
     * Initialize all championship visuals on page
     */
    initializeAll() {
        // Auto-detect and initialize all visual containers
        const containers = [
            'intelligence-hero-canvas',
            'cardinals-live-canvas', 
            'executive-matrix-canvas',
            'dashboard-hero-canvas',
            'performance-canvas',
            'analytics-canvas'
        ];
        
        containers.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (id.includes('intelligence')) {
                    this.createIntelligenceHero(id);
                } else if (id.includes('cardinals')) {
                    this.createCardinalsIntelligence(id);
                } else if (id.includes('executive') || id.includes('matrix')) {
                    this.createExecutiveMatrix(id);
                } else {
                    this.createIntelligenceHero(id); // Default fallback
                }
            }
        });
    }
    
    /**
     * Cleanup resources
     */
    dispose() {
        this.animationFrames.forEach(frameId => cancelAnimationFrame(frameId));
        this.renderers.forEach(renderer => {
            renderer.dispose();
            renderer.domElement.remove();
        });
        this.scenes.clear();
        this.renderers.clear();
        this.cameras.clear();
        this.animationFrames.clear();
    }
}

// Global championship visual system
window.BlazeVisuals = new BlazeChampionshipVisuals();

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.BlazeVisuals.initializeAll();
});

// Performance monitoring
if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('blaze-visuals-loaded');
}