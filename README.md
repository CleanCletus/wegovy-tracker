# GLP-1 Restart Tracker (PWA)

Static, no build step. Open `index.html` locally or drop this folder on GitHub Pages / Netlify / Vercel.

## Install on iPhone
1. Open the deployed URL in **Safari** (service workers + install only work in Safari on iOS).
2. Share → **Add to Home Screen**.
3. Launch from the home screen icon — runs full screen, works offline.

## Data
Entries live in IndexedDB on the device (`glp1-tracker`), with a localStorage fallback in private mode. Nothing leaves the phone; there is no backend.

Seed history loads on first run. Export CSV regularly as a backup: iOS can evict PWA storage after ~7 days of no use, or under low storage. `navigator.storage.persist()` is requested on load, which reduces but does not eliminate the risk.

## Dosing math
75 clicks = 2.4 mg on the 2.4 mg multi-dose FlexTouch pen (3.0 mL, 9.6 mg). mg = clicks x 0.032. Full pen = 300 clicks.
