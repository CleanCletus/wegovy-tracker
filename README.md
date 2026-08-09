# GLP-1 Restart Tracker

A small weight/dose tracker for a GLP-1 restart (Wegovy). Runs as a static site on GitHub Pages and is installable as a PWA.

- **Live site:** https://cleancletus.github.io/wegovy-tracker/
- **How it works:** `index.html` redirects to `Restart Tracker.dc.html`, the app (a "Design Component" rendered by the `support.js` runtime, with React loaded from unpkg). The service worker (`sw.js`) caches the app for offline use after the first visit.

## Cloud sync (back up across devices)

The app can back up your entries to a **private** GitHub repo through GitHub's API, so your phone and computer share the same data. Nothing is public — the data lives in a repo you own that only your token can access.

### One-time setup
1. Create a **private** repository named `wegovy-tracker-data` (github.com → **New repository** → *Private*). It starts empty; the app creates a `data.json` in it on first sync.
2. Create a **fine-grained personal access token** (github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens → **Generate new token**):
   - **Repository access:** *Only select repositories* → choose `wegovy-tracker-data`
   - **Permissions → Repository permissions → Contents:** *Read and write*
   - Generate, then copy the token (starts with `github_pat_`).
3. In the app (Dashboard → **Cloud sync**), paste the token, confirm the repo name is `wegovy-tracker-data`, and tap **Connect**.

The token is stored only on the device you paste it into (browser IndexedDB). Repeat step 3 on each device you want in sync. You can revoke the token any time from GitHub settings.

## Data
Entries are stored locally in IndexedDB (`glp1-tracker`) with a localStorage fallback in private mode. With cloud sync connected, every save is also pushed to your private repo's `data.json` — each sync is a git commit, giving you versioned backups.

Seed history loads on first run. Export CSV regularly as an extra backup: iOS can evict PWA storage after ~7 days of no use or under low storage. `navigator.storage.persist()` is requested on load to reduce that risk.

## Dosing math
75 clicks = 2.4 mg on the 2.4 mg multi-dose FlexTouch pen (3.0 mL, 9.6 mg). mg = clicks x 0.032. Full pen = 300 clicks.
