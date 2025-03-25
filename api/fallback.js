// Fallback page for when the main application isn't available
export default function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeti Tips & Till</title>
  <style>
    :root {
      --primary: #2563eb;
      --primary-light: #3b82f6;
      --primary-dark: #1d4ed8;
      --bg: #f9fafb;
      --text: #111827;
      --card-bg: white;
      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 0;
      color: var(--text);
      background-color: var(--bg);
      line-height: 1.5;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    header {
      background-color: var(--primary);
      color: white;
      padding: 1.5rem 0;
      margin-bottom: 2rem;
    }
    header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    h1 {
      margin: 0;
      font-size: 1.8rem;
    }
    .logo {
      font-weight: bold;
      font-size: 1.8rem;
    }
    .card {
      background-color: var(--card-bg);
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .button {
      display: inline-block;
      background-color: var(--primary);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      text-decoration: none;
      margin-right: 0.5rem;
      font-weight: 500;
    }
    .button:hover {
      background-color: var(--primary-dark);
    }
    .status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .status.online {
      background-color: rgba(16, 185, 129, 0.2);
      color: var(--success);
    }
    .status.warning {
      background-color: rgba(245, 158, 11, 0.2);
      color: var(--warning);
    }
    .status.offline {
      background-color: rgba(239, 68, 68, 0.2);
      color: var(--error);
    }
    .flex {
      display: flex;
      gap: 1rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .feature-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      color: var(--primary);
    }
    .feature-text {
      margin: 0;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="logo">Yeti Tips & Till</div>
      <div>
        <a href="/status" class="button">Status</a>
        <a href="/api" class="button">API</a>
      </div>
    </div>
  </header>
  
  <div class="container">
    <div class="card">
      <h2>Welcome to Yeti Tips & Till</h2>
      <p>
        Your comprehensive restaurant tip management and financial operations system.
        The full application is being finalized for deployment.
      </p>
      <p>
        <strong>Status:</strong> <span class="status warning">Getting Ready</span>
      </p>
      <div class="flex">
        <a href="/status" class="button">Check System Status</a>
        <a href="/api/neon-test" class="button">Test Database</a>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Features</h2>
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <p class="feature-text">Employee tip management and distribution</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <p class="feature-text">Till calculation and reconciliation</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <p class="feature-text">Staff scheduling and management</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <p class="feature-text">Financial reporting and analytics</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <p class="feature-text">Role-based access control</p>
        </div>
      </div>

      <div class="card">
        <h2>System Status</h2>
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <p class="feature-text">API: <span class="status online">Online</span></p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <p class="feature-text">Database: <span class="status online">Connected</span></p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">→</div>
          <p class="feature-text">Frontend: <span class="status warning">Deploying</span></p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">→</div>
          <p class="feature-text">User Authentication: <span class="status warning">Setting Up</span></p>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Deployment Information</h2>
      <p>Your application should be fully deployed soon. You can check the API endpoints in the meantime.</p>
      <p>Updated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}