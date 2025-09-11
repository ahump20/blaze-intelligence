/**
 * Texas Legacy Advanced Visual System
 * Championship-Grade Three.js Background with Texas Football Authority
 * Built for Blaze Intelligence - Where Friday Night Lights Meet Championship Analytics
 */

class TexasLegacyAdvancedSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        
        // Texas Legacy Color Palette
        this.colors = {
            burntOrange: 0xBF5700,
            cardinalSky: 0x9BCBEB,
            oilerNavy: 0x002244,
            grizzlyTeal: 0x00B2A9,
            platinum: 0xE5E4E2,
            graphite: 0x36454F,
            pearl: 0xFAFAFA
        };
        
        // Championship Visual Elements
        this.particles = [];
        this.footballTrails = [];
        this.lightSystems = [];
        this.championshipRings = [];
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.createChampionshipBackground();
        this.createFridayNightLights();
        this.createFootballParticles();
        this.createChampionshipRings();
        this.setupAdvancedLighting();
        this.startAnimation();
        this.setupResponsiveHandling();
    }
    
    setupScene() {
        // Get canvas element
        this.canvas = document.getElementById('three-canvas');
        if (!this.canvas) {
            console.warn('Three.js canvas not found');
            return;
        }
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(this.colors.oilerNavy, 0.0008);
        
        // Camera setup - Championship perspective
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            2000
        );
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer setup - Executive grade
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Championship gradient background
        this.renderer.setClearColor(this.colors.oilerNavy, 0.8);
    }
    
    createChampionshipBackground() {
        // Dynamic gradient geometry
        const geometry = new THREE.PlaneGeometry(2000, 1200);
        
        // Texas Legacy shader material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                burntOrange: { value: new THREE.Color(this.colors.burntOrange) },
                oilerNavy: { value: new THREE.Color(this.colors.oilerNavy) },
                cardinalSky: { value: new THREE.Color(this.colors.cardinalSky) },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 burntOrange;
                uniform vec3 oilerNavy;
                uniform vec3 cardinalSky;
                uniform vec2 resolution;
                varying vec2 vUv;
                
                void main() {
                    vec2 st = vUv;
                    
                    // Championship wave pattern
                    float wave = sin(st.x * 3.0 + time * 0.5) * 0.1;
                    float gradient = st.y + wave;
                    
                    // Texas Legacy color mixing
                    vec3 color1 = mix(oilerNavy, burntOrange, gradient * 0.3);
                    vec3 color2 = mix(color1, cardinalSky, sin(time * 0.2) * 0.1 + 0.05);
                    
                    // Friday Night Lights glow
                    float glow = smoothstep(0.0, 1.0, 1.0 - distance(st, vec2(0.5, 0.8)));
                    color2 = mix(color2, burntOrange, glow * 0.2);
                    
                    gl_FragColor = vec4(color2, 0.9);
                }
            `,
            transparent: true
        });
        
        const backgroundMesh = new THREE.Mesh(geometry, material);
        backgroundMesh.position.z = -500;
        this.scene.add(backgroundMesh);
        
        this.backgroundMaterial = material;
    }
    
    createFridayNightLights() {
        // Stadium light towers
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 400;
            
            const light = new THREE.SpotLight(
                this.colors.pearl, 
                2.0, 
                1000, 
                Math.PI / 6, 
                0.5
            );
            
            light.position.set(
                Math.cos(angle) * radius,
                150 + Math.sin(i * 0.5) * 50,
                Math.sin(angle) * radius
            );
            
            light.target.position.set(0, 0, 0);
            light.castShadow = true;
            light.shadow.mapSize.width = 2048;
            light.shadow.mapSize.height = 2048;
            
            this.scene.add(light);
            this.scene.add(light.target);
            this.lightSystems.push(light);
        }
        
        // Championship field lighting
        const fieldLight = new THREE.DirectionalLight(this.colors.cardinalSky, 1.5);
        fieldLight.position.set(0, 200, 100);
        fieldLight.castShadow = true;
        this.scene.add(fieldLight);
    }
    
    createFootballParticles() {
        const particleCount = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        // Texas Legacy particle colors
        const particleColors = [
            new THREE.Color(this.colors.burntOrange),
            new THREE.Color(this.colors.cardinalSky),
            new THREE.Color(this.colors.grizzlyTeal),
            new THREE.Color(this.colors.platinum)
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Championship field distribution
            positions[i3] = (Math.random() - 0.5) * 1200;
            positions[i3 + 1] = Math.random() * 300 - 50;
            positions[i3 + 2] = (Math.random() - 0.5) * 800;
            
            // Dynamic Texas Legacy colors
            const color = particleColors[Math.floor(Math.random() * particleColors.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Championship particle sizes
            sizes[i] = Math.random() * 3 + 1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                attribute float size;
                uniform float time;
                uniform float pixelRatio;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // Championship particle movement
                    mvPosition.y += sin(time + position.x * 0.01) * 10.0;
                    mvPosition.x += cos(time * 0.5 + position.z * 0.01) * 5.0;
                    
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float distance = length(center);
                    
                    if (distance > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
                    gl_FragColor = vec4(vColor, alpha * 0.8);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        this.particleSystem = { geometry, material };
    }
    
    createChampionshipRings() {
        // Texas championship ring formations
        for (let ring = 0; ring < 3; ring++) {
            const ringGeometry = new THREE.RingGeometry(
                50 + ring * 80, 
                60 + ring * 80, 
                32
            );
            
            const ringMaterial = new THREE.MeshPhongMaterial({
                color: ring % 2 === 0 ? this.colors.burntOrange : this.colors.cardinalSky,
                transparent: true,
                opacity: 0.1 + ring * 0.05,
                side: THREE.DoubleSide
            });
            
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.position.y = -20 + ring * 15;
            ringMesh.rotation.x = -Math.PI / 2 + ring * 0.1;
            
            this.scene.add(ringMesh);
            this.championshipRings.push(ringMesh);
        }
    }
    
    setupAdvancedLighting() {
        // Executive ambient lighting
        const ambientLight = new THREE.AmbientLight(this.colors.cardinalSky, 0.4);
        this.scene.add(ambientLight);
        
        // Championship rim lighting
        const rimLight = new THREE.DirectionalLight(this.colors.burntOrange, 0.8);
        rimLight.position.set(-100, 100, -100);
        this.scene.add(rimLight);
        
        // Stadium atmosphere
        const hemisphereLight = new THREE.HemisphereLight(
            this.colors.cardinalSky, 
            this.colors.oilerNavy, 
            0.6
        );
        this.scene.add(hemisphereLight);
    }
    
    startAnimation() {
        const animate = (timestamp) => {
            const time = timestamp * 0.001;
            
            // Update background shader
            if (this.backgroundMaterial) {
                this.backgroundMaterial.uniforms.time.value = time;
            }
            
            // Update particle system
            if (this.particleSystem) {
                this.particleSystem.material.uniforms.time.value = time;
            }
            
            // Animate championship rings
            this.championshipRings.forEach((ring, index) => {
                ring.rotation.z = time * 0.2 * (index % 2 === 0 ? 1 : -1);
                ring.material.opacity = 0.1 + Math.sin(time + index) * 0.05;
            });
            
            // Animate Friday Night Lights
            this.lightSystems.forEach((light, index) => {
                const intensity = 1.5 + Math.sin(time * 2 + index) * 0.5;
                light.intensity = Math.max(0.8, intensity);
            });
            
            // Camera subtle movement
            this.camera.position.y = 50 + Math.sin(time * 0.5) * 10;
            this.camera.lookAt(0, Math.sin(time * 0.3) * 5, 0);
            
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(animate);
        };
        
        animate(0);
    }
    
    setupResponsiveHandling() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            
            if (this.backgroundMaterial) {
                this.backgroundMaterial.uniforms.resolution.value.set(
                    window.innerWidth, 
                    window.innerHeight
                );
            }
        });
        
        // Performance optimization
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.renderer.setAnimationLoop(null);
            } else {
                this.startAnimation();
            }
        });
    }
    
    // Championship interaction methods
    triggerVictoryEffect() {
        this.championshipRings.forEach((ring, index) => {
            ring.material.opacity = 0.5;
            ring.material.color.setHex(this.colors.burntOrange);
        });
        
        setTimeout(() => {
            this.championshipRings.forEach((ring) => {
                ring.material.opacity = 0.1;
            });
        }, 2000);
    }
    
    updateSeasonMode(season = 'regular') {
        const seasonColors = {
            regular: this.colors.cardinalSky,
            playoffs: this.colors.burntOrange,
            championship: this.colors.pearl
        };
        
        if (this.backgroundMaterial && seasonColors[season]) {
            this.backgroundMaterial.uniforms.cardinalSky.value.setHex(seasonColors[season]);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.texasLegacySystem = new TexasLegacyAdvancedSystem();
    
    // Championship interaction events
    document.addEventListener('championship-mode', () => {
        window.texasLegacySystem.triggerVictoryEffect();
    });
    
    // Season mode updates
    document.addEventListener('season-update', (event) => {
        window.texasLegacySystem.updateSeasonMode(event.detail.season);
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TexasLegacyAdvancedSystem;
}