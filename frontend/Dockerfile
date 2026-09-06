# SASANA frontend: Next.js, built once and served with `next start`.
#
# Unlike the backend image, this one is multi-stage, and for a real reason: the
# frontend has an actual build step. `next build` needs devDependencies -
# typescript, tailwind, postcss - and produces .next/ from source that the
# running container never needs again. Three stages let all of that stay behind.
#
# The build context is the REPOSITORY ROOT, not this folder, because src/
# imports types from shared/ through the "@shared/*" alias in tsconfig.json.
# See docker-compose.prod.yml.

# --- deps -------------------------------------------------------------------
# Full install, devDependencies included. Its own stage so that editing a
# component does not re-run npm ci.
FROM node:24-alpine AS deps

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# --- builder ----------------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /app
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
# shared/ holds the type-only API contract. Types are erased, so nothing from it
# reaches the bundle, but tsc must resolve the import or the build fails.
COPY shared ./shared
COPY frontend ./frontend

WORKDIR /app/frontend

# READ THIS BEFORE CHANGING IT.
#
# NEXT_PUBLIC_* variables are inlined into the browser bundle by `next build`.
# They are NOT read when the container starts. Passing the API URL as a plain
# `environment:` entry in compose therefore does nothing: the image builds, the
# container starts, the site looks healthy, and every visitor's browser calls
# http://localhost:3001 - the fallback in src/lib/api.ts - which is their own
# machine, not the server. It fails silently, which is the worst way to fail.
#
# So it arrives as a build argument, and the value has to be correct at the
# moment the image is built. Change the backend URL, rebuild the image.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# .next/cache is the webpack build cache. It is worth hundreds of megabytes, it
# is never read while serving, and it has to be removed HERE rather than in the
# runner: deleting it after COPY would leave it sitting in the layer underneath,
# so the image would not shrink by a single byte.
RUN rm -rf .next/cache

# --- runner -----------------------------------------------------------------
# Production dependencies only, plus the build output. No source, no compiler,
# no devDependencies.
FROM node:24-alpine AS runner

WORKDIR /app/frontend
ENV NODE_ENV=production
ENV PORT=3000

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --omit=dev

# next.config.mjs is read by `next start`, not only by `next build`.
COPY --from=builder /app/frontend/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=node:node /app/frontend/public ./public
# .next is chowned because Next.js writes into .next/cache while serving; owned
# by root it would fail at runtime under a non-root user.
COPY --from=builder --chown=node:node /app/frontend/.next ./.next

# Nothing here needs root. The container is reachable from nginx on the host,
# so this is the one process on the box exposed to visitor input.
USER node

EXPOSE 3000
CMD ["npm", "run", "start"]
