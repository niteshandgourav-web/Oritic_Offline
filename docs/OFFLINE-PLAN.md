# Offline plan for delivery boys (not built yet)

Status: **plan only**. Nothing here is built. Written 18 Nov 2026.

Goal: a delivery boy can open the app and work without internet. Everything he does is saved on his phone and uploads to the server by itself when the internet comes back. Nothing gets lost, and it stays secure.

## What already works
- **Data is kept on the phone.** After the first load, the phone stores its own copy of customers and deliveries (Firestore `enablePersistence`).
- **The app's pages are saved.** `sw.js` caches the app's own files, so a phone that opened the site once can open the pages again without internet.
- **Saving offline is partly there.** Firestore keeps changes made offline in a queue and sends them later.

## Problems found
1. **The app cannot start with no internet.** The Firebase library loads from `gstatic.com` every time, and `sw.js` does not cache it. If the boy opens the app while offline, it stops at "Database se connect nahi ho paya".
2. **Login needs internet at start.** `signInAnonymously()` runs before anything else. With no internet, it fails, so no data is shown, even though the data is on the phone.
3. **Deliveries can be lost (biggest risk).**
   - `writeRows` waits for the server to reply.
   - The `queue('day:'+date)` makes saves for the same date wait in a line behind each other.
   - Offline, the first save waits forever, and the next deliveries for that date never reach phone storage. They are shown on screen only.
   - If the boy closes the app or the phone restarts before the internet comes back, those deliveries are lost.
4. **No clear upload status.** The boy only sees an "Offline" tag. He can't see how many entries are not uploaded yet.
5. **Every phone stores all the data.** All customers, payments and dues, so a lost phone exposes everything. This is the same issue as the security task V4-H1.

## The plan

### Part 1: Open and work without internet
- Cache the Firebase library files (exact pinned version) in `sw.js`, the same as the app's pages.
- If the phone signed in earlier, start straight away with the data on the phone. Connect to the server in the background.
- Result: the boy can open the app and see his list even in airplane mode.

### Part 2: Never lose a delivery (fixes problem 3)
- Each ✓ Diya, Skip, quantity change, bottle return or payment is written to phone storage first, instantly. The app does not wait for the server.
- The server upload happens on its own; nothing waits in a line.
- The app keeps a small backup list (outbox) of entries not uploaded yet.
- When the internet returns, everything uploads automatically. Each entry has its own ID, so nothing is entered twice.
- If the app is closed and opened again later, the pending entries are still there and upload then.

### Part 3: Morning "Offline ready"
- On the first login each morning with internet, the app downloads today's list and confirms it is stored: **"Offline ready ✓ · 6:12 am"**.
- If the download did not finish, it shows: "Internet chahiye, list poori download nahi hui".
- The guide tells boys to add the app to the home screen (Chrome → Add to Home screen).

### Part 4: Clear status for the boy and the owner
- At the top of the boy's screen:
  - 🟢 **Sab upload ✓**
  - 🟠 **Offline · 4 entries phone me save, upload baaki**
  - 🔵 **Upload ho raha hai…**
- If the boy tries to log out with entries not uploaded, the app blocks it: "Pehle internet on karo, 4 entries baaki hain".
- The owner sees, for each boy, when his phone last uploaded ("Anil · 10 min pehle").

### Part 5: Safety
- **What a boy can do offline:** only delivery work (✓ Diya, Skip, quantity change, bottles, cash or UPI received, notes). Price changes, deleting and bulk buttons need internet.
- **Clashes:** if the office changes the same customer's entry while the boy is offline:
  - The boy's delivered entry wins.
  - The owner gets a "Badla gaya" note to check.
  - Payments are never overwritten, because each payment is a new entry.
- **PIN lock offline:** the PIN still works offline. After 5 wrong tries, the app locks.
- **Logout clears the phone:** on logout, the data stored on that phone is deleted, only after all uploads are done.
- **Old data:** the boy's phone keeps only recent days.
- **Real protection (V4-H1):** with proper login and server rules, a boy's phone downloads only his own customers. Parts 1–4 work without it, but V4-H1 should come next, so a lost phone doesn't expose all the data.

## Testing (on `oritic-test` only, never live data)
- Turn off internet in the browser, then:
  - mark deliveries
  - close the app
  - open it again offline
  - turn the internet back on
  - check that every entry reached the server exactly once
- Repeat with slow internet (2G), and with two phones changing the same customer.
- Test on a real phone in airplane mode.

## Open questions
1. Can boys collect cash or UPI while offline, or only mark deliveries?
2. Should the office or owner also be able to work offline, or only boys?
3. Should V4-H1 (real security) come right after this, or later?

Recommended order: Part 1 and Part 2 first (they stop deliveries being lost), then 3 and 4, then 5 together with V4-H1.
