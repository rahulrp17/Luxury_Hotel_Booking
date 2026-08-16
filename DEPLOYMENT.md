# Production Deployment Guide

Production-ready configuration for the Luxury Hotel Booking Platform.
Repo layout: `backend/` (Node/Express API), `frontend/` (React/Vite SPA).

---

## 1. Backend → Render

**Runtime:** Node.js (>= 18, matches `engines` in `backend/package.json`).
**Root directory:** `backend`
**Build command:** `npm ci --omit=dev`
**Start command:** `npm start` (runs `node server.js`)
**Health check:** `GET /health` (returns 200 when the API is up; DB is required at boot).
**Port:** `PORT=10000` (Render default). The app binds to all interfaces (`app.listen(PORT)` on `0.0.0.0`).
**Region:** pick the one closest to your users (e.g. `singapore` or `oregon`).

The repo ships a `backend/render.yaml` Blueprint — Render will pick it up on
first import. `sync: false` env vars must be filled in manually in the
dashboard **Environment** tab; never put real values in the file.

### Required environment variables (backend)

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `production` (enables fail-fast env validation & prod logging) |
| `PORT` | `10000` (Render assigns this) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | ≥32 chars, random |
| `JWT_REFRESH_SECRET` | ≥32 chars, random, different from access |
| `JWT_EMAIL_VERIFY_SECRET` | random |
| `RAZORPAY_KEY_ID` | Razorpay live API key |
| `RAZORPAY_KEY_SECRET` | Razorpay live key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signature secret |
| `FRONTEND_URL` | e.g. `https://<your-app>.vercel.app` (CORS origin) |

### Optional variables (features degrade gracefully if missing)

`JWT_ACCESS_EXPIRE=15m`, `JWT_REFRESH_EXPIRE=7d`, `JWT_EMAIL_VERIFY_EXPIRE=24h`,
`JWT_PASSWORD_RESET_EXPIRE=1h`, `BRAND_NAME=AureliaStay`, `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `REDIS_URL`, `SMTP_HOST`,
`SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM_NAME`,
`EMAIL_FROM_ADDRESS`, `SMS_API_KEY`, `SMS_SENDER_ID`, `RATE_LIMIT_WINDOW_MS`,
`RATE_LIMIT_MAX_REQUESTS`, `LOG_LEVEL`, `TRUST_PROXY_HOPS=1`.

**AI Concierge (optional — the agent works without it):**
`OPENROUTER_API_KEY` (enables natural-language fallback replies), `OPENROUTER_MODEL`
(defaults to `openrouter/free`), `AI_RATE_LIMIT_MAX` (default 20 chat messages/IP/minute).
All factual hotel/room/price/availability data always comes from the database.

---

## 2. Frontend → Vercel

**Framework preset:** Vite.
**Build command:** `npm run build` (output `frontend/dist`).
**Output directory:** `dist`.
**SPA fallback:** handled by `frontend/vercel.json` (rewrite all non-`/api`
routes to `/index.html`) so deep links like `/hotels/...` work.

### Required environment variables (frontend, set in Vercel project settings)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Full backend base URL, e.g. `https://<your-api>.onrender.com/api/v1` |
| `VITE_FRONTEND_URL` | The deployed frontend origin, e.g. `https://<your-app>.vercel.app` |
| `VITE_SITE_URL` | Canonical URL for SEO (robots/sitemap/canonical) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay **key id** (public — safe to expose in the bundle) |

---

## 3. MongoDB Atlas

1. Create a cluster (M0 free tier is fine), add a database user.
2. Network access: allow `0.0.0.0/0` (Render/Vercel egress) or scope to Render IPs.
3. Copy the connection string:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/luxury_hotel_booking?retryWrites=true&w=majority`
4. Paste into backend `MONGODB_URI`. Set `NODE_ENV=production` so missing vars fail fast.

---

## 4. Redis

The API uses Redis for caching (SCAN-based invalidation), Bull job queues
(email/SMS/reminders), and the Redis-backed rate limiter.

- **Render:** add a Redis service (Render Redis). Use the internal URL as
  `REDIS_URL` — it is reachable from the web service on the same region.
- **Redis Cloud / Upstash:** use their TLS URL (`rediss://...`). ioredis handles
  TLS automatically for `rediss://`.

---

## 5. Cloudinary

Used for hotel/room/avatar/review image uploads via Multer + CloudinaryStorage.

- Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  from the Cloudinary dashboard. Files land in the `luxury-hotel/*` folders.

---

## 6. Razorpay

1. Use **live** keys in production: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
2. Create a webhook in the Razorpay dashboard:
   - **URL:** `https://<your-api>.onrender.com/api/v1/payments/webhook`
   - **Events:** `payment.captured`, `payment.failed`
   - **Secret:** copy into `RAZORPAY_WEBHOOK_SECRET`.
3. The endpoint already receives the **raw request body** (`express.raw` in
   `backend/src/app.js`) so the HMAC is verified over the exact transmitted
   bytes before any parsing.
4. Set `VITE_RAZORPAY_KEY_ID` on the frontend for the checkout SDK.

---

## 7. SMTP (email)

Nodemailer sends verification/booking/refund emails. Use a transactional
provider (Gmail app password, SendGrid, Brevo, etc.):

- `SMTP_HOST`, `SMTP_PORT` (e.g. `587`), `SMTP_SECURE` (`false` for STARTTLS),
- `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`.

---

## Webhook URL summary

```
POST https://<your-api>.onrender.com/api/v1/payments/webhook
```

Configured events: `payment.captured`, `payment.failed`.

---

## Build & start commands

```bash
# Backend
cd backend
npm ci --omit=dev
npm start                 # node server.js — binds PORT on 0.0.0.0

# Frontend
cd frontend
npm ci
npm run build             # Vite build → frontend/dist
```

---

## Security notes

- `.env` files are git-ignored everywhere — never commit them.
- No secrets are hardcoded; everything comes from environment variables
  validated at boot by `backend/src/config/env.js`.
- Cron jobs and Bull processors run inside the single API process
  (`backend/src/jobs/worker.js`). Do **not** add a separate worker command on
  Render, or cron sweeps would double-run.