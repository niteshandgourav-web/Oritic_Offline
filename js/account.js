/* Oritic v2 · Customer account (khata) window
 * Owner ke liye: kisi bhi customer pe click → right side me poora account: khata (ledger), products,
 * rates + rate history, payments (mode + kisne liya), adjustments, bottles, delivery calendar, comments.
 * Uses globals of index.html + js/bulk.js. Ledger builder is generic (boy / staff accounts next phase).
 */
'use strict';
(()=>{
const CSS=`
.acct{position:fixed;inset:0;z-index:15;background:rgba(10,18,13,.35);display:flex;justify-content:flex-end}
.acct[hidden]{display:none}
.ac-panel{background:var(--bg);width:min(1180px,80vw);height:100%;display:flex;flex-direction:column;box-shadow:-12px 0 40px rgba(0,0,0,.25)}.ac-panel.anim{animation:acin .18s ease}
@keyframes acin{from{transform:translateX(40px);opacity:.4}}
@media (max-width:899px){.acct .ac-panel{width:100vw;overflow:auto}.acct .ac-bd{flex:none;overflow:visible;padding:12px 12px 40px}.acct .ac-hd{padding:10px 12px 0;flex:none}.acct .ac-top h2{white-space:normal;font-size:19px}.acct .ac-stats{grid-template-columns:1fr 1fr}.acct .ac-stat .v{font-size:17px}}
.ac-hd{background:var(--surface);border-bottom:1px solid var(--line);padding:12px 18px 0}
.ac-top{display:flex;align-items:center;gap:8px}
.ac-top h2{font-size:22px;font-weight:800;margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ac-sub{font-size:13px;color:var(--muted);margin-top:4px;display:flex;gap:4px 14px;flex-wrap:wrap;align-items:center}
.ac-sub a,.ac-sub button{color:var(--accent);font-weight:700;display:inline-flex;gap:4px;align-items:center}.ac-sub svg{width:14px;height:14px}
.ac-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:12px}
.ac-stat{background:var(--surface2);border-radius:12px;padding:9px 12px;min-width:0}.ac-stat .l{font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.04em}
.ac-stat .v{font-size:19px;font-weight:800;margin-top:2px}.ac-stat .s{font-size:12px;color:var(--muted);margin-top:1px}
.ac-acts{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.ac-tabs{display:flex;gap:2px;overflow-x:auto;margin-top:8px;scrollbar-width:none}
.ac-tabs button{padding:9px 14px;font-weight:700;font-size:13.5px;color:var(--muted);border-bottom:2.5px solid transparent;white-space:nowrap}
.ac-tabs button.on{color:var(--fg);border-bottom-color:var(--accent)}
.ac-bd{flex:1;overflow:auto;padding:14px 18px 40px}
.ac-card{background:var(--surface);border:1px solid var(--line2);border-radius:var(--r);padding:14px;margin-bottom:12px}
.ac-card h3{margin:0 0 8px}.ac-card.np{padding:0;overflow:auto}.ac-card.np h3{padding:12px 14px 0}
.ac-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
.ldg{width:100%;border-collapse:collapse;font-size:13.5px}
.ldg th{position:sticky;top:0;z-index:1;background:var(--surface2);font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);white-space:nowrap}
.ldg td{padding:7px 10px;border-bottom:1px solid var(--line2);vertical-align:top}
.ldg .n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.ldg .dt{white-space:nowrap}.ldg td.bal{font-weight:700}
.ldg tr.skip td{color:var(--muted);background:var(--surface2)}.ldg tr.cr td.c{color:var(--accent-ink);font-weight:700}.ldg tr.info td{color:var(--info);font-style:italic}
.ldg tr.ob td,.ldg tr.tot td{font-weight:800;background:var(--surface2)}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal .h{font-size:11px;color:var(--muted);font-weight:800;text-align:center;padding:4px}
.cal .d{min-height:64px;border-radius:9px;background:var(--surface);border:1px solid var(--line2);padding:5px 6px;font-size:11.5px;line-height:1.35;overflow:hidden}
.cal .d .dn{font-weight:800;font-size:12px}.cal .d.del{background:var(--accent-soft);border-color:transparent}.cal .d.skip{background:var(--surface2);color:var(--muted)}
.cal .d.pend{background:var(--warn-soft);color:var(--warn)}.cal .d.plan{background:var(--info-soft);color:var(--info)}.cal .d.proj{border-style:dashed}.cal .d.today{box-shadow:inset 0 0 0 2px var(--fg)}.cal .d.out{visibility:hidden}
.acopen{font:inherit;font-size:12px;color:var(--accent);font-weight:800;padding:8px 2px;width:100%}
.rdiff{font-weight:800;font-size:12px}.rdiff.dn{color:var(--accent-ink)}.rdiff.up{color:var(--danger)}
.acleg{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--muted);margin-top:8px}.acleg i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px;margin-right:4px}
@media print{body>*:not(#acct){display:none!important}#acct{position:static;background:none;display:block}.ac-panel{width:100%;height:auto;box-shadow:none}.ac-bd{overflow:visible}.ac-noprint{display:none!important}.ldg th{position:static}}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

S.adjust=S.adjust||{};
S.ac={id:null,tab:'khata',per:'full',m:todayISO().slice(0,7),from:'',to:'',calM:todayISO().slice(0,7),list:[]};
/* reload pe #customers/<id> se account dobara khule */
const hm=(location.hash||'').match(/^#([a-z]+)\/(.+)$/);
if(hm){S.acPending=decodeURIComponent(hm[2]);try{history.replaceState(null,'','#'+hm[1])}catch(_){}}

/* ---------- payment receiver (kisne liya) ---------- */
const staff=()=>Array.isArray(settings().staff)?settings().staff.filter(Boolean):[];
window.payReceivers=()=>isOwner()?[...new Set(['Owner',...staff(),...boys()])]:[S.me];
window.rcvLabel=v=>v==='Owner'?'Owner / Office':v;
window.rcvOpts=cur=>{const Lr=payReceivers();const v=cur||(isOwner()?'Owner':S.me);if(v&&!Lr.includes(v))Lr.push(v);return Lr.map(x=>`<option value="${esc(x)}" ${x===v?'selected':''}>${esc(rcvLabel(x))}</option>`).join('')};
const modeL=p=>p.mode==='cash'?'Cash':'UPI';
const viaOf=p=>p.via||p.by||'';

/* ---------- rates by date ---------- */
const RK=['cow','buffalo','desi','chaach','paneer','ghee'];
const PN={cow:'Cow',buffalo:'Buffalo',desi:'Gir Cow',chaach:'Chaach',paneer:'Paneer (kg)',ghee:'Ghee (kg)'};
const logOf=c=>(c&&Array.isArray(c.rateLog)?c.rateLog:[]).slice().sort((a,b)=>a.from<b.from?-1:a.from>b.from?1:(a.t||0)-(b.t||0));
window.rateNow=c=>{let e=null;for(const x of logOf(c))if(x.from<=todayISO())e=x;return e?e.rates:{}};
const fullRates=c=>({...ratesOf(c),paneer:kgRate(c,'paneer'),ghee:kgRate(c,'ghee')});
function rateOn(c,date){const Lg=logOf(c);let e=null;for(const x of Lg)if(x.from<=date)e=x;if(e)return {...e.rates};if(Lg.length)return {...Lg[0].prev};return fullRates(c)}
window.rateOn=rateOn;
/* row ko us din ke rate se price karo (sirf jinke paas rate history hai) */
window.priceRow=(c,date,row)=>{if(!c||!row||!logOf(c).length)return;const rt=rateOn(c,date);row.r={...(row.r||{}),...rt};
  if(Array.isArray(row.x))row.x=row.x.map(e=>(e.k==='paneer'||e.k==='ghee')&&+rt[e.k]?{...e,rate:+rt[e.k],a:Math.round((+e.u||0)*rt[e.k]*100)/100}:e);
  if(row.s==='d')row.a=calcAmount(row.q||{},row.x||[],row.r)};
const rateChg=x=>RK.filter(k=>+x.prev[k]!==+x.rates[k]).map(k=>`${PN[k]} ₹${L(+x.prev[k]||0)} → ₹${L(+x.rates[k]||0)}`).join(', ');
const defFull=()=>({...defRates(),paneer:kgRate(null,'paneer'),ghee:kgRate(null,'ghee')});

/* ---------- generic ledger (customer, aage boy / staff bhi) ---------- */
function ledger(opening,entries){let bal=opening;return entries.map(e=>{if(e.dr||e.cr)bal+=(e.dr||0)-(e.cr||0);return {...e,bal}})}
window.ledger=ledger;
const ADJ_L={discount:'Discount',charge:'Extra charge',writeoff:'Write-off (baki band)'};
function rowPart(r){const P=PRODUCTS.filter(p=>+(r.q&&r.q[p.k])>0).map(p=>`${L(r.q[p.k])}L ${p.k==='desi'?'Gir Cow':p.sh} @₹${L(+(r.r&&r.r[p.k])||0)}`);
  (r.x||[]).forEach(e=>P.push(e.n+(e.a?' ₹'+L(e.a):'')));const b=brText(r);return P.join(' + ')+(b?' · wapas '+b:'')+(r.n?' · '+r.n:'')}
function khataEntries(c,from,to){const E=[];
  for(const d in S.days){if(d<from||d>to)continue;const r=S.days[d].rows&&S.days[d].rows[c.id];if(!r)continue;
    if(r.s==='d')E.push({date:d,o:1,part:rowPart(r),dr:+r.a||0,cls:''});else if(r.s==='k')E.push({date:d,o:1,part:'Skip'+(r.n?' · '+r.n:''),cls:'skip'})}
  adjOf(c.id,from,to).forEach(a=>E.push({date:a.date,o:a.type==='charge'?2:4,part:ADJ_L[a.type]+(a.note?' · '+a.note:'')+(a.by?' · '+a.by:''),dr:a.type==='charge'?+a.amt||0:0,cr:a.type!=='charge'?+a.amt||0:0,cls:a.type==='charge'?'':'cr'}));
  paymentsOf(c.id,from,to).forEach(p=>E.push({date:p.date,o:3,part:`Payment · ${modeL(p)}${viaOf(p)?' · '+rcvLabel(viaOf(p)):''}${p.note?' · '+p.note:''}`,cr:+p.amt||0,cls:'cr'}));
  logOf(c).forEach(x=>{if(x.from<from||x.from>to)return;E.push({date:x.from,o:0,part:'Rate badla: '+rateChg(x)+(x.why?' ('+x.why+')':''),cls:'info'})});
  return E.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.o-b.o)}
const mAdd=(m,n)=>{let [y,mm]=m.split('-').map(Number);mm+=n;while(mm<1){mm+=12;y--}while(mm>12){mm-=12;y++}return y+'-'+String(mm).padStart(2,'0')};
function acRange(){const a=S.ac;if(a.per==='all')return ['2000-01-01','2099-12-31'];
  if(a.per==='custom'){const f=a.from||a.m+'-01',t=a.to||todayISO();return f<=t?[f,t]:[t,f]}return periodRange(a.m,a.per)}
const perLabel=()=>{const [f,t]=acRange();return S.ac.per==='all'?'Shuru se ab tak':fmtShort(f)+' – '+fmtShort(t)+' '+t.slice(0,4)};

/* ---------- window ---------- */
const TABS=[['khata','Khata'],['products','Products'],['rates','Rates'],['payments','Payments'],['bottles','Bottles'],['cal','Delivery calendar'],['profile','Comments & profile']];
function acEl(){let el=$('#acct');if(!el){el=document.createElement('div');el.id='acct';el.className='acct';el.hidden=true;document.body.appendChild(el);el.addEventListener('click',e=>{if(e.target===el)acClose()})}return el}
function acContextList(id){
  if(S.route==='sheet'&&S.shList&&S.shList.includes(id))return S.shList.slice();
  if(S.route==='customers'&&S.cgIds&&S.cgIds.includes(id))return S.cgIds.filter(x=>!x.startsWith('new_'));
  return Object.values(S.customers).sort((a,b)=>(a.boy||'').localeCompare(b.boy||'')||((a.seq??9999)-(b.seq??9999))||a.name.localeCompare(b.name)).map(c=>c.id)}
function acOpen(id){if(!S.customers[id])return;const same=S.ac.id===id;S.ac.id=id;if(!same)S.ac.tab=S.ac.tab||'khata';if(!S.ac.list.includes(id))S.ac.list=acContextList(id);acDraw(!same);try{history.replaceState(null,'','#'+S.route+'/'+id)}catch(_){}}
function acClose(){const el=$('#acct');if(el){el.hidden=true;el.innerHTML=''}S.ac.id=null;S.ac.list=[];if($('#sheet').hidden)document.body.style.overflow='';try{history.replaceState(null,'','#'+S.route)}catch(_){}}
window.acOpen=acOpen;window.acClose=acClose;
function acDraw(fresh){const c=S.customers[S.ac.id];const el=acEl();if(!c){acClose();return}
  const b=$('#acBody'),pn=$('#acct .ac-panel');const sc=!fresh&&b?b.scrollTop:0,psc=!fresh&&pn?pn.scrollTop:0;
  const wasOpen=!el.hidden&&el.innerHTML;
  el.innerHTML=`<div class="ac-panel ${wasOpen?'':'anim'}" role="dialog" aria-modal="true" aria-label="${esc(c.name)} ka account"><div class="ac-hd">${acHead(c)}
    <div class="ac-tabs ac-noprint">${TABS.map(([k,l])=>`<button class="${S.ac.tab===k?'on':''}" data-act="acTab" data-v="${k}">${l}</button>`).join('')}</div></div>
    <div class="ac-bd" id="acBody">${({khata:tabKhata,products:tabProducts,rates:tabRates,payments:tabPayments,bottles:tabBottles,cal:tabCal,profile:tabProfile}[S.ac.tab]||tabKhata)(c)}</div></div>`;
  el.hidden=false;document.body.style.overflow='hidden';$('#acBody').scrollTop=sc;$('#acct .ac-panel').scrollTop=psc}
function acHead(c){const i=S.ac.list.indexOf(c.id);const bal=balanceUpto(c,null);const cm=todayISO().slice(0,7);const mb=billFor(c,cm,'full');
  const lp=paymentsOf(c.id).slice(-1)[0];const bt=bottleBalBy(c);const rt=ratesOf(c),df=defRates(),o=orderOf(c);
  const show=PRODUCTS.filter(p=>o[p.k]>0||+rt[p.k]!==+df[p.k]);const rl=(show.length?show:PRODUCTS).map(p=>{const d=+df[p.k]-+rt[p.k];return `${p.k==='desi'?'Gir':p.sh} ₹${L(rt[p.k])}${d>0?` <span class="rdiff dn">−${L(d)}</span>`:d<0?` <span class="rdiff up">+${L(-d)}</span>`:''}`}).join(' · ');
  const bp=['full','h1','h2'].includes(S.ac.per)?billFor(c,S.ac.m,S.ac.per):mb;
  return `<div class="ac-top"><button class="btn sm o ac-noprint" data-act="acNav" data-n="-1" ${i>0?'':'disabled'} title="Pichla customer (←)">‹</button><button class="btn sm o ac-noprint" data-act="acNav" data-n="1" ${i>=0&&i<S.ac.list.length-1?'':'disabled'} title="Agla customer (→)">›</button>
     <h2 class="grow">${esc(c.name)}</h2>${c.status==='active'?'<span class="badge g">Active</span>':'<span class="badge y">Paused</span>'}<span class="badge b">${esc(schedText(c).split(' (')[0].split(':')[0])}</span>
     <span class="small muted ac-noprint">${i+1}/${S.ac.list.length}</span><button class="btn sm o ac-noprint" data-act="acClose" title="Band karo (Esc)">✕</button></div>
   <div class="ac-sub">${c.phone?`<a href="tel:${cleanPhone(c.phone)}">${ICONS.phone} ${esc(c.phone)}</a><a href="https://wa.me/91${cleanPhone(c.phone)}" target="_blank" rel="noopener">WhatsApp</a><button data-act="copy" data-t="${esc(c.phone)}">Copy</button>`:'<span>Mobile nahi hai</span>'}
     <span>${esc([c.house,c.address,c.area].filter(Boolean).join(', ')||'Address nahi')}</span><span>Boy: <b style="color:var(--fg)">${esc(c.boy||'—')}</b></span>${custSince(c)?`<span>Since ${fmtShort(custSince(c))} ${custSince(c).slice(0,4)}</span>`:''}</div>
   <div class="ac-stats">
     <div class="ac-stat"><div class="l">Kul baki</div><div class="v" style="color:${bal>0.5?'var(--danger)':'var(--accent)'}">${inr(bal)}</div><div class="s">${bal<-0.5?'advance jama hai':bal>0.5?'lena hai':'hisaab saaf'}</div></div>
     <div class="ac-stat"><div class="l">${fmtMonth(cm)} bill</div><div class="v">${inr(mb.amount)}</div><div class="s">${mb.rows.length} din · jama ${inr(mb.paid)}</div></div>
     <div class="ac-stat"><div class="l">Last payment</div><div class="v">${lp?inr(lp.amt):'—'}</div><div class="s">${lp?fmtShort(lp.date)+' · '+modeL(lp)+(viaOf(lp)?' · '+esc(rcvLabel(viaOf(lp))):''):'Abhi tak koi nahi'}</div></div>
     <div class="ac-stat"><div class="l">Bottles bahar</div><div class="v">${bt.t}</div><div class="s">½L ${bt.s} · 1L ${bt.b}${bt.u?' · '+bt.u+' bina size':''}</div></div>
     <div class="ac-stat"><div class="l">Rate ₹/L · roz ka order</div><div class="v" style="font-size:14.5px">${rl}</div><div class="s">${qtyText(o)}</div></div></div>
   <div class="ac-acts ac-noprint"><button class="btn sm p" data-act="addPayment" data-id="${c.id}">+ Payment lo</button><button class="btn sm" data-act="acRateForm">Rate badlo / Discount</button><button class="btn sm" data-act="acAdjForm">Adjustment</button>
     ${c.phone?`<a class="btn sm" href="https://wa.me/91${cleanPhone(c.phone)}?text=${encodeURIComponent(billText(bp))}" target="_blank" rel="noopener">${ICONS.wa} Bill bhejo</a>`:''}
     <button class="btn sm o" data-act="acXlsx">Statement Excel</button><button class="btn sm o" data-act="acPrint">Print</button><button class="btn sm o" data-act="editCustomer" data-id="${c.id}">Edit</button><button class="btn sm o" data-act="acPause">${c.status==='active'?'Pause':'Resume'}</button></div>`}
function perBar(){const a=S.ac;return `<div class="ac-bar ac-noprint"><input type="month" class="input" style="width:auto;padding:6px 10px" value="${a.m}" data-acm>
  <div class="seg">${[['full','Pura mahina'],['h1','1–15'],['h2','16–'+dim(a.m)],['all','Sab'],['custom','Custom']].map(([v,l])=>`<button class="${a.per===v?'on':''}" data-act="acPer" data-v="${v}">${l}</button>`).join('')}</div>
  ${a.per==='custom'?`<input type="date" class="input" style="width:auto;padding:6px 8px" value="${acRange()[0]}" data-acf="from"> – <input type="date" class="input" style="width:auto;padding:6px 8px" value="${acRange()[1]}" data-acf="to">`:''}
  <span class="small muted">${perLabel()}</span></div>`}

/* ---------- tabs ---------- */
function khataData(c){const [from,to]=acRange();const opening=balanceUpto(c,addDays(from,-1));const E=ledger(opening,khataEntries(c,from,to));const dr=sum(E,e=>e.dr),cr=sum(E,e=>e.cr);return {from,to,opening,E,dr,cr,closing:opening+dr-cr}}
function tabKhata(c){const K=khataData(c);const dw=d=>DOW[new Date(d+'T12:00:00').getDay()];
  return perBar()+`<div class="ac-card np"><table class="ldg"><thead><tr><th>Date</th><th>Particulars</th><th class="n">Debit (bill)</th><th class="n">Credit (jama)</th><th class="n">Balance</th></tr></thead><tbody>
   <tr class="ob"><td class="dt">${S.ac.per==='all'?'':fmtShort(K.from)}</td><td>${S.ac.per==='all'?'Opening (purana baki)':'Opening balance (pichla baki)'}</td><td></td><td></td><td class="n">${inr(K.opening)}</td></tr>
   ${K.E.map(e=>`<tr class="${e.cls}"><td class="dt">${fmtShort(e.date)} <span class="small muted">${dw(e.date)}</span></td><td>${esc(e.part)}</td><td class="n">${e.dr?inr(e.dr):''}</td><td class="n c">${e.cr?inr(e.cr):''}</td><td class="n bal">${e.dr||e.cr?inr(e.bal):''}</td></tr>`).join('')||'<tr><td colspan="5" class="muted">Is period me koi entry nahi</td></tr>'}
   <tr class="tot"><td></td><td>Total · closing balance</td><td class="n">${inr(K.dr)}</td><td class="n">${inr(K.cr)}</td><td class="n" style="color:${K.closing>0.5?'var(--danger)':'var(--accent)'}">${inr(K.closing)}</td></tr></tbody></table></div>
   <div class="small muted">Debit = doodh / product ka bill aur extra charge. Credit = payment, discount, write-off. Balance plus me = customer se lena hai.</div>`}
function tabProducts(c){const [from,to]=acRange();const rows=deliveredRows(c.id,from,to);const P={},X={};
  PRODUCTS.forEach(p=>P[p.k]={n:p.k==='desi'?'Gir Cow':p.sh,u:'L',days:0,q:0,a:0});
  rows.forEach(r=>{PRODUCTS.forEach(p=>{const q=+(r.q&&r.q[p.k])||0;if(q>0){P[p.k].days++;P[p.k].q+=q;P[p.k].a+=q*(+(r.r&&r.r[p.k])||0)}});
    (r.x||[]).forEach(e=>{const key=e.k||e.pid||norm(e.base||e.n);const g=X[key]||(X[key]={n:e.k?(e.k==='ghee'?'Ghee':'Paneer'):(e.base||e.n),u:e.k?'kg':((products().find(p=>p.id===e.pid)||{}).u||''),days:0,q:0,a:0,last:0});const q=e.k?(+e.u||0):(+e.qty||1);g.days++;g.q+=q;g.a+=+e.a||0;g.last=e.rate!=null?+e.rate:(q?(+e.a||0)/q:0)})});
  const all=[...Object.values(P).filter(x=>x.q>0),...Object.values(X)];const T=sum(all,x=>x.a);
  const months=Array.from({length:6},(_,i)=>mAdd(S.ac.m,i-5));
  const mb=months.map(m=>{const b=billFor(c,m,'full');return {m,b,l:PRODUCTS.map(p=>sum(b.rows,r=>+(r.q&&r.q[p.k])||0))}});
  return perBar()+`<div class="ac-card np"><h3>Kya kya gaya · ${perLabel()}</h3><table class="ldg"><thead><tr><th>Product</th><th class="n">Din</th><th class="n">Qty</th><th class="n">Avg rate</th><th class="n">Amount</th></tr></thead><tbody>
   ${all.map(x=>`<tr><td><b>${esc(x.n)}</b></td><td class="n">${x.days}</td><td class="n">${L(x.q)} ${esc(x.u)}</td><td class="n">${x.q?inr(x.a/x.q):'–'}</td><td class="n">${inr(x.a)}</td></tr>`).join('')||'<tr><td colspan="5" class="muted">Is period me kuch nahi gaya</td></tr>'}
   <tr class="tot"><td>Total</td><td class="n">${rows.length} din</td><td></td><td></td><td class="n">${inr(T)}</td></tr></tbody></table></div>
   <div class="ac-card np"><h3>Pichle 6 mahine</h3><table class="ldg"><thead><tr><th>Mahina</th>${PRODUCTS.map(p=>`<th class="n">${p.k==='desi'?'Gir':p.sh} L</th>`).join('')}<th class="n">Din</th><th class="n">Bill</th><th class="n">Jama</th><th class="n">Mahine ke end pe baki</th></tr></thead><tbody>
   ${mb.map(x=>`<tr><td><b>${fmtMonth(x.m)}</b></td>${x.l.map(v=>`<td class="n">${v?L(v):'–'}</td>`).join('')}<td class="n">${x.b.rows.length}</td><td class="n">${inr(x.b.amount)}</td><td class="n">${inr(x.b.paid)}</td><td class="n">${inr(x.b.closing)}</td></tr>`).join('')}</tbody></table></div>`}
function tabRates(c){const rt=fullRates(c),df=defFull();const Lg=logOf(c);const today=todayISO();
  const lastCh=k=>{for(let i=Lg.length-1;i>=0;i--){const x=Lg[i];if(x.from<=today&&+x.prev[k]!==+x.rates[k])return x}return null};
  const up=Lg.filter(x=>x.from>today);
  return `<div class="ac-card np"><h3>Abhi ke rate</h3><table class="ldg"><thead><tr><th>Product</th><th class="n">Default</th><th class="n">Is customer ka</th><th class="n">Farak</th><th>Kab se / kyun</th></tr></thead><tbody>
   ${RK.map(k=>{const d=(+rt[k]||0)-(+df[k]||0);const x=lastCh(k);return `<tr><td><b>${PN[k]}</b></td><td class="n">${inr(df[k])}</td><td class="n"><b>${inr(rt[k])}</b></td><td class="n">${d?`<span class="rdiff ${d<0?'dn':'up'}">${d<0?'−':'+'}${inr(Math.abs(d))}</span>`:'–'}</td><td class="small">${x?fmtShort(x.from)+' '+x.from.slice(0,4)+(x.why?' · '+esc(x.why):''):'<span class="muted">shuru se</span>'}</td></tr>`}).join('')}</tbody></table></div>
   <div class="ac-card" id="acRateCard"><h3>Naya rate / Discount</h3><div class="small muted" style="margin-bottom:8px">Sirf jo rate badalna hai wahi badlo. Pehle ki deliveries purane rate pe rehti hain; pichli date chunoge to poochha jayega.</div>
    <div class="grid g3">${RK.map(k=>`<div class="field"><label class="f">${PN[k]} ₹</label><input class="input" type="number" inputmode="decimal" min="0" step="0.5" id="acR_${k}" value="${L(+rt[k]||0)}"></div>`).join('')}</div>
    <div class="grid g3" style="margin-top:8px"><div class="field"><label class="f">Kab se lagu</label><input class="input" type="date" id="acRF" value="${today}"></div>
     <div class="field"><label class="f">Kyun</label><select class="input" id="acRW">${['Discount (chhod raha tha)','Rate badha','Special rate','Galti sudhaar','Other'].map(x=>`<option>${x}</option>`).join('')}</select></div>
     <div class="field"><label class="f">Note</label><input class="input" id="acRN" placeholder="optional"></div></div>
    <button class="btn p" style="margin-top:10px" data-act="acRateSave">Rate save karo</button></div>
   ${up.length?`<div class="ac-card"><h3>Aane wale rate</h3>${up.map(x=>`<div class="row sp" style="padding:6px 0;border-bottom:1px solid var(--line2)"><span><b>${fmtDate(x.from)}</b> se · ${esc(rateChg(x))}${x.why?' · '+esc(x.why):''}</span><button class="btn xs o" data-act="acRateDel" data-id="${esc(x.id)}">Hatao</button></div>`).join('')}</div>`:''}
   <div class="ac-card np"><h3>Rate history</h3><table class="ldg"><thead><tr><th>Kab se</th><th>Badlav</th><th>Kyun</th><th>Kisne · kab</th></tr></thead><tbody>
    ${Lg.slice().reverse().map(x=>`<tr><td class="dt">${fmtShort(x.from)} ${x.from.slice(0,4)}</td><td>${esc(rateChg(x))}</td><td>${esc(x.why||'')}${x.note?' · '+esc(x.note):''}</td><td class="small muted">${esc(x.by||'')} · ${new Date(x.t).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}</td></tr>`).join('')||'<tr><td colspan="4" class="muted">Abhi tak rate nahi badla</td></tr>'}</tbody></table></div>
   ${(()=>{const ps=products().map(p=>({p,r:lastRate(c.id,p.id,p.n)})).filter(x=>x.r!=null);return ps.length?`<div class="ac-card np"><h3>Other products · is customer ka pichla rate</h3><table class="ldg"><tbody>${ps.map(x=>`<tr><td>${esc(x.p.n)}</td><td class="n">${inr(x.r)}</td><td class="n small muted">master ${inr(x.p.a)}</td></tr>`).join('')}</tbody></table></div>`:''})()}`}
function tabPayments(c){const P=paymentsOf(c.id).slice().reverse();const A2=adjOf(c.id).slice().reverse();
  const byMode={},byVia={};P.forEach(p=>{byMode[modeL(p)]=(byMode[modeL(p)]||0)+(+p.amt||0);const v=rcvLabel(viaOf(p)||'—');byVia[v]=(byVia[v]||0)+(+p.amt||0)});
  const chips2=o=>Object.entries(o).map(([k,v])=>`<span class="badge n" style="font-size:13px;padding:5px 10px">${esc(k)} <b style="color:var(--fg)">${inr(v)}</b></span>`).join(' ')||'<span class="small muted">—</span>';
  return `<div class="ac-card"><div class="row sp wrap"><h3>Payments · total ${inr(sum(P,p=>p.amt))}</h3><button class="btn sm p ac-noprint" data-act="addPayment" data-id="${c.id}">+ Payment lo</button></div>
    <div class="small muted" style="margin:6px 0 4px">Mode se</div>${chips2(byMode)}<div class="small muted" style="margin:10px 0 4px">Kisne liya</div>${chips2(byVia)}</div>
   <div class="ac-card np"><table class="ldg"><thead><tr><th>Date</th><th class="n">Amount</th><th>Mode</th><th>Kisne liya</th><th>Note</th><th></th></tr></thead><tbody>
    ${P.map(p=>`<tr><td class="dt">${fmtDate(p.date)} ${p.date.slice(0,4)}</td><td class="n"><b>${inr(p.amt)}</b></td><td>${modeL(p)}</td><td>${esc(rcvLabel(viaOf(p)))}${p.by&&p.via&&p.by!==p.via?` <span class="small muted">(entry: ${esc(rcvLabel(p.by))})</span>`:''}</td><td>${esc(p.note||'')}${p.proof?` <button class="btn xs o" data-act="viewProof" data-id="${p.id}">${ICONS.cam} Screenshot</button>`:''}</td><td class="ac-noprint">${isOwner()?`<button class="btn xs" data-act="delPayment" data-id="${p.id}">Delete</button>`:''}</td></tr>`).join('')||'<tr><td colspan="6" class="muted">Abhi koi payment nahi</td></tr>'}</tbody></table></div>
   <div class="ac-card np"><div class="row sp" style="padding:12px 14px 0"><h3 style="padding:0">Adjustments (discount / charge / write-off)</h3><button class="btn sm o ac-noprint" data-act="acAdjForm">+ Adjustment</button></div><table class="ldg" style="margin-top:8px"><thead><tr><th>Date</th><th>Type</th><th class="n">Amount</th><th>Note</th><th>Kisne</th><th></th></tr></thead><tbody>
    ${A2.map(a=>`<tr><td class="dt">${fmtDate(a.date)}</td><td>${ADJ_L[a.type]}</td><td class="n"><b>${a.type==='charge'?'+':'−'}${inr(a.amt)}</b></td><td>${esc(a.note||'')}</td><td class="small muted">${esc(a.by||'')}</td><td class="ac-noprint"><button class="btn xs" data-act="acAdjDel" data-id="${a.id}">Delete</button></td></tr>`).join('')||'<tr><td colspan="6" class="muted">Koi adjustment nahi</td></tr>'}</tbody></table></div>`}
function botMoves(c){const out=[];const logN=sum(c.botLog||[],x=>x.n);const open=(+c.bottles||0)-logN;
  if(open)out.push({date:custSince(c)||'',t:'Opening / purana manual sudhaar',u:open});
  (c.botLog||[]).forEach(x=>out.push({date:x.date,t:'Manual sudhaar'+(x.note?' · '+x.note:'')+(x.by?' · '+x.by:''),u:+x.n||0}));
  Object.keys(S.days).sort().forEach(d=>{const r=S.days[d].rows&&S.days[d].rows[c.id];if(!r)return;
    if(r.s==='d'&&(+r.bo||0)>0){const g=bottlesOf(r.q);if(g.b+g.s===+r.bo)out.push({date:d,t:'Delivery pe diye',s:g.s,b:g.b});else out.push({date:d,t:'Delivery pe diye (size nahi)',u:+r.bo})}
    const x=brSplit(r);if(x.s||x.b||x.u)out.push({date:d,t:'Wapas aayi',s:-x.s,b:-x.b,u:-x.u})});
  return out.sort((a,b)=>(a.date||'')<(b.date||'')?-1:1)}
function tabBottles(c){const o=bottleBalBy(c);const M=botMoves(c);let S2=0,B2=0,U2=0;
  return `<div class="ac-card"><div class="row sp wrap"><h3>Customer ke paas khali bottles: ${o.t}</h3><button class="btn sm o ac-noprint" data-act="acBotForm">Bottle sudhaar (+ / −)</button></div>
    <div class="row wrap" style="margin-top:6px"><span class="bchip">½L: ${o.s}</span><span class="bchip">1L: ${o.b}</span>${o.u?`<span class="bchip">bina size: ${o.u}</span>`:''}</div></div>
   <div class="ac-card np"><table class="ldg"><thead><tr><th>Date</th><th>Kya hua</th><th class="n">½L</th><th class="n">1L</th><th class="n">Bina size</th><th class="n">Bachi (total)</th></tr></thead><tbody>
    ${M.map(m=>{S2+=m.s||0;B2+=m.b||0;U2+=m.u||0;const f=v=>v?(v>0?'+':'')+v:'';return `<tr><td class="dt">${m.date?fmtShort(m.date):'—'}</td><td>${esc(m.t)}</td><td class="n">${f(m.s)}</td><td class="n">${f(m.b)}</td><td class="n">${f(m.u)}</td><td class="n bal">${S2+B2+U2}</td></tr>`}).join('')||'<tr><td colspan="6" class="muted">Abhi koi bottle movement nahi</td></tr>'}</tbody></table></div>`}
function tabCal(c){const m=S.ac.calM,n=dim(m),first=new Date(m+'-01T12:00:00').getDay(),today=todayISO();let del=0,skp=0,pen=0,amt=0;const since=custSince(c)||'';
  const cells=[];for(let i=0;i<first;i++)cells.push('<div class="d out"></div>');
  for(let k=1;k<=n;k++){const d=m+'-'+String(k).padStart(2,'0');const r=rowOf(d,c.id);let cls='',txt='';const qt=q=>PRODUCTS.filter(p=>+(q&&q[p.k])>0).map(p=>`${L(q[p.k])}L ${p.k==='desi'?'Gir':p.sh}`).join('<br>');
    if(r&&r.s==='d'){cls='del';del++;amt+=+r.a||0;txt=qt(r.q)+(r.x&&r.x.length?'<br>+'+r.x.length+' other':'')+`<br><b>${inr(r.a)}</b>`}
    else if(r&&r.s==='k'){cls='skip';skp++;txt='skip'}
    else if(d<today){if(dueOn(c,d)&&(!since||since<=d)){cls='pend';pen++;txt='pending'}}
    else{const it=itemsFor(c,d);if(it){cls=it.src==='pl'?'plan':'plan proj';txt=qt(it.q)+(it.x&&it.x.length?'<br>+'+it.x.length+' other':'')}}
    cells.push(`<div class="d ${cls} ${d===today?'today':''}"><div class="dn">${k}</div>${txt}</div>`)}
  return `<div class="ac-bar ac-noprint"><button class="btn sm o" data-act="acCal" data-n="-1">‹</button><b>${fmtMonth(m)}</b><button class="btn sm o" data-act="acCal" data-n="1">›</button>
    <span class="small muted">${del} din gaya · ${skp} skip${pen?` · <b style="color:var(--warn)">${pen} pending</b>`:''} · ${inr(amt)}</span></div>
   <div class="ac-card"><div class="cal">${DOW.map(w=>`<div class="h">${w}</div>`).join('')}${cells.join('')}</div>
    <div class="acleg"><span><i style="background:var(--accent-soft)"></i>Delivered</span><span><i style="background:var(--surface2)"></i>Skip</span><span><i style="background:var(--warn-soft)"></i>Pending (✓ nahi hua)</span><span><i style="background:var(--info-soft)"></i>Plan / aane wala</span></div></div>
   <div class="ac-card"><h3>Roz ka order</h3><div class="kv"><span class="muted">Doodh</span><span><b>${qtyText(orderOf(c))}</b></span><span class="muted">Other products</span><span>${esc((c.xorder||[]).map(e=>e.n+' = '+L(e.qty)).join(', ')||'—')}</span>
    <span class="muted">Schedule</span><span>${esc(schedText(c))}</span><span class="muted">Status</span><span>${c.status==='active'?'Active':'Paused'} <button class="btn xs o ac-noprint" data-act="acPause">${c.status==='active'?'Pause karo':'Resume karo'}</button></span></div></div>`}
function tabProfile(c){const m=mapOf(c);
  return `<div class="ac-card"><div class="row sp"><h3>Profile</h3><button class="btn sm o ac-noprint" data-act="editCustomer" data-id="${c.id}">Edit</button></div><div class="kv">
    <span class="muted">Phone</span><span><b>${esc(c.phone||'—')}</b></span><span class="muted">Makan</span><span>${esc(c.house||'—')}</span><span class="muted">Address</span><span>${esc(c.address||'—')}</span>
    <span class="muted">Area</span><span>${esc(c.area||'—')}</span><span class="muted">Landmark</span><span>${esc(c.landmark||'—')}</span><span class="muted">Delivery boy</span><span>${esc(c.boy||'—')}</span>
    <span class="muted">Customer since</span><span>${custSince(c)?fmtDate(custSince(c))+' '+custSince(c).slice(0,4):'—'}</span><span class="muted">Purana baki (opening)</span><span>${inr(+c.openingDue||0)}</span>
    <span class="muted">Fix comment</span><span>${esc(c.notes||'—')}</span></div>
    ${m?`<div class="row ac-noprint" style="margin-top:12px"><a class="btn p" href="${esc(m.url)}" target="_blank" rel="noopener">${ICONS.pin} ${m.exact?'Google Maps':'Address se search'}</a><button class="btn o" data-act="copy" data-t="${esc(c.name+' — '+(c.address||'')+'\n'+m.url)}">Location copy</button></div>`:''}</div>
   <div class="ac-card">${commentHistoryHtml(c)}</div>`}

/* ---------- forms (sheet, account ke upar khulte hain) ---------- */
function adjForm(){const c=S.customers[S.ac.id];if(!c)return;const bal=balanceUpto(c,null);
  openSheet('Adjustment · '+c.name,`<div class="stack"><div class="small muted">Abhi ka baki: <b>${inr(bal)}</b>. Adjustment cash / UPI collection me nahi judta.</div>
    <div class="field"><label class="f">Type</label><select class="input" id="adT"><option value="discount">Discount (baki kam)</option><option value="charge">Extra charge (baki zyada) · bottle toota, late fee</option><option value="writeoff">Write-off (baki band karo)</option></select></div>
    <div class="grid g2"><div class="field"><label class="f">Amount ₹</label><input class="input" id="adA" type="number" inputmode="decimal" min="0"></div><div class="field"><label class="f">Date</label><input class="input" id="adD" type="date" value="${todayISO()}"></div></div>
    <div class="field"><label class="f">Note</label><input class="input" id="adN" placeholder="e.g. Diwali discount / 1L bottle toota"></div>
    <label class="small" id="adPW" style="display:none;gap:6px;align-items:center"><input type="checkbox" id="adP" checked> Customer ko Pause bhi karo (chhod diya)</label>
    <button class="btn p block" data-act="acAdjSave">Save adjustment</button></div>`);
  setTimeout(()=>{const a=$('#adA');if(a)a.focus()},40)}
document.addEventListener('change',e=>{const el=e.target;if(el.id==='adT'){const c=S.customers[S.ac.id];const w=el.value==='writeoff';$('#adPW').style.display=w?'flex':'none';if(w&&c)$('#adA').value=Math.max(0,Math.round(balanceUpto(c,null)))}
  if(!el.dataset)return;if('acm' in el.dataset&&el.value){S.ac.m=el.value;if(S.ac.per==='custom'||S.ac.per==='all')S.ac.per='full';acDraw(false)}
  if(el.dataset.acf&&el.value){S.ac[el.dataset.acf]=el.value;acDraw(false)}});

/* ---------- actions ---------- */
const _oc=A.openCustomer;
A.openCustomer=function(d){if(!isOwner())return _oc(d);if(!$('#sheet').hidden)closeSheet();S.ac.list=acContextList(d.id);acOpen(d.id)};
const _go=A.go;A.go=function(d){if(S.ac.id)acClose();_go(d)};
const _lo=A.logout;A.logout=function(d){if(S.ac.id)acClose();_lo(d)};
Object.assign(A,{
  acTab(d){S.ac.tab=d.v;acDraw(true)},
  acClose(){acClose()},
  acNav(d){const i=S.ac.list.indexOf(S.ac.id)+(+d.n);const id=S.ac.list[i];if(id&&S.customers[id]){S.ac.id=id;acDraw(true);try{history.replaceState(null,'','#'+S.route+'/'+id)}catch(_){}}},
  acPer(d){S.ac.per=d.v;acDraw(false)},
  acCal(d){S.ac.calM=mAdd(S.ac.calM,+d.n);acDraw(false)},
  acPrint(){window.print()},
  acRateForm(){S.ac.tab='rates';acDraw(true);setTimeout(()=>{const card=$('#acRateCard');if(card)card.scrollIntoView({block:'start'});const i=$('#acR_cow');if(i){i.focus();i.select()}},40)},
  async acRateSave(){const c=S.customers[S.ac.id];if(!c||!isOwner())return toast('Sirf owner kar sakta hai');if(!canWrite())return toast('Aapko write permission nahi hai');
    const from=$('#acRF').value;if(!from)return toast('"Kab se" date chuno');const prev=rateOn(c,from);const nr={...prev};let ch=0;
    RK.forEach(k=>{const v=$('#acR_'+k).value;if(v==='')return;const n=+v;if(!(n>=0))return;if(n!==+prev[k]){nr[k]=n;ch++}});
    if(!ch)return toast('Koi rate nahi badla');
    const entry={id:uid(),from,prev,rates:nr,why:$('#acRW').value,note:$('#acRN').value.trim(),by:S.me||'',t:Date.now()};const today=todayISO();
    const tmp={...c,rateLog:[...(c.rateLog||[]),entry]};
    const past=Object.keys(S.days).filter(d=>d>=from&&d<=today).sort().map(d=>{const r=S.days[d].rows&&S.days[d].rows[c.id];if(!r||r.s!=='d')return null;const nw=JSON.parse(JSON.stringify(r));priceRow(tmp,d,nw);return Math.abs((+nw.a||0)-(+r.a||0))>0.005?{d,r,nw}:null}).filter(Boolean);
    let reprice=false;
    if(past.length){const o=sum(past,x=>x.r.a),n=sum(past,x=>x.nw.a);
      reprice=await confirmBox({title:`${fmtDate(from)} se ab tak ${past.length} delivered din ka bill badlega`,html:`Pehle <b>${inr(o)}</b> → naye rate se <b>${inr(n)}</b>.<div style="margin-top:8px">${past.slice(0,10).map(x=>`<div class="chg">${fmtShort(x.d)} · ${inr(x.r.a)} → ${inr(x.nw.a)}</div>`).join('')}${past.length>10?`<div class="small muted">+ ${past.length-10} aur</div>`:''}</div><div class="small muted" style="margin-top:8px">"Nahi" dabaoge to ye din purane rate pe rahenge aur naya rate ${fmtShort(addDays(past[past.length-1].d,1))} se lagega.</div>`,yes:'Haan, in din ka bhi naye rate se',no:'Nahi, purane din purane rate pe'});
      if(!reprice)entry.from=addDays(past[past.length-1].d,1)}
    const log=[...(c.rateLog||[]),entry];const patch={rateLog:log};
    if(entry.from<=today){patch.rates={...(c.rates||{})};RK.forEach(k=>{if(+nr[k]!==+prev[k])patch.rates[k]=nr[k]})}
    saveCustField(c.id,patch);
    if(reprice){for(const x of past){const before=x.r;await writeRows(x.d,{[c.id]:JSON.parse(JSON.stringify(before))});const after=rowOf(x.d,c.id);
      if(S.db){const sm=r=>({s:r.s,pl:r.pl?1:0,q:r.q||{},x:(r.x||[]).map(e=>({n:e.n,a:+e.a||0})),a:+r.a||0});S.db.doc('audit/'+x.d+'_'+uid()).set({date:x.d,cid:c.id,name:c.name,before:sm(before),after:sm(after),by:S.me||'',t:Date.now(),why:'Rate badla: '+entry.why}).catch(e=>console.error(e))}}}
    render();toast('Rate save · '+rateChg(entry)+' · '+fmtShort(entry.from)+' se'+(reprice?' · '+past.length+' din ka bill update':''))},
  async acRateDel(d){const c=S.customers[S.ac.id];if(!c)return;const x=(c.rateLog||[]).find(e=>e.id===d.id);if(!x||x.from<=todayISO())return toast('Lag chuka rate hata nahi sakte, naya rate daalo');
    if(!await confirmBox({title:'Ye aane wala rate hatayein?',html:esc(fmtDate(x.from)+' se · '+rateChg(x)),yes:'Haan, hatao'}))return;saveCustField(c.id,{rateLog:(c.rateLog||[]).filter(e=>e.id!==d.id)});render()},
  acAdjForm(){if(!isOwner())return toast('Sirf owner kar sakta hai');adjForm()},
  async acAdjSave(){const c=S.customers[S.ac.id];if(!c)return;if(!canWrite())return toast('Aapko write permission nahi hai');const type=$('#adT').value,amt=+$('#adA').value,date=$('#adD').value||todayISO(),note=$('#adN').value.trim();
    if(!(amt>0))return toast('Amount likho');const pause=type==='writeoff'&&$('#adP').checked;const bal=balanceUpto(c,null);const nb=bal+(type==='charge'?amt:-amt);
    if(!await confirmBox({title:`${ADJ_L[type]} ${type==='charge'?'+':'−'}${inr(amt)} · ${esc(c.name)}`,html:`Baki ${inr(bal)} → <b>${inr(nb)}</b>${note?'<div class="small muted">'+esc(note)+'</div>':''}${pause?'<div class="small" style="margin-top:6px">Customer Pause bhi hoga.</div>':''}`,yes:'Haan, save'}))return;
    const id=uid();const doc={cid:c.id,date,type,amt,note,by:S.me||'',t:Date.now()};S.adjust[id]={id,...doc};closeSheet();render();
    await queue('adj:'+id,()=>S.db.doc('adjust/'+id).set(doc));if(pause&&c.status==='active')await saveCustomer({...S.customers[c.id],status:'paused'});toast(ADJ_L[type]+' save · baki '+inr(balanceUpto(S.customers[c.id],null)))},
  acAdjDel(d,el){if(!isOwner())return;if(el.dataset.c!=='1'){el.dataset.c='1';el.textContent='Pakka delete?';el.classList.add('d');setTimeout(()=>{if(el.isConnected){el.dataset.c='';el.textContent='Delete';el.classList.remove('d')}},3000);return}
    delete S.adjust[d.id];render();queue('adj:'+d.id,()=>S.db.doc('adjust/'+d.id).delete()).then(()=>toast('Adjustment hata diya'))},
  acBotForm(){const c=S.customers[S.ac.id];if(!c)return;openSheet('Bottle sudhaar · '+c.name,`<div class="stack"><div class="small muted">Abhi customer ke paas: <b>${bottleBal(c)}</b>. Delivery aur wapasi apne aap judti hai; ye sirf galti / opening sudhaar ke liye.</div>
    <div class="grid g2"><div class="field"><label class="f">Kitni (+ ya −)</label><input class="input" id="bgN" type="number" step="1" placeholder="e.g. -2"></div><div class="field"><label class="f">Date</label><input class="input" id="bgD" type="date" value="${todayISO()}"></div></div>
    <div class="field"><label class="f">Note</label><input class="input" id="bgT" placeholder="e.g. purani 2 bottle wapas mili"></div><button class="btn p block" data-act="acBotSave">Save</button></div>`)},
  acBotSave(){const c=S.customers[S.ac.id];if(!c)return;const n=Math.round(+$('#bgN').value||0);if(!n)return toast('Number likho (+ ya −)');if(bottleBal(c)+n<0)return toast('Balance 0 se kam nahi ho sakta');
    saveCustField(c.id,{bottles:(+c.bottles||0)+n,botLog:[...(c.botLog||[]),{date:$('#bgD').value||todayISO(),n,note:$('#bgT').value.trim(),by:S.me||'',t:Date.now()}]});closeSheet();render();toast('Bottle sudhaar save')},
  acPause(){const c=S.customers[S.ac.id];if(!c)return;if(!isOwner())return toast('Sirf owner kar sakta hai');saveCustomer({...c,status:c.status==='active'?'paused':'active'}).then(()=>toast(c.status==='active'?'Pause ho gaya':'Resume ho gaya'))},
  async acXlsx(){const c=S.customers[S.ac.id];if(!c)return;let XL;try{XL=await loadXLSX()}catch(e){return toast(e.message)}const K=khataData(c);
    const aoa=[[(settings().company||'Oritic')+' · Customer statement'],['Customer',c.name],['Mobile',c.phone||''],['Address',[c.house,c.address,c.area].filter(Boolean).join(', ')],['Period',perLabel()],[],['Date','Particulars','Debit ₹','Credit ₹','Balance ₹'],
      ['',S.ac.per==='all'?'Opening (purana baki)':'Opening balance','','',Math.round(K.opening*100)/100],...K.E.map(e=>[e.date,e.part,e.dr||'',e.cr||'',e.dr||e.cr?Math.round(e.bal*100)/100:'']),['','Total · closing',Math.round(K.dr*100)/100,Math.round(K.cr*100)/100,Math.round(K.closing*100)/100]];
    const wb=XL.utils.book_new();const ws=XL.utils.aoa_to_sheet(aoa);ws['!cols']=[{wch:12},{wch:60},{wch:12},{wch:12},{wch:12}];XL.utils.book_append_sheet(wb,ws,'Statement');
    saveFile(`statement-${norm(c.name)||c.id}-${K.from.slice(0,7)}.xlsx`,new Blob([XL.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))}
});

/* ---------- refresh with data, keyboard ---------- */
let acPend=false;
const typingIn=a=>a&&a.closest&&a.closest('#acct')&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
window.afterRender=()=>{
  if(S.acPending&&S.role&&isOwner()&&S.customers[S.acPending]){const id=S.acPending;S.acPending=null;S.ac.list=acContextList(id);acOpen(id);return}
  if(!S.ac.id)return;if(typingIn(document.activeElement)){acPend=true;return}acDraw(false)};
document.addEventListener('focusout',e=>{if(!acPend)return;setTimeout(()=>{if(acPend&&!typingIn(document.activeElement)){acPend=false;if(S.ac.id)acDraw(false)}},150)});
document.addEventListener('keydown',e=>{if(!S.ac.id)return;
  if(!$('#sheet').hidden||($('#cbox')&&!$('#cbox').hidden)||($('#kp')&&!$('#kp').hidden)||$('#acpop'))return;
  const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();acClose();return}
  if(typing||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();A.acNav({n:e.key==='ArrowLeft'?-1:1});return}
  if(e.key==='p'){e.preventDefault();e.stopPropagation();A.addPayment({id:S.ac.id});return}
  if(['[',']','/','g','n'].includes(e.key))e.stopPropagation()},true);
})();
