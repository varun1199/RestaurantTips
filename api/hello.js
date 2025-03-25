// Simple hello world API endpoint
export default function handler(req, res) {
  res.status(200).json({
    message: 'Hello from Yeti Tips & Till API!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
}