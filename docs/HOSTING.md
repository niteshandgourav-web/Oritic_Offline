# Free hosting + database: research (V4-13, 15 Nov 2026)

Goal: put the panel online for free, keep the GitHub repo **private**, keep data safe, no paid plan.
"Best" here means: fits our needs, simple to set up and run.

## Our app's needs
- Plain HTML + JS files (no server code). Any static host works.
- Database: the code already supports **Firebase Firestore** (`firebase-config.js`, `ORITIC_MODE='firebase'`). Any other database would mean rewriting the data layer.
- Photos (payment proof, meter) are stored inside Firestore documents today, not in Firebase Storage.

## Hosting (website)

| Option | Free plan | Private GitHub repo | Notes |
|---|---|---|---|
| **Cloudflare Pages** | 500 builds/month, unlimited bandwidth and sites | Works (connects through the GitHub app; no paid-plan rule found) | Optional extra lock: **Cloudflare Access**, free up to 50 users |
| Firebase Hosting | 10 GB storage, 10 GB transfer/month | Not needed: you upload from this PC with the Firebase CLI | Same Google account as the database |
| Netlify | 300 credits/month, a deploy costs 15 credits (about 20 deploys) | Free plan doesn't support private **organization** repos | Projects pause when credits run out |
| GitHub Pages | Free only for public repos | Needs GitHub Pro (paid) | The site is public anyway |

## Database

| Option | Free plan | Fits our code | Risk |
|---|---|---|---|
| **Firebase Firestore (Spark)** | 50,000 reads, 20,000 writes, 20,000 deletes per day; 1 GB stored | Yes, already written | Daily read limit: every phone loads the data when it opens. Heavy use by many phones could reach 50,000 reads; then reads stop until midnight (US Pacific). Watch usage in the first week. Firebase Storage now needs the paid plan, but we don't use it |
| Supabase | 500 MB, 2 projects | No, needs a rewrite | Free project **pauses after 1 week without activity** |

## Recommendation
1. **Database: Firebase Firestore (Spark, free).** Code is ready, no pause, Google keeps the data. A separate test project first, then the live one.
2. **Hosting: Cloudflare Pages** connected to the private GitHub repo (`v3-business` or `main`). Every push goes live by itself.
   Simpler alternative: **Firebase Hosting** (everything in one Google account, but each update is a command run from this PC).
3. **Keeping it private:** the app PIN login (V4-12) + Firestore security rules (V4-H1, senior model). Cloudflare Access can add an email-code gate later, but it asks everyone for an email, so skip it for now.
4. **Data safety:** Firestore keeps the data; the nightly Drive backup (V4-15 / V4-H2) is the second copy.

## What the owner needs to do (V4-14)
- Make the GitHub repo private (Settings → General → Danger zone → Change visibility), if it isn't already.
- Create a free Cloudflare account and a free Firebase project with your Google account, and sign in yourself. I'll do the setup steps after that.

## Sources (checked 15 Nov 2026)
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits
- Cloudflare Access free plan: https://www.cloudflare.com/en-au/products/cloudflare-access
- Netlify free plan: https://netlify.com/pricing, https://netli.fyi/blog/netlify-free-plan-limits-2026
- GitHub Pages private repos: https://smartscope.blog/en/Tips/GitHub/github-pages-private-repository/
- Firebase pricing: https://firebase.google.com/pricing, https://www.activepieces.com/blog/firebase-pricing-2026-plans-costs-and-free-limits.md
- Supabase pricing: https://supabase.com/pricing
