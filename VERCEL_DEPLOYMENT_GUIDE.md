# Vercel Deployment Guide for Yeti Tips & Till

This guide will help you properly deploy your Yeti Tips & Till application to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your project code pushed to GitHub
- A PostgreSQL database (Vercel doesn't provide this; use a service like Neon, Supabase, or Railway)

## Important Configuration Files

Before deploying, make sure you have:

1. **vercel.json** - This file is crucial for Vercel to correctly build and serve your application.
2. **package.json** - With proper build and start scripts.

## Deployment Steps

1. **Prepare Your Database:**
   - Set up a PostgreSQL database with a service like [Neon](https://neon.tech) or [Supabase](https://supabase.com)
   - Get your database connection string in the format: `postgresql://username:password@hostname:port/database`

2. **Connect to GitHub:**
   - Log in to your Vercel account
   - Click "Add New..." → "Project"
   - Select your GitHub repository (RestaurantTips)
   - Click "Import"

3. **Configure Project:**
   - **Project Name:** Enter a name for your project (e.g., "yeti-tips-till")
   - **Framework Preset:** Select "Other" 
   - **Root Directory:** Keep as `.` (the project root)
   - **Build and Output Settings:**
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
     - Development Command: `npm run dev`

4. **Environment Variables:**
   - Scroll down to "Environment Variables"
   - Add the following variables:
     - `DATABASE_URL`: Your PostgreSQL database URL (from step 1)
     - `SESSION_SECRET`: A long, random string for session encryption (e.g., generate with `openssl rand -hex 32`)
     - `NODE_ENV`: Set to `production`

5. **Deploy:**
   - Click "Deploy"
   - Wait for the build and deployment to complete

## Fixing Source Code Display Issue

If you see your source code displayed instead of your application running:

1. **Double-check vercel.json:**
   ```json
   {
     "version": 2,
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "outputDirectory": "dist",
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ],
     "functions": {
       "api/**/*.js": {
         "memory": 1024
       }
     },
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

2. **Check build settings:**
   - Make sure your build generates both frontend and backend code properly
   - Verify the output goes to the correct `dist` directory

3. **Redeploy:**
   - After making changes, commit and push them to GitHub
   - In Vercel, go to your project and click "Redeploy" in the "..." menu

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check the build logs in Vercel dashboard
   - Common causes: missing dependencies, build script errors

2. **Database Connection Issues:**
   - Ensure your `DATABASE_URL` is correct and the database is publicly accessible
   - Check if your database provider has IP restrictions that might block Vercel

3. **API Routes Not Working:**
   - Verify the API routes are properly set up in vercel.json
   - Check server-side code for hard-coded URLs or ports

4. **Session Issues:**
   - Serverless functions work differently than traditional servers
   - You may need to configure session storage to use a database instead of memory

## Important Notes

1. **Database Migration:**
   - Run `npm run db:push` before deployment to ensure your schema is up to date
   - For future updates, always run migrations before deploying code changes

2. **Session Store:**
   - For production, consider switching from memory store to a database-backed session store
   - Update your session configuration in server code

3. **Logs and Monitoring:**
   - Use Vercel's logging features to debug issues
   - Consider adding more detailed logging to your application

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vercel Support](https://vercel.com/help)