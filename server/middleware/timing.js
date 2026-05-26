/**
 * Request Timing Middleware
 * Measures and logs request duration
 * Identifies slow requests (> 1 second)
 */

const timingMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Capture when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests (over 1 second) - always show these
    if (duration > 1000) {
      console.log(`🐌 SLOW REQUEST: ${req.method} ${req.path} - ${duration}ms`);
    }
    
    // Log all requests in development for analysis
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️  ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
};

export default timingMiddleware;
