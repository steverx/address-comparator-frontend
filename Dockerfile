FROM node:18-alpine

WORKDIR /app

# Add necessary packages
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies with exact versions
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start command
CMD ["node", "server.js"]