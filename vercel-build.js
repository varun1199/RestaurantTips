// This is a helper script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the build command
console.log('Building application...');
execSync('npm run build', { stdio: 'inherit' });

// Ensure dist folder exists
if (!fs.existsSync('./dist')) {
  console.error('Build failed: dist folder does not exist');
  process.exit(1);
}

// Ensure index.html exists in the dist folder
if (!fs.existsSync('./dist/index.html')) {
  console.error('Build failed: index.html not found in dist folder');
  process.exit(1);
}

// Create a server.js file to serve the app through Express API
fs.writeFileSync('./api/serve.js', `
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import serverless from 'serverless-http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '..', 'dist');

// Create Express app
const app = express();

// Serve static assets
app.use(express.static(distPath));

// API routes for database tests should remain available
app.get('/api/neon-test', (req, res) => {
  // Proxy the request to the neon-test.js handler
  import('./neon-test.js').then(module => {
    module.default(req, res);
  });
});

app.get('/api/db-config', (req, res) => {
  // Proxy the request to the db-config.js handler
  import('./db-config.js').then(module => {
    module.default(req, res);
  });
});

// All other routes serve the React app
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

// When used in serverless environment
export default serverless(app);

// When used as a standalone server
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  createServer(app).listen(port, () => {
    console.log(\`Server running on port \${port}\`);
  });
}
`);

console.log('Vercel build completed successfully!');