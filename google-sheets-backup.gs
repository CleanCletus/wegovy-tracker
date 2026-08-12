/************************************************************
 * Google Sheets backup for the Restart Tracker (Wegovy app)
 * ----------------------------------------------------------
 * 1. Create a Google Sheet (e.g. "GLP-1 Backup").
 * 2. Open it, then Extensions → Apps Script.
 * 3. Delete any default code and paste this whole file. Save.
 * 4. (Optional) Set PASSCODE below, then enter the same value
 *    in the app's "Google Sheets backup" section. This gates
 *    who can write/read the sheet (the URL alone is not secret).
 * 5. Deploy → New deployment → type "Web app":
 *      - Description: anything
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Click Deploy, authorise when asked, and copy the
 *    "/exec" web app URL.
 * 6. In the app: Cloud sync → Google Sheets backup → paste the
 *    URL (+ passcode if you set one) → Connect.
 *
 * The script maintains two tabs in the spreadsheet:
 *   - "Log"    : one human-readable row per entry.
 *   - "Backup" : the full JSON payload in one cell (lossless,
 *                used by the app's Restore button).
 *
 * After any edit to this script: Deploy → Manage deployments →
 * edit the deployment → Version: New version → Deploy.
 ************************************************************/

var PASSCODE = ''; // <- optional. e.g. PASSCODE = 'my-secret-word';

function getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function checkSecret_(given) {
  return !PASSCODE || given === PASSCODE;
}

function send_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (!checkSecret_(data.secret)) return send_({ ok: false, error: 'bad passcode' });
    var entries = data.entries || [];
    var deleted = data.deleted || {};
    var updatedAt = data.updatedAt || Date.now();

    // ---- human-readable Log tab ----
    var log = getSheet_('Log');
    var headers = ['id', 'date', 'weight_kg', 'dose_clicks', 'dose_mg',
                   'dose_label', 'food_noise', 'gi_symptoms', 'notes', 'updatedAt'];
    var sorted = entries.slice().sort(function (a, b) {
      return (a.date || '').localeCompare(b.date || '') || ((a.updatedAt || 0) - (b.updatedAt || 0));
    });
    var rows = sorted.map(function (en) {
      return [en.id, en.date, en.weight_kg, en.dose_clicks, en.dose_mg, en.dose_label,
              en.food_noise, (en.gi_symptoms || []).join('|'), en.notes || '', en.updatedAt || ''];
    });
    log.clearContents();
    if (headers.length) log.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    if (rows.length) log.getRange(2, 1, rows.length, headers.length).setValues(rows);

    // ---- lossless Backup tab ----
    var bup = getSheet_('Backup');
    var payload = { version: 2, entries: entries, deleted: deleted, updatedAt: updatedAt };
    bup.clearContents();
    bup.getRange(1, 1).setValue('json');
    bup.getRange(1, 2).setValue(JSON.stringify(payload));
    bup.getRange(1, 3).setValue(new Date(updatedAt).toISOString());
    bup.getRange(2, 1).setValue('count');
    bup.getRange(2, 2).setValue(entries.length);

    return send_({ ok: true, saved: entries.length, updatedAt: updatedAt });
  } catch (err) {
    return send_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  try {
    var action = (e.parameter && e.parameter.action) || 'status';
    if (action === 'read') {
      if (!checkSecret_(e.parameter.secret)) return send_({ ok: false, error: 'bad passcode' });
      var bup = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Backup');
      if (!bup) return send_({ ok: false, error: 'no backup found' });
      var raw = bup.getRange(1, 2).getValue();
      var data = (typeof raw === 'string' && raw) ? JSON.parse(raw) : null;
      if (!data) return send_({ ok: false, error: 'no backup found' });
      return send_({ ok: true, version: data.version || 2, entries: data.entries || [],
                     deleted: data.deleted || {}, updatedAt: data.updatedAt || 0 });
    }
    // default: status
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Backup');
    var count = null, updatedAt = 0;
    if (sh) {
      var c = sh.getRange(2, 2).getValue();
      if (typeof c === 'number') count = c;
      var ts = sh.getRange(1, 3).getValue();
      if (ts) updatedAt = new Date(ts).getTime();
    }
    return send_({ ok: true, count: count, updatedAt: updatedAt });
  } catch (err) {
    return send_({ ok: false, error: String(err) });
  }
}
