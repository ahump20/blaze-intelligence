// GPU Feature Gate Loader - Progressive Enhancement for Blaze Intelligence
// Detects GPU capabilities and loads appropriate visual effects
// Austin Humphrey - Performance-first, accessibility-always

export const CAP = {
  webgpu: !!navigator.gpu,
  webgl2: !!document.createElement('canvas').getContext('webgl2'),
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

export async function initFx() {
  // Respect user's motion preferences
  if (CAP.reducedMotion) {
    console.log('[FX] Reduced motion preferred - visual effects disabled');
    return;
  }

  // Progressive enhancement based on GPU capabilities
  if (CAP.webgpu) {
    console.log('[FX] WebGPU detected - loading advanced shaders');
    await import('/js/fx-webgpu.js');
  } else if (CAP.webgl2) {
    console.log('[FX] WebGL2 detected - loading post-processing effects');
    await import('/js/fx-webgl2.js');
  } else {
    console.log('[FX] Using CSS/SVG fallback - no GPU acceleration');
  }

  // Always load base effects that work with CSS/SVG
  await Promise.all([
    import('/js/fx-specular.js').then(m => m.enableSpecularCards?.(document)),
    import('/js/fx-pressure.js').then(m => m.initPressureEffects?.())
  ]);
}

// Performance monitoring (dev mode)
if (window.location.hostname === 'localhost' || window.location.search.includes('debug')) {
  const samples = [];
  let last = performance.now();

  function measureFrame() {
    const now = performance.now();
    samples.push(now - last);
    last = now;

    if (samples.length === 120) {
      samples.sort((a, b) => a - b);
      const p95 = samples[Math.floor(0.95 * samples.length)];

      // Log performance metrics
      console.log(`[FX Performance] Frame p95: ${p95.toFixed(2)}ms`);

      // Warn if exceeding budget
      if (p95 > 4.5) {
        console.warn('[FX Performance] ⚠️ Exceeding 4.5ms budget!');
      }

      samples.length = 0;
    }

    requestAnimationFrame(measureFrame);
  }

  requestAnimationFrame(measureFrame);
}