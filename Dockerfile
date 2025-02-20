# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with prefixed cache ID
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm ci

# Copy source files
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Install only production dependencies with prefixed cache ID
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm ci --only=production

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start command
CMD ["node", "server.js"]