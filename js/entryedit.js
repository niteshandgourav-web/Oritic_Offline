/* v4: Entry sudharo (js/entryedit.js)
   Kisi bhi din ki delivery entry theek karna: quantity, rate, product, price. Ek product = ek line.
   - entryEdit(cid,date): Delivery sheet (✎ / value pe double click) aur customer Khata (line pe click) se khulta hai.
   - Sirf owner / office. Har badlav row.ed me likha jata hai (kisne, kab, kya badla, pehle ₹ → ab ₹).
   - Doodh ka rate haath se badla to row.rl=1 lagta hai, taki baad ka "rate badlo" us entry ko na chhede.
   - eeZero(): jin entries me product ka price ₹0 hai unki list, ek rate se sab theek. */
(function(){
const css=document.createElement('style');
css.textContent=`
.ee-top{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:baseline;margin-bottom:6px}
.ee-top b{font-size:17px}.ee-top span{color:var(--muted);font-size:13px}
.ee-h{font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:14px 0 4px}
.ee-ln{border:1px solid var(--line2);border-radius:var(--rs);padding:8px 10px;margin-bottom:6px;background:var(--surface)}
.ee-ln.on{border-color:var(--accent);background:var(--accent-soft)}
.ee-ln.zero{border-color:var(--danger);background:var(--danger-soft)}
.ee-nm{display:flex;justify-content:space-between;align-items:center;gap:8px;font-weight:800;font-size:14.5px}
.ee-nm small{font-weight:600;color:var(--muted)}
.ee-ctl{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:6px}
.ee-ctl .step{flex:0 0 auto}.ee-ctl .step input{width:58px}
.ee-in{width:78px;padding:8px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--fg);font:inherit;font-size:16px;font-weight:700;text-align:right}
.ee-in:focus{outline:2px solid var(--accent);outline-offset:1px}
.ee-u{color:var(--muted);font-size:12.5px;font-weight:700}.ee-x{color:var(--muted);font-weight:800}
.ee-amt{margin-left:auto;font-size:16px}
.ee-del{border:0;background:var(--danger-soft);color:var(--danger);border-radius:8px;min-width:36px;min-height:36px;font-size:15px;cursor:pointer}
.ee-warn{color:var(--danger);font-size:12.5px;font-weight:700;margin-top:6px;display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center}
.ee-warn label{display:inline-flex;gap:5px;align-items:center;color:var(--fg);font-weight:600}
.ee-add{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:4px}
.ee-add select,.ee-add input[type=text]{flex:1 1 150px;min-width:0;padding:9px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--fg);font:inherit}
.ee-tot{display:flex;justify-content:space-between;align-items:center;margin:14px 0 10px;padding:10px 12px;border-radius:var(--rs);background:var(--surface2)}
.ee-tot b{font-size:22px}.ee-tot small{color:var(--muted);font-weight:600}
.ee-log{margin-top:14px;font-size:12.5px;color:var(--muted)}.ee-log div{padding:4px 0;border-top:1px dashed var(--line2)}
.ee-ban{display:block;width:100%;text-align:left;border:1px solid var(--danger);background:var(--danger-soft);color:var(--danger);border-radius:var(--rs);padding:10px 12px;margin-bottom:10px;font:inherit;font-size:14px;cursor:pointer}
.ee-z{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;border:1px solid var(--line2);border-radius:var(--rs);padding:8px 10px;margin-bottom:6px}
.ee-z .g{flex:1 1 160px;min-width:0}.ee-z .g b{display:block}
.ee-zi{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:7px 0;border-top:1px solid var(--line2);font-size:13.5px}
.ee-kbar{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;margin:0 0 8px}
.ee-kbar input{padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--fg);font:inherit}
.phc{display:inline-block;font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--muted);background:var(--surface2);border:1px solid var(--line2);border-radius:6px;padding:1px 6px;margin-left:4px;cursor:pointer;white-space:nowrap;user-select:none}.phc:hover{color:var(--accent-ink);border-color:var(--accent)}
tr.eerow{cursor:pointer}tr.eerow:hover td{background:var(--surface2)}
tr.eerow.sub td{border-top-color:transparent}
`;
document.head.appendChild(css);

/* naam ke saath number + ek click me copy (poore panel me use hota hai) */
window.phc=c=>c&&c.phone?` <span class="phc" role="button" tabindex="0" data-act="copy" data-t="${esc(c.phone)}" title="Number copy karo">${esc(c.phone)} ⧉</span>`:'';
const r2=n=>Math.round((+n||0)*100)/100;
const num=v=>{const n=parseFloat(String(v).replace(',','.'));return n>0?n:0};
const pname=p=>p.k==='desi'?'Gir / Desi cow milk':p.l;
const xlabel=(b,q,u)=>u==='kg'?b+' '+(q<1?Math.round(q*1000)+' g':L(q)+' kg'):q!==1?b+' ×'+L(q):b;
const when=t=>{const d=new Date(t);return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'})+' '+d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'})};
function unitOf(pid,base,e){const p=(pid&&products().find(x=>x.id===pid))||findProd(base);if(p&&p.u)return p.u;if(e&&e.k)return 'kg';return /\d\s*(g|gm|kg)\b/i.test((e&&e.n)||'')?'kg':'pc'}
/* purani / alag shape wali extra entry ko ek saaf line me badlo */
function xin(e){const base=e.base||(e.k?(e.k==='ghee'?'Ghee':'Paneer'):String(e.n||'').replace(/\s*[×x]\s*[\d.]+$/,'').trim());
  const qty=+e.qty||(typeof e.u==='number'?e.u:1);const a=+e.a||0;const rate=e.rate!=null?(+e.rate||0):(qty?r2(a/qty):0);
  return {base,pid:e.pid||'',qty,rate,a,u:unitOf(e.pid,base,e),free:e.free?1:0,orig:e}}
