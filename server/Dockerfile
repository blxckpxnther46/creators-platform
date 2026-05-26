# ============================================
# Multi-Stage Production Dockerfile
# Purpose: Containerize Node.js backend for production
# ============================================

# Stage 1: Dependencies
# Purpose: Separate dependency installation from source code
# This allows Docker to cache dependencies if they haven't changed
FROM node:18-alpine AS dependencies

# Set working directory
WORKDIR /app

# Copy package files (package.json and package-lock.json)
# We do this first for layer caching optimization
# Docker will only re-run RUN npm ci if these files change
COPY package*.json ./

# Install dependencies using npm ci
# npm ci (clean install) is preferred over npm install for Docker:
# - Respects exact versions in package-lock.json
# - Faster and more reliable for CI/CD environments
# - Prevents version inconsistencies
RUN npm ci --only=production && \
    npm cache clean --force

# ============================================
# Stage 2: Application
# Purpose: Create final production image with only necessary files
# ============================================
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
# Running as root is a security risk
# This user will run the Node.js process
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies from stage 1
# This avoids rebuilding npm dependencies every time
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application source code
# Place this after dependencies to optimize caching
# If only source code changes, Docker uses cached dependency layer
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose the port the application listens on
# This documents which port the service uses
# Default is 5000, can be overridden with -e PORT=3000 when running
EXPOSE 5000

# Health check - verify the container is running
# Docker will check if the app is healthy every 30 seconds
# After 3 failures, container is marked as unhealthy
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { if (res.statusCode !== 200) throw new Error(res.statusCode) })"

# Start the Node.js application
# Use exec form of CMD for proper signal handling
# This ensures the Node process receives SIGTERM for graceful shutdown
CMD ["node", "server.js"]