# Multi-stage build for React application
# Stage 1: Build stage - install dependencies and build the app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
# Use --legacy-peer-deps to handle peer dependency conflicts (e.g., react-i18next with TypeScript 4.9.5)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build argument for API URL (can be overridden in docker-compose)
ARG REACT_APP_API_URL=http://localhost:3000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the React application
RUN npm run build

# Stage 2: Production stage - serve with nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration (optional - uses default if not present)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Create nginx user (nginx image already runs as non-root)
# The nginx image already uses a non-root user internally

# Expose port 5000 (nginx default is 80, we'll configure it)
EXPOSE 5000

# Create custom nginx config to run on port 5000
RUN echo 'server { \
    listen 5000; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json; \
    \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
        add_header Content-Type text/plain; \
    } \
    \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

