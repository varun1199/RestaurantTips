// Simple serverless function for Vercel deployment
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Hello from Yeti Tips & Till!',
    timestamp: new Date().toISOString()
  });
};