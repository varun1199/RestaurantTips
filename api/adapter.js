// Absolute minimal adapter function with error handling
module.exports = async (req, res) => {
  try {
    // Plain text response - simplest possible
    res.status(200).send('Adapter working');
  } catch (error) {
    console.error('Error in adapter route:', error);
    res.status(500).send('Server error');
  }
};