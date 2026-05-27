-- =====================================================
-- STEP-BY-STEP: Create test users in correct order
-- =====================================================
-- Run each section separately to see what's happening

-- =====================================================
-- SECTION 1: Create user records in public.users
-- =====================================================
-- Replace these UUIDs with the ones from Authentication > Users

-- Get the UUIDs from auth users you already created:
SELECT id, email FROM auth.users WHERE email IN ('coach@test.com', 'client@test.com');

-- After copying the IDs above, replace them here:
INSERT INTO public.users (id, email, full_name, avatar_url)
VALUES 
  ('PASTE-COACH-UUID-HERE', 'coach@test.com', 'Juan Coach', null),
  ('PASTE-CLIENT-UUID-HERE', 'client@test.com', 'María Cliente', null)
ON CONFLICT (id) DO NOTHING;

-- Verify users were created:
SELECT * FROM public.users WHERE email IN ('coach@test.com', 'client@test.com');

-- =====================================================
-- SECTION 2: Create coach profile
-- =====================================================

INSERT INTO public.coaches (user_id, bio, specialties, is_verified)
VALUES (
  (SELECT id FROM public.users WHERE email = 'coach@test.com'),
  'Coach certificado con experiencia',
  ARRAY['Fuerza', 'Hipertrofia'],
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- Verify coach was created:
SELECT c.*, u.full_name, u.email 
FROM public.coaches c 
JOIN public.users u ON c.user_id = u.id
WHERE u.email = 'coach@test.com';

-- =====================================================
-- SECTION 3: Create client profile
-- =====================================================

INSERT INTO public.clients (
  user_id,
  coach_id,
  height_cm,
  weight_kg,
  fitness_level,
  goals
)
VALUES (
  (SELECT id FROM public.users WHERE email = 'client@test.com'),
  (SELECT id FROM public.coaches WHERE user_id = (SELECT id FROM public.users WHERE email = 'coach@test.com')),
  165.0,
  68.0,
  'intermediate',
  ARRAY['Ganar masa muscular']
)
ON CONFLICT (user_id) DO NOTHING;

-- Verify client was created:
SELECT 
  cl.*,
  u.full_name as client_name,
  u.email as client_email,
  coach_u.full_name as coach_name
FROM public.clients cl
JOIN public.users u ON cl.user_id = u.id
LEFT JOIN public.coaches coach ON cl.coach_id = coach.id
LEFT JOIN public.users coach_u ON coach.user_id = coach_u.id
WHERE u.email = 'client@test.com';

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

SELECT '✅ All data created!' as status;

SELECT 'Users:' as table_name, COUNT(*) as count 
FROM public.users 
WHERE email IN ('coach@test.com', 'client@test.com');

SELECT 'Coaches:' as table_name, COUNT(*) as count 
FROM public.coaches c 
JOIN public.users u ON c.user_id = u.id 
WHERE u.email = 'coach@test.com';

SELECT 'Clients:' as table_name, COUNT(*) as count 
FROM public.clients c 
JOIN public.users u ON c.user_id = u.id 
WHERE u.email = 'client@test.com';
