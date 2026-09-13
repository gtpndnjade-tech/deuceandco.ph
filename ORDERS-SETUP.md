# Making orders real — Deuce & Co.

Right now the owner dashboard shows sample bookings. Follow this once and every
real booking lands in a Google Sheet you own, and the dashboard reads from it live.

Takes about ten minutes. No server, no monthly cost.

---

## 1. Create the sheet

1. Go to **sheets.new** and name it `Deuce & Co. Orders`.
2. Leave it empty — the script writes the header row itself.

## 2. Add the script

1. In the sheet: **Extensions → Apps Script**.
2. Delete whatever is in `Code.gs` and paste the whole of **`orders-backend.gs`**
   (in this project) in its place.
3. Click the save icon.

## 3. Email notifications (already set up)

The script emails **gtpndnjade@gmail.com** the moment a booking is submitted —
before the customer sends anything by DM. The email carries the reference, name,
mobile, email, gear, court, time slot, handover, dates and total, and its Reply-To
is set to the customer, so replying goes straight to them.

To change the address, edit this line near the bottom of the script:

```js
var NOTIFY_TO = 'gtpndnjade@gmail.com';
```

Gmail allows about 100 of these a day on a free account — far more than you'll need.

## 4. Publish it

1. **Deploy → New deployment**.
2. Gear icon → **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** **Anyone**  ← required, or the website can't reach it
4. **Deploy**, approve the permission prompt, then **copy the Web app URL**.
   It looks like `https://script.google.com/macros/s/AKfy…/exec`.

## 5. Paste the URL into the site

Open `DeuceCo Rental Site.dc.html` and find this near the top of the script:

```js
const ORDERS_ENDPOINT = '';
```

Put your URL between the quotes:

```js
const ORDERS_ENDPOINT = 'https://script.google.com/macros/s/AKfy…/exec';
```

Save. Then place a test booking on the site — a row should appear in your sheet
within a second or two.

---

## What happens after that

**Your Google Sheet is the dashboard.** The website is customer-facing only — no
owner page to log into. Every booking becomes a row you can sort, filter, print
or share.

- A customer confirms a booking → a row appears in the sheet within a second, and
  an email lands in gtpndnjade@gmail.com immediately, with their name, phone,
  email, dates, court, time slot, handover, items and total.
- That email arrives **whether or not** they follow through with the DM — so you see
  every request, including abandoned ones.
- The website re-reads the sheet every 30 seconds and uses it to drive the
  **calendar availability** — so the "3 out / fully booked" tiles customers see
  reflect your real bookings, not sample data.
- Booking codes continue from the highest code in the sheet, so they never repeat
  across devices.

## Working the queue in Sheets

Use the `status` column as your workflow. Set it to:

| status | means |
| --- | --- |
| `awaiting` | ticket received, waiting on their payment |
| `toconfirm` | receipt received, you need to verify it |
| `confirmed` | paid and confirmed, ready for pickup |
| `out` | gear is with the customer |
| `returned` | finished — drops out of the calendar and frees the racket |

Anything not `returned` counts as booked, so the customer-facing calendar stops
offering a racket that's already out. Set a row to `returned` when the gear comes
back and it frees up immediately.

Tip: in Sheets, **Format → Conditional formatting** on the status column gives you
a colour-coded board in about a minute.

## If the badge stays grey

- **Who has access** must be **Anyone**, not "Anyone with a Google account".
- Re-deploy after any script edit (**Deploy → Manage deployments → edit → Deploy**);
  the URL stays the same.
- Test the URL in a browser tab — it should return `[]` or a list of orders. If it
  asks you to log in, the access setting is wrong.

## Privacy note

The endpoint is public, so treat it as write-mostly: anyone with the URL could read
the order list. That's normally fine for a small rental shop, but don't put anything
in the sheet you wouldn't want read. If you want it locked down later, the same
front-end works against any hosted API — the only thing that changes is the URL.
