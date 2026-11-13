# Mentorhood Math — Public Website + Member Portal demo (v2)

This demo re-creates most major public-facing categories from https://www.mentorhoodmath.com/ and connects to an isolated Supabase backend. It is *not* a copy of the Wix site editor, nor a finished production migration.

## Included

- Responsive public pages: homepage, programs, online & in-person classes, free math resources, about, founders/team, and contact
- Links to original site pages for advanced program information, blog, current enrollment forms and shop
- Reference links to 7 real Mentorhood Wix-hosted image assets (not yet exported into the ZIP)
- Member account interface: **email signup**, **email login**, **Google OAuth sign-in button**
- Signed-in member video catalog backed by `public.videos`
- Staff-only project tracking dashboard (projects/tasks, four stages) backed by RLS-protected Supabase tables

## Live backend (already provisioned)

- Organization: `Mentorhood Math`
- Project: `Mentorhood Math Portal` (`itfucxbclbccoaidvqab`)
- Region: Canada Central
- Public Supabase URL/publishable key: `config.js`
- DB: `team_members`, `projects`, `tasks`, `videos` (RLS protected)
- Staff membership: only trusted admin can assign `owner` or `staff` in team_members
- **Applied** `database/002_registered_member_video_access.sql`: all authenticated users can see *published* videos; no anonymous read. Staff projects remain private.

Database migrations were **already applied** to the existing live project. Do not execute the SQL files again there. They are copies for tracking/version control, not setup scripts for this existing database.

## Deploy to GitHub Pages

1. Create public repository `mentorhood-website` on GitHub.
2. Extract this ZIP and upload its **contents** to the repository root (not the ZIP itself).
3. Settings → Pages → deploy from branch `main` and `/ (root)`.
4. Site URL resembles `https://YOUR-USER.github.io/mentorhood-website/`.
5. Configure the exact URL in Supabase Auth URL Configuration, then follow `AUTH_GOOGLE_SETUP.md` for email signup and Google OAuth.

This is static HTML/CSS/JavaScript (no compilation needed). Supabase's **publishable key** may be committed, but never commit secrets, tokens, passwords or database backups.

## What isn't migrated or activated yet

- **Images** are referenced directly from current Wix hosting for the demo, not copied. Before switching away from Wix, ask the owner for approved image exports and store them locally; details in `assets/IMAGE_SOURCES.md`.
- Contact/trial signups currently link to the original functional Wix form. No new contact form storage or email notifications yet.
- Blog, download shop, detailed program pages, and external registration flows still use links to existing pages. Review those before final cutover.
- Live Google sign-in needs a Google Cloud OAuth client with credentials configured inside Supabase. No credentials are in this ZIP.
- Email registration requires Supabase Auth signup and email confirmation configured in the dashboard.
- The database has no staff accounts or videos yet, so real login and protected portal interactions have not been fully end-to-end tested.
- This preview adds `<meta name="robots" content="noindex,nofollow">`; remove after launch approval for the production domain.

## Checks before showing the owner

- Review public copy, class locations, prices, courses and photo rights with the owner.
- Test the exact GitHub Pages deployed site, especially image loading, navigation on phones, email signups and Google OAuth.
- Assign first verified staff login in Supabase and verify board persistence.
- Test that a *regular registered member* cannot read projects/tasks over the API.
- Use host-level access control for any paid/private video file, since embedded video URLs can be shared.

## Files

- `index.html`: public site and portal HTML
- `styles.css`: full responsive styling
- `app.js`: routing, Auth and project/video data flows
- `config.js`: safe browser-only Supabase connection
- `AUTH_GOOGLE_SETUP.md`: exact steps to activate email registration and Google OAuth
- `assets/IMAGE_SOURCES.md`: original-site asset references and migration requirements
- `database/*.sql`: deployed-schema references, do not rerun on this live project
- `database/OWNER_SETUP.md`: initial admin assignment
