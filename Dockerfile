# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean cache
RUN npm cache clean --force && \
    npm install

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV CI=false
ENV DISABLE_ESLINT_PLUGIN=true

# Build React app with verbose output
RUN npm run build && \
    echo "Build directory contents:" && \
    ls -la build/

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy build files and server
COPY --from=builder /app/build/ ./build/
COPY --from=builder /app/package.json ./
COPY server.js ./

# Install only production dependencies
RUN npm install --production express

# Verify files after copy
RUN ls -la build/ && \
    echo "Server files:" && \
    ls -la ./

# Runtime configuration
EXPOSE 8080
ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["node", "server.js"]