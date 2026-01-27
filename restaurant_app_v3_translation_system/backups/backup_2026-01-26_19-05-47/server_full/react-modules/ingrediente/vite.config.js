import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Base path for assets (use relative paths in build)
  base: './',
  
  // Shared components path (ca să poată accesa ../shared)
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  
  // Build configuration
  build: {
    outDir: '../../public/react-modules/ingrediente',
    emptyOutDir: true,
    
    // Generează fișiere cu nume predictibile
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  
  // Dev server
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls către backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});

