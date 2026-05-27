-- Verificar que el JOIN funciona
SELECT 
  'TEST JOIN:' as info,
  c.id as client_id,
  c.coach_id,
  c.user_id,
  u.full_name,
  u.email,
  c.goals,
  c.fitness_level
FROM public.clients c
LEFT JOIN public.users u ON c.user_id = u.id;

-- Verificar foreign keys
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    a.attname AS column_name,
    confrelid::regclass AS foreign_table_name
FROM
    pg_constraint AS c
    JOIN pg_attribute AS a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE
    contype = 'f'
    AND conrelid::regclass::text = 'clients';
