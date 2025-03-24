# Vercel Deployment Guide for Yeti Tips & Till

This guide will help you deploy the Yeti Tips & Till application on Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project pushed to GitHub (see GITHUB_UPLOAD_GUIDE.md)

## Deployment Steps

### 1. Connect Your GitHub Repository

1. Log in to your Vercel account
2. Click on "New Project"
3. Select your GitHub repository (Yeti Tips & Till)
4. Click "Import"

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

#### API Routes Not Working

Ensure the `api` directory is properly included in your deployment. The project includes:
- `api/index.js` - Main API handler
- `api/hello.js` - Test endpoint

#### Database Connection Issues

- Verify your `DATABASE_URL` is correctly set in environment variables
- Make sure your database allows connections from Vercel's IP addresses

#### Seeing Source Code Instead of Running App

If you see source code displayed instead of your running application:
1. Make sure `vercel.json` configuration is properly set up
2. Verify the routes are correctly configured
3. Check that the build process completed successfully

## Post-Deployment

After successful deployment:

1. Your app will be available at `your-project-name.vercel.app`
2. Test all functionality to ensure everything works in the production environment
3. Set up your custom domain if needed (in Vercel project settings)

## Keeping Deployments Updated

Any new commits pushed to the main branch of your connected GitHub repository will automatically trigger a new deployment.