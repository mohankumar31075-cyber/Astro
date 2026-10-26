import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// The preview environment serves the app from a proxied host, so the dev and
// preview servers must accept that Host header and listen on all interfaces.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
