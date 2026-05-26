# 🔒 Secure Environment Variables in Docker Compose

## Overview

This guide explains how to securely manage environment variables (secrets) in Docker Compose without exposing them in code or Git history.

---

## The Security Problem

### ❌ DANGEROUS: Hardcoded Secrets

```yaml
# docker-compose.yml
server:
  environment:
    JWT_SECRET: super_secret_key_12345
    CLOUDINARY_API_SECRET: my_cloudinary_secret
    MONGODB_URI: mongodb://admin:password123@mongo:27017/db
```

**Why this is dangerous:**
- Secrets are visible in the Compose file
- File gets committed to Git
- GitHub is scanned by bots for exposed secrets
- Anyone with repo access has production credentials
- Even if deleted, secrets remain in Git history

**Real consequences:**
- Database compromise
- Unauthorized API access
- Service abuse and billing charges
- Data theft or destruction

### ✅ SECURE: Environment Files

```yaml
# docker-compose.yml (no secrets visible)
server:
  env_file:
    - ./server/.env
    - ./server/.env.docker
```

**Why this is safe:**
- Secrets stay in .env files (not committed)
- Compose file is clean and safe to commit
- Clear separation of configuration and secrets
- Same approach works in production

---

## File Structure

```
creators-platform/
├── .gitignore                    # Includes .env files
├── .env.example                  # Root-level template (committed)
├── .env                         # Root secrets (NOT committed)
├── docker-compose.yml           # Orchestration (no secrets)
└── server/
    ├── .env                     # Server secrets (NOT committed)
    ├── .env.example             # Server template (committed)
    ├── .env.docker              # Docker overrides (NOT committed)
    └── Dockerfile
```

### Files Committed to Git (✅ Safe)
- `docker-compose.yml` — No secrets
- `.env.example` — Placeholders only
- `server/.env.example` — Placeholders only
- `.gitignore` — Lists ignored files
- This documentation

### Files NOT Committed (🔒 Secrets)
- `.env` — Production secrets (root level)
- `server/.env` — Server configuration secrets
- `server/.env.docker` — Docker-specific secrets

---

## Setup Instructions

### 1. Create server/.env (Local Development)

```bash
# Copy template
cp server/.env.example server/.env

# Edit with your actual values
nano server/.env  # or code server/.env
```

**Add your values:**
```env
MONGODB_URI=mongodb://localhost:27017/creators-platform
JWT_SECRET=your-actual-jwt-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Create server/.env.docker (Docker Compose Override)

```bash
# Copy template
cp server/.env.docker.example server/.env.docker  # or create manually
```

**Contains Docker-specific overrides:**
```env
# Uses 'mongo' service name instead of localhost
MONGODB_URI=mongodb://mongo:27017/creators-platform
NODE_ENV=production
```

**Why separate?**
- Local `.env`: Uses `localhost:27017` for local MongoDB
- Docker `.env.docker`: Uses `mongo:27017` for Docker service discovery
- Loaded order: .env first, then .env.docker overrides

### 3. Verify .gitignore

Ensure `.gitignore` includes all secret files:

```gitignore
# Environment variables - NEVER COMMIT
.env
server/.env
server/.env.docker
server/.env.*.local
.env.docker.local
```

---

## Environment Variable Priority (Load Order)

When Docker Compose loads a service, variables are resolved in this order (highest priority first):

```
1. Inline environment (in docker-compose.yml)
2. env_file values (from .env files)
3. Shell environment variables
4. Dockerfile defaults
```

**Example:**

```yaml
# docker-compose.yml
server:
  env_file:
    - ./server/.env         # PORT=5000
    - ./server/.env.docker  # PORT=5001 (overrides above)
  environment:
    PORT: 5002              # Overrides all above
```

**Result:** `PORT=5002` in the container

---

## Environment Variable Reference

### Root-Level Variables (.env)

Located at project root, used by docker-compose.yml

| Variable | Purpose | Example | Committed? |
|----------|---------|---------|-----------|
| `JWT_SECRET` | JWT signing key | `abc123xyz789...` | ❌ No |
| `CLOUDINARY_CLOUD_NAME` | Cloud storage service | `my-cloud-123` | ❌ No |
| `CLOUDINARY_API_KEY` | Cloudinary credentials | `123456789` | ❌ No |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | `abc123xyz...` | ❌ No |
| `REACT_APP_API_URL` | Frontend → backend | `http://localhost:5000/api` | ✅ Yes (no secrets) |

### Server-Level Variables (server/.env)

Located in `server/` directory, loaded by docker-compose.yml

| Variable | Purpose | Local Dev | Docker | 
|----------|---------|-----------|--------|
| `MONGODB_URI` | Database connection | `mongodb://localhost:27017/...` | Overridden by .env.docker |
| `JWT_SECRET` | Token signing | Production secret | From .env |
| `CLOUDINARY_*` | Image uploads | Production secret | From .env |
| `PORT` | Server port | `5000` | `5000` |
| `NODE_ENV` | Environment | `development` | Overridden to `production` |

---

## Docker Compose Configuration

### Current Setup: Using env_file

```yaml
server:
  env_file:
    - ./server/.env
    - ./server/.env.docker
  # ✅ No secrets in this file
  # ✅ Safe to commit
  # ✅ Secrets are external
```

### Benefits of env_file

