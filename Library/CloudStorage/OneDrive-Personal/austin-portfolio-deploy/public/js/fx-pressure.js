// Pressure Glow Visualization - Canvas-based ambient effects
// Austin Humphrey - From Memphis pressure to visual poetry

export function renderPressureGlow(canvas, points /* [x,y,intensity] */) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // First pass: Draw glowing points
  ctx.globalCompositeOperation = 'source-over';

  for (const [x, y, intensity] of points) {
    const radius = Math.max(20, Math.min(140, intensity * 120));

    // Create radial gradient for glow effect
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    // Texas-inspired color palette
    gradient.addColorStop(0, `rgba(255, 255, 255, ${0.12 * intensity})`);
    gradient.addColorStop(0.4, `rgba(191, 87, 0, ${0.10 * intensity})`);  // Burnt orange
    gradient.addColorStop(0.7, `rgba(155, 203, 235, ${0.08 * intensity})`); // Cardinal blue
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Second pass: Add subtle occlusion
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
}

export function initPressureEffects() {
  const canvas = document.getElementById('pressureFx');
  if (!canvas) {
    console.log('[FX] No pressure canvas found');
    return;
  }

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('[FX] Pressure effects disabled (reduced motion)');
    return;
  }

  console.log('[FX] Initializing pressure glow effects');

  // Animation state
  let animationId = null;
  let time = 0;

  function animate() {
    time += 0.016; // ~60fps

    // Generate dynamic pressure points
    const points = [];
    for (let i = 0; i < 6; i++) {
      const x = (i + 1) * canvas.width / 7;
      const y = canvas.height * 0.5 +
                Math.sin(time + i * 0.5) * canvas.height * 0.15 +
                Math.cos(time * 0.7 + i) * canvas.height * 0.05;

      // Vary intensity based on position and time
      const intensity = 0.4 + 0.3 * Math.abs(Math.sin(time * 0.5 + i));

      points.push([x, y, intensity]);
    }

    renderPressureGlow(canvas, points);
    animationId = requestAnimationFrame(animate);
  }

  // Start animation
  animate();

  // Return cleanup function
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}

// WebSocket integration for live pressure data
export function connectLivePressure(wsUrl) {
  const canvas = document.getElementById('pressureFx');
  if (!canvas) return;

  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.pressurePoints) {
        renderPressureGlow(canvas, data.pressurePoints);
      }
    } catch (err) {
      console.error('[FX] Failed to parse pressure data:', err);
    }
  };

  ws.onerror = (err) => {
    console.error('[FX] WebSocket error:', err);
  };

  return ws;
}