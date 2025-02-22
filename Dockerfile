# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy TypeScript config
COPY tsconfig.json ./

# Copy source files
COPY . .

# Build application with TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Set environment variables
ENV NODE_ENV=production
ENV REACT_APP_API_URL=https://address-comparator-backend-production.up.railway.app

# Start the server
CMD ["node", "server.js"]