# Vercel Deployment Guide for Yeti Tips & Till

This guide will help you deploy the Yeti Tips & Till application on Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project pushed to GitHub (see GITHUB_UPLOAD_GUIDE.md)

## Deployment Steps

### 1. Connect Your GitHub Repository

1. Log in to your Vercel account
2. Click on "New Project"
3. Select your GitHub repository (currently named "RestaurantTips")
4. Click "Import"

> **Note:** If you've renamed your project from "Restaurant Tips" to "Yeti Tips & Till", make sure the GitHub repository name still matches what Vercel is looking for. The repository URL should be github.com/varun1199/RestaurantTips

### 2. Configure Project Settings

When configuring your project in Vercel, use these settings:

- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables

Add the following environment variables in your Vercel project settings:

- `DATABASE_URL`: Your Neon PostgreSQL connection string (required)
  - Format: `postgres://user:password@endpoint/database?sslmode=require`
  - Get this from your Neon dashboard
  - Example: `postgres://myuser:pass@ep-cool-grass-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`

- `SESSION_SECRET`: A secure random string for session encryption
  - Generate with `openssl rand -base64 32` or a similar method
  - Must be at least 32 characters long for security

- `NODE_ENV`: Set to `production` for optimized performance

- `MAINTENANCE_MODE`: Set to `false` to enable full application features
  - Use `true` during initial setup or maintenance periods

### 4. Deploy the Project

Click on "Deploy" and wait for the deployment to complete.

### 5. Troubleshooting Common Issues

If you encounter issues with your deployment, check the following:

#### Project Name Mismatch

If you've renamed your project from "Restaurant Tips" to "Yeti Tips & Till" but kept the repository name as "RestaurantTips", you may encounter some confusion:

1. In GitHub, your repository is at: `github.com/varun1199/RestaurantTips`
2. In your code, the project is referred to as "Yeti Tips & Till"

This discrepancy is normal and shouldn't affect deployment. However, if you're experiencing issues:

- When importing on Vercel, make sure to select the correct GitHub repository (`RestaurantTips`)
- Consider updating your project's package.json name to match the new branding
- You can rename your repository on GitHub (Settings > Repository name) if desired, but it's not required

#### API Routes Not Working

Ensure the `api` directory is properly included in your deployment. The project includes:
- `api/index.js` - Main API handler
- `api/hello.js` - Test endpoint
- `api/adapter.js` - Authentication API handler
- `api/static.js` - Static fallback page

Make sure all these files are pushed to your GitHub repository and included in your Vercel deployment.

#### Fixing "This Serverless Function Has Crashed" Error

If you see a "This Serverless Function Has Crashed" error:

1. **Use the ultra-simplified serverless functions**: We've created extremely minimal versions of all API handlers that don't use any dependencies. This approach eliminates most common causes of serverless function failures:
   - `api/index.js` - Bare minimum handler with no dependencies
   - `api/adapter.js` - Simplified handler for authentication endpoints
   - `api/static.js` - Minimal static HTML page
   - `api/hello.js` - Simple test endpoint

2. **Check the vercel.json routes**: Make sure your routes are properly configured to point to the correct serverless functions:
   ```json
   "routes": [
     { "src": "/api", "dest": "/api/index.js" },
     { "src": "/api/(.*)", "dest": "/api/index.js" },
     { "src": "/(.*)", "dest": "/api/static.js" }
   ]
   ```

3. **Review function logs**: In the Vercel dashboard:
   - Navigate to your deployment
   - Click on "Functions"
   - Select the function that's crashing
   - Check the logs for specific error messages

4. **Force a clean deployment**: Try these steps:
   - Delete any previous deployments in Vercel
   - Remove the Vercel integration from GitHub
   - Re-add the GitHub integration
   - Deploy with a fresh build

