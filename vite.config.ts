import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      http: 'stream-http',
      https: 'https-browserify',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});