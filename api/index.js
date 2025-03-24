// Bare minimum serverless function for Vercel - no dependencies
module.exports = (req, res) => {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Respond with a basic JSON message
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({
    message: 'Yeti Tips & Till API is online',
    status: 'ok',
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  }));
};