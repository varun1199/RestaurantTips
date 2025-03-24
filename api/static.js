// Bare minimum static function with error handling
module.exports = async (req, res) => {
  try {
    const html = '<html><body><h1>Yeti Tips & Till</h1><p>Test Page</p><a href="/api">API Test</a></body></html>';
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error in static route:', error);
    res.status(500).send('Server error');
  }
};