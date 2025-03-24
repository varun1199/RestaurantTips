// Ultra minimal serverless function with error handling
module.exports = async (req, res) => {
  try {
    // Simplest possible response, no dependencies, no complex logic
    res.status(200).send('API is working');
  } catch (error) {
    // Explicit error handling
    console.error('Error in API route:', error);
    res.status(500).send('Server error');
  }
};