# jd-apprentice portfolio site

Personal portfolio for **Jonathan Dyallo** (@jd-apprentice). 90s anime terminal theme.

## Architecture

Plain HTML/CSS/JS — **zero build tooling.** No npm, no bundler, no package.json.

| File | Purpose |
|---|---|
| `index.html` | Entire page + inline CSS (~1500 lines) + Alpine.js data (portfolio data, commands) |
| `index.js` | Audio player (73 songs, shuffled, auto-next on end) |
| `effects.js` | IIFE: live clock, localStorage visitor counter, page-entry fade animation |
| `assets/` | 73 `.mp3` songs, 3 `.gif` images, 1 `Resume.pdf` |

## Dependencies

- **Alpine.js 3.x** — loaded via CDN (`unpkg.com/alpinejs@3.x.x/dist/cdn.min.js`)
- **Google Fonts** — VT323, Russo One, Press Start 2P (all loaded via `<link>`)
- No other runtime or dev dependencies

## Commands

There are no build, test, or lint commands. The site runs by opening `index.html` in a browser or serving with any static file server:

```
# preview locally
npx serve .
# or
python3 -m http.server 8000
```

## Development notes

- All CSS lives in a single `<style>` block in `<head>` of `index.html` — no separate stylesheets
- Alpine.js component is initialized inline via `document.addEventListener("alpine:init", ...)` — see the `<script>` block at the bottom of `index.html`
- Available terminal commands: `skills`, `projects`, `communities`, `videos`, `help`, `clear` — unknown commands fall back to `help`
- Audio player uses Fisher-Yates shuffle, reshuffles on exhaustion
- Visitor counter is `localStorage`-based (per-browser, not server-side)
- Assets directory is large (73 MP3 files) — avoid bulk-reading or bulk-modifying it
- `effects.js` injects CSS dynamically for the counter digits and page-entry animation (no separate style file)

## Deployment

- Repo: `git@github.com:jd-apprentice/site.git`
- Live at: `https://jonathan.com.ar`
- No CI/CD config in the repo — deployment is external (likely Cloudflare Pages or manual)
- No pre-commit hooks, linter, or formatter — just commit and push
