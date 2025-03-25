// API documentation endpoint
export default function handler(req, res) {
  // Set common headers for both responses
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  
  // If client accepts HTML, send HTML documentation
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeti Tips & Till - API Documentation</title>
  <style>
    :root {
      --primary: #2563eb;
      --primary-dark: #1d4ed8;
      --bg: #f9fafb;
      --text: #111827;
      --code-bg: #f3f4f6;
      --code-border: #e5e7eb;
      --text-secondary: #4b5563;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
    }
    header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    .logo {
      font-weight: bold;
      font-size: 1.8rem;
    }
    h1, h2, h3 {
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    h1 {
      margin-top: 0;
      font-size: 2rem;
    }
    h2 {
      font-size: 1.5rem;
      border-bottom: 1px solid var(--code-border);
      padding-bottom: 0.5rem;
    }
    pre, code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9rem;
    }
    pre {
      background-color: var(--code-bg);
      border: 1px solid var(--code-border);
      border-radius: 0.25rem;
      padding: 1rem;
      overflow-x: auto;
    }
    code {
      background-color: var(--code-bg);
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    .endpoint {
      margin-bottom: 2rem;
    }
    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
    .method {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      background-color: var(--primary);
      color: white;
      font-weight: bold;
      min-width: 60px;
      text-align: center;
    }
    .path {
      font-weight: 500;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .description {
      margin-bottom: 1rem;
    }
    .button {
      display: inline-block;
      background-color: var(--primary);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      text-decoration: none;
      transition: background-color 0.15s ease-in-out;
    }
    .button:hover {
      background-color: var(--primary-dark);
    }
    .button.secondary {
      background-color: transparent;
      color: var(--text);
      border: 1px solid var(--code-border);
    }
    .button.secondary:hover {
      background-color: var(--code-bg);
    }
    .response-example {
      margin-top: 1rem;
    }
    .table-container {
      overflow-x: auto;
      margin-bottom: 1rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      text-align: left;
      padding: 0.5rem;
      border-bottom: 1px solid var(--code-border);
    }
    th {
      font-weight: 500;
      background-color: var(--code-bg);
    }
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid var(--code-border);
      color: var(--text-secondary);
      font-size: 0.875rem;
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
    <h1>API Documentation</h1>
    <p>Welcome to the Yeti Tips & Till API documentation. This guide provides information about the available endpoints and how to use them.</p>
    
    <h2>Status & Health</h2>
    
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method">GET</span>
        <span class="path">/api/health</span>
      </div>
      <div class="description">
        <p>Check if the API is running and healthy.</p>
      </div>
      
      <h3>Example Response</h3>
      <pre><code>{
  "status": "ok",
  "message": "Yeti Tips & Till API is healthy",
  "timestamp": "2025-03-06T14:25:43.511Z",
  "environment": "production",
  "vercelEnvironment": "production",
  "databaseConfigured": "yes",
  "maintenanceMode": false
}</code></pre>

      <a href="/api/health" class="button secondary" target="_blank">Try it</a>
    </div>
    
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method">GET</span>
        <span class="path">/status</span>
      </div>
      <div class="description">
        <p>Get detailed system status including API, database, and frontend build status.</p>
      </div>
      
      <h3>Example Response</h3>
      <pre><code>{
  "app": {
    "status": "online",
    "environment": "production",
    "version": "1.0.0",
    "timestamp": "2025-03-06T14:26:12.733Z",
    "maintenance": false
  },
  "api": {
    "status": "online",
    "endpoints": ["/api/hello", "/api/db-config", "/api/neon-test"]
  },
  "database": {
    "status": "connected",
    "type": "PostgreSQL (Neon)",
    "version": "15.3"
  },
  "build": {
    "status": "available",
    "indexHtml": true
  }
}</code></pre>

      <a href="/status" class="button secondary" target="_blank">Try it</a>
    </div>
    
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method">GET</span>
        <span class="path">/api/status</span>
      </div>
      <div class="description">
        <p>Alternative endpoint for detailed system status (same as /status).</p>
      </div>
      
      <h3>Example Response</h3>
      <pre><code>{
  "application": {
    "name": "Yeti Tips & Till",
    "version": "1.0.0",
    "status": "healthy", 
    "environment": "production",
    "vercelEnvironment": "production",
    "maintenanceMode": false,
    "timestamp": "2025-03-06T14:26:55.733Z",
    "responseTime": "128ms"
  },
  "database": {
    "type": "PostgreSQL (Neon)",
    "configured": true,
    "connected": true,
    "version": "PostgreSQL 15.3 on x86_64-pc-linux-gnu...",
    "error": null
  },
  "system": {
    "platform": "linux",
    "nodeVersion": "v20.18.1",
    "uptime": 3600,
    "memory": { "total": 4096, "free": 2048 },
    "cpus": 2
  },
  "endpoints": [
    { "path": "/api/hello", "method": "GET", "status": "available" },
    { "path": "/api/health", "method": "GET", "status": "available" },
    { "path": "/api/db-config", "method": "GET", "status": "available" },
    { "path": "/api/neon-test", "method": "GET", "status": "available" },
    { "path": "/api/status", "method": "GET", "status": "available" }
  ]
}</code></pre>

      <a href="/api/status" class="button secondary" target="_blank">Try it</a>
    </div>
    
    <h2>Database</h2>
    
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method">GET</span>
        <span class="path">/api/db-config</span>
      </div>
      <div class="description">
        <p>Get information about the database configuration (without exposing sensitive details).</p>
      </div>
      
      <h3>Example Response</h3>
      <pre><code>{
  "success": true,
  "database": {
    "type": "PostgreSQL (Neon)",
    "configured": true,
    "connectionString": "**********"
  },
  "environment": "production",
  "timestamp": "2025-03-06T14:27:03.123Z"
}</code></pre>

      <a href="/api/db-config" class="button secondary" target="_blank">Try it</a>
    </div>
    
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method">GET</span>
        <span class="path">/api/neon-test</span>
      </div>
      <div class="description">
        <p>Test the connection to the Neon PostgreSQL database.</p>
      </div>
      
      <h3>Example Response (Success)</h3>
      <pre><code>{
  "success": true,
  "message": "Successfully connected to the database",
  "version": "PostgreSQL 15.3 on x86_64-pc-linux-gnu, compiled by gcc...",
  "timestamp": "2025-03-06T14:28:15.456Z"
}</code></pre>

      <h3>Example Response (Error)</h3>
      <pre><code>{
  "success": false,
  "error": "Connection error: could not connect to server",
  "timestamp": "2025-03-06T14:29:45.789Z"
}</code></pre>

      <a href="/api/neon-test" class="button secondary" target="_blank">Try it</a>
    </div>
    
    <h2>Miscellaneous</h2>
    
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method">GET</span>
        <span class="path">/api/hello</span>
      </div>
      <div class="description">
        <p>A simple hello world endpoint for testing.</p>
      </div>
      
      <h3>Example Response</h3>
      <pre><code>{
  "message": "Hello from Yeti Tips & Till API!",
  "timestamp": "2025-03-06T14:30:22.123Z",
  "environment": "production",
  "version": "1.0.0"
}</code></pre>

      <a href="/api/hello" class="button secondary" target="_blank">Try it</a>
    </div>
    
    <div class="footer">
      <p>Yeti Tips & Till API Documentation | Updated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } else {
    // Otherwise send JSON documentation
    const apiDocs = {
      api: 'Yeti Tips & Till',
      version: '1.0.0',
      description: 'API for the Yeti Tips & Till restaurant tip management application',
      endpoints: [
        {
          path: '/api/health',
          method: 'GET',
          description: 'Check if the API is running and healthy'
        },
        {
          path: '/status',
          method: 'GET',
          description: 'Get detailed system status including API, database, and frontend build status'
        },
        {
          path: '/api/status',
          method: 'GET',
          description: 'Alternative endpoint for detailed system status (same as /status)'
        },
        {
          path: '/api/db-config',
          method: 'GET',
          description: 'Get information about the database configuration (without exposing sensitive details)'
        },
        {
          path: '/api/neon-test',
          method: 'GET',
          description: 'Test the connection to the Neon PostgreSQL database'
        },
        {
          path: '/api/hello',
          method: 'GET',
          description: 'A simple hello world endpoint for testing'
        }
      ],
      timestamp: new Date().toISOString(),
      documentation_url: '/api',
      status_url: '/status'
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(apiDocs);
  }
}