# Use a Node.js base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install Python, yt-dlp, and ffmpeg
# Using apt-get for Debian-based slim image
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install yt-dlp

# Copy application code
COPY package*.json ./
COPY prisma ./prisma/
COPY src ./src/
COPY .env ./.env

# Install npm dependencies
RUN npm install --production

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build

# Expose the application port
EXPOSE 4000

# Define data volumes (optional, for persistent storage)
VOLUME /app/downloads

# Start the application
CMD ["npm", "start"]