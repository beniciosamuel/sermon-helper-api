# Multi-stage build for Node.js/TypeScript backend
# Stage 1: Build stage - compile TypeScript and install dependencies
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
# Generate package-lock.json if it doesn't exist
RUN npm install

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Production stage - minimal runtime image
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files from build context
COPY package*.json ./

# Copy package-lock.json from builder stage (generated during npm install)
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install only production dependencies
# Use --omit=dev instead of deprecated --only=production
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy built application from builder stage
# Note: tsconfig outputs to .dist directory
COPY --from=builder /app/.dist ./.dist

# # Copy .env folder with secrets.json from build context
# # This is created by start-docker.sh before Docker build
# COPY --from=builder /app/.env ./.env

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (Cloud Run uses 8080, but PORT env var can override)
EXPOSE 8080

# Health check (uses PORT env var, defaults to 8080)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "const port = process.env.PORT || 8080; require('http').get(`http://localhost:${port}/health`, (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set PORT to 8080 for Docker/Cloud Run
# This ensures the container always listens on 8080 unless Cloud Run sets PORT explicitly
ENV PORT=8080

# Start the application
# tsconfig compiles src/index.ts to .dist/index.js
CMD ["node", ".dist/index.js"]

