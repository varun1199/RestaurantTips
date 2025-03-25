// API handler to serve the React application
import express from 'express';
import serverless from 'serverless-http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Check possible dist locations
const possiblePaths = [
  path.join(__dirname, '..', 'dist'),           // /api/../dist
  path.join(__dirname, '..', '..', 'dist'),     // /api/../../dist  
  path.join(process.cwd(), 'dist'),             // Current working directory/dist
  '/var/task/dist',                             // Vercel lambda environment
];

// Find the first path that exists
let distPath = null;
for (const testPath of possiblePaths) {
  if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, 'index.html'))) {
    distPath = testPath;
    break;
  }
}

// Log discovered path and directory content for debugging
console.log('Discovered dist path:', distPath);
if (distPath && fs.existsSync(distPath)) {
  console.log('Directory contents:', fs.readdirSync(distPath));
}

// Set fallback if no dist directory is found
if (!distPath) {
  console.warn('Could not find dist directory, serving fallback HTML');
  
  // Simple fallback HTML if we can't find the app
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Yeti Tips & Till</title>
          <style>
            body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 20px; margin: 20px 0; }
            h1 { color: #2563eb; }
          </style>
        </head>
        <body>
          <h1>Yeti Tips & Till</h1>
          <div class="error">
            <h2>Application Load Error</h2>
            <p>The application could not find the required build files. This might be a temporary deployment issue.</p>
          </div>
          <div class="card">
            <h3>Troubleshooting</h3>
            <p>This error usually happens when the build process didn't complete successfully or the build files couldn't be found.</p>
            <ul>
              <li>Try redeploying the application</li>
              <li>Check the Vercel build logs for errors</li>
              <li>Ensure the build command is working correctly</li>
            </ul>
          </div>
          <div class="card">
            <h3>API Status</h3>
            <p>You can check the API status here:</p>
            <ul>
              <li><a href="/api/hello">API Health Check</a></li>
              <li><a href="/status">System Status</a></li>
              <li><a href="/api/neon-test">Database Test</a></li>
            </ul>
          </div>
        </body>
      </html>
    `);
  });
} else {
  // Serve static files from the dist directory if we found it
  app.use(express.static(distPath));

  // Fallback to index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Export the serverless handler
export default serverless(app);

// If not running in a serverless environment, start a server
if (typeof process.env.VERCEL === 'undefined') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}