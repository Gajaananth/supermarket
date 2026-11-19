FROM node:22-bookworm-slim AS build

WORKDIR /workspace
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY packages/api-contract/package*.json ./packages/api-contract/
COPY packages/api-contract/tsconfig.json ./packages/api-contract/
COPY packages/api-contract/src ./packages/api-contract/src
RUN npm ci --prefix packages/api-contract
RUN npm run build --prefix packages/api-contract

COPY apps/api/package*.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
RUN npm ci --prefix apps/api

COPY apps/api/src ./apps/api/src
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npm run prisma:generate --prefix apps/api
RUN npm run build --prefix apps/api

FROM build AS migration
WORKDIR /workspace/apps/api
ENV NODE_ENV=production
CMD ["npx", "prisma", "migrate", "deploy"]

FROM build AS runtime
RUN npm prune --omit=dev --prefix apps/api

WORKDIR /workspace/apps/api
ENV NODE_ENV=production \
  HOST=0.0.0.0 \
  PORT=8080 \
  STORAGE_LOCAL_DIR=/tmp/buyme-storage
COPY --from=build --chown=node:node /workspace/apps/api/node_modules ./node_modules
COPY --from=build --chown=node:node /workspace/apps/api/dist ./dist
COPY --from=build --chown=node:node /workspace/apps/api/prisma ./prisma

USER node
EXPOSE 8080
CMD ["node", "dist/main.js"]
