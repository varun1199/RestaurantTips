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
- **Database**: PostgreSQL
- **State Management**: Zustand
- **Styling**: Tailwind CSS, Shadcn UI components
- **Form Validation**: React Hook Form with Zod
- **Data Fetching**: TanStack Query

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database

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