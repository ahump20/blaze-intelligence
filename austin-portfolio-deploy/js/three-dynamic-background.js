// Three.js Dynamic Background with WebGL Shaders
class ThreeDynamicBackground {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.animationId = null;
    this.time = 0;
    
    // Configuration
    this.config = {
      colors: {
        primary: '#BF5700',      // Burnt Orange Heritage
        secondary: '#9BCBEB',    // Cardinal Sky Blue
        accent: '#00B2A9',       // Vancouver Throwback Teal
        dark: '#002244'          // Tennessee Deep
      },
      animation: {
        speed: 0.5,
        amplitude: 2.0,
        frequency: 1.5
      },
      particles: {
        count: 1000,
        size: 2.0,
        speed: 1.0
      }
    };

    this.init();
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createGeometry();
    this.createMaterial();
    this.createMesh();
    this.addEventListeners();
    this.animate();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x001122, 100, 1000);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 50;
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container.querySelector('canvas') || undefined,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    if (!this.container.querySelector('canvas')) {
      this.container.appendChild(this.renderer.domElement);
    }
  }

  createGeometry() {
    // Create particle system geometry
    this.geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(this.config.particles.count * 3);
    const colors = new Float32Array(this.config.particles.count * 3);
    const sizes = new Float32Array(this.config.particles.count);

    for (let i = 0; i < this.config.particles.count; i++) {
      const i3 = i * 3;
      
      // Positions
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = (Math.random() - 0.5) * 200;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;
      
      // Colors - mix of brand colors
      const colorVariant = Math.floor(Math.random() * 4);
      const color = new THREE.Color();
      
      switch (colorVariant) {
        case 0:
          color.setHex(0xBF5700); // Burnt Orange
          break;
        case 1:
          color.setHex(0x9BCBEB); // Cardinal Blue
          break;
        case 2:
          color.setHex(0x00B2A9); // Teal
          break;
        default:
          color.setHex(0x002244); // Deep Navy
      }
      
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Sizes
      sizes[i] = Math.random() * this.config.particles.size + 0.5;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  }

  createMaterial() {
    // Custom shader material for dynamic effects
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        amplitude: { value: this.config.animation.amplitude },
        frequency: { value: this.config.animation.frequency },
        primaryColor: { value: new THREE.Color(this.config.colors.primary) },
        secondaryColor: { value: new THREE.Color(this.config.colors.secondary) }
      },
      vertexShader: `
        attribute float size;
        uniform float time;
        uniform float amplitude;
        uniform float frequency;
        
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Dynamic wave motion
          pos.x += sin(pos.y * frequency + time) * amplitude;
          pos.y += cos(pos.x * frequency + time) * amplitude * 0.5;
          pos.z += sin(pos.x * frequency + pos.y * frequency + time) * amplitude * 0.3;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 primaryColor;
        uniform vec3 secondaryColor;
        
        varying vec3 vColor;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          // Pulsing effect
          float pulse = sin(time * 3.0) * 0.3 + 0.7;
          
          // Color mixing based on position and time
          vec3 finalColor = mix(vColor, primaryColor, sin(time * 2.0) * 0.3 + 0.3);
          finalColor = mix(finalColor, secondaryColor, cos(time * 1.5) * 0.2 + 0.2);
          
          // Smooth circular gradient
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          alpha *= pulse;
          
          gl_FragColor = vec4(finalColor, alpha * 0.8);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    });
  }

  createMesh() {
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    this.time += 0.016 * this.config.animation.speed; // 60fps normalized
    
    // Update shader uniforms
    this.material.uniforms.time.value = this.time;
    
    // Rotate the entire particle system
    this.mesh.rotation.x += 0.0005;
    this.mesh.rotation.y += 0.001;
    
    // Camera movement for depth
    this.camera.position.x = Math.sin(this.time * 0.5) * 10;
    this.camera.position.y = Math.cos(this.time * 0.3) * 5;
    this.camera.lookAt(0, 0, 0);
    
    this.renderer.render(this.scene, this.camera);
  }

  addEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Mouse interaction
    this.container.addEventListener('mousemove', (event) => {
      const rect = this.container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * 2 - 1;
      const y = -(event.clientY - rect.top) / rect.height * 2 + 1;
      
      // Influence particle movement with mouse
      this.material.uniforms.amplitude.value = this.config.animation.amplitude + Math.abs(x) * 2;
      this.material.uniforms.frequency.value = this.config.animation.frequency + Math.abs(y) * 2;
    });

    // Performance optimization - pause when not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  pause() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resume() {
    if (!this.animationId) {
      this.animate();
    }
  }

  destroy() {
    this.pause();
    
    if (this.geometry) {
      this.geometry.dispose();
    }
    
    if (this.material) {
      this.material.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    
    window.removeEventListener('resize', this.onWindowResize);
  }

  // Public methods for external control
  updateColors(colors) {
    Object.assign(this.config.colors, colors);
    this.material.uniforms.primaryColor.value.setHex(colors.primary);
    this.material.uniforms.secondaryColor.value.setHex(colors.secondary);
  }

  updateAnimation(settings) {
    Object.assign(this.config.animation, settings);
    this.material.uniforms.amplitude.value = settings.amplitude;
    this.material.uniforms.frequency.value = settings.frequency;
  }

  setIntensity(intensity) {
    // Intensity from 0 to 1
    this.config.animation.speed = intensity * 2;
    this.material.uniforms.amplitude.value = this.config.animation.amplitude * (0.5 + intensity * 0.5);
  }
}

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize background for hero section
  const heroSection = document.querySelector('.hero-background, #hero-background, .three-background');
  if (heroSection) {
    window.blazeBackground = new ThreeDynamicBackground(heroSection.id || 'hero-background');
    
    // Integrate with existing AI consciousness updates
    if (window.updateAIConsciousness) {
      const originalUpdate = window.updateAIConsciousness;
      window.updateAIConsciousness = function(consciousness) {
        originalUpdate.call(this, consciousness);
        
        // Update background intensity based on AI consciousness
        if (window.blazeBackground) {
          const intensity = (consciousness - 80) / 20; // Map 80-100 to 0-1
          window.blazeBackground.setIntensity(Math.max(0, Math.min(1, intensity)));
        }
      };
    }
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThreeDynamicBackground;
}