import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@urso/core': resolve(__dirname, '..', 'src', 'ts', 'index.ts'),
    },
  },
  server: { open: true },
});
