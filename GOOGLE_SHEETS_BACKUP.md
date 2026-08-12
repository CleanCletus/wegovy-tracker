# Google Sheets backup — setup

The tracker can push a backup of all your entries to a Google Sheet, as a second
backup alongside your GitHub repo. One **Log** tab (one row per entry, easy to read
in a browser) and one **Backup** tab (the full JSON payload, used by the app's
**Restore** button).

No Google API key or password is stored in the app — the app only talks to a small
Apps Script "web app" you deploy once, and the sheet's contents are yours.

---

## One-time setup (≈ 5 minutes)

1. **Create a Google Sheet**
   - Go to <https://sheets.new>, name it e.g. `GLP-1 Backup`. Keep it private.
   - Leave it open in the browser.

2. **Add the Apps Script**
   - In the sheet: **Extensions → Apps Script** (a new tab opens).
   - Delete the default `function myFunction() {}` and paste the entire contents of
     [`google-sheets-backup.gs`](google-sheets-backup.gs) in this folder.
   - Click **Save** (💾 icon).
   - *Optional but recommended:* set a passcode at the top of the script:
     ```js
     var PASSCODE = 'pick-a-secret-word';
     ```
     You'll enter the same word in the app, so only the app can read/write the sheet.

3. **Deploy as a web app**
   - Click **Deploy → New deployment**.
   - Gear icon ⚙️ → type **Web app**.
   - **Description**: `glp1 backup`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
   - Click **Deploy**, then **Authorize access** and pick your Google account
     (allow the "see, edit, create, delete your spreadsheets" permission).
   - Copy the **Web app URL** — it ends in `/exec` and looks like
     `https://script.google.com/macros/s/AKfycb.../exec`.

4. **Connect in the app**
   - Open the tracker → **Cloud sync** → tap to expand → **Google Sheets backup**.
   - Paste the `/exec` URL, enter the passcode if you set one, tap **Connect**.
   - A first backup runs immediately. You should see `Backed up N entries`.

---

## How it behaves

- **Auto-backup**: every time you log, edit, delete, or import, the app waits ~2s
  and pushes the latest data to the sheet (if connected).
- **Back up now**: manual button in the Cloud sync section.
- **Restore**: tap **Restore** twice to confirm. It pulls the lossless JSON from the
  Backup tab and merges it with what's on this device (newest per entry wins; it
  never wipes your current data).
- **GitHub sync stays the source of truth** for two-way phone ↔ computer sync.
  Sheets is your extra, human-readable backup.

## Updating the script later

After editing the Apps Script: **Deploy → Manage deployments → ✏️ edit → Version:
New version → Deploy**. The `/exec` URL stays the same, so no need to reconnect the app.

## Notes / caveats

- Anyone with the `/exec` URL *and* the passcode can write/read the sheet — the
  passcode is the only gate. Keep the sheet private.
- Free Google Sheets are rate-limited, but this app's volume (a few entries a day)
  is nowhere near the limits.
- The Backup tab stores a single JSON string in one cell — that's intentional
  (lossless). Don't edit that cell by hand or the Restore button won't work.
