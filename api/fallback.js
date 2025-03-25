// Fallback page for when the main application isn't available
// This also serves as a temporary landing page during deployment
import { Client } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Check database status
  let dbStatus = {
    status: 'unknown',
    error: null
  };
  
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (databaseUrl) {
      const client = new Client(databaseUrl);
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      
      dbStatus = {
        status: 'connected',
        error: null
      };
    } else {
      dbStatus = {
        status: 'not_configured',
        error: 'DATABASE_URL environment variable is not set'
      };
    }
  } catch (error) {
    dbStatus = {
      status: 'error',
      error: error.message
    };
  }
  
  // Check environment
  const environment = process.env.NODE_ENV || 'development';
  const vercelEnv = process.env.VERCEL_ENV || 'local';
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  
  // Generate dynamic HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeti Tips & Till</title>
  <meta name="description" content="Comprehensive restaurant tip management and financial operations system">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  
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
      --neutral: #6b7280;
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
      max-width: 1000px;
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
      display: flex;
      align-items: center;
    }
    .logo-icon {
      margin-right: 0.5rem;
      font-size: 1.5em;
    }
    .card {
      background-color: var(--card-bg);
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
      transition: background-color 0.15s ease-in-out;
    }
    .button:hover {
      background-color: var(--primary-dark);
    }
    .button.secondary {
      background-color: transparent;
      border: 1px solid #e5e7eb;
      color: var(--text);
    }
    .button.secondary:hover {
      background-color: #f3f4f6;
    }
    .status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .status.online, .status.connected {
      background-color: rgba(16, 185, 129, 0.2);
      color: var(--success);
    }
    .status.warning, .status.deploying {
      background-color: rgba(245, 158, 11, 0.2);
      color: var(--warning);
    }
    .status.offline, .status.error {
      background-color: rgba(239, 68, 68, 0.2);
      color: var(--error);
    }
    .status.unknown, .status.not_configured {
      background-color: rgba(107, 114, 128, 0.2);
      color: var(--neutral);
    }
    .flex {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
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
      padding: 0.5rem;
      border-radius: 0.25rem;
      transition: background-color 0.15s ease-in-out;
    }
    .feature-item:hover {
      background-color: #f3f4f6;
    }
    .feature-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      color: var(--primary);
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .feature-text {
      margin: 0;
    }
    .environment-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: var(--primary-light);
      color: white;
      margin-left: 0.5rem;
    }
    .maintenance-banner {
      background-color: rgba(245, 158, 11, 0.1);
      border-left: 4px solid var(--warning);
      padding: 1rem;
      margin-bottom: 1.5rem;
      border-radius: 0.25rem;
    }
    .api-endpoints {
      margin-top: 1rem;
    }
    .endpoint-item {
      margin-bottom: 0.75rem;
      padding: 0.5rem;
      border-radius: 0.25rem;
      background-color: #f3f4f6;
    }
    .endpoint-path {
      font-family: monospace;
      font-weight: 500;
      color: var(--primary-dark);
    }
    .method {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 0.25rem;
      font-family: monospace;
      font-size: 0.75rem;
      font-weight: bold;
      background-color: var(--primary-light);
      color: white;
      margin-right: 0.5rem;
    }
    .timestamp {
      font-size: 0.875rem;
      color: var(--neutral);
      margin-top: 1rem;
    }
    .footer {
      text-align: center;
      padding: 2rem 0;
      margin-top: 2rem;
      border-top: 1px solid #e5e7eb;
      color: var(--neutral);
    }
    
    @media (max-width: 640px) {
      .grid {
        grid-template-columns: 1fr;
      }
      .flex {
        flex-direction: column;
      }
      .button {
        display: block;
        margin-bottom: 0.5rem;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="logo"><span class="logo-icon">❄️</span> Yeti Tips & Till</div>
      <div class="nav-links">
        <a href="/status" class="button">Status</a>
        <a href="/api" class="button secondary">API</a>
      </div>
    </div>
  </header>
  
  <div class="container">
    ${maintenanceMode ? `
    <div class="maintenance-banner">
      <strong>Maintenance Mode:</strong> The system is currently undergoing maintenance. Some features may be temporarily unavailable.
    </div>
    ` : ''}
    
    <div class="card">
      <h2>Welcome to Yeti Tips & Till</h2>
      <p>
        Your comprehensive restaurant tip management and financial operations system.
        The full application is currently being finalized for deployment.
      </p>
      <p>
        <strong>Application Status:</strong> 
        <span class="status deploying">Deploying</span>
        <span class="environment-badge">${vercelEnv.toUpperCase()}</span>
      </p>
      <div class="flex">
        <a href="/status" class="button">System Status</a>
        <a href="/api/neon-test" class="button">Database Test</a>
        <a href="/api" class="button secondary">API Documentation</a>
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
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <p class="feature-text">Mobile-first responsive design</p>
        </div>
      </div>

      <div class="card">
        <h2>System Status</h2>
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <p class="feature-text">API: <span class="status online">Online</span></p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">${dbStatus.status === 'connected' ? '✓' : '⚠️'}</div>
          <p class="feature-text">Database: <span class="status ${dbStatus.status}">${dbStatus.status === 'connected' ? 'Connected' : dbStatus.status === 'not_configured' ? 'Not Configured' : 'Error'}</span></p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">→</div>
          <p class="feature-text">Frontend: <span class="status deploying">Deploying</span></p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">→</div>
          <p class="feature-text">User Authentication: <span class="status warning">Setting Up</span></p>
        </div>
        
        <div class="api-endpoints">
          <h3>Available API Endpoints</h3>
          <div class="endpoint-item">
            <span class="method">GET</span>
            <span class="endpoint-path">/api/health</span>
            <a href="/api/health" class="button secondary" style="float: right; margin: -2px 0;">Test</a>
          </div>
          <div class="endpoint-item">
            <span class="method">GET</span>
            <span class="endpoint-path">/api/neon-test</span>
            <a href="/api/neon-test" class="button secondary" style="float: right; margin: -2px 0;">Test</a>
          </div>
          <div class="endpoint-item">
            <span class="method">GET</span>
            <span class="endpoint-path">/status</span>
            <a href="/status" class="button secondary" style="float: right; margin: -2px 0;">View</a>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Deployment Information</h2>
      <p>The application is currently being deployed. During this process, you'll see this temporary landing page.</p>
      <p>Once deployment is complete, refresh the page to access the full application.</p>
      
      <h3>Technical Details</h3>
      <p>
        <strong>Environment:</strong> ${environment}<br>
        <strong>Vercel Environment:</strong> ${vercelEnv}<br>
        <strong>Database Status:</strong> ${dbStatus.status}
        ${dbStatus.error ? `<br><strong>Database Error:</strong> ${dbStatus.error}` : ''}
      </p>
      
      <p class="timestamp">Last updated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
  
  <footer class="footer">
    <div class="container">
      <p>Yeti Tips & Till © ${new Date().getFullYear()} - Restaurant Tip Management System</p>
    </div>
  </footer>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}