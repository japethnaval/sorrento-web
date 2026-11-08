# Sorrento amenity bookings

Tenant UI for booking amenities. Accounts are created by the landlord — there is no sign-up screen.

## Setup

```bash
npm install
```

Create a **`.env.local`** file in the project root (gitignored). Set these keys — use the values your landlord gave you; they are not stored in this repo:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Amenity bookings API base URL |
| `NEXT_PUBLIC_COGNITO_REGION` | Cognito region (e.g. `ap-southeast-1`) |
| `NEXT_PUBLIC_USER_POOL_ID` | Cognito user pool id |
| `NEXT_PUBLIC_USER_POOL_CLIENT_ID` | Cognito app client id (no secret) |
| `NEXT_PUBLIC_TENANT_DISPLAY_NAME` | Your name as shown in the booking detail modal |
| `NEXT_PUBLIC_TENANT_PROPERTY` | Property name shown in the modal (e.g. building name) |

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API must allow your origin in `FrontendOrigins` (localhost is usually already allowed).

`npm run build` **fails** if any variable above is missing (`scripts/validate-env.mjs` loads `.env.local` when present).

### Production deploy

1. Set the same `NEXT_PUBLIC_*` variables on the host (Vercel, Netlify, etc.) — do not commit them.
2. Add the **production site origin** to API Gateway `FrontendOrigins`.
3. Smoke test: sign in → list → detail → cancel (when eligible) → new booking.
4. Security headers (CSP, `X-Frame-Options`, etc.) are in [`next.config.ts`](next.config.ts).

`NEXT_PUBLIC_*` values are baked into the client bundle at build time; anyone who uses the site can see them in the browser. Keeping them out of git avoids leaking your setup in the repository and forces explicit configuration per environment.

## What you can do

- Sign in with landlord-issued email and password
- Set a new password on first login (temporary Cognito password)
- Reset a forgotten password
- Book an amenity
- Review your bookings by status
- Sign out

## Notes

- Use the **Id token** (handled by the app). Do not call MyHome from the browser.
- Newly submitted bookings usually appear under **New**.
- If you see “account not set up”, the landlord still needs to add your tenant record.

### Live list + cancel contract

- **`GET /bookings` rows:** `id` (ticket), optional `cancelId`, `createdDate` (Manila `YYYY-MM-DDTHH:mm`), plus amenity, times, status, notes, `guestCount`.
- **`DELETE /bookings/{cancelId}`** — cancel uses **`cancelId`**, not the ticket `id`. On **200**, the list refetches. On **202**, refetch only (no second DELETE).
- Cancel is shown for `New` / `In-Progress` / `Returned` when `cancelId` is present; hidden for `Approved`.

Modal **Requested By** and **Property** come from `NEXT_PUBLIC_TENANT_DISPLAY_NAME` and `NEXT_PUBLIC_TENANT_PROPERTY`. **Unit** uses `units[0]` from the list API.
