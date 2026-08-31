# Deuce & Co. — racket rental site

Mobile-first rental site for Deuce & Co. (Biñan, Laguna). Customers browse rackets,
balls and hoppers, pick dates, optionally add a court, and check out into an order
ticket they send to the shop's Instagram or Facebook DM.

Plain static files — no build step, no npm install.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole site. Markup at the top, application logic in the `<script data-dc-script>` block below it. |
| `payment-details.html` | One-page GoTyme payment card to send in DM replies. Export as PDF or PNG from the browser. |
| `img/` | Racket, ball and court photographs (JPEG, ~900px). |
| `brand/` | Logo mark. |
| `_ds/` | Organic design system — tokens and stylesheet. Colours and type come from here. |
| `support.js` | Runtime that renders the page. Don't edit. |
| `orders-backend.gs` | Google Apps Script for the order sheet. Paste into Apps Script, not served. |
| `ORDERS-SETUP.md` | Ten-minute walkthrough to connect the order sheet. |
| `TESTING-AND-LAUNCH.md` | Test checklist and deployment steps. |

## Running it locally

Opening `index.html` straight from disk **will not work in Safari** — it blocks
local files from loading each other. Serve it instead:

```bash
cd deploy
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

In VS Code, the **Live Server** extension does the same thing: right-click
`index.html` → *Open with Live Server*.

## Editing

Everything lives in `index.html`.

- **Products** — the `RACKETS`, `BALLS` and `TUBES` arrays. Each entry carries
  `price`, `img`, `level`, `stock`, `blurb` and `specs`.
- **Prices** — beginner ₱180, intermediate ₱200, advanced ₱240 per day; court rates
  are on the `COURTS` entries (`fee` daytime, `litFee` with lights).
- **Rental terms** — the `terms` array in `renderVals()`.
- **Delivery zones** — the `ZONES` array.
- **Calendar** — `DAYS` generates 35 days from a start date; `TODAY_IDX` marks the
  first bookable day.

Styling is inline on the elements, using `var(--color-*)` tokens from the design
system. Keep to those tokens rather than adding hex values.

## Connecting real orders

Until you do this, the calendar runs on the sample bookings in `SEED_ORDERS`.

Follow `ORDERS-SETUP.md`, then paste your Apps Script Web App URL into:

```js
const ORDERS_ENDPOINT = '';
```

Bookings then POST to your Google Sheet, and the site reads it back every 30
seconds to drive calendar availability.

## Deploying

Any static host. Drag this folder onto **app.netlify.com/drop** for an instant URL,
or connect the GitHub repo to Netlify, Vercel or Cloudflare Pages for
deploy-on-push. No build command; publish directory is the repo root.

## Known limits

- No double-booking prevention — two people can book the last racket for the same
  day within minutes of each other. Caught manually in the DM at current volume.
- The orders endpoint is public, so anyone with the URL could read the order list,
  phone numbers included.
- Payment is deliberately manual: customer sends the ticket, shop replies with
  GoTyme details, customer sends a receipt, shop confirms.
