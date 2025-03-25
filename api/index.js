// API documentation endpoint
export default function handler(req, res) {
  const apiDocs = {
    name: 'Yeti Tips & Till API',
    version: '1.0.0',
    description: 'API for Yeti Tips & Till restaurant management application',
    endpoints: [
      {
        path: '/api/hello',
        method: 'GET',
        description: 'Basic API health check',
        response: {
          message: 'Hello from Yeti Tips & Till API!',
          status: 'ok',
          timestamp: '2023-01-01T00:00:00.000Z'
        }
      },
      {
        path: '/api/neon-test',
        method: 'GET',
        description: 'Test connection to the Neon PostgreSQL database',
        response: {
          success: true,
          message: 'Successfully connected to the database',
          version: 'PostgreSQL 15.x',
          timestamp: '2023-01-01T00:00:00.000Z'
        }
      },
      {
        path: '/api/db-config',
        method: 'GET',
        description: 'Get database configuration information (without exposing credentials)',
        response: {
          success: true,
          config: {
            connectionUrl: 'postgresql://***:***@hostname:5432/database',
            host: 'hostname',
            port: '5432',
            database: 'database',
            ssl: true,
            driver: 'postgresql',
            provider: 'Neon'
          },
          timestamp: '2023-01-01T00:00:00.000Z'
        }
      },
      {
        path: '/status',
        method: 'GET',
        description: 'Get system status information',
        response: 'HTML status page or JSON status object'
      }
    ],
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true'
  };

  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    // Return HTML documentation if requested
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeti Tips & Till API Documentation</title>
  <style>
    :root {
      --primary: #2563eb;
      --primary-light: #3b82f6;
      --primary-dark: #1d4ed8;
      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;
      --code-bg: #f3f4f6;
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
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .endpoint {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .endpoint:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .method {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-family: monospace;
      font-weight: bold;
      background-color: var(--primary-light);
      color: white;
      margin-right: 0.5rem;
    }
    .path {
      font-family: monospace;
      font-weight: bold;
      color: var(--primary-dark);
    }
    pre {
      background-color: var(--code-bg);
      padding: 1rem;
      border-radius: 0.25rem;
      overflow-x: auto;
      font-size: 0.875rem;
    }
    code {
      font-family: monospace;
      background-color: var(--code-bg);
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
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
    .button.secondary {
      background-color: transparent;
      border: 1px solid #d1d5db;
      color: #374151;
    }
    .button.secondary:hover {
      background-color: #f3f4f6;
    }
    .maintenance-banner {
      background-color: rgba(245, 158, 11, 0.1);
      color: var(--warning);
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      margin-bottom: 1rem;
      text-align: center;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="logo">Yeti Tips & Till API</div>
      <div>
        <a href="/" class="button">Home</a>
        <a href="/status" class="button secondary">Status</a>
      </div>
    </div>
  </header>
  
  <div class="container">
    ${apiDocs.maintenanceMode ? `
    <div class="maintenance-banner">
      The API is currently in maintenance mode. Some endpoints may be unavailable.
    </div>` : ''}
    
    <div class="card">
      <h2>API Documentation</h2>
      <p>${apiDocs.description}</p>
      <p><strong>Version:</strong> ${apiDocs.version}</p>
    </div>
    
    <div class="card">
      <h2>Endpoints</h2>
      
      ${apiDocs.endpoints.map(endpoint => `
      <div class="endpoint">
        <h3><span class="method">${endpoint.method}</span> <span class="path">${endpoint.path}</span></h3>
        <p>${endpoint.description}</p>
        <h4>Example Response:</h4>
        <pre>${JSON.stringify(endpoint.response, null, 2)}</pre>
        <a href="${endpoint.path}" class="button secondary">Try It</a>
      </div>
      `).join('')}
    </div>
    
    <div class="card">
      <h2>Authentication</h2>
      <p>Most API endpoints require authentication through cookies or session tokens when the application is fully deployed.</p>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } else {
    // Return JSON by default
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(apiDocs);
  }
}