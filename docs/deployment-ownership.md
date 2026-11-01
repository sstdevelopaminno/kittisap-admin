# Deployment Ownership

Last updated: 2026-11-01 (Asia/Bangkok)

This file is the authoritative record for the GitHub, Vercel, and Supabase
targets used by this application.

## Active GitHub

- Owner: `sstdevelopaminno`
- Repository: `https://github.com/sstdevelopaminno/kittisap-admin.git`
- Default branch: `main`
- Local remote name: `origin`

The previous repository `parch009harmonic-hash/kittisap-admin` is retired for
this project and must not be used as the deployment source.

## Active Vercel

- Account email: `sstdevelopaminno@gmail.com`
- Account username: `sstdevelopaminno`
- Team slug: `sstdevelopaminnos-projects`
- Team ID: `team_ZKmv6uQSU9QUyP08mxAr2YDI`
- Project name: `kittisap-admin`
- Project ID: `prj_cjrjn48ITrflxbcKs8C9PJ6O9RKO`
- Production URL: `https://kittisap-admin.vercel.app`
- Git source: `sstdevelopaminno/kittisap-admin`, branch `main`
- Verified production deployment: `dpl_EfokkMC5L3aweSjsHEHVYiHQNHXK`

Before deploying, run `vercel project inspect --non-interactive` from the
repository root. Deploy only after the returned owner and project match the new
target above.

The production deployment was verified `READY` on 2026-11-01. The home page,
public storefront settings API, and public products API returned HTTP 200.

The following legacy Vercel target is retired and must not receive new
deployments:

- Legacy scope: `parch009harmonic-hashs-projects`
- Legacy project name: `kittisap-admin-main-latest`
- Legacy project ID: `prj_zjTdEX1n3ztYAlBl1Yk0UtFKsD2B`
- Legacy team ID: `team_Od4IiIaMTFI1i7jYCni8Q38d`

## Preserved Supabase

- Project ref: `zbedxvzrbotwngxaktgj`
- Project URL: `https://zbedxvzrbotwngxaktgj.supabase.co`
- Migration rule: keep this existing database, Auth, and Storage project

The GitHub and Vercel migration must not create a replacement Supabase project,
reset the database, or apply schema changes solely because hosting changed.

Configure the new Vercel project with the existing values for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Also configure the application's remaining secrets and settings from the
approved environment source. Never commit secret values to GitHub.

After a new production domain is known, update `NEXT_PUBLIC_SITE_URL` and add
the new `/auth/callback` URL to the existing Supabase Auth redirect allow-list.
