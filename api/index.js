// This is a simple serverless function to serve as a health check for Vercel
module.exports = (req, res) => {
  res.status(200).json({
    message: "API is running",
    timestamp: new Date().toISOString()
  });
};