FROM node:14-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --production

COPY . .

FROM node:14-alpine

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

CMD ["node", "app.js"]
