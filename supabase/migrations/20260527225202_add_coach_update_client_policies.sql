-- Coaches need UPDATE access on clients rows that belong to them.
-- Without this policy, saves from the coach's edit form silently return 0 rows.
DROP POLICY IF EXISTS "Coaches can update their clients' profile" ON public.clients;
CREATE POLICY "Coaches can update their clients' profile" ON public.clients
  FOR UPDATE
  TO authenticated
  USING (
    coach_id IN (
      SELECT id FROM public.coaches WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    coach_id IN (
      SELECT id FROM public.coaches WHERE user_id = (SELECT auth.uid())
    )
  );

-- Coaches need UPDATE access on the users rows that belong to their clients
-- so they can edit the client's full_name (which lives in the users table).
DROP POLICY IF EXISTS "Coaches can update their clients' name" ON public.users;
CREATE POLICY "Coaches can update their clients' name" ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT c.user_id FROM public.clients c
      WHERE c.coach_id IN (
        SELECT co.id FROM public.coaches co WHERE co.user_id = (SELECT auth.uid())
      )
    )
  )
  WITH CHECK (
    id IN (
      SELECT c.user_id FROM public.clients c
      WHERE c.coach_id IN (
        SELECT co.id FROM public.coaches co WHERE co.user_id = (SELECT auth.uid())
      )
    )
  );
