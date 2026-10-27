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
  build: {
    // One 600 kB chunk delays first paint on a phone. Split the two heaviest
    // dependencies out so they cache independently and the app shell paints
    // while the ephemeris is still downloading.
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'astronomy', test: /node_modules[\\/]astronomy-engine/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
