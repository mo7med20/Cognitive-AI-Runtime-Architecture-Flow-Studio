import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: [
        '.trycloudflare.com',
        ...(process.env.ALLOWED_HOSTS ? process.env.ALLOWED_HOSTS.split(',').map((h) => h.trim()) : [])
      ],
      // HMR is disabled in AI Studio to prevent WebSocket errors in the preview iframe.
      hmr: false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
