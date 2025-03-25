// API endpoint to verify database configuration (without exposing secrets)
export default function handler(req, res) {
  // Get DATABASE_URL from environment variables
  const databaseUrl = process.env.DATABASE_URL;
  
  // Check if DATABASE_URL is defined
  if (!databaseUrl) {
    return res.status(500).json({
      success: false,
      error: 'DATABASE_URL environment variable is not defined',
      instructions: 'Please set the DATABASE_URL environment variable in Vercel project settings'
    });
  }
  
  try {
    // Parse the connection string without exposing credentials
    // Format: postgresql://username:password@hostname:port/database
    const cleanUrl = databaseUrl.replace(/(postgresql:\/\/)([^:]+)(:[^@]+)(@.*)/, '$1***:***$4');
    
    // Extract host information
    const urlObj = new URL(databaseUrl);
    const host = urlObj.hostname;
    const port = urlObj.port || '5432';
    const database = urlObj.pathname.replace('/', '');
    
    // Return configuration information without exposing credentials
    return res.status(200).json({
      success: true,
      config: {
        connectionUrl: cleanUrl,
        host: host,
        port: port,
        database: database,
        ssl: databaseUrl.includes('sslmode=require') ? true : 'default',
        driver: 'postgresql',
        provider: host.includes('neon.tech') ? 'Neon' : 'PostgreSQL'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Return error response
    return res.status(500).json({
      success: false,
      error: 'Invalid database connection string format',
      detail: error.message,
      timestamp: new Date().toISOString()
    });
  }
}