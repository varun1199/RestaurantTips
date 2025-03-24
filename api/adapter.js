// Bare-bones adapter function with no dependencies
export default function handler(req, res) {
  // Simple text response without async
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send('Adapter working');
}