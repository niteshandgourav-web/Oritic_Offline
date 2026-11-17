// Oritic Panel service worker: app shell cache. Data Firebase (ya local mode me is browser) se aata hai.
const CACHE='oritic-v29';
const SHELL=['./','./index.html','./firebase-config.js','./js/local-store.js','./js/bulk.js','./js/account.js','./js/business.js','./js/boysheet.js','./js/billpdf.js','./js/drivebackup.js','./js/entryedit.js','./js/office.js','./js/followup.js','./js/sales.js','./js/pricing.js','./js/guide.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin||e.request.method!=='GET')return; // Firebase / gstatic / cdnjs: network
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html'))));
});