window.eeXin=xin;

let E=null;
function entryEdit(cid,date){
  if(!isOwner())return toast('Sirf owner / office entry theek kar sakta hai');
  const c=S.customers[cid];if(!c||!date)return;
  if(date>todayISO())return toast('Aage ki date ki entry yahan nahi banti — Delivery sheet use karo');
  const old=rowOf(date,cid)||null;const del=!!(old&&old.s==='d');
  const src=del?old:(old&&old.was)||old||{};           // "delivery nahi hui" ke baad wapas lane ke liye was
  const base=window.rateOn?rateOn(c,date):ratesOf(c);
  const milk={};PRODUCTS.forEach(p=>{const r0=src.r&&src.r[p.k]!=null?(+src.r[p.k]||0):(+base[p.k]||0);
    milk[p.k]={q:+(src.q&&src.q[p.k])||(old?0:+(c.order&&c.order[p.k])||0),r:r0,r0}});
  E={cid,date,old,del,milk,x:(src.x||[]).map(xin),note:(old&&old.n)||'',why:'',shown:{},all:0};
  PRODUCTS.forEach(p=>{if(milk[p.k].q>0)E.shown[p.k]=1});if(!Object.keys(E.shown).length)E.all=1;   // jo doodh jata hi nahi uski line chhupi rahe
  draw()}
window.entryEdit=entryEdit;

function milkLine(p){const m=E.milk[p.k];
  return `<div class="ee-ln ${m.q>0?'on':''}" id="eeL_${p.k}"><div class="ee-nm"><span>${pname(p)}</span><b class="ee-amt" id="eeA_${p.k}"></b></div>
   <div class="ee-ctl"><div class="step"><button type="button" data-act="eeStep" data-k="${p.k}" data-n="-0.5" aria-label="Kam">−</button><input type="number" inputmode="decimal" step="0.5" min="0" data-ee="mq" data-k="${p.k}" id="eeQ_${p.k}" value="${L(m.q)}" aria-label="${pname(p)} litre"><button type="button" data-act="eeStep" data-k="${p.k}" data-n="0.5" aria-label="Zyada">+</button></div><span class="ee-u">L</span>
    <span class="ee-x">×</span><span class="ee-u">₹</span><input class="ee-in" type="number" inputmode="decimal" min="0" data-ee="mr" data-k="${p.k}" value="${L(m.r)}" aria-label="${pname(p)} rate"><span class="ee-u">/L</span></div></div>`}
