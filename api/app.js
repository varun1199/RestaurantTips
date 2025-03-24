// Static app renderer - most basic possible version
export default function handler(req, res) {
  // Very basic HTML page that loads a static version of the app
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeti Tips & Till</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 0;
      color: #111827;
      background-color: #f9fafb;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      background-color: #2563eb;
      color: white;
      padding: 1.5rem 0;
      margin-bottom: 2rem;
    }
    header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      margin: 0;
      font-size: 1.8rem;
    }
    .card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      text-decoration: none;
      margin-right: 0.5rem;
    }
    .status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .status.online {
      background-color: #d1fae5;
      color: #065f46;
    }
    .status.maintenance {
      background-color: #fef3c7;
      color: #92400e;
    }
    .message {
      padding: 1rem;
      border-radius: 0.375rem;
      border-left: 4px solid #2563eb;
      background-color: #eff6ff;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Yeti Tips & Till</h1>
      <span class="status maintenance">Maintenance Mode</span>
    </div>
  </header>
  
  <div class="container">
    <div class="message">
      This is a static version of the Yeti Tips & Till application. The full application 
      is temporarily in maintenance mode while we complete the deployment process.
    </div>

    <div class="card">
      <h2>Application Status</h2>
      <p>
        The Yeti Tips & Till application has been deployed to Vercel, but is currently 
        serving this static page while we complete the setup.
      </p>
      <p>
        <strong>Status:</strong> <span class="status online">API Online</span>
      </p>
      <p>
        <a href="/status" class="button">Check API Status</a>
        <a href="/api" class="button">Test API Endpoint</a>
      </p>
    </div>

    <div class="card">
      <h2>Features</h2>
      <ul>
        <li>Employee tip management and distribution</li>
        <li>Till calculation and reconciliation</li>
        <li>Staff scheduling and management</li>
        <li>Financial reporting and analytics</li>
        <li>Role-based access control</li>
      </ul>
    </div>

    <div class="card">
      <h2>Next Steps</h2>
      <p>
        To complete the deployment of the full application:
      </p>
      <ol>
        <li>Ensure all environment variables are correctly set in Vercel</li>
        <li>Set up your database connection</li>
        <li>Use the build commands in the Vercel configuration</li>
      </ol>
    </div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}