-- Allow coaches to read the users rows that belong to their clients.
-- This is required for PostgREST foreign-key joins (clients → users) to
-- return full_name / email / avatar_url when querying from a coach session.
CREATE POLICY "Coaches can view their clients' user profiles" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT c.user_id
      FROM public.clients c
      WHERE c.coach_id IN (
        SELECT co.id FROM public.coaches co WHERE co.user_id = (SELECT auth.uid())
      )
    )
  );
