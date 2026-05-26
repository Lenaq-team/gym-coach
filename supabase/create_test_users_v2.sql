-- =====================================================
-- CREATE TEST USERS - WORKS WITH ACTUAL DATABASE SCHEMA
-- =====================================================
-- Run this in Supabase SQL Editor AFTER creating auth users

-- STEP 1: First create these users in Supabase Dashboard:
-- Go to Authentication → Users → Add User
-- 
-- Coach: coach@test.com / password123 (Auto Confirm: YES)
-- Client: client@test.com / password123 (Auto Confirm: YES)
--
-- STEP 2: Copy their IDs from the Users list and paste below:

DO $$
DECLARE
  coach_auth_id UUID := 'PASTE_COACH_AUTH_UUID_HERE';
  client_auth_id UUID := 'PASTE_CLIENT_AUTH_UUID_HERE';
  new_coach_id UUID;
BEGIN
  -- Create coach user record
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    coach_auth_id,
    'coach@test.com',
    'Juan Coach',
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  -- Create coach profile
  INSERT INTO public.coaches (user_id, bio, specialties, is_verified)
  VALUES (
    coach_auth_id,
    'Coach certificado con 10 años de experiencia',
    ARRAY['Fuerza', 'Hipertrofia', 'Pérdida de peso']::text[],
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    specialties = EXCLUDED.specialties
  RETURNING id INTO new_coach_id;
  
  -- If coach already existed, get its ID
  IF new_coach_id IS NULL THEN
    SELECT id INTO new_coach_id FROM public.coaches WHERE user_id = coach_auth_id;
  END IF;
  
  -- Create client user record
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    client_auth_id,
    'client@test.com',
    'María Cliente',
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  -- Create client profile
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
    client_auth_id,
    new_coach_id,
    165.0,
    68.0,
    'intermediate',
    ARRAY['Ganar masa muscular', 'Mejorar resistencia']::text[],
    ARRAY[]::text[]
  )
  ON CONFLICT (user_id) DO UPDATE SET
    coach_id = EXCLUDED.coach_id,
    height_cm = EXCLUDED.height_cm,
    weight_kg = EXCLUDED.weight_kg;
  
  RAISE NOTICE 'Users created successfully!';
  RAISE NOTICE 'Coach ID: %', new_coach_id;
  RAISE NOTICE 'Login with: coach@test.com / password123';
  RAISE NOTICE 'Login with: client@test.com / password123';
END $$;

-- Verify the data
SELECT 'USERS TABLE:' as table_name;
SELECT id, email, full_name FROM public.users WHERE email IN ('coach@test.com', 'client@test.com');

SELECT 'COACHES TABLE:' as table_name;
SELECT c.id, u.full_name, c.bio, c.is_verified 
FROM public.coaches c
JOIN public.users u ON c.user_id = u.id
WHERE u.email = 'coach@test.com';

SELECT 'CLIENTS TABLE:' as table_name;
SELECT cl.id, u.full_name, cl.height_cm, cl.weight_kg, cl.fitness_level
FROM public.clients cl
JOIN public.users u ON cl.user_id = u.id
WHERE u.email = 'client@test.com';
