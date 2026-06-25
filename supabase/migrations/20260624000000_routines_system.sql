-- ============================================================
-- Migration: Routines System
-- Replaces the old workout_plans / workout_sessions / workout_exercises
-- structure with a reusable, coach-centric routines system.
-- ============================================================


-- ============================================================
-- SECTION 1: DROP obsolete tables (FK-safe order)
-- ============================================================

DROP TABLE IF EXISTS public.workout_exercises CASCADE;
DROP TABLE IF EXISTS public.workout_sessions   CASCADE;
DROP TABLE IF EXISTS public.workout_plans      CASCADE;


-- ============================================================
-- SECTION 2: Modify existing tables
-- ============================================================

-- exercises: remove columns that are no longer needed
ALTER TABLE public.exercises
  DROP COLUMN IF EXISTS video_url,
  DROP COLUMN IF EXISTS thumbnail_url,
  DROP COLUMN IF EXISTS instructions;

-- completed_workouts: swap workout_session_id for the new FK columns
ALTER TABLE public.completed_workouts
  DROP COLUMN IF EXISTS workout_session_id,
  ADD COLUMN  client_routine_id UUID,
  ADD COLUMN  routine_day_id    UUID;

-- Also drop the index that pointed at the removed column (created in 003)
DROP INDEX IF EXISTS public.idx_completed_workouts_session;


-- ============================================================
-- SECTION 3: Create new tables
-- ============================================================

