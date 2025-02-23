FROM node:20-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build


FROM node:20-alpine as runner

WORKDIR /app

COPY --from=builder /app/build.js .

CMD ["node", "build.js"]