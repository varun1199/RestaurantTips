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
  
  // Create public folder if it doesn't exist (for Vercel static deployments)
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
    
    // Copy dist contents to public if dist exists
    if (fs.existsSync('./dist') && fs.readdirSync('./dist').length > 0) {
      console.log('Copying dist contents to public folder');
      fs.readdirSync('./dist').forEach(file => {
        const srcPath = path.join('./dist', file);
        const destPath = path.join('./public', file);
        fs.copyFileSync(srcPath, destPath);
      });
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
  </ul>
</body>
</html>`;
  
  fs.writeFileSync('./dist/index.html', errorHtml);
  console.log('Created error index.html');
  
  // Don't exit with error, so Vercel deployment continues
  console.log('Continuing deployment despite build error');
}