import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    server: {
      deps: {
        inline: [
          '@tanstack/react-table',
          '@tanstack/react-query',
          '@base-ui/react',
          '@base-ui/utils',
          '@base-ui',
        ],
      },
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@dakareaseu/types': path.resolve(__dirname, '../../packages/types/src'),
      '@dakareaseu/shared': path.resolve(__dirname, '../../packages/shared/src'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
});
