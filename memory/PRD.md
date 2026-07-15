# Travelo — Product Requirements Document

## Original Problem Statement
"act like a professional developer and made a website name travelo, made a project where someone book hotels, travelling car and everything form one website and also that website suggest near by places where travel best places, also remember that use a good api and also a payment gateway where payment will be success, also a good authentication service"

## User Choices (from ask_human)
- Payment gateway: **Razorpay** (placeholder keys → runs in DEMO MODE)
- Authentication: **Emergent-managed Google OAuth** (session cookie based)
- Nearby places: **Real Google Places API** (placeholder key → curated fallback)
- Hotel/Car data: **Rich curated mock inventory**
- Design vibe: **Modern & bold** (dark high-contrast, Clash Display + Manrope, orange #FF4500 accent)

## Architecture
- Backend: FastAPI (`/app/backend/server.py`) with `/api` prefix, Motor Mongo
- Frontend: React 19 + React Router 7 + Tailwind + Shadcn UI + Framer Motion + Sonner toasts
- Data model:
  - `users` (user_id, email, name, picture)
  - `user_sessions` (user_id, session_token, expires_at)
  - `bookings` (booking_id, user_id, item_type, item_id, item_name, item_image, destination, dates, guests, total_amount, payment_status, razorpay_order_id/payment_id)
- Auth: session_token cookie (httpOnly, secure, sameSite=none) + Bearer fallback

## Implemented (2026-02)
### Iteration 2
- Guest Reviews per hotel (/api/hotels/{id}/reviews with breakdown + 6 curated review cards + traveller photos)
- Trip Bundles (/api/bookings/bundle — single checkout for hotel+car; MyBookings shows Bundle badge)
- Email Confirmations via Resend (MOCK MODE with placeholder key — email prepared + saved to db.emails, /api/emails/mine to view; goes live when RESEND_API_KEY set to real re_ key)

### Iteration 1
- **Backend**
  - `/api/auth/session` (exchange session_id → cookie), `/api/auth/me`, `/api/auth/logout`
  - `/api/destinations`, `/api/destinations/{slug}` (6 destinations)
  - `/api/hotels`, `/api/hotels/{id}` (8 curated hotels)
  - `/api/cars`, `/api/cars/{id}` (8 curated cars)
  - `/api/places/nearby` — Google Places (New) call with X-Goog-FieldMask, falls back to curated data
  - `/api/bookings` (create + Razorpay order; demo_mode when placeholder keys)
  - `/api/payments/verify` (HMAC signature check when live; auto-verify in demo)
  - `/api/bookings/mine`, `/api/bookings/{id}`
- **Frontend Pages**: Landing, Hotels, HotelDetail, Cars, CarDetail, Destinations, Destination, Checkout, MyBookings, AuthCallback
- Modern & bold design: hero with search widget (shadcn Calendar + Select + Popover), bento grids, glassmorphic navbar, brand orange CTAs, staggered motion, custom fonts.
- Full end-to-end demo checkout flow (Reserve → Checkout → Pay → Success).

## Personas
1. **Weekend Traveller** — books a hotel + car for 3-day getaway
2. **Destination Explorer** — lands on Destinations page, browses nearby attractions, then books
3. **Return User** — logs in with Google, sees My Trips dashboard, rebooks

## Verified Test Results (iteration_1.json)
- Backend: 100% (24/24 pytest)
- Frontend: 100% (all UI flows including cookie-authed checkout success)

## Backlog / P0-P2 Remaining
- P1: Live Razorpay + Google Places keys (user to supply)
- P1: Reviews & guest photos per hotel
- P2: Wishlist / favourites
- P2: Filter chips (price, amenities, star rating)
- P2: Flights as third pillar
- P2: Email confirmation via Resend on booking
- P2: Admin dashboard for listing curation
