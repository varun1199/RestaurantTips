// Database configuration API endpoint - For validating database connectivity
// This allows testing database connections without fully enabling the application

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed', allowedMethods: ['GET'] });
  }

  try {
    // Check if database URL is configured
    const hasDbConfig = Boolean(process.env.DATABASE_URL);
    
    // Build response without exposing sensitive information
    const dbResponse = {
      status: hasDbConfig ? 'configured' : 'not_configured',
      message: hasDbConfig 
        ? 'Database URL is configured, but connection has not been tested' 
        : 'Database URL is not configured. Set DATABASE_URL in environment variables.',
      timestamp: new Date().toISOString(),
      // Include instructions for both environments
      vercel_instructions: 'Configure DATABASE_URL in Project Settings > Environment Variables',
      test_info: {
        db_type: hasDbConfig ? detectDbType(process.env.DATABASE_URL) : 'unknown',
        connection_test: {
          executed: false,
          message: 'Connection testing is disabled in this diagnostic endpoint'
        }
      }
    };
    
    res.status(200).json(dbResponse);
  } catch (error) {
    console.error('Database config API error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Utility to detect database type from connection string without exposing credentials
function detectDbType(connectionString) {
  if (!connectionString) return 'unknown';
  
  // Check for common database prefixes in connection strings
  const dbTypeMapping = {
    'postgres': 'PostgreSQL',
    'postgresql': 'PostgreSQL',
    'mysql': 'MySQL',
    'mongodb': 'MongoDB',
    'mongodb+srv': 'MongoDB Atlas',
    'sqlite': 'SQLite'
  };
  
  for (const [prefix, dbType] of Object.entries(dbTypeMapping)) {
    if (connectionString.toLowerCase().startsWith(prefix)) {
      return dbType;
    }
  }
  
  return 'unknown';
}