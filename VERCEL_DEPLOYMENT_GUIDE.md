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

Add the following environment variables:

- `DATABASE_URL`: Your PostgreSQL database URL (required)
- `SESSION_SECRET`: A secure random string for session encryption
- `NODE_ENV`: Set to `production`

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
   - We've created ultra-minimal versions of all API handlers with these characteristics:
     - No dependencies
     - Bare-minimum code (just a few lines)
     - Explicit error handling with try/catch blocks
     - Plain text responses instead of JSON
     - Async/await pattern for better handling
     - Simplified vercel.json without unnecessary settings
     - ES module syntax using `export default function handler(req, res) {}`
   
   - **Fix for "module is not defined in ES module scope" Error**:
     - This error appears when using CommonJS syntax (`module.exports`) but Vercel is interpreting files as ES modules
     - All `.js` files in the API folder should use ES module syntax:
       ```javascript
       // Instead of this (CommonJS):
       module.exports = async (req, res) => { ... }
       
       // Use this (ES modules):
       export default async function handler(req, res) { ... }
       ```
     - This is required because the package.json likely has `"type": "module"` set
   
   - If you're still seeing other errors after fixing module syntax:
     - Check the function logs at your-vercel-domain.com/_logs
     - Try creating a brand new project in Vercel instead of updating the existing one
     - Make sure you don't have conflicting environment variables
     - Try a different Node.js version in Vercel project settings (14, 16, or 18)
     - Consider Vercel's serverless function size limits (50MB max)
   
   - Once a minimal version works, gradually add back functionality one piece at a time

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
- Make sure your database allows connections from Vercel's IP addresses

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