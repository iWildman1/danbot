ARG NODE_VERSION=22-alpine

########################################################
# BUILDER STAGE
########################################################

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

########################################################
# RUNNER STAGE
########################################################

FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./

EXPOSE 3000

CMD ["node", "index.js"] 