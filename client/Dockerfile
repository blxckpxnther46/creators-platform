# ============================================
# Multi-Stage Dockerfile for React Frontend
# Purpose: Build optimized React app and serve with Nginx
# ============================================

# Stage 1: Build Stage
# Purpose: Install dependencies and build the React app into static files
# This stage creates the optimized production bundle
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first for layer caching
# If dependencies don't change, Docker reuses this cached layer
COPY package*.json ./

# Install dependencies using npm ci
# npm ci (clean install) is preferred over npm install:
# - Respects exact versions in package-lock.json
# - Faster and more reliable in Docker
# - Ensures reproducible builds across environments
RUN npm ci

# Copy the rest of the source code
# Placed after npm ci so code changes don't bust the dependency cache
COPY . .

# Build the production-ready React app
# This command:
# - Minifies JavaScript and CSS
# - Generates hashed filenames for cache busting (e.g., main.abc123.js)
# - Creates optimized static files in dist/ directory
# - Only outputs files needed for production
RUN npm run build

# ============================================
# Stage 2: Production Stage
# Purpose: Serve static files with minimal, security-hardened Nginx
# Only the final stage is included in the final Docker image
# ============================================
FROM nginx:alpine

# Label for identification
LABEL maintainer="Creators Platform Team"
LABEL description="Production-ready React frontend served by Nginx"

# Copy built static files from build stage
# COPY --from=build copies files from a previous stage
# /app/dist contains all optimized, minified, hashed production files
# /usr/share/nginx/html is Nginx's default directory to serve files from
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing
# This replaces Nginx's default config with our optimized configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Optional: Add a .htaccess equivalent for Nginx (example for additional headers)
# COPY security-headers.conf /etc/nginx/conf.d/security-headers.conf

# Create a non-root user for security (optional but recommended)
# Nginx in Alpine already runs as unprivileged user, but explicit is better
RUN addgroup -g 1001 -S nginx-www && \
    adduser -S nginx-www -u 1001 && \
    chown -R nginx-www:nginx-www /usr/share/nginx/html && \
    chown -R nginx-www:nginx-www /var/cache/nginx && \
    chown -R nginx-www:nginx-www /var/log/nginx && \
    chown -R nginx-www:nginx-www /etc/nginx/conf.d

# Switch to non-root user
USER nginx-www

# Expose port 80
# This documents which port Nginx listens on
# Container will expose port 80 for HTTP traffic
EXPOSE 80

# Health check
# Verifies the container is running properly
# Docker will check this every 30 seconds
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx
# Nginx runs in foreground mode (-g daemon off) for proper Docker signal handling
# This ensures:
# - Container receives SIGTERM for graceful shutdown
# - Logs appear in docker logs
# - Container exits when Nginx stops
CMD ["nginx", "-g", "daemon off;"]
