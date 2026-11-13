-- DEPLOYED already on Mentorhood Math Portal. Keep for version-control/reference.
-- Do not rerun unless you are setting up a separate database with schema 001.
drop policy if exists members_read_published_videos on public.videos;
create policy members_read_published_videos on public.videos for select to authenticated
using (
  is_published
  or exists (
    select 1 from public.team_members tm
    where tm.user_id = (select auth.uid())
      and tm.is_active and tm.role = 'owner'
  )
);