-- ----------------------------------------------------------
-- 3.1  routines
-- ----------------------------------------------------------
CREATE TABLE public.routines (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id         UUID        REFERENCES public.coaches(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  description      TEXT,
  goal             TEXT,
  difficulty_level TEXT        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  days_per_week    INTEGER     CHECK (days_per_week BETWEEN 1 AND 7),
  is_template      BOOLEAN     DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 3.2  routine_days
-- ----------------------------------------------------------
CREATE TABLE public.routine_days (
  id                         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id                 UUID        NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  name                       TEXT        NOT NULL,
  order_index                INTEGER     NOT NULL,
  estimated_duration_minutes INTEGER,
  notes                      TEXT,
  created_at                 TIMESTAMPTZ DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 3.3  routine_day_sections
-- ----------------------------------------------------------
CREATE TABLE public.routine_day_sections (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_day_id UUID        NOT NULL REFERENCES public.routine_days(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  section_type   TEXT        CHECK (section_type IN ('warmup', 'core', 'main', 'cardio', 'cooldown', 'custom')),
  order_index    INTEGER     NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 3.4  routine_day_exercises
-- ----------------------------------------------------------
CREATE TABLE public.routine_day_exercises (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id     UUID           NOT NULL REFERENCES public.routine_day_sections(id) ON DELETE CASCADE,
  exercise_id    UUID           NOT NULL REFERENCES public.exercises(id)            ON DELETE CASCADE,
  order_index    INTEGER        NOT NULL,
  -- Rep-based
  sets           INTEGER,
  reps_min       INTEGER,
  reps_max       INTEGER,
  reps_note      TEXT,
  to_failure     BOOLEAN        DEFAULT FALSE,
  -- Intensity (RPE / % of 1RM)
  intensity_min  DECIMAL(5, 2),
  intensity_max  DECIMAL(5, 2),
  intensity_type TEXT           CHECK (intensity_type IN ('percent_rm', 'rpe_10', 'none')) DEFAULT 'none',
  -- Time-based (cardio / mobility)
  duration_minutes INTEGER,
  duration_note  TEXT,
  -- General
  notes          TEXT,
  created_at     TIMESTAMPTZ    DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 3.5  client_routines
-- ----------------------------------------------------------
CREATE TABLE public.client_routines (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID        NOT NULL REFERENCES public.clients(id)  ON DELETE CASCADE,
  coach_id   UUID        NOT NULL REFERENCES public.coaches(id)  ON DELETE CASCADE,
  routine_id UUID        NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  start_date DATE,
  end_date   DATE,
  is_active  BOOLEAN     DEFAULT TRUE,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 3.6  client_exercise_config
-- ----------------------------------------------------------
CREATE TABLE public.client_exercise_config (
  id                       UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  client_routine_id        UUID           NOT NULL REFERENCES public.client_routines(id)       ON DELETE CASCADE,
  routine_day_exercise_id  UUID           NOT NULL REFERENCES public.routine_day_exercises(id) ON DELETE CASCADE,
  -- Overrides (NULL = use routine default)
  sets          INTEGER,
  reps_min      INTEGER,
  reps_max      INTEGER,
  weight_kg     DECIMAL(6, 2),
  intensity_min DECIMAL(5, 2),
  intensity_max DECIMAL(5, 2),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_routine_id, routine_day_exercise_id)
);


-- ============================================================
-- SECTION 4: Add FK constraints to completed_workouts
-- ============================================================

ALTER TABLE public.completed_workouts
  ADD CONSTRAINT fk_completed_workouts_client_routine
    FOREIGN KEY (client_routine_id)
    REFERENCES public.client_routines(id)
    ON DELETE SET NULL,
  ADD CONSTRAINT fk_completed_workouts_routine_day
    FOREIGN KEY (routine_day_id)
    REFERENCES public.routine_days(id)
    ON DELETE SET NULL;


-- ============================================================
-- SECTION 5: Indexes
-- ============================================================

-- routines
CREATE INDEX idx_routines_coach_id         ON public.routines(coach_id);
CREATE INDEX idx_routines_difficulty_level ON public.routines(difficulty_level);
CREATE INDEX idx_routines_is_template      ON public.routines(is_template);

-- routine_days
CREATE INDEX idx_routine_days_routine_id   ON public.routine_days(routine_id);
CREATE INDEX idx_routine_days_order_index  ON public.routine_days(routine_id, order_index);

-- routine_day_sections
CREATE INDEX idx_routine_day_sections_day_id     ON public.routine_day_sections(routine_day_id);
CREATE INDEX idx_routine_day_sections_order_index ON public.routine_day_sections(routine_day_id, order_index);

-- routine_day_exercises
CREATE INDEX idx_routine_day_exercises_section_id  ON public.routine_day_exercises(section_id);
CREATE INDEX idx_routine_day_exercises_exercise_id ON public.routine_day_exercises(exercise_id);
CREATE INDEX idx_routine_day_exercises_order_index ON public.routine_day_exercises(section_id, order_index);

-- client_routines
CREATE INDEX idx_client_routines_client_id  ON public.client_routines(client_id);
CREATE INDEX idx_client_routines_coach_id   ON public.client_routines(coach_id);
CREATE INDEX idx_client_routines_routine_id ON public.client_routines(routine_id);
CREATE INDEX idx_client_routines_is_active  ON public.client_routines(is_active);

-- client_exercise_config
CREATE INDEX idx_client_exercise_config_client_routine_id       ON public.client_exercise_config(client_routine_id);
CREATE INDEX idx_client_exercise_config_routine_day_exercise_id ON public.client_exercise_config(routine_day_exercise_id);

-- completed_workouts (new FK columns)
CREATE INDEX idx_completed_workouts_client_routine ON public.completed_workouts(client_routine_id);
CREATE INDEX idx_completed_workouts_routine_day    ON public.completed_workouts(routine_day_id);


-- ============================================================
-- SECTION 6: updated_at triggers
-- ============================================================

CREATE TRIGGER update_routines_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routine_days_updated_at
  BEFORE UPDATE ON public.routine_days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routine_day_exercises_updated_at
  BEFORE UPDATE ON public.routine_day_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_routines_updated_at
  BEFORE UPDATE ON public.client_routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_exercise_config_updated_at
  BEFORE UPDATE ON public.client_exercise_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: routine_day_sections has no updated_at column, so no trigger needed.


-- ============================================================
-- SECTION 7: Row Level Security
-- ============================================================

ALTER TABLE public.routines              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_days          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_day_sections  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_day_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_routines       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_exercise_config ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SECTION 8: RLS Policies
-- ============================================================

-- ----------------------------------------------------------
-- 8.1  routines
-- ----------------------------------------------------------

CREATE POLICY "Coaches can view their own routines" ON public.routines
  FOR SELECT USING (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can create their own routines" ON public.routines
  FOR INSERT WITH CHECK (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can update their own routines" ON public.routines
  FOR UPDATE USING (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can delete their own routines" ON public.routines
  FOR DELETE USING (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can view routines assigned to them" ON public.routines
  FOR SELECT USING (
    id IN (
      SELECT routine_id FROM public.client_routines
      WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    )
  );

-- ----------------------------------------------------------
-- 8.2  routine_days
-- ----------------------------------------------------------

CREATE POLICY "Coaches can view days of their own routines" ON public.routine_days
  FOR SELECT USING (
    routine_id IN (
      SELECT id FROM public.routines
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can create days for their own routines" ON public.routine_days
  FOR INSERT WITH CHECK (
    routine_id IN (
      SELECT id FROM public.routines
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can update days of their own routines" ON public.routine_days
  FOR UPDATE USING (
    routine_id IN (
      SELECT id FROM public.routines
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can delete days of their own routines" ON public.routine_days
  FOR DELETE USING (
    routine_id IN (
      SELECT id FROM public.routines
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Clients can view days of routines assigned to them" ON public.routine_days
  FOR SELECT USING (
    routine_id IN (
      SELECT routine_id FROM public.client_routines
      WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    )
  );

-- ----------------------------------------------------------
-- 8.3  routine_day_sections
-- ----------------------------------------------------------

CREATE POLICY "Coaches can view sections of their own routine days" ON public.routine_day_sections
  FOR SELECT USING (
    routine_day_id IN (
      SELECT rd.id FROM public.routine_days rd
      JOIN public.routines r ON rd.routine_id = r.id
      WHERE r.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can create sections for their own routine days" ON public.routine_day_sections
  FOR INSERT WITH CHECK (
    routine_day_id IN (
      SELECT rd.id FROM public.routine_days rd
      JOIN public.routines r ON rd.routine_id = r.id
      WHERE r.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can update sections of their own routine days" ON public.routine_day_sections
  FOR UPDATE USING (
    routine_day_id IN (
      SELECT rd.id FROM public.routine_days rd
      JOIN public.routines r ON rd.routine_id = r.id
      WHERE r.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can delete sections of their own routine days" ON public.routine_day_sections
  FOR DELETE USING (
    routine_day_id IN (
      SELECT rd.id FROM public.routine_days rd
      JOIN public.routines r ON rd.routine_id = r.id
      WHERE r.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Clients can view sections of routine days assigned to them" ON public.routine_day_sections
  FOR SELECT USING (
    routine_day_id IN (
      SELECT rd.id FROM public.routine_days rd
      JOIN public.client_routines cr ON rd.routine_id = cr.routine_id
      WHERE cr.client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    )
  );

-- ----------------------------------------------------------
-- 8.4  routine_day_exercises
-- ----------------------------------------------------------

CREATE POLICY "Coaches can view exercises of their own routine sections" ON public.routine_day_exercises
  FOR SELECT USING (
    section_id IN (
      SELECT rds.id FROM public.routine_day_sections rds
      JOIN public.routine_days rd ON rds.routine_day_id = rd.id
      JOIN public.routines r     ON rd.routine_id = r.id
      WHERE r.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can create exercises for their own routine sections" ON public.routine_day_exercises
  FOR INSERT WITH CHECK (
    section_id IN (
      SELECT rds.id FROM public.routine_day_sections rds
      JOIN public.routine_days rd ON rds.routine_day_id = rd.id
      JOIN public.routines r     ON rd.routine_id = r.id
      WHERE r.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can update exercises of their own routine sections" ON public.routine_day_exercises
  FOR UPDATE USING (
    section_id IN (
      SELECT rds.id FROM public.routine_day_sections rds
      JOIN public.routine_days rd ON rds.routine_day_id = rd.id
      JOIN public.routines r     ON rd.routine_id = r.id
      WHERE r.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can delete exercises of their own routine sections" ON public.routine_day_exercises
  FOR DELETE USING (
    section_id IN (
      SELECT rds.id FROM public.routine_day_sections rds
      JOIN public.routine_days rd ON rds.routine_day_id = rd.id
      JOIN public.routines r     ON rd.routine_id = r.id
      WHERE r.coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Clients can view exercises of routine sections assigned to them" ON public.routine_day_exercises
  FOR SELECT USING (
    section_id IN (
      SELECT rds.id FROM public.routine_day_sections rds
      JOIN public.routine_days rd ON rds.routine_day_id = rd.id
      JOIN public.client_routines cr ON rd.routine_id = cr.routine_id
      WHERE cr.client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    )
  );

-- ----------------------------------------------------------
-- 8.5  client_routines
-- ----------------------------------------------------------

CREATE POLICY "Coaches can view their client routine assignments" ON public.client_routines
  FOR SELECT USING (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can create client routine assignments" ON public.client_routines
  FOR INSERT WITH CHECK (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can update their client routine assignments" ON public.client_routines
  FOR UPDATE USING (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can delete their client routine assignments" ON public.client_routines
  FOR DELETE USING (
    coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can view their own routine assignments" ON public.client_routines
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

-- ----------------------------------------------------------
-- 8.6  client_exercise_config
-- ----------------------------------------------------------

CREATE POLICY "Coaches can view exercise configs for their client assignments" ON public.client_exercise_config
  FOR SELECT USING (
    client_routine_id IN (
      SELECT id FROM public.client_routines
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can create exercise configs for their client assignments" ON public.client_exercise_config
  FOR INSERT WITH CHECK (
    client_routine_id IN (
      SELECT id FROM public.client_routines
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can update exercise configs for their client assignments" ON public.client_exercise_config
  FOR UPDATE USING (
    client_routine_id IN (
      SELECT id FROM public.client_routines
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can delete exercise configs for their client assignments" ON public.client_exercise_config
  FOR DELETE USING (
    client_routine_id IN (
      SELECT id FROM public.client_routines
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Clients can view their own exercise configs" ON public.client_exercise_config
  FOR SELECT USING (
    client_routine_id IN (
      SELECT id FROM public.client_routines
      WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    )
  );
