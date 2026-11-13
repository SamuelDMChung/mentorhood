# Mentorhood Math — Google + Email Account Registration

## Current implementation

`app.js` supports:

- `supabase.auth.signUp({email, password, options:{emailRedirectTo, data:{display_name}}})`
- `supabase.auth.signInWithPassword({email, password})`
- `supabase.auth.signInWithOAuth({ provider:'google', options:{redirectTo} })`
- Sign-out and persisted sessions

**Email registration:** the form is implemented, but registration and confirmation emails must be enabled in the live Supabase Auth settings. Don't turn off email verification for production.

**Google registration:** the UI/code is implemented, but the Google OAuth app is *not yet configured*. It will not work until the steps below have been completed. The user's OAuth Client Secret belongs in the Supabase dashboard, NOT in `config.js`, GitHub or this ZIP.

## 1. Publish the website first

Host the files at a GitHub Pages URL resembling:
`https://YOUR-USER.github.io/mentorhood-website/`

The URL is not known until your repository exists. Use the *exact URL* in the settings that follow. For local development, serve the site via HTTP (not `file://`).

## 2. Supabase Auth URL configuration

Visit: https://supabase.com/dashboard/project/itfucxbclbccoaidvqab/auth/url-configuration

- Site URL: exact GitHub Pages site URL (including trailing slash).
- Redirect URLs: add the site's URL, optionally ending `/**` if necessary for the site's nested path, and the exact callback `https://YOUR-USER.github.io/mentorhood-website/` as used by the browser redirect. The application calls a `redirectTo` that ends in `#portal`; add the exact URL as required by Supabase's redirect matching. See https://supabase.com/docs/guides/auth/redirect-urls
- When migrating to the final domain, add its HTTPS origin/URLs before changing DNS.

For clarity: Supabase Google provider callback is **not** the GitHub Pages URL. The two redirect types are different.

## 3. Enable email signup

Visit: https://supabase.com/dashboard/project/itfucxbclbccoaidvqab/auth/providers

- Open Email provider and enable email signup and email/password sign-in.
- Require email confirmation to keep unverified addresses from getting normal access.
- Review the email confirmation template and sender settings; use production SMTP before a live customer launch.
- Demo email sending can be subject to Supabase's default mail limits.

## 4. Set up Google Cloud OAuth

- Open https://console.cloud.google.com/auth/overview and create/select a Google Cloud project controlled by the Mentorhood Math owner.
- Configure Google Auth Platform **Branding**, **Audience**, and **Clients**. For a public site, choose External audience and publish the app as required by Google. In testing mode, add the exact email addresses of test users.
- Create an OAuth Client ID of type **Web application**.
- Under **Authorized JavaScript origins**, add `https://YOUR-USER.github.io` (domain origin, without repo path).
- Under **Authorized redirect URIs**, add **exactly**:
  `https://itfucxbclbccoaidvqab.supabase.co/auth/v1/callback`
- Copy the **Client ID** and **Client Secret** into Supabase → Authentication → Sign In / Providers → Google. Enable Google and save.
- The Client Secret must not be pasted into a GitHub file or ChatGPT message.
- Test the Google button after adding the site's URL to the Supabase redirect list.

Official setup guide: https://supabase.com/docs/guides/auth/social-sign-in/auth-google

## 5. Security model

- Every signed-in, email-confirmed account can read *published* video metadata in `public.videos`.
- Internal `projects` and `tasks` remain restricted to `owner` and `staff` entries in `public.team_members`.
- A user may not create or update their own `team_members` staff role; assignment requires a trusted admin in Supabase.
- Video iframes may point to public video URLs. Protect private/paid media at the video host as well; logging into the page alone will not protect the underlying video.
- Do not collect student details on self-registration. If minors use the service, require guardian involvement and review applicable privacy obligations before launch.

## 6. Create an initial admin

1. Register or invite an account from Auth → Users.
2. Verify email, find its auth.users UUID.
3. Insert a `team_members` row for that UUID with `role='owner'`, `is_active=true` using Supabase Table Editor.
4. Sign in again, open `#/portal` and verify project tab visibility.
5. Create a second non-staff test account and verify it **cannot read** projects or tasks, even when querying the API manually.

Do not rerun the database SQL on the existing live project: it has already been deployed.
