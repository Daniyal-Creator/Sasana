# SASANA backend: Hono on Node, run through tsx.
#
# There is deliberately no compile step. tsx executes the TypeScript directly,
# so the container runs the same files as local development and there is no
# dist/ that can silently drift out of date. `npm run typecheck` is what proves
# the types, not the build.
#
# The build context is the REPOSITORY ROOT, not this folder, because shared/
# lives outside backend/. See docker-compose.yml.

FROM node:24-alpine

WORKDIR /app

# Dependencies first so a source edit does not invalidate the install layer.
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

# shared/ holds the type-only API contract. Nothing from it reaches the running
# process - TypeScript erases types - but tsx must still be able to resolve the
# import while loading.
COPY shared ./shared
COPY backend ./backend

WORKDIR /app/backend

ENV NODE_ENV=production
EXPOSE 3001

CMD ["npm", "run", "start"]
