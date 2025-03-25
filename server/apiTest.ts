import { Router } from 'express';
import { Client } from '@neondatabase/serverless';
import os from 'os';
import { version as nodeVersion } from 'process';

const APP_VERSION = '1.0.0';
const router = Router();

// Simple hello endpoint
router.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from Yeti Tips & Till API!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: APP_VERSION
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
  } catch (err) {
    // Cast the unknown error to an object with message and stack properties
    const error = err as { message: string, stack?: string };
    
    // Return error response
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Comprehensive status endpoint for monitoring
router.get('/status', async (req, res) => {
  const startTime = Date.now();
  const environment = process.env.NODE_ENV || 'development';
  const vercelEnv = process.env.VERCEL_ENV || 'local';
  const hasDbUrl = !!process.env.DATABASE_URL;
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  
  // System information
  const systemInfo = {
    platform: process.platform,
    nodeVersion: nodeVersion,
    uptime: Math.floor(process.uptime()),
    totalMemory: Math.round(os.totalmem() / (1024 * 1024)),
    freeMemory: Math.round(os.freemem() / (1024 * 1024)),
    cpus: os.cpus().length
  };
  
  // Default database status
  let dbStatus = {
    connected: false,
    version: null,
    error: hasDbUrl ? null : 'DATABASE_URL not configured'
  };
  
  // Test database connection if URL is available
  if (hasDbUrl) {
    try {
      const client = new Client(process.env.DATABASE_URL!);
      await client.connect();
      const result = await client.query('SELECT version()');
      await client.end();
      
      dbStatus = {
        connected: true,
        version: result.rows[0].version,
        error: null
      };
    } catch (err) {
      const error = err as { message: string };
      dbStatus.error = error.message;
    }
  }
  
  // Calculate response time
  const responseTime = Date.now() - startTime;
  
  // Complete status response
  res.json({
    application: {
      name: 'Yeti Tips & Till',
      version: APP_VERSION,
      status: dbStatus.connected ? 'healthy' : 'degraded',
      environment,
      vercelEnvironment: vercelEnv,
      maintenanceMode,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    },
    database: {
      type: 'PostgreSQL (Neon)',
      configured: hasDbUrl,
      connected: dbStatus.connected,
      version: dbStatus.version,
      error: dbStatus.error
    },
    system: systemInfo,
    endpoints: [
      { path: '/api/hello', method: 'GET', status: 'available' },
      { path: '/api/health', method: 'GET', status: 'available' },
      { path: '/api/db-config', method: 'GET', status: 'available' },
      { path: '/api/neon-test', method: 'GET', status: 'available' },
      { path: '/api/status', method: 'GET', status: 'available' }
    ]
  });
});

export default router;