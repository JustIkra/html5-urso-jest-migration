import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    minify: false,
    outDir: 'build',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/ts/index.ts'),
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
});
