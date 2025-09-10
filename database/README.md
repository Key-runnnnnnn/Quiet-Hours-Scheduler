# Database Setup Guide

## Prerequisites
- Supabase project created
- Environment variables configured in `.env.local`

## Step-by-Step Database Setup

### 1. Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor

### 2. Run SQL Scripts in Order
Execute these SQL files in the SQL Editor in the following order:

#### Step 1: Create Tables
Copy and paste the contents of `database/01_create_tables.sql` and run it.

This will create:
- `profiles` table (user profiles)
- `quiet_hours` table (scheduled quiet time blocks)
- Indexes for performance
- Triggers for automatic timestamp updates

#### Step 2: Set up Row Level Security
Copy and paste the contents of `database/02_row_level_security.sql` and run it.

This will:
- Enable RLS on both tables
- Create policies to ensure users can only access their own data

#### Step 3: Create Functions and Triggers
Copy and paste the contents of `database/03_functions_and_triggers.sql` and run it.

This will create:
- Automatic profile creation when users sign up
- Helper functions for CRON jobs
- Overlap checking functions

### 3. Verify Setup
After running all scripts, you should see:
- `profiles` table in the Database > Tables section
- `quiet_hours` table in the Database > Tables section
- Policies listed under each table
- Functions in the Database > Functions section

### 4. Test Authentication
Once the database is set up:
1. Start your development server: `npm run dev`
2. Try registering a new user
3. Check the `profiles` table to see if the profile was created automatically

## Environment Variables
Make sure your `.env.local` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting
- If you get permission errors, make sure RLS policies are set up correctly
- If profile creation fails, check that the trigger is created properly
- For any other issues, check the Supabase logs in the dashboard
