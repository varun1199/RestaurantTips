// API endpoint for serving static frontend assets
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(fileURLToPath(new URL('.', import.meta.url)));

// Mime types for common file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

export default function handler(req, res) {
  try {
    // Path normalization to prevent directory traversal
    const distPath = resolve(__dirname, '../dist');
    
    // Default to serving index.html for any route
    let filePath = resolve(distPath, 'index.html');
    const contentType = 'text/html';
    
    // Set caching headers for static assets
    res.setHeader('Cache-Control', 'public, max-age=0');

    try {
      const content = readFileSync(filePath);
      res.setHeader('Content-Type', contentType);
      res.status(200).send(content);
    } catch (error) {
      console.error(`Error serving ${filePath}:`, error);
      res.status(404).json({
        error: 'Not found',
        message: 'The requested resource could not be found',
        path: req.path
      });
    }
  } catch (error) {
    console.error('Serve error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while serving the request'
    });
  }
}