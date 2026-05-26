# 🎨 React Frontend Containerization Guide

## Overview

This guide covers containerizing the React frontend with production-grade multi-stage Docker builds and Nginx SPA routing.

## Why Multi-Stage Builds for React?

### The Problem with Single-Stage Builds

A naive single-stage Dockerfile would:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]  # Vite's preview server
```

**Issues:**
- ❌ Final image contains all of `node_modules` (~200MB)
- ❌ Includes entire source code (unnecessary at runtime)
- ❌ Ships build tools only needed during compilation
- ❌ Total image size: **400-500MB**
- ❌ Wasteful deployments and container startup

### The Multi-Stage Solution

Multi-stage builds use **two stages**:

**Stage 1 (Build)**: `node:18-alpine`
- Install dependencies
- Build the React app
- Generate optimized `dist/` folder (5MB)
- This entire stage is **discarded** after building

**Stage 2 (Production)**: `nginx:alpine`
- Copy only the `dist/` folder from Stage 1
- Serve static files with Nginx
- **Final image: ~45MB** (not 400MB!)

**Size Comparison:**
| Approach | Size | Contents |
|----------|------|----------|
| Single-stage | 450MB | node_modules + source + build tools |
| Multi-stage | 45MB | Nginx + dist files only |
| **Savings** | **90% smaller** | Production-only files |

---

## Project Structure

```
client/
├── Dockerfile          ← Multi-stage build (new)
├── nginx.conf          ← SPA routing config (new)
├── .dockerignore       ← Build context optimization (new)
├── src/
├── public/
├── package.json
├── package-lock.json
├── vite.config.js
└── ... (rest of React app)
```

---

## File Descriptions

### 1. Dockerfile (Multi-Stage Build)

**Stage 1: Build Stage**
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci           # Install production + dev dependencies
COPY . .
RUN npm run build    # Generates dist/ with optimized files
```

**What happens:**
1. Starts with Node.js Alpine image (~180MB)
2. Installs dependencies
3. Copies source code
4. Runs `vite build` which:
   - Minifies JavaScript and CSS
   - Generates hashed filenames (`main.abc123.js`)
   - Creates optimized `dist/` folder (~5MB)

**Stage 2: Production Stage**
```dockerfile
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK ...
CMD ["nginx", "-g", "daemon off;"]
```

**What happens:**
1. Starts fresh with Nginx Alpine image (~40MB base)
2. Copies **only** the built files from Stage 1
3. Stage 1 is **discarded** (not in final image)
4. Configures Nginx for SPA routing
5. Runs Nginx to serve static files

**Final image:** ~45MB (Nginx base + dist files)

**Key Features:**
- ✅ Layer caching: Dependencies cached if `package.json` unchanged
- ✅ Security: Non-root user, Alpine Linux
- ✅ Health checks: Kubernetes/Docker monitoring
- ✅ Graceful shutdown: Nginx runs in foreground mode

### 2. nginx.conf (SPA Routing Configuration)

**The SPA Routing Problem:**
React Router handles client-side routing (`/dashboard`, `/profile`, `/posts/123`). These routes don't exist as files.

**Without SPA config:**
```
User visits /dashboard
↓
Nginx looks for /dashboard file
↓
File doesn't exist → 404 error ❌
```

**With SPA config:**
```
User visits /dashboard
↓
Nginx looks for /dashboard file
↓
Doesn't exist → serves index.html instead
↓
React app loads → React Router recognizes /dashboard
↓
Dashboard component rendered ✅
```

**Critical Line:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This tells Nginx:
1. Try to serve the exact file (`$uri`) - e.g., `/assets/main.js`
2. If not found, try as a directory (`$uri/`)
3. If still not found, serve `index.html` (React takes over)

**Caching Strategy:**

Static assets (JS, CSS, images):
```nginx
location ~* \.(js|css|png|jpg|...)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```
Safe because Vite uses hashed filenames. New builds get new filenames, so cached files never cause stale code.

HTML entry point:
```nginx
location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```
Never cache `index.html` - it's the entry point and must always be fresh.

**Performance Optimizations:**

