# Feature checklist: reference panel → Oritic v2

Reference = https://oritic-panel.netlify.app/ (live version of 10 Nov 2026, first commit of this repo).
Every feature of the reference is still in v2. "Same" means the original code runs unchanged.

## Pages

| Reference feature | v2 | Where |
|---|---|---|
| Home dashboard: aaj ka load, done/pending, aaj ki sale & purchase, boy-wise table, Kal ka anumaan, mahine ki sale/collection, total baki, bottles bahar, 7 din graph, sabse zyada baki, quick buttons | Same, **Kal ka anumaan fixed** (confirmed Kal orders + same rule as Delivery sheet) | Menu → Dashboard |
| Aaj ki delivery: date ‹ › + picker, pichli date banner, boy chips, route order, progress, bottle table, khali bottles wapas, dispatch notes, ✓ / Skip / edit sheet, map, Alt/Paused badges, fix + variable comments, "Baaki sab done", "+ Aur customer aaj" | Same (menu name "Aaj list"). **Undo after ✓ keeps the planned quantity** | Menu → Aaj list |
| Kal ki delivery grid: ✓ confirm, qty per product (Paneer/Ghee too), bottles, other products (Tally picker), fix comment, variable comment with "kab tak", 7 din history, filters, Auto-fill, Sab confirm, Excel backup, route order, dispatch notes, Enter/↑↓, double click details, phone copy | Same page still works at `#plan` (Ctrl+K → "Kal", or `g k`). Everything it does is also inside the new **Delivery sheet** | Delivery sheet |
| Customers: search, boy chips, Active/Paused/Sab, Route order / A–Z, ⇅ order, list with position, map button | Same (List view). Owner on desktop also gets **Grid view** | Customers → List / Grid |
| Customer profile: badges, phone copy/WhatsApp, address, map open/copy, schedule, since, order, rates, month stats, Bill / Payment / Edit / Pause, recent deliveries, comment history + search | Same | Click customer |
| Customer edit / naya: all fields, custom din, since, roz ka order & rate, roz ke other products, purana baki, bottles opening, notes, delete | Same (customer-specific Paneer/Ghee rate is no longer wiped on save) | Profile → Edit, "+ Naya" |
| Bills: month, Pura / 1–15 / 16–end, boy chips, search, totals, list + table, WhatsApp per customer, bill sheet (copy, WhatsApp, payment, din-wise, payments), CSV download | Same + **WhatsApp queue** + **Excel (.xlsx)** | Bills |
| Payments: month, search, Cash / Online totals, list, screenshot view, delete (owner), payment form with customer search, mode, screenshot (boys: zaroori for online), date, note | Same. **Amount starts blank** (placeholder shows baki, "Pura baki bharo" button) and **save asks once more** ("₹50 cash jama karein? Haan"). Owner also gets **Bulk payment entry** | Payments |
| Bottles: total bahar, search, ± manual sudhaar | Same | Bottles |
| Product master: add (duplicate check), inline edit, active, kitni baar use, delete | Same | Products |
| Demand forecast: Aaj / 7 / 15 / 30 din, milk + bottles + value, other products per day | Same | Demand |
| Purchase: date ‹ ›, add, delete, din / mahine ka total, 7 din list, item suggestions | Same | Purchase |
| Meter / KM: boy camera-only START/END photo per gaadi, aaj ki photos, KM & incentive; owner per boy photos, KM → incentive, mahine ka incentive, 30 din baad photos delete | Same | Meter |
| Settings: company, UPI, bill note, boys, PINs, default rates, product master link, ₹/km, raat 11 baje Excel backup, help, data counts, JSON import, backup, Excel backup, logout | Same + **Office tools** card (date cutoff, Paneer/Ghee ₹/kg) + **Database** card (full backup/restore, audit record, local-mode tools) | Settings |
| Login: Owner / boy, PIN pad, remember login | Same | — |
| Boy screens: sirf apni list, detail (address, map, call, instructions, aaj dena hai, bottles wapas, Delivered / Skip / Undo, payment, feedback comment) | Same | Boy login |
| Help, More menu (mobile), PWA / Add to Home screen, offline sync, auto Excel backup | Same (service worker now also caches the new files) | — |

## New in v2 (office / bulk work)

