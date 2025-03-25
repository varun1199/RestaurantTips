// API endpoint for database configuration information
export default function handler(req, res) {
  // Check for DATABASE_URL (don't expose the actual connection string)
  const hasDbUrl = !!process.env.DATABASE_URL;
  const dbUrlRedacted = hasDbUrl ? 
    '**********' : 
    'Not configured';

  // Configuration info
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

  // Return the configuration info
  res.status(200).json(config);
}