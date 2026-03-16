/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Vitest config for running tests against JS source (src/js/).
 * JS source is the gold standard — these tests MUST always pass.
 *
 * Aliases redirect test imports from src/ts/ → src/js/,
 * except for src/ts/types which contains runtime enums (AssetTypeId, etc.)
 * that don't exist in the JS source.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    alias: [
      // Keep types.ts from TS source (runtime enums used in tests)
      { find: /(.*)\/src\/ts\/types(.*)/, replacement: '$1/src/ts/types$2' },
      // Redirect all other src/ts imports to src/js
      { find: /(.*)\/src\/ts\/(.*)/, replacement: '$1/src/js/$2' },
      // External lib mocks
      { find: 'pixi.js', replacement: resolve(__dirname, 'test/__mocks__/pixi.ts') },
      { find: 'gsap', replacement: resolve(__dirname, 'test/__mocks__/gsap.ts') },
      { find: 'howler', replacement: resolve(__dirname, 'test/__mocks__/howler.ts') },
      { find: '@esotericsoftware/spine-pixi-v8', replacement: resolve(__dirname, 'test/__mocks__/spine.ts') },
      { find: '@urso/revolt-fx', replacement: resolve(__dirname, 'test/__mocks__/revolt-fx.ts') },
    ],
  },
});
