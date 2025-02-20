FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install app dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build app
RUN npm run build

# Environment setup
ENV NODE_ENV=production
ENV PORT=8080

# Port configuration
EXPOSE 8080

# Health check with retry
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start command with explicit host binding
CMD ["node", "server.js"]