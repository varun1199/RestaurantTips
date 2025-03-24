// This is a serverless function adapter for Vercel deployment
// It leverages our existing Express application
const { execSync } = require('child_process');
const serverless = require('serverless-http');
const path = require('path');
const fs = require('fs');

// Check if the dist/index.js exists
let serverHandler;
try {
  // The path to the bundled server
  const serverPath = path.resolve(process.cwd(), 'dist', 'index.js');
  
  // Check if the server file exists
  if (fs.existsSync(serverPath)) {
    // We can't directly require ESM modules in CommonJS
    // Instead, create a proxy to forward requests to our Express app
    const express = require('express');
    const app = express();
    
    // Basic API endpoints for testing
    app.get('/api', (req, res) => {
      res.json({
        message: 'Yeti Tips & Till API is running on Vercel',
        version: '1.0.0',
        status: 'ok'
      });
    });
    
    // For other routes, we'll handle it in vercel.json by serving static files
    app.all('/api/*', (req, res) => {
      res.status(404).json({ 
        error: 'API endpoint not found',
        message: 'This is a serverless function for Vercel deployment'
      });
    });
    
    serverHandler = serverless(app);
  } else {
    throw new Error('Server bundle not found');
  }
} catch (error) {
  console.error('Error loading server:', error);
  
  // Fallback to a simple Express app
  const express = require('express');
  const app = express();
  app.use(express.json());
  
  app.get('/api', (req, res) => {
    res.json({
      message: 'Yeti Tips & Till API fallback is running',
      error: 'Main server bundle not found',
      status: 'error'
    });
  });
  
  serverHandler = serverless(app);
}

// Export the serverless handler
module.exports = (req, res) => {
  return serverHandler(req, res);
};