| Feature | What it does |
|---|---|
| **Delivery sheet** (replaces "Aaj" + "Kal" confusion) | One grid for any date. Opens on "Aaj ki date": before the cutoff (default 9 AM) = today, after = tomorrow. Buttons Pichli / Aaj ki / Agli + calendar + `[` `]`. Tiles turn amber for a past date and green for a future date. Status box "17 order abhi confirm nahi" / "Sab confirm ✓" (click = only those rows). Filters: Sab · Confirm baaki · Delivery baaki · Delivered · Skip. ✓ Diya / Skip / ↺ per row on today and past dates. Bottles wapas (½L, 1L) per row. Red bar for older dates where deliveries were never ticked. |
| Bulk select | Checkbox per row, Shift+click range, select all. Bar: Confirm, ✓ Diya, Skip, Pending, set quantity, add other product, add comment. |
| Save feedback | Tick shows a spinning circle until the database confirms, then green ✓ and the row flashes. On failure: red ✕ and "Save nahi hua, dobara dabao". Table scroll stays where it was. Reload opens the same page. |
| Pichli date safety | Any change on a past date shows a popup with the exact change ("Buffalo 1L → 0.5L · bill ₹80 → ₹40"), Enter = Haan, Esc = Rehne do. Every such change is recorded (who, when, before, after): Settings → "Pichli date ke badlav". |
| **Customers grid** | Spreadsheet editing of name, mobile, boy, area, makan, address, landmark, schedule, status, 4 quantities, 4 rates, fix comment, map link. Arrow keys / Enter move between cells, Ctrl+S saves, changed cells turn yellow, wrong cells turn red with the reason. Paste many cells from Excel. "+1 / +10 khali rows" for fast new customers (mobile optional). Bulk: boy, Active/Pause, schedule, quantity, rate, Excel export, delete. |
| **Excel import** (customers, owner only) | Template download (with example row + help sheet) → upload → preview "45 naye · 3 galat". Catches: missing Naam/Boy/Schedule, unknown boy (one-click "Settings me jod do"), mobile not 10 digits, same number twice in file, number already in panel, minus or non-0.5 quantities, bad dates, unknown custom days. Import stays locked until the file is clean; "Galat rows ki Excel" download. Full backup downloads first, then saves in batches of 400 with a progress bar and a final report. Only customer details are imported (no history, baki or bottles). |
| **Bulk payment entry** | Table: customer (type name or phone, Enter picks), baki, amount, mode, date, note. Enter → next line, Ctrl+S → one confirmation for all. |
| **WhatsApp bill queue** | All bills with a phone and baki for the selected period. "Agla bill bhejo" opens the next one; sent ones are remembered on this computer. |
| **Ctrl+K search** | Find any customer (name, phone, area), page or action. Enter = profile, Shift+Enter = bill, Alt+Enter = payment. |
| Keyboard shortcuts | `?` list · `/` search · `g d/c/p/b/h/s` pages · `p` payment · `n` naya customer · Ctrl+Enter confirm row. |
| **Local / offline mode** | `firebase-config.js` → `ORITIC_MODE='local'`: complete panel works with data saved in this browser only (IndexedDB). For safe testing and demo; "Demo data daalo" fills 30 sample customers. |

## Bugs from the test report fixed in the code

| ID | Bug | Fix |
|---|---|---|
| R-1 | Kal panel: tick hatane pe tick wapas, quantity standing order pe | Each customer's row is now replaced fully on save (`mergeFields`), old fields cannot come back |
| R-2 | Paneer / Ghee rate ₹0 | Rate per kg from customer → Settings (new field) → Product master "Paneer" / "Ghee". Sheet warns if still ₹0 |
| R-4 | Boy ✓ bhool gaya to bill me nahi judta | Delivery sheet shows a red bar with those dates and counts; one click opens them |
| R-5 | ✓ → Undo → ✓ planned quantity kho jaati | Undo keeps the confirmed quantity (Aaj list and Delivery sheet) |
| CR-02 | Raat 12 ke baad galat "Kal" | "Aaj ki date" follows a cutoff hour (Settings, default 9 AM) |
| CR-04 | Payment amount pehle se bhara | Blank amount + two-step save |
| CR-10 | Bottle table hamesha khula | Closed by default, click to open |
| Home | Kal ka anumaan 80.5L vs 88L | Uses confirmed Kal orders and the same schedule rule as the sheet |

Not in this version (need a decision or backend work): R-3 per-person login / database rules, R-6 bottle limits, CR-03 boy quantity change with reason, CR-05 cash book, CR-09 fresh-start wipe of the live database.
