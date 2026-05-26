-- =====================================================
-- GYM COACH DATABASE SCHEMA - COMPLETE MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SECTION 1: USERS AND PROFILES
-- =====================================================

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coaches table
CREATE TABLE public.coaches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  specialties TEXT[],
  certifications TEXT[],
  years_of_experience INTEGER,
  hourly_rate DECIMAL(10, 2),
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE SET NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm DECIMAL(5, 2),
  weight_kg DECIMAL(5, 2),
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  goals TEXT[],
  medical_conditions TEXT[],
  injuries TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for users and profiles
CREATE INDEX idx_coaches_user_id ON public.coaches(user_id);
CREATE INDEX idx_coaches_is_verified ON public.coaches(is_verified);
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_coach_id ON public.clients(coach_id);

-- =====================================================
-- SECTION 2: EXERCISES AND WORKOUTS
-- =====================================================

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('strength', 'cardio', 'flexibility', 'balance', 'plyometric', 'other')),
  muscle_groups TEXT[],
  equipment TEXT[],
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  video_url TEXT,
  thumbnail_url TEXT,
  instructions TEXT[],
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.coaches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_plans table
CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  duration_weeks INTEGER,
  frequency_per_week INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_sessions table
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
  week_number INTEGER,
  order_index INTEGER,
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_exercises table (junction table)
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER,
  sets INTEGER,
  reps INTEGER,
  duration_seconds INTEGER,
  rest_seconds INTEGER,
  weight_kg DECIMAL(6, 2),
  distance_meters DECIMAL(8, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for exercises and workouts
CREATE INDEX idx_exercises_category ON public.exercises(category);
CREATE INDEX idx_exercises_difficulty ON public.exercises(difficulty_level);
CREATE INDEX idx_exercises_created_by ON public.exercises(created_by);
CREATE INDEX idx_workout_plans_coach ON public.workout_plans(coach_id);
CREATE INDEX idx_workout_plans_client ON public.workout_plans(client_id);
CREATE INDEX idx_workout_plans_active ON public.workout_plans(is_active);
CREATE INDEX idx_workout_sessions_plan ON public.workout_sessions(workout_plan_id);
CREATE INDEX idx_workout_exercises_session ON public.workout_exercises(workout_session_id);
CREATE INDEX idx_workout_exercises_exercise ON public.workout_exercises(exercise_id);

-- =====================================================
-- SECTION 3: PROGRESS TRACKING
-- =====================================================

-- Create completed_workouts table
CREATE TABLE public.completed_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INTEGER,
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feeling TEXT CHECK (feeling IN ('excellent', 'good', 'okay', 'tired', 'exhausted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create completed_exercises table
CREATE TABLE public.completed_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  completed_workout_id UUID REFERENCES public.completed_workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  sets_completed INTEGER,
  reps_completed INTEGER,
  duration_seconds INTEGER,
  weight_kg DECIMAL(6, 2),
  distance_meters DECIMAL(8, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_measurements table
CREATE TABLE public.progress_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  weight_kg DECIMAL(5, 2),
  body_fat_percentage DECIMAL(4, 2),
  muscle_mass_kg DECIMAL(5, 2),
  waist_cm DECIMAL(5, 2),
  chest_cm DECIMAL(5, 2),
  arms_cm DECIMAL(5, 2),
  legs_cm DECIMAL(5, 2),
  hips_cm DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_photos table
CREATE TABLE public.progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_date DATE NOT NULL,
  view_angle TEXT CHECK (view_angle IN ('front', 'side', 'back')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create personal_records table
CREATE TABLE public.personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  record_type TEXT CHECK (record_type IN ('max_weight', 'max_reps', 'max_distance', 'best_time')),
  value DECIMAL(10, 2) NOT NULL,
  unit TEXT,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for progress tracking
CREATE INDEX idx_completed_workouts_client ON public.completed_workouts(client_id);
CREATE INDEX idx_completed_workouts_session ON public.completed_workouts(workout_session_id);
CREATE INDEX idx_completed_workouts_completed_at ON public.completed_workouts(completed_at);
CREATE INDEX idx_completed_exercises_workout ON public.completed_exercises(completed_workout_id);
CREATE INDEX idx_completed_exercises_exercise ON public.completed_exercises(exercise_id);
CREATE INDEX idx_progress_measurements_client ON public.progress_measurements(client_id);
CREATE INDEX idx_progress_measurements_date ON public.progress_measurements(measurement_date);
CREATE INDEX idx_progress_photos_client ON public.progress_photos(client_id);
CREATE INDEX idx_progress_photos_date ON public.progress_photos(photo_date);
CREATE INDEX idx_personal_records_client ON public.personal_records(client_id);
CREATE INDEX idx_personal_records_exercise ON public.personal_records(exercise_id);

-- =====================================================
-- SECTION 4: MESSAGING AND NOTIFICATIONS
-- =====================================================

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('workout_reminder', 'message', 'progress_update', 'achievement', 'coach_message', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for messaging
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- =====================================================
-- SECTION 5: TRIGGERS
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at on all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON public.coaches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_exercises_updated_at BEFORE UPDATE ON public.workout_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_completed_workouts_updated_at BEFORE UPDATE ON public.completed_workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_completed_exercises_updated_at BEFORE UPDATE ON public.completed_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_measurements_updated_at BEFORE UPDATE ON public.progress_measurements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_photos_updated_at BEFORE UPDATE ON public.progress_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_records_updated_at BEFORE UPDATE ON public.personal_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 6: ROW LEVEL SECURITY
-- =====================================================

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Coaches policies
CREATE POLICY "Anyone can view verified coaches" ON public.coaches
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Coaches can view their own profile" ON public.coaches
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Coaches can update their own profile" ON public.coaches
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Coaches can insert their own profile" ON public.coaches
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Clients policies
CREATE POLICY "Clients can view their own profile" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Coaches can view their clients" ON public.clients
  FOR SELECT USING (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can update their own profile" ON public.clients
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Clients can insert their own profile" ON public.clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Exercises policies
CREATE POLICY "Anyone can view non-custom exercises" ON public.exercises
  FOR SELECT USING (is_custom = false);

CREATE POLICY "Users can view custom exercises they created" ON public.exercises
  FOR SELECT USING (
    created_by IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can create custom exercises" ON public.exercises
  FOR INSERT WITH CHECK (
    created_by IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can update their own custom exercises" ON public.exercises
  FOR UPDATE USING (
    created_by IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

-- Workout plans policies
CREATE POLICY "Clients can view their own workout plans" ON public.workout_plans
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can view workout plans for their clients" ON public.workout_plans
  FOR SELECT USING (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can create workout plans for their clients" ON public.workout_plans
  FOR INSERT WITH CHECK (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can update workout plans for their clients" ON public.workout_plans
  FOR UPDATE USING (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

-- Workout sessions policies
CREATE POLICY "Users can view workout sessions from their plans" ON public.workout_sessions
  FOR SELECT USING (
    workout_plan_id IN (
      SELECT id FROM public.workout_plans 
      WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
      OR coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can manage workout sessions" ON public.workout_sessions
  FOR ALL USING (
    workout_plan_id IN (
      SELECT id FROM public.workout_plans 
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

-- Workout exercises policies
CREATE POLICY "Users can view workout exercises from their sessions" ON public.workout_exercises
  FOR SELECT USING (
    workout_session_id IN (
      SELECT ws.id FROM public.workout_sessions ws
      JOIN public.workout_plans wp ON ws.workout_plan_id = wp.id
      WHERE wp.client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
      OR wp.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can manage workout exercises" ON public.workout_exercises
  FOR ALL USING (
    workout_session_id IN (
      SELECT ws.id FROM public.workout_sessions ws
      JOIN public.workout_plans wp ON ws.workout_plan_id = wp.id
      WHERE wp.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

-- Completed workouts policies
CREATE POLICY "Clients can view their own completed workouts" ON public.completed_workouts
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can view their clients' completed workouts" ON public.completed_workouts
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Clients can create their own completed workouts" ON public.completed_workouts
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

-- Completed exercises policies
CREATE POLICY "Users can view their completed exercises" ON public.completed_exercises
  FOR SELECT USING (
    completed_workout_id IN (
      SELECT id FROM public.completed_workouts 
      WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can view their clients' completed exercises" ON public.completed_exercises
  FOR SELECT USING (
    completed_workout_id IN (
      SELECT cw.id FROM public.completed_workouts cw
      JOIN public.clients c ON cw.client_id = c.id
      WHERE c.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Clients can create their own completed exercises" ON public.completed_exercises
  FOR INSERT WITH CHECK (
    completed_workout_id IN (
      SELECT id FROM public.completed_workouts 
      WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    )
  );

-- Progress measurements policies
CREATE POLICY "Clients can manage their own measurements" ON public.progress_measurements
  FOR ALL USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can view their clients' measurements" ON public.progress_measurements
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

-- Progress photos policies
CREATE POLICY "Clients can manage their own photos" ON public.progress_photos
  FOR ALL USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can view their clients' photos" ON public.progress_photos
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

-- Personal records policies
CREATE POLICY "Clients can manage their own records" ON public.personal_records
  FOR ALL USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can view their clients' records" ON public.personal_records
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update messages they received" ON public.messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
