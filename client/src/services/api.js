import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000, // 10 second timeout
  // NOTE: Do NOT set Content-Type globally - it breaks FormData uploads
  // When uploading files, axios will automatically set Content-Type to multipart/form-data
});

// Request interceptor - attach token to outgoing requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Return modified config
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response interceptor - handle authentication errors globally
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    // Handle error responses
    
    // Check if error is 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login
      window.location.href = '/login';
      
      // Show message (optional)
      console.log('Session expired. Please login again.');
    }
    
    // Return the error for component to handle
    return Promise.reject(error);
  }
);

export default api;
