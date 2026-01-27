import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Plugin pentru redirect de la /admin-vite la /admin-vite/
const redirectPlugin = () => {
  return {
    name: 'redirect-admin-vite',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/admin-vite') {
          res.writeHead(301, { Location: '/admin-vite/' });
          res.end();
          return;
        }
        next();
      });
    },
  };
};

// Plugin pentru a preveni cache-ul în development
const noCachePlugin = () => {
  return {
    name: 'no-cache-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url || '';
        if (process.env.NODE_ENV !== 'production') {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          res.setHeader('Surrogate-Control', 'no-store');
          res.setHeader('ETag', '');
          res.setHeader('Last-Modified', new Date().toUTCString());
          res.setHeader('X-Content-Type-Options', 'nosniff');
          if (url.includes('/node_modules/') || url.includes('chunk-') || url.includes('?v=')) {
            res.setHeader('X-Vite-No-Cache', '1');
          }
        }
        next();
      });
    },
  };
};

// Plugin pentru forțare UTF-8 encoding
const forceUTF8Plugin = () => {
  return {
    name: 'force-utf8-encoding',
    enforce: 'post' as const,
    transform(code: string, id: string) {
      if (id.includes('src/ui/admin') || id.includes('src/styles')) {
        if (/[șțăâîȘȚĂÂÎ]/.test(code)) {
          return {
            code,
            map: null
          };
        }
      }
      return null;
    }
  };
};

export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    forceUTF8Plugin(),
    redirectPlugin(),
    noCachePlugin(),
  ],
  base: '/admin-vite/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // CRITICAL: Force single React instance - prevent duplicate React in bundle
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react-jsx-dev-runtime.js'),
      'react-dom/client': path.resolve(__dirname, 'node_modules/react-dom/client.js'),
      'react-dom/server': path.resolve(__dirname, 'node_modules/react-dom/server.js'),
    },
    preserveSymlinks: false,
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // CRITICAL: Keep ALL React-dependent libraries in one chunk to prevent scope issues
            // This is ESSENTIAL to prevent ESM module scope isolation
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('react-bootstrap') || 
                id.includes('@restart') ||
                id.includes('react-hook-form') ||
                id.includes('@hookform') ||
                id.includes('react-router') ||
                id.includes('react-query') ||
                id.includes('@tanstack/react-query') ||
                id.includes('zustand') ||
                id.includes('immer') ||
                id.includes('use-sync-external-store') ||
                id.includes('scheduler')) {
              return 'react-vendor';
            }
            if (id.includes('ag-grid')) {
              return 'table-vendor';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts-vendor';
            }
            return 'vendor';
          }
          if (id.includes('src/ui/admin')) {
            return 'admin';
          }
          return undefined;
        },
      },
      onwarn(warning, warn) {
        if (warning.code === 'CSS_SYNTAX_ERROR') {
          return;
        }
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
          return;
        }
        warn(warning);
      },
    },
    target: 'es2020',
    cssMinify: 'esbuild',
    minify: false,
    chunkSizeWarningLimit: 5000,
    sourcemap: true,
    // CRITICAL: Force UTF-8 encoding in all output
    esbuildOptions: {
      charset: 'utf8',
      target: 'es2020',
      keepNames: true,
    },
  },
  server: {
    port: 5173,
    open: false,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
    middlewareMode: false,
    fs: {
      strict: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
      '/favicon.ico': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/admin-advanced.html': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-dom/client',
      '@tanstack/react-query',
      'react-router-dom',
      'react-leaflet',
      'react-bootstrap',
      '@restart/hooks',
      'bootstrap',
      'zustand',
      'zod',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'axios',
      'ag-grid-community',
      'ag-grid-react',
      'lucide-react',
      'qrcode',
      'react-draggable',
    ],
    esbuildOptions: {
      charset: 'utf8',
      target: 'es2020',
      keepNames: true,
    },
    exclude: [],
    force: true,
  },
  // eliminat dublura resolve
  preview: {
    port: 4173,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  },
  appType: 'spa',
});