| Benefit | Why It Matters |
|---------|-------|
| **Cleaner code** | No secrets visible in YAML |
| **Safer commits** | File can be safely pushed to Git |
| **Environment separation** | Different .env files for different contexts |
| **Easier production** | Same approach works in production (use secrets manager) |
| **Team friendly** | Multiple developers can have different .env values |

### Three Methods Comparison

| Method | Syntax | Secret-Safe? | Use Case |
|--------|--------|---|----------|
| Inline (❌ Avoid) | `PORT: 5000` | ❌ No for secrets | Non-sensitive config only |
| env_file (✅ Use) | `env_file: ./server/.env` | ✅ Yes | Secrets and configuration |
| Substitution (⚠️ Limited) | `PORT: ${PORT}` | ✅ Yes | If root .env exists |

---

## Workflow: Development with Docker Compose

### First Time Setup

```bash
# Clone repository
git clone https://github.com/blxckpxnther46/creators-platform.git
cd creators-platform

# Setup server environment
cp server/.env.example server/.env
cp server/.env.docker.example server/.env.docker  # or create

# Edit with your values
nano server/.env
# Add: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, JWT_SECRET, MONGODB_URI

# Verify .env files are ignored by git
git status  # Should NOT show .env files

# Start the stack
docker-compose up
```

### Daily Development

```bash
# Start stack
docker-compose up

# Make changes in code
nano server/server.js

# Rebuild after changes
docker-compose up -d --build

# Check environment variables loaded
docker-compose exec server env | grep JWT_SECRET
```

### Verify Variables Loaded

```bash
# List all environment variables in server container
docker-compose exec server env

# Output should include:
# JWT_SECRET=your-actual-secret
# CLOUDINARY_CLOUD_NAME=your-cloud
# MONGODB_URI=mongodb://mongo:27017/creators-platform
# ...
```

---

## Troubleshooting

### Issue: Environment variables not loading

**Symptom:** Server can't connect to database or crashes

**Solution:**
```bash
# Verify .env files exist
ls -la server/.env
ls -la server/.env.docker

# Rebuild containers
docker-compose down
docker-compose up --build

# Check what variables were loaded
docker-compose exec server env
```

### Issue: MongoDB connection refused (localhost vs mongo)

**Symptom:** Server logs show connection error

**Root cause:** Using `localhost` in Docker instead of `mongo`

**Solution:**
```bash
# server/.env should have:
MONGODB_URI=mongodb://localhost:27017/creators-platform  # For local dev

# server/.env.docker overrides to:
MONGODB_URI=mongodb://mongo:27017/creators-platform  # For Docker
```

### Issue: Secrets visible in git history

**Symptom:** Accidentally committed `.env` file

**Emergency Fix:**
```bash
# Remove from git history (requires force push)
git rm --cached server/.env
git commit --amend "Remove secrets from history"
git push --force-with-lease

# ⚠️ THEN: Rotate all exposed secrets immediately!
```

---

## Production Deployment

### How Production Secrets Work (NOT .env files)

**Development:**
```
.env file on disk
  ↓
Read by docker-compose
  ↓
Injected into container
```

**Production:**
```
Secrets Manager (AWS, Kubernetes, Heroku)
  ↓
Platform injects at runtime
  ↓
No files on disk
```

### Production Best Practices

✅ **DO:**
- Use platform's secrets management
- Rotate secrets regularly
- Audit who has access
- Log secret usage

❌ **DON'T:**
- Upload .env files to servers
- Commit .env to any branch
- Hardcode secrets in code
- Use same secrets across environments

### Examples

**Heroku:**
```bash
heroku config:set JWT_SECRET=your-production-secret
heroku config:set CLOUDINARY_API_KEY=your-key
```

**AWS:**
```bash
aws secretsmanager create-secret \
  --name creators-platform/jwt-secret \
  --secret-string "your-production-secret"
```

**Kubernetes:**
```bash
kubectl create secret generic backend-secrets \
  --from-literal=JWT_SECRET=your-secret \
  --from-literal=CLOUDINARY_API_KEY=your-key
```

---

## Security Checklist

| Item | Status | How to Verify |
|------|--------|---|
| .env in .gitignore | ✅ | `grep ".env" .gitignore` |
| No secrets in docker-compose.yml | ✅ | `grep "secret\|password\|key" docker-compose.yml` |
| server/.env.example created | ✅ | `ls server/.env.example` |
| server/.env not committed | ✅ | `git status` should not show server/.env |
| .env.docker not committed | ✅ | `git status` should not show .env.docker |
| Variables load successfully | ✅ | `docker-compose exec server env` |
| MongoDB connection works | ✅ | Check logs: `docker-compose logs server` |

---

## References

- [Docker Compose env_file Documentation](https://docs.docker.com/compose/env-file/)
- [12-Factor App: Environment Variables](https://12factor.net/config)
- [GitHub: Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP: Secrets Management](https://owasp.org/www-community/Sensitive_Data_Exposure)
- [Docker Security Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## Summary

| Aspect | Secure Approach |
|--------|---|
| **Store secrets** | In .env files (not in Git) |
| **Load secrets** | Via env_file in docker-compose.yml |
| **Commit templates** | .env.example files (no real values) |
| **Production** | Use platform secrets manager |
| **Team sharing** | Each dev has their own .env file |
| **Documentation** | .env.example shows required variables |

✅ **With this setup, your secrets are safe and your team can work securely.**
