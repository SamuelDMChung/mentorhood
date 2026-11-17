# Mentorhood Math: public-site reconstruction (V3)

## What's included

The public side was rebuilt to more closely follow the source pages on https://www.mentorhoodmath.com/ (reviewed November 17, 2026). **This is a working public-facing mockup, not a pixel-for-pixel Wix export.**

- Original main navigation labels and dropdown groupings (including Classes, Singapore Math, IB/OSSD, STEAM, Team, Free Courses, Contact and Blog).
- Original **EMPOWER / Your Child with Mastery of Mathematics** homepage headline, free trial CTA, in-person 50% promotion, statistics and multi-photo gallery.
- 18 public hash routes, including program detail, classes, methods, team, locations, contact, blog and explicitly documented owner-review gaps.
- 51 distinct **original Wix photo/logo URL references** — see `assets/ORIGINAL_IMAGE_URLS.json` for a full inventory. The HTML uses them in 64 visible image slots across the site's pages. This is NOT 51 locally downloaded images; Wix still hosts every file.
- Existing Supabase-backed email signup, Google OAuth, member video library, and staff-only project tracking code retained from V2. The live database was not changed by this frontend rebuild.
- Mobile layouts with dropdown navigation and graceful image-unavailable placeholders.

## Missing / not reproduced yet

| Item | Current treatment | Needed before launch |
|---|---|---|
| Original Wix image files | Original CDN URLs in `<img>` | Export originals with permission, copy to `assets/images/`, update references |
| Exact Wix fonts, crops, animations, breakpoints | Approximate CSS reconstruction | Owner's original Wix Editor access or screenshots across screen sizes |
| Live contact and trial registration forms | Visible demo-only form; live original link | Connect new form backend and notifications, privacy and spam checks |
| Outschool and class checkout | Class cards and links to current booking source | Approved registrations/payment integration |
| Blog | Preview headlines and explicit image placeholders | Export full articles, cover images, post URLs, SEO metadata, comments if required |
| Maps | Visible map placeholders on Locations | Approved Google Maps/embed/provider + location review |
| Course download links, videos, games | Course titles + explicit media placeholders | Original curriculum, approved video files, worksheets and rights |
| Founders' portraits | Explicit portrait placeholders (existing site has generic placeholder images) | Owner-approved portraits |
| Full teacher bios and historical testimonials | Select excerpts and available headshots | Approved current copy and roster |
| Timetables and trial offers | Shows source page wording with verification caution | Confirm current rates and schedules |

## Deploy

Unzip into the **root** of the existing `samueldmchung/mentorhood` repository on GitHub, preserving `index.html`, `app.js`, `styles.css`, `config.js`, `.nojekyll`, `assets/`, and `database/`. Overwrite the V2 files. Do not upload this ZIP itself as the website. GitHub Pages can continue deploying `main` -> `/(root)`.

Demo URL: https://samueldmchung.github.io/mentorhood/

Existing Supabase backend: `https://itfucxbclbccoaidvqab.supabase.co`. The `config.js` browser key is publishable only; NEVER commit Google client secrets or Supabase service-role keys.

Google OAuth redirect configuration should continue to use the same GitHub Pages URL and Supabase callback; the frontend still calls the original `app.js` OAuth code.

### Demo validation

Open `/#home`, `/#programs`, `/#method`, `/#online`, `/#inperson`, `/#team`, `/#courses`, `/#contact`, `/#blog`, `/#notes`, `/#portal`; on a phone test the ☰ nav. The source images are external — visual fidelity depends on those being reachable by the browser. Follow `/#notes` to review all migration gaps with the owner.
