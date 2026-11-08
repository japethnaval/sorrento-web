# Sorrento amenity bookings

Tenant UI for booking amenities. Accounts are created by the landlord — there is no sign-up screen.

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). CORS on the API already allows this origin.

`.env.local` needs:

```bash
NEXT_PUBLIC_API_URL=https://aax639heak.execute-api.ap-southeast-1.amazonaws.com
NEXT_PUBLIC_COGNITO_REGION=ap-southeast-1
NEXT_PUBLIC_USER_POOL_ID=ap-southeast-1_Ilv8RCHhZ
NEXT_PUBLIC_USER_POOL_CLIENT_ID=2jpqi753v8tq2vstn9l8gk6594
```

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

Modal **Requested By**, **Property**, and **Unit** use [`lib/tenant-constants.ts`](lib/tenant-constants.ts) plus `units[0]` from the list. Set `NEXT_PUBLIC_TENANT_DISPLAY_NAME` for **Requested By** when needed.
