-- Add media_type column to progress_photos to support both photos and videos
ALTER TABLE public.progress_photos
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('photo', 'video')) DEFAULT 'photo';

-- Allow coaches to insert progress media for their clients
-- (existing policy only allowed SELECT for coaches)
CREATE POLICY "Coaches can insert media for their clients" ON public.progress_photos
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients
      WHERE coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid())
    )
  );
