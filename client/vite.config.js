import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
    // Resolve from both client and root node_modules
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../node_modules'),
      'node_modules',
    ],
  },
  server: {
    port: 5173,
    proxy: {
      '/api':       { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', ws: true },
    },
  },
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'framer-motion', 'lucide-react', 'clsx',
      'zustand', 'react-hot-toast', 'recharts',
      'axios', 'date-fns', 'phaser',
    ],
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ['react', 'react-dom', 'react-router-dom'],
          charts:  ['recharts', 'lightweight-charts'],
          motion:  ['framer-motion', 'gsap'],
        },
      },
    },
  },
});
