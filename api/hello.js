// Basic API health check endpoint
export default function handler(req, res) {
  res.status(200).json({
    message: 'Hello from Yeti Tips & Till API!',
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}