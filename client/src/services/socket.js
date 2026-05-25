import { io } from 'socket.io-client';

// Server URL
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create socket instance (not connected yet)
const socket = io(SOCKET_URL, {
  autoConnect: false,   // Don't connect automatically
  withCredentials: true,
  auth: {
    // Token will be passed during connection in components
    token: localStorage.getItem('token') || null
  }
});

export default socket;