function xLines(){return E.x.map((e,i)=>`<div class="ee-ln ${!e.a&&!e.free?'zero':'on'}" id="eeX_${i}"><div class="ee-nm"><span>${esc(e.base)} <small id="eeG_${i}"></small></span><button type="button" class="ee-del" data-act="eeDel" data-i="${i}" aria-label="${esc(e.base)} hatao" title="Ye product hatao">✕</button></div>
   <div class="ee-ctl"><input class="ee-in" type="number" inputmode="decimal" min="0" step="any" data-ee="xq" data-i="${i}" value="${L(e.qty)}" aria-label="Quantity"><span class="ee-u">${esc(e.u)}</span>
    <span class="ee-x">×</span><span class="ee-u">₹</span><input class="ee-in" type="number" inputmode="decimal" min="0" step="any" data-ee="xr" data-i="${i}" id="eeXR_${i}" value="${L(e.rate)}" aria-label="Rate"><span class="ee-u">/${esc(e.u)}</span>
    <span class="ee-x">=</span><span class="ee-u">₹</span><input class="ee-in" type="number" inputmode="decimal" min="0" step="any" data-ee="xa" data-i="${i}" id="eeXA_${i}" value="${L(e.a)}" aria-label="Total rupaye"></div>
   <div class="ee-warn" id="eeW_${i}" ${e.a?'hidden':''}><span>Price nahi hai — rate ya total ₹ likho</span><label><input type="checkbox" data-ee="xf" data-i="${i}" ${e.free?'checked':''}> Free diya (₹0 sahi hai)</label></div></div>`).join('')||'<div class="small muted" style="padding:4px 0 8px">Koi other product nahi.</div>'}
function hist(){const h=(E.old&&E.old.ed)||[];if(!h.length)return '';
  return `<div class="ee-log"><b>Is entry me pehle ke badlav</b>${h.slice().reverse().map(x=>`<div>${when(x.t)} · ${esc(x.by||'—')}: ${esc(x.d||'badla')}${x.a0!=null?` (${inr(x.a0)} → ${inr(x.a1)})`:''}${x.w?' · '+esc(x.w):''}</div>`).join('')}</div>`}
function draw(){const c=S.customers[E.cid];const opts=products().filter(p=>p.on!==false);
  openSheet(E.del?'Entry sudharo':'Entry jodo',`
   <div class="ee-top"><b>${esc(c.name)}</b><span>${fmtDate(E.date)} · ${esc((E.old&&E.old.by)||c.boy||'')}</span>${E.del?'':`<span class="badge y">${E.old&&E.old.s==='k'?'Is din Skip hai — Save se delivery ban jayegi':'Is din ki entry nahi hai — Save se nayi banegi'}</span>`}</div>
   <div class="ee-h">Doodh — quantity aur us din ka rate</div>${PRODUCTS.map(p=>E.all||E.shown[p.k]?milkLine(p):'').join('')}
   ${E.all?'':`<button type="button" class="btn sm o" data-act="eeAll">+ Doosra doodh (${PRODUCTS.filter(p=>!E.shown[p.k]).map(p=>p.k==='desi'?'Gir':p.sh).join(', ')})</button>`}
   <div class="ee-h">Other products — paneer, ghee, dahi…</div><div id="eeXs">${xLines()}</div>
   <div class="ee-add"><select id="eeP" aria-label="Product chuno">${opts.map(p=>`<option value="${esc(p.id)}">${esc(p.n)} (${esc(p.u||'pc')})</option>`).join('')}<option value="">Naya naam likho…</option></select><input type="text" id="eeN" placeholder="Product ka naam" ${opts.length?'hidden':''}><button type="button" class="btn sm o" data-act="eeAdd">+ Product jodo</button></div>
   <div class="ee-tot"><span>Is din ka total<br><small id="eeWas"></small></span><b id="eeT"></b></div>
   <div class="field"><label class="f" for="eeNote">Note (khate me dikhega)</label><input class="input" id="eeNote" data-ee="note" value="${esc(E.note)}"></div>
   <div class="field"><label class="f" for="eeWhy">Kyon badla? (likhna zaroori nahi)</label><input class="input" id="eeWhy" data-ee="why" placeholder="e.g. rate galat tha, 2 litre gaya tha" value="${esc(E.why)}"></div>
   <button type="button" class="btn p block" data-act="eeSave" style="margin-top:6px">Save karo</button>
   ${E.del?'<button type="button" class="btn d block" data-act="eeSkip" style="margin-top:8px">Is din delivery nahi hui (entry bill se hatao)</button>':''}
   ${hist()}`);
  const sel=$('#eeP');if(sel)sel.onchange=()=>{$('#eeN').hidden=sel.value!==''};
  upd()}
