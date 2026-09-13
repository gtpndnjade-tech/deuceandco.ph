# Deuce & Co. — test it, then put it online

Two parts. **Part A** you can do right now, in about fifteen minutes, entirely on
your laptop. **Part B** puts it on deuceandco.ph.

Do Part A first. Don't buy a domain until the site behaves the way you want.

---

# Part A — Test it

## A1. Walk the customer journey

Open `DeuceCo Rental Site.dc.html`. Go through it as a customer would, and check
each thing below actually happens.

1. **Pick a date** in the calendar. The tile fills terracotta, and the tiles for
   the rest of your rental period tint lighter. Grey tiles (past days, fully
   booked) should refuse to be clicked.
2. **Set the number of days** with − / +. The date range under it updates. Push it
   to 5 days — the "Weekly rate" pill should appear.
3. **Choose how you get the gear.** Pick "Around Biñan" — an address field appears
   and is required. Pick Metro Manila — it should refuse (not served yet).
4. **Turn on Add court rental.** Pick a court, set hours, then switch between
   Daytime and With lights — the time slots below should change (daytime finishes
   by 5pm, lights run 5–9pm) and the price should follow the right rate.
5. **Add a racket.** Open any racket, read the specs, tap the photo to zoom, then
   Add to cart.
6. **Go to the cart.** Check the rental period and court lines are correct, then
   try clicking **Confirm booking** with the name/mobile/email fields empty — it
   should refuse and tell you why. Same if court rental is on with no time slot.
7. **Fill the fields and confirm.** You land on the order ticket. Check the total
   matches the items, and that the deposit line appears on multi-day rentals.
8. **Tap the Messenger and Instagram buttons.** Both should open your real pages.

If anything above doesn't behave that way, tell me exactly which step and what it
did instead.

## A2. Test it on your phone

The site is built mobile-first, but you should see it on a real phone before
launch — thumbs and text size are hard to judge on a laptop.

Use the share option in this project to open it on your phone, or finish Part B
first and test on the live URL. Then check:

- Every button is comfortable to tap one-handed.
- The calendar's 7 columns fit without sideways scrolling.
- Racket photos load quickly on mobile data (they're now ~80 KB each).
- The order ticket fits in one screenshot, or close to it.

## A3. Test the owner dashboard

Tap **Owner view** in the header.

- The badge under the heading says **"Sample data"** — correct for now.
- Walk one order through its stages: Receipt received → Confirm booking →
  Mark as out → Returned. It should move between sections each time.
- Check **Live inventory** — one of each racket, two Yonex VCORE 100 and two
  VCORE PRO 97. Reserved and free counts should net out sensibly.
- Look at **Today's schedule** for pickups, deliveries and returns.

## A4. Test with a real person

This is the step people skip and shouldn't. Send the link to one friend who plays
tennis, say nothing else, and watch where they hesitate. Whatever confuses them
is the next thing to fix — not what you or I think is confusing.

---

# Part B — Put it online

## B1. Download the site

Ask me for the download and I'll hand you a zip. Unzip it. Inside you'll find
`index.html` plus the `img`, `brand` and `_ds` folders. Keep them together —
the site loads the photos and styles from those folders by relative path.

## B2. Put it on the internet (free, no account juggling)

**Netlify Drop** is the fastest route:

1. Go to **app.netlify.com/drop**.
2. Drag the unzipped folder onto the page.
3. Wait about twenty seconds. You get a live URL like
   `https://gentle-tennis-a1b2c3.netlify.app`.

That URL already works on any phone or laptop. Test it on your own phone before
going further.

Cloudflare Pages and Vercel do the same thing if you prefer them.

## B3. Get deuceandco.ph

`.ph` domains are sold by **dot.ph** and a few resellers. Expect roughly
₱1,500–2,500 a year. Register `deuceandco.ph` in your own name and with your own
email — not a developer's, not mine.

## B4. Point the domain at the site

In Netlify: **Domain settings → Add a custom domain →** type `deuceandco.ph`.
Netlify shows you either two nameservers or a set of DNS records.

In your dot.ph control panel, enter what Netlify gave you. Then wait — DNS takes
anywhere from ten minutes to a few hours to spread. HTTPS (the padlock) switches
itself on once the domain resolves; you don't do anything for that.

## B5. Check it from outside your own network

Open `https://deuceandco.ph` on mobile data, not your home wifi, and ideally on
someone else's phone. This catches DNS problems your own devices can hide.

---

# Part C — Turn on real orders

Only worth doing once Part A and B feel right.

Follow **ORDERS-SETUP.md**. Short version: create a Google Sheet, paste
`orders-backend.gs` into Apps Script, deploy as a Web App with access set to
**Anyone**, copy the URL into `ORDERS_ENDPOINT` in the site file, and re-upload.

Then test it end to end:

1. Place a booking on the live site as if you were a customer.
2. Check the row appears in your sheet within a second or two.
3. Open the owner view — the badge should be sage and read **"Live from your
   Google Sheet"**, and your test booking should be in the queue.
4. Advance its status in the dashboard and confirm the sheet row changes too.
5. Delete the test row from the sheet when you're done.

---

# What to expect on day one

**Works:** browsing, dates, court booking, cart, order tickets, the dashboard,
and — after Part C — real bookings landing in your sheet.

**Still manual, by design:** payment. The customer sends you the ticket, you
reply with the GoTyme details (use `DeuceCo Payment Details.dc.html` — export it
once as a PDF or image and reuse it), they send a receipt, you confirm. That's
deliberate: it costs nothing, and you keep eyes on every booking.

**Not there yet:** automatic double-booking prevention. The calendar shows what's
out, but two people could still book the last VCORE for the same day within
minutes of each other. At your volume, you'll catch it in the DM. If it starts
happening, tell me and I'll add a hold.

**One decision to make:** the orders endpoint is public, so anyone with that URL
could read your order list — including customer phone numbers. Fine for a small
shop, but know it before you put real names in there.
