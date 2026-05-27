-- Debug query - ejecuta esto para ver qué hay en las tablas
SELECT 'CLIENTS TABLE:' as info;
SELECT c.* FROM public.clients c;

SELECT 'USERS TABLE:' as info;
SELECT u.* FROM public.users u WHERE u.email IN ('coach@test.com', 'client@test.com');

SELECT 'JOIN TEST:' as info;
SELECT 
  c.id as client_id,
  c.user_id,
  c.height_cm,
  u.id as user_table_id,
  u.full_name,
  u.email
FROM public.clients c
LEFT JOIN public.users u ON c.user_id = u.id;
