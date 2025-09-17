// Modern Three.js ES Module Initialization
// Replaces deprecated build files with ES modules

let THREE;

// Initialize Three.js ES modules
async function initializeThreeJS() {
    try {
        // Import Three.js as ES module
        THREE = await import('three');
        console.log('✅ Three.js ES modules loaded successfully');
        
        // Make THREE available globally for compatibility
        window.THREE = THREE;
        
        // Initialize any Three.js-dependent components
        if (typeof initializeNeuralBackground === 'function') {
            initializeNeuralBackground();
        }
        
        if (typeof initializeHeroAnimation === 'function') {
            initializeHeroAnimation();
        }
        
        return THREE;
    } catch (error) {
        console.warn('⚠️ Three.js ES modules failed, falling back to CDN:', error);
        
        // Fallback to CDN version if ES modules fail
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js';
        script.onload = () => {
            THREE = window.THREE;
            console.log('✅ Three.js CDN fallback loaded');
        };
        document.head.appendChild(script);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeThreeJS);
} else {
    initializeThreeJS();
}

export { THREE, initializeThreeJS };