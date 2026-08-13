import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Render React Native primitives to the DOM and prefer `.web` files (so the
    // DOM Icon.web.tsx is used and react-native-svg is never pulled in).
    alias: [{ find: /^react-native$/, replacement: 'react-native-web' }],
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json', '.mjs'],
    dedupe: ['react', 'react-dom', 'react-native-web'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
