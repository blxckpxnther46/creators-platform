# 🐳 Docker Compose - Full Stack Orchestration Guide

## Overview

Docker Compose allows you to define and run your entire multi-container application with a single `docker-compose.yml` file and a few simple commands.

**Without Docker Compose:**
```bash
# 10+ manual commands to start development
docker network create creators-network
docker run -d --name mongo --network creators-network -v mongo-data:/data/db mongo:7-alpine
sleep 5  # Wait for MongoDB
docker build -t creators-backend server/
docker run -d --name server --network creators-network -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/creators-platform \
  -e JWT_SECRET=... creators-backend
docker build -t creators-frontend client/
docker run -d --name client --network creators-network -p 3000:80 creators-frontend
```

**With Docker Compose:**
```bash
docker-compose up
```

---

## What You Have

### Services

| Service | Purpose | Port | Technology |
|---------|---------|------|------------|
| **mongo** | Database | 27017 | MongoDB 7 (Alpine) |
| **server** | REST API | 5000 | Node.js 18 (Express) |
| **client** | Web UI | 3000 | React + Nginx |

### Networking

All services communicate via a bridge network called `creators-network`:

```
Browser (localhost)
    ↓ http://localhost:3000
    ↓
    ├─→ [client] (Nginx)
         ↓ http://server:5000
         ↓
         └─→ [server] (Express)
              ↓ mongodb://mongo:27017
              ↓
              └─→ [mongo] (MongoDB)
```

### Data Persistence

- **mongo-data**: MongoDB database files
- **mongo-config**: MongoDB configuration
- **logs**: Server application logs (optional)

---

## Quick Start

### Prerequisites

1. Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop/))
2. Environment variables configured

### 1. Setup Environment

```bash
# Copy the template
cp .env.example .env

# Edit with your actual values
nano .env  # or code .env

# Required values to fill in:
# - JWT_SECRET
# - CLOUDINARY_CLOUD_NAME
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET
```

### 2. Start the Stack

```bash
# Build and start all services
docker-compose up

# OR start in background
docker-compose up -d

# Watch logs
docker-compose logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **MongoDB**: localhost:27017

### 4. Stop the Stack

```bash
# Stop all services (containers remain)
docker-compose stop

# Stop and remove containers (data persists in volumes)
docker-compose down

# Stop and remove everything including database
docker-compose down -v  # ⚠️ DELETES DATABASE
```

---

## Configuration Details

### Environment Variables (.env)

Located at project root, loaded automatically by Docker Compose.

```env
# Required for all environments
NODE_ENV=production
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-secret

# MongoDB
MONGODB_URI=mongodb://mongo:27017/creators-platform

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

**Important:**
- `.env` is in `.gitignore` — never committed to git
- Use `.env.example` as template
- Create local `.env` with real values
- Keep secrets safe

### Service Dependencies

```
client → depends on → server
server → depends on → mongo
mongo → no dependencies
```

**Startup Order:**
1. MongoDB starts (no dependencies)
2. Server waits for MongoDB to start (may retry for 40s)
3. Client waits for Server to start
4. All services are ready

**Note:** `depends_on` only waits for container start, not application readiness. MongoDB may need 5-10 seconds to fully initialize.

---

## Common Commands

### View Status

```bash
# List running services
docker-compose ps

# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs server
docker-compose logs mongo
docker-compose logs client

# Follow logs in real-time
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

### Manage Services

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop server

# Start specific service
docker-compose start server

# Restart specific service
docker-compose restart server

# Remove containers (keeps volumes)
docker-compose down

# Remove containers and volumes (⚠️ deletes data)
docker-compose down -v

# Remove containers, volumes, and networks
docker-compose down -v --remove-orphans
```

### Development Workflow

```bash
# After code changes, rebuild
docker-compose build

# Rebuild specific service
docker-compose build server
docker-compose build client

# Rebuild and restart
docker-compose up -d --build

# Or rebuild specific service
docker-compose up -d --build server
```

### Debug & Troubleshoot

```bash
# Open shell in container
docker-compose exec server sh
docker-compose exec client sh
docker-compose exec mongo mongosh

# Run one-off command
docker-compose exec server npm list
docker-compose exec mongo mongosh --eval "db.users.find()"

# Check service health
docker-compose exec server curl http://localhost:5000/api/health

# View environment variables
docker-compose exec server env

# View image details
docker-compose images
```

---

## Development vs Production

### Development (Current Setup)

```yaml
# docker-compose.yml
environment:
  NODE_ENV: production  # ← Still set to production
```

**For true development mode, you might want:**
- Hot-reload with volumes
- Nodemon for auto-restart
- Different environment variables

**Current approach:**
- Production Docker build
- Maps ports for local testing
- Uses .env variables

