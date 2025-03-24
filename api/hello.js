// Bare minimum function with explicit error handling
module.exports = async (req, res) => {
  try {
    // Plain text response - simplest possible
    res.status(200).send('Hello from Yeti Tips & Till!');
  } catch (error) {
    console.error('Error in hello route:', error);
    res.status(500).send('Server error');
  }
};