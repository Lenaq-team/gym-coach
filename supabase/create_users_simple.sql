-- =====================================================
-- SIMPLE VERSION: Use Supabase Auth API
-- =====================================================
-- This creates everything without touching auth.users directly
-- Run this in Supabase SQL Editor

-- First, let's create the users via a function that uses Supabase's auth API
CREATE OR REPLACE FUNCTION create_test_users()
RETURNS TABLE (
  status text,
  coach_email text,
  client_email text,
  message text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coach_id UUID;
  client_id UUID;
  new_coach_id UUID;
BEGIN
  -- Try to find existing users first
  SELECT id INTO coach_id FROM auth.users WHERE email = 'coach@test.com';
  SELECT id INTO client_id FROM auth.users WHERE email = 'client@test.com';
  
  -- If users don't exist in auth, create them manually
  IF coach_id IS NULL THEN
    coach_id := gen_random_uuid();
  END IF;
  
  IF client_id IS NULL THEN
    client_id := gen_random_uuid();
  END IF;
  
  -- Create public.users records
  INSERT INTO public.users (id, email, full_name)
  VALUES (coach_id, 'coach@test.com', 'Juan Coach')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  INSERT INTO public.users (id, email, full_name)
  VALUES (client_id, 'client@test.com', 'María Cliente')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  -- Create coach profile
  INSERT INTO public.coaches (user_id, bio, specialties, is_verified)
  VALUES (
    coach_id,
    'Coach certificado con experiencia',
    ARRAY['Fuerza', 'Hipertrofia']::text[],
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    specialties = EXCLUDED.specialties
  RETURNING id INTO new_coach_id;
  
  IF new_coach_id IS NULL THEN
    SELECT id INTO new_coach_id FROM public.coaches WHERE user_id = coach_id;
  END IF;
  
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
    new_coach_id,
    165.0,
    68.0,
    'intermediate',
    ARRAY['Ganar masa muscular']::text[]
  )
  ON CONFLICT (user_id) DO UPDATE SET
    coach_id = EXCLUDED.coach_id;
  
  RETURN QUERY SELECT 
    'success'::text,
    'coach@test.com'::text,
    'client@test.com'::text,
    format('Created users with IDs: Coach=%s, Client=%s', coach_id, client_id)::text;
END;
$$;

-- Execute the function
SELECT * FROM create_test_users();

-- Clean up the function
DROP FUNCTION create_test_users();

-- =====================================================
-- NOW CREATE AUTH USERS MANUALLY IN DASHBOARD
-- =====================================================
-- The above created the database records with random UUIDs
-- Now you need to create the auth users:
--
-- 1. Go to Authentication → Users → Add User
-- 2. Create: coach@test.com / password123 / Auto Confirm: YES
-- 3. Create: client@test.com / password123 / Auto Confirm: YES
-- 4. Copy their IDs and run the UPDATE script below

-- =====================================================
-- AFTER CREATING AUTH USERS: Update the UUIDs
-- =====================================================
-- Replace the UUIDs below with the ones from auth.users

DO $$
DECLARE
  coach_auth_id UUID := 'PASTE_COACH_UUID_FROM_AUTH_USERS';
  client_auth_id UUID := 'PASTE_CLIENT_UUID_FROM_AUTH_USERS';
BEGIN
  -- Update users table with correct auth IDs
  UPDATE public.users SET id = coach_auth_id WHERE email = 'coach@test.com';
  UPDATE public.users SET id = client_auth_id WHERE email = 'client@test.com';
  
  -- Update coaches table
  UPDATE public.coaches SET user_id = coach_auth_id 
  WHERE user_id IN (SELECT id FROM public.users WHERE email = 'coach@test.com');
  
  -- Update clients table
  UPDATE public.clients SET user_id = client_auth_id
  WHERE user_id IN (SELECT id FROM public.users WHERE email = 'client@test.com');
  
  RAISE NOTICE 'Users updated with auth IDs successfully!';
END $$;

-- Verify everything
SELECT 'Users:' as table_name, id, email, full_name FROM public.users WHERE email IN ('coach@test.com', 'client@test.com')
UNION ALL
SELECT 'Coaches:', c.id::text, u.email, u.full_name FROM public.coaches c JOIN public.users u ON c.user_id = u.id WHERE u.email = 'coach@test.com'
UNION ALL
SELECT 'Clients:', cl.id::text, u.email, u.full_name FROM public.clients cl JOIN public.users u ON cl.user_id = u.id WHERE u.email = 'client@test.com';
