/* Oritic v3 · business layer
 * Team & cash (kiske haath me kitna cash, handover, bank), har person ka account,
 * Purchase & kharcha (maal, kharcha, supplier udhaar), Vasooli (baki wasool),
 * Bottles doodh ke type se, Meter (time + reading), Demand ko supplier tak bhejna, Dashboard ke business cards.
 * Uses globals of index.html, js/bulk.js (window.OB, confirmBox, allBalances) and js/account.js (ledger, rcvLabel).
 */
'use strict';
(()=>{
const OBX=window.OB||{};
const confirmBox=window.confirmBox;
const CSS=`
.navgrp{font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:12px 12px 4px}
.navgrp.line{padding:0;margin:8px 10px 4px;border-top:1px solid var(--line2)}
.navdot{margin-left:auto;background:var(--danger);color:#fff;border-radius:99px;font-size:10.5px;font-weight:800;padding:1px 6px;font-style:normal}
.kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.kpi .card{padding:12px 14px}.kpi .l{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.kpi .v{font-size:21px;font-weight:800;margin-top:2px}.kpi .s{font-size:12px;color:var(--muted);margin-top:2px}
.alist{display:grid;gap:6px;margin-top:8px}.al{display:flex;gap:10px;align-items:center;padding:8px 12px;border-radius:10px;font-size:13.5px;font-weight:600;text-align:left;width:100%}
.al.r{background:var(--danger-soft);color:var(--danger)}.al.y{background:var(--warn-soft);color:var(--warn)}.al.b{background:var(--info-soft);color:var(--info)}.al .go{margin-left:auto;font-weight:800;white-space:nowrap}
.btx{display:grid;grid-template-columns:1.3fr repeat(3,1fr);gap:1px;background:var(--line2);border:1px solid var(--line2);border-radius:10px;overflow:hidden;font-size:13px}
.btx>div{background:var(--surface);padding:6px 10px;text-align:right}.btx>div:nth-child(4n+1){text-align:left;font-weight:700}.btx .h{font-size:11px;color:var(--muted);font-weight:800}
.frm{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}.frm .w2{grid-column:span 2}
@media (max-width:560px){.frm .w2{grid-column:auto}}
.tbl td.act{white-space:nowrap;text-align:right}
.mini{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--line2);font-size:13.5px}.mini:last-child{border-bottom:0}
`;
const st0=document.createElement('style');st0.textContent=CSS;document.head.appendChild(st0);
/* side menu: icon rail, opens on hover; pin keeps it open (saved per computer) */
const navPinSet=on=>{document.body.classList.toggle('navpin',on);const b=document.querySelector('.navpinb');if(b){b.setAttribute('aria-pressed',String(on));b.title=on?'Menu apne aap chhupne do':'Menu hamesha khula rakho';b.setAttribute('aria-label',b.title)}};
try{navPinSet(localStorage.getItem('oritic.navPin')==='1')}catch(_){}
Object.assign(A,{navPin(){const on=!document.body.classList.contains('navpin');navPinSet(on);try{localStorage.setItem('oritic.navPin',on?'1':'0')}catch(_){}}});

/* ---------- small helpers ---------- */
const staffL=()=>Array.isArray(settings().staff)?settings().staff.filter(Boolean):[];
const persons=()=>[...new Set(['Owner',...staffL(),...boys()])];
const isBoy=p=>boys().includes(p);
const pl=v=>v==='Owner'?'Owner / Office':String(v||'');
const viaP=p=>p.via||p.by||'';
const two=(el,txt,cls)=>{if(el.dataset.c==='1')return true;el.dataset.c='1';el.dataset.o=el.textContent;el.textContent=txt||'Pakka?';el.classList.add(cls||'d');setTimeout(()=>{if(el.isConnected){el.dataset.c='';el.textContent=el.dataset.o;el.classList.remove(cls||'d')}},3000);return false};
const dtl=t=>new Date(t).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
const xlsxSave=async(name,sheets)=>{let XL;try{XL=await loadXLSX()}catch(e){toast(e.message);return}const wb=XL.utils.book_new();sheets.forEach(([n,rows,cols])=>{const ws=Array.isArray(rows[0])?XL.utils.aoa_to_sheet(rows):XL.utils.json_to_sheet(rows);if(cols)ws['!cols']=cols.map(w=>({wch:w}));XL.utils.book_append_sheet(wb,ws,n)});
  saveFile(name,new Blob([XL.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))};

/* ---------- routes + grouped menu ---------- */
ROUTES.push({id:'dues',l:'Vasooli',t:'Vasooli · kis se kitna lena hai'},{id:'team',l:'Team & cash',t:'Team & cash hisab'},{id:'guide',l:'Guide',t:'Panel kaise use karein'});
{const r=ROUTES.find(x=>x.id==='purchase');r.l='Kharcha';r.t='Purchase & kharcha';ROUTES.find(x=>x.id==='forecast').t='Demand · kya chahiye, kisko bhejna hai';}
ICONS.dues='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 8h6M9 11h6M13 8c0 2.6-1.6 3-4 3l4 5"/></svg>';
ICONS.team='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h15a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z"/><path d="M3 8l11-4v4"/><circle cx="16.5" cy="14" r="1.3"/></svg>';
ICONS.guide=ICONS.help;
window.WIDE_ROUTES=['dues','team','purchase','bottles'];
window.EXTRA_VIEWS={...(window.EXTRA_VIEWS||{}),dues:()=>vDues(),team:()=>vTeam()};
const NAVG=[['Roz ka kaam',['home','sheet','today']],['Customers & paisa',['customers','dues','bills','payments']],['Maal & kharcha',['forecast','purchase','products','bottles']],['Team',['team','odo']],['',['guide','settings']]];
const _nav=nav;
nav=function(){_nav();if(!isOwner())return;const R=visibleRoutes();const used=new Set();const pend=Object.values(S.cash||{}).filter(x=>x.type==='handover'&&x.status==='pending').length;
  const btn=r=>`<button class="navbtn ${S.route===r.id?'on':''}" data-act="go" data-r="${r.id}">${ICONS[r.id]||ICONS.more}<span>${r.l}</span>${r.id==='team'&&pend?`<i class="navdot">${pend}</i>`:''}</button>`;
  let h='';NAVG.forEach(([g,ids])=>{const rs=ids.map(id=>R.find(r=>r.id===id)).filter(Boolean);if(!rs.length)return;h+=g?`<div class="navgrp">${g}</div>`:'<div class="navgrp line"></div>';rs.forEach(r=>{used.add(r.id);h+=btn(r)})});
  R.filter(r=>!used.has(r.id)).forEach(r=>h+=btn(r));
  $('#snav').innerHTML=h+`<div class="navhint"><span class="kbd">Ctrl</span> <span class="kbd">K</span> dhoondo<br><span class="kbd">?</span> shortcuts</div>`};

/* =====================================================================
   CASH: kiske haath me kitna cash
   ===================================================================== */
S.cash=S.cash||{};S.pc={id:null,tab:'cash',m:todayISO().slice(0,7),all:false};
const cashFrom=()=>settings().cashFrom||'';
const got=x=>x.got!=null?+x.got:(+x.amt||0);
function cashAll(){const H={};persons().forEach(p=>H[p]=0);const add=(p,n)=>{if(!p)return;H[p]=(H[p]||0)+n};const from=cashFrom();const ok=d=>!from||d>=from;
  for(const p of Object.values(S.payments))if(p.mode==='cash'&&ok(p.date))add(viaP(p),+p.amt||0);
  for(const x of Object.values(S.cash)){if(x.status!=='ok'||!ok(x.date))continue;
    if(x.type==='handover'){add(x.from,-got(x));add(x.to,got(x))}else if(x.type==='bank')add(x.from,-(+x.amt||0));else if(x.type==='suppay'){if(x.mode==='cash')add(x.from,-(+x.amt||0))}else if(x.type==='adjust')add(x.to,+x.amt||0)}
  for(const p of Object.values(S.purchases||{}))if(p.mode==='cash'&&p.paidBy&&ok(p.date))add(p.paidBy,-(+p.amt||0));
  for(const a of Object.values(S.adjust||{}))if(a.type==='refund'&&a.mode==='cash'&&a.via&&ok(a.date))add(a.via,-(+a.amt||0));
  return H}
const cashInHand=p=>cashAll()[p]||0;
function cashMoves(person){const from=cashFrom();const ok=d=>!from||d>=from;const E=[];
  for(const p of Object.values(S.payments)){if(p.mode!=='cash'||viaP(p)!==person||!ok(p.date))continue;const c=S.customers[p.cid];E.push({date:p.date,t:p.t||0,part:'Customer se cash · '+(c?c.name:'(deleted customer)')+(p.note?' · '+p.note:''),in:+p.amt||0})}
  for(const x of Object.values(S.cash)){if(x.status==='rejected'||!ok(x.date))continue;const b={date:x.date,t:x.t||0,cb:x.id};
    if(x.type==='handover'){
      if(x.from===person)E.push(x.status==='ok'?{...b,part:pl(x.to)+' ko diya (mila ✓'+(got(x)!==+x.amt?', likha '+inr(x.amt):'')+')'+(x.note?' · '+x.note:''),out:got(x)}:{...b,part:pl(x.to)+' ko '+inr(x.amt)+' diya · confirm baaki'+(x.note?' · '+x.note:''),cls:'info'});
      if(x.to===person&&x.status==='ok')E.push({...b,part:pl(x.from)+' se mila'+(x.note?' · '+x.note:''),in:got(x)})}
    else if(x.status!=='ok')continue;
    else if(x.type==='bank'&&x.from===person)E.push({...b,part:'Bank me jama'+(x.note?' · '+x.note:''),out:+x.amt||0});
    else if(x.type==='suppay'&&x.from===person&&x.mode==='cash')E.push({...b,part:'Supplier ko diya · '+x.to+(x.note?' · '+x.note:''),out:+x.amt||0});
    else if(x.type==='adjust'&&x.to===person){const a=+x.amt||0;E.push({...b,part:'Sudhaar'+(x.note?' · '+x.note:''),in:a>0?a:0,out:a<0?-a:0})}}
  for(const p of Object.values(S.purchases||{})){if(p.mode!=='cash'||p.paidBy!==person||!ok(p.date))continue;E.push({date:p.date,t:p.t||0,part:(p.kind==='kharcha'?'Kharcha · '+(p.cat||'')+(p.item&&p.item!==p.cat?' · '+p.item:''):'Maal khareeda · '+p.item)+(p.person?' · '+pl(p.person)+' ko':''),out:+p.amt||0})}
  for(const a of Object.values(S.adjust||{})){if(a.type!=='refund'||a.mode!=='cash'||a.via!==person||!ok(a.date))continue;const c=S.customers[a.cid];E.push({date:a.date,t:a.t||0,part:'Customer ko paisa wapas · '+(c?c.name:'(deleted customer)')+(a.note?' · '+a.note:''),out:+a.amt||0})}
  return E.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.t-b.t)}
function cashWrite(id,doc){if(!canWrite()){toast('Aapko write permission nahi hai');return Promise.resolve()}S.cash[id]={...(S.cash[id]||{}),id,...doc};render();return queue('cash:'+id,()=>S.db.doc('cashbook/'+id).set(doc,{merge:true}))}
const cbLabel=x=>x.type==='handover'?pl(x.from)+' → '+pl(x.to):x.type==='bank'?pl(x.from)+' → Bank':x.type==='suppay'?pl(x.from)+' → Supplier '+x.to+' ('+({cash:'Cash',upi:'UPI',bank:'Bank'}[x.mode]||'')+')':'Sudhaar · '+pl(x.to);
const cbStatus=x=>x.status==='pending'?'<span class="badge y">Confirm baaki</span>':x.status==='rejected'?'<span class="badge r">Radd</span>':'<span class="badge g">Pakka</span>';

function handForm(from){const P=persons(),H=cashAll();const me=isOwner()?(from||P.find(p=>isBoy(p))||'Owner'):S.me;const to0=me==='Owner'?(staffL()[0]||P.find(p=>p!=='Owner')||''):(isOwner()?(S.me||'Owner'):'Owner');
  const opt=sel=>P.map(p=>`<option value="${esc(p)}" ${p===sel?'selected':''}>${esc(pl(p))} · haath me ${inr(H[p]||0)}</option>`).join('');
  openSheet('Cash handover',`<div class="stack"><div class="small muted">Cash ek haath se doosre haath me gaya, uski entry. ${isOwner()?'Office ki entry seedha pakki hoti hai.':'Office "Mila ✓" dabayega tab pakka hoga. Tab tak ye cash aapke paas hi gina jayega.'}</div>
    <div class="grid g2"><div class="field"><label class="f">Kisne diya</label><select class="input" id="hoF" ${isOwner()?'':'disabled'}>${opt(me)}</select></div><div class="field"><label class="f">Kisko diya</label><select class="input" id="hoT">${opt(to0)}</select></div></div>
    <div class="grid g2"><div class="field"><label class="f">Amount ₹ *</label><input class="input" id="hoA" type="number" inputmode="decimal" min="0" placeholder="${inr(H[me]||0)} haath me"></div><div class="field"><label class="f">Date</label><input class="input" id="hoD" type="date" value="${todayISO()}" max="${todayISO()}"></div></div>
    <div class="field"><label class="f">Note</label><input class="input" id="hoN" placeholder="optional"></div>
    <button class="btn p block" data-act="hoSave">Save</button></div>`);setTimeout(()=>{const a=$('#hoA');if(a)a.focus()},40)}
function personForm(title,act,p,amtLabel,hint,signed){const P=persons(),H=cashAll();
  openSheet(title,`<div class="stack"><div class="small muted">${hint}</div>
    <div class="field"><label class="f">Kaun</label><select class="input" id="pfP">${P.map(x=>`<option value="${esc(x)}" ${x===(p||'Owner')?'selected':''}>${esc(pl(x))} · haath me ${inr(H[x]||0)}</option>`).join('')}</select></div>
    <div class="grid g2"><div class="field"><label class="f">${amtLabel}</label><input class="input" id="pfA" type="number" inputmode="decimal" ${signed?'':'min="0"'}></div><div class="field"><label class="f">Date</label><input class="input" id="pfD" type="date" value="${todayISO()}" max="${todayISO()}"></div></div>
    <div class="field"><label class="f">Note</label><input class="input" id="pfN" placeholder="optional"></div>
    <button class="btn p block" data-act="${act}">Save</button></div>`);setTimeout(()=>{const a=$('#pfA');if(a)a.focus()},40)}

Object.assign(A,{
  hoForm(d){handForm(d&&d.p)},
  hoSave(){const from=$('#hoF').value,to=$('#hoT').value,amt=+$('#hoA').value;if(!from||!to||from===to)return toast('Dene wala aur lene wala alag hone chahiye');if(!(amt>0))return toast('Amount likho');
    const ok=isOwner();const id=uid();const doc={type:'handover',from,to,amt,date:$('#hoD').value||todayISO(),note:$('#hoN').value.trim(),by:S.me||'',t:Date.now(),status:ok?'ok':'pending'};if(ok){doc.got=amt;doc.okBy=S.me||'';doc.okAt=Date.now()}
    closeSheet();cashWrite(id,doc).then(()=>toast(ok?'Handover save: '+pl(from)+' → '+pl(to)+' '+inr(amt):'Office ko bhej diya. "Mila ✓" hone tak cash aapke paas gina jayega'))},
  hoOkForm(d){const x=S.cash[d.id];if(!x)return;openSheet('Cash mila?',`<div class="stack"><div><b>${esc(pl(x.from))}</b> ne likha: <b>${inr(x.amt)}</b> ${esc(pl(x.to))} ko diye · ${fmtDate(x.date)}${x.note?' · '+esc(x.note):''}</div>
    <div class="field"><label class="f">Ginke kitna mila ₹</label><input class="input" id="hkA" type="number" inputmode="decimal" value="${x.amt}"></div>
    <div class="small muted">Kam mila to utna hi likho. Farak dene wale ke haath me hi gina jayega.</div>
    <div class="row"><button class="btn p grow" data-act="hoOkSave" data-id="${x.id}">✓ Mila</button><button class="btn d" data-act="hoNo" data-id="${x.id}">Nahi mila</button></div></div>`)},
  hoOkSave(d){const x=S.cash[d.id];if(!x)return;const g=+$('#hkA').value;if(!(g>=0)||$('#hkA').value==='')return toast('Amount likho');closeSheet();cashWrite(d.id,{status:'ok',got:g,okBy:S.me||'',okAt:Date.now()}).then(()=>toast('Cash mil gaya: '+inr(g)))},
  hoNo(d,el){if(!two(el,'Pakka nahi mila?'))return;closeSheet();cashWrite(d.id,{status:'rejected',okBy:S.me||'',okAt:Date.now()}).then(()=>toast('Entry radd kar di'))},
  bankForm(d){personForm('Bank me jama','bankSave',d&&d.p,'Amount ₹ *','Jisne cash bank me jama kiya uske haath se utna cash kam ho jayega.')},
  bankSave(){const p=$('#pfP').value,amt=+$('#pfA').value;if(!(amt>0))return toast('Amount likho');const doc={type:'bank',from:p,amt,date:$('#pfD').value||todayISO(),note:$('#pfN').value.trim(),by:S.me||'',t:Date.now(),status:'ok'};closeSheet();cashWrite(uid(),doc).then(()=>toast('Bank jama save: '+inr(amt)))},
  cadjForm(d){personForm('Cash sudhaar','cadjSave',d&&d.p,'Amount ₹ (+ ya −) *','Sirf galti theek karne ya shuruaat ka cash likhne ke liye. + likhoge to haath ka cash badhega, − se ghatega.',true)},
  cadjSave(){const p=$('#pfP').value,amt=+$('#pfA').value;if(!amt)return toast('Amount likho (+ ya −)');const doc={type:'adjust',to:p,amt,date:$('#pfD').value||todayISO(),note:$('#pfN').value.trim(),by:S.me||'',t:Date.now(),status:'ok'};closeSheet();cashWrite(uid(),doc).then(()=>toast('Sudhaar save'))},
  cbRadd(d,el){if(!isOwner())return;if(!two(el,'Pakka radd?'))return;cashWrite(d.id,{status:'rejected',okBy:S.me||'',okAt:Date.now()}).then(()=>toast('Entry radd. Record me rahegi, hisab se hat gayi'))},
  tmSave(){if(!isOwner())return;saveSettings({...settings(),cashFrom:$('#tmFrom').value||'',cashLimit:+$('#tmLim').value||0}).then(()=>toast('Saved'))},
  pcOpen(d){S.pc.id=d.p;S.pc.tab='cash';pcDraw(true)},
  pcClose(){pcClose()},
  pcTab(d){S.pc.tab=d.v;pcDraw(true)},
  pcAll(){S.pc.all=!S.pc.all;pcDraw(false)},
  pcPay(){const p=S.pc.id;pcClose();S.pk={kind:'kharcha',tab:'day',pre:{cat:'Salary',person:p}};S.purd=todayISO();A.go({r:'purchase'});setTimeout(()=>{const a=$('#kxA');if(a)a.focus()},60)}
});

/* ---------- Team & cash page ---------- */
function vTeam(){const H=cashAll(),today=todayISO(),m=today.slice(0,7),[mf,mt]=periodRange(m,'full');const P=[...new Set([...persons(),...Object.keys(H).filter(k=>Math.abs(H[k])>0.5)])];
  const pend=Object.values(S.cash).filter(x=>x.type==='handover'&&x.status==='pending').sort((a,b)=>(a.t||0)-(b.t||0));
  const tp=Object.values(S.payments).filter(p=>p.date===today);const lim=+(settings().cashLimit??2000);
  const bankM=sum(Object.values(S.cash).filter(x=>x.type==='bank'&&x.status==='ok'&&x.date>=mf&&x.date<=mt),x=>x.amt);
  const rows=P.map(p=>{const tc=sum(tp.filter(x=>viaP(x)===p&&x.mode==='cash'),x=>x.amt),tu=sum(tp.filter(x=>viaP(x)===p&&x.mode!=='cash'),x=>x.amt);
    let del='<span class="muted">–</span>';if(isBoy(p)){const Ls=todaysList(today,p);del=`<b>${Ls.filter(x=>x.r&&x.r.s==='d').length}</b>/${Ls.length}`}
    const km=Object.values(S.kms).filter(k=>k.boy===p&&k.date.slice(0,7)===m);const pn=sum(pend.filter(x=>x.from===p),x=>x.amt);const h=H[p]||0;const over=lim>0&&h>lim;
    return `<tr class="click" data-act="pcOpen" data-p="${esc(p)}"><td><b>${esc(pl(p))}</b><div class="small muted">${esc(subLine(p))}</div></td>
     <td class="n" style="font-weight:800;font-size:15px;color:${over?'var(--danger)':'inherit'}">${inr(h)}${over?'<div class="small" style="font-weight:600">limit se zyada</div>':''}</td>
     <td class="n">${pn?`<span class="badge y">${inr(pn)} confirm baaki</span>`:'<span class="muted">–</span>'}</td>
     <td class="n">${tc||tu?`${inr(tc)} <span class="small muted">cash</span>${tu?`<div class="small muted">${inr(tu)} UPI</div>`:''}`:'<span class="muted">–</span>'}</td>
     <td class="n">${del}</td><td class="n">${km.length?`${L(sum(km,k=>k.km))} km<div class="small muted">${inr(sum(km,k=>k.inc))}</div>`:'<span class="muted">–</span>'}</td><td class="act"><span class="btn xs o">Account ›</span></td></tr>`}).join('');
  const rec=Object.values(S.cash).sort((a,b)=>(b.t||0)-(a.t||0)).slice(0,15);
  const html=`<div class="stack">
   <div class="row sp wrap"><div class="small muted" style="max-width:640px">Cash kiske haath me hai, kisne office ko diya, bank me kitna gaya. UPI seedha company ke account me jata hai, isliye kisi ke haath me nahi gina jata.</div>
    <div class="row wrap">${isAdmin()?'<button class="btn o" data-act="tmNew">+ Naya member</button><button class="btn o" data-act="tmHand">⇄ Boy badlo (route handover)</button>':''}${isAdmin()?'<button class="btn o" data-act="pmOpen">🔑 Office access</button>':''}<button class="btn o" data-act="lvOpen">🏖 Chhutti / badli</button><button class="btn o" data-act="bsOpen">📄 Boy sheets</button><button class="btn o" data-act="dbkOpen">☁ Drive backup</button><button class="btn p" data-act="hoForm">+ Cash handover</button><button class="btn" data-act="bankForm">+ Bank me jama</button><button class="btn o" data-act="cadjForm">Sudhaar</button></div></div>
   <div class="kpi"><div class="card"><div class="l">Sabke haath me cash</div><div class="v">${inr(sum(Object.values(H),v=>v))}</div><div class="s">${cashFrom()?fmtShort(cashFrom())+' se gina':'shuru se gina'}</div></div>
    <div class="card"><div class="l">Handover confirm baaki</div><div class="v" style="color:${pend.length?'var(--warn)':'inherit'}">${pend.length}</div><div class="s">${inr(sum(pend,x=>x.amt))}</div></div>
    <div class="card"><div class="l">Aaj cash aaya</div><div class="v">${inr(sum(tp.filter(x=>x.mode==='cash'),x=>x.amt))}</div><div class="s">customers se</div></div>
    <div class="card"><div class="l">Aaj UPI aaya</div><div class="v">${inr(sum(tp.filter(x=>x.mode!=='cash'),x=>x.amt))}</div><div class="s">seedha account me</div></div>
    <div class="card"><div class="l">${fmtMonth(m)} bank jama</div><div class="v">${inr(bankM)}</div></div></div>
   ${pend.length?`<div class="card"><h3>Ye cash office ko mila ya nahi?</h3><div class="list" style="margin-top:6px">${pend.map(x=>`<div class="item"><div class="grow"><div class="t">${esc(pl(x.from))} → ${esc(pl(x.to))} · ${inr(x.amt)}</div><div class="s">${fmtDate(x.date)} · likha ${esc(pl(x.by))} ne${x.note?' · '+esc(x.note):''}</div></div><button class="btn sm p" data-act="hoOkForm" data-id="${x.id}">✓ Mila</button><button class="btn sm o" data-act="hoNo" data-id="${x.id}">Nahi mila</button></div>`).join('')}</div></div>`:''}
   <div class="card" style="padding:0"><div class="scroll"><table class="tbl"><thead><tr><th>Kaun</th><th class="n">Haath me cash</th><th class="n">Handover</th><th class="n">Aaj liya</th><th class="n">Aaj delivery</th><th class="n">${fmtMonth(m)} KM</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>
   ${(()=>{const X=Object.keys(teamAll()).filter(p=>!isActiveP(p)).sort();return X.length?`<div class="card"><h3>Purane member (kaam chhod diya)</h3><div class="row wrap" style="margin-top:6px">${X.map(p=>`<button class="chip" data-act="pcOpen" data-p="${esc(p)}">${esc(p)}</button>`).join('')}</div><div class="small muted" style="margin-top:6px">Click karke purana hisab dekho ya wapas kaam pe lao.</div></div>`:''})()}
   <div class="card"><h3>Haal ki cash entries</h3><div style="margin-top:6px">${rec.map(x=>`<div class="mini"><span>${fmtShort(x.date)} · <b>${esc(cbLabel(x))}</b>${x.note?' · '+esc(x.note):''} <span class="small muted">· ${esc(pl(x.by))}</span></span><span style="white-space:nowrap"><b>${inr(x.type==='handover'&&x.status==='ok'?got(x):x.amt)}</b> ${cbStatus(x)} ${x.status!=='rejected'?`<button class="btn xs" data-act="cbRadd" data-id="${x.id}">Radd</button>`:''}</span></div>`).join('')||'<div class="small muted">Abhi koi entry nahi. Boy ne office ko cash diya ho to "+ Cash handover" dabao.</div>'}</div></div>
   <div class="card"><h3>Cash hisab ki setting</h3><div class="grid g3" style="margin-top:8px"><div class="field"><label class="f">Hisab kis date se gino</label><input class="input" type="date" id="tmFrom" value="${esc(cashFrom())}"><div class="small muted" style="margin-top:4px">Khaali = shuru se. Naya mahina fresh shuru karna ho to wo date daalo.</div></div>
     <div class="field"><label class="f">Haath me cash ki limit ₹</label><input class="input" type="number" id="tmLim" value="${lim}"><div class="small muted" style="margin-top:4px">Isse zyada cash kisi ke paas ho to laal dikhega. 0 = band.</div></div><div class="field" style="align-self:flex-start;padding-top:22px"><button class="btn p" data-act="tmSave">Save</button></div></div></div></div>`;
  return {html}}

/* ---------- person account window (boy / office) ---------- */
function pcEl(){let el=$('#pacct');if(!el){el=document.createElement('div');el.id='pacct';el.className='acct';el.hidden=true;document.body.appendChild(el);el.addEventListener('click',e=>{if(e.target===el)pcClose()})}return el}
function pcClose(){const el=$('#pacct');if(el){el.hidden=true;el.innerHTML=''}S.pc.id=null;if($('#sheet').hidden&&!(S.ac&&S.ac.id))document.body.style.overflow=''}
function pcDraw(fresh){const p=S.pc.id;if(!p)return;const el=pcEl();const b=$('#pcBody');const sc=!fresh&&b?b.scrollTop:0;const wasOpen=!el.hidden&&el.innerHTML;
  const tabs=[...(p!=='Owner'?[['prof','Profile']]:[]),['cash','Cash khata'],['coll','Collection'],...(isBoyP(p)?[['del','Delivery'],['bot','Bottles'],['km','KM & petrol']]:[]),...(p!=='Owner'?[['hisab','Hisab / incentive']]:[]),['pay','Salary / advance']];if(!tabs.some(t=>t[0]===S.pc.tab))S.pc.tab='cash';
  const body={prof:pcProf,cash:pcCash,coll:pcColl,del:pcDel,bot:pcBot,km:pcKm,hisab:pcHisab,pay:pcPayT}[S.pc.tab](p);
  el.innerHTML=`<div class="ac-panel ${wasOpen?'':'anim'}" role="dialog" aria-modal="true" aria-label="${esc(pl(p))} ka account"><div class="ac-hd">${pcHead(p)}<div class="ac-tabs">${tabs.map(([k,l])=>`<button class="${S.pc.tab===k?'on':''}" data-act="pcTab" data-v="${k}">${l}</button>`).join('')}</div></div><div class="ac-bd" id="pcBody">${body}</div></div>`;
  el.hidden=false;document.body.style.overflow='hidden';$('#pcBody').scrollTop=sc}
function pcHead(p){const h=cashInHand(p),lim=+(settings().cashLimit??2000),m=S.pc.m,[mf,mt]=periodRange(m,'full');
  const pay=Object.values(S.payments).filter(x=>viaP(x)===p&&x.date>=mf&&x.date<=mt);const pcash=sum(pay.filter(x=>x.mode==='cash'),x=>x.amt),pupi=sum(pay.filter(x=>x.mode!=='cash'),x=>x.amt);
  const pn=Object.values(S.cash).filter(x=>x.type==='handover'&&x.status==='pending'&&x.from===p);const km=Object.values(S.kms).filter(k=>k.boy===p&&k.date.slice(0,7)===m);
  const sal=Object.values(S.purchases||{}).filter(x=>x.person===p&&x.date>=mf&&x.date<=mt);
  return `<div class="ac-top"><h2 class="grow">${esc(pl(p))}</h2><button class="btn sm o" data-act="pcClose" title="Band karo (Esc)" aria-label="Band karo">✕</button></div>
   <div class="row wrap" style="gap:6px;margin-top:6px">${pcBadges(p)}</div>
   <div class="ac-stats"><div class="ac-stat"><div class="l">Haath me cash</div><div class="v" style="color:${lim>0&&h>lim?'var(--danger)':'inherit'}">${inr(h)}</div><div class="s">${pn.length?inr(sum(pn,x=>x.amt))+' handover confirm baaki':'abhi tak ka'}</div></div>
    <div class="ac-stat"><div class="l">${fmtMonth(m)} collection</div><div class="v">${inr(pcash+pupi)}</div><div class="s">Cash ${inr(pcash)} · UPI ${inr(pupi)}</div></div>
    ${isBoyP(p)?`<div class="ac-stat"><div class="l">${fmtMonth(m)} KM</div><div class="v">${L(sum(km,k=>k.km))} km</div><div class="s">incentive ${inr(sum(km,k=>k.inc))} · ${km.length} din</div></div>`:''}
    ${p==='Owner'?`<div class="ac-stat"><div class="l">${fmtMonth(m)} salary / advance diya</div><div class="v">${inr(sum(sal,x=>x.amt))}</div><div class="s">${sal.length} entries</div></div>`:(()=>{const H=payCalc(p,m),b=H.total-H.paid;return `<div class="ac-stat"><div class="l">${fmtMonth(m)} hisab (bana)</div><div class="v">${inr(H.total)}</div><div class="s">diya ${inr(H.paid)} · ${b>=0?'baaki '+inr(b):'zyada '+inr(-b)}</div></div>`})()}</div>
   <div class="ac-acts"><button class="btn sm p" data-act="hoForm" data-p="${esc(p)}">Cash handover</button><button class="btn sm" data-act="bankForm" data-p="${esc(p)}">Bank me jama</button><button class="btn sm" data-act="pcPay">Salary / advance do</button>
    <input type="month" class="input" style="width:auto;padding:5px 8px" value="${m}" data-pcm aria-label="Mahina"></div>`}
function pcCash(p){const E=cashMoves(p),all=S.pc.all,[mf,mt]=periodRange(S.pc.m,'full');const before=all?[]:E.filter(e=>e.date<mf),cur=all?E:E.filter(e=>e.date>=mf&&e.date<=mt);
  const opening=sum(before,e=>(e.in||0)-(e.out||0));const Lg=window.ledger(opening,cur.map(e=>({...e,dr:e.in||0,cr:e.out||0})));const ti=sum(cur,e=>e.in),to=sum(cur,e=>e.out);
  return `<div class="ac-bar"><div class="seg"><button class="${all?'':'on'}" data-act="pcAll">${fmtMonth(S.pc.m)}</button><button class="${all?'on':''}" data-act="pcAll">Shuru se</button></div><span class="small muted">Sirf cash. UPI seedha account me jata hai.</span></div>
   <div class="ac-card np"><table class="ldg"><thead><tr><th>Date</th><th>Kya hua</th><th class="n">Cash aaya</th><th class="n">Cash gaya</th><th class="n">Haath me</th><th></th></tr></thead><tbody>
    <tr class="ob"><td></td><td>${all?'Shuruaat':'Pichla (mahine se pehle haath me)'}</td><td></td><td></td><td class="n">${inr(opening)}</td><td></td></tr>
    ${Lg.map(e=>`<tr class="${e.cls||''}"><td class="dt">${fmtShort(e.date)}</td><td>${esc(e.part)}</td><td class="n c">${e.in?inr(e.in):''}</td><td class="n">${e.out?inr(e.out):''}</td><td class="n bal">${e.in||e.out?inr(e.bal):''}</td><td>${e.cb&&isOwner()?`<button class="btn xs" data-act="cbRadd" data-id="${e.cb}">Radd</button>`:''}</td></tr>`).join('')||'<tr><td colspan="6" class="muted">Is period me koi cash entry nahi</td></tr>'}
    <tr class="tot"><td></td><td>Total · ab haath me</td><td class="n">${inr(ti)}</td><td class="n">${inr(to)}</td><td class="n">${inr(opening+ti-to)}</td><td></td></tr></tbody></table></div>`}
function pcColl(p){const [mf,mt]=periodRange(S.pc.m,'full');const R=Object.values(S.adjust||{}).filter(a=>a.type==='refund'&&a.via===p&&a.date>=mf&&a.date<=mt).sort((a,b)=>b.date.localeCompare(a.date));const P=Object.values(S.payments).filter(x=>viaP(x)===p&&x.date>=mf&&x.date<=mt).sort((a,b)=>b.date.localeCompare(a.date)||(b.t||0)-(a.t||0));
  return `<div class="ac-card"><h3>${fmtMonth(S.pc.m)} me ${esc(pl(p))} ne customers se liya: ${inr(sum(P,x=>x.amt))}</h3><div class="row wrap"><span class="bchip">Cash ${inr(sum(P.filter(x=>x.mode==='cash'),x=>x.amt))}</span><span class="bchip">UPI ${inr(sum(P.filter(x=>x.mode!=='cash'),x=>x.amt))}</span><span class="bchip">${P.length} payments</span></div></div>
   <div class="ac-card np"><table class="ldg"><thead><tr><th>Date</th><th>Customer</th><th class="n">Amount</th><th>Mode</th><th>Note</th></tr></thead><tbody>${P.map(x=>{const c=S.customers[x.cid];return `<tr><td class="dt">${fmtShort(x.date)}</td><td>${c?`<button class="acopen" style="width:auto;padding:0" data-act="openCustomer" data-id="${c.id}">${esc(c.name)}${window.phc?phc(c):''} ↗</button>`:'(deleted customer)'}</td><td class="n"><b>${inr(x.amt)}</b></td><td>${x.mode==='cash'?'Cash':'UPI'}</td><td>${esc(x.note||'')}</td></tr>`}).join('')||'<tr><td colspan="5" class="muted">Is mahine koi payment nahi liya</td></tr>'}</tbody></table></div>
   <div class="ac-card np"><div class="row sp" style="padding:12px 14px 0"><h3 style="padding:0">Customers ko paisa wapas diya: ${inr(sum(R,a=>a.amt))}</h3></div><table class="ldg" style="margin-top:8px"><thead><tr><th>Date</th><th>Customer</th><th class="n">Amount</th><th>Mode</th><th>Note</th></tr></thead><tbody>${R.map(a=>{const c=S.customers[a.cid];return `<tr><td class="dt">${fmtShort(a.date)}</td><td>${c?`<button class="acopen" style="width:auto;padding:0" data-act="openCustomer" data-id="${c.id}">${esc(c.name)}${window.phc?phc(c):''} ↗</button>`:'(deleted customer)'}</td><td class="n"><b>${inr(a.amt)}</b></td><td>${a.mode==='cash'?'Cash':'UPI'}</td><td>${esc(a.note||'')}</td></tr>`}).join('')||'<tr><td colspan="5" class="muted">Is mahine kisi ko paisa wapas nahi diya. Dena ho to: customer ka account → Adjustment → "Paisa wapas diya".</td></tr>'}</tbody></table></div>`}
function pcDel(p){if(S.pc.dv==='cust')return pcDelCust(p);const m=S.pc.m,n=dim(m),today=todayISO();const rows=[];let T={n:0,d:0,k:0,pe:0,l:0,a:0,bo:0,br:0};
  for(let i=1;i<=n;i++){const d=m+'-'+String(i).padStart(2,'0');if(d>today)break;const Ls=todaysList(d,p);if(!Ls.length)continue;const o={d,n:Ls.length,dn:0,k:0,pe:0,l:0,a:0,bo:0,br:0};
    Ls.forEach(({c,r})=>{if(r&&r.s==='d'){o.dn++;o.a+=+r.a||0;o.bo+=+r.bo||0;PRODUCTS.forEach(x=>o.l+=+(r.q&&r.q[x.k])||0)}else if(r&&r.s==='k')o.k++;else o.pe++;if(r)o.br+=+r.br||0});
    rows.push(o);T.n+=o.n;T.d+=o.dn;T.k+=o.k;T.pe+=o.pe;T.l+=o.l;T.a+=o.a;T.bo+=o.bo;T.br+=o.br}
  return `${dvBar()}<div class="ac-card np"><table class="ldg"><thead><tr><th>Date</th><th class="n">Ghar</th><th class="n">Delivered</th><th class="n">Skip</th><th class="n">✓ nahi hua</th><th class="n">Litre</th><th class="n">Bill ₹</th><th class="n">Bottle di</th><th class="n">Bottle wapas</th></tr></thead><tbody>
    ${rows.reverse().map(o=>`<tr><td class="dt">${fmtDate(o.d)}</td><td class="n">${o.n}</td><td class="n"><b>${o.dn}</b></td><td class="n">${o.k||'–'}</td><td class="n" style="color:${o.pe?'var(--warn)':'inherit'}">${o.pe||'–'}</td><td class="n">${L(o.l)}</td><td class="n">${inr(o.a)}</td><td class="n">${o.bo||'–'}</td><td class="n">${o.br||'–'}</td></tr>`).join('')||'<tr><td colspan="9" class="muted">Is mahine koi delivery nahi</td></tr>'}
    <tr class="tot"><td>Total</td><td class="n">${T.n}</td><td class="n">${T.d}</td><td class="n">${T.k}</td><td class="n">${T.pe}</td><td class="n">${L(T.l)}</td><td class="n">${inr(T.a)}</td><td class="n">${T.bo}</td><td class="n">${T.br}</td></tr></tbody></table></div>
   <div class="small muted">Ye us boy ke customers ki list se bana hai. "✓ nahi hua" wale din ka paisa bill me nahi judta, Delivery sheet me us date pe jaake theek karo.</div>`}
function pcKm(p){const m=S.pc.m;const K=Object.values(S.kms).filter(k=>k.boy===p&&k.date.slice(0,7)===m).sort((a,b)=>b.date.localeCompare(a.date));const E=energyOf(p,m);const km=sum(K,k=>k.km),en=sum(E,x=>x.amt),tr=sum(K,k=>+k.trips||0);const P=prof(p);
  return `<div class="ac-stats" style="margin:0 0 12px"><div class="ac-stat"><div class="l">${fmtMonth(m)} KM</div><div class="v">${L(km)}</div><div class="s">${K.length} din${tr?' · '+tr+' trip':''}</div></div><div class="ac-stat"><div class="l">KM incentive</div><div class="v">${inr(sum(K,k=>k.inc))}</div><div class="s">abhi ka rate ₹${L(kmRateOf(p))}/km</div></div><div class="ac-stat"><div class="l">Petrol / charging</div><div class="v">${inr(en)}</div><div class="s">${E.length} entries${P.vehicle?' · '+esc(VEH_L[P.vehicle]):''}</div></div><div class="ac-stat"><div class="l">Petrol ₹ per KM</div><div class="v">${km&&en?'₹'+L(Math.round(en/km*100)/100):'—'}</div></div></div>
   <div class="ac-card np"><div class="row sp" style="padding:12px 14px 0"><h3 style="padding:0">Meter (roz ka KM)</h3><span class="small muted">Menu → Meter me likho</span></div><table class="ldg" style="margin-top:8px"><thead><tr><th>Date</th><th>Shuru</th><th>Khatam</th><th class="n">Start KM</th><th class="n">End KM</th><th class="n">Total KM</th><th class="n">Trip</th><th class="n">Incentive</th></tr></thead><tbody>
    ${K.map(k=>`<tr><td class="dt">${fmtDate(k.date)}</td><td>${esc(k.st||'–')}</td><td>${esc(k.en||'–')}${k.st&&k.en?` <span class="small muted">(${durTxt(k.st,k.en)})</span>`:''}</td><td class="n">${k.r0!=null&&k.r0!==''?L(k.r0):'–'}</td><td class="n">${k.r1!=null&&k.r1!==''?L(k.r1):'–'}</td><td class="n"><b>${L(k.km)}</b></td><td class="n">${k.trips||'–'}</td><td class="n">${inr(k.inc)}</td></tr>`).join('')||'<tr><td colspan="8" class="muted">Is mahine KM ka record nahi. Menu → Meter me daalo.</td></tr>'}
    <tr class="tot"><td>Total</td><td></td><td></td><td></td><td></td><td class="n">${L(km)}</td><td class="n">${tr||''}</td><td class="n">${inr(sum(K,k=>k.inc))}</td></tr></tbody></table></div>
   <div class="ac-card np"><div class="row sp" style="padding:12px 14px 0"><h3 style="padding:0">Petrol / charging</h3><button class="btn sm p" data-act="enForm" data-p="${esc(p)}">+ Petrol / charging</button></div><table class="ldg" style="margin-top:8px"><thead><tr><th>Date</th><th>Kya</th><th class="n">Kitna</th><th class="n">₹</th><th>Kisne diya</th><th>Note</th></tr></thead><tbody>
    ${E.map(x=>`<tr><td class="dt">${fmtShort(x.date)}</td><td>${esc(FUEL_L[x.fuel]||x.cat||'')}</td><td class="n">${x.qty?L(x.qty)+' '+esc(x.unit||''):'–'}</td><td class="n"><b>${inr(x.amt)}</b></td><td>${esc(modeTxt(x.mode))}${x.paidBy?' · '+esc(pl(x.paidBy)):''}</td><td>${esc(x.note||'')}</td></tr>`).join('')||'<tr><td colspan="6" class="muted">Is mahine koi entry nahi</td></tr>'}</tbody></table></div>
   <div class="small muted">Petrol cash se diya ho to dene wale ke "haath me cash" se apne aap ghatega, aur Kharcha page ke mahine ke hisab me bhi judega.</div>`}
function pcPayT(p){const X=Object.values(S.purchases||{}).filter(x=>x.person===p).sort((a,b)=>b.date.localeCompare(a.date)||(b.t||0)-(a.t||0));
  return `<div class="ac-card"><div class="row sp wrap"><h3>${esc(pl(p))} ko ab tak diya: ${inr(sum(X,x=>x.amt))}</h3><button class="btn sm p" data-act="pcPay">+ Salary / advance do</button></div><div class="small muted">Ye entries Kharcha page se aati hain (category Salary / Advance / Incentive, "Kisko" me is insaan ka naam).</div></div>
   <div class="ac-card np"><table class="ldg"><thead><tr><th>Date</th><th>Kya</th><th class="n">Amount</th><th>Kaise diya</th><th>Note</th></tr></thead><tbody>${X.map(x=>`<tr><td class="dt">${fmtShort(x.date)} ${x.date.slice(0,4)}</td><td>${esc(x.cat||x.item||'')}</td><td class="n"><b>${inr(x.amt)}</b></td><td>${esc(modeTxt(x.mode))}${x.paidBy?' · '+esc(pl(x.paidBy))+' ne diya':''}</td><td>${esc(x.note||'')}</td></tr>`).join('')||'<tr><td colspan="5" class="muted">Abhi koi entry nahi</td></tr>'}</tbody></table></div>`}
/* =====================================================================
   TEAM MASTER (v4): har insaan ki profile, gaadi, incentive ke niyam, mahine ka hisab
   settings().team[naam] = {role, phone, join, vehicle, fuel, vno, note, inc:{salary,fixed,perL,perHouse,perKm,perRound}, adj:{'YYYY-MM':{amt,note}}, left}
   Naam aur login pehle jaise settings.boys / settings.staff / settings.pins se chalte hain, purana code waise hi chalta hai.
   ===================================================================== */
const teamAll=()=>settings().team||{};
const prof=p=>{const t=teamAll()[p]||{};return {phone:'',join:'',vehicle:'',fuel:'',vno:'',note:'',...t,inc:{...(t.inc||{})}}};
const isBoyP=p=>isBoy(p)||(teamAll()[p]||{}).role==='boy';
const isActiveP=p=>p==='Owner'||boys().includes(p)||staffL().includes(p);
const VEH_L={own:'Apni gaadi',company:'Company ki gaadi',none:'Gaadi nahi'};
const FUEL_L={petrol:'Petrol',diesel:'Diesel',cng:'CNG',ev:'Electric (EV)',cycle:'Cycle / paidal'};
const INC_F=[['salary','Mahine ki salary','₹ / mahina'],['fixed','Fixed bhatta (phone, gaadi)','₹ / mahina'],['perL','Har litre pe','₹ / litre'],['perHouse','Har ghar pe (har din)','₹ / ghar'],['perKm','Har KM pe (Meter se)','₹ / km'],['perRound','Har chakkar / trip pe','₹ / trip']];
const expTxt=from=>{const t=todayISO();if(!from||from>t)return '';const a=new Date(from+'T12:00:00'),b=new Date(t+'T12:00:00');let m=(b.getFullYear()-a.getFullYear())*12+(b.getMonth()-a.getMonth());if(b.getDate()<a.getDate())m--;
  if(m<1)return dd(from,t)+' din';const y=Math.floor(m/12),mm=m%12;return ((y?y+' saal ':'')+(mm?mm+' mahine':'')).trim()};
const kmRateOf=b=>{const v=prof(b).inc.perKm;return v!==undefined&&v!==null&&v!==''?+v:+(settings().kmRate??2)};
const subLine=p=>{if(p==='Owner')return 'Office';const P=prof(p);return [isBoyP(p)?'Delivery boy':'Office',P.vehicle?VEH_L[P.vehicle]+(P.fuel?' · '+FUEL_L[P.fuel]:''):'',P.join?expTxt(P.join)+' se':''].filter(Boolean).join(' · ')};
function pcBadges(p){const P=prof(p);return `<span class="badge b">${isBoyP(p)?'Delivery boy':'Office'}</span>${isActiveP(p)?'':'<span class="badge r">Kaam chhod diya</span>'}${P.vehicle?`<span class="badge n">${esc(VEH_L[P.vehicle])}${P.fuel?' · '+esc(FUEL_L[P.fuel]):''}</span>`:''}${P.join?`<span class="badge n">${esc(expTxt(P.join)||'naya')}</span>`:''}`}
const energyOf=(p,m)=>Object.values(S.purchases||{}).filter(x=>x.veh===p&&String(x.date).slice(0,7)===m).sort((a,b)=>b.date.localeCompare(a.date)||(b.t||0)-(a.t||0));
const activeCusts=p=>Object.values(S.customers).filter(c=>c.boy===p&&c.status==='active').length;

/* mahine me is boy ke customers ko kya gaya (customer ke abhi ke boy ke hisab se, Delivery tab jaisa) */
function delStats(p,m){const n=dim(m),today=todayISO();const o={days:0,h:0,l:0,a:0,bo:0,br:0,by:{}};const g0=c=>o.by[c.id]||(o.by[c.id]={c,n:0,l:0,a:0,bo:0,br:0});
  for(let i=1;i<=n;i++){const d=m+'-'+String(i).padStart(2,'0');if(d>today)break;let any=false;
    todaysList(d,p).forEach(({c,r})=>{if(!r)return;const br=+r.br||0;o.br+=br;if(r.s!=='d'){if(br)g0(c).br+=br;return}
      any=true;let l=0;PRODUCTS.forEach(x=>l+=+(r.q&&r.q[x.k])||0);const g=g0(c);o.h++;o.l+=l;o.a+=+r.a||0;o.bo+=+r.bo||0;g.n++;g.l+=l;g.a+=+r.a||0;g.bo+=+r.bo||0;g.br+=br});
    if(any)o.days++}
  return o}
/* mahine ka hisab: salary + bhatta + litre + ghar + KM + trip + sudhaar, minus jo diya */
function payCalc(p,m){const P=prof(p),I=P.inc,[mf,mt]=periodRange(m,'full');const D=isBoyP(p)?delStats(p,m):{h:0,l:0};const r2=v=>Math.round(v*100)/100;
  const K=Object.values(S.kms).filter(k=>k.boy===p&&k.date.slice(0,7)===m);const km=sum(K,k=>k.km),trips=sum(K,k=>+k.trips||0);const rt=k=>+I[k]||0;
  const parts=[['Salary',rt('salary'),''],['Fixed bhatta',rt('fixed'),''],['Litre',r2(D.l*rt('perL')),`${L(D.l)} L × ₹${L(rt('perL'))}`],['Ghar',r2(D.h*rt('perHouse')),`${D.h} ghar × ₹${L(rt('perHouse'))}`],
    ['KM (Meter)',r2(sum(K,k=>k.inc)),`${L(km)} km, Meter pe save ke waqt ke rate se`],['Trip / chakkar',r2(trips*rt('perRound')),`${trips} trip × ₹${L(rt('perRound'))}`]];
  const adj=(P.adj||{})[m]||null;const total=r2(sum(parts,x=>x[1])+(adj?+adj.amt||0:0));
  const paidL=Object.values(S.purchases||{}).filter(x=>x.person===p&&x.date>=mf&&x.date<=mt);
  return {parts,adj,total,paid:sum(paidL,x=>x.amt),paidL,km,trips,D}}

const dvBar=()=>`<div class="ac-bar"><div class="seg"><button class="${S.pc.dv==='cust'?'':'on'}" data-act="pcDv" data-v="day">Din-wise</button><button class="${S.pc.dv==='cust'?'on':''}" data-act="pcDv" data-v="cust">Customer-wise</button></div><span class="small muted">${fmtMonth(S.pc.m)} · kis kis ko deliver kiya</span></div>`;
function pcDelCust(p){const D=delStats(p,S.pc.m);const R=Object.values(D.by).sort((a,b)=>b.n-a.n||a.c.name.localeCompare(b.c.name));
  return `${dvBar()}<div class="ac-card np"><table class="ldg"><thead><tr><th>Customer</th><th class="n">Din diya</th><th class="n">Litre</th><th class="n">Bill ₹</th><th class="n">Bottle di</th><th class="n">Bottle wapas</th></tr></thead><tbody>
   ${R.map(g=>`<tr><td><button class="acopen" style="width:auto;padding:0" data-act="openCustomer" data-id="${g.c.id}">${esc(g.c.name)} ↗</button></td><td class="n"><b>${g.n}</b></td><td class="n">${L(g.l)}</td><td class="n">${inr(g.a)}</td><td class="n">${g.bo||'–'}</td><td class="n">${g.br||'–'}</td></tr>`).join('')||'<tr><td colspan="6" class="muted">Is mahine koi delivery nahi</td></tr>'}
   <tr class="tot"><td>Total · ${R.length} customers</td><td class="n">${D.h}</td><td class="n">${L(D.l)}</td><td class="n">${inr(D.a)}</td><td class="n">${D.bo}</td><td class="n">${D.br}</td></tr></tbody></table></div>
   <div class="small muted">Us boy ke abhi ke customers se bana hai. Customer ka boy badla ho to purane din bhi naye boy me dikhenge.</div>`}

function pcBot(p){const m=S.pc.m,D=delStats(p,m),M=botAll();const ids=Object.values(S.customers).filter(c=>c.boy===p).map(c=>c.id);const {T,u,t}=botTotals(M,ids);
  const late=ids.map(id=>({c:S.customers[id],g:M[id]})).filter(x=>x.g&&x.g.t>0&&x.g.days>=7).sort((a,b)=>b.g.days-a.g.days);const pc=D.bo?Math.round(D.br/D.bo*100):0;
  return `<div class="ac-stats" style="margin:0 0 12px"><div class="ac-stat"><div class="l">${fmtMonth(m)} bottle di</div><div class="v">${D.bo}</div></div><div class="ac-stat"><div class="l">${fmtMonth(m)} wapas laaya</div><div class="v">${D.br}</div><div class="s">${D.bo?pc+'% wapsi':''}</div></div>
    <div class="ac-stat"><div class="l">Abhi customers ke paas</div><div class="v">${t}</div><div class="s">${u?u+' bina size':'iske saare customers'}</div></div><div class="ac-stat"><div class="l">7+ din se nahi lautayi</div><div class="v" style="color:${late.length?'var(--warn)':'inherit'}">${late.length}</div><div class="s">customers</div></div></div>
   <div class="ac-card"><h3>Iske customers ke paas bottles (doodh ke hisab se)</h3><div style="margin-top:8px">${botMatrix(T)}</div></div>
   <div class="ac-card np"><table class="ldg"><thead><tr><th>Customer (7+ din purani bottle)</th><th class="n">½L / 1L</th><th class="n">Kitne din se</th></tr></thead><tbody>${late.map(x=>`<tr><td><button class="acopen" style="width:auto;padding:0" data-act="openCustomer" data-id="${x.c.id}">${esc(x.c.name)}${window.phc?phc(x.c):''} ↗</button></td><td class="n">${x.g.s} / ${x.g.b}${x.g.u?' + '+x.g.u:''}</td><td class="n" style="color:var(--warn)"><b>${x.g.days}</b> din</td></tr>`).join('')||'<tr><td colspan="3" class="muted">Kisi customer ke paas 7 din se purani bottle nahi</td></tr>'}</tbody></table></div>
   <div class="small muted">"Wapsi %" = is mahine jitni bottle di, unme se kitni wapas aayi. Us boy ke abhi ke customers se gina hai.</div>`}

function pcHisab(p){const m=S.pc.m,H=payCalc(p,m);const r=H.parts.filter(x=>x[1]);const b=H.total-H.paid;
  return `<div class="ac-card"><div class="row sp wrap"><h3>${fmtMonth(m)} ka hisab · ${esc(pl(p))}</h3>${isOwner()?'<button class="btn sm o" data-act="pcTab" data-v="prof">Niyam badlo</button>':''}</div>
   <table class="ldg" style="margin-top:8px"><thead><tr><th>Kis cheez ka</th><th>Kaise bana</th><th class="n">₹</th></tr></thead><tbody>
   ${r.map(x=>`<tr><td>${esc(x[0])}</td><td class="small muted">${esc(x[2])}</td><td class="n">${inr(x[1])}</td></tr>`).join('')||'<tr><td colspan="3" class="muted">Salary / incentive ke niyam set nahi, ya is mahine kuch nahi bana. Profile tab me niyam daalo.</td></tr>'}
   ${H.adj?`<tr><td>Sudhaar</td><td class="small muted">${esc(H.adj.note||'')}</td><td class="n">${inr(H.adj.amt)}</td></tr>`:''}
   <tr class="tot"><td>Kul bana</td><td></td><td class="n">${inr(H.total)}</td></tr>
   <tr><td>Diya (salary / advance / incentive)</td><td class="small muted">${H.paidL.length} entries · Kharcha se</td><td class="n">− ${inr(H.paid)}</td></tr>
   <tr class="tot"><td>${b>=0?'Dena baaki':'Zyada de diya'}</td><td></td><td class="n" style="color:${b>0.5?'var(--danger)':'inherit'}">${inr(Math.abs(b))}</td></tr></tbody></table></div>
   ${isAdmin()?`<div class="ac-card"><h3>Sudhaar (sirf ${fmtMonth(m)})</h3><div class="small muted" style="margin:4px 0 8px">Hisab se alag kuch jodna ya ghatana: bonus (+) ya chhutti / nuksan (−). Khaali ya 0 = hatao.</div>
    <div class="frm"><div class="field"><label class="f">₹ (+ ya −)</label><input class="input" id="haA" type="number" inputmode="decimal" value="${H.adj?esc(H.adj.amt):''}"></div><div class="field grow"><label class="f">Kyun</label><input class="input" id="haN" value="${H.adj?esc(H.adj.note||''):''}" placeholder="e.g. Diwali bonus / 2 din chhutti"></div><div class="field" style="align-self:flex-end"><button class="btn p" data-act="hisabAdj">Save</button></div></div></div>
    <div class="row wrap"><button class="btn sm p" data-act="pcPay">Salary / advance do</button></div>`:''}`}

function memberFields(p,P,pin){const boy=p?isBoyP(p):true;const o=(mp,v)=>Object.entries(mp).map(([k,l])=>`<option value="${k}" ${v===k?'selected':''}>${esc(l)}</option>`).join('');const inc=P.inc||{};
  return `<div class="frm">
   ${p?'':'<div class="field"><label class="f">Naam *</label><input class="input" id="tmName" placeholder="e.g. Ramesh" autocomplete="off"></div>'}
   <div class="field"><label class="f">Kaam</label><select class="input" id="tmRole"><option value="boy" ${boy?'selected':''}>Delivery boy</option><option value="office" ${boy?'':'selected'}>Office</option></select></div>
   <div class="field"><label class="f">Phone</label><input class="input" id="tmPhone" inputmode="tel" value="${esc(P.phone||'')}"></div>
   <div class="field"><label class="f">Joining date</label><input class="input" id="tmJoin" type="date" value="${esc(P.join||'')}" max="${todayISO()}"></div>
   <div class="field"><label class="f">Login PIN</label><input class="input" id="tmPin" inputmode="numeric" maxlength="6" value="${esc(pin||'')}" placeholder="4-6 digit" autocomplete="off"></div>
   <label class="field" style="flex-direction:row;gap:8px;align-items:center;align-self:flex-end;min-height:40px"><input type="checkbox" id="tmFull" ${P.full?'checked':''}> Poora access (office: Settings, team, PIN)</label>
   <div class="field"><label class="f">Gaadi</label><select class="input" id="tmVeh"><option value="">—</option>${o(VEH_L,P.vehicle)}</select></div>
   <div class="field"><label class="f">Fuel</label><select class="input" id="tmFuel"><option value="">—</option>${o(FUEL_L,P.fuel)}</select></div>
   <div class="field"><label class="f">Gaadi number</label><input class="input" id="tmVno" value="${esc(P.vno||'')}"></div>
   <div class="field grow"><label class="f">Note</label><input class="input" id="tmNote" value="${esc(P.note||'')}" placeholder="e.g. subah tempo se gaanv se doodh laata hai"></div></div>
   <h3 style="margin-top:14px">Salary / incentive ke niyam</h3><div class="small muted" style="margin:2px 0 8px">Jo lagu nahi wo khaali chhodo. Apni gaadi wale ka per KM zyada rakho, company ki gaadi wale ka kam ya 0. Do chakkar (jaise pehle tempo se gaanv se doodh, phir delivery) ho to "Har chakkar" me rate daalo aur Meter me trips likho.</div>
   <div class="frm">${INC_F.map(([k,l,u])=>`<div class="field"><label class="f">${l} (${u})</label><input class="input" type="number" inputmode="decimal" min="0" data-inc="${k}" value="${inc[k]!==undefined&&inc[k]!==''?esc(inc[k]):''}" ${k==='perKm'?`placeholder="khaali = ₹${L(settings().kmRate??2)} (Settings)"`:''}></div>`).join('')}</div>`}
function readMember(){const v=id=>(($('#'+id)||{}).value||'').trim();const inc={};document.querySelectorAll('[data-inc]').forEach(i=>{if(i.value!=='')inc[i.dataset.inc]=Math.max(0,+i.value||0)});
  return {role:v('tmRole')||'boy',full:!!(($('#tmFull')||{}).checked)&&v('tmRole')==='office',phone:v('tmPhone'),join:v('tmJoin'),pin:v('tmPin'),vehicle:v('tmVeh'),fuel:v('tmFuel'),vno:v('tmVno'),note:v('tmNote'),inc}}
async function saveMember(name,M,activate){const st=settings();let B=[...boys()],F=[...staffL()];const T={...(st.team||{})};const old=T[name]||{};
  if(M.role==='boy'&&M.pin&&!/^[0-9]{4,6}$/.test(M.pin)){toast('PIN 4-6 digit ka ho');return false}
  const pins={owner:'1234',...(st.pins||{})};pins.boys={...(pins.boys||{})};
  pins.staff={...(pins.staff||{})};
  if(activate){if(M.role==='boy'){if(!B.includes(name))B.push(name);F=F.filter(x=>x!==name);pins.boys[name]=M.pin||pins.boys[name]||'0000';delete pins.staff[name]}else{if(!F.includes(name))F.push(name);B=B.filter(x=>x!==name);delete pins.boys[name];if(M.pin)pins.staff[name]=M.pin}}
  const {pin,...rest}=M;T[name]={...old,...rest,left:activate?'':(old.left||'')};
  await saveSettings({...st,boys:B,staff:F,pins,team:T});return true}

function pcProf(p){const P=prof(p),boy=isBoyP(p),act=isActiveP(p);const pp=settings().pins||{};const pin=(boy?(pp.boys||{})[p]:(pp.staff||{})[p])||'';const nC=activeCusts(p);
  const view=`<div class="ac-card"><h3>Details</h3><table class="ldg" style="margin-top:6px"><tbody>
    <tr><td>Kaam</td><td>${boy?'Delivery boy':'Office'+(P.full?' · poora access':'')}${act?'':' · <b>kaam chhod diya</b>'+(P.left?' ('+fmtDate(P.left)+')':'')}</td></tr>
    ${act?`<tr><td>Login</td><td>${pin?'PIN set hai':'<b style="color:var(--danger)">PIN nahi, login nahi kar payega</b>'}</td></tr>`:''}
    <tr><td>Phone</td><td>${P.phone?`<a href="tel:${esc(P.phone)}">${esc(P.phone)}</a>`:'—'}</td></tr>
    <tr><td>Joining</td><td>${P.join?esc(fmtDate(P.join))+' · '+esc(expTxt(P.join)||'aaj se'):'— (joining date daalo to kitne samay se kaam kar raha hai dikhega)'}</td></tr>
    ${boy?`<tr><td>Customers</td><td>${nC} active</td></tr><tr><td>Gaadi</td><td>${P.vehicle?esc(VEH_L[P.vehicle]):'—'}${P.fuel?' · '+esc(FUEL_L[P.fuel]):''}${P.vno?' · '+esc(P.vno):''}</td></tr>`:''}
    ${P.note?`<tr><td>Note</td><td>${esc(P.note)}</td></tr>`:''}</tbody></table></div>
   <div class="ac-card"><h3>Salary / incentive ke niyam</h3><table class="ldg" style="margin-top:6px"><tbody>${INC_F.map(([k,l,u])=>`<tr><td>${l}</td><td class="n">${P.inc[k]!==undefined&&P.inc[k]!==''?'₹'+L(P.inc[k]):k==='perKm'&&boy?`<span class="muted">₹${L(settings().kmRate??2)} (Settings ka)</span>`:'<span class="muted">—</span>'}</td><td class="small muted">${u}</td></tr>`).join('')}</tbody></table></div>`;
  if(!isAdmin())return view;
  return view+`<div class="ac-card"><h3>Profile badlo</h3><div style="margin-top:8px">${memberFields(p,P,pin)}</div><div class="row wrap" style="margin-top:12px"><button class="btn p" data-act="tmProfSave" data-p="${esc(p)}">Save profile</button>${act?`<button class="btn d" data-act="tmLeave" data-p="${esc(p)}">Kaam chhod diya</button>`:`<button class="btn o" data-act="tmBack" data-p="${esc(p)}">Wapas kaam pe</button>`}</div></div>`}

function enFormHtml(p){const P=p?prof(p):{};const bl=[...new Set([...boys(),...(p?[p]:[])])];const f=P.fuel&&P.fuel!=='cycle'?P.fuel:'petrol';const me=S.me||'Owner';
  return `<div class="stack"><div class="frm">
   <div class="field"><label class="f">Kiski gaadi</label><select class="input" id="enP">${bl.map(b=>`<option ${b===p?'selected':''}>${esc(b)}</option>`).join('')}</select></div>
   <div class="field"><label class="f">Date</label><input class="input" type="date" id="enD" value="${S.route==='odo'&&S.odod?S.odod:todayISO()}" max="${todayISO()}"></div>
   <div class="field"><label class="f">Kya</label><select class="input" id="enF">${['petrol','diesel','cng','ev'].map(k=>`<option value="${k}" ${k===f?'selected':''}>${FUEL_L[k]}</option>`).join('')}</select></div>
   <div class="field"><label class="f" id="enUL">${f==='ev'?'Unit (kWh)':f==='cng'?'kg':'Litre'}</label><input class="input" type="number" inputmode="decimal" id="enQ" min="0"></div>
   <div class="field"><label class="f">₹ Amount *</label><input class="input" type="number" inputmode="decimal" id="enA" min="0"></div>
   <div class="field"><label class="f">Kisne paise diye</label><select class="input" id="enBy">${persons().map(x=>`<option value="${esc(x)}" ${x===me?'selected':''}>${esc(pl(x))}</option>`).join('')}</select></div>
   <div class="field"><label class="f">Kaise</label><select class="input" id="enM"><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank">Bank / card</option></select></div>
   <div class="field grow"><label class="f">Note</label><input class="input" id="enN" placeholder="e.g. pump ka naam / meter 12450"></div></div>
   <div class="small muted">Cash me diya to "Kisne paise diye" wale ke haath ka cash ghatega. Ye Kharcha me "${'Petrol / diesel'}" ya "EV charging" me bhi judega.</div>
   <button class="btn p block" data-act="enSave">Save</button></div>`}
document.addEventListener('change',e=>{const el=e.target;if(el.id==='enF'){const l=$('#enUL');if(l)l.textContent=el.value==='ev'?'Unit (kWh)':el.value==='cng'?'kg':'Litre'}});

Object.assign(A,{
  tmNew(){if(!isAdmin())return toast('Sirf owner (ya poore access wala) kar sakta hai');openSheet('Naya team member',`<div class="stack">${memberFields('',{inc:{}},'')}<button class="btn p block" data-act="tmNewSave">Save member</button></div>`);$('#sheet .panel').classList.add('wide');setTimeout(()=>{const i=$('#tmName');if(i)i.focus()},40)},
  async tmNewSave(){if(!isAdmin())return;const name=(($('#tmName')||{}).value||'').trim().replace(/\s+/g,' ');if(!name)return toast('Naam likho');
    const lo=name.toLowerCase();if(lo==='owner'||persons().some(x=>x.toLowerCase()===lo)||Object.keys(teamAll()).some(x=>x.toLowerCase()===lo))return toast('Ye naam pehle se hai. Purana member ho to "Purane member" se wapas lao.');
    const M=readMember();if(M.role==='boy'&&!M.pin)return toast('Boy ka login PIN likho (4-6 digit)');
    if(await saveMember(name,M,true)){closeSheet();toast(name+' jud gaya');render()}},
  async tmProfSave(d){if(!isAdmin())return;const p=d.p;const M=readMember();const nC=activeCusts(p);
    if(M.role!=='boy'&&isBoyP(p)&&nC)return toast(`${p} ke ${nC} active customer hain. Office banane se pehle unhe dusre boy ko do.`);
    if(await saveMember(p,M,isActiveP(p))){toast('Profile save');pcDraw(false)}},
  async tmLeave(d){if(!isAdmin())return;if(d.p===S.me)return toast('Apne aap ko nahi hata sakte');const p=d.p;const nC=activeCusts(p);if(nC)return toast(`${p} ke ${nC} active customer hain. Pehle unhe dusre boy ko do (Customers → grid → boy badlo).`);const h=cashInHand(p);
    if(!await confirmBox({title:`${esc(p)} ne kaam chhod diya?`,html:`Login band ho jayega aur naam list se hat jayega. Purana hisab (cash, delivery, salary) waise hi rahega.${Math.abs(h)>0.5?`<div style="margin-top:8px;color:var(--danger)"><b>Abhi haath me cash: ${inr(h)}</b>. Pehle handover le lo.</div>`:''}`,yes:'Haan, hatao'}))return;
    const st=settings();const T={...(st.team||{})};T[p]={...(T[p]||{}),role:isBoyP(p)?'boy':'office',left:todayISO()};const pins={...(st.pins||{}),boys:{...((st.pins||{}).boys||{})},staff:{...((st.pins||{}).staff||{})}};delete pins.boys[p];delete pins.staff[p];
    await saveSettings({...st,boys:boys().filter(x=>x!==p),staff:staffL().filter(x=>x!==p),pins,team:T});toast(p+' list se hat gaya');pcDraw(false)},
  async tmBack(d){if(!isAdmin())return;const p=d.p;const P=prof(p);const role=P.role||'boy';
    if(await saveMember(p,{...P,role,pin:''},true)){toast(p+' wapas jud gaya'+(role==='boy'?' · PIN 0000 hai, Profile me badlo':''));pcDraw(false)}},
  pcDv(d){S.pc.dv=d.v;pcDraw(false)},
  async hisabAdj(){const p=S.pc.id;if(!p||!isAdmin())return;const a=$('#haA').value,n=$('#haN').value.trim();const st=settings();const T={...(st.team||{})};const P={...(T[p]||{})};const adj={...(P.adj||{})};
    if(a===''||+a===0)delete adj[S.pc.m];else adj[S.pc.m]={amt:+a,note:n,by:S.me||'',t:Date.now()};P.adj=adj;if(!P.role)P.role=isBoyP(p)?'boy':'office';T[p]=P;await saveSettings({...st,team:T});toast('Sudhaar save');pcDraw(false)},
  enForm(d){if(!canWrite())return toast('Aapko write permission nahi hai');openSheet('Petrol / charging',enFormHtml(d.p||''));setTimeout(()=>{const i=$('#enA');if(i)i.focus()},40)},
  enSave(){if(!canWrite())return toast('Aapko write permission nahi hai');const amt=+$('#enA').value;if(!(amt>0))return toast('₹ amount likho');const veh=$('#enP').value;if(!veh)return toast('Gaadi kiski hai, chuno');
    const fuel=$('#enF').value,qty=+$('#enQ').value||0,unit=fuel==='ev'?'kWh':fuel==='cng'?'kg':'L';
    const doc={date:$('#enD').value||todayISO(),amt,mode:$('#enM').value,paidBy:$('#enBy').value,note:$('#enN').value.trim(),by:S.me||'',t:Date.now(),kind:'kharcha',cat:fuel==='ev'?'EV charging':'Petrol / diesel',item:FUEL_L[fuel]+(qty?' '+L(qty)+' '+unit:'')+' · '+veh,veh,fuel,qty,unit,energy:true};
    const id=uid();S.purchases[id]={id,...doc};closeSheet();render();queue('pur:'+id,()=>S.db.doc('purchases/'+id).set(doc)).then(()=>toast(FUEL_L[fuel]+' · '+inr(amt)+' save'))}
});
document.addEventListener('change',e=>{const el=e.target;if(el.dataset&&'pcm' in el.dataset&&el.value){S.pc.m=el.value;S.pc.all=false;pcDraw(false)}});

/* boy ke phone pe: mere paas kitna cash hai */
const _vp=vPayments;
vPayments=function(){const o=_vp();if(isOwner())return o;const h=cashInHand(S.me);const mine=Object.values(S.cash).filter(x=>x.type==='handover'&&x.from===S.me).sort((a,b)=>(b.t||0)-(a.t||0)).slice(0,5);
  const card=`<div class="card"><div class="row sp wrap"><div><div class="small muted">Mere paas cash</div><div style="font-size:26px;font-weight:800">${inr(h)}</div></div><button class="btn p" data-act="hoForm">Office ko cash diya</button></div>
    ${mine.length?`<div style="margin-top:8px">${mine.map(x=>`<div class="mini"><span>${fmtShort(x.date)} · ${esc(pl(x.to))} ko</span><span><b>${inr(x.status==='ok'?got(x):x.amt)}</b> ${cbStatus(x)}</span></div>`).join('')}</div>`:''}</div>`;
  return {...o,html:o.html.replace('<div class="stack">','<div class="stack">'+card)}};

/* =====================================================================
   PURCHASE & KHARCHA (+ suppliers)
   ===================================================================== */
S.pk={kind:'maal',tab:'day',pre:null};S.purchases=S.purchases||{};
const DEF_CATS=['Petrol / diesel','EV charging','Salary','Advance','Incentive','Packing / bottle','Gaadi repair','Rent','Bijli / phone','Other'];
const expCats=()=>Array.isArray(settings().expCats)&&settings().expCats.length?settings().expCats:DEF_CATS;
const kindOf=p=>p.kind||'maal';
const modeTxt=m=>({cash:'Cash',upi:'UPI',bank:'Bank',udhaar:'Udhaar'}[m]||'');
const MILK_ITEMS=['Cow milk','Buffalo milk','Gir cow milk','Chaach'];
function milkKey(item){const s=String(item||'').toLowerCase();if(/ghee|paneer|dahi|makhan|butter|mawa/.test(s))return '';if(/chaa?ch|chhaa?ch/.test(s))return 'chaach';if(!/milk|doodh|dudh/.test(s))return '';if(/buffalo|bhains|bhens/.test(s))return 'buffalo';if(/gir|desi/.test(s))return 'desi';if(/cow|gaay|gai\b|gau/.test(s))return 'cow';return ''}
function suppliers(){const Ls=(settings().suppliers||[]).map(s=>typeof s==='string'?{n:s,ph:''}:{n:s.n,ph:s.ph||''});const names=new Set(Ls.map(s=>s.n));const add=n=>{if(n&&!names.has(n)){names.add(n);Ls.push({n,ph:''})}};
  Object.values(S.purchases).forEach(p=>add(p.supplier));Object.values(S.cash).forEach(x=>{if(x.type==='suppay')add(x.to)});return Ls}
const supBuy=n=>sum(Object.values(S.purchases).filter(p=>kindOf(p)==='maal'&&p.supplier===n&&p.mode==='udhaar'),p=>p.amt);
const supPaid=n=>sum(Object.values(S.cash).filter(x=>x.type==='suppay'&&x.to===n&&x.status==='ok'),x=>x.amt);
const supBal=n=>supBuy(n)-supPaid(n);
const lastPur=item=>{const k=norm(item);if(!k)return null;return Object.values(S.purchases).filter(p=>kindOf(p)==='maal'&&norm(p.item)===k).sort((a,b)=>b.date.localeCompare(a.date)||(b.t||0)-(a.t||0))[0]||null};

function kxForm(){const K=S.pk,pre=K.pre||{};const P=persons();
  const items=[...new Set([...MILK_ITEMS,...products().filter(p=>p.on!==false).map(p=>p.n),...Object.values(S.purchases).filter(p=>kindOf(p)==='maal').map(p=>p.item).filter(Boolean)])];
  const modeSel=u=>`<div class="field"><label class="f">Paisa kaise diya</label><select class="input" id="kxM"><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank">Bank transfer</option>${u?'<option value="udhaar">Udhaar (baad me denge)</option>':''}</select></div>`;
  const bySel=`<div class="field"><label class="f">Kisne diya (cash ho to uske haath se ghatega)</label><select class="input" id="kxP">${P.map(p=>`<option value="${esc(p)}" ${p===(S.me||'Owner')?'selected':''}>${esc(pl(p))}</option>`).join('')}</select></div>`;
  const supIn=`<div class="field"><label class="f">Supplier${K.kind==='suppay'?' *':''}</label><input class="input" id="kxS" list="kxSl" placeholder="e.g. Sharma Dairy" value="${esc(pre.supplier||'')}" autocomplete="off"><datalist id="kxSl">${suppliers().map(s=>`<option value="${esc(s.n)}">`).join('')}</datalist>${K.kind==='suppay'?`<div class="small muted" id="kxSb" style="margin-top:4px">${pre.supplier?'Abhi dena baki: '+inr(supBal(pre.supplier)):''}</div>`:''}</div>`;
  const note=`<div class="field w2"><label class="f">Note</label><input class="input" id="kxN" placeholder="optional"></div>`;
  let f;
  if(K.kind==='maal')f=`<div class="field w2"><label class="f">Kya khareeda *</label><input class="input" id="kxI" list="kxIl" placeholder="e.g. Cow milk, Shahad 500g, Ghee" autocomplete="off"><datalist id="kxIl">${items.map(i=>`<option value="${esc(i)}">`).join('')}</datalist></div>
     <div class="field"><label class="f">Quantity</label><input class="input" id="kxQ" type="number" inputmode="decimal" min="0" step="any"></div><div class="field"><label class="f">Unit</label><input class="input" id="kxU" placeholder="L / kg / pc"></div>
     <div class="field"><label class="f">Rate ₹</label><input class="input" id="kxR" type="number" inputmode="decimal" min="0" step="any"></div><div class="field"><label class="f">Amount ₹ *</label><input class="input" id="kxA" type="number" inputmode="decimal" min="0" placeholder="qty × rate"></div>
     ${supIn}${modeSel(true)}${bySel}${note}`;
  else if(K.kind==='kharcha')f=`<div class="field"><label class="f">Kis cheez ka kharcha *</label><select class="input" id="kxC">${expCats().map(c=>`<option ${c===pre.cat?'selected':''}>${esc(c)}</option>`).join('')}${pre.cat&&!expCats().includes(pre.cat)?`<option selected>${esc(pre.cat)}</option>`:''}</select></div>
     <div class="field"><label class="f">Detail</label><input class="input" id="kxI" placeholder="e.g. Bike me petrol"></div><div class="field"><label class="f">Amount ₹ *</label><input class="input" id="kxA" type="number" inputmode="decimal" min="0"></div>
     <div class="field"><label class="f">Kisko diya (salary / advance ho to)</label><select class="input" id="kxW"><option value="">—</option>${P.map(p=>`<option value="${esc(p)}" ${p===pre.person?'selected':''}>${esc(pl(p))}</option>`).join('')}</select></div>
     ${modeSel(false)}${bySel}${note}`;
  else f=`${supIn}<div class="field"><label class="f">Amount ₹ *</label><input class="input" id="kxA" type="number" inputmode="decimal" min="0"></div>${modeSel(false)}${bySel}${note}`;
  return `<div class="card"><div class="row sp wrap"><h3>Nayi entry · ${fmtDate(S.purd)}</h3><div class="seg">${[['maal','Maal khareeda'],['kharcha','Kharcha'],['suppay','Supplier ko payment']].map(([v,l])=>`<button class="${K.kind===v?'on':''}" data-act="kxKind" data-v="${v}">${l}</button>`).join('')}</div></div>
    <div class="small muted" style="margin:4px 0 10px">${K.kind==='maal'?'Jo customers ko dene ke liye khareeda: doodh, ghee, shahad, dahi, gur… Udhaar chunoge to supplier ke khate me judega.':K.kind==='kharcha'?'Business chalane ka kharcha: petrol, salary, packing, rent…':'Supplier ka purana udhaar chukaya. Uske khate se ghat jayega.'}</div>
    <div class="frm">${f}</div><button class="btn p" style="margin-top:12px" data-act="kxAdd">+ Save karo <span class="kbd" style="background:transparent;color:inherit">Enter</span></button></div>`}
function milkCmp(d){const buy={};Object.values(S.purchases).forEach(p=>{if(p.date!==d||kindOf(p)!=='maal'||!p.pk||!(+p.qty>0))return;buy[p.pk]=(buy[p.pk]||0)+(+p.qty)});if(!Object.keys(buy).length)return '';
  const plan={},sold={};const today=todayISO();
  for(const c of Object.values(S.customers)){let q=null,done=false;const r=rowOf(d,c.id);
    if(d<today){if(r&&r.s!=='k'&&(r.s==='d'||r.pl)){q=r.q;done=r.s==='d'}}else{const it=itemsFor(c,d);if(it){q=it.q;done=it.src==='d'}}
    if(!q)continue;PRODUCTS.forEach(p=>{const v=+q[p.k]||0;plan[p.k]=(plan[p.k]||0)+v;if(done)sold[p.k]=(sold[p.k]||0)+v})}
  return `<div class="card"><h3>Doodh ka hisab · khareeda aur gaya</h3><div class="scroll"><table class="tbl compact" style="margin-top:6px"><thead><tr><th>Doodh</th><th class="n">Khareeda</th><th class="n">Order tha</th><th class="n">Delivered</th><th class="n">Bacha / kam</th></tr></thead><tbody>
    ${PRODUCTS.filter(p=>buy[p.k]).map(p=>{const df=(buy[p.k]||0)-(plan[p.k]||0);return `<tr><td><b>${BTN[p.k]||p.sh}</b></td><td class="n">${L(buy[p.k]||0)} L</td><td class="n">${L(plan[p.k]||0)} L</td><td class="n">${L(sold[p.k]||0)} L</td><td class="n" style="font-weight:800;color:${df<0?'var(--danger)':df>0?'var(--warn)':'inherit'}">${df>0?'+':''}${L(df)} L</td></tr>`}).join('')}</tbody></table></div>
    <div class="small muted" style="margin-top:6px">Bacha (+) = order se zyada khareeda. Kam (−) = order se kam khareeda. Ye tab dikhta hai jab maal me "Cow milk / Buffalo milk / Gir cow milk / Chaach" litre me likha ho.</div></div>`}
function kxDay(){const d=S.purd;const dayP=Object.values(S.purchases).filter(p=>p.date===d).sort((a,b)=>(a.t||0)-(b.t||0));const dayS=Object.values(S.cash).filter(x=>x.type==='suppay'&&x.date===d&&x.status==='ok');
  const line=p=>{const k=kindOf(p);const meta=[p.supplier&&'Supplier: '+p.supplier,p.person&&pl(p.person)+' ko',p.mode&&modeTxt(p.mode)+(p.mode==='cash'&&p.paidBy?' ('+pl(p.paidBy)+' ne diya)':''),p.note,p.by&&'entry: '+pl(p.by)].filter(Boolean).map(esc).join(' · ');
    return `<div class="item"><div class="grow"><div class="t">${k==='kharcha'?`<span class="badge y">Kharcha</span> ${esc(p.cat||'')}${p.item&&p.item!==p.cat?' · '+esc(p.item):''}`:`<span class="badge g">Maal</span> ${esc(p.item)}`}${+p.qty?` <span class="small muted">${L(p.qty)} ${esc(p.unit||'')}${+p.rate?' × ₹'+L(p.rate):''}</span>`:''}</div><div class="s" style="white-space:normal">${meta}</div></div><div class="r"><b>${inr(p.amt)}</b><div><button class="btn xs" data-act="purDel" data-id="${p.id}">Delete</button></div></div></div>`};
  const week=Array.from({length:7},(_,i)=>addDays(d,-i)).map(x=>{const pp=Object.values(S.purchases).filter(p=>p.date===x);return {d:x,m:sum(pp.filter(p=>kindOf(p)==='maal'),p=>p.amt),k:sum(pp.filter(p=>kindOf(p)==='kharcha'),p=>p.amt)}});
  return kxForm()+`<div class="list">${dayP.map(line).join('')}${dayS.map(x=>`<div class="item"><div class="grow"><div class="t"><span class="badge b">Supplier payment</span> ${esc(x.to)}</div><div class="s" style="white-space:normal">${esc(modeTxt(x.mode))} · ${esc(pl(x.from))} ne diya${x.note?' · '+esc(x.note):''}</div></div><div class="r"><b>${inr(x.amt)}</b><div><button class="btn xs" data-act="cbRadd" data-id="${x.id}">Radd</button></div></div></div>`).join('')}${dayP.length||dayS.length?'':emptyBox('Is din koi entry nahi')}</div>
   ${milkCmp(d)}
   <div class="card"><h3>Pichle 7 din</h3><table class="tbl compact" style="margin-top:6px"><thead><tr><th>Din</th><th class="n">Maal</th><th class="n">Kharcha</th></tr></thead><tbody>${week.map(w=>`<tr class="click" data-act="purGo" data-d="${w.d}"><td>${fmtDate(w.d)}</td><td class="n">${w.m?inr(w.m):'–'}</td><td class="n">${w.k?inr(w.k):'–'}</td></tr>`).join('')}</tbody></table></div>`}
function monthNums(m){const [mf,mt]=periodRange(m,'full');const P=Object.values(S.purchases||{}).filter(p=>p.date>=mf&&p.date<=mt);const maalL=P.filter(p=>kindOf(p)==='maal'),khL=P.filter(p=>kindOf(p)==='kharcha');
  let sale=0;for(const d in S.days){if(d<mf||d>mt)continue;for(const r of Object.values(S.days[d].rows||{}))if(r.s==='d')sale+=+r.a||0}
  const coll=sum(Object.values(S.payments).filter(p=>p.date>=mf&&p.date<=mt),p=>p.amt);const maal=sum(maalL,p=>p.amt),kh=sum(khL,p=>p.amt);
  /* customer discount / write-off kamai ghatate hain, extra charge badhata hai. Paisa wapas (refund) kamai nahi, sirf advance lautana hai */
  const AJ=Object.values(S.adjust||{}).filter(a=>a.date>=mf&&a.date<=mt&&S.customers[a.cid]);const disc=sum(AJ.filter(a=>a.type==='discount'||a.type==='writeoff'),a=>a.amt),chg=sum(AJ.filter(a=>a.type==='charge'),a=>a.amt);
  return {P,maalL,khL,sale,coll,maal,kh,disc,chg,profit:sale+chg-disc-maal-kh}}
function kxMonth(){const m=S.purd.slice(0,7);const N=monthNums(m);
  const byCat={};N.khL.forEach(p=>{const k=p.cat||'Other';byCat[k]=(byCat[k]||0)+(+p.amt||0)});
  const byItem={};N.maalL.forEach(p=>{const k=p.item||'—';const g=byItem[k]||(byItem[k]={q:0,a:0,u:p.unit||''});g.q+=+p.qty||0;g.a+=+p.amt||0});
  const byMode={};N.P.forEach(p=>{const k=modeTxt(p.mode)||'(purani entry)';byMode[k]=(byMode[k]||0)+(+p.amt||0)});
  const tb=(o,f)=>Object.entries(o).sort((a,b)=>f(b[1])-f(a[1]));
  return `<div class="kpi"><div class="card"><div class="l">${fmtMonth(m)} sale</div><div class="v">${inr(N.sale)}</div><div class="s">delivered maal ka bill</div></div>
    <div class="card"><div class="l">Maal khareeda</div><div class="v">${inr(N.maal)}</div></div><div class="card"><div class="l">Kharcha</div><div class="v">${inr(N.kh)}</div></div>
    <div class="card"><div class="l">Bachat (andaza)</div><div class="v" style="color:${N.profit<0?'var(--danger)':'var(--accent)'}">${inr(N.profit)}</div><div class="s">sale${N.chg?' + charge':''}${N.disc?' − discount':''} − maal − kharcha</div></div>
    ${N.disc||N.chg?`<div class="card"><div class="l">Discount / write-off</div><div class="v">${inr(N.disc)}</div><div class="s">${N.chg?'extra charge +'+inr(N.chg):'customers ko chhoot'}</div></div>`:''}
    <div class="card"><div class="l">Paisa aaya (collection)</div><div class="v">${inr(N.coll)}</div><div class="s">cash + UPI</div></div></div>
   <div class="small muted">Bachat andaza hai: isme udhaar pe gaya maal bhi sale me gina hai (paisa abhi aana baki ho sakta hai), aur bacha hua stock nahi gina.</div>
   <div class="grid g2 tight"><div class="card"><h3>Kharcha · category se</h3><div style="margin-top:6px">${tb(byCat,v=>v).map(([k,v])=>`<div class="mini"><span>${esc(k)}</span><b>${inr(v)}</b></div>`).join('')||'<div class="small muted">Is mahine koi kharcha nahi likha</div>'}</div></div>
    <div class="card"><h3>Maal · cheez se</h3><div style="margin-top:6px">${tb(byItem,v=>v.a).map(([k,v])=>`<div class="mini"><span>${esc(k)}${v.q?` <span class="small muted">${L(v.q)} ${esc(v.u)}</span>`:''}</span><b>${inr(v.a)}</b></div>`).join('')||'<div class="small muted">Is mahine koi maal nahi likha</div>'}</div></div></div>
   <div class="card"><h3>Paisa kaise gaya</h3><div class="row wrap" style="margin-top:6px">${Object.entries(byMode).map(([k,v])=>`<span class="bchip">${esc(k)} ${inr(v)}</span>`).join('')||'<span class="small muted">—</span>'}</div></div>
   <button class="btn o" data-act="kxXlsx">Is mahine ki Excel</button>`}
function kxSup(){const Ls=suppliers();
  return `<div class="card"><h3>Naya supplier</h3><div class="frm" style="margin-top:8px"><div class="field"><label class="f">Naam *</label><input class="input" id="spN" placeholder="e.g. Sharma Dairy"></div><div class="field"><label class="f">Mobile (WhatsApp order ke liye)</label><input class="input" id="spP" inputmode="tel" placeholder="10 digit"></div><div class="field" style="align-self:flex-end"><button class="btn p" data-act="supAdd">+ Jodo</button></div></div></div>
   <div class="card" style="padding:0"><div class="scroll"><table class="tbl"><thead><tr><th>Supplier</th><th class="n">Udhaar pe maal</th><th class="n">Payment diya</th><th class="n">Dena baki</th><th></th></tr></thead><tbody>
    ${Ls.map(s=>{const b=supBal(s.n);return `<tr><td><b>${esc(s.n)}</b>${s.ph?`<div class="small muted">${esc(s.ph)}</div>`:''}</td><td class="n">${inr(supBuy(s.n))}</td><td class="n">${inr(supPaid(s.n))}</td><td class="n" style="font-weight:800;color:${b>0.5?'var(--danger)':'inherit'}">${inr(b)}</td><td class="act"><button class="btn xs o" data-act="supOpen" data-n="${esc(s.n)}">Khata</button> <button class="btn xs p" data-act="supPay" data-n="${esc(s.n)}">Payment</button></td></tr>`}).join('')||'<tr><td colspan="5"><div class="empty">Abhi koi supplier nahi. Upar se jodo, ya maal ki entry me supplier ka naam likho.</div></td></tr>'}
    ${Ls.length?`<tr style="font-weight:800"><td>Total dena</td><td></td><td></td><td class="n">${inr(sum(Ls,s=>supBal(s.n)))}</td><td></td></tr>`:''}</tbody></table></div></div>
   <div class="small muted">"Dena baki" sirf udhaar wali entries se banta hai. Cash / UPI se turant diya maal isme nahi judta.</div>`}
vPurchase=function(){const d=S.purd,K=S.pk;const dayP=Object.values(S.purchases).filter(p=>p.date===d);const m=d.slice(0,7);
  const head=`<div class="row sp wrap"><div class="row"><button class="btn sm o" data-act="purShift" data-n="-1">‹</button><button class="btn sm"><b>${d===todayISO()?'Aaj · ':''}${fmtDate(d)}</b></button><button class="btn sm o" data-act="purShift" data-n="1" ${d>=todayISO()?'disabled':''}>›</button>
     <input type="date" class="input" style="width:auto;padding:6px 10px" value="${d}" max="${todayISO()}" data-act="purD"></div>
    <div class="seg">${[['day','Din ki entry'],['month',fmtMonth(m)+' ka hisab'],['sup','Suppliers']].map(([v,l])=>`<button class="${K.tab===v?'on':''}" data-act="kxTab" data-v="${v}">${l}</button>`).join('')}</div></div>
   ${K.tab==='day'?`<div class="kpi"><div class="card"><div class="l">Is din maal</div><div class="v">${inr(sum(dayP.filter(p=>kindOf(p)==='maal'),p=>p.amt))}</div></div><div class="card"><div class="l">Is din kharcha</div><div class="v">${inr(sum(dayP.filter(p=>kindOf(p)==='kharcha'),p=>p.amt))}</div></div><div class="card"><div class="l">Suppliers ko dena</div><div class="v">${inr(sum(suppliers(),s=>supBal(s.n)))}</div></div></div>`:''}`;
  return {html:`<div class="stack">${head}${K.tab==='day'?kxDay():K.tab==='month'?kxMonth():kxSup()}</div>`}};
document.addEventListener('input',e=>{const el=e.target;if(!el.id)return;
  if(el.id==='kxQ'||el.id==='kxR'){const a=$('#kxA');if(a&&!a.dataset.m){const q=+($('#kxQ')||{}).value,r=+($('#kxR')||{}).value;a.value=q>0&&r>0?Math.round(q*r*100)/100:''}}
  else if(el.id==='kxA')el.dataset.m=el.value?'1':''});
document.addEventListener('change',e=>{const el=e.target;
  if(el.id==='kxI'&&S.pk.kind==='maal'){const lp=lastPur(el.value);const u=$('#kxU'),r=$('#kxR'),s=$('#kxS');
    if(lp){if(u&&!u.value)u.value=lp.unit||'';if(r&&!r.value)r.value=lp.rate||'';if(s&&!s.value)s.value=lp.supplier||''}
    else if(u&&!u.value){const p=findProd(el.value);u.value=milkKey(el.value)?'L':(p&&p.u)||''}}
  if(el.id==='kxS'&&S.pk.kind==='suppay'){const b=$('#kxSb');if(b)b.textContent=el.value.trim()?'Abhi dena baki: '+inr(supBal(el.value.trim())):''}});
document.addEventListener('keydown',e=>{const t=e.target;if(e.key==='Enter'&&t.id&&/^kx[QURAN]$/.test(t.id)&&t.tagName==='INPUT'&&S.route==='purchase'){e.preventDefault();A.kxAdd()}});
Object.assign(A,{
  kxKind(d){S.pk.kind=d.v;S.pk.pre=null;render()},
  kxTab(d){S.pk.tab=d.v;render()},
  kxAdd(){if(!canWrite())return toast('Aapko write permission nahi hai');const K=S.pk;const amt=+($('#kxA')||{}).value;const mode=$('#kxM').value,by=$('#kxP').value,note=$('#kxN').value.trim();const base={date:S.purd,amt,mode,paidBy:mode==='udhaar'?'':by,note,by:S.me||'',t:Date.now()};
    if(K.kind==='suppay'){const sup=$('#kxS').value.trim();if(!sup)return toast('Supplier ka naam likho');if(!(amt>0))return toast('Amount likho');
      S.pk.pre=null;cashWrite(uid(),{type:'suppay',from:by,to:sup,amt,mode,date:S.purd,note,by:S.me||'',t:Date.now(),status:'ok'}).then(()=>toast('Supplier payment save · ab dena baki '+inr(supBal(sup))));return}
    let doc;
    if(K.kind==='maal'){const item=$('#kxI').value.trim();if(!item)return toast('Kya khareeda, ye likho');if(!(amt>0))return toast('Amount likho (ya quantity aur rate)');const unit=$('#kxU').value.trim();const sup=$('#kxS').value.trim();
      if(mode==='udhaar'&&!sup)return toast('Udhaar hai to supplier ka naam likho');const pk=(!unit||/^l(itre|iter|tr)?s?$/i.test(unit))?milkKey(item):'';
      doc={...base,kind:'maal',item,qty:+$('#kxQ').value||0,unit,rate:+$('#kxR').value||0,supplier:sup};if(pk)doc.pk=pk}
    else{if(!(amt>0))return toast('Amount likho');const cat=$('#kxC').value;doc={...base,kind:'kharcha',cat,item:$('#kxI').value.trim()||cat,person:$('#kxW').value||''}}
    const id=uid();S.purchases[id]={id,...doc};S.pk.pre=null;render();queue('pur:'+id,()=>S.db.doc('purchases/'+id).set(doc)).then(()=>toast((K.kind==='maal'?'Maal':'Kharcha')+' save · '+inr(amt)));
    setTimeout(()=>{const i=$('#kxI')||$('#kxA');if(i)i.focus()},60)},
  supAdd(){if(!isOwner())return;const n=$('#spN').value.trim();if(!n)return toast('Supplier ka naam likho');const ph=cleanPhone($('#spP').value);const cur=(settings().suppliers||[]).map(s=>typeof s==='string'?{n:s,ph:''}:s);
    const i=cur.findIndex(s=>norm(s.n)===norm(n));if(i>=0)cur[i]={...cur[i],ph:ph||cur[i].ph};else cur.push({n,ph});saveSettings({...settings(),suppliers:cur}).then(()=>toast(i>=0?'Supplier update':'Supplier jud gaya'))},
  supPay(d){closeSheet();S.pk={kind:'suppay',tab:'day',pre:{supplier:d.n}};S.purd=todayISO();render();setTimeout(()=>{const a=$('#kxA');if(a)a.focus()},60)},
  supOpen(d){const n=d.n;const E=[];Object.values(S.purchases).forEach(p=>{if(kindOf(p)!=='maal'||p.supplier!==n)return;const part=p.item+(+p.qty?' · '+L(p.qty)+' '+(p.unit||'')+(+p.rate?' × ₹'+L(p.rate):''):'');
      if(p.mode==='udhaar')E.push({date:p.date,t:p.t||0,part:part+' (udhaar)',dr:+p.amt||0});else E.push({date:p.date,t:p.t||0,part:part+' · '+modeTxt(p.mode||'')+' se turant diya '+inr(p.amt),cls:'info'})});
    Object.values(S.cash).forEach(x=>{if(x.type==='suppay'&&x.to===n&&x.status==='ok')E.push({date:x.date,t:x.t||0,part:'Payment diya · '+modeTxt(x.mode)+' · '+pl(x.from)+(x.note?' · '+x.note:''),cr:+x.amt||0,cls:'cr'})});
    E.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.t-b.t);const Lg=window.ledger(0,E);const s=suppliers().find(x=>x.n===n)||{};
    openSheet('Supplier khata · '+n,`<div class="stack"><div class="row sp wrap"><div>${s.ph?`<span class="small muted">${esc(s.ph)}</span>`:''}<div style="font-size:20px;font-weight:800;color:${supBal(n)>0.5?'var(--danger)':'var(--accent)'}">Dena baki: ${inr(supBal(n))}</div></div><button class="btn p" data-act="supPay" data-n="${esc(n)}">Payment karo</button></div>
      <div class="scroll"><table class="ldg"><thead><tr><th>Date</th><th>Kya</th><th class="n">Udhaar maal</th><th class="n">Payment</th><th class="n">Dena baki</th></tr></thead><tbody>${Lg.map(e=>`<tr class="${e.cls||''}"><td class="dt">${fmtShort(e.date)} ${e.date.slice(2,4)}</td><td>${esc(e.part)}</td><td class="n">${e.dr?inr(e.dr):''}</td><td class="n c">${e.cr?inr(e.cr):''}</td><td class="n bal">${e.dr||e.cr?inr(e.bal):''}</td></tr>`).join('')||'<tr><td colspan="5" class="muted">Abhi koi entry nahi</td></tr>'}</tbody></table></div></div>`);$('#sheet .panel').classList.add('wide')},
  kxXlsx(){const m=S.purd.slice(0,7);const N=monthNums(m);xlsxSave(`oritic-kharcha-${m}.xlsx`,[['Entries',N.P.sort((a,b)=>a.date.localeCompare(b.date)||(a.t||0)-(b.t||0)).map(p=>({'Date':p.date,'Type':kindOf(p)==='kharcha'?'Kharcha':'Maal','Category':p.cat||'','Item':p.item||'','Qty':+p.qty||'','Unit':p.unit||'','Rate':+p.rate||'','Amount ₹':+p.amt||0,'Supplier':p.supplier||'','Kisko':p.person?pl(p.person):'','Mode':modeTxt(p.mode),'Kisne diya':p.paidBy?pl(p.paidBy):'','Note':p.note||''})),[11,9,16,24,7,6,7,10,18,14,8,14,24]],
    ['Summary',[['Mahina',fmtMonth(m)],['Sale (delivered)',Math.round(N.sale)],['Maal khareeda',Math.round(N.maal)],['Kharcha',Math.round(N.kh)],['Discount / write-off',Math.round(N.disc)],['Extra charge',Math.round(N.chg)],['Bachat (andaza)',Math.round(N.profit)],['Collection',Math.round(N.coll)]],[22,14]]])}
});

/* =====================================================================
   VASOOLI: kis se kitna lena hai
   ===================================================================== */
S.du={boy:'all',f:'all',q:''};
function duesData(){const B=window.allBalances();const last={};for(const p of Object.values(S.payments)){const x=last[p.cid];if(!x||p.date>x.date||(p.date===x.date&&(p.t||0)>(x.t||0)))last[p.cid]=p}
  const m=todayISO().slice(0,7),mb={},first={};Object.keys(S.days).sort().forEach(d=>{const rows=S.days[d].rows||{};for(const id in rows){if(rows[id].s!=='d')continue;if(!first[id])first[id]=d;if(d.slice(0,7)===m)mb[id]=(mb[id]||0)+(+rows[id].a||0)}});
  return Object.values(S.customers).map(c=>{const lp=last[c.id];const since=lp?lp.date:(first[c.id]||c.since||c.createdAt||'');return {c,bal:B[c.id]||0,lp,days:since?Math.max(0,dd(since,todayISO())):0,mb:mb[c.id]||0}})}
const remText=(c,bal,lp)=>{const st=settings();return `Namaste ${c.name} ji 🙏\n${st.company||'Oritic'} ki taraf se: aapka abhi tak ka baki *${inr(bal)}* hai.${lp?`\nPichla payment: ${inr(lp.amt)} (${fmtShort(lp.date)})`:''}\nKripya payment kar dein.${st.upi?'\nUPI: '+st.upi:''}\nDhanyavaad`};
function duesList(){const D=duesData();const q=S.du.q.trim().toLowerCase(),lim=+settings().dueLimit||0;const f=S.du.f;
  let Ls=D.filter(x=>(S.du.boy==='all'||x.c.boy===S.du.boy)&&(!q||(x.c.name+' '+(x.c.phone||'')+' '+(x.c.area||'')).toLowerCase().includes(q)));
  Ls=Ls.filter(x=>f==='adv'?x.bal<-0.5:x.bal>0.5&&(f==='all'||(f==='d15'&&x.days>15)||(f==='d30'&&x.days>30)||(f==='big'&&x.bal>=1000)||(f==='lim'&&lim>0&&x.bal>lim)||(f==='paused'&&x.c.status!=='active')));
  return {D,Ls:Ls.sort((a,b)=>f==='adv'?a.bal-b.bal:b.bal-a.bal),lim}}
function vDues(){const {D,Ls,lim}=duesList();const pos=D.filter(x=>x.bal>0.5);const today=todayISO();
  const bk=(a,b)=>sum(pos.filter(x=>x.days>=a&&x.days<=b),x=>x.bal);const adv=sum(D.filter(x=>x.bal<-0.5),x=>-x.bal);
  const left=Ls.filter(x=>x.c.phone&&x.c.remAt!==today&&x.bal>0.5).length;
  const html=`<div class="stack">
   <div class="kpi"><div class="card"><div class="l">Kul lena hai</div><div class="v" style="color:var(--danger)">${inr(sum(pos,x=>x.bal))}</div><div class="s">${pos.length} customers se</div></div>
    <div class="card"><div class="l">0–15 din</div><div class="v">${inr(bk(0,15))}</div><div class="s">abhi haal me payment aaya</div></div>
    <div class="card"><div class="l">16–30 din</div><div class="v" style="color:var(--warn)">${inr(bk(16,30))}</div><div class="s">yaad dilana chahiye</div></div>
    <div class="card"><div class="l">30+ din</div><div class="v" style="color:var(--danger)">${inr(bk(31,99999))}</div><div class="s">bahut din se payment nahi</div></div>
    <div class="card"><div class="l">Advance jama</div><div class="v">${inr(adv)}</div><div class="s">customers ka paisa humare paas</div></div></div>
   <div class="shtool"><input class="input" style="max-width:220px;padding:7px 10px" placeholder="Naam, phone, area  ( / )" value="${esc(S.du.q)}" data-duq>
    ${chips([{v:'all',l:'Sab baki'},{v:'d15',l:'15+ din'},{v:'d30',l:'30+ din'},{v:'big',l:'₹1,000+'},...(lim>0?[{v:'lim',l:'Limit paar'}]:[]),{v:'paused',l:'Paused / chhod gaye'},{v:'adv',l:'Advance'}],S.du.f,'duF')}<span class="vsep"></span>${boyChips(S.du.boy,'duBoy')}</div>
   <div class="row sp wrap"><div class="small muted">${Ls.length} customers · ${inr(sum(Ls,x=>Math.abs(x.bal)))}. "Din" = pichle payment ko kitne din hue (payment kabhi nahi aaya to pehli delivery se).</div>
    <div class="row wrap"><button class="btn sm p" data-act="duNext" ${left?'':'disabled'}>${ICONS.wa} ${left?`Agla yaad dilao (${left} baaki)`:'Aaj sabko yaad dila diya'}</button><button class="btn sm o" data-act="duXlsx">Excel</button></div></div>
   <div class="card" style="padding:0"><div class="scroll"><table class="tbl"><thead><tr><th>Customer</th><th class="n">Baki</th><th class="n">Is mahine bill</th><th>Pichla payment</th><th class="n">Din</th><th>Yaad dilaya</th><th></th></tr></thead><tbody>
    ${Ls.map(x=>{const c=x.c;return `<tr><td><button class="acopen" style="width:auto;padding:0;font-size:14px" data-act="openCustomer" data-id="${c.id}">${esc(c.name)}${window.phc?phc(c):''} ↗</button>${c.status!=='active'?' <span class="badge y">Paused</span>':''}${lim>0&&x.bal>lim?' <span class="badge r">limit paar</span>':''}<div class="small muted">${esc(c.area||'—')} · ${esc(c.boy||'—')}${c.phone?' · '+esc(c.phone):''}</div></td>
      <td class="n" style="font-weight:800;font-size:15px;color:${x.bal>0.5?'var(--danger)':'var(--accent)'}">${inr(x.bal)}</td><td class="n">${x.mb?inr(x.mb):'–'}</td>
      <td>${x.lp?`${inr(x.lp.amt)} <span class="small muted">· ${fmtShort(x.lp.date)} · ${x.lp.mode==='cash'?'Cash':'UPI'}</span>`:'<span class="muted">kabhi nahi</span>'}</td>
      <td class="n" style="font-weight:700;color:${x.days>30?'var(--danger)':x.days>15?'var(--warn)':'inherit'}">${x.days}</td>
      <td class="small">${c.remAt?(c.remAt===today?'<span class="badge g">aaj</span>':fmtShort(c.remAt)):'<span class="muted">–</span>'}</td>
      <td class="act">${c.phone&&x.bal>0.5?`<a class="btn xs" href="https://wa.me/91${cleanPhone(c.phone)}?text=${encodeURIComponent(remText(c,x.bal,x.lp))}" target="_blank" rel="noopener" data-rem="${c.id}">${ICONS.wa} Yaad dilao</a> `:''}<button class="btn xs p" data-act="addPayment" data-id="${c.id}">Payment lo</button></td></tr>`}).join('')||'<tr><td colspan="7"><div class="empty">Is filter me koi customer nahi</div></td></tr>'}</tbody></table></div></div></div>`;
  return {html}}
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&'duq' in el.dataset){S.du.q=el.value;clearTimeout(S.du.t);S.du.t=setTimeout(()=>{const pos=el.selectionStart;render();const n=$('#view [data-duq]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}},150)}});
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[data-rem]');if(a&&S.customers[a.dataset.rem])saveCustField(a.dataset.rem,{remAt:todayISO()})});
Object.assign(A,{
  duF(d){S.du.f=d.v;render()},duBoy(d){S.du.boy=d.v;render()},
  duNext(){const today=todayISO();const x=duesList().Ls.find(x=>x.c.phone&&x.c.remAt!==today&&x.bal>0.5);if(!x)return;saveCustField(x.c.id,{remAt:today});window.open(`https://wa.me/91${cleanPhone(x.c.phone)}?text=${encodeURIComponent(remText(x.c,x.bal,x.lp))}`,'_blank','noopener');render()},
  duXlsx(){const {Ls}=duesList();xlsxSave(`oritic-vasooli-${todayISO()}.xlsx`,[['Vasooli',Ls.map(x=>({'Naam':x.c.name,'Mobile':x.c.phone||'','Area':x.c.area||'','Boy':x.c.boy||'','Status':x.c.status==='active'?'Active':'Paused','Baki ₹':Math.round(x.bal),'Is mahine bill ₹':Math.round(x.mb),'Pichla payment ₹':x.lp?+x.lp.amt:'','Pichla payment date':x.lp?x.lp.date:'','Din se payment nahi':x.days})),[24,12,16,10,8,10,14,14,16,16]]])}
});

/* =====================================================================
   BOTTLES: doodh ke type se (pehle di hui bottle pehle wapas maani jaati hai)
   ===================================================================== */
S.bt={boy:'all',f:'out',q:''};
function botAll(){const M={};const get=id=>M[id]||(M[id]={q1:[],qh:[],u:0,d1:0,dh:0,last:''});
  for(const c of Object.values(S.customers))get(c.id).u=+c.bottles||0;
  Object.keys(S.days).sort().forEach(d=>{const rows=S.days[d].rows||{};for(const id in rows){if(!S.customers[id])continue;const r=rows[id],g=get(id);
    if(r.s==='d'&&(+r.bo||0)>0){const o=bottlesOf(r.q);if(o.b+o.s===+r.bo)PRODUCTS.forEach(p=>{const x=bottlesOf({[p.k]:+(r.q&&r.q[p.k])||0});for(let i=0;i<x.b;i++)g.q1.push({k:p.k,d});for(let i=0;i<x.s;i++)g.qh.push({k:p.k,d})});else g.u+=+r.bo}
    const x=brSplit(r);if(x.s||x.b||x.u)g.last=d;
    for(let i=0;i<x.s;i++){if(g.qh.length)g.qh.shift();else g.dh++}for(let i=0;i<x.b;i++){if(g.q1.length)g.q1.shift();else g.d1++}g.u-=x.u}});
  for(const id in M){const g=M[id];g.s=g.qh.length-g.dh;g.b=g.q1.length-g.d1;g.t=g.s+g.b+g.u;g.by={};PRODUCTS.forEach(p=>g.by[p.k]={s:0,b:0});g.qh.forEach(x=>g.by[x.k].s++);g.q1.forEach(x=>g.by[x.k].b++);
    const ds=[...g.qh,...g.q1].map(x=>x.d).sort();g.old=ds[0]||'';g.days=g.old?dd(g.old,todayISO()):0}
  return M}
window.botAll=botAll;
const botMatrix=T=>`<div class="btx"><div class="h">Doodh</div><div class="h">½L</div><div class="h">1L</div><div class="h">Total</div>${PRODUCTS.filter(p=>T[p.k].s||T[p.k].b).map(p=>`<div>${BTN[p.k]||p.sh}</div><div>${T[p.k].s||'–'}</div><div>${T[p.k].b||'–'}</div><div><b>${T[p.k].s+T[p.k].b}</b></div>`).join('')||'<div>—</div><div>–</div><div>–</div><div>–</div>'}</div>`;
function botTotals(M,ids){const T={};PRODUCTS.forEach(p=>T[p.k]={s:0,b:0});let u=0,t=0;ids.forEach(id=>{const g=M[id];if(!g)return;PRODUCTS.forEach(p=>{T[p.k].s+=g.by[p.k].s;T[p.k].b+=g.by[p.k].b});u+=g.u;t+=g.t});return {T,u,t}}
const _vb=vBottles;
vBottles=function(){if(!isOwner())return _vb();const M=botAll(),today=todayISO();const q=S.bt.q.trim().toLowerCase();const all=Object.values(S.customers);
  const TT=botTotals(M,all.map(c=>c.id));const ret={s:0,b:0,u:0};Object.values((S.days[today]||{}).rows||{}).forEach(r=>{const x=brSplit(r);ret.s+=x.s;ret.b+=x.b;ret.u+=x.u});
  const late=all.filter(c=>M[c.id]&&M[c.id].days>=7&&M[c.id].t>0).length;
  let Ls=all.filter(c=>(S.bt.boy==='all'||c.boy===S.bt.boy)&&(!q||(c.name+' '+(c.area||'')+' '+(c.phone||'')).toLowerCase().includes(q)));
  Ls=Ls.filter(c=>{const g=M[c.id]||{t:0,days:0};return q?true:S.bt.f==='all'?true:S.bt.f==='late'?g.t>0&&g.days>=7:g.t!==0});
  Ls.sort((a,b)=>(M[b.id]?M[b.id].t:0)-(M[a.id]?M[a.id].t:0)||a.name.localeCompare(b.name));
  const html=`<div class="stack">
   <div class="grid g2 tight"><div class="card"><div class="row sp"><h3>Customers ke paas bottles</h3><b style="font-size:22px">${TT.t}</b></div><div style="margin-top:8px">${botMatrix(TT.T)}</div>${TT.u?`<div class="small muted" style="margin-top:6px">${TT.u} bottle bina size / type ki (purani entry ya manual sudhaar)</div>`:''}</div>
    <div class="card"><h3>Aaj</h3><div class="mini"><span>Aaj wapas aayi</span><b>${ret.s+ret.b+ret.u} <span class="small muted">(½L ${ret.s} · 1L ${ret.b}${ret.u?' · '+ret.u+' bina size':''})</span></b></div>
     <div class="mini"><span>7+ din se bottle nahi lautayi</span><b style="color:${late?'var(--danger)':'inherit'}">${late} customers</b></div>
     <div class="small muted" style="margin-top:8px">Delivery hote hi bottle apne aap judti hai. Wapasi Delivery sheet ke "Wapas" column me ya boy ke phone se likhi jaati hai. Doodh ke type ka hisab aise banta hai: jo bottle pehle di thi wahi pehle wapas maani jaati hai.</div></div></div>
   <div class="shtool"><input class="input" style="max-width:220px;padding:7px 10px" placeholder="Customer dhoondo  ( / )" value="${esc(S.bt.q)}" data-btq>
    ${chips([{v:'out',l:'Jinke paas bottle hai'},{v:'late',l:'7+ din se nahi lautayi'},{v:'all',l:'Sab customers'}],S.bt.f,'btF')}<span class="vsep"></span>${boyChips(S.bt.boy,'btBoy')}</div>
   <div class="card" style="padding:0"><div class="scroll"><table class="tbl"><thead><tr><th>Customer</th><th class="n">½L</th><th class="n">1L</th><th>Kaunsi</th><th class="n">Total</th><th>Sabse purani</th><th>Pichli wapasi</th><th class="n">Manual sudhaar</th></tr></thead><tbody>
    ${Ls.map(c=>{const g=M[c.id];const ty=PRODUCTS.filter(p=>g.by[p.k].s||g.by[p.k].b).map(p=>`${BTN[p.k]||p.sh} ${g.by[p.k].s+g.by[p.k].b}`).join(' · ');
      return `<tr><td><button class="acopen" style="width:auto;padding:0;font-size:14px" data-act="acBot" data-id="${c.id}">${esc(c.name)}${window.phc?phc(c):''} ↗</button><div class="small muted">${esc(c.area||'—')} · ${esc(c.boy||'—')}</div></td><td class="n">${g.s||'–'}</td><td class="n">${g.b||'–'}</td><td class="small">${ty||'<span class="muted">–</span>'}${g.u?` <span class="muted">· ${g.u} bina size</span>`:''}</td>
       <td class="n" style="font-weight:800;font-size:15px">${g.t}</td><td class="small" style="color:${g.days>=7&&g.t>0?'var(--danger)':'inherit'};font-weight:${g.days>=7&&g.t>0?700:400}">${g.old?fmtShort(g.old)+' · '+g.days+' din':'–'}</td><td class="small">${g.last?fmtShort(g.last):'<span class="muted">kabhi nahi</span>'}</td>
       <td class="act"><button class="btn xs o" data-act="bottle" data-id="${c.id}" data-n="-1" aria-label="Ek kam">−</button> <button class="btn xs o" data-act="bottle" data-id="${c.id}" data-n="1" aria-label="Ek zyada">+</button></td></tr>`}).join('')||'<tr><td colspan="8"><div class="empty">Is filter me koi customer nahi</div></td></tr>'}</tbody></table></div></div></div>`;
  return {html}};
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&'btq' in el.dataset){S.bt.q=el.value;clearTimeout(S.bt.t);S.bt.t=setTimeout(()=>{const pos=el.selectionStart;render();const n=$('#view [data-btq]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}},150)}});
Object.assign(A,{btF(d){S.bt.f=d.v;render()},btBoy(d){S.bt.boy=d.v;render()},acBot(d){A.openCustomer({id:d.id});if(S.ac&&S.ac.id===d.id)A.acTab({v:'bottles'})}});

/* =====================================================================
   METER: kab shuru, kab khatam, start / end reading → KM
   ===================================================================== */
const hhmm=t=>{const d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
const mins=s=>{const m=/^(\d{1,2}):(\d{2})$/.exec(s||'');return m?+m[1]*60+ +m[2]:null};
const durTxt=(a,b)=>{const x=mins(a),y=mins(b);if(x==null||y==null||y<x)return '';const n=y-x;return Math.floor(n/60)+' ghante '+(n%60)+' min'};
vOdoOwner=function(){const date=S.odod;loadOdo(date);purgeOld();const o=S.odo[date]||{};const rate=+(settings().kmRate??2);
  const bl=[...new Set([...boys(),...(o.list||[]).map(x=>x.boy)])];const mk=Object.values(S.kms).filter(k=>k.date.slice(0,7)===S.odom);
  const html=`<div class="stack">
    <div class="row sp wrap"><div class="row"><button class="btn sm o" data-act="odoShift" data-n="-1">‹</button><button class="btn sm"><b>${date===todayISO()?'Aaj · ':''}${fmtDate(date)}</b></button><button class="btn sm o" data-act="odoShift" data-n="1" ${date>=todayISO()?'disabled':''}>›</button></div>
      <div class="row"><input type="date" class="input" style="width:auto;padding:6px 10px" value="${date}" max="${todayISO()}" data-act="odoD"><button class="btn sm o" data-act="odoReload">Refresh</button></div></div>
    <div class="small muted">Boy duty shuru aur khatam karte waqt meter ki photo leta hai (time apne aap aata hai). Aap photo dekh ke Start KM aur End KM likho, Total KM apne aap nikal aayega. Photo na ho to time aur KM haath se bhi likh sakte ho. Photos 30 din baad hat jaati hain, KM aur incentive hamesha rehte hain. Rate har boy ka apna (Team & cash → naam → Profile), na ho to ₹${L(rate)}/km. Petrol / charging ⛽ button se.</div>
    ${o.loading?'<div class="empty">Photos load ho rahi hain…</div>':bl.map(b=>{const ph=(o.list||[]).filter(x=>x.boy===b);const k=S.kms[kmKey(date,b)];const kid=norm(b)||'x';
      const s0=ph.find(x=>x.kind==='start'),e0=ph.filter(x=>x.kind==='end').slice(-1)[0];const st=(k&&k.st)||(s0?hhmm(s0.t):''),en=(k&&k.en)||(e0?hhmm(e0.t):'');
      return `<div class="card"><div class="row sp wrap"><h2>${esc(b)}</h2>${k?`<span class="badge g">${L(k.km)} km · ${inr(k.inc)}</span>`:ph.length?'<span class="badge y">KM likhna baaki</span>':'<span class="badge n">Photo nahi</span>'}</div>
       <div style="margin-top:10px">${thumbsHtml(ph)}</div>
       <div class="frm" style="margin-top:12px"><div class="field"><label class="f">Duty shuru (time)</label><input class="input" type="time" id="odS_${kid}" value="${esc(st)}"></div><div class="field"><label class="f">Duty khatam (time)</label><input class="input" type="time" id="odE_${kid}" value="${esc(en)}"></div>
        <div class="field"><label class="f">Start KM (meter)</label><input class="input" type="number" inputmode="decimal" id="odR0_${kid}" data-odr="${kid}" value="${k&&k.r0!=null?esc(k.r0):''}"></div><div class="field"><label class="f">End KM (meter)</label><input class="input" type="number" inputmode="decimal" id="odR1_${kid}" data-odr="${kid}" value="${k&&k.r1!=null?esc(k.r1):''}"></div>
        <div class="field"><label class="f">Total KM *</label><input class="input" id="km_${kid}" type="number" inputmode="decimal" value="${k?L(k.km):''}" placeholder="End − Start"></div>
        <div class="field"><label class="f">Trip / chakkar</label><input class="input" id="odT_${kid}" type="number" inputmode="numeric" min="0" value="${k&&k.trips?esc(k.trips):''}" placeholder="1"></div>
        <div class="field" style="align-self:flex-end"><button class="btn p block" data-act="kmSave" data-b="${esc(b)}">Save · incentive (₹${L(kmRateOf(b))}/km)</button></div>
        <div class="field" style="align-self:flex-end"><button class="btn o block" data-act="enForm" data-p="${esc(b)}">⛽ Petrol / charging</button></div></div>
       ${st&&en&&durTxt(st,en)?`<div class="small muted" style="margin-top:6px">Duty: ${esc(st)} se ${esc(en)} · ${durTxt(st,en)}</div>`:''}</div>`}).join('')}
    <div class="card"><div class="row sp wrap"><h3>Mahine ka KM, incentive aur petrol</h3><input type="month" class="input" style="width:auto" value="${S.odom}" data-act="odoM"></div>
      <div class="scroll"><table class="tbl compact" style="margin-top:8px"><thead><tr><th>Boy</th><th class="n">Din</th><th class="n">KM</th><th class="n">Trip</th><th class="n">KM incentive</th><th class="n">Petrol / charging</th><th class="n">Petrol ₹/km</th></tr></thead><tbody>
      ${(()=>{const EM=Object.values(S.purchases||{}).filter(x=>x.veh&&String(x.date).slice(0,7)===S.odom);const B=[...new Set([...mk.map(k=>k.boy),...EM.map(x=>x.veh)])].sort();
        return B.map(b=>{const r=mk.filter(k=>k.boy===b),km=sum(r,k=>k.km),en=sum(EM.filter(x=>x.veh===b),x=>x.amt);return `<tr class="click" data-act="pcOpenKm" data-p="${esc(b)}"><td><b>${esc(b)}</b></td><td class="n">${r.length}</td><td class="n">${L(km)}</td><td class="n">${sum(r,k=>+k.trips||0)||'–'}</td><td class="n"><b>${inr(sum(r,k=>k.inc))}</b></td><td class="n">${en?inr(en):'–'}</td><td class="n">${km&&en?'₹'+L(Math.round(en/km*100)/100):'–'}</td></tr>`}).join('')||'<tr><td colspan="7" class="muted">Is mahine koi KM record nahi</td></tr>'})()}</tbody></table></div>
      <div class="small muted" style="margin-top:6px">Boy ke naam pe click karo to din-wise KM aur petrol dikhega.</div></div></div>`;
  return {html}};
document.addEventListener('input',e=>{const el=e.target;if(!el.dataset||!el.dataset.odr)return;const k=el.dataset.odr;const a=$('#odR0_'+k).value,b=$('#odR1_'+k).value;if(a!==''&&b!==''&&+b>=+a)$('#km_'+k).value=Math.round((+b-+a)*10)/10});
Object.assign(A,{
  kmSave(d){const b=d.b,kid=norm(b)||'x';const inp=$('#km_'+kid);const km=+inp.value;if(inp.value===''||!(km>=0))return toast('Total KM likho (ya Start aur End KM)');const r0=$('#odR0_'+kid).value,r1=$('#odR1_'+kid).value;if(r0!==''&&r1!==''&&+r1<+r0)return toast('End KM, Start KM se kam nahi ho sakta');
    const rate=kmRateOf(b);const id=kmKey(S.odod,b);const doc={date:S.odod,boy:b,km,rate,inc:Math.round(km*rate*100)/100,trips:Math.max(0,Math.round(+(($('#odT_'+kid)||{}).value)||0)),st:$('#odS_'+kid).value||'',en:$('#odE_'+kid).value||'',r0:r0===''?null:+r0,r1:r1===''?null:+r1,by:S.me||'',t:Date.now()};
    S.kms[id]={id,...doc};render();queue('km:'+id,()=>S.db.doc('kms/'+id).set(doc)).then(()=>toast(b+': '+L(km)+' km · incentive '+inr(doc.inc)))},
  pcOpenKm(d){S.pc.id=d.p;S.pc.tab='km';S.pc.m=S.odom;pcDraw(true)}
});

/* =====================================================================
   DEMAND: order supplier / godown ko bhejna
   ===================================================================== */
S.fw={d:null};
function fwText(date){const milk={},BT=btNew(),X={};let n=0;
  for(const c of Object.values(S.customers)){const it=itemsFor(c,date);if(!it)continue;n++;PRODUCTS.forEach(p=>milk[p.k]=(milk[p.k]||0)+(+(it.q&&it.q[p.k])||0));btAdd(BT,it.q||{});
    (it.x||[]).forEach(e=>{const key=e.k?'k:'+e.k:(e.pid||'n:'+norm(e.base||e.n));const g=X[key]||(X[key]={n:e.k?(e.k==='ghee'?'Ghee':'Paneer'):(e.base||e.n),u:e.k?'kg':((products().find(p=>p.id===e.pid)||{}).u||''),q:0});g.q+=e.k?(+e.u||0):(+e.qty||1)})}
  let t=`*${settings().company||'Oritic'}* · ${fmtDate(date)} ka order\n(${n} customers)\n\nDoodh:\n`;
  PRODUCTS.forEach(p=>{if(milk[p.k]>0)t+=`• ${BTN[p.k]||p.sh}: ${L(milk[p.k])} L  (${btText(BT[p.k])})\n`});
  const xs=Object.values(X);if(xs.length){t+='\nSaath me:\n';xs.forEach(g=>t+=`• ${g.n}: ${g.u==='kg'?fq(g.q,'kg'):L(g.q)+(g.u?' '+g.u:'')}\n`)}
  t+=`\nBottles: ${sum(PRODUCTS,p=>BT[p.k].b)} × 1L, ${sum(PRODUCTS,p=>BT[p.k].s)} × ½L`;return t}
const _vf=vForecast;
vForecast=function(){const o=_vf();const d=S.fw.d||planDayISO();const sup=suppliers().filter(s=>s.ph);
  const card=`<div class="card"><div class="row sp wrap"><h3>Supplier / godown ko order bhejo</h3><div class="row wrap"><input type="date" class="input" style="width:auto;padding:6px 10px" value="${d}" min="${todayISO()}" data-fwd aria-label="Kis din ka order"><button class="btn sm o" data-act="fwLoad">Boy-wise loading sheet</button></div></div>
    <div class="small muted" style="margin:4px 0 8px">${fmtDate(d)} ko jo maal chahiye uski list: confirm hue order + baaki customers ka roz ka order. Bhejne se pehle yahin badal sakte ho (jaise thoda extra doodh).</div>
    <textarea class="input" id="fwT" style="min-height:200px;font-family:ui-monospace,Consolas,monospace;font-size:13px">${esc(fwText(d))}</textarea>
    <div class="row wrap" style="margin-top:8px"><button class="btn p" data-act="fwCopy">Copy karo</button><button class="btn" data-act="fwWa">${ICONS.wa} WhatsApp pe bhejo</button>${sup.length?`<select class="input" id="fwS" style="width:auto"><option value="">Kisko: WhatsApp me khud chuno</option>${sup.map(s=>`<option value="${esc(s.ph)}">${esc(s.n)}</option>`).join('')}</select>`:'<span class="small muted">Supplier ka number Kharcha → Suppliers me daaloge to yahan seedha uska naam aayega.</span>'}</div></div>`;
  return {...o,html:o.html.replace('<div class="stack">','<div class="stack">'+card)}};
document.addEventListener('change',e=>{const el=e.target;if(el.dataset&&'fwd' in el.dataset&&el.value){S.fw.d=el.value;render()}});
Object.assign(A,{
  fwCopy(){copyText($('#fwT').value)},
  fwWa(){const ph=($('#fwS')||{}).value||'';window.open('https://wa.me/'+(ph?'91'+cleanPhone(ph):'')+'?text='+encodeURIComponent($('#fwT').value),'_blank','noopener')},
  fwLoad(){S.pld=S.fw.d||planDayISO();A.go({r:'sheet'});A.shLoad()}
});

/* =====================================================================
   DASHBOARD: business cards + "dhyan dein"
   ===================================================================== */
const _vh=vHome;
vHome=function(){const o=_vh();if(!isOwner()||!Object.keys(S.customers).length)return o;
  const today=todayISO(),pd=planDayISO(),m=today.slice(0,7);const act=Object.values(S.customers).filter(c=>c.status==='active');
  const conf=(c,d)=>{const r=rowOf(d,c.id);return !!r&&(r.s!=='p'||!!r.pl)};
  const al=[];const A1=(cls,txt,r,extra)=>al.push(`<button class="al ${cls}" data-act="${extra||'go'}" data-r="${r}"><span>${txt}</span><span class="go">Kholo ›</span></button>`);
  const todo=act.filter(c=>!conf(c,pd)).length;if(todo)A1('r',`<b>${fmtDate(pd)}</b> ke ${todo} order abhi confirm nahi hue`,'sheet');
  const notDel=Object.values((S.days[today]||{}).rows||{}).filter(r=>r.s==='p'&&r.pl).length;if(notDel)A1('y',`Aaj ki ${notDel} delivery pe abhi ✓ nahi laga`,'today');
  const pp=OBX.pastPending?OBX.pastPending():[];if(pp.length)A1('r',`Pichli ${pp.length} dates pe ${sum(pp,x=>x.n)} delivery ✓ nahi hui (bill me nahi judegi)`,'sheet');
  const pend=Object.values(S.cash).filter(x=>x.type==='handover'&&x.status==='pending');if(pend.length)A1('y',`${pend.length} cash handover (${inr(sum(pend,x=>x.amt))}) "Mila ✓" hona baaki`,'team');
  const H=cashAll(),clim=+(settings().cashLimit??2000);const overP=Object.keys(H).filter(p=>clim>0&&H[p]>clim);if(overP.length)A1('y',`${overP.map(pl).join(', ')} ke haath me limit se zyada cash hai`,'team');
  const B=window.allBalances();const dlim=+settings().dueLimit||0;const overD=dlim>0?Object.values(B).filter(v=>v>dlim).length:0;if(overD)A1('r',`${overD} customers ka baki ${inr(dlim)} ki limit se zyada`,'dues');
  const M=botAll();const lateB=Object.values(S.customers).filter(c=>M[c.id]&&M[c.id].t>0&&M[c.id].days>=7).length;if(lateB)A1('b',`${lateB} customers ne 7+ din se bottle nahi lautayi`,'bottles');
  const supDue=sum(suppliers(),s=>supBal(s.n));if(supDue>0.5)A1('b',`Suppliers ko ${inr(supDue)} dena baki hai`,'purchase','kxGoSup');
  const N=monthNums(m);const totBal=sum(Object.values(B).filter(v=>v>0.5),v=>v);const TT=botTotals(M,Object.keys(S.customers));
  const top=`<div class="stack" style="margin-bottom:16px">
    ${al.length?`<div class="card"><h3>Dhyan dein</h3><div class="alist">${al.join('')}</div></div>`:`<div class="card"><h3>Sab theek hai ✓</h3><div class="small muted">Abhi koi kaam ruka hua nahi dikh raha.</div></div>`}
    <div class="kpi"><div class="card"><div class="l">${fmtMonth(m)} sale</div><div class="v">${inr(N.sale)}</div><div class="s">delivered ka bill</div></div>
     <div class="card"><div class="l">Paisa aaya</div><div class="v">${inr(N.coll)}</div><div class="s">cash + UPI</div></div>
     <div class="card"><div class="l">Maal + kharcha</div><div class="v">${inr(N.maal+N.kh)}</div><div class="s">maal ${inr(N.maal)} · kharcha ${inr(N.kh)}</div></div>
     <div class="card"><div class="l">Bachat (andaza)</div><div class="v" style="color:${N.profit<0?'var(--danger)':'var(--accent)'}">${inr(N.profit)}</div><div class="s">sale${N.chg?' + charge':''}${N.disc?' − discount':''} − maal − kharcha</div></div>
     <button class="card" data-act="go" data-r="dues" style="text-align:left"><div class="l">Customers se lena</div><div class="v" style="color:var(--danger)">${inr(totBal)}</div><div class="s">Vasooli kholo ›</div></button></div>
    <div class="grid g2 tight"><div class="card"><div class="row sp"><h3>Cash kiske paas</h3><button class="btn xs" data-act="go" data-r="team">Team & cash</button></div><div style="margin-top:6px">${Object.keys(H).filter(p=>Math.abs(H[p])>0.5||persons().includes(p)).map(p=>`<div class="mini"><span>${esc(pl(p))}</span><b style="color:${clim>0&&H[p]>clim?'var(--danger)':'inherit'}">${inr(H[p])}</b></div>`).join('')}</div></div>
     <div class="card"><div class="row sp"><h3>Bottles customers ke paas · ${TT.t}</h3><button class="btn xs" data-act="go" data-r="bottles">Bottles</button></div><div style="margin-top:8px">${botMatrix(TT.T)}</div></div></div></div>`;
  return {...o,html:top+o.html}};
A.kxGoSup=function(){S.pk.tab='sup';A.go({r:'purchase'})};

/* ---------- keep person window fresh; Esc closes it ---------- */
const _ar=window.afterRender;let pcPend=false;
const typingP=a=>a&&a.closest&&a.closest('#pacct')&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
window.afterRender=()=>{if(_ar)_ar();if(!S.pc.id)return;if(typingP(document.activeElement)){pcPend=true;return}pcDraw(false)};
document.addEventListener('focusout',()=>{if(!pcPend)return;setTimeout(()=>{if(pcPend&&!typingP(document.activeElement)){pcPend=false;if(S.pc.id)pcDraw(false)}},150)});
document.addEventListener('keydown',e=>{if(!S.pc.id||e.key!=='Escape')return;if(!$('#sheet').hidden||($('#cbox')&&!$('#cbox').hidden)||($('#kp')&&!$('#kp').hidden)||(S.ac&&S.ac.id))return;e.preventDefault();e.stopPropagation();pcClose()},true);
const _go=A.go;A.go=function(d){if(S.pc.id)pcClose();_go(d)};
const _oc=A.openCustomer;A.openCustomer=function(d){if(S.pc.id)pcClose();_oc(d)};
const _lo=A.logout;A.logout=function(d){if(S.pc.id)pcClose();_lo(d)};
window.OBZ={cashAll,cashInHand,botAll,suppliers,supBal,monthNums,persons};
})();
