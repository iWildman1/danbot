ARG NODE_VERSION=22-alpine

########################################################
# BUILDER STAGE
########################################################

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

########################################################
# RUNNER STAGE
########################################################

FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache redis

COPY --from=builder /app/dist ./

CMD ["node", "index.js"] 