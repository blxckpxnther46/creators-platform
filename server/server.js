import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
console.log('📂 Looking for .env at:', envPath);
console.log('📂 .env exists:', fs.existsSync(envPath) ? '✅' : '❌');

// Load environment variables from the server directory BEFORE any other imports
const result = dotenv.config({ path: envPath });
console.log('📂 dotenv.config() result:', result.parsed ? '✅ loaded' : '❌ failed');
if (result.parsed) {
  console.log('📂 Found variables:', Object.keys(result.parsed).length);
  console.log('📂 CLOUDINARY_API_KEY present:', !!result.parsed.CLOUDINARY_API_KEY);
}

// NOW import everything else - environment variables are ready
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Dynamically import cloudinary-dependent routes AFTER env vars are loaded
const { default: uploadRoutes } = await import('./routes/upload.js');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const httpServer = createServer(app);

// Initialize Socket.io with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware - CORS MUST be first
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes(io)); // Pass io to postRoutes
app.use('/api/upload', uploadRoutes); // File upload endpoint

// Health check endpoint (keep this for testing)
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date(),
    database: 'Connected'
  });
});

// 404 handler - must come before error handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error-handling middleware (MUST be last)
app.use(errorHandler);

// Socket.io middleware - verify JWT before accepting connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    socket.data.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id} | User: ${socket.data.user.email}`);

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.id} (${reason})`);
  });
});

// Make io accessible to routes if needed
app.set('io', io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
});