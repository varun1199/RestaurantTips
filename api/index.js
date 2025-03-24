// This is a simple API endpoint for Vercel deployment
const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

// Base API endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Yeti Tips & Till API is running',
    version: '1.0.0',
    status: 'ok'
  });
});

// Test endpoint
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Yeti Tips & Till API!' });
});

// Handle any other API routes
app.all('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Export the serverless function
module.exports = serverless(app);