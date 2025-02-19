FROM node:18-alpine

WORKDIR /app

# Install necessary tools
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build && \
    if [ ! -d "build" ]; then \
        echo "Build directory not created!" && exit 1; \
    fi && \
    if [ ! -f "build/index.html" ]; then \
        echo "index.html not found in build directory!" && exit 1; \
    fi

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "server.js"]