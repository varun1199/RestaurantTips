// Root endpoint that redirects to app.js for the primary landing page
export default function handler(req, res) {
  // For now, we'll simply redirect to the static page in app.js
  // In the future, this could serve the React app's index.html file
  
  // Perform a 307 (Temporary Redirect) to the main app
  res.statusCode = 307;
  res.setHeader('Location', '/');
  res.end();
}