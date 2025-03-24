// Simplified adapter with no dependencies
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Basic authentication endpoints - just return JSON stubs for now
  if (req.url === '/api/login') {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({
      message: 'Login endpoint (stub)',
      status: 'ok',
      info: 'This is a simplified version for testing deployment'
    }));
    return;
  }
  
  if (req.url === '/api/user') {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({
      message: 'User info endpoint (stub)',
      authenticated: false,
      info: 'This is a simplified version for testing deployment'
    }));
    return;
  }
  
  // Default handler
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({
    message: 'Yeti Tips & Till API adapter',
    path: req.url,
    method: req.method,
    info: 'This is a simplified version for troubleshooting deployment'
  }));
};