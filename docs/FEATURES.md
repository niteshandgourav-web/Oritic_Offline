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

## Customer account window (khata)

Owner clicks any customer (grid row number ↗, list, Ctrl+K, bills, delivery sheet "Poori profile") → a large window opens on the right. `←` `→` = previous / next customer, `p` = payment, `Esc` = close, reload keeps it open (`#customers/<id>`). Boys still see the simple profile.

| Part | What it shows / does |
|---|---|
| Header | Phone (call / WhatsApp / copy), address, boy, schedule, since. Kul baki, this month's bill, last payment (mode + who received), bottles out (½L / 1L), current rates with discount marker (e.g. Buffalo ₹75 −5), daily order. Buttons: Payment lo, Rate badlo / Discount, Adjustment, Bill bhejo (WhatsApp), Statement Excel, Print, Edit, Pause |
| Khata | Accounting ledger for a month / 1–15 / 16–end / sab / custom: opening balance, every delivery with qty × rate, skip days, payments (mode + receiver), discounts, charges, rate-change lines, running balance, closing. Closing = Bills page baki |
| Products | Per product: days, qty, avg rate, amount for the period; last 6 months (litres, days, bill, paid, month-end baki) |
| Rates | Customer rate vs default for Cow / Buffalo / Gir / Chaach / Paneer / Ghee, "kab se / kyun". New rate from any date with reason (Discount, Rate badha, Special rate, Galti sudhaar). Future-dated rates apply on that day. Back-dated: asks whether to re-bill delivered days; re-billed days go into the past-date record. Full rate history |
| Payments | All payments with mode (Cash / UPI), who received it (Owner / Office, office staff, boys), screenshot, delete; totals by mode and by receiver. Adjustments list |
| Adjustments | One-time discount, extra charge (bottle toota, late fee), write-off (baki band, optional pause). Change baki and bill text, not counted as cash / UPI collection |
| Bottles | Balance by size and a dated movement log (given, returned, manual fixes) with "Bottle sudhaar" |
| Delivery calendar | Month grid: delivered (qty, ₹), skip, pending, planned / expected; standing order, schedule, pause |
| Comments & profile | Profile details, map, fix comment, full comment history |

Settings → Office tools has the **Office staff** list (used in "Kisne liya"). Payment form and bulk payment entry record the receiver. This is the base for boy / staff cash accounts (next phase).

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

## v3 (branch `v3-business`): poora business ek panel me

Step-by-step use: [USER-GUIDE.md](USER-GUIDE.md) (same text as Menu → Guide in the panel).