5. **Handling FUNCTION_INVOCATION_FAILED Errors**: For persistent server function crashes:

   ### Progressive Deployment Approach:
   
   **Step 1: Use Static Maintenance Mode (COMPLETE)**
   - We've created a static landing page in `api/app.js` with:
     - No dependencies or database connections
     - Pure static HTML content
     - No error-prone JS logic
   - The `vercel.json` routes point to this static page first
   - Deployment confirms your basic setup works
   
   **Step 2: Add API Diagnostics (COMPLETE)**
   - Fixed module format issues using ES module syntax
   - Added `/status` endpoint for environment diagnostics
   - Created `/api` endpoint with API documentation
   - Added `/api/hello` health check endpoint
   - All these endpoints should be operational
   
   **Step 3: Database Configuration with Neon PostgreSQL (NEXT)**
   - Create a Neon PostgreSQL database:
     1. Sign up at [neon.tech](https://neon.tech) if you haven't already
     2. Create a new project
     3. Note your connection string which will look like:
        `postgres://user:password@ep-xyz-123456.region.aws.neon.tech/neondb?sslmode=require`
     4. Enable connection pooling for better performance
   - Add environment variables in Vercel:
     1. Go to your Vercel project dashboard
     2. Navigate to Settings > Environment Variables
     3. Add `DATABASE_URL` with your Neon connection string
     4. Set `SESSION_SECRET` with a strong random string (use `openssl rand -base64 32`)
     5. Set `MAINTENANCE_MODE=false` to enable transitional features
   - Deploy after adding these environment variables
   - Test database connection:
     1. Visit `/api/neon-test` to verify Neon connection
     2. Check `/api/db-config` for configuration details
     3. If successful, these endpoints will confirm your database is recognized
   
   **Step 4: Transitional API Mode**
   - The `/api/adapter.js` provides a bridge to the full application
   - When `MAINTENANCE_MODE=false`, API endpoints will respond with transitional data
   - Try endpoints like `/api/auth/status` to check transitional mode
   
   **Step 5: Complete Deployment**
   - Once transitional API works, the static pages can be replaced with the full application
   - For the next deployment phase, we'll update the routes to serve the full app
   
   ### Additional Troubleshooting Tips:
   
   - **Check Logs**: Use the Vercel dashboard and function logs at your-vercel-domain.com/_logs
   - **Fresh Project**: Try deploying to a brand new Vercel project instead of updating an existing one
   - **Environment Variables**: Ensure no conflicting or missing environment variables
   - **Node Version**: Set Node.js version to 18.x in project settings for best compatibility
   - **Function Size**: Keep handlers small to avoid hitting the 50MB limit
   - **Browser Cache**: Always hard-refresh (Ctrl+F5) when testing new deployments
   
   Once your static page and basic API endpoints work, you can gradually restore the full app.

5. **Update environment variables**: Make sure your DATABASE_URL and other required environment variables are correctly set in the Vercel dashboard.

6. **Try a direct Vercel deployment**: If GitHub deployment continues to fail, try the Vercel CLI approach:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from your project directory
   vercel
   ```
   
   This bypasses GitHub and deploys directly from your local machine.

#### Database Connection Issues

- Verify your `DATABASE_URL` is correctly set in environment variables
- For Neon PostgreSQL:
  1. Get your connection string from the Neon dashboard
  2. Use the format: `postgres://user:password@endpoint/database?sslmode=require`
  3. Ensure you're using the correct endpoint URL (should contain `neon.tech`)
  4. Enable connection pooling in the Neon dashboard for better performance
  5. Test database connectivity with the `/api/neon-test` endpoint
- Make sure your database allows connections from Vercel's IP addresses
- For security reasons, create a dedicated role in Neon with limited permissions for the application

#### Seeing Source Code Instead of Running App

If you see source code displayed instead of your running application:
1. Make sure `vercel.json` configuration is properly set up
2. Verify the routes are correctly configured
3. Check that the build process completed successfully

#### Checking Build Logs

If your deployment fails or doesn't work as expected:

1. Go to your project in the Vercel dashboard
2. Click on the latest deployment
3. Click on "View Build Logs"
4. Look for any errors or warnings during the build process

Common build issues include:
- Missing dependencies
- Build script errors
- Environment variable issues
- Incompatible Node.js version (Vercel uses Node.js 18 by default)

## Post-Deployment

After successful deployment:

1. Your app will be available at a Vercel domain which might look like:
   - `restaurant-tips-xxxxxxxxxxxx-username.vercel.app` (if using the old project name)
   - Or `yeti-tips-xxxxxxxxxxxx-username.vercel.app` (if you renamed your project)
   
   > Note: The URL includes your project name, not necessarily the repository name
2. Test all functionality to ensure everything works in the production environment
3. Set up your custom domain if needed (in Vercel project settings)

## Keeping Deployments Updated

Any new commits pushed to the main branch of your connected GitHub repository will automatically trigger a new deployment.

## Optimizing Neon PostgreSQL for Serverless

Neon PostgreSQL works especially well with serverless functions on Vercel, but requires some optimization:

### Connection Pooling

For serverless environments, connection pooling is essential:

1. In your Neon dashboard, navigate to your project
2. Go to the "Connection Pooling" section
3. Enable connection pooling
4. Use the pooled connection string in your `DATABASE_URL` environment variable

### @neondatabase/serverless

For best performance with Neon:

1. Our project already includes the `@neondatabase/serverless` package
2. This package optimizes connection handling specifically for serverless environments
3. It reduces cold start times and manages connections efficiently

### Security Best Practices

1. Create a dedicated database role for your application with minimal permissions
2. Use parameterized queries to prevent SQL injection
3. Never expose your database credentials in client-side code
4. Consider separate read-only and read-write connection strings for different operations