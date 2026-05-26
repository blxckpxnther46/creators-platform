# 🔒 Security Best Practices: Managing Environment Variables & Secrets

## The Problem We Fixed

❌ **BEFORE**: `.env.docker` containing API keys was committed to git
- Cloudinary API keys exposed
- JWT secrets in version control
- Database credentials in public repository
- Anyone with repo access has production secrets

✅ **AFTER**: Only template files are committed, actual secrets are local

---

## The Correct Approach

### 1. Template Files (Committed to Git)

**Create example files showing required variables:**

```bash
.env.example          # Development template
.env.docker.example   # Docker/production template
```

**These contain NO REAL SECRETS — just placeholders:**

```env
# .env.docker.example
CLOUDINARY_CLOUD_NAME=your_cloud_name          # ← Placeholder
CLOUDINARY_API_KEY=your_api_key                # ← Placeholder
JWT_SECRET=change-this-to-a-real-secret        # ← Placeholder
MONGODB_URI=mongodb://host:27017/db            # ← Can be generic
```

### 2. Local Secret Files (NOT Committed)

**Create real secret files locally:**

```bash
# .gitignore
.env
.env.docker
.env.local
.env.docker.local
```

**Create `.env.docker` locally with REAL values:**

```bash
# Copy template
cp .env.docker.example .env.docker

# Edit with real secrets
nano .env.docker
```

**Real values (NEVER COMMIT):**

```env
CLOUDINARY_CLOUD_NAME=my-real-cloud-name       # ← Real value
CLOUDINARY_API_KEY=a1b2c3d4e5f6g7h8i9j0        # ← Real API key
JWT_SECRET=9f8e7d6c5b4a3z2y1x0w9v8u7t6s5r4q    # ← Real secret
```

---

## Git Security Checklist

### ✅ DO Commit
- Application source code
- Configuration templates (`.example` files)
- Docker files (Dockerfile, docker-compose.yml)
- Documentation
- `.gitignore` file

### ❌ DO NOT Commit
- `.env` files
- `.env.docker` files
- API keys, tokens, passwords
- Private keys (SSH, PGP)
- Database credentials
- AWS access keys
- Any secrets management files

### 📋 Correct .gitignore

```gitignore
# Environment variables - ALL secret files
.env
.env.local
.env.*.local
.env.docker
.env.docker.local

# IDE
.vscode/
.idea/

# Dependencies
node_modules/
dist/
build/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

---

## Production Secret Management

### Option 1: Environment Variables (CI/CD)

**GitHub Actions Example:**

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: docker build -t app:latest .
      - run: docker run \
          -e CLOUDINARY_CLOUD_NAME=${{ secrets.CLOUDINARY_CLOUD_NAME }} \
          -e CLOUDINARY_API_KEY=${{ secrets.CLOUDINARY_API_KEY }} \
          -e JWT_SECRET=${{ secrets.JWT_SECRET }} \
          app:latest
```

**Set secrets in GitHub:**
1. Go to Settings → Secrets and Variables → Actions
2. Click "New repository secret"
3. Add each secret (CLOUDINARY_CLOUD_NAME, JWT_SECRET, etc.)

### Option 2: AWS Secrets Manager

```bash
# Store secrets
aws secretsmanager create-secret \
  --name creators-platform/prod \
  --secret-string '{"CLOUDINARY_API_KEY":"...", "JWT_SECRET":"..."}'

# Retrieve at runtime
docker run \
  -e SECRETS=$(aws secretsmanager get-secret-value \
    --secret-id creators-platform/prod \
    --query SecretString --output text) \
  app:latest
```

### Option 3: Kubernetes Secrets

```bash
# Create secret
kubectl create secret generic backend-secrets \
  --from-literal=JWT_SECRET=your-secret \
  --from-literal=CLOUDINARY_API_KEY=your-key

# Use in deployment
apiVersion: v1
kind: Pod
metadata:
  name: backend
spec:
  containers:
  - name: backend
    image: creators-platform-backend:latest
    env:
    - name: JWT_SECRET
      valueFrom:
        secretKeyRef:
          name: backend-secrets
          key: JWT_SECRET
```

