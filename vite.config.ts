/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [],
  build: {
    minify: false,
    outDir: 'build',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/js/index.js'),
      name: 'Urso',
      fileName: () => 'js/index.js',
      formats: ['es'],
    },
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    alias: {
      'pixi.js': resolve(__dirname, 'test/__mocks__/pixi.ts'),
      'gsap': resolve(__dirname, 'test/__mocks__/gsap.ts'),
      'howler': resolve(__dirname, 'test/__mocks__/howler.ts'),
      '@esotericsoftware/spine-pixi-v8': resolve(__dirname, 'test/__mocks__/spine.ts'),
      '@urso/revolt-fx': resolve(__dirname, 'test/__mocks__/revolt-fx.ts'),
    },
    coverage: {
      provider: 'v8',
      include: ['src/ts/**/*.ts'],
      exclude: ['src/ts/types.ts', 'src/ts/globals.ts'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
