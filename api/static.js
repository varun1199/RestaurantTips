// This serves a static HTML page as the main entry point
module.exports = (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yeti Tips & Till | Restaurant Tip Management</title>
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1d4ed8;
            --bg-main: #f8fafc;
            --text-main: #334155;
            --text-light: #64748b;
            --border: #e2e8f0;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background-color: var(--bg-main);
            color: var(--text-main);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        header {
            background-color: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .logo-icon {
            display: inline-block;
            width: 32px;
            height: 32px;
            background-color: var(--primary);
            color: white;
            border-radius: 6px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 900;
        }
        
        main {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        
        .container {
            max-width: 800px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            margin-bottom: 2rem;
        }
        
        .banner {
            background-color: var(--primary);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .banner h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .banner p {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        
        .content {
            padding: 2rem;
        }
        
        h2 {
            color: var(--primary);
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        
        p {
            margin-bottom: 1.5rem;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin: 1.5rem 0;
        }
        
        .feature {
            background-color: var(--bg-main);
            padding: 1.5rem;
            border-radius: 6px;
            border-left: 4px solid var(--primary);
        }
        
        .feature h3 {
            margin-bottom: 0.5rem;
            color: var(--primary);
        }
        
        .steps {
            background-color: var(--bg-main);
            padding: 1.5rem;
            border-radius: 6px;
            margin-bottom: 1.5rem;
        }
        
        .step {
            display: flex;
            margin-bottom: 1rem;
        }
        
        .step-number {
            background-color: var(--primary);
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: bold;
            margin-right: 1rem;
            flex-shrink: 0;
        }
        
        .step-content {
            flex: 1;
        }
        
        .step h4 {
            margin-bottom: 0.5rem;
        }
        
        .code {
            background-color: #1e293b;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 4px;
            font-family: monospace;
            margin-bottom: 1.5rem;
            overflow-x: auto;
        }
        
        .buttons {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }
        
        .button {
            display: inline-block;
            background-color: var(--primary);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.3s;
        }
        
        .button:hover {
            background-color: var(--primary-dark);
        }
        
        .button.secondary {
            background-color: white;
            color: var(--primary);
            border: 1px solid var(--primary);
        }
        
        .button.secondary:hover {
            background-color: #f8fafc;
        }
        
        .note {
            background-color: #fffbeb;
            border-left: 4px solid var(--warning);
            padding: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .api-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: var(--success);
        }
        
        .api-endpoints {
            margin-top: 1rem;
            background-color: var(--bg-main);
            padding: 1rem;
            border-radius: 4px;
        }
        
        .endpoint {
            display: flex;
            margin-bottom: 0.5rem;
            font-family: monospace;
        }
        
        .endpoint-method {
            color: var(--primary);
            width: 60px;
        }
        
        footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-light);
            border-top: 1px solid var(--border);
            margin-top: auto;
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">
            <span class="logo-icon">YT</span>
            Yeti Tips & Till
        </div>
    </header>
    
    <main>
        <div class="container">
            <div class="banner">
                <h1>Welcome to Yeti Tips & Till</h1>
                <p>Complete Restaurant Tip Management System</p>
            </div>
            
            <div class="content">
                <h2>Deployment Status</h2>
                <p>
                    This is a static page served by Vercel. Your application is currently being deployed or requires 
                    additional configuration.
                </p>
                
                <div class="note">
                    <strong>Note:</strong> This page indicates that you have successfully deployed the basic structure, 
                    but the full application is not yet running. Please follow the steps below to complete the deployment.
                </div>
                
                <h2>API Status</h2>
                <div class="api-status">
                    <div class="status-indicator"></div>
                    <span>API is operational</span>
                </div>
                
                <div class="api-endpoints">
                    <div class="endpoint">
                        <span class="endpoint-method">GET</span>
                        <span>/api</span>
                    </div>
                    <div class="endpoint">
                        <span class="endpoint-method">POST</span>
                        <span>/api/login</span>
                    </div>
                    <div class="endpoint">
                        <span class="endpoint-method">GET</span>
                        <span>/api/user</span>
                    </div>
                </div>
                
                <h2>Features</h2>
                <div class="features">
                    <div class="feature">
                        <h3>Tip Distribution</h3>
                        <p>Easily distribute tips among staff based on various allocation methods</p>
                    </div>
                    <div class="feature">
                        <h3>Employee Tracking</h3>
                        <p>Manage employee information, hours, and tip allocation percentages</p>
                    </div>
                    <div class="feature">
                        <h3>Analytics</h3>
                        <p>View reports and insights on tips, performance, and financial data</p>
                    </div>
                </div>
                
                <h2>Deployment Instructions</h2>
                <div class="steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>Environment Variables</h4>
                            <p>
                                Set up the required environment variables in your Vercel project settings:
                            </p>
                            <ul>
                                <li>DATABASE_URL - Connection string for your PostgreSQL database</li>
                                <li>SESSION_SECRET - A secure random string for session encryption</li>
                                <li>NODE_ENV - Set to "production"</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>Database Setup</h4>
                            <p>
                                Ensure your PostgreSQL database is properly configured and accessible from Vercel.
                                You can use services like Neon, Supabase, or any other PostgreSQL provider.
                            </p>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>Deploy with the Correct Settings</h4>
                            <p>
                                Make sure your project is configured with the following settings:
                            </p>
                            <ul>
                                <li>Framework Preset: Other</li>
                                <li>Build Command: npm run build</li>
                                <li>Output Directory: dist</li>
                                <li>Install Command: npm install</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="buttons">
                    <a href="/api" class="button">Check API Status</a>
                    <a href="https://github.com/varun1199/RestaurantTips" class="button secondary">View on GitHub</a>
                </div>
            </div>
        </div>
    </main>
    
    <footer>
        <p>&copy; ${new Date().getFullYear()} Yeti Tips & Till. All rights reserved.</p>
    </footer>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
};