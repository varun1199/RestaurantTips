// Minimal static HTML function
module.exports = (req, res) => {
  // Ultra-simplified HTML - just the basics for testing
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeti Tips & Till | Deployment Test</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .btn { display: inline-block; background: #2563eb; color: white; padding: 8px 16px; 
          text-decoration: none; border-radius: 4px; margin-top: 15px; }
  </style>
</head>
<body>
  <h1>Yeti Tips & Till</h1>
  <p>This is a simplified deployment test page</p>
  
  <div class="card">
    <h2>Deployment Status</h2>
    <p>Testing static rendering on Vercel</p>
    <a href="/api" class="btn">Check API</a>
  </div>
  
  <div class="card">
    <h2>Troubleshooting</h2>
    <p>If you're seeing this page, static HTML rendering is working. Next, check if the API endpoint is accessible.</p>
  </div>
  
  <footer>
    <p>&copy; ${new Date().getFullYear()} Yeti Tips & Till</p>
  </footer>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
};