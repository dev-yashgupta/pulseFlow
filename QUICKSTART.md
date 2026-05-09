# PulseFlow - Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier at supabase.com)

### 1. Clone & Install
```bash
git clone <repo-url>
cd pulseFlow
npm install
```

### 2. Create Supabase Project
1. Go to https://supabase.com
2. Sign up (free)
3. Create new project
4. Copy credentials from Settings > API

### 3. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...
```

### 4. Setup Database
1. In Supabase console, go to SQL Editor
2. Copy and paste `supabase/schema.sql`
3. Run the SQL

### 5. Create Test User
In Supabase > Authentication > Users:
- Click "Add user"
- Email: test@example.com
- Password: test123 (or any password)

### 6. Start Development
```bash
npm run dev
```

Open http://localhost:3000

### 7. Login
- Email: test@example.com
- Password: test123

## Project Structure

```
src/
├── app/              # Next.js pages & API routes
├── components/       # React components
├── lib/             
│   ├── auth/        # Authentication
│   ├── database/    # Supabase queries
│   ├── integrations/# Slack, Salesforce
│   └── ml/          # ML models
└── types/           # TypeScript types
```

## Key Features

- ✅ Real-time wellbeing monitoring
- ✅ Burnout prediction AI
- ✅ Team health dashboard
- ✅ Slack integration
- ✅ Salesforce integration
- ✅ Automated interventions

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run start      # Start production server
npm test           # Run tests
npm run lint       # Check code quality
```

## Common Issues

### "Cannot find module '@/...'"
- Restart dev server: `npm run dev`

### Database connection error
- Verify SUPABASE_SERVICE_ROLE_KEY in .env.local
- Check database is running in Supabase console

### Authentication fails
- Confirm test user exists in Supabase > Auth
- Check email/password

## Next Steps

1. Update `.env.local` with production Supabase URL
2. Deploy to Vercel, Railway, or Docker
3. Configure custom domain
4. Set up monitoring (Sentry, etc.)
5. Enable integrations (Slack, Salesforce)

## Documentation

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- ✅ [Production Checklist](./PRODUCTION_CHECKLIST.md)
- 🔑 [API Documentation](./docs/API.md)
