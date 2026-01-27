import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './', // FIX: Generate relative paths instead of absolute
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  build: {
    outDir: '../../public/react-modules/alergeni',
    emptyOutDir: true,
    minify: false, // FIX: Disable minification to see full error messages
    sourcemap: true, // FIX: Enable source maps for debugging
    rollupOptions: {
      output: {
        // FIX: Add hash for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  server: {
    port: 5174
  }
});
