# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./

# Install dependencies without legacy flag if possible
RUN npm install

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production \
    CI=false \
    DISABLE_ESLINT_PLUGIN=true \
    GENERATE_SOURCEMAP=false

# Build React app with error logging
RUN npm run build || (cat /root/.npm/_logs/*-debug.log && exit 1)

# Production stage
FROM node:18-alpine

# Create non-root user first
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/build/ ./build/
COPY --from=builder /app/package*.json ./
COPY server.js ./

# Install curl for health checks and production dependencies
RUN apk add --no-cache curl && \
    npm install --production && \
    npm cache clean --force && \
    chown -R appuser:appgroup /app

# Set runtime environment
ENV NODE_ENV=production \
    PORT=8080

# Expose port
EXPOSE 8080

# Switch to non-root user
USER appuser

# Health check using curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

CMD ["node", "server.js"]