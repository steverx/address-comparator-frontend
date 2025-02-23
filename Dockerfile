# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Clean install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production \
    CI=false \
    DISABLE_ESLINT_PLUGIN=true \
    GENERATE_SOURCEMAP=false

# Build React app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy build artifacts and server
COPY --from=builder /app/build/ ./build/
COPY --from=builder /app/package*.json ./
COPY server.js ./

# Install production dependencies
RUN npm ci --only=production

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server.js"]