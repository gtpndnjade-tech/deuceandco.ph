## Deuce&Co. — Racket Rental Site

A mobile-first rental site for Deuce&Co., a tennis racket rental and social tennis community in Biñan, Laguna. Customers browse rackets by level, tennis balls, baskets, and ball tubes, pick rental dates, and send a pre-filled inquiry via Instagram or Messenger DM — bookings are confirmed and paid for over DM, not through an on-site cart.

### Files

| File | What it is |
| --- | --- |
| `index.html` | Homepage — hero, RENT THE GEAR grid, WHERE YOU'LL PLAY, testimonials. |
| `rackets.html` | Full racket catalogue, filterable by level (`?level=beginner/intermediate/advanced`). |
| `rent-the-gear.html` | Editorial rental page — levels, full catalogue, how-to-rent, terms. |
| `gear.html` | Balls, baskets, and ball tube rentals. |
| `barkada-bundle.html` | Group rental bundle page (4 or 6 rackets). |
| `support.js` | Runtime that renders the site's template markup (`{{ }}` holes, `sc-for`/`sc-if` loops) — required by every page above. |
| `img/` | All photography and product images referenced by the site. |

### Deploying

Push all files in this folder to the repository root (GitHub Pages, branch `main`). Keep `.nojekyll` at the root — without it, Jekyll skips any `_`-prefixed folder. `CNAME` points the custom domain at GitHub Pages; keep it if the domain is already configured in your DNS.

### Editing

Each `.html` file contains a DC-style template — markup with `{{ field }}` holes rendered client-side by `support.js`, plus a `<script type="text/x-dc" data-dc-script>` block holding the page's data and logic. Edit the data arrays (rackets, prices, copy) directly in that script block.
