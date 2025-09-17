import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';
import { fileURLToPath, URL } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Get all HTML files in the root directory for multi-page app
const htmlFiles = readdirSync('.').filter(file => file.endsWith('.html'));
const input = {};
htmlFiles.forEach(file => {
  const name = file.replace('.html', '');
  input[name] = resolve(__dirname, file);
});

export default defineConfig({
  root: '.',
  base: '/',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input,
      output: {
        // Simple output without code splitting for now
        format: 'es',
        // Keep simple file names
        chunkFileNames: 'js/[name].js',
        entryFileNames: 'js/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      },
      external: [
        /^https?:\/\//,  // Exclude all external URLs
        /\.js$/,         // Don't bundle JS files
      ]
    },
    // Enable minification and tree-shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      }
    },
    // Optimize for production
    target: 'es2020',
    sourcemap: false,
    // Split large libraries
    chunkSizeWarningLimit: 500,
    // Asset handling
    assetsInlineLimit: 4096, // 4kb - inline small assets as base64
    // CSS code splitting
    cssCodeSplit: true,
    // Preload critical chunks
    modulePreload: {
      polyfill: true
    }
  },

  // Don't optimize external dependencies
  optimizeDeps: {
    exclude: ['*']
  },

  // Development server configuration
  server: {
    port: 8080,
    open: true,
    cors: true
  },

  // Production preview server
  preview: {
    port: 8080
  },

  // Define global constants
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },

  // Enable JSX without Babel
  esbuild: {
    jsx: 'automatic',
    jsxDev: false,
    jsxImportSource: undefined // No React needed
  }
});