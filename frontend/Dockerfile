# Use Node 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and config files
COPY package.json package-lock.json ./
COPY postcss.config.cjs ./
COPY tailwind.config.js ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev", "--", "--host"]