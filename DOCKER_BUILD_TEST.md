# Docker Build & Testing Guide

## Prerequisites

Before building and testing the Docker image, ensure:

- ✅ Docker Desktop is installed ([Download here](https://www.docker.com/products/docker-desktop/))
- ✅ Docker daemon is running
- ✅ You have the required environment variables set up

## Build Instructions

### Build the Docker Image

```bash
# Navigate to server directory
cd server

# Build the image
docker build -t creators-platform-backend:1.0.0 .

# Expected output:
# [+] Building 120.5s (15/15) FINISHED
# => STEP 1/15 FROM node:18-alpine
# => [dependencies  1/4] FROM node:18-alpine
# ...
# => writing image sha256:abc123def456...
# => naming to docker.io/library/creators-platform-backend:1.0.0
```

**Build time expectations:**
- First build: ~2-3 minutes (all layers)
- Subsequent builds: ~30-45 seconds (cached layers)

### Verify Image was Created

```bash
# List images
docker images | grep creators-platform-backend

# Expected output:
# REPOSITORY                     TAG        IMAGE ID       CREATED         SIZE
# creators-platform-backend      1.0.0      abc123def456   2 minutes ago    335MB
```

## Testing the Container

### Option 1: Run with docker-compose (Recommended)

```bash
# From project root
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected output:
# NAME                    COMMAND                  SERVICE    STATUS       PORTS
# creators-platform-mongo   "docker-entrypoint..." mongo      Up (healthy) 27017/tcp
# creators-platform-backend "node server.js"       backend    Up (healthy) 0.0.0.0:5000->5000/tcp
```

### Option 2: Run Manual Container

```bash
# Create network for communication
docker network create creators-network

# Run MongoDB
docker run -d \
  --name mongo-test \
  --network creators-network \
  -p 27017:27017 \
  mongo:7-alpine

# Run backend
docker run -d \
  --name backend-test \
  --network creators-network \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo-test:27017/creators-platform \
  -e NODE_ENV=production \
  creators-platform-backend:1.0.0

# Check if container is running
docker ps | grep backend-test
```

## Verification Steps

### 1. Check Container Status

```bash
# View running containers
docker ps

# View container logs
docker logs -f creators-platform-backend

# Expected logs:
# Server running at http://localhost:5000
# Database connected successfully
```

### 2. Test API Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Expected response:
# {
#   "message": "Server is running!",
#   "timestamp": "2026-05-26T10:30:00.000Z"
# }

# Authentication endpoint (should return error without credentials)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Expected: 400 or 401 error (OK - shows API is responding)
```

### 3. Check Container Health

```bash
# View health status
docker inspect creators-platform-backend --format='{{.State.Health.Status}}'

# Expected output: healthy (after 40 seconds)

# If unhealthy, check logs
docker logs creators-platform-backend
```

### 4. Test Database Connection

```bash
# Connect to container shell
docker exec -it creators-platform-backend sh

# Inside container, test MongoDB connection
node -e "const m = require('mongoose'); m.connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(e => console.error(e.message))"

# Expected: Connected!
```

## Cleanup

```bash
# Stop all containers
docker-compose down

# Or manually:
docker stop creators-platform-backend mongo-test
docker rm creators-platform-backend mongo-test

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune
```

## Performance Metrics

### Build Metrics
- Alpine base image: ~180MB
- Final image size: ~335MB
- Build time: ~120 seconds (first time)
- Cached build time: ~30 seconds

### Runtime Metrics
- Memory usage: ~80-100MB (idle)
- Memory usage: ~150-200MB (under load)
- Startup time: ~3-5 seconds
- Health check response: ~10-50ms

## Docker Commands Reference

```bash
# Images
docker images
docker build -t name:tag .
docker inspect image_id
docker rmi image_id

# Containers
docker ps
docker ps -a
docker run -d -p 5000:5000 image:tag
docker stop container_id
docker logs container_id
docker exec -it container_id sh

# Networks
docker network ls
docker network create name
docker network rm name

# Volumes
docker volume ls
docker volume inspect name
docker volume rm name

# Cleanup
docker system prune -a
docker image prune -a
docker volume prune
```

## Troubleshooting

### Container exits immediately
```bash
# Check logs
docker logs container_id

# Common causes:
# - Port already in use: docker run -p 3000:5000 ...
# - Missing environment variables: docker run -e KEY=value ...
# - Database connection failed: Check MONGODB_URI
```

### Port 5000 already in use
```bash
# Find process using port
netstat -ano | findstr :5000

# Or use different port
docker run -p 3000:5000 creators-platform-backend:1.0.0
```

### Database connection refused
```bash
# Verify MongoDB is running
docker ps | grep mongo

# Check if using docker-compose
docker-compose ps

# Verify network connectivity
docker network inspect creators-network
```

### Image build fails
```bash
# Build with no cache
docker build --no-cache -t name:tag .

# Check for errors in previous layers
# Common issues:
# - npm ci fails: Check package-lock.json is valid
# - File not found: Check .dockerignore
# - Syntax error in Dockerfile: Review FROM, COPY, RUN commands
```

## Next Steps

1. ✅ Build the image: `docker build -t creators-platform-backend:1.0.0 server/`
2. ✅ Run with docker-compose: `docker-compose up -d`
3. ✅ Test health endpoint: `curl http://localhost:5000/api/health`
4. ✅ Review logs: `docker-compose logs -f`
5. ✅ Push to registry: `docker push <registry>/creators-platform-backend:1.0.0`
