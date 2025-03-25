// Status endpoint - displays environment and system information
export default function handler(req, res) {
  try {
    // Create environment report (without revealing secrets)
    const envReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      region: process.env.VERCEL_REGION || 'unknown',
      runtime: {
        node: process.versions.node,
        v8: process.versions.v8,
      },
      // Include a placeholder for DB status - don't actually test DB to avoid errors
      database: {
        configured: process.env.DATABASE_URL ? 'yes' : 'no',
        // Don't include actual connection string for security
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
      },
      vercel: {
        id: process.env.VERCEL_ID || 'unknown',
        environment: process.env.VERCEL_ENV || 'unknown',
        // More Vercel-specific environment variables could be added here
      }
    };

    // Create a nice HTML page to display this information
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeti Tips API Status</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
    h1, h2, h3 {
      margin-top: 0;
    }
    pre {
      background-color: #1f2937;
      color: #f9fafb;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      font-size: 0.875rem;
    }
    .card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
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
    .status.offline {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    .status.warning {
      background-color: #fef3c7;
      color: #92400e;
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
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.5rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Yeti Tips API Status</h1>
      <span class="status online">API Online</span>
    </div>
  </header>
  
  <div class="container">
    <div class="card">
      <h2>API Health Check</h2>
      <table>
        <tr>
          <th>Service</th>
          <th>Status</th>
          <th>Details</th>
        </tr>
        <tr>
          <td>API Endpoint</td>
          <td><span class="status online">Online</span></td>
          <td>Responding to requests</td>
        </tr>
        <tr>
          <td>Database</td>
          <td><span class="status ${process.env.DATABASE_URL ? (process.env.DATABASE_URL.includes('neon.tech') ? 'warning' : 'warning') : 'offline'}">${process.env.DATABASE_URL ? (process.env.DATABASE_URL.includes('neon.tech') ? 'Neon PostgreSQL' : 'PostgreSQL') : 'Not Configured'}</span></td>
          <td>${process.env.DATABASE_URL ? (process.env.DATABASE_URL.includes('neon.tech') ? 'Neon serverless adapter enabled' : 'Connection string detected') : 'No database URL configured'} <a href="/api/neon-test" class="button" style="padding: 0.1rem 0.5rem; font-size: 0.75rem;">Test Connection</a></td>
        </tr>
        <tr>
          <td>DB Optimization</td>
          <td><span class="status ${process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? 'online' : 'offline'}">${process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? 'Enabled' : 'Not Available'}</span></td>
          <td>${process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? '@neondatabase/serverless package ready for optimized connections' : 'Only available with Neon PostgreSQL'}</td>
        </tr>
        <tr>
          <td>Environment</td>
          <td><span class="status online">Active</span></td>
          <td>${process.env.NODE_ENV || 'development'}</td>
        </tr>
      </table>
    </div>

    <div class="card">
      <h2>System Information</h2>
      <pre>${JSON.stringify(envReport, null, 2)}</pre>
    </div>

    <div class="card">
      <h2>Quick Links</h2>
      <p>
        <a href="/" class="button">Home Page</a>
        <a href="/api" class="button">API Root</a>
        <a href="/api/hello" class="button">Hello API</a>
        <a href="/api/neon-test" class="button">Test Neon DB</a>
        <a href="/api/db-config" class="button">DB Config</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    // Handle any unexpected errors
    res.status(500).send(`Error: ${error.message}`);
  }
}