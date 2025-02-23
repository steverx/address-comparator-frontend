# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Add build essentials
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY public/ ./public/
COPY src/ ./src/
COPY tsconfig.json ./

# Set build environment
ENV NODE_ENV=production \
    CI=false \
    DISABLE_ESLINT_PLUGIN=true \
    GENERATE_SOURCEMAP=false

# Build with debug output
RUN npm run build && \
    ls -la build/

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy build files and server
COPY --from=builder /app/build/ ./build/
COPY --from=builder /app/package.json ./
COPY server.js ./

# Install production dependencies
RUN npm install --production

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server.js"]