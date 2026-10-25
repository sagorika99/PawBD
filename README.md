# PawBD

Adopt and rescue cats and dogs in Bangladesh. Map of rescue alerts and adoptable animals, an adoption board, and posts for people who want to give away or adopt a pet.

Stack: Next.js (App Router) · Supabase (Postgres, Auth, Storage) · Leaflet + OpenStreetMap · Vercel.

## 1. Set up Supabase (free)

1. Create a project at https://supabase.com.
2. Open **SQL Editor → New query**, paste all of `supabase/schema.sql`, and run it. This creates the tables, Row Level Security policies, rescue-alert expiry, and the `animal-photos` storage bucket.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.
4. (Optional) **Authentication → Providers → Google** to enable Google sign-in. Email/password works without it.
5. **Authentication → URL Configuration**: add `http://localhost:3000` and your Vercel URL to the redirect URLs.

## 2. Run locally

```bash
cp .env.example .env.local   # fill in the two Supabase values
npm install
npm run dev
```

Open http://localhost:3000.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. On https://vercel.com choose **Add New → Project** and import the repo.
3. Under **Environment Variables** add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy. Then add the Vercel URL to Supabase redirect URLs (step 1.5).

## Notes

- The free Supabase plan pauses projects after a period of inactivity. Visit the site now and then, or add a small scheduled ping.
- Phone numbers (`contact`) are readable only by signed-in users; anonymous visitors cannot select that column.
- Rescue alerts expire after 14 days (`expires_at`) and then disappear from the site.
- Reports go to the `post_reports` table; review them in the Supabase Table Editor.

## Ideas for next versions

- Edit/renew a post; "my posts" page
- Photo check with a small ML model (cat vs dog, blur detection)
- Push or Telegram alerts for new rescue alerts near a district
- Admin page to review reported posts
