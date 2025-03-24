// Absolute bare-bones root handler
export default function handler(req, res) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Yeti Tips & Till</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 650px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 { color: #2563eb; }
        a { color: #2563eb; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .container { 
          border: 1px solid #e5e7eb;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <h1>Yeti Tips & Till</h1>
      <div class="container">
        <p>API Status: <strong style="color: green;">Online</strong></p>
        <p>Test Links:</p>
        <ul>
          <li><a href="/api">/api</a> - API index endpoint</li>
          <li><a href="/api/hello">/api/hello</a> - Hello endpoint</li>
          <li><a href="/status">/status</a> - Status check endpoint</li>
        </ul>
      </div>
    </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}