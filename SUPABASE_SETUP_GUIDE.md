# Connecting Your Own Supabase Project

This guide will walk you through connecting your Study Spark app to your personal Supabase project.

## Step 1: Create a Supabase Account and Project

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project" 
3. Choose a project name (e.g., "study-spark")
4. Set a secure password for your database
5. Select your preferred region
6. Click "Create new project"

## Step 2: Get Your Project Credentials

1. Once your project is created, go to your project dashboard
2. In the sidebar, click "Project Settings" (gear icon)
3. Click on "API" in the settings menu
4. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public/publishable key**: This starts with `sb_publishable_...`
   - **service_role key**: This starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Update Environment Variables

Open your `.env` file in the project root and replace the placeholder values:

```
VITE_SUPABASE_URL="https://your-project-url.supabase.co"
VITE_SUPABASE_ANON_KEY="your-publishable-key-here"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

⚠️ **Important**: After changing these values, you must restart your development server.

## Step 4: Set Up Database Tables

1. In your Supabase dashboard, go to the "SQL Editor"
2. Copy and paste the entire content of `supabase/study_sessions_setup.sql` file from your project
3. Click "RUN" to execute the SQL commands

Alternatively, you can run this command in your terminal to push your local migrations to your remote database:

```bash
npx supabase db push
```

This will create the necessary tables for your study tracking app:
- `study_sessions` - for tracking your study sessions
- `pomodoro_sessions` - for tracking your focus sessions

## Step 5: Restart Your Application

1. Stop your current development server (Ctrl+C)
2. Install any missing dependencies: `npm install`
3. Start the development server again: `npm run dev`

## Step 6: Test the Connection

1. Open your app at `http://localhost:8080`
2. Add a study session using the form
3. Check your Supabase dashboard in the "Table Editor" to confirm data is being stored in your database

## Troubleshooting

If you encounter issues:

1. **Connection errors**: Double-check your `.env` values match exactly what's in your Supabase dashboard
2. **Database permissions**: Make sure the RLS policies are correctly set (the SQL script handles this)
3. **Build errors**: Clear your cache with `npm run build` and restart the dev server

## Security Notes

⚠️ **Important Security Warning**: The current setup uses public access policies for simplicity. For production use, you should:
- Implement proper authentication
- Set up Row Level Security rules that restrict access to user-owned data only
- Use service role keys only on the server-side, never expose them in client code

Your study tracking app is now connected to your personal Supabase project!