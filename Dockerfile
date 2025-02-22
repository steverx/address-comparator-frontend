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

# Install dependencies
RUN npm cache clean --force && \
    npm install

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production \
    CI=false \
    DISABLE_ESLINT_PLUGIN=true \
    GENERATE_SOURCEMAP=false

# Build React app and verify output
RUN npm run build && \
    ls -la build/ && \
    test -f build/index.html || (echo "index.html not found!" && exit 1)

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/build/ ./build/
COPY --from=builder /app/package*.json ./
COPY server.js ./

# Verify files after copy
RUN ls -la build/ && \
    test -f build/index.html || (echo "index.html not copied!" && exit 1)

# Install production dependencies
RUN npm install --production

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server.js"]