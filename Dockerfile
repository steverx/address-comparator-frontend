# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies including dev dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set CI to false to prevent treating warnings as errors
ENV CI=false

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built assets and server
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

EXPOSE 8080

CMD ["npm", "start"]