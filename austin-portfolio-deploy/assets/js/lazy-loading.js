/**
 * Championship Lazy Loading System
 * Optimizes image and resource loading for elite performance
 */

class ChampionshipLazyLoader {
    constructor() {
        this.imageObserver = null;
        this.iframeObserver = null;
        this.videoObserver = null;
        this.loadedCount = 0;
        this.totalImages = 0;

        this.init();
    }

    init() {
        // Check for IntersectionObserver support
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported, loading all images immediately');
            this.loadAllImages();
            return;
        }

        // Configure observers with championship-level performance
        const imageOptions = {
            root: null,
            rootMargin: '50px', // Start loading 50px before visible
            threshold: 0.01
        };

        const iframeOptions = {
            root: null,
            rootMargin: '100px', // Load iframes earlier
            threshold: 0.01
        };

        // Create observers
        this.imageObserver = new IntersectionObserver(this.handleImageIntersection.bind(this), imageOptions);
        this.iframeObserver = new IntersectionObserver(this.handleIframeIntersection.bind(this), iframeOptions);
        this.videoObserver = new IntersectionObserver(this.handleVideoIntersection.bind(this), imageOptions);

        // Start observing
        this.observeImages();
        this.observeIframes();
        this.observeVideos();

        // Add progressive enhancement
        this.addProgressiveEnhancement();
    }

    observeImages() {
        // Find all images with data-src
        const lazyImages = document.querySelectorAll('img[data-src], img[data-lazy]');
        this.totalImages = lazyImages.length;

        lazyImages.forEach(img => {
            // Add loading class
            img.classList.add('lazy-loading');

            // Set low-quality placeholder if available
            if (img.dataset.placeholder) {
                img.src = img.dataset.placeholder;
            }

            this.imageObserver.observe(img);
        });

        // Also handle background images
        const lazyBackgrounds = document.querySelectorAll('[data-bg-src]');
        lazyBackgrounds.forEach(element => {
            this.imageObserver.observe(element);
        });

        console.log(`🔥 Championship Lazy Loader: Observing ${this.totalImages} images`);
    }

    observeIframes() {
        const lazyIframes = document.querySelectorAll('iframe[data-src]');

        lazyIframes.forEach(iframe => {
            iframe.classList.add('lazy-loading');
            this.iframeObserver.observe(iframe);
        });
    }

    observeVideos() {
        const lazyVideos = document.querySelectorAll('video[data-src]');

        lazyVideos.forEach(video => {
            video.classList.add('lazy-loading');
            this.videoObserver.observe(video);
        });
    }

    handleImageIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;

                if (element.tagName === 'IMG') {
                    this.loadImage(element);
                } else if (element.dataset.bgSrc) {
                    this.loadBackgroundImage(element);
                }

                observer.unobserve(element);
            }
        });
    }

    handleIframeIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                this.loadIframe(iframe);
                observer.unobserve(iframe);
            }
        });
    }

    handleVideoIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                this.loadVideo(video);
                observer.unobserve(video);
            }
        });
    }

    loadImage(img) {
        const src = img.dataset.src || img.dataset.lazy;
        const srcset = img.dataset.srcset;

        if (!src) return;

        // Create new image to preload
        const tempImg = new Image();

        tempImg.onload = () => {
            // Apply sources
            if (src) img.src = src;
            if (srcset) img.srcset = srcset;

            // Remove data attributes
            delete img.dataset.src;
            delete img.dataset.lazy;
            delete img.dataset.srcset;

            // Update classes
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');

            // Trigger animation
            this.animateLoad(img);

            // Update counter
            this.loadedCount++;
            this.updateProgress();
        };

        tempImg.onerror = () => {
            console.error('Failed to load image:', src);
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-error');
        };

        // Start loading
        tempImg.src = src;
    }

    loadBackgroundImage(element) {
        const src = element.dataset.bgSrc;

        if (!src) return;

        // Create image to preload
        const tempImg = new Image();

        tempImg.onload = () => {
            element.style.backgroundImage = `url(${src})`;
            delete element.dataset.bgSrc;
            element.classList.remove('lazy-loading');
            element.classList.add('lazy-loaded');
            this.animateLoad(element);
        };

        tempImg.src = src;
    }

    loadIframe(iframe) {
        const src = iframe.dataset.src;

        if (!src) return;

        iframe.src = src;
        delete iframe.dataset.src;
        iframe.classList.remove('lazy-loading');
        iframe.classList.add('lazy-loaded');
    }

    loadVideo(video) {
        const src = video.dataset.src;
        const poster = video.dataset.poster;

        if (!src) return;

        if (poster) video.poster = poster;
        video.src = src;

        delete video.dataset.src;
        delete video.dataset.poster;

        video.classList.remove('lazy-loading');
        video.classList.add('lazy-loaded');

        // Auto-play if specified
        if (video.dataset.autoplay === 'true') {
            video.play();
        }
    }

    animateLoad(element) {
        // Add fade-in animation
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.3s ease-in-out';

        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    }

    updateProgress() {
        const percentage = Math.round((this.loadedCount / this.totalImages) * 100);

        // Dispatch custom event for progress tracking
        window.dispatchEvent(new CustomEvent('lazyLoadProgress', {
            detail: {
                loaded: this.loadedCount,
                total: this.totalImages,
                percentage: percentage
            }
        }));

        if (this.loadedCount === this.totalImages) {
            console.log('🏆 All images loaded with championship precision!');
        }
    }

    addProgressiveEnhancement() {
        // Add support for native lazy loading where available
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                // Let native lazy loading handle these
                if (!img.dataset.src && img.src) {
                    img.classList.add('native-lazy');
                }
            });
        }

        // Preload critical images
        this.preloadCriticalImages();
    }

    preloadCriticalImages() {
        // Preload hero images and above-the-fold content
        const criticalImages = document.querySelectorAll('[data-critical="true"]');

        criticalImages.forEach(img => {
            if (img.dataset.src) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = img.dataset.src;
                document.head.appendChild(link);
            }
        });
    }

    loadAllImages() {
        // Fallback for browsers without IntersectionObserver
        const images = document.querySelectorAll('img[data-src], img[data-lazy]');
        images.forEach(img => this.loadImage(img));

        const backgrounds = document.querySelectorAll('[data-bg-src]');
        backgrounds.forEach(el => this.loadBackgroundImage(el));

        const iframes = document.querySelectorAll('iframe[data-src]');
        iframes.forEach(iframe => this.loadIframe(iframe));

        const videos = document.querySelectorAll('video[data-src]');
        videos.forEach(video => this.loadVideo(video));
    }

    // Public API
    forceLoad(element) {
        if (element.tagName === 'IMG') {
            this.loadImage(element);
        } else if (element.tagName === 'IFRAME') {
            this.loadIframe(element);
        } else if (element.tagName === 'VIDEO') {
            this.loadVideo(element);
        } else if (element.dataset.bgSrc) {
            this.loadBackgroundImage(element);
        }
    }

    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        if (this.iframeObserver) {
            this.iframeObserver.disconnect();
        }
        if (this.videoObserver) {
            this.videoObserver.disconnect();
        }
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.championshipLazyLoader = new ChampionshipLazyLoader();
    });
} else {
    window.championshipLazyLoader = new ChampionshipLazyLoader();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChampionshipLazyLoader;
}