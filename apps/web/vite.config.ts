import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || (process.env.NODE_ENV === 'production' ? 'https://jpilot.up.railway.app' : 'http://localhost:3000'),
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: process.env.VITE_API_URL || (process.env.NODE_ENV === 'production' ? 'https://jpilot.up.railway.app' : 'http://localhost:3000'),
        changeOrigin: true,
        secure: false,
      },
      '/videos': {
        target: process.env.VITE_API_URL || (process.env.NODE_ENV === 'production' ? 'https://jpilot.up.railway.app' : 'http://localhost:3000'),
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173', 10),
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || (process.env.NODE_ENV === 'production' ? 'https://jpilot.up.railway.app' : 'http://localhost:3000'),
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: process.env.VITE_API_URL || (process.env.NODE_ENV === 'production' ? 'https://jpilot.up.railway.app' : 'http://localhost:3000'),
        changeOrigin: true,
        secure: false,
      },
      '/videos': {
        target: process.env.VITE_API_URL || (process.env.NODE_ENV === 'production' ? 'https://jpilot.up.railway.app' : 'http://localhost:3000'),
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
