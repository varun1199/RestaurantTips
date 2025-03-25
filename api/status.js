// API route for system status check
import { Client } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // Initialize status object
  const status = {
    app: {
      status: 'online',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      maintenance: process.env.MAINTENANCE_MODE === 'true'
    },
    api: {
      status: 'online',
      endpoints: ['/api/hello', '/api/db-config', '/api/neon-test']
    },
    database: {
      status: 'checking',
      type: 'PostgreSQL (Neon)',
      error: null
    },
    build: {
      status: 'checking',
      error: null
    }
  };
  
  // Check for dist directory and index.html
  try {
    const rootDir = path.resolve(__dirname, '..');
    const distPath = path.join(rootDir, 'dist');
    
    if (fs.existsSync(distPath)) {
      status.build.status = 'available';
      
      if (fs.existsSync(path.join(distPath, 'index.html'))) {
        status.build.indexHtml = true;
      } else {
        status.build.indexHtml = false;
        status.build.error = 'index.html not found in dist directory';
      }
    } else {
      status.build.status = 'missing';
      status.build.error = 'dist directory not found';
    }
  } catch (error) {
    status.build.status = 'error';
    status.build.error = error.message;
  }
  
  // Check database connection
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      status.database.status = 'unconfigured';
      status.database.error = 'DATABASE_URL not defined';
    } else {
      const client = new Client(databaseUrl);
      await client.connect();
      const result = await client.query('SELECT version()');
      await client.end();
      
      status.database.status = 'connected';
      status.database.version = result.rows[0].version.split(' ')[0];
    }
  } catch (error) {
    status.database.status = 'error';
    status.database.error = error.message;
  }
  
  // Determine the overall system status
  if (
    status.database.status === 'connected' && 
    status.api.status === 'online' && 
    status.build.status === 'available'
  ) {
    status.app.status = 'online';
  } else if (status.database.status === 'error') {
    status.app.status = 'degraded';
  } else if (status.build.status !== 'available') {
    status.app.status = 'partial';
  }
  
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    // Return JSON if requested
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(status);
  } else {
    // Return HTML status page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeti Tips & Till - System Status</title>
  <style>
    :root {
      --success: #10b981;
      --success-bg: rgba(16, 185, 129, 0.1);
      --warning: #f59e0b;
      --warning-bg: rgba(245, 158, 11, 0.1);
      --error: #ef4444;
      --error-bg: rgba(239, 68, 68, 0.1);
      --blue: #3b82f6;
      --blue-bg: rgba(59, 130, 246, 0.1);
      --gray: #6b7280;
      --gray-bg: rgba(107, 114, 128, 0.1);
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
      color: #111827;
      line-height: 1.5;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
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
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      margin-left: 0.5rem;
    }
    .status-badge.online {
      background-color: var(--success-bg);
      color: var(--success);
    }
    .status-badge.degraded {
      background-color: var(--warning-bg);
      color: var(--warning);
    }
    .status-badge.error {
      background-color: var(--error-bg);
      color: var(--error);
    }
    .status-badge.partial {
      background-color: var(--warning-bg);
      color: var(--warning);
    }
    .status-badge.connected {
      background-color: var(--success-bg);
      color: var(--success);
    }
    .status-badge.checking {
      background-color: var(--blue-bg);
      color: var(--blue);
    }
    .status-badge.unconfigured {
      background-color: var(--gray-bg);
      color: var(--gray);
    }
    .status-item {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e5e7eb;
      padding: 0.75rem 0;
    }
    .status-item:last-child {
      border-bottom: none;
    }
    .status-name {
      font-weight: 500;
      flex: 1;
    }
    .status-value {
      text-align: right;
      color: #6b7280;
    }
    .status-details {
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      text-decoration: none;
      margin-right: 0.5rem;
      font-weight: 500;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .button.secondary {
      background-color: transparent;
      border: 1px solid #d1d5db;
      color: #374151;
    }
    .button.secondary:hover {
      background-color: #f3f4f6;
    }
    .maintenance-banner {
      background-color: var(--warning-bg);
      color: var(--warning);
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      margin-bottom: 1rem;
      text-align: center;
      font-weight: 500;
    }
    pre {
      background-color: #f3f4f6;
      padding: 0.75rem;
      border-radius: 0.25rem;
      overflow-x: auto;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="logo">Yeti Tips & Till</div>
      <div>
        <a href="/" class="button">Home</a>
        <a href="/api" class="button secondary">API</a>
      </div>
    </div>
  </header>
  
  <div class="container">
    ${status.app.maintenance ? `
    <div class="maintenance-banner">
      The system is currently in maintenance mode. Some features may be unavailable.
    </div>
    ` : ''}
    
    <div class="card">
      <h2>System Status <span class="status-badge ${status.app.status}">${status.app.status}</span></h2>
      <p>Status as of ${new Date().toLocaleString()}</p>
      
      <div class="status-item">
        <div class="status-name">API</div>
        <div class="status-value">
          <span class="status-badge ${status.api.status === 'online' ? 'online' : 'error'}">${status.api.status}</span>
        </div>
      </div>
      
      <div class="status-item">
        <div class="status-name">Database</div>
        <div class="status-value">
          <span class="status-badge ${status.database.status}">${status.database.status}</span>
        </div>
      </div>
      <div class="status-details">
        ${status.database.error ? `Error: ${status.database.error}` : ''}
        ${status.database.version ? `Version: ${status.database.version}` : ''}
      </div>
      
      <div class="status-item">
        <div class="status-name">Frontend Build</div>
        <div class="status-value">
          <span class="status-badge ${status.build.status === 'available' ? 'online' : status.build.status === 'checking' ? 'checking' : 'error'}">${status.build.status}</span>
        </div>
      </div>
      <div class="status-details">
        ${status.build.error ? `Error: ${status.build.error}` : ''}
      </div>
    </div>
    
    <div class="card">
      <h2>API Endpoints</h2>
      <p>The following API endpoints are available for testing:</p>
      
      <div class="status-item">
        <div class="status-name">/api/hello</div>
        <div class="status-value">
          <a href="/api/hello" class="button secondary">Test</a>
        </div>
      </div>
      
      <div class="status-item">
        <div class="status-name">/api/neon-test</div>
        <div class="status-value">
          <a href="/api/neon-test" class="button secondary">Test</a>
        </div>
      </div>
      
      <div class="status-item">
        <div class="status-name">/api/db-config</div>
        <div class="status-value">
          <a href="/api/db-config" class="button secondary">Test</a>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h2>Environment</h2>
      <div class="status-item">
        <div class="status-name">Application Environment</div>
        <div class="status-value">${status.app.environment}</div>
      </div>
      
      <div class="status-item">
        <div class="status-name">Version</div>
        <div class="status-value">${status.app.version}</div>
      </div>
      
      <div class="status-item">
        <div class="status-name">Timestamp</div>
        <div class="status-value">${status.app.timestamp}</div>
      </div>
    </div>
    
    <div class="card">
      <h2>JSON Response</h2>
      <p>You can also get this status as JSON by adding the <code>Accept: application/json</code> header:</p>
      <pre>${JSON.stringify(status, null, 2)}</pre>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  }
}