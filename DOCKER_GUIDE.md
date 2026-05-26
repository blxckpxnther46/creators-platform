# 🐳 Docker Production Deployment Guide

## Overview

This guide covers containerizing the Creators Platform backend for production deployment.

## Why Docker?

✅ **Consistency**: Same environment across dev, staging, production  
✅ **Scalability**: Easy to run multiple instances with load balancing  
✅ **Isolation**: Dependencies don't interfere with host system  
✅ **Security**: Non-root user, minimal attack surface  
✅ **DevOps**: Cloud deployment, Kubernetes, orchestration  

## Project Structure

```
creators-platform/
├── server/
│   ├── Dockerfile                 # Production-ready multi-stage build
│   ├── .dockerignore             # Files to exclude from image
│   ├── package.json              # Dependencies
│   ├── package-lock.json         # Locked dependency versions
│   └── server.js                 # Entry point
├── docker-compose.yml            # Orchestration: Backend + MongoDB
├── .env.docker                   # Docker-specific environment variables
└── DOCKER_GUIDE.md              # This file
```

## Prerequisites

- **Docker**: [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Docker Compose**: Included with Docker Desktop
- **Environment Variables**: Cloudinary API keys (for image uploads)

## File Descriptions

### 1. Dockerfile (server/Dockerfile)

**Production-Ready Multi-Stage Build**

```dockerfile
# Stage 1: Dependencies
# - Installs npm packages
# - Cached separately to avoid reinstalling on code changes
# - Only includes production dependencies (--only=production)

# Stage 2: Application
# - Copies dependencies from Stage 1
# - Copies application source
# - Runs as non-root user for security
# - Includes health check for orchestration
```

**Key Features:**
- ✅ **Multi-stage build**: Smaller final image size (~300MB vs 500MB+)
- ✅ **npm ci**: Reproducible builds with exact versions
- ✅ **Layer caching**: Dependencies cached if unchanged
- ✅ **Non-root user**: Security best practice
- ✅ **Health checks**: Kubernetes/Docker monitors container health
- ✅ **Alpine Linux**: Minimal base image (~150MB)

### 2. .dockerignore

Excludes files from Docker build context (speeds up build):
- `node_modules` - Already installed in container
- `.env` - Secrets (use .env.docker)
- `.git` - Version control not needed
- `Dockerfile`, `README.md` - Metadata

### 3. docker-compose.yml

Orchestrates multi-container application:
- **Backend Service**: Node.js API on port 5000
- **MongoDB Service**: Database on port 27017
- **Health Checks**: Monitor container status
- **Volumes**: Persistent database storage
- **Networks**: Container communication

### 4. .env.docker

Docker environment variables:
- Database connection strings
- API secrets (JWT)
- Cloud service credentials (Cloudinary)

---

## Getting Started

### Option 1: Docker Compose (Recommended for Development)

**Start everything with one command:**

```bash
# Copy and edit environment variables
cp .env.docker .env.docker.local

# Edit .env.docker.local with your credentials:
# - CLOUDINARY_CLOUD_NAME
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop containers
docker-compose down
```

**Verify it's running:**
```bash
# Check status
docker-compose ps

# Test API health
curl http://localhost:5000/api/health
```

### Option 2: Build and Run Manually

**Build the image:**
```bash
cd server
docker build -t creators-platform-backend:1.0.0 .
```

**Run the container:**
```bash
docker run \
  --name backend \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://localhost:27017/creators-platform \
  -e JWT_SECRET=your-secret \
  -e CLOUDINARY_CLOUD_NAME=your_cloud \
  -e CLOUDINARY_API_KEY=your_key \
  -e CLOUDINARY_API_SECRET=your_secret \
  --restart unless-stopped \
  creators-platform-backend:1.0.0
```

---

## Production Deployment Best Practices

### 1. Image Optimization

**Current Image Metrics:**
- Base image: `node:18-alpine` (~300MB)
- After multi-stage build: ~350MB
- With compression: ~100MB (when pushed to registry)

**Size breakdown:**
```
node:18-alpine           ≈ 180MB
node_modules             ≈ 150MB (production only)
Application code         ≈ 5MB
Total                    ≈ 335MB
```

### 2. Security Hardening

**Already Implemented:**
- ✅ Non-root user (`nodejs:nodejs`)
- ✅ Alpine Linux (minimal attack surface)
- ✅ No dev dependencies in production
- ✅ Health checks for orchestration

**Additional Recommendations:**
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Scan image for vulnerabilities: `docker scan creators-platform-backend:1.0.0`
- Use read-only root filesystem in Kubernetes
- Implement network policies

### 3. Environment Management

**Development (.env):**
```
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/creators-platform
```

**Production (.env.docker):**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/creators-platform
JWT_SECRET=<long-secure-random-string>
```

**Set secrets in production:**
```bash
# Docker Swarm
docker secret create jwt_secret -

# Kubernetes
kubectl create secret generic backend-secrets \
  --from-literal=JWT_SECRET=<value>

# Environment
docker run -e JWT_SECRET=$(aws secretsmanager get-secret-value ...) ...
```

### 4. Database Connection

**Development (docker-compose):**
```
MONGODB_URI=mongodb://mongo:27017/creators-platform
```

**Production (MongoDB Atlas):**
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/creators-platform?retryWrites=true&w=majority
```

### 5. Health Checks

**Container Health:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', ...)"
```

**What it does:**
- Checks `/api/health` every 30 seconds
- Waits 40 seconds for app to start
- Marks unhealthy after 3 failures
- Orchestrators can auto-restart unhealthy containers

**Kubernetes:**
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 5000
  initialDelaySeconds: 40
  periodSeconds: 30
  failureThreshold: 3
```

### 6. Restart Policies

**Docker:**
```bash
--restart unless-stopped  # Auto-restart on crash
```

**Docker Compose:**
```yaml
restart: unless-stopped
```

**Kubernetes:**
- Always restarts failed containers
- Exponential backoff: 10s, 20s, 40s, 80s, 160s, 300s

---

## Common Docker Commands

```bash
# Build image
docker build -t creators-platform-backend:latest server/

# Run container
docker run -p 5000:5000 creators-platform-backend:latest

# View logs
docker logs -f <container_id>

# Execute command in container
docker exec -it <container_id> sh

# Stop container
docker stop <container_id>

# Remove container
docker rm <container_id>

# Remove image
docker rmi creators-platform-backend:latest

# List images
docker images

# List containers
docker ps -a

# Tag for registry
docker tag creators-platform-backend:latest myregistry.azurecr.io/creators-platform-backend:1.0.0

# Push to registry
docker push myregistry.azurecr.io/creators-platform-backend:1.0.0
```

---

## Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View status
docker-compose ps

# Stop all services
docker-compose stop

# Remove all containers and volumes
docker-compose down -v

# Rebuild images
docker-compose build

# Build and start
docker-compose up -d --build

# View service logs
docker-compose logs backend

# Execute command in service
docker-compose exec backend sh

# Scale a service
docker-compose up -d --scale backend=3
```

---

## Troubleshooting

### Issue: Container keeps restarting
```bash
# Check logs
docker-compose logs backend

# Common causes:
# - Missing environment variables
# - MongoDB connection failed
# - Application error
```

### Issue: Port already in use
```bash
# Find process using port 5000
lsof -i :5000

# Or use different port
docker run -p 3000:5000 ...
```

### Issue: Database connection failed
```bash
# Verify MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongo

# Test connection
docker-compose exec backend node -e "const m = require('mongoose'); m.connect(process.env.MONGODB_URI).then(() => console.log('OK')).catch(e => console.error(e.message))"
```

### Issue: Out of disk space
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove all stopped containers
docker container prune
```

---

## Performance Optimization

### 1. Layer Caching Strategy

**Order of operations in Dockerfile:**
1. Base image (not changeable)
2. System packages (rarely change)
3. `package.json` + `npm ci` (changes infrequently)
4. Source code (changes frequently)

**Result:** Code changes only rebuild the top layer, reuse cached dependencies.

### 2. Image Size Reduction

```bash
# Check image layers
docker history creators-platform-backend:latest

# Expected:
# Stage 1 dependencies: ~150MB (npm modules)
# Stage 2 final image: ~300MB (everything)
```

### 3. Build Time Optimization

```bash
# First build (all layers): ~2 minutes
# Subsequent builds (cached): ~10 seconds

# With code change only: ~15 seconds (reuse npm layer)
```

---

## Deployment Scenarios

### Local Development
```bash
docker-compose up -d
# Access at http://localhost:5000
```

### CI/CD Pipeline
```bash
docker build -t creators-backend:${CI_COMMIT_SHA} server/
docker push registry.example.com/creators-backend:${CI_COMMIT_SHA}
```

### Docker Swarm
```bash
docker service create \
  --name backend \
  --publish 5000:5000 \
  --replicas 3 \
  creators-platform-backend:latest
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: creators-platform-backend:latest
        ports:
        - containerPort: 5000
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
```

---

## Next Steps

1. ✅ Build the Docker image: `docker build -t creators-backend server/`
2. ✅ Test with docker-compose: `docker-compose up -d`
3. ✅ Verify health: `curl http://localhost:5000/api/health`
4. ✅ Push to registry: `docker push <registry>/creators-backend:1.0.0`
5. ✅ Deploy to Kubernetes/Docker Swarm

---

## References

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Docker Best Practices](https://snyk.io/blog/10-docker-image-security-best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Alpine Linux Image](https://hub.docker.com/_/alpine)
- [Node.js Official Image](https://hub.docker.com/_/node)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
