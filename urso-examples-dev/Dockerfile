# Build context must be the repo root (html5-urso-jest-migration/)
# Usage: docker compose up --build  (from urso-examples-dev/)

FROM node:22-alpine

WORKDIR /app

# --- Core engine (@urso/core) ---
COPY package.json package-lock.json tsconfig.json ./
COPY src/ ./src/
COPY vite.config.ts vite.config.js vite.config.ts-build.ts ./
COPY index.html ./

RUN npm install

# --- Examples app ---
WORKDIR /app/urso-examples-dev

COPY urso-examples-dev/package.json urso-examples-dev/package-lock.json* ./
COPY urso-examples-dev/index.html urso-examples-dev/vite.config.ts ./
COPY urso-examples-dev/assets.config.json ./
COPY urso-examples-dev/src/ ./src/

# Recreate symlinks (COPY follows symlinks and copies broken refs)
RUN rm -rf public && mkdir -p public \
    && ln -s ../src/assets public/assets \
    && ln -s ../src/bin public/bin \
    && ln -s ../src/favicon.ico public/favicon.ico

# file:.. resolves to /app — where @urso/core is installed
RUN npm install

EXPOSE 5173

CMD ["npx", "vite", "--host", "0.0.0.0"]
