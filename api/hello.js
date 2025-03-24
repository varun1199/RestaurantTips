// Bare-bones text response function with no dependencies
export default function handler(req, res) {
  // Simple text response without async
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send('Hello from Yeti Tips & Till!');
}