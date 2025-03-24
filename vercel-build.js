// This is a helper script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');

// Run the build command
console.log('Building application...');
execSync('npm run build', { stdio: 'inherit' });

// Ensure dist folder exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Create a simple server.js file to serve the app
fs.writeFileSync('./dist/server.js', `
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname)));

// All routes should serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`);

console.log('Vercel build completed successfully!');