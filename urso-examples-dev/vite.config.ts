import { defineConfig, Plugin } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReadStream, existsSync, statSync } from 'node:fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const mimeTypes: Record<string, string> = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.fnt': 'application/octet-stream',
  '.atlas': 'application/octet-stream', '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.ico': 'image/x-icon',
};

function serveGameAssets(): Plugin {
  const srcDir = resolve(__dirname, 'src');

  return {
    name: 'serve-game-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (!url || (!url.startsWith('/assets/') && !url.startsWith('/bin/') && url !== '/favicon.ico')) {
          return next();
        }

        const filePath = resolve(srcDir, url.slice(1));
        if (!existsSync(filePath) || !statSync(filePath).isFile()) {
          return next();
        }

        const ext = url.substring(url.lastIndexOf('.'));
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        createReadStream(filePath).pipe(res);
      });
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      '@urso/core': resolve(__dirname, '..', 'src', 'ts', 'index.ts'),
    },
  },
  publicDir: false,
  server: { open: true },
  plugins: [serveGameAssets()],
});
