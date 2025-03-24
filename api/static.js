// Bare-bones static HTML function with no dependencies
export default function handler(req, res) {
  // Simple HTML response without async
  const html = '<html><body><h1>Yeti Tips & Till</h1><p>Test Page</p><a href="/api">API Test</a></body></html>';
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}