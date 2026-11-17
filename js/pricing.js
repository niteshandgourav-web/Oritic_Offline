/* Oritic · Price list (default rate + special rate)
 * - Ek default rate har product ka. Jo customer default pe hai uska rate Price list ke saath badalta hai.
 * - Special rate (10-20% customer): unke account me alag rate. Price list badlne pe nahi badalta.
 * - Rate badlo "kab se" (aur chaho to "kab tak"). Pehle preview, phir purani delivered entries bhi naye rate pe.
 * - Har badlav ka record + last badlav Undo.
 * Core (defOn, spOn, rateOn, priceRow, spClean) js/account.js me hai.
 */
'use strict';
(()=>{
const st0=document.createElement('style');st0.textContent=`
.pill.warn{background:var(--warn-soft);color:var(--warn)}
.prt{width:100%;border-collapse:collapse;font-size:14px}.prt th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);text-align:left;padding:7px 8px;border-bottom:1px solid var(--line)}
.prt td{padding:6px 8px;border-bottom:1px solid var(--line2);vertical-align:middle}.prt .n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.prt input{max-width:110px;padding:7px 9px}.prt tr.ch td{background:var(--accent-soft)}
.prsum{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:8px 0}
.prsum div{background:var(--surface2);border-radius:12px;padding:9px 12px}.prsum b{display:block;font-size:19px}.prsum span{font-size:12px;color:var(--muted)}
.prl{display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid var(--line2);align-items:center;flex-wrap:wrap}
.prchips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
`;document.head.appendChild(st0);

const RK=['cow','buffalo','desi','chaach','paneer','ghee'];
const todayS=()=>todayISO();
const near=(a,b)=>Math.abs((+a||0)-(+b||0))<0.005;
const r2=v=>Math.round(v*100)/100;
const mStart=()=>todayS().slice(0,8)+'01';

ROUTES.push({id:'prices',l:'Price list',t:'Price list · default rate'});
ICONS.prices='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>';
if(typeof NAVG!=='undefined'){const g=NAVG.find(x=>x[1].includes('products'));if(g)g[1].splice(g[1].indexOf('products'),0,'prices')}
const _cr=window.canRoute;window.canRoute=r=>r==='prices'?(S.role==='owner'&&isAdmin()):(_cr?_cr(r):true);

/* ---------- customer rate save: sirf special rate rakho, aur rates field poora replace karo ---------- */
/* jis customer ki rate history hai, uska rate edit form / grid se badla to history me aaj se entry jodo (warna history purana rate dikhati) */
function withLog(c0,rates,patch){const lg=c0&&c0.rateLog;if(!Array.isArray(lg)||!lg.length||(patch.rateLog&&patch.rateLog.length!==lg.length))return patch;
  const t=todayS(),cur={};const s0=spOn(c0,t);RK.forEach(k=>{if(s0[k]!=null)cur[k]=+s0[k]});
  const keys=[...new Set([...Object.keys(cur),...Object.keys(rates)])].filter(k=>RK.includes(k));if(keys.every(k=>near(cur[k],rates[k])&&(k in cur)===(k in rates)))return patch;
  const prev=rateOn(c0,t),d=defOn(t),full={};RK.forEach(k=>full[k]=k in rates?+rates[k]:+d[k]||0);
  return {...patch,rateLog:[...lg,{id:uid(),from:t,prev,rates:full,psp:cur,sp:{...rates},why:'Customer edit',note:'',by:S.me||'',t:Date.now()}]}}
const _sc=window.saveCustomer;
window.saveCustomer=saveCustomer=async function(c){if(c&&c.rates&&window.spClean){const r=spClean(c.rates);c=withLog(c.id&&S.customers[c.id]||c,r,{...c,rates:r})}return _sc(c)};
const _scf=window.saveCustField;
window.saveCustField=saveCustField=function(id,patch){
  if(!patch||!patch.rates||!window.spClean)return _scf(id,patch);
  if(!canWrite()){toast('Aapko write permission nahi hai');return}
  const r=spClean(patch.rates);patch=withLog(S.customers[id],r,{...patch,rates:r});
  S.customers[id]={...S.customers[id],...patch};
  return queue('cust:'+id,()=>S.db.doc('customers/'+id).set(patch,{mergeFields:Object.keys(patch)}))};

/* ---------- products in price list ---------- */
function items(){const kp=kgId('paneer'),kg=kgId('ghee');
  return [...PRODUCTS.map(p=>({k:p.k,n:p.k==='chaach'?'Chaach':(p.k==='desi'?'Gir Cow':p.sh)+' doodh',u:'litre',milk:1})),
    {k:'paneer',n:'Paneer',u:'kg'},{k:'ghee',n:'Ghee',u:'kg'},
    ...products().filter(p=>p.on!==false&&p.id!==kp&&p.id!==kg).map(p=>({k:p.id,n:p.n,u:p.u||''}))]}
const nameOf=k=>{const i=items().find(x=>x.k===k);if(i)return i.n;const p=products().find(x=>x.id===k);return p?p.n:k};
const custs=()=>Object.values(S.customers||{}).filter(c=>c&&c.status!=='request');
function keyOfX(e){if(e.k==='paneer'||e.k==='ghee')return e.k;const pid=e.pid||((findProd(e.base||e.n)||{}).id);if(!pid)return null;
  if(pid===kgId('ghee'))return 'ghee';if(pid===kgId('paneer'))return 'paneer';return pid}
const qtyOfX=e=>+e.u||+e.qty||0;
const rateOfX=e=>{if(e.rate!=null&&e.rate!=='')return +e.rate;const q=qtyOfX(e);return q?(+e.a||0)/q:(+e.a||0)};

/* ---------- plan: kaun si delivered entry kaise badlegi ---------- */
function planChg(chg,from,to,o){
  const today=todayS(),end=to&&to<today?to:today;const out=[];const sk={sp:0,rl:0,odd:0};
  const keys=Object.keys(chg);
  for(const d of Object.keys(S.days||{}).filter(d=>d>=from&&d<=end).sort()){
    const rows=(S.days[d]||{}).rows||{};const old=defOn(d);
    for(const cid in rows){const row=rows[cid];if(!row||row.s!=='d')continue;const c=S.customers[cid];if(!c)continue;
      const sp=spOn(c,d);const nw=JSON.parse(JSON.stringify(row));nw.r=nw.r||{};let ch=false;
      for(const k of keys){if(!PRODUCTS.some(p=>p.k===k))continue;const q=+(row.q&&row.q[k])||0;if(!q)continue;
        if(k in sp){sk.sp++;continue}
        if(row.rl&&!o.rl){sk.rl++;continue}
        const cur=+(row.r&&row.r[k])||0;
        if(near(cur,old[k])||(o.zero&&!cur)){if(!near(cur,chg[k])){nw.r[k]=chg[k];ch=true}}else sk.odd++}
      if(Array.isArray(nw.x))nw.x=nw.x.map(e=>{const k=keyOfX(e);if(!k||!(k in chg)||e.free)return e;
        if(k in sp){sk.sp++;return e}
        const rt=rateOfX(e),q=qtyOfX(e)||1;
        if(rt>0&&near(rt,old[k])){if(near(rt,chg[k]))return e;ch=true;return {...e,rate:chg[k],a:r2(q*chg[k])}}
        if(o.zero&&!(+e.a>0)){ch=true;return {...e,rate:chg[k],a:r2(q*chg[k])}}
        sk.odd++;return e});
      if(!ch)continue;nw.a=calcAmount(nw.q||{},nw.x||[],nw.r);
      if(near(nw.a,row.a)&&JSON.stringify(nw.r)===JSON.stringify(row.r||{}))continue;
      out.push({d,cid,before:row,after:nw})}}
  return {out,sk}}

/* ---------- state ---------- */
S.pr=S.pr||{nv:{},from:mStart(),to:'',note:'',rl:false,zero:false,pv:null,q:'',all:false,busy:false};
function readForm(){const P=S.pr;P.nv={};items().forEach(i=>{const el=$('#prN_'+i.k);if(el&&el.value!=='')P.nv[i.k]=el.value});
  const f=$('#prFrom'),t=$('#prTo'),n=$('#prNote'),rl=$('#prRl'),z=$('#prZero');if(f)P.from=f.value;if(t)P.to=t.value;if(n)P.note=n.value;if(rl)P.rl=rl.checked;if(z)P.zero=z.checked}
function chgOf(){const P=S.pr,cur=defOn(P.from||todayS()),c={};
  for(const k in P.nv){const v=+P.nv[k];if(!(v>0))continue;if(!near(v,cur[k]))c[k]=v}return c}

/* ---------- views ---------- */
function vSetup(){const base=listNow0();const sp=[];let fol=0;
  custs().forEach(c=>{const d=diffBase(c.rates,base);if(Object.keys(d).length)sp.push({c,d});else fol++});
  sp.sort((a,b)=>a.c.name.localeCompare(b.c.name));
  return {title:'Price list',html:`<div class="card"><h3>Naya price system shuru karo</h3>
   <div class="small" style="margin:6px 0 10px">Abhi har customer ke paas apne rate ki alag copy hai, isliye default badalne se kuch nahi badalta. Ye button ek baar dabao:</div>
   <div class="prsum"><div><b>${fol}</b><span>customer default rate pe chalenge (Price list badlegi to inka rate bhi)</span></div><div><b>${sp.length}</b><span>customer ka rate alag hai, wo <b>special</b> rahega</span></div></div>
   <div class="small muted">Aaj ka default: ${items().filter(i=>base[i.k]>0).map(i=>esc(i.n)+' ₹'+L(base[i.k])).join(' · ')}</div>
   <div class="small muted" style="margin-top:4px">Koi bill, entry ya hisab nahi badlega. Sirf ye tay hota hai ki aage kaun default ke saath chalega.</div>
   <button class="btn p" style="margin-top:12px" data-act="prSetup">Shuru karo</button></div>
   ${sp.length?`<div class="card"><h3>Ye ${sp.length} special rahenge</h3>${sp.slice(0,S.pr.all?999:40).map(x=>`<div class="prl"><span><b data-act="openCustomer" data-id="${esc(x.c.id)}" style="cursor:pointer">${esc(x.c.name)}</b> ${window.phc?phc(x.c):''} <span class="small muted">${esc(x.c.boy||'')}</span></span><span class="small">${Object.keys(x.d).map(k=>esc(nameOf(k))+' ₹'+L(x.d[k])+' <span class="muted">(default ₹'+L(base[k])+')</span>').join(' · ')}</span></div>`).join('')}
    ${sp.length>40&&!S.pr.all?`<button class="btn sm o" style="margin-top:8px" data-act="prAll">Sab ${sp.length} dikhao</button>`:''}</div>`:''}`}}
function diffBase(r,base){const o={};Object.keys(r||{}).forEach(k=>{if(!RK.includes(k))return;const v=+r[k];if(v>0&&!near(v,base[k]))o[k]=v});return o}

function vPrices(){
  if(!isAdmin())return {title:'Price list',html:'<div class="empty">Price list sirf owner (ya poore access wala) dekh sakta hai.</div>'};
  if(!settings().priceBase)return vSetup();
  const P=S.pr,today=todayS(),cur=defOn(today),fromR=defOn(P.from||today);
  const cs=custs();const cnt={};items().forEach(i=>cnt[i.k]={f:0,s:0});
  cs.forEach(c=>{const sp=spOn(c,today);PRODUCTS.forEach(p=>{if(+(c.order&&c.order[p.k])>0){if(p.k in sp)cnt[p.k].s++;else cnt[p.k].f++}});['paneer','ghee'].forEach(k=>{if(k in sp)cnt[k].s++})});
  const spL=cs.map(c=>({c,sp:spOn(c,today)})).filter(x=>Object.keys(x.sp).some(k=>RK.includes(k)));
  const q=(P.q||'').toLowerCase();const spF=spL.filter(x=>!q||(x.c.name+' '+(x.c.phone||'')+' '+(x.c.boy||'')+' '+(x.c.area||'')).toLowerCase().includes(q)).sort((a,b)=>a.c.name.localeCompare(b.c.name));
  const up=plog().filter(e=>e.from>today);
  const pv=P.pv;
  const html=`
  <div class="card"><h3>Default rate badlo</h3>
   <div class="small muted" style="margin:4px 0 10px">Naya rate sirf jis product ka badalna hai usme likho. Default wale sab customers ka rate badlega. Special rate wale customers ka nahi.</div>
   <div style="overflow-x:auto"><table class="prt"><thead><tr><th>Product</th><th class="n">${P.from&&P.from!==today?fmtShort(P.from)+' ko':'Aaj'} ka rate</th><th class="n">Default pe</th><th class="n">Special</th><th>Naya rate ₹</th></tr></thead><tbody>
   ${items().map(i=>{const v=P.nv[i.k]??'';const chg=v!==''&&+v>0&&!near(+v,fromR[i.k]);return `<tr class="${chg?'ch':''}"><td><b>${esc(i.n)}</b>${i.u?` <span class="small muted">/ ${esc(i.u)}</span>`:''}</td><td class="n">${fromR[i.k]>0?inr(fromR[i.k]):'<span class="muted">–</span>'}</td><td class="n">${i.milk?cnt[i.k].f:'<span class="muted">–</span>'}</td><td class="n">${cnt[i.k]&&cnt[i.k].s?`<b style="color:var(--warn)">${cnt[i.k].s}</b>`:'–'}</td>
     <td><input class="input" type="number" inputmode="decimal" min="0" step="0.5" id="prN_${esc(i.k)}" value="${esc(v)}" placeholder="${fromR[i.k]>0?L(fromR[i.k]):''}"></td></tr>`}).join('')}</tbody></table></div>
   <div class="grid g3" style="margin-top:12px">
    <div class="field"><label class="f">Kab se lagu</label><input class="input" type="date" id="prFrom" value="${esc(P.from||today)}">
     <div class="prchips"><button class="btn xs o" data-act="prDate" data-v="${mStart()}">Is mahine ki 1 tareekh</button><button class="btn xs o" data-act="prDate" data-v="${today}">Aaj</button><button class="btn xs o" data-act="prDate" data-v="${addDays(today,1)}">Kal</button></div></div>
    <div class="field"><label class="f">Kab tak (khaali = aage bhi)</label><input class="input" type="date" id="prTo" value="${esc(P.to||'')}">
     <div class="prchips"><button class="btn xs o" data-act="prTo" data-v="">Aage bhi</button><button class="btn xs o" data-act="prTo" data-v="${monthEnd(P.from||today)}">Us mahine ke end tak</button></div></div>
    <div class="field"><label class="f">Note</label><input class="input" id="prNote" value="${esc(P.note||'')}" placeholder="e.g. Doodh mehenga hua"></div></div>
   <label style="display:flex;gap:8px;margin-top:10px;align-items:flex-start"><input type="checkbox" id="prRl" ${P.rl?'checked':''} style="margin-top:3px"><span class="small"><b>Haath se sudhari entries bhi badlo</b><br><span class="muted">Jin entries ka doodh rate "Entry sudharo" me haath se badla tha. Normally inhe mat chhedo.</span></span></label>
   <label style="display:flex;gap:8px;margin-top:8px;align-items:flex-start"><input type="checkbox" id="prZero" ${P.zero?'checked':''} style="margin-top:3px"><span class="small"><b>₹0 wali entries me bhi ye rate bharo</b><br><span class="muted">Jo delivery bina rate ke chadhi thi (₹0). Free di gayi cheez nahi chhedi jati.</span></span></label>
   <button class="btn p" style="margin-top:12px" data-act="prPrev">Pehle dekho kya badlega</button></div>
  ${pv?vPreview(pv):''}
  ${up.length?`<div class="card"><h3>Aane wale rate</h3>${up.map(e=>`<div class="prl"><span><b>${fmtDate(e.from)}</b> se${e.to?' '+fmtDate(e.to)+' tak':''} · ${chgText(e)}</span><button class="btn xs o" data-act="prDelUp" data-id="${esc(e.id)}">Hatao</button></div>`).join('')}</div>`:''}
  <div class="card"><h3>Special rate wale customers · ${spL.length}</h3>
   <div class="small muted" style="margin:4px 0 8px">In par Price list ka badlav nahi lagta. Rate badalna ya default pe wapas lana ho to naam dabao → account → "Rate badlo / Discount".</div>
   <input class="input" id="prQ" placeholder="Naam, number, boy ya area" value="${esc(P.q||'')}" data-act="prQ">
   ${spF.slice(0,P.all?999:50).map(x=>`<div class="prl"><span><b data-act="openCustomer" data-id="${esc(x.c.id)}" style="cursor:pointer">${esc(x.c.name)}</b> ${window.phc?phc(x.c):''} <span class="small muted">${esc(x.c.boy||'')}${x.c.area?' · '+esc(x.c.area):''}</span></span><span class="small">${Object.keys(x.sp).filter(k=>RK.includes(k)).map(k=>esc(nameOf(k))+' <b>₹'+L(x.sp[k])+'</b> <span class="muted">(default ₹'+L(cur[k])+')</span>').join(' · ')}</span></div>`).join('')||'<div class="muted" style="padding:8px 0">Koi nahi</div>'}
   ${spF.length>50&&!P.all?`<button class="btn sm o" style="margin-top:8px" data-act="prAll">Sab ${spF.length} dikhao</button>`:''}</div>
  ${vHist()}`;
  return {title:'Price list',html}}

function monthEnd(d){const [y,m]=d.slice(0,7).split('-').map(Number);const e=new Date(Date.UTC(y,m,0));return e.toISOString().slice(0,10)}
function chgText(e){return Object.keys(e.rates||{}).filter(k=>items().some(i=>i.k===k)).map(k=>`${esc(nameOf(k))} ₹${L(+(e.prev||{})[k]||0)} → <b>₹${L(e.rates[k])}</b>`).join(', ')}
function vPreview(pv){const o=sum(pv.out,x=>+x.before.a||0),n=sum(pv.out,x=>+x.after.a||0);const by={};
  pv.out.forEach(x=>{const b=by[x.cid]||(by[x.cid]={c:S.customers[x.cid],n:0,o:0,a:0});b.n++;b.o+=+x.before.a||0;b.a+=+x.after.a||0});
  const L2=Object.values(by).sort((a,b)=>Math.abs(b.a-b.o)-Math.abs(a.a-a.o));const custN=L2.length;
  const ms={};pv.out.forEach(x=>{const m=x.d.slice(0,7);const z=ms[m]||(ms[m]={o:0,a:0,n:0});z.o+=+x.before.a||0;z.a+=+x.after.a||0;z.n++});
  const fut=pv.from>todayS();
  return `<div class="card" id="prPv" style="border:2px solid var(--accent)"><h3>Ye badlega</h3>
   <div class="small">${chgText({rates:pv.chg,prev:pv.prev})}<br><b>${fmtDate(pv.from)}</b> se${pv.to?' <b>'+fmtDate(pv.to)+'</b> tak':' aage bhi'}</div>
   ${fut?`<div class="small muted" style="margin-top:8px">Ye date aage ki hai. Abhi koi entry nahi badlegi; us din se nayi deliveries naye rate pe chadhengi.</div>`:`
   <div class="prsum"><div><b>${pv.out.length}</b><span>delivered entries badlengi</span></div><div><b>${custN}</b><span>customers</span></div><div><b>${inr(o)} → ${inr(n)}</b><span>in entries ka total (${n-o>=0?'+':'−'}${inr(Math.abs(n-o))})</span></div></div>
   ${Object.keys(ms).sort().map(m=>`<div class="small">${new Date(m+'-01T12:00:00').toLocaleDateString('en-IN',{month:'long',year:'numeric'})}: ${ms[m].n} entries · ${inr(ms[m].o)} → <b>${inr(ms[m].a)}</b></div>`).join('')}
   <div class="small muted" style="margin-top:8px">Nahi badlengi: ${pv.sk.sp} special rate wali · ${pv.sk.rl} haath se sudhari · ${pv.sk.odd} jinka rate us din default se alag tha</div>
   ${L2.length?`<details style="margin-top:8px"><summary class="small" style="cursor:pointer;font-weight:700">Customer-wise dekho (${L2.length})</summary>${L2.slice(0,200).map(b=>`<div class="prl"><span>${esc(b.c?b.c.name:'?')} <span class="small muted">${esc(b.c&&b.c.boy||'')} · ${b.n} din</span></span><span class="small">${inr(b.o)} → <b>${inr(b.a)}</b></span></div>`).join('')}</details>`:''}`}
   <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn p" data-act="prApply" ${S.pr.busy?'disabled':''}>Haan, ye rate lagao</button><button class="btn o" data-act="prCancel">Cancel</button></div></div>`}

function vHist(){const L0=(Array.isArray(settings().priceLog)?settings().priceLog:[]).slice().sort((a,b)=>(b.t||0)-(a.t||0));
  const last=L0.find(e=>!e.undone);
  return `<div class="card"><h3>Rate history</h3>${L0.map(e=>`<div class="prl" style="${e.undone?'opacity:.55':''}"><span><b>${fmtShort(e.from)} ${e.from.slice(0,4)}</b>${e.to?' – '+fmtShort(e.to)+' '+e.to.slice(0,4):' se'} · ${chgText(e)}${e.note?' · <i>'+esc(e.note)+'</i>':''}<br><span class="small muted">${e.n?e.n+' entries · '+inr(e.a0||0)+' → '+inr(e.a1||0)+' · ':''}${esc(e.by||'')} · ${new Date(e.t).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}${e.undone?' · <b>Undo kiya</b> ('+esc(e.undoBy||'')+')':''}</span></span>${e===last&&!e.undone?`<button class="btn xs o" data-act="prUndo" data-id="${esc(e.id)}">Undo</button>`:''}</div>`).join('')||'<div class="muted">Abhi tak Price list se rate nahi badla</div>'}</div>`}

window.EXTRA_VIEWS={...(window.EXTRA_VIEWS||{}),prices:()=>vPrices()};

/* ---------- current rate sync: settings.rates + product master ko aaj ke default pe rakho ---------- */
async function syncCur(){if(!settings().priceBase||!canWrite()||!isAdmin())return;const cur=defOn(todayS());const st=settings();const rt={...(st.rates||{})};let ch=false;
  PRODUCTS.forEach(p=>{if(cur[p.k]>0&&!near(rt[p.k],cur[p.k])){rt[p.k]=cur[p.k];ch=true}});
  ['paneer','ghee'].forEach(k=>{if(cur[k]>0&&!near(rt[k],cur[k])){rt[k]=cur[k];ch=true}});
  const pr=products().map(p=>{const k=p.id===kgId('ghee')?'ghee':p.id===kgId('paneer')?'paneer':p.id;const v=cur[k];if(v>0&&!near(p.a,v)){ch=true;return {...p,a:v}}return p});
  if(ch)await saveSettings({...st,rates:rt,...(Array.isArray(st.products)?{products:pr}:{})})}
window.prSync=syncCur;

/* rows ko bina priceRow ke likho (rate hum khud laga chuke) */
async function putRaw(byDate){for(const d of Object.keys(byDate).sort()){S.noPrice=true;let p;try{p=writeRows(d,byDate[d])}finally{S.noPrice=false}await p}}

Object.assign(A,{
  prAll(){S.pr.all=true;render()},
  prQ(){},
  prDate(d){readForm();S.pr.from=d.v;S.pr.pv=null;render()},
  prTo(d){readForm();S.pr.to=d.v;S.pr.pv=null;render()},
  prCancel(){S.pr.pv=null;render()},
  async prSetup(){if(!isAdmin())return toast('Sirf owner kar sakta hai');if(!canWrite())return toast('Aapko write permission nahi hai');if(settings().priceBase)return;
    const base=listNow0();const ok=await confirmBox({title:'Naya price system shuru karein?',html:'Default jaisa rate wale customer default ke saath chalenge, baaki special rahenge. Koi bill ya entry nahi badlegi.',yes:'Haan, shuru karo'});if(!ok)return;
    const ups=[];
    custs().concat(Object.values(S.customers||{}).filter(c=>c&&c.status==='request')).forEach(c=>{const patch={rates:diffBase(c.rates,base)};
      if(Array.isArray(c.rateLog)&&c.rateLog.length)patch.rateLog=c.rateLog.map(e=>e.sp!==undefined?e:{...e,sp:diffBase(e.rates,base),psp:diffBase(e.prev,base)});
      ups.push([c.id,patch])});
    await saveSettings({...settings(),priceBase:base,priceLog:[]});
    for(let i=0;i<ups.length;i+=400){const b=S.db.batch();ups.slice(i,i+400).forEach(([id,p])=>{S.customers[id]={...S.customers[id],...p};b.set(S.db.doc('customers/'+id),p,{mergeFields:Object.keys(p)})});await b.commit()}
    render();toast('Price system shuru · '+ups.filter(x=>!Object.keys(x[1].rates).length).length+' default pe, '+ups.filter(x=>Object.keys(x[1].rates).length).length+' special')},
  prPrev(){readForm();const P=S.pr;if(!P.from)return toast('"Kab se" date chuno');if(P.to&&P.to<P.from)return toast('"Kab tak" date "Kab se" ke baad honi chahiye');
    const chg=chgOf();if(!Object.keys(chg).length){P.pv=null;render();return toast('Koi rate nahi badla. Naya rate likho.')}
    const prev={};const d0=defOn(P.from);Object.keys(chg).forEach(k=>prev[k]=+d0[k]||0);
    const r=planChg(chg,P.from,P.to,{rl:P.rl,zero:P.zero});P.pv={chg,prev,from:P.from,to:P.to,note:P.note,...r};render();
    setTimeout(()=>{const e=$('#prPv');if(e)e.scrollIntoView({block:'start',behavior:'smooth'})},40)},
  async prApply(){const P=S.pr,pv=P.pv;if(!pv||P.busy)return;if(!isAdmin())return toast('Sirf owner kar sakta hai');if(!canWrite())return toast('Aapko write permission nahi hai');
    P.busy=true;render();
    try{
      /* dobara gino: beech me koi entry badli ho to */
      const r=planChg(pv.chg,pv.from,pv.to,{rl:P.rl,zero:P.zero});
      const rates={...pv.chg};['paneer','ghee'].forEach(k=>{const id=kgId(k);if(id&&k in rates)rates[id]=rates[k]});
      const prev={...pv.prev};['paneer','ghee'].forEach(k=>{const id=kgId(k);if(id&&k in prev)prev[id]=prev[k]});
      const e={id:'pl'+uid(),from:pv.from,to:pv.to||'',rates,prev,note:pv.note||'',by:S.me||'',t:Date.now(),n:r.out.length,a0:r2(sum(r.out,x=>+x.before.a||0)),a1:r2(sum(r.out,x=>+x.after.a||0)),rl:!!P.rl,zero:!!P.zero};
      /* undo ke liye purani entries alag doc me (mahine-wise) */
      const bm={};r.out.forEach(x=>{const m=x.d.slice(0,7);((bm[m]=bm[m]||{})[x.d]=bm[m][x.d]||{})[x.cid]={b:x.before,a:+x.after.a||0}});
      for(const m in bm)await S.db.doc('pricechg/'+e.id+'_'+m).set({id:e.id,m,rows:bm[m]});
      e.months=Object.keys(bm);
      await saveSettings({...settings(),priceLog:[...(settings().priceLog||[]),e]});
      const byDate={};r.out.forEach(x=>{(byDate[x.d]=byDate[x.d]||{})[x.cid]=x.after});
      await putRaw(byDate);
      await syncCur();
      P.pv=null;P.nv={};P.note='';
      toast(`Rate lag gaya · ${r.out.length} entries update${r.out.length?' · '+inr(e.a0)+' → '+inr(e.a1):''}`)}
    catch(err){console.error(err);toast('Rate save nahi hua: '+(err&&err.message||err))}
    finally{P.busy=false;render()}},
  async prUndo(d){if(!isAdmin()||!canWrite())return toast('Sirf owner kar sakta hai');const Lg=settings().priceLog||[];const e=Lg.find(x=>x.id===d.id);if(!e||e.undone)return;
    const ok=await confirmBox({title:'Ye rate badlav wapas karein?',html:`${chgText(e)}<br>${e.n||0} entries purane rate pe wapas jayengi. Jo entry baad me haath se badli gayi hai wo nahi chhedi jayegi.`,yes:'Haan, undo karo',danger:true});if(!ok)return;
    const byDate={};let skip=0;
    for(const m of (e.months||[])){const s=await S.db.doc('pricechg/'+e.id+'_'+m).get();if(!s.exists)continue;const rows=(s.data()||{}).rows||{};
      for(const dt in rows)for(const cid in rows[dt]){const cur=S.days[dt]&&S.days[dt].rows&&S.days[dt].rows[cid];const x=rows[dt][cid];
        if(!cur||cur.s!=='d'||!near(cur.a,x.a)){skip++;continue}(byDate[dt]=byDate[dt]||{})[cid]=x.b}}
    await saveSettings({...settings(),priceLog:Lg.map(x=>x.id===e.id?{...x,undone:true,undoBy:S.me||'',undoAt:Date.now()}:x)});
    await putRaw(byDate);await syncCur();render();
    toast('Undo ho gaya · '+Object.values(byDate).reduce((a,o)=>a+Object.keys(o).length,0)+' entries wapas'+(skip?' · '+skip+' baad me badli thi, chhod di':''))},
  async prDelUp(d){if(!isAdmin()||!canWrite())return;const Lg=settings().priceLog||[];const e=Lg.find(x=>x.id===d.id);if(!e||e.from<=todayS())return toast('Lag chuka rate hata nahi sakte, Undo use karo');
    await saveSettings({...settings(),priceLog:Lg.filter(x=>x.id!==d.id)});toast('Aane wala rate hata diya')}
});
/* search box: type karte hi filter */
document.addEventListener('input',ev=>{const t=ev.target;if(t&&t.id==='prQ'){S.pr.q=t.value;const pos=t.selectionStart;render();const n=$('#prQ');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}}});
/* date / rate badla to purana preview hatao */
document.addEventListener('change',ev=>{const t=ev.target;if(t&&(t.id==='prFrom'||t.id==='prTo'||t.id==='prRl'||t.id==='prZero'||(t.id||'').startsWith('prN_'))&&S.route==='prices'){readForm();if(S.pr.pv){S.pr.pv=null;render()}else if(t.id==='prFrom')render()}});
/* din badalne pe (kab se / kab tak) aaj ka rate settings me sync */
setTimeout(function tick(){try{const k='prSync:'+todayS();if(S.ready&&settings().priceBase&&isAdmin()&&canWrite()&&!S['_'+k]){S['_'+k]=1;syncCur()}}catch(e){console.error(e)}setTimeout(tick,60000)},5000);
})();
