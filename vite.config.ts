// defineConfig from vitest/config re-exports vite's with the `test` field typed
// (vitest 4 dropped the `/// <reference types="vitest/config" />` augmentation).
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { serviceWorkerPlugin } from '@sudobility/di_web/vite';
import path from 'path';
import packageJson from './package.json';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'react-helmet-async',
      '@sudobility/components',
      '@sudobility/building_blocks',
      '@sudobility/subscription-components',
      '@sudobility/auth-components',
      '@sudobility/entity_client',
      'firebase',
      'firebase/app',
      'firebase/analytics',
      '@sudobility/raidr_client',
      '@sudobility/raidr_lib',
    ],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react(), serviceWorkerPlugin()],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/') ||
            id.includes('node_modules/react-router')
          ) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@tanstack/')) return 'query';
          if (id.includes('node_modules/@radix-ui/')) return 'radix-ui';
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark') || id.includes('node_modules/micromark') || id.includes('node_modules/mdast') || id.includes('node_modules/unified')) {
            return 'markdown';
          }
          if (id.includes('node_modules/@heroicons/')) return 'icons';
          // Firebase Analytics: its own chunk, like sudojo_app
          if (id.includes('node_modules/firebase/') || id.includes('node_modules/@firebase/')) {
            return 'firebase';
          }
          if (id.includes('node_modules/@sudobility/raidr_')) return 'raidr';
          if (
            id.includes('node_modules/@sudobility/') ||
            id.includes('node_modules/i18next') ||
            id.includes('node_modules/react-i18next')
          ) {
            return 'sudobility-core';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react/jsx-runtime', 'react-dom', 'react-router-dom', '@tanstack/react-query', '@sudobility/components'],
    exclude: ['@sudobility/raidr_lib', '@sudobility/raidr_client'],
  },
  server: {
    host: true,
    port: 5144,
    watch: { ignored: ['!**/node_modules/@sudobility/**'] },
    fs: { allow: ['..'] },
  },
});
