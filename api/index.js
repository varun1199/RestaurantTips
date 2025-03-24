// Bare-bones serverless function with no dependencies
export default function handler(req, res) {
  // Static text response without async
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send('API is working');
}