FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY api/package*.json ./api/
RUN cd api && npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY api ./api

RUN npx prisma generate

WORKDIR /app/api

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
