# 🚀 Creators Platform

A full-stack social media platform for content creators to share posts, manage profiles, and upload images with real-time updates and modern DevOps practices.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Docker Deployment](#docker-deployment)
- [Development](#development)
- [Performance Optimization](#performance-optimization)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### User Management
- ✅ User registration and authentication with JWT
- ✅ Secure password hashing (bcrypt)
- ✅ Email validation
- ✅ User profile management
- ✅ Profile image uploads

### Posts & Content
- ✅ Create, read, update, delete posts (CRUD)
- ✅ Rich text support
- ✅ Image uploads via Cloudinary
- ✅ Pagination support
- ✅ Real-time activity with Socket.io

### Performance
- ✅ Database indexing (email, author, createdAt)
- ✅ Query optimization (population, lean queries)
- ✅ Parallel query execution
- ✅ Request timing middleware
- ✅ Gzip compression (frontend)

### DevOps & Infrastructure
- ✅ Multi-stage Docker builds (optimized images)
- ✅ Docker Compose orchestration
- ✅ MongoDB with persistent volumes
- ✅ Health checks for all services
- ✅ Non-root user execution (security)
- ✅ Environment variable management (.env files)
- ✅ Production-ready Nginx configuration

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Lightning-fast build tool
- **React Router v7** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Nginx** - Production web server

### Backend
- **Node.js 18** - Runtime
- **Express.js** - Web framework
- **Mongoose 9** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Socket.io** - WebSocket communication

### Database
- **MongoDB 8.2** - NoSQL database
- **Mongoose schemas** - Data modeling

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx Alpine** - Lightweight web server

---

## 📦 Prerequisites

- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Node.js** 18+ (for local development)
- **npm** 9+ (for local development)
- **Git** (for version control)

### Optional (for local development without Docker)
- MongoDB local instance
- Cloudinary account

---

## 🚀 Quick Start

### ⚙️ Monorepo Setup

This project uses **npm workspaces** to manage dependencies centrally. All packages (client, server, and root) share a single `node_modules` directory at the root level.

### Option 1: Docker Compose (Recommended)

**1. Clone the repository**
```bash
git clone https://github.com/blxckpxnther46/creators-platform.git
cd creators-platform
```

**2. Create environment files**
```bash
# Copy templates
cp server/.env.example server/.env
cp server/.env.docker.example server/.env.docker

# Edit server/.env with your Cloudinary credentials
nano server/.env
```

**Required environment variables in `server/.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/creators-platform
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_URL=cloudinary://your-key:your-secret@your-cloud-name
```

**3. Start the stack**
```bash
docker-compose up --build
```

**4. Access the application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

### Option 2: Local Development (Without Docker)

**1. Install all dependencies** (uses npm workspaces)
```bash
# Install from root (this installs for both client and server)
npm install
```

**2. Setup environment files**
```bash
# Create .env file for server
cp server/.env.example server/.env
nano server/.env  # Add Cloudinary credentials

# Create .env file for client
echo "VITE_API_URL=http://localhost:5000/api" > client/.env
```

**3. Start both servers concurrently**
```bash
# From root directory - starts both client and server
npm run dev
```

Or run them separately:
```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run client
```

**Access at:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 📁 Project Structure

```
creators-platform/              # NPM Workspaces Root
├── node_modules/               # Single shared node_modules (all packages)
├── package.json                # Root workspace config
├── package-lock.json
│
├── client/                      # React frontend workspace
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── common/          # Shared components
│   │   │   │   ├── ConnectionTest.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── PublicRoute.jsx
│   │   │   └── layout/          # Layout components
│   │   │       ├── Header.jsx
│   │   │       └── Footer.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   └── EditPost.jsx
│   │   ├── context/             # State management
│   │   │   └── AuthContext.jsx
│   │   ├── services/            # API & utilities
│   │   │   ├── api.js           # Axios instance
│   │   │   ├── socket.js        # Socket.io setup
│   │   │   └── toast.js         # Notifications
│   │   ├── utils/               # Helper functions
│   │   │   └── auth.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/                  # Static assets
│   ├── nginx.conf               # Nginx configuration
│   ├── Dockerfile               # Production build
│   ├── vite.config.js
│   ├── package.json             # Client workspace package
│   └── eslint.config.js
│
├── server/                      # Express backend workspace
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── cloudinary.js        # Image upload config
│   ├── controllers/             # Business logic
│   │   ├── authController.js
│   │   ├── postController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Error handling
│   │   ├── upload.js            # File upload middleware
│   │   └── timing.js            # Request timing middleware
│   ├── models/                  # Database schemas
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/                  # API endpoints
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── userRoutes.js
│   │   └── upload.js
│   ├── logs/                    # Application logs
│   ├── server.js                # Entry point
│   ├── Dockerfile               # Production build
│   ├── package.json             # Server workspace package
│   └── .env.example
│
├── docker-compose.yml           # Service orchestration
├── .gitignore                   # Git exclusions
├── .env.example                 # Environment template
└── README.md                    # This file
```

**Monorepo Benefits:**
- ✅ Single `node_modules` directory (reduced disk space)
- ✅ Centralized dependency management
- ✅ Faster dependency resolution
- ✅ Easier workspace scripts with `--workspace` flag

---

## ⚙️ Configuration

### Environment Variables

**Root Level (.env)**
- Used by docker-compose for variable substitution

**Server Level (server/.env)**
- Database connection
- JWT secret
- Cloudinary credentials
- API port

**Server Level (server/.env.docker)**
- Docker-specific overrides
- MongoDB host changes (localhost → mongo)
- NODE_ENV override (production)

**Note:** Keep all sensitive credentials in .env files (not committed to git). For production, use environment-specific secrets management.

### Cloudinary Setup

1. Create a free account at https://cloudinary.com
2. Get credentials from dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Add to `server/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
```

---

## 📡 API Documentation

### Authentication Endpoints

**Register User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response: { token, user: { id, username, email } }
```

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response: { token, user: { id, username, email } }
```

**Logout**
```bash
POST /api/auth/logout
Authorization: Bearer <token>

Response: { message: "Logged out successfully" }
```

### Posts Endpoints

**Get All Posts**
```bash
GET /api/posts?page=1&limit=10

Response: { posts: [...], total, pages }
```

**Get Single Post**
```bash
GET /api/posts/:postId

Response: { post: { id, title, content, author, createdAt, ... } }
```

**Create Post**
```bash
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My First Post",
  "content": "This is the content",
  "image": "https://cloudinary-url.com/image.jpg"
}

Response: { post: { id, ... } }
```

**Update Post**
```bash
PUT /api/posts/:postId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}

Response: { post: { id, ... } }
```

**Delete Post**
```bash
DELETE /api/posts/:postId
Authorization: Bearer <token>

Response: { message: "Post deleted successfully" }
```

### User Endpoints

**Get User Profile**
```bash
GET /api/users/:userId

Response: { user: { id, username, email, posts, ... } }
```

**Update Profile**
```bash
PUT /api/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_username",
  "bio": "Creator of amazing content"
}

Response: { user: { id, ... } }
```

### Image Upload

**Upload Image**
```bash
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form data:
  - file: <image_file>

Response: { url: "https://cloudinary-url.com/image.jpg" }
```

### Health Check

**Check Backend Health**
```bash
GET /api/health

Response: { 
  status: "ok",
  timestamp: "2026-05-26T04:53:47Z",
  mongodb: "connected"
}
```

---

## 🗄️ Database Schema

### User Schema
```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  email: String (required, unique, indexed),
  password: String (hashed),
  profileImage: String,
  bio: String,
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Indexes:**
- `email_1` - For fast email lookups during login

### Post Schema
```javascript
{
  _id: ObjectId,
  title: String (required),
  content: String (required),
  image: String,
  author: ObjectId (ref: 'User', required, indexed),
  likes: Number (default: 0),
  comments: [{ user, text, createdAt }],
  createdAt: Date (default: now, indexed),
  updatedAt: Date (default: now)
}
```

**Indexes:**
- `author_1` - For fast post lookups by creator
- `createdAt_-1` - For chronological sorting
- `author_1_createdAt_-1` - Compound index for pagination queries

---

## 🐳 Docker Deployment

### Build Docker Images Manually

```bash
# Backend
docker build -t creators-platform-server:latest ./server

# Frontend
docker build -t creators-platform-client:latest ./client

# Verify
docker images | grep creators-platform
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongo

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Execute command in running container
docker-compose exec server npm run seed

# Scale service (run multiple instances)
docker-compose up --scale server=3
```

### Container Architecture

```
                        ┌─────────────────┐
                        │  Docker Network │
                        │ creators-network│
                        └────────┬────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
    ┌───────┴────────┐   ┌──────┴──────┐   ┌────────┴─────────┐
    │     Client     │   │   Server    │   │      Mongo       │
    │  (Nginx, 3000) │   │  (Node, 5000)   │  (MongoDB, 27017)│
    └────────────────┘   └─────────────┘   └──────────────────┘
         Port 3000            Port 5000           Port 27017
         React App            REST API           Database
         Static Files      WebSocket (Socket)    Persistent Data
```

---

## 💻 Development

### NPM Workspaces Scripts

**Running from root directory:**
```bash
# Install all dependencies for all workspaces
npm install

# Run both client and server concurrently
npm run dev

# Run only server
npm run server

# Run only client
npm run client

# Build client for production
npm run client:build

# Run server in dev mode with nodemon
npm run server:dev
```

### Running Locally

**Start all services from root:**
```bash
npm run dev
```

This will start:
- Backend on http://localhost:5000 with hot reload
- Frontend on http://localhost:5173 with Vite hot reload

**Or run separately:**

**Backend Development Server**
```bash
npm run server
```
Runs on http://localhost:5000 with nodemon hot reload

**Frontend Development Server**
```bash
npm run client
```
Runs on http://localhost:5173 with Vite hot reload

### Available Workspace Scripts

**Server Workspace**
```bash
npm run dev --workspace=server      # Start with nodemon (hot reload)
```

**Client Workspace**
```bash
npm run dev --workspace=client      # Start Vite dev server
npm run build --workspace=client    # Build for production
npm run preview --workspace=client  # Preview production build
npm run lint --workspace=client     # Run ESLint
```

### Database Seeding

```bash
cd server
npm run seed
```

Populates database with:
- 5 sample users
- 20 sample posts
- Realistic relationships

---

## ⚡ Performance Optimization

### Database Indexes
- **User.email** - O(log n) lookups for authentication
- **Post.author** - Fast retrieval of user's posts
- **Post.createdAt** - Efficient chronological sorting
- **Post.author + Post.createdAt** - Optimized pagination queries

### Query Optimization
- **Lean queries** - Exclude unnecessary fields
- **Population** - Fetch related data efficiently
- **Parallel execution** - Promise.all() for multiple queries
- **Pagination** - Limit result sets

### Frontend Performance
- **Vite** - Fast, ES module-based build
- **Code splitting** - Route-based code splitting
- **Gzip compression** - 60-70% smaller assets
- **Caching** - Long-lived cache headers for assets
- **Image optimization** - Cloudinary handles resizing

### Backend Performance
- **Connection pooling** - Reuse MongoDB connections
- **Caching** - Response caching where applicable
- **Rate limiting** - Coming soon
- **Compression** - Gzip for JSON responses

---

## 🔒 Security

### Authentication & Authorization
- ✅ JWT tokens with expiration
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ Protected routes (ProtectedRoute component)
- ✅ User-owned resource verification

### Data Protection
- ✅ Secure .env file handling (not committed)
- ✅ MongoDB schema validation
- ✅ Input sanitization via Mongoose
- ✅ CORS configured

### Container Security
- ✅ Non-root user execution
- ✅ Read-only filesystems where possible
- ✅ Health checks
- ✅ Resource limits (recommended)

### Secrets Management
- **Local development:** Use .env files with example templates
- **Docker deployment:** Use env_file in docker-compose.yml with environment variable overrides
- **Production:** Use managed secrets (AWS Secrets Manager, HashiCorp Vault, or cloud provider equivalents)

---

## 🔧 Troubleshooting

### Docker Issues

**Port already in use**
```bash
# Find process on port
lsof -i :3000
lsof -i :5000
lsof -i :27017

# Kill process
kill -9 <PID>

# Or use different ports in docker-compose.yml
```

**Containers failing to start**
```bash
# Check logs
docker-compose logs -f

# Rebuild images
docker-compose down
docker-compose up --build

# Remove all containers/volumes
docker system prune -a
```

**MongoDB connection refused**
```bash
# Ensure mongo service is running
docker-compose ps

# Check MongoDB health
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"
```

### Application Issues

**Blank screen on frontend**
- Clear browser cache: Ctrl+Shift+Delete
- Check browser console for errors
- Verify backend is running: http://localhost:5000/api/health

**Authentication fails**
- Verify JWT_SECRET in server/.env
- Check token expiration: tokens valid for 7 days
- Clear localStorage: `localStorage.clear()`

**Image upload fails**
- Verify Cloudinary credentials in .env
- Check Cloudinary account quota
- Ensure file size < 10MB

**Database not persisting data**
```bash
# Check volumes
docker volume ls

# Inspect mongo volume
docker volume inspect creators-platform_mongo-data
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Workflow

```bash
# Create new feature branch
git checkout -b feature/my-feature

# Make changes and test
npm run dev

# Commit with meaningful message
git add .
git commit -m "feat: add my-feature"

# Push and create PR
git push origin feature/my-feature
```

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Write meaningful commit messages
- Test your changes before pushing

---

## 📚 Additional Resources

- [Docker Compose Guide](./COMPOSE_GUIDE.md) - Detailed Compose documentation
- [Environment Variables Guide](./SECURE_ENV_VARIABLES.md) - Secrets management
- [Security Guide](./SECURITY_SECRETS_GUIDE.md) - Security best practices
- [Cloudinary Docs](https://cloudinary.com/documentation) - Image upload
- [MongoDB Docs](https://docs.mongodb.com) - Database
- [Express Docs](https://expressjs.com) - Backend framework
- [React Docs](https://react.dev) - Frontend library

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Creators Platform** - Built with ❤️ for content creators

### Connect
- GitHub: [@blxckpxnther46](https://github.com/blxckpxnther46)
- Repository: [creators-platform](https://github.com/blxckpxnther46/creators-platform)

---

## 🎯 Roadmap

### v1.0 (Current)
- ✅ User authentication (JWT)
- ✅ CRUD operations for posts
- ✅ Image uploads (Cloudinary)
- ✅ Docker deployment
- ✅ Database optimization

### v1.1 (Planned)
- 🔄 Real-time notifications (Socket.io)
- 🔄 Post likes and comments
- 🔄 User following system
- 🔄 Search functionality

### v2.0 (Planned)
- 🔄 Mobile app (React Native)
- 🔄 Advanced analytics
- 🔄 Payment integration
- 🔄 Premium features

---

## 💡 Tips

- Use `docker-compose logs -f` to debug issues
- Create `.env.local` for local overrides (git-ignored)
- Run `npm audit fix` regularly for security updates
- Use `docker system prune` to clean up unused images/volumes

---

**Happy creating! 🚀**