### Production Deployment

When deploying to production:

1. Use cloud MongoDB (MongoDB Atlas)
2. Use environment variable injection from secrets manager
3. Use production environment variables
4. Deploy with orchestration (Kubernetes, Docker Swarm)

---

## Troubleshooting

### Issue: "Port already in use"

```
Error: bind: address already in use
```

**Solution:**
```bash
# Find process on port 5000
lsof -i :5000
netstat -ano | findstr :5000

# Change port in docker-compose.yml
ports:
  - "5001:5000"  # Map to different port

# Or stop the conflicting service
docker-compose down
```

### Issue: "MongoDB connection refused"

```
MongooseError: connect ECONNREFUSED
```

**Solution:**
```bash
# Wait for MongoDB to initialize (usually 5-10 seconds)
docker-compose logs mongo  # Check logs

# Manual restart
docker-compose restart server

# Or check MongoDB is running
docker-compose ps  # Verify mongo status is "Up"
```

### Issue: "Code changes not reflected"

**Solution:**
```bash
# Rebuild after code changes
docker-compose up -d --build

# Or rebuild specific service
docker-compose build server
docker-compose up -d server
```

### Issue: "Environment variables not loading"

**Solution:**
```bash
# Verify .env file exists in project root
ls -la .env

# Verify variables are in correct format
cat .env

# Rebuild containers
docker-compose up -d --build

# Check if variables were loaded
docker-compose exec server env | grep JWT_SECRET
```

### Issue: "Database data lost after docker-compose down"

**Solution:**
```bash
# NEVER use this unless you want to delete the database
docker-compose down -v  # ⚠️ DELETES mongo-data volume

# Use this instead (keeps data)
docker-compose down  # Safe - volumes persist
```

### Issue: "Services can't communicate"

**Solution:**
```bash
# Verify network exists
docker network ls | grep creators

# Check service connectivity
docker-compose exec server curl http://mongo:27017  # Should fail (not HTTP)
docker-compose exec server mongosh --host mongo:27017  # Should work

# Verify service names match
# In docker-compose.yml:
services:
  mongo:  # ← Use this name
    ...

# In connection string:
MONGODB_URI=mongodb://mongo:27017/...  # ← Same name
```

---

## File Structure

```
creators-platform/
├── docker-compose.yml          # ← Orchestration config
├── .env                        # ← Secrets (NOT committed)
├── .env.example               # ← Template (committed)
├── .gitignore                 # ← Includes .env
├── client/
│   ├── Dockerfile             # Multi-stage React build
│   ├── nginx.conf             # SPA routing config
│   └── src/, public/, ...
├── server/
│   ├── Dockerfile             # Multi-stage Node build
│   ├── package.json
│   ├── server.js
│   └── config/, controllers/, ...
└── COMPOSE_GUIDE.md          # This file
```

---

## Performance Tips

### 1. Layer Caching

Docker caches layers based on Dockerfile:
- Base images (rarely change)
- Dependencies (change occasionally)
- Source code (change frequently)

**Benefit:** Rebuilds are fast when only code changes

### 2. Image Sizes

Current setup:
- Frontend: ~45MB (Nginx + dist/)
- Backend: ~335MB (Node + modules)
- MongoDB: ~300MB

**Total pulled:** ~680MB (cached after first pull)

### 3. Startup Time

Typical startup sequence:
```
docker-compose up
  ↓
1. MongoDB starts (~2s)
2. Server starts (~5s)
3. Client starts (~3s)
4. Ready for requests (~10s total)
```

### 4. Resource Usage (Idle)

- MongoDB: ~50-100MB
- Server: ~80-150MB
- Client: ~10-20MB
- Total: ~150-270MB

---

## Advanced Usage

### Custom Network

```yaml
networks:
  creators-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16
```

### Resource Limits

```yaml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Volume Bind Mounts

For development with live reload:

```yaml
volumes:
  - ./server/src:/app/src  # Mount source code
```

### Multi-Environment Files

```bash
# Default
docker-compose up

# With override file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

---

## Deployment

### Docker Swarm

```bash
docker swarm init
docker stack deploy -c docker-compose.yml creators-platform
```

### Kubernetes

```bash
# Convert docker-compose to Kubernetes manifests
kompose convert -f docker-compose.yml

# Or use with Kustomize
kustomize build ./k8s | kubectl apply -f -
```

### CI/CD Integration

```yaml
# GitHub Actions
- run: docker-compose up -d
- run: docker-compose exec server npm test
- run: docker-compose down
```

---

## Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything (⚠️ careful!)
docker system prune -a --volumes
```

---

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Networking in Compose](https://docs.docker.com/compose/networking/)
- [Volumes in Compose](https://docs.docker.com/storage/volumes/)
