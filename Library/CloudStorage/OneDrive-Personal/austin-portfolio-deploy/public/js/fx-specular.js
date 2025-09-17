// Specular Card Effects JavaScript - Cursor tracking and interaction
// Austin Humphrey - Smooth, performant, accessible

export function enableSpecularCards(root = document) {
  const cards = root.querySelectorAll('.specular');
  if (!cards.length) return;

  console.log(`[FX] Enabling specular effects for ${cards.length} cards`);

  // Use passive event listener for better scroll performance
  let rafId = null;
  let mouseX = 0;
  let mouseY = 0;

  function updateCards() {
    for (const card of cards) {
      const rect = card.getBoundingClientRect();

      // Calculate relative position (0-100%)
      const x = ((mouseX - rect.left) / rect.width) * 100;
      const y = ((mouseY - rect.top) / rect.height) * 100;

      // Clamp values between 0-100
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      // Update CSS custom properties
      card.style.setProperty('--mx', clampedX);
      card.style.setProperty('--my', clampedY);
    }
    rafId = null;
  }

  function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Throttle updates with requestAnimationFrame
    if (!rafId) {
      rafId = requestAnimationFrame(updateCards);
    }
  }

  // Add event listener with passive flag
  root.addEventListener('pointermove', handleMouseMove, { passive: true });

  // Touch support for mobile
  root.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      mouseX = touch.clientX;
      mouseY = touch.clientY;

      if (!rafId) {
        rafId = requestAnimationFrame(updateCards);
      }
    }
  }, { passive: true });

  // Cleanup function
  return () => {
    root.removeEventListener('pointermove', handleMouseMove);
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };
}

// Auto-initialize on DOM ready if module is imported
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => enableSpecularCards());
} else {
  enableSpecularCards();
}