FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy and build app
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=10s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start server
CMD ["node", "server.js"]