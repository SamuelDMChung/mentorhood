# Mentorhood Math Website — V3 public-site reconstruction

This is a more faithful **public-site reconstruction** based on the currently public Mentorhood Math website, plus the earlier Supabase member and staff portal.

**Current target deployment:** https://samueldmchung.github.io/mentorhood/

## Install / update from V2

1. Extract the ZIP. Upload / commit **the files and folders inside** the archive to the existing GitHub repository root (`samueldmchung/mentorhood`), replacing V2 versions. Do not upload the ZIP as an individual file.
2. In GitHub → Settings → Pages, continue using `main` → `/ (root)`. It is still plain HTML/CSS/JS; no compilation or GitHub Actions necessary.
3. Reload the Pages URL. Visit `#home` for the public homepage, `#notes` for the reconstruction checklist, and `#portal` for Google/email login and protected staff tracking.

## Site scope

- Original labels and navigation hierarchy, homepage photo banner, 50%-off Ontario trial, stats, 12-photo gallery and teaching-method CTA
- Program landing page and Singapore Math, IB/OSSD, Kangaroo, STEAM, summer camp (archived) and school application sections
- Online class catalog with source photos and prices, in-person class addresses, course titles and resource placeholders
- Team/founders and teacher photos, six latest public blog previews with image refs, contacts, demo-only enquiry form
- 51 distinct Wix-hosted image references used in 73 image placements across the site (`assets/ORIGINAL_IMAGE_URLS.json`)
- Supabase sign-in: Google/email authentication and member video library + approved internal staff tracker preserved from V2.

### Important: Original images are not in the ZIP

Images still load remotely from `static.wixstatic.com`, exactly as source references. The URL inventory is included but the owner-supplied source JPG/PNG files are not. The browser may display an image placeholder if a link fails; before the live Wix site is retired, export authorized originals and move them into `assets/images/`.

### Important: forms and paid services are not yet migrated

The contact fields in this demo do **not** submit or store user data. They show the design and direct visitors to the original working form. Booking/Outschool, Wix blog archives, video materials, downloads and map widgets likewise need separate migration or integrations. The demo's `#notes` page and `RECONSTRUCTION_NOTES.md` itemize each gap.

### Authentication

The existing `config.js` contains only a browser-safe Supabase **publishable** key. Never commit the Supabase service-role key or Google OAuth client secret. Continue using the Supabase project `itfucxbclbccoaidvqab`; no backend migration or database changes are required for V3.

The site now continues to render public pages even when the external Supabase JavaScript CDN is unavailable; member login still requires that CDN and the network.

### What was verified

Desktop/mobile HTML+CSS layout and public routing were simulated in an offline Chromium browser; 3 public program cards rendered, the notes view loaded, the portal route was reachable and mobile menu/dropdowns opened. No real sign-in, third-party photo loading or live deployed smoke test was performed.

## Source and further work

Review `RECONSTRUCTION_NOTES.md` and `assets/ORIGINAL_IMAGE_URLS.json`; see `AUTH_GOOGLE_SETUP.md` for OAuth setup. `database/*.sql` documents deployed database schema; **do not rerun it** on your existing Supabase project.
