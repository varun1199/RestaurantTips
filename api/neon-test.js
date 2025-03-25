// API route to test Neon database connection
import { Client } from '@neondatabase/serverless';

export default async function handler(req, res) {
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
}