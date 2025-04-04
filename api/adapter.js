// API Adapter - Bridge between serverless functions and Express app
// This gradually enables full app functionality while maintaining compatibility with Vercel

export default async function handler(req, res) {
  try {
    // Set CORS headers for API endpoints
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Check if we're in maintenance mode (can be controlled via env var)
    const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
    
    if (maintenanceMode) {
      // In maintenance mode, return a simple JSON response for API endpoints
      return res.status(503).json({
        error: 'Service Temporarily Unavailable',
        message: 'The API is currently in maintenance mode. Please try again later.',
        timestamp: new Date().toISOString(),
        status: 'maintenance'
      });
    }
    
    // Check if database is properly configured
    const hasDbConfig = Boolean(process.env.DATABASE_URL);
    const isNeonDb = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');
    
    // If not in maintenance mode, we can attempt to handle API requests
    // For now, return a simple API feature not enabled response with DB status
    res.status(200).json({
      message: 'This API endpoint is ready to be enabled in the next deployment phase',
      endpoint: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      status: 'transitional',
      database: {
        configured: hasDbConfig,
        type: isNeonDb ? 'Neon PostgreSQL' : (hasDbConfig ? 'PostgreSQL' : 'none'),
        status: hasDbConfig ? 'pending connection test' : 'not configured',
        testEndpoint: '/api/neon-test'
      },
      nextSteps: [
        'Verify DATABASE_URL is set with your Neon connection string',
        'Set SESSION_SECRET for secure cookie handling',
        'Test database connectivity with /api/neon-test',
        'Check Vercel deployment logs for additional details'
      ]
    });
    
    // In the future, we'll add a dynamic import of the actual Express app here
    // And proxy the request/response to it
  } catch (error) {
    console.error('API adapter error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
}