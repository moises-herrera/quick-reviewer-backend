FROM node:22.14.0-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@9.6.0

FROM base AS dev-deps
WORKDIR /app
COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
RUN pnpm install

FROM base AS prod-deps
WORKDIR /app
COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
RUN pnpm install --prod --ignore-scripts

FROM base AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN pnpm db:init && pnpm build

FROM node:22.14.0-alpine AS prod
EXPOSE 3000
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
CMD ["node", "dist/index.js"]
