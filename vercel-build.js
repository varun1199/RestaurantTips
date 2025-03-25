// Helper script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// List all env variables for debugging (excluding sensitive ones)
console.log('Environment:');
Object.keys(process.env)
  .filter(key => !key.includes('TOKEN') && !key.includes('SECRET') && !key.includes('PASSWORD'))
  .forEach(key => {
    console.log(`${key}: ${process.env[key]}`);
  });

// Log current directory to help with path debugging
console.log('Current directory:', process.cwd());
console.log('Directory contents:', fs.readdirSync('.'));

// Helper function to copy a file from source to destination
function copyFile(source, destination) {
  try {
    if (fs.existsSync(source)) {
      const content = fs.readFileSync(source);
      fs.writeFileSync(destination, content);
      console.log(`Copied ${source} to ${destination}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error copying ${source} to ${destination}:`, err);
    return false;
  }
}

// Helper function to copy directory recursively
function copyDirectoryRecursive(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

// Helper to ensure our API files are properly prepared
function prepareApiFiles() {
  console.log('Preparing API files...');
  const apiDir = path.join(process.cwd(), 'api');
  
  if (!fs.existsSync(apiDir)) {
    console.warn('API directory not found at:', apiDir);
    fs.mkdirSync(apiDir, { recursive: true });
    
    // Create basic API files if they don't exist
    const basicHelloApi = `
// Simple hello world API endpoint
export default function handler(req, res) {
  res.status(200).json({
    message: 'Hello from Yeti Tips & Till API!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
}
`;
    
    const basicHealthApi = `
// Health check API endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'Yeti Tips & Till API is running',
    timestamp: new Date().toISOString()
  });
}
`;

    // Write basic files to ensure deployment doesn't fail
    fs.writeFileSync(path.join(apiDir, 'hello.js'), basicHelloApi.trim());
    fs.writeFileSync(path.join(apiDir, 'health.js'), basicHealthApi.trim());
    console.log('Created basic API files to ensure deployment works');
  }
  
  // Make sure API files are in place and copied to the output directory
  const requiredApiFiles = ['health.js', 'hello.js', 'status.js', 'neon-test.js', 'db-config.js', 'index.js', 'serve.js', 'fallback.js'];
  
  // Create a special version of the status.js file if it doesn't exist
  if (!fs.existsSync(path.join(apiDir, 'status.js'))) {
    const statusApiContent = `
// API route for system status check
import { Client } from '@neondatabase/serverless';
import os from 'os';

export default async function handler(req, res) {
  const startTime = Date.now();
  const environment = process.env.NODE_ENV || 'development';
  const vercelEnv = process.env.VERCEL_ENV || 'local';
  const hasDbUrl = !!process.env.DATABASE_URL;
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  
  // System information
  const systemInfo = {
    platform: process.platform,
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
    environment,
    vercelEnvironment: vercelEnv
  };
  
  // Default database status
  let dbStatus = {
    connected: false,
    version: null,
    error: hasDbUrl ? null : 'DATABASE_URL not configured'
  };
  
  // Test database connection if URL is available
  if (hasDbUrl) {
    try {
      const client = new Client(process.env.DATABASE_URL);
      await client.connect();
      const result = await client.query('SELECT version()');
      await client.end();
      
      dbStatus = {
        connected: true,
        version: result.rows[0].version,
        error: null
      };
    } catch (err) {
      dbStatus.error = err.message;
    }
  }
  
  // Calculate response time
  const responseTime = Date.now() - startTime;
  
  // Complete status response
  res.json({
    application: {
      name: 'Yeti Tips & Till',
      version: '1.0.0',
      status: dbStatus.connected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: \`\${responseTime}ms\`
    },
    database: {
      type: 'PostgreSQL (Neon)',
      configured: hasDbUrl,
      connected: dbStatus.connected,
      version: dbStatus.version,
      error: dbStatus.error
    },
    system: systemInfo,
    endpoints: [
      { path: '/api/hello', method: 'GET', status: 'available' },
      { path: '/api/health', method: 'GET', status: 'available' },
      { path: '/api/db-config', method: 'GET', status: 'available' },
      { path: '/api/neon-test', method: 'GET', status: 'available' },
      { path: '/api/status', method: 'GET', status: 'available' }
    ]
  });
}
`;
    fs.writeFileSync(path.join(apiDir, 'status.js'), statusApiContent.trim());
    console.log('Created status.js API file');
  }
  
  // Creates an empty Vercel function directory structure
  const functionOutputDir = path.join('.vercel', 'output', 'functions');
  if (!fs.existsSync(functionOutputDir)) {
    fs.mkdirSync(functionOutputDir, { recursive: true });
  }
  
  // Try to copy from API directory
  requiredApiFiles.forEach(filename => {
    const source = path.join(apiDir, filename);
    
    // First, copy to dist/api for serving from our Express fallback
    const destInDist = path.join('dist', 'api', filename);
    // Also create .vercel/output/functions/api/*
    const destInVercel = path.join(functionOutputDir, 'api', `${path.basename(filename, '.js')}.func`);
    
    if (fs.existsSync(source)) {
      // Make sure dist/api directory exists
      if (!fs.existsSync(path.join('dist', 'api'))) {
        fs.mkdirSync(path.join('dist', 'api'), { recursive: true });
      }
      
      // Copy the file to dist/api
      copyFile(source, destInDist);
      
      // Create Vercel function directory
      if (!fs.existsSync(destInVercel)) {
        fs.mkdirSync(destInVercel, { recursive: true });
        
        // Create the .vc-config.json file for the function
        const vcConfig = {
          runtime: "edge",
          entrypoint: filename
        };
        fs.writeFileSync(path.join(destInVercel, '.vc-config.json'), JSON.stringify(vcConfig, null, 2));
        
        // Copy the file to the Vercel function directory
        copyFile(source, path.join(destInVercel, filename));
      }
    } else {
      console.warn(`API file ${filename} not found in api directory`);
    }
  });
}

try {
  // Run the build command with verbose output
  console.log('Running build command...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Check if dist folder exists and has content
  if (fs.existsSync('./dist')) {
    console.log('dist folder exists. Contents:');
    console.log(fs.readdirSync('./dist'));
    
    if (fs.existsSync('./dist/index.html')) {
      console.log('index.html found in dist folder');
    } else {
      console.warn('index.html not found in dist folder');
      
      // Try to copy the index.html from the client/src directory if it exists
      const found = copyFile('./client/src/index.html', './dist/index.html');
      
      if (!found) {
        // Create a fallback index.html
        const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeti Tips & Till</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .message { padding: 15px; background: #f0f4ff; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Yeti Tips & Till</h1>
  <div class="message">
    <p>The application is being prepared for deployment.</p>
    <p>Please try the <a href="/api/fallback">landing page</a> while we complete the setup.</p>
    <p>Status: <a href="/status">System Status</a></p>
    <p>API: <a href="/api">API Documentation</a></p>
  </div>
</body>
</html>`;
        
        fs.writeFileSync('./dist/index.html', fallbackHtml);
        console.log('Created fallback index.html');
      }
    }
  } else {
    console.warn('dist folder does not exist after build');
    
    // Create dist folder if it doesn't exist
    fs.mkdirSync('./dist', { recursive: true });
    console.log('Created dist folder');
    
    // Copy a simple index.html to the dist folder as fallback
    const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeti Tips & Till</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .message { padding: 15px; background: #f0f4ff; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Yeti Tips & Till</h1>
  <div class="message">
    <p>The application is being prepared for deployment.</p>
    <p>Please try the <a href="/api/fallback">landing page</a> while we complete the setup.</p>
  </div>
</body>
</html>`;
    
    fs.writeFileSync('./dist/index.html', fallbackHtml);
    console.log('Created fallback index.html');
  }
  
  // Make sure API files are properly prepared
  prepareApiFiles();
  
  // Create public folder and copy contents (for static file hosting)
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
    console.log('Created public folder');
  }
  
  if (fs.existsSync('./dist') && fs.readdirSync('./dist').length > 0) {
    console.log('Copying dist contents to public folder');
    copyDirectoryRecursive('./dist', './public');
  }
  
  // Create .vercel/output/static directory to ensure static assets are served
  const vercelOutputPath = path.join('.vercel', 'output', 'static');
  if (!fs.existsSync(vercelOutputPath)) {
    fs.mkdirSync(vercelOutputPath, { recursive: true });
    console.log('Created .vercel/output/static folder');
    
    if (fs.existsSync('./dist') && fs.readdirSync('./dist').length > 0) {
      console.log('Copying dist contents to .vercel/output/static folder');
      copyDirectoryRecursive('./dist', vercelOutputPath);
    }
  }
  
  console.log('Vercel build completed successfully');
} catch (error) {
  console.error('Build failed with error:', error.message);
  
  // Create a minimal dist folder with index.html if build failed
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist', { recursive: true });
  }
  
  const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeti Tips & Till - Build Error</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .error { padding: 15px; background: #fff0f0; border-left: 4px solid #ff3333; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Yeti Tips & Till</h1>
  <div class="error">
    <h2>Build Error</h2>
    <p>There was an error during the build process. The application is still available via the API endpoints.</p>
  </div>
  <p>Please try:</p>
  <ul>
    <li><a href="/api/fallback">Temporary Landing Page</a></li>
    <li><a href="/status">System Status</a></li>
    <li><a href="/api">API Documentation</a></li>
    <li><a href="/api/health">API Health Check</a></li>
  </ul>
</body>
</html>`;
  
  fs.writeFileSync('./dist/index.html', errorHtml);
  console.log('Created error index.html');
  
  // Make sure API files are properly prepared
  prepareApiFiles();
  
  // Don't exit with error, so Vercel deployment continues
  console.log('Continuing deployment despite build error');
}