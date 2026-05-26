-- =====================================================
-- EASIEST METHOD: Just copy-paste and run this!
-- =====================================================

-- Step 1: First, manually create these users in Supabase Dashboard:
-- Go to Authentication → Users → Add User
-- 
-- User 1: coach@test.com / password123 (Auto Confirm: YES)
-- User 2: client@test.com / password123 (Auto Confirm: YES)
--
-- Step 2: After creating them, find them in the Users list
-- Step 3: Copy their UUIDs (the long ID string)
-- Step 4: Replace the UUIDs below and run this script

DO $$
DECLARE
  -- 👇 REPLACE THESE WITH ACTUAL UUIDs FROM AUTH.USERS 👇
  coach_uuid UUID := '00000000-0000-0000-0000-000000000001'; -- Replace with coach UUID
  client_uuid UUID := '00000000-0000-0000-0000-000000000002'; -- Replace with client UUID
  -- 👆 REPLACE THESE WITH ACTUAL UUIDs FROM AUTH.USERS 👆
  
  coach_profile_id UUID;
BEGIN
  -- Create coach in users table
  INSERT INTO public.users (id, email, full_name, avatar_url, phone)
  VALUES (
    coach_uuid,
    'coach@test.com',
    'Juan Coach',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=coach',
    '+52 123 456 7890'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  -- Create coach profile
  INSERT INTO public.coaches (user_id, bio, specialties, certifications, years_of_experience, is_verified, rating)
  VALUES (
    coach_uuid,
    'Coach certificado con 10 años de experiencia en entrenamiento funcional, hipertrofia y nutrición deportiva. Especializado en transformaciones físicas.',
    ARRAY['Fuerza', 'Hipertrofia', 'Pérdida de peso', 'Entrenamiento funcional', 'Nutrición']::text[],
    ARRAY['NSCA-CPT', 'ISSA', 'Nutrición deportiva']::text[],
    10,
    true,
    4.8
  )
  ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    specialties = EXCLUDED.specialties,
    certifications = EXCLUDED.certifications,
    years_of_experience = EXCLUDED.years_of_experience,
    is_verified = EXCLUDED.is_verified,
    rating = EXCLUDED.rating
  RETURNING id INTO coach_profile_id;
  
  -- Get coach profile ID if it already existed
  IF coach_profile_id IS NULL THEN
    SELECT id INTO coach_profile_id FROM public.coaches WHERE user_id = coach_uuid;
  END IF;
  
  -- Create client in users table
  INSERT INTO public.users (id, email, full_name, avatar_url, phone)
  VALUES (
    client_uuid,
    'client@test.com',
    'María Cliente',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=client',
    '+52 098 765 4321'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  -- Create client profile
  INSERT INTO public.clients (
    user_id,
    coach_id,
    date_of_birth,
    gender,
    height_cm,
    weight_kg,
    fitness_level,
    goals,
    medical_conditions,
    injuries
  )
  VALUES (
    client_uuid,
    coach_profile_id,
    '1995-06-15',
    'female',
    165.0,
    68.0,
    'intermediate',
    ARRAY['Ganar masa muscular', 'Mejorar resistencia', 'Bajar grasa corporal']::text[],
    ARRAY[]::text[],
    ARRAY[]::text[]
  )
  ON CONFLICT (user_id) DO UPDATE SET
    coach_id = EXCLUDED.coach_id,
    height_cm = EXCLUDED.height_cm,
    weight_kg = EXCLUDED.weight_kg,
    fitness_level = EXCLUDED.fitness_level,
    goals = EXCLUDED.goals;
  
  -- Success message
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE '✅ SUCCESS! Test users created successfully!';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 LOGIN CREDENTIALS:';
  RAISE NOTICE '   👨‍💼 Coach:  coach@test.com  / password123';
  RAISE NOTICE '   👤 Client: client@test.com / password123';
  RAISE NOTICE '';
  RAISE NOTICE '📱 Go to: http://localhost:5174';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════';
  
END $$;

-- Verify the data was created correctly
SELECT '════ 👥 USERS ════' as section;
SELECT id, email, full_name, phone 
FROM public.users 
WHERE email IN ('coach@test.com', 'client@test.com')
ORDER BY email;

SELECT '════ 👨‍💼 COACHES ════' as section;
SELECT 
  c.id,
  u.full_name,
  u.email,
  c.bio,
  c.specialties,
  c.is_verified,
  c.rating,
  c.years_of_experience
FROM public.coaches c
JOIN public.users u ON c.user_id = u.id
WHERE u.email = 'coach@test.com';

SELECT '════ 👤 CLIENTS ════' as section;
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
LEFT JOIN public.coaches coach ON cl.coach_id = coach.id
LEFT JOIN public.users coach_u ON coach.user_id = coach_u.id
WHERE u.email = 'client@test.com';