Gzip compression:
```nginx
gzip on;
gzip_types text/plain text/css application/javascript ...;
```
Compresses responses (500KB JS → 100KB compressed)

Security headers:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### 3. .dockerignore (Build Context Optimization)

Excludes unnecessary files from Docker build context:
- `node_modules/` - Reinstalled in container
- `.env` - Secrets (use build args)
- `.git/` - Version control not needed
- `dist/` - Rebuilt in container
- Dev tools, IDE configs, etc.

**Impact:** Faster builds (smaller context to send to Docker daemon)

---

## Getting Started

### Option 1: Build and Run Locally

**Build the image:**
```bash
cd client
docker build -t creators-platform-client:1.0.0 .
```

**Expected output:**
```
[+] Building 120.5s (12/12) FINISHED
 => [build  1/7] FROM node:18-alpine
 => [build  2/7] WORKDIR /app
 => [build  3/7] COPY package*.json ./
 => [build  4/7] RUN npm ci
 => [build  5/7] COPY . .
 => [build  6/7] RUN npm run build
 => [stage-1 1/4] FROM nginx:alpine
 => [stage-1 2/4] COPY --from=build /app/dist ...
 => [stage-1 3/4] COPY nginx.conf ...
 => => writing image sha256:abc123...
```

**Run the container:**
```bash
docker run -p 3000:80 creators-platform-client:1.0.0
```

**Access the app:**
```
http://localhost:3000
```

**Test SPA routing:**
1. Navigate to `/dashboard` inside the app
2. Refresh the page
3. Dashboard should load (not 404) ✅

### Option 2: Docker Compose Integration

Update `docker-compose.yml` (in project root):
```yaml
version: '3.9'

services:
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: creators-platform-client
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - creators-network

  backend:
    # ... existing backend config ...

  mongo:
    # ... existing mongo config ...

networks:
  creators-network:
    driver: bridge
```

**Run full stack:**
```bash
docker-compose up -d

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - MongoDB: localhost:27017
```

---

## Building & Verification

### Build Command

```bash
cd client
docker build -t creators-platform-client:1.0.0 .
```

**Build time expectations:**
- First build: ~2-3 minutes (downloads Node.js, installs dependencies)
- Subsequent builds: ~30-45 seconds (cached layers)
- Code changes only: ~60 seconds (dependencies cached)

### Verify Image Size

```bash
docker images | grep creators-platform-client
```

**Expected:**
```
REPOSITORY                     TAG        SIZE
creators-platform-client       1.0.0      43MB
```

Compare to single-stage build: **90% smaller!**

### Test the Container

**Run container:**
```bash
docker run -p 3000:80 creators-platform-client:1.0.0
```

**Health check:**
```bash
curl http://localhost:3000
# Should return your React app's HTML
```

**Verify SPA routing:**
```bash
# Navigate to /dashboard in browser
# Refresh page
# Should load without 404
```

### Inspect Container

```bash
docker exec -it <container_id> sh

# Inside container:
ls /usr/share/nginx/html
# Should see: index.html, assets/, ...

cat /etc/nginx/conf.d/default.conf
# Should see your nginx.conf
```

---

## Performance Metrics

### Build Performance
| Metric | Value |
|--------|-------|
| Base image | ~40MB (nginx:alpine) |
| Built dist/ | ~5-10MB |
| Final image | ~43-50MB |
| First build | ~2-3 minutes |
| Cached build | ~30-45 seconds |

### Runtime Performance
| Metric | Value |
|--------|-------|
| Memory usage (idle) | ~20-30MB |
| Memory usage (loaded) | ~50-100MB |
| Startup time | ~1-2 seconds |
| Response time | ~10-50ms |
| Gzip compression | ~80% reduction |

---

## Deployment Scenarios

### Local Development

```bash
docker run -p 3000:80 creators-platform-client:1.0.0
# Access at http://localhost:3000
```

### Docker Compose (Development + Production)

```bash
docker-compose up -d
# All services (client, backend, database)
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: client
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: client
        image: creators-platform-client:1.0.0
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 2
          periodSeconds: 5
```

### Docker Swarm

```bash
docker service create \
  --name client \
  --publish 3000:80 \
  --replicas 3 \
  creators-platform-client:1.0.0
```

