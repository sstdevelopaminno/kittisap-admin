# Kittisap production acceptance

Target repository: `sstdevelopaminno/kittisap-admin` (main)
Target Vercel project: `prj_cjrjn48ITrflxbcKs8C9PJ6O9RKO` on team `team_ZKmv6uQSU9QUyP08mxAr2YDI`
Target Supabase project: `zbedxvzrbotwngxaktgj` (**preserve existing data, Auth and Storage**)
Production URL: https://kittisap-admin.vercel.app

## Apply in this order

1. **Access**: Reconnect authorization for the Vercel team and preserved Kittisap Supabase project. Do not substitute CpiPOS databases or spreadsheets. Compare environment-variable **names and target URLs** without logging or copying keys.
2. **Database**: Inspect existing stock RPC signatures and customer/order schema. Back up schema. Apply `sql/harden-stock-rpc-access.sql` only to the confirmed Kittisap project; verify `anon_can_execute=false`, `customer_can_execute=false`, `service_can_execute=true`.
3. **Server code**: Review and merge the fail-closed inventory fix after DB verification. Customer checkout uses the service role only on the server; do not expose the secret in client bundles.
4. **CI and security**: Confirm the GitHub CI lint/typecheck workflow passes. Verify that `POST /api/admin/developer/github` with write actions returns 403 in production, and that the release script rejects any unapproved Vercel project/team.
5. **Acceptance**: In an approved test environment, verify customer login, checkout, QR/payment configuration, slip upload, admin review, cancellation/restock, and receipt. Do not submit real transfers or alter production orders as a smoke test. Run `npm run smoke:test -- -BaseUrl https://kittisap-admin.vercel.app` from PowerShell and record failures.

## Open production blockers

- **Atomic checkout and cross-instance idempotency**: The checkout currently uses separate reserve/order/items calls and in-memory idempotency; a single transactional database operation plus a durable unique idempotency key is required before claiming duplicate-order safety.
- **Distributed rate limiting**: `lib/security/rate-limit.ts` uses an instance-local Map. Move OTP/newsletter/KYC throttling to a durable, atomic database-backed limiter before claiming enforcement across Vercel instances.
- **Database access**: Kittisap Supabase project is not visible through the currently connected Supabase organization. Do not run migrations on `CpiPOS-Communications` or `CpiPOS-001`.
- **Runtime health**: A Vercel deployment reporting READY alone does not establish that Production login/payment flows work. Collect logs and perform acceptance with authorization.
- **Safety**: Never run SQL from this file against the wrong project; never print production service-role keys or PINs.

Current status: changes staged for review, **not deployed**, migration **not executed**, end-to-end tests **not executed**.
