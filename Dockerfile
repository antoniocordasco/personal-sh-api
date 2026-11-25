# ---- build: install deps, generate the Prisma client, compile TypeScript ----
FROM node:22-slim AS build
WORKDIR /app
# openssl is needed by Prisma's migration engine
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- runtime ----
FROM node:22-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production

# node_modules includes the Prisma CLI, used to apply migrations on start-up
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json prisma.config.ts ./
COPY prisma ./prisma

USER node
EXPOSE 4000
# apply any pending migrations, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
