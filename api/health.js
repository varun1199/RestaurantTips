// API health check endpoint 
export default function handler(req, res) {
  // Check the environment
  const environment = process.env.NODE_ENV || 'development';
  const vercelEnv = process.env.VERCEL_ENV || 'local';
  
  // Check for the database URL (don't expose the actual string)
  const hasDbUrl = !!process.env.DATABASE_URL;
  
  // Set proper headers for Vercel Edge Functions
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  
  // Return health check info
  res.status(200).json({
    status: 'ok',
    message: 'Yeti Tips & Till API is healthy',
    timestamp: new Date().toISOString(),
    environment: environment,
    vercelEnvironment: vercelEnv,
    databaseConfigured: hasDbUrl ? 'yes' : 'no',
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true'
  });
}