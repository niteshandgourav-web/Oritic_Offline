/* v4: office ke 3 kaam (js/office.js)
   1. Naya order (call pe): ek screen me customer + order + rate + start date. Purana number likho to wahi customer khul jata hai.
   2. Galti pakdo: ₹0 price, ajeeb rate, ajeeb quantity, purane pending din, bina rate ke customer, double customer.
   3. Mahine ka discount: customer.disc={t:'pct'|'amt',v}. "Lagao" dabane pe us mahine ka ek discount adjustment banta hai
      (id md_<cid>_<YYYY-MM>, dobara lagao to wahi update hota hai, double nahi hota). Bill ka hisab wahi purana rehta hai. */
(function(){
const css=document.createElement('style');
css.textContent=`
.of-card{background:var(--surface);border:1px solid var(--line2);border-radius:var(--r);padding:12px 14px;margin-bottom:10px}
.of-h{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.of-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px 10px}
.of-ln{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;justify-content:space-between;border:1px solid var(--line2);border-radius:var(--rs);padding:8px 10px;margin-bottom:6px}
.of-ln.on{border-color:var(--accent);background:var(--accent-soft)}
.of-nm b{display:block;font-size:15px}.of-ctl{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.of-ctl .step input{width:58px}
.of-sum{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 12px;align-items:center;padding:10px 14px;border-radius:var(--r);background:var(--hero1);color:var(--hero-fg);margin:10px 0;box-shadow:var(--shadow)}
.of-sum b{font-size:20px}.of-sum small{color:var(--hero-muted)}
.of-ok,.of-warn,.of-ban{display:block;width:100%;text-align:left;border-radius:var(--rs);padding:10px 12px;margin:0 0 10px;font:inherit;font-size:14px}
.of-ok{background:var(--accent-soft);color:var(--accent-ink);border:1px solid var(--accent)}
.of-warn{background:var(--warn-soft);color:var(--warn);border:1px solid var(--warn);margin-top:8px}
.of-ban{background:var(--info-soft);color:var(--info);border:1px solid var(--info);cursor:pointer}
.of-row{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 0;border-top:1px solid var(--line2);font-size:14px}
.of-row .t{min-width:0}.of-tip{font-size:13px;color:var(--muted);margin:8px 0 2px}
`;
document.head.appendChild(css);
const r2=n=>Math.round((+n||0)*100)/100;
const num=v=>{const n=parseFloat(String(v).replace(',','.'));return n>0?n:0};
const pn=p=>p.k==='desi'?'Gir / Desi cow milk':p.l;
const monthL=m=>new Date(m+'-01T12:00:00').toLocaleDateString('en-IN',{month:'long',year:'numeric'});

ROUTES.push({id:'neworder',l:'Naya order',t:'Naya order (call pe)'},{id:'galti',l:'Galti pakdo',t:'Galti pakdo · galat entries dhoondo'});
ICONS.neworder='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/><path d="M17 3v6M14 6h6"/></svg>';
ICONS.galti='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v3.5M11 14h.01"/></svg>';
if(typeof NAVG!=='undefined'){NAVG[0][1].splice(1,0,'neworder');NAVG[1][1].push('galti')}
window.EXTRA_VIEWS={...(window.EXTRA_VIEWS||{}),neworder:()=>vNew(),galti:()=>vGalti()};

/* ================= 1. Naya order ================= */
const blank=()=>({id:'',phone:'',name:'',area:'',address:'',landmark:'',map:'',boy:boys()[0]||'',sched:'daily',since:addDays(todayISO(),1),q:{},r:{},x:{},xr:{},pq:'',notes:'',dt:'',dv:'',td:'',tp:'',saved:null});
let N=null;
const rateFor=k=>{const o=N.id&&S.customers[N.id];if(o)return +ratesOf(o)[k]||0;return num(N.r[k])||+defRates()[k]||0};
function foundHtml(){const ph=cleanPhone(N.phone);if(!ph)return '';if(ph.length<10)return '<div class="small muted" style="margin-top:6px">Mobile 10 digit ka likho</div>';
  const c=Object.values(S.customers).find(x=>x.phone===ph&&x.id!==N.id);if(!c)return N.id?'':'<div class="small muted" style="margin-top:6px">Naya number hai — naya customer banega.</div>';
  return `<div class="of-warn">Ye number pehle se hai: <b>${esc(c.name)}</b> · ${esc(c.area||'')} · ${esc(c.boy||'')} · ${c.status==='active'?'Active':'Paused'}
   <div class="row wrap" style="margin-top:6px;gap:6px"><button type="button" class="btn sm p" data-act="noLoad" data-id="${c.id}">Isi customer ka order badlo</button><button type="button" class="btn sm o" data-act="noAc" data-id="${c.id}">Account kholo</button></div></div>`}
const xRate=p=>N.xr[p.id]!=null&&N.xr[p.id]!==''?num(N.xr[p.id]):(+p.a||0);
function dayValue(){let a=0;PRODUCTS.forEach(p=>a+=(+N.q[p.k]||0)*rateFor(p.k));products().forEach(p=>a+=(+N.x[p.id]||0)*xRate(p));return r2(a)}
function sumHtml(){const d=dayValue();const days=N.sched==='alternate'?15:30;const m=d*days;const dv=num(N.dv);const disc=N.dt==='pct'?Math.round(m*dv/100):N.dt==='amt'?Math.min(dv,m):0;
  const td=Math.round(num(N.td)),tp=num(N.tp);const tr=!N.id&&td>0&&tp>0&&tp<100?`<span style="flex-basis:100%"><small>Trial ke ${td} din: doodh ${L(tp)}% sasta, phir normal rate. ${fmtShort(addDays(N.since||todayISO(),td-1))} ke baad panel yaad dilayega ki customer se poochho.</small></span>`:'';
  return tr+`<span>Ek din ka bill<br><b>${inr(d)}</b></span><span style="text-align:right"><small>Mahine ka andaza (${days} din)</small><br><b>${inr(m-disc)}</b>${disc?` <small>(discount ${inr(disc)})</small>`:''}</span>`}
function vNew(){if(!N)N=blank();const dr=defRates();const pm=products().filter(p=>p.on!==false);const old=N.id&&S.customers[N.id];
  const areas=[...new Set(Object.values(S.customers).map(c=>c.area).filter(Boolean))].sort();
  const F=(l,f,type,ph,x)=>`<div class="field"><label class="f">${l}</label><input class="input" data-no="${f}" type="${type||'text'}" value="${esc(N[f])}" placeholder="${ph||''}" ${x||''}></div>`;
  return {html:`
   ${N.saved?`<div class="of-ok">✓ <b>${esc(N.saved.name)}</b> save ho gaya. ${fmtShort(N.saved.since)} se Delivery sheet me dikhega (${esc(N.saved.boy||'boy nahi chuna')}). <button type="button" class="btn xs o" data-act="noAc" data-id="${N.saved.id}">Account kholo</button></div>`:''}
   ${old?`<div class="of-ok">Purana customer khula hai: <b>${esc(old.name)}</b>. Save karne pe isi ka order badlega. <button type="button" class="btn xs o" data-act="noClear">Naya form</button></div>`:''}
   <div class="of-card"><div class="of-h">1 · Customer</div><div class="of-g">
     ${F('Mobile (pehle ye likho)','phone','tel','10 digit','inputmode="numeric" autocomplete="off"')}${F('Naam','name','text','Customer ka naam')}
     ${F('Area','area','text','e.g. Raja Park','list="noAreas"')}${F('Address','address','text','Makan no., gali, colony')}
     ${F('Landmark','landmark','text','e.g. mandir ke saamne')}${F('Google Map link','map','text','https://maps…')}</div>
     <datalist id="noAreas">${areas.map(a=>`<option value="${esc(a)}">`).join('')}</datalist><div id="noFound">${foundHtml()}</div></div>
   <div class="of-card"><div class="of-h">2 · Kya chahiye (roz ka order)</div>
     ${PRODUCTS.map(p=>{const q=+N.q[p.k]||0;return `<div class="of-ln ${q>0?'on':''}"><div class="of-nm"><b>${pn(p)}</b><span class="small muted">List rate ₹${L(dr[p.k])}/L</span></div>
       <div class="of-ctl">${old?`<span class="ee-u">₹${L(rateFor(p.k))}/L</span>`:`<span class="ee-u">Rate ₹</span><input class="ee-in" type="number" inputmode="decimal" min="0" data-no="r.${p.k}" value="${esc(N.r[p.k]||'')}" placeholder="${L(dr[p.k])}" aria-label="${pn(p)} rate"><span class="ee-u">/L</span>`}
        <div class="step"><button type="button" data-act="noStep" data-k="${p.k}" data-n="-0.5" aria-label="Kam">−</button><input type="number" inputmode="decimal" step="0.5" min="0" data-no="q.${p.k}" value="${L(q)}" aria-label="${pn(p)} litre"><button type="button" data-act="noStep" data-k="${p.k}" data-n="0.5" aria-label="Zyada">+</button></div><span class="ee-u">L</span></div></div>`}).join('')}
     ${old?`<div class="small muted">Doodh ka rate badalna ho to: <button type="button" class="btn xs o" data-act="noAc" data-id="${old.id}">Account kholo → Rate badlo</button></div>`:'<div class="small muted">Rate khali chhodo = list rate lagega. Is customer ko alag rate dena ho to likh do.</div>'}
     <div class="of-h" style="margin-top:12px">Roz ke other products (zaroori nahi)</div>
     ${pm.filter(p=>p.id in N.x).map(p=>`<div class="of-ln on"><div class="of-nm"><b>${esc(p.n)}</b><span class="small muted">List rate ₹${L(p.a)}/${esc(p.u||'pc')}</span></div><div class="of-ctl"><span class="ee-u">Rate ₹</span><input class="ee-in" type="number" inputmode="decimal" min="0" step="any" data-no="xr.${esc(p.id)}" value="${esc(N.xr[p.id]!=null?N.xr[p.id]:'')}" placeholder="${L(p.a)}" aria-label="${esc(p.n)} rate"><span class="ee-u">/${esc(p.u||'pc')}</span>
        <input class="ee-in" type="number" inputmode="decimal" min="0" step="any" data-no="x.${esc(p.id)}" value="${L(N.x[p.id])}" aria-label="${esc(p.n)} quantity"><span class="ee-u">${esc(p.u||'pc')}</span><button type="button" class="ee-del" data-act="noXDel" data-id="${esc(p.id)}" aria-label="Hatao">✕</button></div></div>`).join('')}
     <input class="input" id="noQ" type="search" placeholder="🔍 Product dhoondo (paneer, ghee, dahi…)" value="${esc(N.pq||'')}" autocomplete="off" style="margin:4px 0 8px" aria-label="Product dhoondo">
     <div class="chips" id="noChips">${pm.filter(p=>!(p.id in N.x)).map(p=>`<button type="button" class="chip" data-act="noX" data-id="${esc(p.id)}" data-n="${p.u==='kg'?0.25:1}" data-noc="${esc(p.n.toLowerCase())}" ${N.pq&&!p.n.toLowerCase().includes(N.pq.toLowerCase())?'hidden':''}>+ ${esc(p.n)} ₹${L(p.a)}/${esc(p.u||'pc')}</button>`).join('')}</div>
     <details style="margin-top:10px" ${N.np?'open':''}><summary class="small" style="cursor:pointer;font-weight:700">+ Naya product (jo list me nahi hai)</summary>
      <div class="of-ctl" style="margin-top:8px"><input class="input" id="noPN" placeholder="Product ka naam" style="flex:1 1 160px" aria-label="Naya product naam"><select class="input" id="noPU" style="flex:0 0 90px" aria-label="Unit"><option value="kg">kg</option><option value="pc">pc</option><option value="L">L</option></select><span class="ee-u">₹</span><input class="ee-in" id="noPA" type="number" inputmode="decimal" min="0" placeholder="rate" aria-label="Rate"><button type="button" class="btn sm p" data-act="noNewP">Banao + jodo</button></div>
      <div class="small muted" style="margin-top:4px">Ye product Product master me bhi jud jayega, agli baar list me milega.</div></details></div>
   <div class="of-card"><div class="of-h">3 · Kab se, kaun dega</div><div class="of-g">
     ${F('Kab se shuru','since','date')}
     <div class="field"><label class="f">Kaise</label><select class="input" data-no="sched"><option value="daily" ${N.sched==='daily'?'selected':''}>Roz</option><option value="alternate" ${N.sched==='alternate'?'selected':''}>Ek din chhod ke</option></select></div>
     <div class="field"><label class="f">Delivery boy</label><select class="input" data-no="boy">${boys().map(b=>`<option ${N.boy===b?'selected':''}>${esc(b)}</option>`).join('')}</select></div>
     <div class="field"><label class="f">Mahine ka discount</label><select class="input" data-no="dt"><option value="" ${!N.dt?'selected':''}>Koi nahi</option><option value="pct" ${N.dt==='pct'?'selected':''}>% (bill ka)</option><option value="amt" ${N.dt==='amt'?'selected':''}>₹ fix har mahine</option></select></div>
     ${F('Discount kitna','dv','number','e.g. 5','inputmode="decimal" min="0"')}${old?'':F('Trial offer: kitne din sasta','td','number','e.g. 3 (khali = trial nahi)','inputmode="numeric" min="0"')+F('Trial me doodh kitna % sasta','tp','number','e.g. 20','inputmode="decimal" min="0"')}${F('Note (boy ko dikhega)','notes','text','e.g. gate pe rakhna, trial customer')}</div></div>
   <div class="of-sum" id="noSum">${sumHtml()}</div>
   <button type="button" class="btn p block" data-act="noSave">${old?'Order badlo (save)':'Customer + order save karo'}</button>
   <button type="button" class="btn o block" data-act="noClear" style="margin-top:8px">Form khali karo</button>`}}
document.addEventListener('input',e=>{const t=e.target,f=t.dataset&&t.dataset.no;if(!f||!N)return;const v=t.value;
  if(f.indexOf('q.')===0)N.q[f.slice(2)]=num(v);else if(f.indexOf('r.')===0)N.r[f.slice(2)]=v;else if(f.indexOf('xr.')===0)N.xr[f.slice(3)]=v;else if(f.indexOf('x.')===0)N.x[f.slice(2)]=num(v);else N[f]=v;
  if(f==='phone'){const el=$('#noFound');if(el)el.innerHTML=foundHtml()}
  const s=$('#noSum');if(s)s.innerHTML=sumHtml()});
document.addEventListener('input',e=>{const t=e.target;if(t.id!=='noQ'||!N)return;N.pq=t.value.trim();const q=N.pq.toLowerCase();document.querySelectorAll('#noChips [data-noc]').forEach(b=>b.hidden=!!q&&!b.dataset.noc.includes(q))});

/* ================= 2. Galti pakdo ================= */
const GP=[['price0','Product price ₹0','Product diya gaya par price nahi likha, isliye bill kam ban raha hai.'],
 ['rate','Doodh ka rate ajeeb','Rate ₹0 hai, ya us customer ke aam rate se 25% se zyada alag hai.'],
 ['qty','Quantity ajeeb','Us customer ki aam quantity se 3 guna ya zyada. Sahi ho to chhod do.'],
 ['pend','Purane din pending','Pichle dino me in gharon pe na "Diya" laga na "Skip". Jab tak nahi lagega, bill me nahi judega.'],
 ['norate','Bina rate ke customer','Order hai par rate 0 hai. Bill ₹0 banega.'],
 ['dup','Double customer','Ek hi mobile number do customers me hai. Ho sakta hai ek hi ghar do baar chadh gaya ho.']];
function galti(){const today=todayISO();const G={price0:[],rate:[],qty:[],pend:[],norate:[],dup:[]};const byC={};
  for(const d in S.days){const rows=S.days[d].rows||{};for(const cid in rows){const r=rows[cid];if(r&&r.s==='d'&&S.customers[cid])(byC[cid]=byC[cid]||[]).push([d,r])}}
  for(const cid in byC){PRODUCTS.forEach(p=>{const rs=byC[cid].filter(x=>+(x[1].q&&x[1].q[p.k])>0);if(!rs.length)return;const nm=p.k==='desi'?'Gir':p.sh;
    const cnt={};rs.forEach(x=>{const v=+(x[1].r&&x[1].r[p.k])||0;cnt[v]=(cnt[v]||0)+1});const usual=+Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];
    const qs=rs.map(x=>+x[1].q[p.k]).sort((a,b)=>a-b);const med=qs[Math.floor((qs.length-1)/2)];
    rs.forEach(([d,r])=>{const rt=+(r.r&&r.r[p.k])||0,q=+r.q[p.k];
      if(!rt)G.rate.push({d,cid,t:nm+' ka rate ₹0'});else if(usual&&rs.length>=5&&Math.abs(rt-usual)/usual>0.25)G.rate.push({d,cid,t:`${nm} ₹${L(rt)}/L (aam taur pe ₹${L(usual)})`});
      if(rs.length>=5&&q>=med*3&&q-med>=2)G.qty.push({d,cid,t:`${nm} ${L(q)} L (aam taur pe ${L(med)} L)`})})})}
  if(window.eeZeroList)eeZeroList().forEach(o=>G.price0.push({d:o.d,cid:o.cid,t:o.z.base+' '+(o.z.u==='kg'?fq(o.z.qty,'kg'):L(o.z.qty)+' '+o.z.u)+' · price nahi'}));
  Object.keys(S.days).filter(d=>d<today&&Object.keys(S.days[d].rows||{}).length).forEach(d=>{const n=todaysList(d,'all').filter(({c,r})=>(!r||r.s==='p')&&c.status==='active'&&(typeof existedOn==='function'?existedOn(c,d):(c.since||'')<=d)&&(PRODUCTS.some(p=>+(c.order&&c.order[p.k])>0)||(c.xorder||[]).length)).length;if(n)G.pend.push({d,n})});
  const ph={};Object.values(S.customers).forEach(c=>{if(c.status==='active'&&PRODUCTS.some(p=>+(c.order&&c.order[p.k])>0&&!(+ratesOf(c)[p.k]>0)))G.norate.push({cid:c.id,t:'order hai, rate 0'});if(c.phone)(ph[c.phone]=ph[c.phone]||[]).push(c)});
  Object.values(ph).forEach(l=>{if(l.length>1)l.forEach(c=>G.dup.push({cid:c.id,t:'Mobile '+c.phone+' · saath me: '+l.filter(x=>x!==c).map(x=>x.name).join(', ')}))});
  ['price0','rate','qty','pend'].forEach(k=>G[k].sort((a,b)=>a.d<b.d?1:a.d>b.d?-1:0));return G}
window.galtiCount=()=>{const G=galti();return Object.values(G).reduce((s,l)=>s+l.length,0)};
function vGalti(){const G=galti();const tot=Object.values(G).reduce((s,l)=>s+l.length,0);
  if(!tot)return {html:'<div class="of-ok">Sab theek hai 👍 Koi galat entry nahi mili.</div>'};
  const cur=G[S.gp]&&G[S.gp].length?S.gp:GP.find(g=>G[g[0]].length)[0];const g=GP.find(x=>x[0]===cur);const list=G[cur];const nm=id=>esc((S.customers[id]||{}).name||'');
  return {html:`<div class="chips">${GP.map(x=>`<button type="button" class="chip ${cur===x[0]?'on':''}" data-act="gpTab" data-v="${x[0]}" ${G[x[0]].length?'':'disabled style="opacity:.45"'}>${x[1]} · ${G[x[0]].length}</button>`).join('')}</div>
   <div class="of-tip">${g[2]}</div>
   <div class="of-card">${cur==='price0'?'<button type="button" class="btn sm p" data-act="eeZero" style="margin-bottom:6px">Product ke hisab se ek saath theek karo</button>':''}
    ${list.slice(0,200).map(o=>cur==='pend'?`<div class="of-row"><span class="t"><b>${fmtDate(o.d)}</b> · ${o.n} ghar pending</span><button type="button" class="btn xs o" data-act="gpSheet" data-d="${o.d}">Us din ki sheet kholo</button></div>`
      :o.d?`<div class="of-row"><span class="t"><b>${fmtShort(o.d)}</b> · ${nm(o.cid)} · ${esc(o.t)}</span><button type="button" class="btn xs o" data-act="eeOpen" data-id="${o.cid}" data-date="${o.d}" aria-label="Entry kholo">✎</button></div>`
      :`<div class="of-row"><span class="t"><b>${nm(o.cid)}</b> · ${esc(o.t)}</span><button type="button" class="btn xs o" data-act="noAc" data-id="${o.cid}">Account</button></div>`).join('')}
    ${list.length>200?`<div class="small muted" style="padding-top:8px">Pehli 200 dikh rahi hain (kul ${list.length}). Inhe theek karo to baaki aa jayengi.</div>`:''}</div>`}}

/* ================= 3. Mahine ka discount ================= */
const discOf=c=>c&&c.disc&&+c.disc.v>0?c.disc:null;
const discText=d=>d.t==='pct'?L(d.v)+'%':'₹'+L(d.v)+' har mahine';
window.discText=discText;
function mdRows(m){const to=periodRange(m,'full')[1];const date=to>todayISO()?todayISO():to;const out=[];
  Object.values(S.customers).forEach(c=>{const id='md_'+c.id+'_'+m;const cur=(S.adjust||{})[id];const d=discOf(c);if(!d&&!cur)return;const bill=billFor(c,m,'full').amount;
    const amt=!d?0:d.t==='pct'?Math.round(bill*d.v/100):Math.min(+d.v,Math.round(bill));if(!amt&&!cur)return;out.push({c,d,bill,amt,id,cur:cur?+cur.amt||0:0,date})});
  return out.sort((a,b)=>a.c.name.localeCompare(b.c.name))}
function mdSheet(m){const R=mdRows(m);const ch=R.filter(r=>r.amt!==r.cur);
  openSheet('Mahine ka discount',`<div class="field"><label class="f" for="mdM">Kis mahine ka</label><input class="input" type="month" id="mdM" value="${m}" max="${todayISO().slice(0,7)}"></div>
   <div class="small muted" style="margin:6px 0 10px">Discount us mahine ke bill pe lagta hai aur khate me "Discount" ki ek line banti hai. Mahina khatam hone ke baad lagana sabse sahi hai. Dobara dabane se double nahi hota, sirf naya hisab update hota hai.</div>
   ${R.map(r=>`<div class="of-row"><span class="t"><b>${esc(r.c.name)}</b> · ${r.d?discText(r.d):'discount hata diya'}<br><span class="small muted">Bill ${inr(r.bill)} → discount <b>${inr(r.amt)}</b></span></span><span class="badge ${r.amt===r.cur?'g':r.cur?'y':'b'}">${r.amt===r.cur?'laga hua':r.cur?'pehle '+inr(r.cur):'naya'}</span></div>`).join('')||'<div class="muted">Is mahine kisi ko discount nahi banta. Customer ke account me "Mahine ka discount" set karo.</div>'}
   ${R.length?`<div class="ee-tot"><span>${monthL(m)} · kul discount</span><b>${inr(R.reduce((s,r)=>s+r.amt,0))}</b></div>`:''}
   ${ch.length?`<button type="button" class="btn p block" data-act="mdGo">${ch.length} customers pe lagao</button>`:R.length?'<div class="of-ok" style="margin-top:8px">Sab pe laga hua hai ✓</div>':''}`);
  const i=$('#mdM');if(i)i.onchange=()=>{if(i.value)mdSheet(i.value)}}
const defMonth=()=>{const t=todayISO();return +t.slice(8)<=10?addDays(t.slice(0,8)+'01',-1).slice(0,7):t.slice(0,7)};
const _vB=vBills;vBills=function(){const o=_vB();if(!isOwner()||!o||typeof o.html!=='string')return o;const n=Object.values(S.customers).filter(discOf).length;
  return n?{...o,html:`<button type="button" class="of-ban" data-act="mdOpen">🏷 <b>${n} customers</b> ko mahine ka discount milta hai. <u>Discount lagao / dekho</u></button>`+o.html}:o};

Object.assign(A,{
  noStep(d){if(!N)return;N.q[d.k]=Math.max(0,r2((+N.q[d.k]||0)+(+d.n)));render()},
  noX(d){if(!N)return;N.x[d.id]=+d.n||0;N.pq='';render();const f=document.querySelector('[data-no="x.'+CSS.escape(d.id)+'"]');if(f){f.focus();f.select()}},
  noXDel(d){if(!N)return;delete N.x[d.id];delete N.xr[d.id];render()},
  noNewP(){if(!N)return;const n=($('#noPN').value||'').trim(),u=$('#noPU').value,a=num($('#noPA').value);if(!n)return toast('Product ka naam likho');
    let p=findProd(n);if(!p){p={id:'p'+uid(),n,u,a,on:true};saveSettings({...settings(),products:[...products(),p]})}
    N.x[p.id]=p.u==='kg'?0.25:1;N.np=0;render();toast(p.n+' jud gaya')},
  noClear(){N=blank();render();window.scrollTo(0,0)},
  noAc(d){if(window.acOpen)acOpen(d.id)},
  noLoad(d){const c=S.customers[d.id];if(!c)return;N={...blank(),id:c.id,phone:c.phone||'',name:c.name||'',area:c.area||'',address:c.address||'',landmark:c.landmark||'',map:c.map||'',boy:c.boy||'',sched:c.schedule==='alternate'?'alternate':'daily',since:todayISO(),q:{...orderOf(c)},x:{},notes:c.notes||'',dt:discOf(c)?c.disc.t:'',dv:discOf(c)?String(c.disc.v):''};
    (c.xorder||[]).forEach(e=>{const p=(e.pid&&products().find(x=>x.id===e.pid))||findProd(e.n);if(p){N.x[p.id]=+e.qty||0;if(e.rate!=null)N.xr[p.id]=String(e.rate)}});render()},
  async noSave(){if(!N)return;if(!isOwner())return toast('Sirf owner / office kar sakta hai');const name=N.name.trim(),ph=cleanPhone(N.phone);const old=N.id?S.customers[N.id]:null;
    if(!name)return toast('Customer ka naam likho');if(ph&&ph.length!==10)return toast('Mobile 10 digit ka hona chahiye');
    if(!old&&ph&&Object.values(S.customers).some(c=>c.phone===ph))return toast('Ye number pehle se hai — upar "Isi customer ka order badlo" dabao');
    const order={};for(const p of PRODUCTS){const q=+N.q[p.k]||0;if(Math.round(q*2)!==q*2)return toast(pn(p)+': quantity 0.5 ke step me likho');order[p.k]=q}
    const xorder=products().filter(p=>+N.x[p.id]>0).map(p=>{const o={n:p.n,pid:p.id,qty:+N.x[p.id]};if(N.xr[p.id]!=null&&N.xr[p.id]!=='')o.rate=num(N.xr[p.id]);return o});
    if(!PRODUCTS.some(p=>order[p.k]>0)&&!xorder.length)return toast('Order me kuch to chuno');
    if(!N.since)return toast('Kab se shuru karna hai, date chuno');
    const dv=num(N.dv);if(N.dt==='pct'&&dv>50)return toast('Discount 50% se zyada nahi ho sakta');const disc=N.dt&&dv>0?{t:N.dt,v:dv}:null;
    const today=todayISO();const base={name,phone:ph,area:N.area.trim(),address:N.address.trim(),landmark:N.landmark.trim(),map:N.map.trim(),boy:N.boy,schedule:N.sched,order,xorder,notes:N.notes.trim(),disc,status:'active'};
    let body;
    if(old){body={...old,...base};if(old.status!=='active')body.resumedAt=today}
    else{const rates={...defRates()};PRODUCTS.forEach(p=>{const v=num(N.r[p.k]);if(v>0)rates[p.k]=v});
      const seq=Math.max(0,...Object.values(S.customers).filter(c=>c.boy===N.boy).map(c=>+c.seq||0))+10;
      body={...base,house:'',wdays:[],rates,openingDue:0,bottles:0,since:N.since,createdAt:today,seq};
      /* trial: kuch din sasta rate, phir chhutti jab tak office "Continue" ya "Band" na dabaye */
      const td=Math.round(num(N.td)),tp=num(N.tp);if(td>0&&tp>0){if(tp>=100)return toast('Trial discount 100% se kam rakho');const tr={};PRODUCTS.forEach(p=>tr[p.k]=Math.round(rates[p.k]*(100-tp))/100);
        const to=addDays(N.since,td-1);body.trial={from:N.since,to,days:td,pct:tp,normal:rates};body.rates=tr;body.holds=[{from:addDays(to,1),to:'2099-12-31',note:'Trial khatam'}]}}
    /* start date aage ki hai to tab tak chhutti, taki pehle sheet me na aaye */
    const holds=(body.holds||[]).filter(h=>h.note!=='Shuru hone se pehle');if(old&&old.trial){body.trial=old.trial;body.rates=old.rates}if(N.since>addDays(today,1))holds.push({from:today,to:addDays(N.since,-1),note:'Shuru hone se pehle'});body.holds=holds;
    const id=await saveCustomer(body);if(!id)return;N={...blank(),saved:{id,name,since:N.since,boy:N.boy}};render();window.scrollTo(0,0);toast(name+' save ho gaya')},
  gpTab(d){S.gp=d.v;render()},
  gpSheet(d){S.pld=d.d;S.route='sheet';render();window.scrollTo(0,0)},
  mdOpen(){if(!isOwner())return;mdSheet(defMonth())},
  async mdGo(){if(!canWrite())return toast('Aapko write permission nahi hai');const m=($('#mdM')||{}).value;if(!m)return;const ch=mdRows(m).filter(r=>r.amt!==r.cur);if(!ch.length)return;
    S.adjust=S.adjust||{};const ps=ch.map(r=>{if(r.amt>0){const doc={cid:r.c.id,date:r.date,type:'discount',amt:r.amt,note:'Mahine ka discount '+discText(r.d)+' · '+monthL(m),by:S.me||'',t:Date.now(),auto:1};S.adjust[r.id]={id:r.id,...doc};return queue('adj:'+r.id,()=>S.db.doc('adjust/'+r.id).set(doc))}
      delete S.adjust[r.id];return queue('adj:'+r.id,()=>S.db.doc('adjust/'+r.id).delete())});
    render();await Promise.all(ps);toast(ch.length+' customers ka discount lag gaya · '+monthL(m));mdSheet(m)},
  mdSet(){if(!isOwner())return toast('Sirf owner kar sakta hai');const c=S.customers[S.ac&&S.ac.id];if(!c)return;const d=discOf(c)||{t:'',v:''};
    openSheet('Mahine ka discount · '+c.name,`<div class="small muted" style="margin-bottom:10px">Ye discount har mahine ke bill pe lagega. Bills page pe "Discount lagao" dabane se us mahine ka discount khate me chadhta hai. Rate kam karna ho to "Rate badlo / Discount" use karo.</div>
     <div class="field"><label class="f" for="mdT">Kaisa discount</label><select class="input" id="mdT"><option value="" ${!d.t?'selected':''}>Koi nahi</option><option value="pct" ${d.t==='pct'?'selected':''}>% (mahine ke bill ka)</option><option value="amt" ${d.t==='amt'?'selected':''}>₹ fix har mahine</option></select></div>
     <div class="field"><label class="f" for="mdV">Kitna</label><input class="input" id="mdV" type="number" inputmode="decimal" min="0" value="${esc(d.v)}" placeholder="e.g. 5"></div>
     <button type="button" class="btn p block" data-act="mdSetSave" style="margin-top:6px">Save</button>`)},
  mdSetSave(){const id=S.ac&&S.ac.id;if(!id)return;const t=$('#mdT').value,v=num($('#mdV').value);if(t&&!v)return toast('Kitna discount, likho');if(t==='pct'&&v>50)return toast('Discount 50% se zyada nahi ho sakta');
    saveCustField(id,{disc:t?{t,v}:null});closeSheet();render();toast(t?'Discount set: '+discText({t,v}):'Discount hata diya')},
  trOpen(){trSheet()},
  async trEnd(d){const c=S.customers[d.id];if(!c||!c.trial)return;if(!isOwner())return toast('Sirf owner / office kar sakta hai');const go=d.go==='1';
    const body={...c,rates:{...c.rates,...c.trial.normal},holds:(c.holds||[]).filter(h=>h.note!=='Trial khatam'),trial:null,trialWas:{...c.trial,ended:todayISO(),kept:go,by:S.me||''}};if(!go)body.status='paused';
    await saveCustomer(body);toast(c.name+(go?': normal rate pe chalu':': band (Paused)'));if(trials().length)trSheet();else closeSheet()},
  asToggle(){try{localStorage.setItem('oritic.autosave',asOn()?'0':'1')}catch(_){}render();toast(asOn()?'Auto save ON: dusri line pe jaate hi save hoga':'Auto save OFF: Save button / Ctrl+S se save karo')},
});

/* ================= Trial offer ================= */
function trials(){const t=todayISO();return Object.values(S.customers).filter(c=>c.trial&&c.trial.to).map(c=>({c,over:c.trial.to<t,last:c.trial.to===t})).sort((a,b)=>a.c.trial.to<b.c.trial.to?-1:1)}
function trSheet(){const T=trials();openSheet('Trial customers',`<div class="small muted" style="margin-bottom:8px">Trial khatam hote hi customer Delivery sheet se hat jata hai. Phone karke poochho, phir Continue ya Band dabao.</div>
  ${T.map(({c,over,last})=>`<div class="of-row"><span class="t"><b>${esc(c.name)}</b> ${c.phone?`· <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a>`:''}<br><span class="small muted">${fmtShort(c.trial.from)} – ${fmtShort(c.trial.to)} · ${L(c.trial.pct)}% sasta</span> <span class="badge ${over?'r':last?'y':'g'}">${over?'khatam — poochho':last?'aaj aakhri din':'chal raha hai'}</span></span>
   <span class="row" style="gap:6px"><button type="button" class="btn xs p" data-act="trEnd" data-id="${c.id}" data-go="1">Continue</button><button type="button" class="btn xs d" data-act="trEnd" data-id="${c.id}" data-go="0">Band</button></span></div>`).join('')||'<div class="muted">Koi trial customer nahi.</div>'}`)}
const trBan=()=>{if(!isOwner())return '';const T=trials();if(!T.length)return '';const n=T.filter(x=>x.over||x.last).length;
  return `<button type="button" class="of-ban" ${n?'style="background:var(--warn-soft);color:var(--warn);border-color:var(--warn)"':''} data-act="trOpen">🎁 ${n?`<b>${n} trial customers</b> ka trial khatam / aaj aakhri din. Poochho: continue karna hai?`:`${T.length} trial customers chal rahe hain.`} <u>Dekho</u></button>`};
const _vH2=vHome;vHome=function(){const o=_vH2();return o&&typeof o.html==='string'?{...o,html:trBan()+o.html}:o};
const _vN2=window.EXTRA_VIEWS.neworder;window.EXTRA_VIEWS.neworder=()=>{const o=_vN2();return {...o,html:trBan()+o.html}};

/* ================= 4. Auto save (Customers grid + Delivery sheet) =================
   Jis line me abhi type ho raha hai use nahi chhedte. Line se bahar jaate hi baaki badli hui lines save.
   Galti wali line dobara tabhi try hoti hai jab usme kuch badle, taki baar baar toast na aaye. */
const asOn=()=>{try{return localStorage.getItem('oritic.autosave')!=='0'}catch(_){return true}};
window.autoSaveOn=asOn;
let asBusy=false,cgFail='';const shFail={};
const refocus=sel=>{if(!sel)return;const el=document.querySelector(sel);if(el&&document.activeElement!==el){el.focus();try{const n=el.value.length;el.setSelectionRange(n,n)}catch(_){}}};
async function cgAuto(){if(asBusy||!asOn()||S.route!=='customers'||!isOwner()||!S.cgDirty)return;const a=document.activeElement;const cur=a&&a.classList&&a.classList.contains('cgi')?a.dataset.cg:null;
  const ids=Object.keys(S.cgDirty).filter(id=>id!==cur);if(!ids.length)return;const sig=JSON.stringify(ids.map(id=>[id,S.cgDirty[id]]));if(sig===cgFail)return;
  asBusy=true;const sel=cur?'.cgi[data-cg="'+cur+'"][data-f="'+a.dataset.f+'"]':'';const keep=cur?S.cgDirty[cur]:null;if(keep)delete S.cgDirty[cur];
  try{await A.cgSave()}finally{if(keep){S.cgDirty[cur]={...keep,...(S.cgDirty[cur]||{})};render()}
    const left=Object.keys(S.cgDirty).filter(id=>id!==cur);cgFail=left.length?JSON.stringify(left.map(id=>[id,S.cgDirty[id]])):'';asBusy=false;refocus(sel)}}
async function shAuto(){if(asBusy||!asOn()||S.route!=='sheet'||!isOwner()||!$('#sheet').hidden||!S.pldr)return;const a=document.activeElement;const tr=a&&a.closest?a.closest('tr[data-row]'):null;const cur=tr?tr.dataset.row:null;
  const pre=S.pld+'|';const ids=Object.keys(S.pldr).filter(k=>k.indexOf(pre)===0&&S.pldr[k]&&S.pldr[k].dirty).map(k=>k.slice(pre.length)).filter(id=>id!==cur&&S.customers[id]&&shFail[pre+id]!==JSON.stringify(S.pldr[pre+id].qty));
  if(!ids.length)return;asBusy=true;const ds=a&&a.dataset&&cur?a.dataset:null;const sel=ds&&ds.act?'[data-act="'+ds.act+'"]'+(ds.id?'[data-id="'+ds.id+'"]':'')+(ds.p?'[data-p="'+ds.p+'"]':'')+(ds.pid?'[data-pid="'+ds.pid+'"]':''):'';
  try{for(const id of ids){const k=pre+id;const q=JSON.stringify(S.pldr[k].qty);await A.shOk({id});if(S.pldr[k]&&S.pldr[k].dirty)shFail[k]=q;else delete shFail[k]}}finally{asBusy=false;refocus(sel)}}
document.addEventListener('focusout',e=>{const t=e.target;if(!t||!t.closest)return;if(t.classList&&t.classList.contains('cgi'))setTimeout(cgAuto,250);else if(t.closest('tr[data-row]'))setTimeout(shAuto,250)});
})();