function total(){let a=0;PRODUCTS.forEach(p=>a+=E.milk[p.k].q*E.milk[p.k].r);E.x.forEach(e=>a+=+e.a||0);return r2(a)}
function upd(){if(!E||$('#sheet').hidden)return;
  PRODUCTS.forEach(p=>{const m=E.milk[p.k],el=$('#eeA_'+p.k);if(el)el.textContent=m.q>0?inr(m.q*m.r):'';const ln=$('#eeL_'+p.k);if(ln)ln.classList.toggle('on',m.q>0)});
  E.x.forEach((e,i)=>{const g=$('#eeG_'+i);if(g)g.textContent=e.u==='kg'&&e.qty>0&&e.qty<1?'= '+Math.round(e.qty*1000)+' g':'';
    const ln=$('#eeX_'+i);if(ln){ln.classList.toggle('zero',!e.a&&!e.free);ln.classList.toggle('on',!!e.a||!!e.free)}const w=$('#eeW_'+i);if(w)w.hidden=!!e.a});
  const t=total();$('#eeT').textContent=inr(t);const was=E.del?+E.old.a||0:null;$('#eeWas').textContent=was!=null&&Math.abs(was-t)>0.004?'pehle '+inr(was):''}

document.addEventListener('input',e=>{const t=e.target;if(!E||!t.dataset||!t.dataset.ee)return;const f=t.dataset.ee,v=t.value;
  if(f==='note')E.note=v;else if(f==='why')E.why=v;
  else if(f==='mq')E.milk[t.dataset.k].q=num(v);else if(f==='mr')E.milk[t.dataset.k].r=num(v);
  else{const i=+t.dataset.i,x=E.x[i];if(!x)return;
    if(f==='xf'){x.free=t.checked?1:0}
    else if(f==='xa'){x.a=num(v);x.rate=x.qty?r2(x.a/x.qty):0;const o=$('#eeXR_'+i);if(o)o.value=L(x.rate)}
    else{if(f==='xq')x.qty=num(v);else x.rate=num(v);x.a=r2(x.qty*x.rate);const o=$('#eeXA_'+i);if(o)o.value=L(x.a)}
    if(x.a)x.free=0}
  upd()});
document.addEventListener('change',e=>{const t=e.target;if(E&&t.dataset&&t.dataset.ee==='xf'){const x=E.x[+t.dataset.i];if(x){x.free=t.checked?1:0;upd()}}});
document.addEventListener('dblclick',e=>{const td=e.target.closest('td.shval');if(!td||!td.id||td.id.indexOf('plv_')!==0||!isOwner())return;
  const cid=td.id.slice(4),r=rowOf(S.pld,cid);if(r&&r.s==='d'){e.preventDefault();entryEdit(cid,S.pld)}});

