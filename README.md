# BloodBondNetwork 🩸

A modern web application for managing blood donation networks, connecting donors with those in need and facilitating life-saving blood donations.

## Features

- **User Registration & Authentication**: Secure user accounts with password protection
- **Donor Profiles**: Comprehensive donor information including blood type, contact details, and donation history
- **Blood Donor Directory**: Search and browse available blood donors by blood group
- **Donation Tracking**: Record and track donation history for each donor
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Real-time Updates**: Powered by TanStack Query for efficient data management

## Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Wouter** - Lightweight routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Drizzle ORM** - Type-safe database ORM
- **PostgreSQL** - Database (Neon serverless)
- **Passport.js** - Authentication middleware
- **Express Session** - Session management

### Development Tools

- **Vite** - Build tool and dev server
- **TypeScript** - Type checking
- **ESBuild** - Fast JavaScript bundler
- **Drizzle Kit** - Database migrations

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database (or Neon account)
- npm or yarn package manager

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd BloodBondNetwork
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with:

```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret_key
NODE_ENV=development
```

4. Push database schema:

```bash
npm run db:push
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

## Project Structure

```
BloodBondNetwork/
├── client/              # Frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
├── server/              # Backend application
│   ├── index.ts         # Express server setup
│   ├── routes.ts        # API routes
│   └── storage.ts       # Database operations
├── shared/              # Shared code between client and server
│   └── schema.ts        # Database schema and types
└── drizzle.config.ts    # Drizzle ORM configuration
```

## Database Schema

### Users Table

- User authentication and profile information
- Blood group, contact details, and address
- Last donation date tracking

### Donations Table

- Donation history for each user
- Date, location, and status tracking
- Units donated

## Security Features

- Password hashing with bcryptjs
- Session-based authentication
- CORS protection
- Helmet.js security headers
- Rate limiting
- Secure cookie handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Deployment on Vercel

### Prerequisites
1. Create a [Vercel account](https://vercel.com/signup)
2. Set up a PostgreSQL database (recommended: [Neon](https://neon.tech))

### Quick Deploy

#### Option 1: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `SESSION_SECRET` - A secure random string
   - `NODE_ENV` - Set to `production`

5. Push database schema:
```bash
npm run db:push
```

#### Option 2: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `NODE_ENV=production`
6. Click "Deploy"
7. After deployment, run migrations:
```bash
vercel env pull .env.production.local
npm run db:push
```

### Database Setup with Neon

1. Create account at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to Vercel environment variables as `DATABASE_URL`

### Post-Deployment

After successful deployment:
1. Your app will be live at `https://your-project.vercel.app`
2. API endpoints: `https://your-project.vercel.app/api/*`
3. Monitor logs in Vercel dashboard

### Troubleshooting

- **Build fails**: Check that all dependencies are in `package.json`
- **Database connection fails**: Verify `DATABASE_URL` is set correctly
- **Session issues**: Ensure `SESSION_SECRET` is set
- **API routes not working**: Check `vercel.json` rewrites configuration

## Support

For support, please open an issue in the repository or contact the maintainers.

---

Made with ❤️ for saving lives through blood donation
"# bat-blood1" 
