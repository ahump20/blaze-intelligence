/* Championship Three.js hero - Mobile Optimized
 * Usage: <canvas id="hero"></canvas>
 * <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
 * <script src="/assets/hero.js"></script>
 */
(() => {
  const c = document.getElementById('hero'); if(!c) return;
  
  // Mobile detection and performance settings
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  
  // Optimized renderer settings for mobile
  const renderer = new THREE.WebGLRenderer({ 
    canvas: c, 
    antialias: !isMobile, // Disable antialiasing on mobile for performance
    alpha: true,
    powerPreference: isMobile ? 'low-power' : 'high-performance'
  });
  
  // Performance optimizations
  renderer.setPixelRatio(pixelRatio);
  if (isMobile) {
    renderer.shadowMap.enabled = false;
    renderer.precision = 'mediump';
  }
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100); 
  camera.position.z = isMobile ? 5 : 4; // Pull back slightly on mobile
  
  // Simplified geometry for mobile
  const geoDetail = isMobile ? 1 : 3;
  const geo = new THREE.IcosahedronGeometry(2, geoDetail);
  
  const mat = new THREE.MeshStandardMaterial({ 
    color: 0xff8a2b, 
    metalness: .3, 
    roughness: .4, 
    wireframe: true, 
    opacity: isMobile ? .25 : .35, // Slightly more transparent on mobile
    transparent: true 
  });
  
  const mesh = new THREE.Mesh(geo, mat); 
  scene.add(mesh);
  
  // Simplified lighting for mobile
  const l1 = new THREE.PointLight(0xffb21a, isMobile ? 1.0 : 1.3); 
  l1.position.set(3,2,3); 
  scene.add(l1);
  
  const l2 = new THREE.PointLight(0x4aa3ff, isMobile ? 0.6 : 0.8); 
  l2.position.set(-3,-2,-3); 
  scene.add(l2);
  
  // Responsive resize with performance optimization
  const resize = () => {
    const w = c.clientWidth;
    const h = Math.max(260, c.clientHeight || window.innerHeight * (isMobile ? .35 : .45));
    
    // Optimize canvas resolution for mobile
    const canvasWidth = Math.floor(w * pixelRatio);
    const canvasHeight = Math.floor(h * pixelRatio);
    
    c.width = canvasWidth;
    c.height = canvasHeight;
    renderer.setSize(canvasWidth, canvasHeight, false);
    
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
  };
  
  // Performance-optimized animation loop
  const clock = new THREE.Clock();
  let frameCount = 0;
  const targetFPS = isMobile ? 30 : 60;
  const frameInterval = 1000 / targetFPS;
  let lastFrameTime = 0;
  
  const tick = (timestamp) => {
    // Frame rate limiting for mobile
    if (timestamp - lastFrameTime < frameInterval) {
      requestAnimationFrame(tick);
      return;
    }
    
    const t = clock.getElapsedTime();
    
    // Slightly slower rotation on mobile to save battery
    const rotSpeed = isMobile ? 0.1 : 0.15;
    mesh.rotation.x = t * rotSpeed;
    mesh.rotation.y = t * (rotSpeed * 0.67);
    
    renderer.render(scene, camera);
    lastFrameTime = timestamp;
    
    // Track frame rate for championship performance monitoring
    analytics.trackFrameRate();
    
    requestAnimationFrame(tick);
  };
  
  // Championship analytics for Three.js interactions
  const analytics = {
    startTime: Date.now(),
    interactions: 0,
    frameCount: 0,
    
    track: (event, data = {}) => {
      // Track championship-level Three.js performance
      if (window.blazeAnalytics) {
        window.blazeAnalytics.track(`hero_${event}`, {
          ...data,
          mobile: isMobile,
          pixelRatio,
          timestamp: Date.now(),
          sessionTime: Date.now() - analytics.startTime
        });
      }
      
      console.log(`🎯 Hero Analytics: ${event}`, data);
    },
    
    trackFrameRate: () => {
      analytics.frameCount++;
      if (analytics.frameCount % (targetFPS * 5) === 0) { // Every 5 seconds
        const avgFPS = analytics.frameCount / ((Date.now() - analytics.startTime) / 1000);
        analytics.track('performance_sample', {
          avgFPS: Math.round(avgFPS),
          targetFPS,
          frameCount: analytics.frameCount
        });
      }
    },
    
    trackInteraction: (type) => {
      analytics.interactions++;
      analytics.track('interaction', {
        type,
        totalInteractions: analytics.interactions
      });
    }
  };
  
  // Track initial load
  analytics.track('initialized', {
    canvasWidth: c.clientWidth,
    canvasHeight: c.clientHeight,
    isMobile,
    pixelRatio,
    targetFPS
  });

  // Intersection Observer for performance - pause when not visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        analytics.track('visible');
        tick();
      } else {
        analytics.track('hidden');
      }
    });
  }, { threshold: 0.1 });
  
  observer.observe(c);
  
  // Optimized resize listener with debouncing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
  }, {passive: true});
  
  // Championship interaction tracking
  let mouseX = 0, mouseY = 0;
  
  // Mouse interaction tracking
  c.addEventListener('mouseenter', () => analytics.trackInteraction('mouse_enter'));
  c.addEventListener('mouseleave', () => analytics.trackInteraction('mouse_leave'));
  c.addEventListener('mousemove', (e) => {
    const rect = c.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Subtle interaction effect - adjust lighting based on mouse
    if (l1) {
      l1.position.x = 3 + mouseX * 0.5;
      l1.position.y = 2 + mouseY * 0.5;
    }
    
    // Track significant mouse movements (throttled)
    if (Math.random() < 0.01) { // 1% sample rate
      analytics.trackInteraction('mouse_move');
    }
  });
  
  // Touch interaction tracking for mobile
  c.addEventListener('touchstart', () => analytics.trackInteraction('touch_start'));
  c.addEventListener('touchend', () => analytics.trackInteraction('touch_end'));
  c.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = c.getBoundingClientRect();
      mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Apply same lighting effect for touch
      if (l1) {
        l1.position.x = 3 + mouseX * 0.3; // Slightly less sensitive on mobile
        l1.position.y = 2 + mouseY * 0.3;
      }
    }
  });
  
  // Click/tap tracking
  c.addEventListener('click', () => {
    analytics.trackInteraction('click');
    
    // Easter egg: Championship pulse effect on click
    if (mesh.material) {
      const originalOpacity = mesh.material.opacity;
      mesh.material.opacity = 0.8;
      setTimeout(() => {
        if (mesh.material) {
          mesh.material.opacity = originalOpacity;
        }
      }, 200);
    }
  });
  
  // Performance degradation tracking
  let performanceWarnings = 0;
  const trackPerformance = () => {
    const avgFPS = analytics.frameCount / ((Date.now() - analytics.startTime) / 1000);
    
    if (avgFPS < targetFPS * 0.6 && performanceWarnings < 3) {
      performanceWarnings++;
      analytics.track('performance_degradation', {
        avgFPS: Math.round(avgFPS),
        targetFPS,
        warning: performanceWarnings
      });
      
      // Auto-optimize for mobile if performance is poor
      if (isMobile && avgFPS < 20) {
        mesh.material.wireframe = false; // Reduce complexity
        analytics.track('auto_optimization', { action: 'disable_wireframe' });
      }
    }
  };
  
  // Check performance every 10 seconds
  setInterval(trackPerformance, 10000);

  // Pause animation on page visibility change for battery saving
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      analytics.track('page_hidden');
      renderer.setAnimationLoop(null);
    } else {
      analytics.track('page_visible');
      tick();
    }
  });
  
  resize();
  tick();
})();