function changes(old,q,r,x){const o=[];const wasD=old&&old.s==='d';const oq=(wasD&&old.q)||{},or=(wasD&&old.r)||{};
  PRODUCTS.forEach(p=>{const a=+oq[p.k]||0,b=q[p.k],nm=p.k==='desi'?'Gir':p.sh;
    if(a!==b)o.push(`${nm} ${L(a)}L → ${L(b)}L`);else if(b>0&&(+or[p.k]||0)!==r[p.k])o.push(`${nm} rate ₹${L(+or[p.k]||0)} → ₹${L(r[p.k])}`)});
  const ox=wasD?(old.x||[]).map(xin):[];const used={};
  x.forEach(e=>{const j=ox.findIndex((z,i)=>!used[i]&&z.base===e.base);if(j<0)return o.push(`+ ${e.n} ${inr(e.a)}`);used[j]=1;const z=ox[j];
    if(z.qty!==e.qty)o.push(`${e.base} ${L(z.qty)} → ${L(e.qty)} ${unitOf(e.pid,e.base,e)}`);
    if(r2(z.a)!==r2(e.a))o.push(`${e.base} ${inr(z.a)} → ${inr(e.a)}`);else if(!!z.free!==!!e.free)o.push(`${e.base} ${e.free?'free mark kiya':'free hataya'}`)});
  ox.forEach((z,i)=>{if(!used[i])o.push(`${z.base} hataya`)});return o}
const logAdd=(old,a0,a1,d,w)=>[...((old&&old.ed)||[]),{t:Date.now(),by:S.me||'',a0,a1,d:String(d||'').slice(0,220),w:String(w||'').trim().slice(0,80)}].slice(-10);

/* kai din ki rows ek saath likho: ek hi render, har din ka ek write */
async function putRows(by){if(!canWrite()){toast('Aapko write permission nahi hai');return false}
  for(const d in by){const day=S.days[d]||(S.days[d]={date:d,rows:{}});Object.assign(day.rows,by[d])}render();
  const FP=firebase.firestore.FieldPath;
  await Promise.all(Object.keys(by).map(d=>queue('day:'+d,()=>S.db.doc('days/'+d).set({date:d,rows:by[d]},{mergeFields:['date',...Object.keys(by[d]).map(cid=>new FP('rows',cid))]}))));return true}

