-- Remove duplicate exercises that were inserted twice due to a failed
-- migration push. Keeps the row with the latest created_at for each name.
DELETE FROM public.exercises
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM public.exercises
  ORDER BY name, created_at DESC
);
