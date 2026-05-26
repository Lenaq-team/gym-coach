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

-- Create indexes
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

-- Add triggers for updated_at
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