/* ================= Boy badlo (route handover) =================
   Anil ki jagah Harish: naam edit nahi karte. Naya boy banta hai (ya purana chuna jata hai), saare customers usko jaate hain,
   purana boy list se hatta hai par uska purana hisab (delivery, cash) usi ke naam pe rehta hai. Sirf owner. */
(function(){
const custOf=b=>Object.values(S.customers).filter(c=>c.boy===b);
function handSheet(){const B=boys();
  openSheet('Boy badlo · route handover',`<div class="small muted" style="margin-bottom:10px">Jab ek boy ki jagah doosra aaye, naam edit mat karo. Yahan se uske saare customers naye boy ko de do. Purane boy ki purani delivery aur cash ka hisab usi ke naam pe rahega.</div>
   <div class="field"><label class="f" for="hdF">Kiska route dena hai</label><select class="input" id="hdF">${B.map(b=>`<option value="${esc(b)}">${esc(b)} · ${custOf(b).length} customers</option>`).join('')}</select></div>
   <div class="field"><label class="f" for="hdT">Kisko dena hai</label><select class="input" id="hdT"><option value="">+ Naya boy (neeche naam likho)</option>${B.map(b=>`<option value="${esc(b)}">${esc(b)} (pehle se hai)</option>`).join('')}</select></div>
   <div id="hdNew"><div class="field"><label class="f" for="hdN">Naye boy ka naam</label><input class="input" id="hdN" placeholder="e.g. Harish" autocomplete="off"></div>
    <div class="field"><label class="f" for="hdP">Naye boy ka login PIN (4-6 digit)</label><input class="input" id="hdP" inputmode="numeric" maxlength="6" autocomplete="off"></div>
    <div class="field"><label class="f" for="hdPh">Mobile (zaroori nahi)</label><input class="input" id="hdPh" inputmode="numeric" maxlength="10" autocomplete="off"></div></div>
   <label style="display:flex;gap:8px;align-items:center;margin:10px 0"><input type="checkbox" id="hdL" checked> Purane boy ne kaam chhod diya (uska login band karo)</label>
   <button type="button" class="btn p block" data-act="tmHandGo">Route de do</button>`);
  const t=$('#hdT');t.onchange=()=>{$('#hdNew').hidden=t.value!==''}}
Object.assign(A,{
  tmHand(){if(!isAdmin())return toast('Sirf owner kar sakta hai');if(!boys().length)return toast('Pehle koi boy jodo');handSheet()},
  async tmHandGo(){if(!isAdmin())return toast('Sirf owner kar sakta hai');if(!canWrite())return;const from=$('#hdF').value;let to=$('#hdT').value;const left=$('#hdL').checked;const isNew=!to;let pin='',phone='';
    if(isNew){to=($('#hdN').value||'').trim().replace(/\s+/g,' ');pin=($('#hdP').value||'').trim();phone=($('#hdPh').value||'').replace(/\D/g,'');if(!to)return toast('Naye boy ka naam likho');if(!/^\d{4,6}$/.test(pin))return toast('PIN 4-6 digit ka likho');
      const lo=to.toLowerCase();const st0=settings();if(lo==='owner'||[...boys(),...(st0.staff||[]),...Object.keys(st0.team||{})].some(x=>String(x).toLowerCase()===lo))return toast('Ye naam pehle se hai (ya pehle tha). Doosra naam likho, jaise "'+to+' 2"')}
    if(to===from)return toast('Dono alag hone chahiye');
    const L2=custOf(from);const keep={from,to,left,isNew};closeSheet();
    const cash=typeof cashInHand==='function'?cashInHand(from):0;
    const ok=await confirmBox({title:`${esc(from)} ka route ${esc(to)} ko dein?`,html:`<b>${L2.length} customers</b> (active aur paused dono) ${esc(to)} ke naam ho jayenge, order wahi rahega.${isNew?`<div style="margin-top:6px">${esc(to)} naya boy banega aur apne PIN se login karega.</div>`:''}${left?`<div style="margin-top:6px">${esc(from)} ka login band ho jayega. Purana hisab usi ke naam pe rahega.</div>`:''}${left&&Math.abs(cash)>0.5?`<div style="margin-top:8px;color:var(--danger)"><b>${esc(from)} ke haath me abhi cash: ${inr(cash)}</b>. Pehle handover le lo.</div>`:''}`,yes:'Haan, de do'});
    if(!ok)return;
    const st=settings();const T={...(st.team||{})};const pins={...(st.pins||{}),boys:{...((st.pins||{}).boys||{})},staff:{...((st.pins||{}).staff||{})}};let B=[...boys()];
    if(isNew){B.push(to);pins.boys[to]=pin;T[to]={...(T[to]||{}),role:'boy',phone,join:todayISO(),note:from+' ki jagah'}}
    if(left){B=B.filter(x=>x!==from);delete pins.boys[from];T[from]={...(T[from]||{}),role:'boy',left:todayISO(),note:((T[from]||{}).note?(T[from].note+' · '):'')+'route '+to+' ko diya'}}
    await saveSettings({...st,boys:B,pins,team:T});
    const base=Object.values(S.customers).filter(c=>c.boy===to).reduce((m,c)=>Math.max(m,+c.seq||0),0);
    L2.sort((a,b)=>(a.seq??9999)-(b.seq??9999));
    for(let i=0;i<L2.length;i+=300){const b=S.db.batch();L2.slice(i,i+300).forEach((c,k)=>{const patch={boy:to,seq:base+(i+k+1)*10,boyWas:from,boyAt:todayISO()};S.customers[c.id]={...S.customers[c.id],...patch};b.set(S.db.doc('customers/'+c.id),patch,{merge:true})});await b.commit()}
    render();toast(L2.length+' customers '+to+' ko mil gaye'+(left?' · '+from+' ka login band':''))},
});
})();
