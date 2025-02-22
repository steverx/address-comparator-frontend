# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files first
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build React app with debug output
RUN npm run build && ls -la build/

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