# Deuce&Co.PH — website revamp

Static website for deuceandcoph.com. No build step: every file in this folder is served as-is.

## What's in here

| File / folder | What it is |
|---|---|
| `index.html` | Home |
| `rent-the-gear.html` | Rent the Gear |
| `rackets.html` | Racket List (Beginner / Intermediate / Advanced, linked as `#beginner`, `#intermediate`, `#advanced`) |
| `gear.html` | Gear |
| `barkada-bundle.html` | Barkada Bundle |
| `coaching.html` | Coaching |
| `our-story.html` | Our Story |
| `support.js` | The page runtime (bundles React). Every page needs it. Do not delete. |
| `assets/` | All site photos and graphics |
| `img/barkada-night-01…03/` | Photos for the RECENT SESSIONS galleries on the homepage (02 is shown as "Rally Session 01") |
| `.nojekyll` | Tells GitHub Pages to serve the files untouched. Keep it. |

The only outside file the pages load is Google Fonts (Oswald, Inter, EB Garamond). Without internet the site still works, just in fallback fonts.

## Push with GitHub Desktop

**If you already have a repository for the site**

1. In GitHub Desktop, choose the repository, then **Repository → Show in Finder**.
2. Copy everything from this folder into that repository folder. Replace the old files when asked. On a Mac, press **Cmd+Shift+.** in Finder so the hidden `.nojekyll` file is copied too.
3. Back in GitHub Desktop, write a summary (for example "Website revamp"), click **Commit to main**, then **Push origin**.

**If you're starting a new repository**

1. **File → Add Local Repository…**, pick this folder, and click **create a repository** when GitHub Desktop offers it.
2. Click **Publish repository**. Untick "Keep this code private" if you'll host it on free GitHub Pages.

## Put it online with GitHub Pages

1. On github.com, open the repository → **Settings → Pages**.
2. Under **Build and deployment**, pick **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
3. After a minute or two the site is live at `https://<your-username>.github.io/<repository-name>/`.

### Using deuceandcoph.com

Only do this when you're ready for the new site to replace the current one.

1. In **Settings → Pages → Custom domain**, enter `deuceandcoph.com` and save. GitHub adds a `CNAME` file to the repository for you.
2. At your domain registrar, point the domain to GitHub Pages:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www`: `<your-username>.github.io`
3. Once the check passes, tick **Enforce HTTPS**.

Check GitHub's current "Managing a custom domain for your GitHub Pages site" guide before changing DNS, in case the addresses have changed.

## Adding photos to a session gallery

Each RECENT SESSIONS tile reads its folder in order: `01.jpg`, `02.jpg`, `03.jpg`… and stops at the first missing number.

- To add photos, export them as JPG (about 1800px on the long edge) and name them with the next numbers. Don't skip a number.
- To remove one, delete it and renumber the photos after it down by one.
- Tile covers are separate files: `assets/9c7b01f61e50817b59cb8525415298a7.jpg` (Barkada Night 01), `assets/76c23e65caffa6995d577c1f19b397d7.jpg` (Rally Session 01), `assets/8235bfdb4a4ff0687d345df50224bfb8.jpg` (Barkada Night 03). Replace a cover with a square photo of the same file name.

## Inquiries

All inquiry buttons open Messenger with Deuce&Co.'s page (`m.me/61593264803515`) and a message already filled in. The racket, gear and bundle popups also offer Instagram and copy the message, because Instagram can't pre-fill it.
