# Build stage
FROM node:18-alpine as builder

# Add build essentials
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force && \
    npm install

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV CI=false
ENV DISABLE_ESLINT_PLUGIN=true

# Build with debug output
RUN set -x && \
    npm run build 2>&1 | tee build.log || \
    (echo "Build failed. Build log:" && cat build.log && exit 1)

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built assets
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Install production dependencies including http-proxy-middleware
RUN npm install --production

EXPOSE 8080

CMD ["npm", "start"]