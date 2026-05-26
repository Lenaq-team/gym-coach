-- =====================================================
-- COMPLETE SETUP: CREATE AUTH USERS + DATABASE RECORDS
-- =====================================================
-- This script creates everything in one go!
-- Just run it in Supabase SQL Editor

-- =====================================================
-- PART 1: CREATE AUTH USERS (requires admin privileges)
-- =====================================================

-- Note: If you get permission errors on auth.users, 
-- use the Supabase Dashboard to create auth users instead.
-- Then skip to PART 2 with the generated UUIDs.

-- Generate UUIDs for our test users
DO $$
DECLARE
  coach_auth_id UUID := gen_random_uuid();
  client_auth_id UUID := gen_random_uuid();
  encrypted_password TEXT;
BEGIN
  -- Create coach auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    coach_auth_id,
    'authenticated',
    'authenticated',
    'coach@test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  );

  -- Create client auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    client_auth_id,
    'authenticated',
    'authenticated',
    'client@test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  );

  -- =====================================================
  -- PART 2: CREATE DATABASE RECORDS
  -- =====================================================

  -- Create coach user record
  INSERT INTO public.users (id, email, full_name)
  VALUES (coach_auth_id, 'coach@test.com', 'Juan Coach');
  
  -- Create coach profile
  INSERT INTO public.coaches (user_id, bio, specialties, is_verified)
  VALUES (
    coach_auth_id,
    'Coach certificado con 10 años de experiencia en entrenamiento funcional y nutrición deportiva',
    ARRAY['Fuerza', 'Hipertrofia', 'Pérdida de peso', 'Entrenamiento funcional']::text[],
    true
  );
  
  -- Create client user record
  INSERT INTO public.users (id, email, full_name)
  VALUES (client_auth_id, 'client@test.com', 'María Cliente');
  
  -- Create client profile (linked to coach)
  INSERT INTO public.clients (
    user_id,
    coach_id,
    height_cm,
    weight_kg,
    fitness_level,
    goals,
    injuries,
    date_of_birth
  )
  VALUES (
    client_auth_id,
    (SELECT id FROM public.coaches WHERE user_id = coach_auth_id),
    165.0,
    68.0,
    'intermediate',
    ARRAY['Ganar masa muscular', 'Mejorar resistencia', 'Bajar grasa corporal']::text[],
    ARRAY[]::text[],
    '1995-06-15'
  );

  RAISE NOTICE '✅ SUCCESS! Users created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 LOGIN CREDENTIALS:';
  RAISE NOTICE '   Coach: coach@test.com / password123';
  RAISE NOTICE '   Client: client@test.com / password123';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Generated UUIDs:';
  RAISE NOTICE '   Coach ID: %', coach_auth_id;
  RAISE NOTICE '   Client ID: %', client_auth_id;
  
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check auth users
SELECT '🔐 AUTH USERS:' as info;
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email IN ('coach@test.com', 'client@test.com')
ORDER BY email;

-- Check public users
SELECT '👤 PUBLIC USERS:' as info;
SELECT id, email, full_name, created_at
FROM public.users 
WHERE email IN ('coach@test.com', 'client@test.com')
ORDER BY email;

-- Check coaches
SELECT '💪 COACHES:' as info;
SELECT 
  c.id,
  u.full_name,
  u.email,
  c.bio,
  c.specialties,
  c.is_verified
FROM public.coaches c
JOIN public.users u ON c.user_id = u.id
WHERE u.email = 'coach@test.com';

-- Check clients
SELECT '🏋️ CLIENTS:' as info;
SELECT 
  cl.id,
  u.full_name as client_name,
  u.email,
  coach_u.full_name as coach_name,
  cl.height_cm,
  cl.weight_kg,
  cl.fitness_level,
  cl.goals
FROM public.clients cl
JOIN public.users u ON cl.user_id = u.id
JOIN public.coaches coach ON cl.coach_id = coach.id
JOIN public.users coach_u ON coach.user_id = coach_u.id
WHERE u.email = 'client@test.com';

-- Summary
SELECT '📊 SUMMARY:' as info;
SELECT 
  (SELECT COUNT(*) FROM auth.users WHERE email IN ('coach@test.com', 'client@test.com')) as auth_users_created,
  (SELECT COUNT(*) FROM public.users WHERE email IN ('coach@test.com', 'client@test.com')) as public_users_created,
  (SELECT COUNT(*) FROM public.coaches c JOIN public.users u ON c.user_id = u.id WHERE u.email = 'coach@test.com') as coaches_created,
  (SELECT COUNT(*) FROM public.clients c JOIN public.users u ON c.user_id = u.id WHERE u.email = 'client@test.com') as clients_created;
