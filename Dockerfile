# Build stage
FROM node:18-alpine as builder

# Add Python and build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set environment variable to ignore TypeScript errors during build
ENV CI=false
ENV NODE_ENV=production

# Build application with increased memory limit
RUN NODE_OPTIONS=--max_old_space_size=4096 npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Install production dependencies
RUN npm ci --only=production --legacy-peer-deps

EXPOSE 8080

CMD ["npm", "start"]