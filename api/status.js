// Status check endpoint
export default function handler(req, res) {
  // Collect basic environment info
  const nodeVersion = process.version;
  const environment = process.env.NODE_ENV || 'development';
  const timestamp = new Date().toISOString();
  
  // Create a simple status response
  const status = {
    status: 'online',
    timestamp,
    environment,
    node: nodeVersion,
    platform: process.platform,
    deploymentRegion: process.env.VERCEL_REGION || 'unknown',
    routes: {
      '/': 'Root page',
      '/api': 'API index',
      '/api/hello': 'Hello endpoint',
      '/api/status': 'This status endpoint'
    }
  };
  
  // Send as JSON
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(status, null, 2));
}