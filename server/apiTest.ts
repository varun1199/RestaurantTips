import { Router } from 'express';
import { Client } from '@neondatabase/serverless';

const router = Router();

// Simple hello endpoint
router.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from Yeti Tips & Till API!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  const environment = process.env.NODE_ENV || 'development';
  const vercelEnv = process.env.VERCEL_ENV || 'local';
  const hasDbUrl = !!process.env.DATABASE_URL;
  
  res.json({
    status: 'ok',
    message: 'Yeti Tips & Till API is healthy',
    timestamp: new Date().toISOString(),
    environment: environment,
    vercelEnvironment: vercelEnv,
    databaseConfigured: hasDbUrl ? 'yes' : 'no',
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true'
  });
});

// Database configuration endpoint
router.get('/db-config', (req, res) => {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const dbUrlRedacted = hasDbUrl ? '**********' : 'Not configured';

  const config = {
    success: true,
    database: {
      type: 'PostgreSQL (Neon)',
      configured: hasDbUrl,
      connectionString: dbUrlRedacted
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };

  res.json(config);
});

// Neon database test endpoint
router.get('/neon-test', async (req, res) => {
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
    // Test the database connection
    const client = new Client(databaseUrl);
    await client.connect();
    
    // Run a simple query to verify the connection
    const result = await client.query('SELECT version()');
    await client.end();
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Successfully connected to the database',
      version: result.rows[0].version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Return error response
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;