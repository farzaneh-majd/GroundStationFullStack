FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_DATA_SOURCE=graphql
ARG NEXT_PUBLIC_GRAPHQL_HTTP_URL=http://localhost:8000/graphql
ARG NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:8000/graphql
ENV NEXT_PUBLIC_DATA_SOURCE=$NEXT_PUBLIC_DATA_SOURCE \
    NEXT_PUBLIC_GRAPHQL_HTTP_URL=$NEXT_PUBLIC_GRAPHQL_HTTP_URL \
    NEXT_PUBLIC_GRAPHQL_WS_URL=$NEXT_PUBLIC_GRAPHQL_WS_URL \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN addgroup -S nodejs \
    && adduser -S nextjs -G nodejs -u 10001

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
