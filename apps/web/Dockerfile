# KINTRAL Web Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY apps/web/package.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY apps/web ./

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
