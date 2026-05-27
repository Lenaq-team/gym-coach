-- =====================================================
-- COPY-PASTE VERSION - Just replace the UUIDs and run!
-- =====================================================

-- STEP 1: Get your UUIDs from Authentication > Users
-- Copy the IDs for coach@test.com and client@test.com
-- Then paste them below

DO $$
DECLARE
  coach_id UUID := 'YOUR-COACH-UUID-HERE';  -- 👈 PASTE COACH UUID HERE
  client_id UUID := 'YOUR-CLIENT-UUID-HERE'; -- 👈 PASTE CLIENT UUID HERE
  new_coach_profile_id UUID;
BEGIN
  -- Create coach user
  INSERT INTO public.users (id, email, full_name)
  VALUES (coach_id, 'coach@test.com', 'Juan Coach')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  
  -- Create coach profile
  INSERT INTO public.coaches (user_id, bio, specialties, is_verified)
  VALUES (
    coach_id,
    'Coach certificado con experiencia en entrenamiento',
    ARRAY['Fuerza', 'Hipertrofia', 'Pérdida de peso'],
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio
  RETURNING id INTO new_coach_profile_id;
  
  -- Get coach profile ID if already exists
  IF new_coach_profile_id IS NULL THEN
    SELECT id INTO new_coach_profile_id FROM public.coaches WHERE user_id = coach_id;
  END IF;
  
  -- Create client user
  INSERT INTO public.users (id, email, full_name)
  VALUES (client_id, 'client@test.com', 'María Cliente')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  
  -- Create client profile
  INSERT INTO public.clients (
    user_id,
    coach_id,
    height_cm,
    weight_kg,
    fitness_level,
    goals
  )
  VALUES (
    client_id,
    new_coach_profile_id,
    165.0,
    68.0,
    'intermediate',
    ARRAY['Ganar masa muscular', 'Mejorar resistencia']
  )
  ON CONFLICT (user_id) DO UPDATE SET coach_id = EXCLUDED.coach_id;
  
  RAISE NOTICE '✅ SUCCESS!';
  RAISE NOTICE 'Login: coach@test.com / password123';
  RAISE NOTICE 'Login: client@test.com / password123';
END $$;
