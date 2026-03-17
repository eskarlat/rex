import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4201,
    proxy: {
      '/api': {
        target: 'http://localhost:4200',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:4200',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
