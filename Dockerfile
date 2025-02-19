FROM node:18-alpine

WORKDIR /app

# Install necessary build tools and dependencies
RUN apk add --no-cache python3 make g++ curl

# Copy package files
COPY package*.json ./

# Install dependencies with explicit error logging
RUN npm ci --verbose

# Copy application code
COPY . .

# Build the React application
RUN npm run build

# Verify build directory exists
RUN ls -la build || exit 1

# Install production dependencies only
RUN npm ci --only=production --verbose

# Expose the port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the Express server with debugging
CMD ["sh", "-c", "node -r source-map-support/register server.js"]