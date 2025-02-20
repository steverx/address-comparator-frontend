FROM node:18-alpine

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Verify build directory exists
RUN ls -la build/

# Environment setup
ENV NODE_ENV=production
ENV PORT=8080

# Start command - explicitly use node
CMD ["node", "server.js"]