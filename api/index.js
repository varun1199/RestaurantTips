// Simplified serverless function for Vercel to avoid bundle issues
const express = require('express');
const serverless = require('serverless-http');

// Create a simple Express app
const app = express();
app.use(express.json());

// Basic health check endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Yeti Tips & Till API is running on Vercel',
    version: '1.0.0',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Handle other API routes
app.all('/api/*', (req, res) => {
  res.status(200).json({
    message: 'API endpoint received',
    endpoint: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Create the serverless handler
const serverHandler = serverless(app);

// Export the serverless handler function
module.exports = (req, res) => {
  console.log(`API request received: ${req.method} ${req.url}`);
  return serverHandler(req, res);
};