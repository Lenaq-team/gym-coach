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

-- Create indexes
CREATE INDEX idx_exercises_category ON public.exercises(category);
CREATE INDEX idx_exercises_difficulty ON public.exercises(difficulty_level);
CREATE INDEX idx_exercises_created_by ON public.exercises(created_by);
CREATE INDEX idx_workout_plans_coach ON public.workout_plans(coach_id);
CREATE INDEX idx_workout_plans_client ON public.workout_plans(client_id);
CREATE INDEX idx_workout_plans_active ON public.workout_plans(is_active);
CREATE INDEX idx_workout_sessions_plan ON public.workout_sessions(workout_plan_id);
CREATE INDEX idx_workout_exercises_session ON public.workout_exercises(workout_session_id);
CREATE INDEX idx_workout_exercises_exercise ON public.workout_exercises(exercise_id);

-- Add triggers for updated_at
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_exercises_updated_at BEFORE UPDATE ON public.workout_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
