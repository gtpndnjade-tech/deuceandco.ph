# Deuce&Co. Rental Site

A mobile-first rental site for Deuce&Co., a tennis racket, gear, and court rental service based in South City Homes, Biñan, Laguna. Customers browse rackets by level, balls and baskets, and the Barkada Bundle group promo, then send a pre-filled DM (Messenger or Instagram) to book — every rental is confirmed personally, with no cart or automated checkout.

## File structure

- `index.html` — the homepage: hero, "Rent the Gear" tile grid, "Where You'll Play" court section (with inline court-rental inquiry selector), "Club Notes" community section, testimonials, footer.
- `rackets.html` — the full 16-frame racket catalogue with level filter tabs (All / Beginner / Intermediate / Advanced) and a per-frame rental inquiry picker. Accepts `?level=beginner`, `?level=intermediate`, or `?level=advanced` to pre-select a tab.
- `rent-the-gear.html` — editorial landing page: level guide, full racket grid by level, balls/baskets, how-to-rent steps, rental terms, closing CTA.
- `gear.html` — balls, basket, and ball tube rentals, each with its own inquiry picker.
- `barkada-bundle.html` — the group rental promo page (4 or 6 beginner rackets).
- `support.js` — runtime required by every page. Do not remove or rename.
- `img/` — all photography and product images referenced across the five pages.

## Deployment notes

- Static site — no build step. Push as-is to GitHub Pages (or any static host) with `index.html` at the root.
- GitHub Pages: keep `.nojekyll` at the repo root (included in this export), or Jekyll will silently skip any folder starting with an underscore. If your repo already has a `.gitignore` and/or `CNAME`, keep your existing ones — they are not duplicated in this export.
- All "Inquire"/"Rent"/"Book" actions open a pre-filled Messenger or Instagram DM (`m.me/61593264803515` and `ig.me/m/deuceandco.ph`) — no backend required for the booking flow itself.
- Prices and inventory (16 frames: 4 Beginner, 6 Intermediate, 6 Advanced) are hardcoded in each page's script block — update them there if rates or stock change.
