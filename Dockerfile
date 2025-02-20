FROM node:18-alpine

WORKDIR /app

# Add necessary packages
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build app
RUN npm run build

# Environment setup
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Port configuration
EXPOSE 8080

# Health check
HEALTHCHECK --interval=15s --timeout=30s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start command
CMD ["node", "server.js"]