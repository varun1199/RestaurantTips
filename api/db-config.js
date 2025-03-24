// Database configuration endpoint
// This file exposes configuration details (without credentials) for the database

export default async function handler(req, res) {
  try {
    // Check for database configuration
    const hasDatabase = Boolean(process.env.DATABASE_URL);
    const isNeonDb = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');
    
    // Prepare our response
    const dbResponse = {
      status: hasDatabase ? 'configured' : 'not_configured',
      provider: isNeonDb ? 'Neon PostgreSQL' : (hasDatabase ? 'PostgreSQL' : 'none'),
      timestamp: new Date().toISOString(),
      maintenance_mode: process.env.MAINTENANCE_MODE === 'true',
      environment: process.env.NODE_ENV || 'development',
      connection_pool: false, // Will be updated in future iterations
      test_endpoint: '/api/neon-test',
      tips: [
        'For Neon, ensure DATABASE_URL includes your project details',
        'The connection string should start with postgres://',
        'For performance, enable connection pooling in your Neon dashboard',
        'Set SESSION_SECRET for secure cookie handling'
      ]
    };
    
    // Add hints about expected format without revealing actual connection string
    if (hasDatabase) {
      const url = new URL(process.env.DATABASE_URL);
      dbResponse.connection_info = {
        host_type: isNeonDb ? 'neon.tech' : url.hostname,
        has_password: Boolean(url.password),
        has_username: Boolean(url.username),
        has_port: Boolean(url.port),
        ssl_mode: process.env.DATABASE_URL.includes('sslmode=') 
          ? process.env.DATABASE_URL.match(/sslmode=([^&]*)/)?.[1] || 'unknown' 
          : 'not specified'
      };
    }
    
    res.status(200).json(dbResponse);
  } catch (error) {
    console.error('Database config error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving database configuration',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}