# Gym Coach Database Schema

This directory contains SQL migration files for the Gym Coach application database.

## Database Structure

The schema includes the following main tables:

### Core Tables
- **users** - User profiles (extends Supabase auth.users)
- **coaches** - Coach-specific information
- **clients** - Client-specific information

### Exercise & Workout Tables
- **exercises** - Exercise library
- **workout_plans** - Workout plans assigned to clients
- **workout_sessions** - Individual workout sessions within plans
- **workout_exercises** - Junction table linking exercises to sessions

### Progress Tracking Tables
- **completed_workouts** - Logged workout completions
- **completed_exercises** - Individual exercise completions
- **progress_measurements** - Body measurements over time
- **progress_photos** - Progress photos
- **personal_records** - Personal bests

### Communication Tables
- **messages** - Direct messages between users
- **notifications** - System notifications

## Running Migrations

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://syjuegeiwvvbcsomsaxs.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of each migration file in order:
   - `001_create_users_and_profiles.sql`
   - `002_create_exercises_and_workouts.sql`
   - `003_create_progress_tracking.sql`
   - `004_create_messaging_and_notifications.sql`
   - `005_row_level_security.sql`
5. Click **Run** for each migration

### Option 2: Using Supabase CLI (Recommended for version control)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref syjuegeiwvvbcsomsaxs
   ```

3. Push migrations to your database:
   ```bash
   supabase db push
   ```

## Row Level Security (RLS)

The schema includes comprehensive RLS policies to ensure:
- Users can only access their own data
- Coaches can view and manage their clients' data
- Clients can view their assigned workout plans and track progress
- Public exercises are visible to all, custom exercises only to creators

## Key Features

- **Automatic timestamps** - All tables have `created_at` and `updated_at` fields
- **UUID primary keys** - Using `uuid-ossp` extension
- **Foreign key constraints** - Proper relationships with cascade deletes
- **Check constraints** - Data validation at database level
- **Indexes** - Optimized for common queries
- **Triggers** - Automatic `updated_at` timestamp updates

## Next Steps

After running migrations:
1. Verify tables in Supabase Dashboard > Table Editor
2. Test authentication flow
3. Create seed data for exercises
4. Build out your Next.js frontend components
