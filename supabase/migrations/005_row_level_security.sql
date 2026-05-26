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
