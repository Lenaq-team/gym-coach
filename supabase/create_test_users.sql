-- =====================================================
-- CREATE TEST USERS FOR GYM COACH APP
-- Run this in Supabase SQL Editor
-- =====================================================

-- IMPORTANT: First create auth users in Supabase Dashboard:
-- 1. Go to Authentication → Users → Add User
-- 2. Create: coach@test.com / password123
-- 3. Create: client@test.com / password123
-- 4. Copy the user IDs from auth.users and replace below

-- =====================================================
-- STEP 1: Insert into users table (using actual schema)
-- =====================================================

-- Coach user (replace 'AUTH_USER_ID_HERE' with actual UUID from auth.users)
INSERT INTO public.users (id, email, full_name)
VALUES (
  'AUTH_USER_ID_FOR_COACH_HERE'::uuid,
  'coach@test.com',
  'Coach Test'
);

-- Client user (replace 'AUTH_USER_ID_HERE' with actual UUID from auth.users)
INSERT INTO public.users (id, email, full_name)
VALUES (
  'AUTH_USER_ID_FOR_CLIENT_HERE'::uuid,
  'client@test.com',
  'Client Test'
);

-- =====================================================
-- STEP 2: Insert into coaches table
-- =====================================================

INSERT INTO public.coaches (user_id, bio, specialties, is_verified)
VALUES (
  'AUTH_USER_ID_FOR_COACH_HERE'::uuid,
  'Coach de prueba con experiencia en entrenamiento funcional',
  ARRAY['Fuerza', 'Hipertrofia', 'Pérdida de peso'],
  true
);

-- =====================================================
-- STEP 3: Insert into clients table
-- =====================================================

INSERT INTO public.clients (
  user_id, 
  coach_id, 
  height_cm, 
  weight_kg, 
  fitness_level,
  goals,
  injuries
)
VALUES (
  'AUTH_USER_ID_FOR_CLIENT_HERE'::uuid,
  (SELECT id FROM public.coaches WHERE user_id = 'AUTH_USER_ID_FOR_COACH_HERE'::uuid),
  175.0,
  75.0,
  'intermediate',
  ARRAY['Ganar masa muscular', 'Mejorar fuerza'],
  ARRAY[]
);

-- =====================================================
-- VERIFY DATA
-- =====================================================

-- Check users
SELECT * FROM public.users;

-- Check coaches
SELECT * FROM public.coaches;

-- Check clients with coach info
SELECT 
  c.*,
  u.full_name as client_name,
  coach.user_id as coach_user_id
FROM public.clients c
JOIN public.users u ON c.user_id = u.id
LEFT JOIN public.coaches coach ON c.coach_id = coach.id;