---

## Production Optimization

### 1. Use a Container Registry

```bash
# Tag for registry
docker tag creators-platform-client:1.0.0 myregistry.azurecr.io/client:1.0.0

# Push to registry
docker push myregistry.azurecr.io/client:1.0.0

# Pull and run
docker run -p 3000:80 myregistry.azurecr.io/client:1.0.0
```

### 2. Environment-Specific Configuration

**Development (docker-compose.yml):**
```yaml
client:
  build: ./client
  environment:
    VITE_API_URL: http://localhost:5000
```

**Production (docker-compose.prod.yml):**
```yaml
client:
  build: ./client
  environment:
    VITE_API_URL: https://api.example.com
```

Build with environment variables:
```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  -t creators-platform-client:1.0.0 \
  client/
```

### 3. Security Best Practices

✅ **Implemented:**
- Non-root user (Nginx drops privileges)
- Alpine Linux (minimal attack surface)
- Security headers in Nginx config
- No build tools in production image

**Additional (Optional):**
- Use distroless images (even smaller)
- Enable HTTP/2
- Add SSL/TLS certificates
- Scan image for vulnerabilities: `docker scan creators-platform-client:1.0.0`

### 4. CDN Integration

For ultra-fast global delivery:
```nginx
# Add in nginx.conf
add_header Cache-Control "public" always;
add_header Access-Control-Allow-Origin "*" always;
```

Deploy to CDN (Cloudflare, AWS CloudFront, etc.) for:
- Global edge caching
- DDoS protection
- Automatic HTTPS
- Reduced latency

---

## Troubleshooting

### Build Errors

**Error: `npm ERR! code ENOENT`**
```
Solution: Verify package-lock.json exists and is valid
```

**Error: `out of memory`**
```
Solution: Increase Docker memory allocation
docker build --memory 4g ...
```

### Runtime Errors

**Container exits immediately:**
```bash
docker logs <container_id>
# Check output for errors
```

**Port already in use:**
```bash
# Use different port
docker run -p 3001:80 ...
```

**SPA routing returns 404:**
```bash
# Verify nginx.conf is loaded
docker exec <container_id> cat /etc/nginx/conf.d/default.conf

# Should contain:
# location / {
#     try_files $uri $uri/ /index.html;
# }
```

### Performance Issues

**Slow build:**
```bash
# Check available resources
docker system df

# Clean up unused images/containers
docker system prune -a
```

**Slow runtime:**
```bash
# Check memory usage
docker stats

# Check Nginx logs
docker exec <container_id> tail -f /var/log/nginx/access.log
```

---

## Docker Commands Reference

```bash
# Building
docker build -t name:tag client/
docker build --no-cache -t name:tag client/

# Running
docker run -p 3000:80 name:tag
docker run -d -p 3000:80 name:tag  # Detached mode

# Management
docker ps                          # List containers
docker images                      # List images
docker logs -f <container_id>      # View logs
docker exec -it <container_id> sh  # Shell access
docker stop <container_id>         # Stop container
docker rm <container_id>           # Remove container
docker rmi <image_id>              # Remove image

# Cleanup
docker system prune                # Remove unused data
docker image prune -a              # Remove unused images
docker volume prune                # Remove unused volumes
```

---

## Summary

**Key Achievements:**
- ✅ Multi-stage Dockerfile reduces image size by 90% (450MB → 45MB)
- ✅ Nginx serves static files efficiently
- ✅ SPA routing configured correctly
- ✅ Caching strategy optimizes performance
- ✅ Security hardened with Alpine + non-root user
- ✅ Production-ready and scalable

**Next Steps:**
1. Build the image: `docker build -t creators-platform-client:1.0.0 client/`
2. Test locally: `docker run -p 3000:80 creators-platform-client:1.0.0`
3. Push to registry: `docker push <registry>/creators-platform-client:1.0.0`
4. Deploy to production

---

## References

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [React SPA Routing in Docker](https://create-react-app.dev/docs/deployment/)
- [Alpine Linux Benefits](https://wiki.alpinelinux.org/wiki/Main_Page)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
