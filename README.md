# Deuce & Co. — racket rental site

A mobile-first rental website for Deuce & Co., a tennis gear rental shop in
South City Homes, Biñan, Laguna. Customers browse rackets, balls and hoppers,
pick their dates, optionally add a court, and check out into an **order ticket**
they screenshot and send to the shop's Instagram or Facebook DM. Payment and
confirmation happen in that conversation — deliberately, so the shop keeps eyes
on every booking and pays nothing for a payment gateway.

Live at `https://gtpndnjade-tech.github.io/deuceandco.ph/`
(`deuceandco.ph` still to be pointed at it).

---

## What's in this folder

| File | What it is |
| --- | --- |
| `DeuceCo Rental Site.dc.html` | **The site.** The single source of truth — everything is in here. |
| `DeuceCo Payment Details.dc.html` | A one-page payment card (GoTyme account + QR slot) to send in the DM after a booking. |
| `orders-backend.gs` | Google Apps Script for the orders sheet. Paste into Apps Script, deploy as a web app. |
| `ORDERS-SETUP.md` | Ten-minute walkthrough for connecting the sheet. |
| `TESTING-AND-LAUNCH.md` | Test checklist and hosting steps. |
| `CLAUDE.md` | Deployment notes that persist between sessions. |
| `deploy/` | The publishable copy — `index.html` plus `img`, `brand`, `_ds`, `support.js`, `.nojekyll`. |
| `img/`, `brand/` | Product photos (compressed JPEGs, ~2 MB total) and the logo mark. |
| `_ds/` | The Organic design system — colours, fonts, tokens. **Never rename or drop.** |

---

## The customer flow

1. **Calendar** — five weeks over a drawn tennis court. Each date tile shows how
   many rackets are already out ("all in", "3 out", "fully booked"), read from
   the live order sheet. Past and fully-booked days can't be picked.
2. **How do you get the gear?** — pick up at the court (free), delivery around
   Biñan (fee quoted by DM, exact address required), or Metro Manila (not served).
3. **Add court rental** — optional. Outdoor ₱200/hr, ₱280 with lights; indoor
   ₱280/hr, ₱380 with lights. Hours, daytime/lights, and a required time slot
   (lights run 5–9pm). The charge is added straight to the order.
4. **Browse and add gear** — 20 rackets across Beginner ₱180 / Intermediate ₱200 /
   Advanced ₱240 per day, each including a racket bag and 5 balls. Plus a practice
   ball set, a pickup tube and a tennis basket. Photos zoom full-screen.
5. **Cart** — rental period, court and handover recap, then required customer
   details: full name, mobile, Instagram/Facebook name, email.
6. **Order ticket** — a screenshot-ready card with a running reference
   (DC-4471, DC-4472…), every item priced, the deposit line on multi-day rentals,
   the amount to send, and deep links to the shop's Messenger and Instagram.

Rental terms sit under Add to cart on every product page: DM-before-payment,
7am–8pm rental day, ₱200 refundable deposit on multi-day rentals, damage
responsibility, court charging, free reschedule up to 24 hours out, and delivery
terms.

## The owner side

There is no owner page in the site. **The Google Sheet is the dashboard.**

Every confirmed booking POSTs a row — name, mobile, IG/FB, email, dates, court,
time slot, handover, items, total — and emails a notification. The site reads the
sheet back every 30 seconds and drives calendar availability from it, so what
customers see reflects real bookings.

Work the queue in the `status` column (dropdown, colour-coded, installs itself):

`awaiting` → `toconfirm` → `confirmed` → `out` → `returned`

Anything not `returned` counts as booked. A second sheet tab rebuilds a calendar
and returns board the moment you change a status.

---

## Making a change

1. Edit `DeuceCo Rental Site.dc.html` here.
2. It gets copied to `deploy/index.html`.
3. Drop the changed files into `/Users/jadelyne/Documents/GitHub/deuceandco.ph`,
   commit in GitHub Desktop, push. Live in about a minute.

Two things that will break the site if lost: **`.nojekyll`** at the repo root
(without it GitHub Pages skips `_ds` and every colour and font fails) and the
**`_ds` folder** itself.

## Known limits

- **No double-booking prevention.** The calendar shows what's out, but two people
  could book the last racket minutes apart. Catchable in the DM at current volume.
- **The orders endpoint is public.** Anyone with the URL could read the order
  list, including phone numbers. Normal for a small shop, worth knowing.
- **Payment is manual** — by design.
