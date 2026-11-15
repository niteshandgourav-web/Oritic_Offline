/* Oritic v4 · Google Drive backup (V4-15)
 * "☁ Drive backup" button (sirf owner / office): ek din ka data Google Drive me bhejta hai.
 * Drive tak file owner ke apne Google Apps Script web app se jaati hai (free, koi Google Cloud project nahi):
 *   Drive: Oritic Backup / YYYY-MM / YYYY-MM-DD /
 *     oritic-YYYY-MM-DD-din-ka-hisaab.xlsx  (deliveries, payments, refund, cash, kharcha, meter, bottle)
 *     oritic-YYYY-MM-DD-<Boy>.xlsx          (har boy ki file, route kram + chune columns: window.boySheets)
 * Same din dobara bhejo to purani file trash me jaati hai, nayi aa jaati hai.
 * Setup (owner): Settings → Google Drive backup → script copy → script.google.com me deploy → link paste.
 * Raat ka automatic backup = V4-H2 (abhi nahi).
 */
'use strict';
(()=>{
const XMIME='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const cfg=()=>settings().driveBk||{};
const URL_RE=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
const ST={d:'Delivered',k:'Skip',p:'Pending'};
const cn=id=>(S.customers[id]||{}).name||id||'';
const onDay=(o,date)=>Object.values(o||{}).filter(x=>x&&x.date===date).sort((a,b)=>(a.t||0)-(b.t||0));
const tm=t=>t?new Date(t).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'';
const R=n=>Math.round((+n||0)*100)/100;
const own=()=>{if(!isOwner()){toast('Sirf owner / office ke liye');return false}return true};
const mainName=date=>`oritic-${date}-din-ka-hisaab.xlsx`;

/* ---------- Apps Script (owner ise script.google.com me paste karta hai) ---------- */
const scriptText=key=>[
"// Oritic Panel → Google Drive backup. Ise script.google.com ke naye project me paste karo.",
"// Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone.",
"// KEY ko kisi ko mat batao. Naya key banaya to ye script dobara paste karke Deploy → Manage deployments → Edit → New version karo.",
"const KEY = '"+key+"';",
"const ROOT = 'Oritic Backup';",
"",
"function doPost(e) {",
"  const lock = LockService.getScriptLock();",
"  try {",
"    lock.waitLock(30000);",
"    const p = JSON.parse(e.postData.contents);",
"    if (p.key !== KEY) return out({ ok: false, err: 'Galat key. Settings wala naya script paste karo.' });",
"    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(p.date || '')) return out({ ok: false, err: 'Date galat hai' });",
"    const day = folder(folder(folder(DriveApp.getRootFolder(), ROOT), p.date.slice(0, 7)), p.date);",
"    let n = 0;",
"    (p.files || []).forEach(function (f) {",
"      const name = String(f.name || 'file.xlsx').replace(/[\\\\/]/g, '-').slice(0, 120);",
"      const old = day.getFilesByName(name);",
"      while (old.hasNext()) old.next().setTrashed(true);",
"      day.createFile(Utilities.newBlob(Utilities.base64Decode(f.b64), f.mime || MimeType.MICROSOFT_EXCEL, name));",
"      n++;",
"    });",
"    return out({ ok: true, n: n, url: day.getUrl() });",
"  } catch (err) {",
"    return out({ ok: false, err: String(err) });",
"  } finally {",
"    try { lock.releaseLock(); } catch (_) {}",
"  }",
"}",
"",
"function doGet() { return out({ ok: true, app: 'oritic-backup' }); }",
"",
"function folder(parent, name) {",
"  const it = parent.getFoldersByName(name);",
"  return it.hasNext() ? it.next() : parent.createFolder(name);",
"}",
"",
"function out(o) {",
"  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);",
"}",""].join('\n');
const newKey=()=>{const a=new Uint8Array(16);crypto.getRandomValues(a);return Array.from(a,b=>b.toString(16).padStart(2,'0')).join('')};

/* ---------- din ka hisaab (main file) ---------- */
function addSheet(XL,wb,name,aoa,w){const ws=XL.utils.aoa_to_sheet(aoa);ws['!cols']=w.map(x=>({wch:x}));XL.utils.book_append_sheet(wb,ws,name)}
async function mainBook(date){const XL=await loadXLSX();const wb=XL.utils.book_new();
  const rows=(S.days[date]||{}).rows||{};
  const del=Object.entries(rows).map(([cid,r])=>({cid,r,c:S.customers[cid]||{}}))
    .sort((a,b)=>(a.r.by||a.c.boy||'').localeCompare(b.r.by||b.c.boy||'')||((a.c.seq??9999)-(b.c.seq??9999))||cn(a.cid).localeCompare(cn(b.cid)));
  const tq={};let nD=0,nK=0,nP=0,sale=0,bo=0,br=0;
  const DL=[['Boy','Customer','Phone','Status',...PLN.map(p=>p.sh+' ('+p.u+')'),'Other products','Amount ₹','Bottle diye','½L wapas','1L wapas','Bottle wapas (kul)','Note','Time']];
  const bot={};
  del.forEach(({cid,r,c})=>{const q=r.q||{},d=r.s==='d';if(d)nD++;else if(r.s==='k')nK++;else nP++;
    DL.push([r.by||c.boy||'',cn(cid),c.phone||'',ST[r.s]||r.s||'',...PLN.map(p=>+q[p.k]||''),(r.x||[]).map(e=>e.n+(+e.qty>1?' ×'+e.qty:'')).join(', '),d?R(r.a):'',d?(+r.bo||''):'',+r.brS||'',+r.brB||'',+r.br||'',r.n||'',tm(r.t)]);
    if(d){sale+=+r.a||0;bo+=+r.bo||0;PLN.forEach(p=>tq[p.k]=(tq[p.k]||0)+(+q[p.k]||0))}br+=+r.br||0;
    const g=(d&&+r.bo)||+r.br;if(g)bot[cid]={boy:r.by||c.boy||'',o:d?(+r.bo||0):0,b:+r.br||0}});
  DL.push(['TOTAL',`${nD} delivered`,'','',...PLN.map(p=>tq[p.k]?R(tq[p.k]):''),'',R(sale),bo,'','',br,'','']);
  const pays=onDay(S.payments,date);const PY=[['Customer','Amount ₹','Mode','Kisne liya / likha','Screenshot','Note','Time'],...pays.map(p=>[cn(p.cid),R(p.amt),p.mode||'',p.by||'',p.proof?'Haan':'',p.note||'',tm(p.t)])];
  const pTot=pays.reduce((s,p)=>s+(+p.amt||0),0);const byMode={};pays.forEach(p=>byMode[p.mode||'—']=(byMode[p.mode||'—']||0)+(+p.amt||0));
  const adj=onDay(S.adjust,date);const AD=[['Customer','Type','Amount ₹','Kiske haath (via)','Mode','Note','Likha','Time'],...adj.map(a=>[cn(a.cid),a.type||'',R(a.amt),a.via||'',a.mode||'',a.note||'',a.by||'',tm(a.t)])];
  const cash=onDay(S.cash,date);const CS=[['Type','Kisne diya','Kisko','Amount ₹','Status','Mila ₹','Note','Likha','Time'],...cash.map(x=>[x.type||'',x.from||'',x.to||'',R(x.amt),x.status||'',x.got!=null?R(x.got):'',x.note||'',x.by||'',tm(x.t)])];
  const pur=onDay(S.purchases,date);const KH=[['Category','Item','Amount ₹','Mode','Kisne diya','Qty','Unit','Note','Likha','Time'],...pur.map(p=>[p.cat||p.kind||'',p.item||'',R(p.amt),p.mode||'',p.paidBy||'',p.qty??'',p.unit||'',p.note||'',p.by||'',tm(p.t)])];
  const kTot=pur.reduce((s,p)=>s+(+p.amt||0),0);
  const kms=onDay(S.kms,date);const KM=[['Boy','Meter shuru','Meter end','KM','Trips','Rate ₹/km','Incentive ₹','Likha'],...kms.map(k=>[k.boy||'',k.r0??'',k.r1??'',k.km??'',k.trips??'',k.rate??'',R(k.inc),k.by||''])];
  const BT=[['Customer','Boy','Bottle diye','Bottle wapas','Customer ke paas ab (kul)'],...Object.entries(bot).map(([cid,v])=>{const c=S.customers[cid];return [cn(cid),v.boy,v.o,v.b,c&&window.bottleBal?bottleBal(c):'']})];
  const SM=[[`${settings().company||'Oritic'} · Din ka hisaab`],['Date',fmtDate(date)+' '+date.slice(0,4)],['Backup time',new Date().toLocaleString('en-IN')],['Backup kisne kiya',S.me||''],[],
    ['Delivered ghar',nD],['Skip',nK],['Pending',nP],...PLN.filter(p=>tq[p.k]).map(p=>[p.sh+' ('+p.u+')',R(tq[p.k])]),['Sale ₹',R(sale)],['Bottle diye',bo],['Bottle wapas',br],[],
    ['Payment mile ₹',R(pTot)],...Object.entries(byMode).map(([m,a])=>['  '+m,R(a)]),['Refund / sudhaar (entries)',adj.length],['Cash handover / bank (entries)',cash.length],['Kharcha ₹',R(kTot)],['Meter KM (kul)',kms.reduce((s,k)=>s+(+k.km||0),0)]];
  addSheet(XL,wb,'Summary',SM,[30,26]);
  addSheet(XL,wb,'Deliveries',DL,[12,22,13,10,...PLN.map(()=>9),26,10,9,8,8,10,24,8]);
  addSheet(XL,wb,'Payments',PY,[22,10,10,16,10,24,8]);
  addSheet(XL,wb,'Refund-Sudhaar',AD,[22,10,10,14,8,26,12,8]);
  addSheet(XL,wb,'Cash',CS,[10,14,14,10,10,10,24,12,8]);
  addSheet(XL,wb,'Kharcha',KH,[18,26,10,8,12,6,6,24,12,8]);
  addSheet(XL,wb,'Meter',KM,[14,12,12,8,6,10,11,12]);
  addSheet(XL,wb,'Bottle',BT,[22,14,10,12,22]);
  return {buf:XL.write(wb,{bookType:'xlsx',type:'array',compression:true}),nD,pays:pays.length}}

/* ---------- upload ---------- */
const b64=buf=>{const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
async function buildFiles(date,withBoys){const m=await mainBook(date);const files=[{name:mainName(date),mime:XMIME,b64:b64(m.buf)}];
  if(withBoys&&window.boySheets){const D=boySheets.data(date);for(const b of Object.keys(D.by).sort()){const buf=await boySheets.book(D,b);if(buf)files.push({name:boySheets.fileName(date,b),mime:XMIME,b64:b64(buf)})}}
  return files}
async function upload(date,withBoys){const c=cfg();if(!c.url||!c.key)throw new Error('Pehle Settings → Google Drive backup set karo (owner)');
  const files=await buildFiles(date,withBoys);
  let r;try{r=await fetch(c.url,{method:'POST',body:JSON.stringify({key:c.key,date,by:S.me||'',files})})}catch(e){throw new Error('Drive tak nahi pahuncha. Internet / script link check karo')}
  let j;try{j=await r.json()}catch(_){throw new Error('Drive se jawab samajh nahi aaya. Script "Anyone" ke liye deploy hai?')}
  if(!j||!j.ok)throw new Error((j&&j.err)||'Upload fail');
  return {...j,files:files.length}}
async function saveLast(o){const st=settings();await saveSettings({...st,driveBk:{...(st.driveBk||{}),last:o}})}

/* ---------- UI ---------- */
S.dbk={busy:false};
function drawBk(date){const c=cfg(),ok=!!(c.url&&c.key),L=c.last;
  openSheet('☁ Drive backup',`<div class="stack">
   <div class="small muted">Ek din ka data aapki <b>Google Drive</b> me jaata hai: folder <b>Oritic Backup / ${esc((date||'').slice(0,7))} / ${esc(date||'')}</b>. Usi din ko dobara bhejoge to purani file hat ke nayi aa jayegi.</div>
   ${ok?'':`<div class="empty" style="color:var(--warn)">Drive backup abhi set nahi hai. ${isAdmin()?'Settings → <b>Google Drive backup</b> me set karo.':'Owner se Settings me set karwao.'}</div>`}
   <div class="row wrap" style="gap:8px"><label class="small muted" for="dbkD">Kis din ka data</label><input type="date" class="input" id="dbkD" style="width:auto;padding:6px 8px" value="${esc(date)}"></div>
   <label class="row" style="gap:10px;min-height:40px;cursor:pointer"><input type="checkbox" id="dbkB" checked style="width:20px;height:20px"> <span>Har boy ki alag file bhi (route kram, aapke columns)</span></label>
   <button class="btn p block" data-act="dbkGo" ${ok&&!S.dbk.busy?'':'disabled'}>${S.dbk.busy?'Bhej rahe hain…':'⬆ Drive pe bhejo'}</button>
   ${L?`<div class="small muted">Pichla backup: <b>${esc(L.date)}</b> · ${L.n} file · ${esc(L.by||'')} · ${new Date(L.at).toLocaleString('en-IN')}${/^https:\/\/drive\.google\.com\//.test(L.url||'')?` · <a href="${esc(L.url)}" target="_blank" rel="noopener">Drive folder kholo</a>`:''}</div>`:''}
   <div class="small muted">Main file me: Summary, Deliveries, Payments, Refund-Sudhaar, Cash, Kharcha, Meter, Bottle. Raat ka automatic backup baad me aayega.</div></div>`)}

function card(){const c=cfg(),adm=isAdmin(),L=c.last;
  return `<div class="card" id="dbkCard"><h3>Google Drive backup</h3>
   <div class="small" style="margin:6px 0 10px">${c.url&&c.key?'<b style="color:var(--ok,#16a34a)">✓ Set hai.</b>':'<b>Abhi set nahi.</b>'} Ek din ka data aapki Google Drive ke <b>Oritic Backup</b> folder me jaata hai. Free hai, aapke Google account se.${L?` Pichla: <b>${esc(L.date)}</b> (${new Date(L.at).toLocaleString('en-IN')}).`:''}</div>
   ${adm?`<ol class="small" style="margin:0 0 10px 18px;padding:0;display:grid;gap:6px">
     <li><button class="btn sm o" data-act="dbkCopy">📋 Script copy karo</button></li>
     <li><a href="https://script.google.com/home/projects/create" target="_blank" rel="noopener"><b>script.google.com</b></a> kholo (apne Google account se) → jo code dikhe sab mita ke <b>paste</b> karo → 💾 Save.</li>
     <li><b>Deploy → New deployment</b> → ⚙ me <b>Web app</b> → Execute as: <b>Me</b> → Who has access: <b>Anyone</b> → Deploy.</li>
     <li>Google "Authorize access" poochega → apna account → <b>Allow</b> (ye sirf aapki apni script hai).</li>
     <li><b>Web app URL</b> copy karke neeche paste karo → Save → Test.</li></ol>
    <div class="field"><label class="f" for="dbkU">Web app URL (…/exec)</label><input class="input" id="dbkU" value="${esc(c.url||'')}" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="off"></div>
    <div class="row wrap" style="margin-top:8px;gap:8px"><button class="btn p" data-act="dbkSave">Save</button><button class="btn o" data-act="dbkTest" ${c.url?'':'disabled'}>Test</button><button class="btn o" data-act="dbkOpen">☁ Abhi backup karo</button><button class="btn sm" data-act="dbkNewKey" title="Purana key band ho jayega">Naya key</button></div>
    <div id="dbkScr" hidden style="margin-top:8px"><div class="small muted">Copy nahi hua? Neeche ka sab select karke copy karo:</div><textarea class="input" rows="6" readonly style="font-family:monospace;font-size:12px"></textarea></div>`
   :`<button class="btn o" data-act="dbkOpen">☁ Abhi backup karo</button>`}</div>`}

const _vS=vSettings;
vSettings=function(){const o=_vS();if(!isOwner())return o;return {...o,html:o.html+`<div class="stack" style="margin-top:12px">${card()}</div>`}};

async function ensureKey(){const st=settings();if(st.driveBk&&st.driveBk.key)return st.driveBk.key;const k=newKey();await saveSettings({...st,driveBk:{...(st.driveBk||{}),key:k}});return k}
Object.assign(A,{
  dbkOpen(){if(!own())return;drawBk(todayISO())},
  async dbkGo(){if(!own()||S.dbk.busy)return;const date=($('#dbkD')||{}).value||todayISO();const wb=!!($('#dbkB')||{}).checked;
    S.dbk.busy=true;drawBk(date);$('#dbkB').checked=wb;toast('Files ban rahi hain, Drive pe bhej rahe hain…');
    try{const j=await upload(date,wb);await saveLast({date,at:Date.now(),by:S.me||'',n:j.n,url:j.url||''});toast(`Drive pe ${j.n} file chali gayi (${date})`)}
    catch(e){toast(e.message||String(e))}
    finally{S.dbk.busy=false;if(!$('#sheet').hidden&&$('#dbkD'))drawBk(date)}},
  async dbkCopy(){if(!isAdmin())return toast('Sirf owner');const txt=scriptText(await ensureKey());
    let ok=false;try{await navigator.clipboard.writeText(txt);ok=true}catch(_){}
    const box=$('#dbkScr');if(box){box.hidden=ok;const ta=box.querySelector('textarea');ta.value=txt;if(!ok){ta.focus();ta.select()}}
    toast(ok?'Script copy ho gayi. Ab script.google.com me paste karo':'Neeche box se copy karo')},
  async dbkNewKey(){if(!isAdmin())return;if(!confirm('Naya key banayein? Purani script kaam karna band kar degi. Naya script dobara paste + deploy (New version) karna padega.'))return;
    const st=settings();await saveSettings({...st,driveBk:{...(st.driveBk||{}),key:newKey()}});toast('Naya key ban gaya. Ab "Script copy karo" dabao aur dobara deploy karo')},
  async dbkSave(){if(!isAdmin())return;const u=($('#dbkU').value||'').trim();if(u&&!URL_RE.test(u))return toast('Link "https://script.google.com/macros/s/…/exec" jaisa hona chahiye');
    await ensureKey();const st=settings();await saveSettings({...st,driveBk:{...(st.driveBk||{}),url:u}});toast(u?'Drive link save':'Drive link hata diya')},
  async dbkTest(){if(!isAdmin())return;const u=cfg().url;if(!u)return toast('Pehle link save karo');
    try{const j=await (await fetch(u)).json();toast(j&&j.app==='oritic-backup'?'✓ Script chal rahi hai. Ab "Abhi backup karo" se check karo':'Ye Oritic script nahi lagti')}
    catch(e){toast('Script tak nahi pahunche. "Who has access: Anyone" se deploy kiya?')}}
});
window.driveBackup={mainBook,buildFiles,upload,scriptText};
})();