Object.assign(A,{
  eeOpen(d){entryEdit(d.id,d.date)},
  eeOpenDate(d){const v=($('#eeKD')||{}).value;if(!v)return toast('Pehle date chuno');entryEdit(d.id,v)},
  eeStep(d){if(!E)return;const m=E.milk[d.k];m.q=Math.max(0,r2(m.q+(+d.n)));const i=$('#eeQ_'+d.k);if(i)i.value=L(m.q);upd()},
  eeAll(){if(!E)return;E.all=1;draw()},
  eeDel(d){if(!E)return;E.x.splice(+d.i,1);$('#eeXs').innerHTML=xLines();upd()},
  eeAdd(){if(!E)return;const sel=$('#eeP');const p=sel&&sel.value?products().find(x=>x.id===sel.value):null;const name=p?p.n:($('#eeN').value||'').trim();
    if(!name){$('#eeN').hidden=false;$('#eeN').focus();return toast('Product ka naam likho')}
    const q=p||findProd(name);const lr=lastRate(E.cid,q?q.id:'',name);const rate=lr!=null?+lr||0:(q?+q.a||0:0);const u=q&&q.u?q.u:'pc';const qty=u==='kg'?0.25:1;
    E.x.push({base:q?q.n:name,pid:q?q.id:'',qty,rate,a:r2(qty*rate),u,free:0,orig:null});$('#eeXs').innerHTML=xLines();if(!p)$('#eeN').value='';upd();
    const f=$('[data-ee="xq"][data-i="'+(E.x.length-1)+'"]');if(f){f.focus();f.select()}},
  async eeSave(){if(!E)return;const c=S.customers[E.cid],old=E.old||{};const q={},r={...(old.r||ratesOf(c))};
    for(const p of PRODUCTS){const m=E.milk[p.k];if(Math.round(m.q*2)!==m.q*2)return toast(pname(p)+': quantity 0.5 ke step me likho');q[p.k]=m.q;r[p.k]=m.r}
    const x=E.x.filter(e=>e.qty>0&&e.base).map(e=>{const o={...(e.orig||{}),n:xlabel(e.base,e.qty,e.u),base:e.base,pid:e.pid||'',qty:e.qty,rate:e.rate,a:r2(e.a)};if(o.k)o.u=e.qty;delete o.so;delete o.free;if(e.free&&!o.a)o.free=1;return o});
    if(!PRODUCTS.some(p=>q[p.k]>0)&&!x.length)return toast(E.del?'Sab 0 hai — neeche "Is din delivery nahi hui" dabao':'Pehle quantity likho');
    if(PRODUCTS.some(p=>q[p.k]>0&&!r[p.k]))return toast('Doodh ka rate 0 hai — rate likho');
    const a=total();const ch=changes(E.old,q,r,x);const note=E.note.trim();
    if(E.del&&!ch.length&&note===(old.n||'')){closeSheet();E=null;return toast('Kuch nahi badla')}
    const row={...old,s:'d',q,x,r,a,by:old.by||c.boy||'',n:note,t:old.t||Date.now()};delete row.was;
    if(old.rl||PRODUCTS.some(p=>E.milk[p.k].q>0&&E.milk[p.k].r!==E.milk[p.k].r0))row.rl=1;
    if(E.del){if((+old.bo||0)>0){const o=bottlesOf(old.q);if(o.b+o.s===+old.bo){const n=bottlesOf(q);row.bo=n.b+n.s}}}
    else{const prev=deliveredRows(E.cid,null,addDays(E.date,-1)).pop();const n=bottlesOf(q);row.bo=prev&&!(+prev.bo>0)?0:n.b+n.s}
    const items=[...PRODUCTS.filter(p=>q[p.k]>0).map(p=>(p.k==='desi'?'Gir':p.sh)+' '+L(q[p.k])+'L'),...x.map(e=>e.n)].join(', ');
    row.ed=logAdd(old,E.del?+old.a||0:null,a,E.del?(ch.length?ch.join('; '):'Note badla'):(old.s==='k'?'Delivery wapas jodi: ':'Nayi entry jodi: ')+items,E.why);
    const dt=E.date,cid=E.cid;closeSheet();E=null;await writeRows(dt,{[cid]:row});toast('Entry save · '+fmtShort(dt)+' · '+inr(a))},
  async eeSkip(){if(!E||!E.del)return;const keep=E,old=E.old;closeSheet();
    const ok=await confirmBox({title:fmtDate(keep.date)+' ko delivery nahi hui?',html:`Is din ki entry <b>${inr(old.a)}</b> bill se hat jayegi aur din "Skip" dikhega.<div class="small muted" style="margin-top:6px">Galti se dab gaya to isi din ko dobara khol ke Save kar dena, sab wapas aa jayega.</div>`,yes:'Haan, hatao',danger:true});
    if(!ok){E=keep;return draw()}
    const row={...old,s:'k',a:0,bo:0,x:[],n:keep.note.trim(),was:{q:old.q||{},x:old.x||[],r:old.r||{}}};row.ed=logAdd(old,+old.a||0,0,'Delivery nahi hui — entry hatayi',keep.why);
    E=null;await writeRows(keep.date,{[keep.cid]:row});toast('Entry hat gayi · '+fmtShort(keep.date))},
  eeZero(){zeroSheet()},
  async eeZeroGo(d){const inp=document.querySelector('[data-zr="'+CSS.escape(d.b)+'"]');const rate=num(inp&&inp.value);if(!rate)return toast('Pehle rate likho');
    const Z=zeroList().filter(o=>o.z.base===d.b);if(!Z.length)return;const by={};
    Z.forEach(o=>{const day=by[o.d]||(by[o.d]={});const row=day[o.cid]||(day[o.cid]=JSON.parse(JSON.stringify(rowOf(o.d,o.cid))));const e=row.x[o.i];
      Object.assign(e,{base:o.z.base,qty:o.z.qty,rate,a:r2(o.z.qty*rate)});if(e.k)e.u=o.z.qty});
    let n=0;for(const dt in by)for(const cid in by[dt]){const row=by[dt][cid],a0=+row.a||0;row.a=calcAmount(row.q||{},row.x||[],row.r||{});row.ed=logAdd(row,a0,row.a,d.b+' ka rate ₹'+L(rate)+' lagaya');n++}
    if(!(await putRows(by)))return;
    const pm=products();if(pm.some(p=>p.n===d.b&&!(+p.a>0)))saveSettings({...settings(),products:pm.map(p=>p.n===d.b&&!(+p.a>0)?{...p,a:rate}:p)});
    toast(d.b+': '+n+' entries theek ho gayi');if(zeroList().length)zeroSheet();else closeSheet()},
});

