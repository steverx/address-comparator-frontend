# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies required for building
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files for better layer caching
COPY package*.json ./

# Install dependencies with clean cache
RUN npm cache clean --force && \
    npm install

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production \
    CI=false \
    DISABLE_ESLINT_PLUGIN=true \
    GENERATE_SOURCEMAP=false

# Build React app with detailed error output
RUN npm run build 2>&1 | tee build.log || \
    (echo "Build failed. Full log:" && cat build.log && exit 1)

# Production stage
FROM node:18-alpine

# Create non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

WORKDIR /app

# Copy build artifacts and config
COPY --from=builder /app/build/ ./build/
COPY --from=builder /app/package*.json ./
COPY server.js ./

# Install production dependencies and curl for health checks
RUN apk add --no-cache curl && \
    npm install --production && \
    chown -R appuser:appgroup /app

# Set runtime environment
ENV NODE_ENV=production \
    PORT=8080

# Switch to non-root user
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:8080/health || exit 1

CMD ["node", "server.js"]