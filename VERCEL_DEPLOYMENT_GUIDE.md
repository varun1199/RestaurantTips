# Vercel Deployment Guide for Yeti Tips & Till

This guide will help you properly deploy your Yeti Tips & Till application to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your project code pushed to GitHub

## Deployment Steps

1. **Connect to GitHub:**
   - Log in to your Vercel account
   - Click "Add New..." → "Project"
   - Select your GitHub repository (RestaurantTips)
   - Click "Import"

2. **Configure Project:**
   - **Project Name:** Enter a name for your project (e.g., "yeti-tips-till")
   - **Framework Preset:** Select "Other"
   - **Root Directory:** Keep as `.` (the project root)
   - **Build Command:** Use `npm run build`
   - **Output Directory:** Enter `dist`

3. **Environment Variables:**
   - Scroll down to "Environment Variables"
   - Add the following variables:
     - `DATABASE_URL`: Your PostgreSQL database URL
     - `SESSION_SECRET`: A secure random string for session encryption
     - `NODE_ENV`: Set to `production`

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build and deployment to complete

## Troubleshooting

If you see source code instead of your application:

1. **Verify vercel.json:**
   - Make sure your project has a proper `vercel.json` file with the configuration provided earlier
   - Commit and push this file to your GitHub repository before deploying

2. **Check Build Output:**
   - In the Vercel dashboard, go to your project
   - Click on the latest deployment
   - Go to "Build Logs" to see if there are any errors
   - Common issues include:
     - Missing dependencies
     - Build failures
     - Incorrect output directory

3. **Database Connection:**
   - Ensure your `DATABASE_URL` is correctly set in the environment variables
   - Make sure the database is accessible from Vercel (public or with proper network settings)

4. **Manual Redeployment:**
   - If needed, you can redeploy by clicking "Redeploy" in the deployment settings

## Important Notes

1. **Database Migration:**
   - Your application should perform necessary database migrations during startup
   - If not, you may need to manually run migrations against your production database

2. **Session Management:**
   - Vercel deployments are serverless, so session management might behave differently
   - Consider using a dedicated session store like Redis for production

3. **Custom Domains:**
   - In the Vercel dashboard, go to your project settings
   - Click on "Domains" to add a custom domain
   - Follow the verification steps to configure your domain

## Need Help?

If you continue to have issues deploying to Vercel, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/help)