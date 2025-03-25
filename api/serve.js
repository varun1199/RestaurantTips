// API handler to serve the React application
import express from 'express';
import serverless from 'serverless-http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Debug information about the environment
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL_ENV:', process.env.VERCEL_ENV);

// Check multiple possible dist locations
const possiblePaths = [
  path.join(__dirname, '..', 'dist'),               // /api/../dist
  path.join(__dirname, '..', '..', 'dist'),         // /api/../../dist  
  path.join(process.cwd(), 'dist'),                 // Current working directory/dist
  '/var/task/dist',                                 // Vercel lambda environment
  path.join(process.cwd(), 'public'),               // For static sites
  '.vercel/output/static'                           // Vercel build output
];

// Find the first path that exists
let distPath = null;
for (const testPath of possiblePaths) {
  console.log('Checking path:', testPath);
  if (fs.existsSync(testPath)) {
    console.log(`Path ${testPath} exists!`);
    const hasIndexHtml = fs.existsSync(path.join(testPath, 'index.html'));
    console.log(`${testPath} has index.html:`, hasIndexHtml);
    
    if (hasIndexHtml) {
      distPath = testPath;
      break;
    }
  }
}

// Log discovered path and directory content for debugging
console.log('Selected dist path:', distPath);
if (distPath && fs.existsSync(distPath)) {
  try {
    console.log('Directory contents:', fs.readdirSync(distPath));
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}

// Define API routes first - these take precedence over static files
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Yeti Tips & Till API is running',
    timestamp: new Date().toISOString(),
    distPath: distPath || 'Not found',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Proxy API requests to their corresponding handlers
app.all('/api/hello', (req, res) => {
  import('./hello.js').then(module => {
    module.default(req, res);
  }).catch(err => {
    console.error('Error importing hello handler:', err);
    res.status(500).json({ error: 'Failed to load API handler' });
  });
});

app.all('/api/neon-test', (req, res) => {
  import('./neon-test.js').then(module => {
    module.default(req, res);
  }).catch(err => {
    console.error('Error importing neon-test handler:', err);
    res.status(500).json({ error: 'Failed to load API handler' });
  });
});

app.all('/api/db-config', (req, res) => {
  import('./db-config.js').then(module => {
    module.default(req, res);
  }).catch(err => {
    console.error('Error importing db-config handler:', err);
    res.status(500).json({ error: 'Failed to load API handler' });
  });
});

app.all('/status', (req, res) => {
  import('./status.js').then(module => {
    module.default(req, res);
  }).catch(err => {
    console.error('Error importing status handler:', err);
    res.status(500).json({ error: 'Failed to load status handler' });
  });
});

// Special handler for the root API endpoint to serve documentation
app.all('/api', (req, res) => {
  import('./index.js').then(module => {
    module.default(req, res);
  }).catch(err => {
    console.error('Error importing API index handler:', err);
    res.status(500).json({ error: 'Failed to load API documentation' });
  });
});

// Set fallback if no dist directory is found
if (!distPath) {
  console.warn('Could not find dist directory, serving fallback HTML');
  
  // Redirect to the fallback endpoint
  app.get('*', (req, res) => {
    // Load the fallback handler dynamically
    import('./fallback.js').then(module => {
      module.default(req, res);
    }).catch(err => {
      console.error('Error importing fallback handler:', err);
      
      // Super simple fallback if the fallback handler fails
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Yeti Tips & Till</title>
            <style>
              body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>Yeti Tips & Till</h1>
            <div class="error">
              <h2>Application Error</h2>
              <p>The application could not be loaded. Please check the deployment configuration.</p>
            </div>
            <p>The API is available at: <a href="/api">/api</a></p>
            <p>System status: <a href="/status">/status</a></p>
          </body>
        </html>
      `);
    });
  });
} else {
  console.log('Serving static files from:', distPath);
  
  // Handle static assets
  app.use(express.static(distPath, {
    // Set caching headers for better performance
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      const fileExt = path.extname(filePath).toLowerCase();
      
      // Cache static assets for 1 day, HTML for 5 minutes
      if (fileExt === '.html') {
        res.setHeader('Cache-Control', 'public, max-age=300');
      } else if (['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(fileExt)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
    }
  }));

  // Fallback to index.html for client-side routing (after API routes)
  app.get('*', (req, res) => {
    // Check if path exists, otherwise fallback to index.html
    const filePath = path.join(distPath, req.path);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.sendFile(filePath);
    } else {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Export the serverless handler
const handler = serverless(app);
export default handler;

// If not running in a serverless environment, start a server
if (typeof process.env.VERCEL === 'undefined') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}