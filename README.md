# Oritic panel v2 (office / bulk edition)

Doodh delivery panel for Oritic. Same features as the live panel (https://oritic-panel.netlify.app/),
plus tools for office staff who do bulk work on a computer. Plain HTML + JavaScript, no build step.

Full list of what is kept and what is new: [docs/FEATURES.md](docs/FEATURES.md)

## Files

| File | Kya hai |
|---|---|
| `index.html` | The reference panel (all pages, boy screens, login) with bug fixes |
| `js/bulk.js` | New office tools: Delivery sheet, Customers grid, Excel import, bulk payments, WhatsApp queue, Ctrl+K, shortcuts |
| `js/account.js` | Customer account window: khata ledger, products, rates + history, payments by receiver, adjustments, bottles, calendar, chhutti |
| `js/business.js` | Team & cash, person accounts, Kharcha + suppliers, Vasooli, bottles by type, Meter, Demand forward, Dashboard cards |
| `js/guide.js` | In-app Guide page (also builds `docs/USER-GUIDE.md` via `node tools/make-guide.js`) |
| `js/local-store.js` | Browser database for local / offline mode (works like Firestore) |
| `firebase-config.js` | Choose `local` or `firebase` mode and paste the Firebase config |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | Phone app (Add to Home screen) and offline cache |

## 1. Test on this computer (no internet database needed)

`firebase-config.js` already says `window.ORITIC_MODE = 'local'`. Data stays in this browser only.

```bash
python -m http.server 8765
```

Open http://localhost:8765 → Owner → PIN `1234` → Settings → **Demo data daalo**.
Demo boys: Sunil `1111`, Anil `2222`, Nitu `3333`.

## 2. Test with Firebase (shared by all phones), on a TEST project first

1. console.firebase.google.com → new project, e.g. `oritic-test`
2. Firestore Database → Create (asia-south1). Authentication → Anonymous → Enable
3. Project settings → Add app → Web → copy the config
4. In `firebase-config.js`: paste the config and set `window.ORITIC_MODE = 'firebase'`
5. Test everything. Only then use the live project's config.

New collections used by v2: `audit` (record of past-date changes) and `adjust` (discount / charge / write-off). If your Firestore rules list collections one by one, allow both. v3 also uses `cashbook`.

Same data structure as the live panel (`customers`, `days`, `payments`, `settings/main`, `purchases`, `kms`, `odo`, `proofs`), so v2 can open the live data directly when you are ready.

## 3. Put it online (Netlify)

Drag this folder onto https://app.netlify.com/drop, or connect this GitHub repo in Netlify (no build command, publish folder = `/`).

## Daily use (office)

- **Delivery sheet** opens on "Aaj ki date" (after 9 AM it is tomorrow; change in Settings → Office tools).
- Type quantities, `Enter` = next customer, `Ctrl+Enter` = confirm row, `[` `]` = change date.
- Tick boxes on many rows → bar at the bottom → Confirm / ✓ Diya / Skip / quantity / product / comment.
- Past date edits always ask first and are recorded (Settings → Pichli date ke badlav).
- **Customer account**: click the row number ↗ (or any customer anywhere) → khata, rates, payments, bottles, calendar. Discount = "Rate badlo / Discount" (from any date) or "Adjustment".
- **Customers → Grid**: edit like Excel, paste from Excel, `Ctrl+S` save. **Excel import** for new customers.
- **Payments → Bulk payment entry** for many payments at once.
- **Bills → WhatsApp queue** to send all bills one after another.
- `Ctrl+K` from anywhere to find a customer; `?` shows all shortcuts.
