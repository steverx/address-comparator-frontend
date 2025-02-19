FROM node:18-alpine

WORKDIR /app

# Add necessary packages
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start command - explicitly use node to run server.js
CMD ["node", "server.js"]