/* ---------- ₹0 wali entries ---------- */
function zeroList(){const out=[];for(const d in S.days){const rows=S.days[d].rows||{};for(const cid in rows){const r=rows[cid];if(!r||r.s!=='d'||!S.customers[cid])continue;
    (r.x||[]).forEach((e,i)=>{if(+e.a>0||e.free)return;const z=xin(e);if(z.qty>0)out.push({d,cid,i,z})})}}
  return out.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0)}
window.eeZeroList=zeroList;
function zeroSheet(){const Z=zeroList();if(!Z.length){closeSheet();return toast('Sab entries me price hai 👍')}
  const G={};Z.forEach(o=>{const g=G[o.z.base]||(G[o.z.base]={b:o.z.base,u:o.z.u,n:0,q:0});g.n++;g.q+=o.z.qty});
  const pm=products();
  openSheet('Bina price wali entries',`
   <div class="small muted" style="margin-bottom:10px">Ye product diye gaye the par price ₹0 likha hai, isliye bill kam ban raha hai. Rate likho aur "Sab pe lagao" dabao. Kisi ek entry ka alag price ho to neeche list me us entry ko kholo.</div>
   ${Object.values(G).sort((a,b)=>b.n-a.n).map(g=>{const p=pm.find(x=>x.n===g.b);return `<div class="ee-z"><div class="g"><b>${esc(g.b)}</b><span class="small muted">${g.n} entries · kul ${g.u==='kg'?fq(r2(g.q),'kg'):L(g.q)+' '+esc(g.u)}</span></div>
     <span class="ee-u">₹</span><input class="ee-in" type="number" inputmode="decimal" min="0" step="any" data-zr="${esc(g.b)}" value="${p&&+p.a>0?L(p.a):''}" placeholder="rate" aria-label="${esc(g.b)} rate"><span class="ee-u">/${esc(g.u)}</span>
     <button type="button" class="btn sm p" data-act="eeZeroGo" data-b="${esc(g.b)}">Sab pe lagao</button></div>`}).join('')}
   <div class="ee-h">Ek ek entry (${Z.length})</div>
   ${Z.slice(0,150).map(o=>`<div class="ee-zi"><span><b>${fmtShort(o.d)}</b> · ${esc(S.customers[o.cid].name)}${phc(S.customers[o.cid])} · ${esc(xlabel(o.z.base,o.z.qty,o.z.u))}</span><button type="button" class="btn xs o" data-act="eeOpen" data-id="${o.cid}" data-date="${o.d}" aria-label="Entry kholo">✎</button></div>`).join('')}`)}
const banner=()=>{if(!isOwner())return '';const n=zeroList().length;return n?`<button type="button" class="ee-ban" data-act="eeZero">⚠ <b>${n} entries</b> me product ka price nahi hai (₹0) — bill kam ban raha hai. <u>Theek karo</u></button>`:''};
const _vB=vBills;vBills=function(){const o=_vB();return o&&typeof o.html==='string'?{...o,html:banner()+o.html}:o};
const _vH=vHome;vHome=function(){const o=_vH();return o&&typeof o.html==='string'?{...o,html:banner()+o.html}:o};
})();