| Area | What is new |
|---|---|
| Menu | Grouped: Roz ka kaam · Customers & paisa · Maal & kharcha · Team. Red count on Team when a cash handover is waiting |
| Dashboard | "Dhyan dein" list (orders not confirmed, deliveries not ticked, handover pending, cash over limit, baki over limit, bottles not returned, supplier dues), month sale / collection / maal + kharcha / bachat (andaza), cash per person, bottles by milk type |
| Delivery sheet | New look, boy group headers with counts and litres, ⚙ Columns (order + show/hide, per computer), product ke apne column (pin from Product master: shahad, dahi, gur…), Value ₹ and Baki ₹ columns, bottle split under every milk tile, Loading sheet (boy-wise bottles by milk type + items, copy / print), compact rows, red "baki" badge over the udhaar limit |
| Vasooli (new) | Who owes how much, days since last payment (0–15 / 16–30 / 30+), filters, WhatsApp reminder with ready text, reminder queue, Excel |
| Team & cash (new) | Cash in hand per person, handover (boy → office with "Mila ✓" confirmation, short amounts), bank deposit, sudhaar, limit. Person account: cash khata, collection, day-wise delivery, KM & incentive, salary / advance. Boy sees "Mere paas cash" on his phone |
| Kharcha (was Purchase) | Maal (item, qty, rate, supplier, cash / UPI / bank / udhaar), Kharcha (categories, salary / advance to a person), Supplier payment, supplier khata with dena baki, month hisab (sale, maal, kharcha, bachat, by category), "Doodh ka hisab" (bought vs ordered vs delivered), Excel |
| Demand | Order text for supplier / godown for any date (litres + bottles by type + other items), editable, Copy / WhatsApp |
| Bottles | Outstanding by milk type × size (first-given-first-returned), 7+ din se nahi lautayi, last return date, per-customer history |
| Meter | Duty start / end time, Start KM and End KM → Total KM auto, manual entry when no photo, day-wise KM per boy |
| Customer account | "Order lo" (jumps to that customer's row in the Delivery sheet), Chhutti (hold from–to dates, auto resume) |
| Guide (new) | Menu → Guide: 17 sections, searchable, "Ye page kholo" buttons |

New Firestore collection in v3: `cashbook`.

## v4 plan (15 Nov 2026): agla kaam, abhi shuru nahi kiya

Maqsad: panel **jaldi aur aasani se** chale. "Best" = jo hamari zaroorat me sahi baithe, banane aur chalane me kam dikkat, aur **free** ho.
Kram: aasaan se shuru, phir bade kaam. **Kathin** wale kaam (neeche alag list) baad me senior AI model se karwayenge.

| # | Kaam | Kya banana hai | Mehnat | Kaun |
|---|---|---|---|---|
| V4-01 | Skills research | Online dhoondo SaaS / UI-UX / dashboard sudharne wali Claude skills (jaise frontend design, UX audit). Download se pehle owner se poochho, `.claude/skills/` me daalo, phir unse poore app ka review | Aasaan | ✅ Ho gaya 15 Nov: 3 skills (`web-design-guidelines`, `evaluate`, `frontend-design`), review [UX-REVIEW.md](UX-REVIEW.md) |
| V4-02 | Filter chhota | Delivery sheet ka filter wala hissa bahut jagah leta hai: ek line ki chips + "Aur filter ▾" me baaki. Skill review ke baad final | Aasaan | ✅ Ho gaya 15 Nov: table 381 px → 295 px pe shuru |
| V4-03 | Side menu auto-hide | Menu sirf icons me simta rahe, mouse le jao to khule, 📌 se hamesha khula rakh sako (har computer apni pasand yaad rakhe) | Aasaan | ✅ Ho gaya 15 Nov |
| V4-04 | Team master (comma list ki jagah) | Settings me naam comma se likhne ki jagah har insaan ka profile: naam, role (boy / office / owner), phone, joining date, PIN, active / band | Madhyam | ✅ Ho gaya 15 Nov: Team & cash → "+ Naya member", Profile tab, "Kaam chhod diya" / "Wapas kaam pe" |
| V4-05 | Delivery boy ka poora account | Customer account jaisa ek window: kis kis ko deliver kiya (din-wise), kis se payment liya, kisko paisa wapas diya, cash kitna haath me, bottles (di / wapas aayi / kho gayi), kitne din se kaam kar raha hai, KM, incentive, salary / advance. v3 ka person account isi me badhega | Madhyam | ✅ Ho gaya 15 Nov: tabs Profile · Cash khata · Collection (+ paisa wapas) · Delivery (din / customer-wise) · Bottles · KM & petrol · Hisab · Salary |
| V4-06 | Incentive har insaan ka alag | Rule per boy: gaadi apni ya company ki, petrol ya electric, per litre / per customer / per KM / fixed ₹, round kitne (jaise pehle tempo se gaanv se doodh, phir hotel me bharwa ke aage). Mahine ka incentive apne aap bane, hath se badal bhi sako | Madhyam | ✅ Ho gaya 15 Nov: Hisab / incentive tab, "Sudhaar" se bonus / katauti |
| V4-07 | Meter, cash aur energy alag | Meter (KM) ki entry, cash ki entry aur energy (petrol ₹ / litre, EV charging ₹ / unit) alag jagah, per boy per gaadi. Mahine ke ant me KM vs kharcha vs incentive ka hisab | Madhyam | ✅ Ho gaya 15 Nov: Meter pe Trip + ⛽ Petrol / charging, mahine ki table me petrol ₹/km |
| V4-08 | Demand aur kharcha check | Demand (supplier order) aur Kharcha ke hisab demo data pe test karo, galti mile to theek karo | Aasaan | ✅ Ho gaya 15 Nov: Demand = Delivery sheet (3 dino pe mila), sale = bills, doodh ka hisab sahi. Theek kiya: bachat me discount / write-off / extra charge ab judte hain |
| V4-09 | Route sequence behtar | Sequence pehle se hai (boy apne customer upar-neeche kar sakta hai). Ab: drag ya ↑↓, "isko X ke baad rakho", sequence har jagah same (boy screen, Delivery sheet, Loading sheet, export). **Sab haath se, apne aap kuch nahi badle** | Aasaan | ✅ Ho gaya 15 Nov: naam pe tap → Sabse upar / neeche / Kisi ke baad / pehle; phone pe bade ↑↓; bina save band / boy badalne pe poochta hai. Boy (apna) aur owner / office (sabka) dono |
| V4-10 | Boy ki roz ki sheet export | Har boy ki alag file, **usi sequence me**, columns usi order me jo hum set karein (baad me badal sakein) | Aasaan | ✅ Ho gaya 15 Nov: ⋯ Aur / Team & cash → 📄 Boy sheets, ⚙ Columns (settings.boyCols). **Sirf owner / office**, boys ko export nahi (link owner share karega). Drive pe V4-15 me |
| V4-11 | Bill format + PDF | Settings me bill ka format: business naam, logo, address, kaunse column, period, neeche ka note, UPI QR. Ek customer ya sabke bill **PDF** apne aap bane (download / WhatsApp) | Madhyam | ✅ Ho gaya 15 Nov: Bills → ⚙ Bill format (settings.billFmt), customer bill → 📄 PDF / PDF bhejo, 📄 PDF (sab bills) ek file. js/billpdf.js (jsPDF, A4/A5, UPI QR). ₹ ki jagah "Rs."; Hindi (Devanagari) naam PDF me nahi chhapte |
| V4-12 | Simple login | Gmail / OTP nahi chahiye. Har insaan apne naam + PIN se ghuse, galat PIN 5 baar → thodi der band. Bas koi bhi aake na chala le | Madhyam | ✅ Ho gaya 15 Nov (app wala hissa): office staff ka apna PIN (`settings.pins.staff`), entries unke naam se, 5 galat = 5 min band (phir badhta hai, isi phone pe), PIN badla / naam hata = us phone se logout, "Poora access" (`team[naam].full`) ke bina Settings / team / bill format band. Database rules abhi bhi V4-H1 |
| V4-13 | Free hosting research | GitHub se free me live karna, repo **private** rakhna: Netlify / Cloudflare Pages / Firebase Hosting / GitHub Pages ki tulna (free limits, private repo chalta hai ya nahi). Free database: Firebase (code pehle se) vs Supabase vs aur. Report + suggestion, phir owner tay kare | Aasaan | ✅ Ho gaya 15 Nov: [HOSTING.md](HOSTING.md). Suggestion: Firebase Firestore (free) + Cloudflare Pages (private repo) |
| V4-14 | Live karna | Chuni hui hosting pe site daalna aur free database jodna. Account banana / sign-in owner karega, baaki setup main | Madhyam | ✅ Test live 15 Nov: https://oritic-offline.pages.dev (Cloudflare Pages, branch `v3-business`, har push pe apne aap) + Firebase test project `oritic-test` (Mumbai, rules: sirf signed-in). Asli live project baad me |
| V4-15 | "Backup on Drive" button | Ek button: aaj ka data Google Drive pe. Folder `Oritic Backup/2026-11/2026-11-15/`: ek main file (us din ki deliveries, payments, cash, kharcha, bottles) + **har boy ki alag file** (V4-10 wali, sequence me). Poora data roz nahi, sirf **us din ka** | Madhyam | ✅ Code ho gaya 15 Nov: ⋯ Aur / Team & cash / Settings → ☁ Drive backup (sirf owner / office). Owner ka apna **Google Apps Script** web app (free, koi Google Cloud project nahi): Settings → Google Drive backup → Script copy → script.google.com me deploy → link paste (settings.driveBk: url, key, last). Main file `oritic-DATE-din-ka-hisaab.xlsx` (Summary, Deliveries, Payments, Refund-Sudhaar, Cash, Kharcha, Meter, Bottle) + har boy ki file (window.boySheets). Same din dobara = purani file trash. Preview me nakli Drive jawab se aur script ko nakli Drive pe test kiya. **Asli Google pe test baaki** (owner ko deploy karna hai) |

### Kathin: senior AI model ke liye alag rakha (abhi nahi karna)

| # | Kaam | Kyun kathin |
|---|---|---|
| V4-H1 | Database ki asli suraksha (R-3) | Login sirf app me ho to database phir bhi khula rehta hai. Firebase Auth + Firestore rules (har role kya padh / likh sakta hai) sahi banana, bina data tode |
| V4-H2 | Raat ko apne aap Drive backup | Panel band ho tab bhi chale: Google Apps Script (free) ka raat wala trigger jo database padh ke Drive pe V4-15 jaisi files banaye. Rules lagne ke baad iska access bhi secure chahiye |
| V4-H3 | Data kabhi na khoye / server down pe bhi kaam chale | Offline me entry, net aane pe sync, do jagah se ek saath badlav ka takraav, aur server band ho to kal ki sheet backup se chal jaye. Restore ka tarika test karna |
| V4-H4 | Local data ko live database me le jaana | Abhi wala local / demo data live pe shift karna, live data (CR-09) saaf karna, bina kuch khoye |
| V4-H5 | Delivery row me boy ka naam save karna | Har jagah jahan row likhi jaati hai (sheet, Aaj list, bulk) `boy` jodna, aur purane data ke liye migration, taaki boy badalne pe purana hisab na badle |

### V4-04 se V4-07 me kya bana (15 Nov 2026)

- **Team master**: naam ab bhi `settings.boys` / `settings.staff` / `settings.pins` me jaate hain (login aur purana code waise hi chale). Profile `settings.team[naam]` me: `role, phone, join, vehicle (own/company/none), fuel (petrol/diesel/cng/ev/cycle), vno, note, inc{salary, fixed, perL, perHouse, perKm, perRound}, adj{'YYYY-MM':{amt,note}}, left`.
- **Kaam chhod diya**: login aur list se hatta hai, profile aur hisab rehta hai ("Purane member"). Active customers ho to pehle unhe dusre boy ko dena padta hai; haath me cash ho to chetavni.
- **Hisab** = salary + fixed + litre × rate + ghar × rate + Meter ka KM incentive + trip × rate + sudhaar; minus Kharcha me us insaan ko diya (salary / advance / incentive) = dena baaki.
- **Meter**: `kms` me naya `trips`; KM ka rate har boy ka apna (`inc.perKm`), na ho to Settings wala.
- **Petrol / charging**: `purchases` me `kind:'kharcha'`, `cat:'Petrol / diesel'` ya `'EV charging'`, `veh` (kiski gaadi), `fuel, qty, unit, energy:true`. Cash me diya to dene wale ka cash ghatta hai, Kharcha ke hisab me judta hai.
- **Paisa wapas (refund)**: customer account → Adjustment → "Paisa wapas diya": `adjust` me `type:'refund', via, mode`. Customer ka baki badhta hai (advance kam hota hai), cash me diya to `via` wale ka cash ghatta hai, bill me line aati hai.
- **Kami (baad me)**: delivery row me ye nahi likha jaata ki kis boy ne di. Boy ka hisab customer ke **abhi ke** boy se banta hai, customer ka boy badla to purane din naye boy me dikhenge. Theek karne ke liye har row me `boy` save karna hoga (V4-H5).

Note: V4-12 ka app login aur V4-15 ka button pehle ban sakte hain. Asli suraksha (V4-H1) aur raat ka auto backup (V4-H2) usi ke upar lagenge.
