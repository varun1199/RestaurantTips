# Yeti Tips & Till

A comprehensive restaurant tip management web application that simplifies tip distribution, employee tracking, and financial operations for restaurant management with mobile-first responsive design.

## Features

- **User Authentication**: Login, registration with admin and regular user roles
- **Employee Management**: Admin can add, edit, and remove employees
- **Tip Management**: Enter and distribute tips among employees
- **Till Calculator**: Calculate and manage till operations
- **Dashboard**: View financial insights and analytics
- **Mobile Responsive**: Works well on all devices

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (Neon)
- **State Management**: Zustand
- **Styling**: Tailwind CSS, Shadcn UI components
- **Form Validation**: React Hook Form with Zod
- **Data Fetching**: TanStack Query

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (local or Neon)

### Security Notes

- **Important**: This project currently uses plain text password storage for demonstration purposes.
- For production use, implement password hashing using bcrypt or a similar library.
- Update the session secret in the .env file with a strong random string.

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/yeti-tips-till.git
   cd yeti-tips-till
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory and add:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/yeti_tips
   SESSION_SECRET=your_session_secret
   PORT=5000
   ```

4. Run database migrations
   ```bash
   npm run db:push
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5000`

## Vercel Deployment

This project is configured for deployment on Vercel. Follow these steps to deploy:

### Required Environment Variables

Make sure to set these environment variables in your Vercel project settings:

1. **`DATABASE_URL`** - PostgreSQL connection string (Neon recommended)
   - Format: `postgres://user:password@hostname/database?sslmode=require`
   - You can create a free Neon PostgreSQL database at [neon.tech](https://neon.tech)

2. **`SESSION_SECRET`** - A strong random string for session security
   - Generate one with: `openssl rand -base64 32`

3. **`MAINTENANCE_MODE`** - (Optional) Set to "false" by default
   - Change to "true" during maintenance periods

### Deployment Steps

1. Connect your GitHub repository to Vercel
2. Set the required environment variables
3. Deploy with the following settings:
   - Build Command: `node vercel-build.js`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Troubleshooting Vercel Deployment

If you encounter issues during deployment:

1. Check that all environment variables are correctly set
2. Verify database connection by testing the `/api/neon-test` endpoint
3. Check system status at `/status` for detailed diagnostics
4. Review Vercel build logs for any specific errors
5. Ensure your Neon database has the correct tables (run migrations)

## Local Development

For local development:

1. Setup PostgreSQL locally or use Neon
2. Set correct environment variables in `.env`
3. Run migrations with `npm run db:push`
4. Start development server with `npm run dev`
5. Access the API test endpoints:
   - `/api/hello` - Simple hello world test
   - `/api/health` - System health check
   - `/api/neon-test` - Database connection test
   - `/api/db-config` - Database configuration info

## Usage

1. **First User Registration**: The first user to register automatically becomes an admin
2. **Admin Functions**: 
   - Manage employees
   - View comprehensive dashboard
   - Access all system features
3. **Regular User Functions**:
   - Enter and distribute tips
   - Use till calculator
   - View personal profile

## License

MIT

## Contributors

- Your Name - Initial work

---

Made with ❄️ by Yeti Tips & Till