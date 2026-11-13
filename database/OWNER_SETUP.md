# First staff account for Mentorhood Math Portal

The database exists but starts with no staff users, so nobody can log in to the portal yet.

1. Open https://supabase.com/dashboard/project/itfucxbclbccoaidvqab/auth/users
2. Use **Invite user** to invite an email address you control, or create a test user using the dashboard. Do not share passwords here.
3. Copy the exact Auth User UID (UUID) shown by Supabase.
4. Open the SQL Editor **in this project only** and use:

```sql
insert into public.team_members (user_id, display_name, role, is_active)
values ('PASTE-ACTUAL-AUTH-USER-UUID-HERE', 'Demo Owner', 'owner', true);
```

5. In Authentication settings, turn off public signups for the invite-only staff demo. Keep confirmation and redirect settings appropriate to your chosen login flow.
6. Once GitHub Pages URL is known, add it to Auth URL Configuration and test sign-in at `#/portal`.

Only invite people authorized to test the demo. Never paste passwords, magic links, JWTs, service-role keys, or database secrets into GitHub.
