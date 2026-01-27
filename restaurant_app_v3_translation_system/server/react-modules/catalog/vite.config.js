import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Base path for assets (use relative paths in build)
  base: './',
  
  // Shared components path
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  
  // Build configuration
  build: {
    outDir: '../../public/react-modules/catalog',
    emptyOutDir: true,
    
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
    port: 5176, // Port diferit (Ingrediente: 5173, Alergeni: 5174, Stocuri: 5175)
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});


