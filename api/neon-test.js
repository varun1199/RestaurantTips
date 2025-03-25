// Specialized endpoint for testing Neon PostgreSQL connectivity
// This provides a safe way to verify database connectivity without exposing credentials

export default async function handler(req, res) {
  try {
    const neonUrl = process.env.DATABASE_URL;
    
    if (!neonUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'DATABASE_URL environment variable is not set',
        timestamp: new Date().toISOString(),
        instructions: 'Add your Neon PostgreSQL connection string to the DATABASE_URL environment variable in Vercel',
        documentation: 'See https://neon.tech/docs/connect/connect-from-vercel'
      });
    }
    
    // Test if the connection string format is valid for Neon
    const isValidNeonUrl = neonUrl.includes('neon.tech') && neonUrl.startsWith('postgres');
    
    // Check if it's likely using connection pooling
    const isPooled = neonUrl.includes('-pooler.') || neonUrl.includes(':5432/');
    
    // Parse basic URL components for validation
    let urlComponents = { isValid: false };
    try {
      // Strip query parameters for URL parsing
      const baseUrl = neonUrl.split('?')[0];
      const url = new URL(baseUrl);
      urlComponents = {
        isValid: true,
        hasHost: Boolean(url.hostname),
        hasUser: Boolean(url.username),
        hasPassword: Boolean(url.password),
        hasDatabase: url.pathname.length > 1,
        poolingEnabled: isPooled
      };
    } catch (e) {
      urlComponents.parseError = e.message;
    }
    
    // Build response - we'll test actual connectivity in a later phase
    const connectionResponse = {
      status: isValidNeonUrl ? 'configured' : 'warning',
      message: isValidNeonUrl 
        ? 'Neon database connection string detected' 
        : 'DATABASE_URL is set but does not appear to be a Neon connection string',
      provider: 'Neon PostgreSQL',
      timestamp: new Date().toISOString(),
      connection_validation: urlComponents,
      pooling_status: isPooled ? 'detected' : 'not detected (recommended for serverless)',
      documentation_links: [
        'https://neon.tech/docs/connect/connect-from-vercel',
        'https://neon.tech/docs/connect/connection-pooling',
        'https://neon.tech/docs/serverless/serverless-driver'
      ],
      notes: [
        'Connection string format validation only - actual connection test disabled for security',
        'For connection issues, verify your Neon project is active',
        'Check that your IP is allowed in Neon\'s connection settings',
        'Vercel serverless functions should use pooled connections for best performance'
      ],
      neon_tips: [
        'This project includes @neondatabase/serverless for optimal performance',
        'For better cold starts, use connection pooling',
        'Set up separate read/write and read-only endpoints for optimized queries',
        'Enable prepared statements for better performance'
      ]
    };
    
    res.status(200).json(connectionResponse);
  } catch (error) {
    console.error('Neon test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while testing database configuration',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}