### Option 4: HashiCorp Vault

```bash
# Store secret
vault kv put secret/creators-platform \
  cloudinary_key=... \
  jwt_secret=...

# Retrieve at startup
docker run \
  -e JWT_SECRET=$(vault kv get -field=jwt_secret secret/creators-platform) \
  app:latest
```

---

## If You Accidentally Commit Secrets

### ⚠️ URGENT: Your Secrets Are Exposed!

**Step 1: Immediately Rotate All Secrets**
- Change API keys
- Generate new JWT secrets
- Reset database passwords
- Update all integrations

**Step 2: Remove from Git History**

```bash
# Option A: Remove single file (rewrite history)
git rm --cached .env.docker
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.docker" \
  -r HEAD
git push --force-with-lease

# Option B: Use BFG Repo-Cleaner (easier)
bfg --delete-files .env.docker
bfg --replace-text replacements.txt
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

**Step 3: Notify GitHub**
1. Go to Settings → Security → Secret scanning
2. Review exposed secrets
3. Mark as resolved after rotation

---

## How We Fixed It

### 1. Removed Sensitive File

```bash
git rm --cached .env.docker        # Stop tracking
git commit -m "remove .env.docker"  # Commit removal
git push -f origin branch           # Force push
```

### 2. Created Template Instead

```bash
# Renamed/created .env.docker.example with placeholders
cp .env.docker .env.docker.example
# Remove real secrets from the example
git add .env.docker.example
git commit -m "add .env.docker.example template"
```

### 3. Updated .gitignore

```bash
# Added to .gitignore
.env.docker
.env.docker.local

git add .gitignore
git commit -m "add .env files to gitignore"
```

---

## Workflow for Development

### First Time Setup

```bash
# Clone repo
git clone https://github.com/blxckpxnther46/creators-platform.git
cd creators-platform

# Copy templates to create local secret files
cp .env.example .env
cp .env.docker.example .env.docker

# Edit with YOUR secrets (never committed)
nano .env
nano .env.docker

# Add your API keys, JWT secret, etc
```

### Daily Development

```bash
# .env.docker is in .gitignore, won't be committed
docker-compose up -d

# Your local secrets are safe
cat .env.docker  # Only exists locally
git status       # .env.docker never shows up
```

### Making Changes

```bash
# Update the TEMPLATE when adding new variables
nano .env.docker.example
git add .env.docker.example
git commit -m "add NEW_VAR to .env.docker.example"
git push

# But NEVER commit the actual secrets file
.env.docker  # ← Stays local, not in git
```

---

## Secrets in Our Project

### Current Setup

**Files Committed to Git:**
- ✅ `.env.docker.example` (template with placeholders)
- ✅ `.env` (dev template)
- ✅ `docker-compose.yml` (references .env files, not the secrets)
- ✅ `DOCKER_GUIDE.md` (documentation)

**Files NOT Committed:**
- ❌ `.env` (local development)
- ❌ `.env.docker` (local Docker secrets)
- ❌ `.env.local` (local overrides)
- ❌ `.env.docker.local` (local Docker overrides)

### Required Secrets for Production

For the application to work, you need:

| Secret | Where to Get | Example |
|--------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | [cloudinary.com/console](https://cloudinary.com/console) | `my-cloud-123` |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard | `123456789abcdef` |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard | `abc123xyz789...` |
| `JWT_SECRET` | Generate locally | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `MONGODB_URI` | Atlas or local Mongo | `mongodb+srv://user:pass@cluster.mongodb.net/db` |

---

## Best Practices Summary

| Practice | Why |
|----------|-----|
| Use `.example` templates | Documents required variables without exposing secrets |
| Add `.env*` to `.gitignore` | Prevents accidental commits |
| Rotate secrets if leaked | Renders exposed secrets useless |
| Use secrets management | Centralizes and secures secret distribution |
| Separate dev/staging/prod secrets | Different secrets per environment |
| Log file access in production | Detect unauthorized access attempts |
| Never hardcode secrets | Prevent exposure in source code |

---

## References

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP: Secrets Management](https://owasp.org/www-community/Sensitive_Data_Exposure)
- [git-filter-repo](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
