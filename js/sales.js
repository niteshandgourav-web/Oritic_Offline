/* v4: Sales rep → manager approval (js/sales.js)
   Jis office member ke paas "Delivery sheet" access nahi hai wo sales rep hai:
   - wo Naya order bhar sakta hai, par order seedha Delivery sheet me nahi jata. Request banti hai.
     naya customer  → customers/<id> status:'request', req:{type:'new',by,t}, sale:{by,t}
     purana customer → us customer pe req:{type:'change',by,t,data:{...}} (asli order nahi chhedte)
   - manager (jiske paas Delivery sheet access hai) ya owner dekh ke Approve / Wapas karta hai. Approve pe hi customer sheet me aata hai.
   - sales rep wo sab raste nahi chala sakta jo sheet badalte hain: customer edit, grid save, pause / resume, rate, chhutti, Aaj list.
   - har order pe likha rehta hai kisne liya, kisne approve kiya, kab. "Kisne kitne order liye" me ginti. */
(function(){
const needOk=()=>S.role==='owner'&&!!window.canDo&&!canDo('sheet');
const canOk=()=>S.role==='owner'&&(!window.canDo||canDo('sheet'));
window.needOk=needOk;
const PK=['cow','buffalo','desi','chaach'];
const ordTxt=o=>PRODUCTS.filter(p=>+(o&&o[p.k])>0).map(p=>L(o[p.k])+'L '+(p.k==='desi'?'Gir':p.sh)).join(' + ')||'—';
const xoTxt=x=>(x||[]).map(e=>e.n+' '+L(e.qty)+(e.rate!=null?' @₹'+L(e.rate):'')).join(', ');
const tAgo=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'abhi':m<60?m+' min pehle':m<1440?Math.round(m/60)+' ghante pehle':Math.round(m/1440)+' din pehle'};
const dLocal=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const pending=()=>Object.values(S.customers).filter(c=>c.req&&c.req.type).sort((a,b)=>(a.req.t||0)-(b.req.t||0));
window.salePending=pending;

/* office.js ka noSave yahan bhejta hai jab sales rep save dabata hai */
window.sendReq=async(old,body,since)=>{const t=Date.now();
  if(!old)return saveCustomer({...body,status:'request',req:{type:'new',by:S.me||'',t},sale:{by:S.me||'',t}});
  const data={since};['name','phone','area','address','landmark','map','boy','schedule','order','xorder','notes','disc'].forEach(k=>data[k]=body[k]===undefined?null:body[k]);
  saveCustField(old.id,{req:{type:'change',by:S.me||'',t,data}});return old.id};

function diffs(c){const d=c.req.data||{};const o=[];if(JSON.stringify(orderOf(c))!==JSON.stringify({cow:0,buffalo:0,desi:0,chaach:0,...(d.order||{})}))o.push(`Doodh: ${ordTxt(c.order)} → <b>${ordTxt(d.order)}</b>`);
  if(xoTxt(c.xorder)!==xoTxt(d.xorder))o.push(`Other: ${esc(xoTxt(c.xorder)||'—')} → <b>${esc(xoTxt(d.xorder)||'—')}</b>`);
  if(d.boy&&d.boy!==c.boy)o.push(`Boy: ${esc(c.boy||'—')} → <b>${esc(d.boy)}</b>`);if(d.schedule&&d.schedule!==(c.schedule||'daily'))o.push(`Schedule: <b>${d.schedule==='alternate'?'ek din chhod ke':'roz'}</b>`);
  if(c.status!=='active')o.push('<b>Dobara chalu</b> karna hai');['name','phone','area','address'].forEach(k=>{if(d[k]!=null&&String(d[k])!==String(c[k]||''))o.push(`${k}: <b>${esc(d[k])}</b>`)});
  if(JSON.stringify(d.disc||null)!==JSON.stringify(c.disc||null))o.push(`Discount: <b>${d.disc?(window.discText?discText(d.disc):d.disc.v):'hataya'}</b>`);
  if(d.since)o.push(`kab se: <b>${fmtShort(d.since)}</b>`);return o}
function reqCard(c,mine){const r=c.req;const isNew=r.type==='new';const dr=defRates();const spec=isNew?PRODUCTS.filter(p=>+(c.order&&c.order[p.k])>0&&+c.rates[p.k]!==+dr[p.k]).map(p=>(p.k==='desi'?'Gir':p.sh)+' ₹'+L(c.rates[p.k])+' (list ₹'+L(dr[p.k])+')'):[];
  return `<div class="fu-card ${isNew?'new':'due'}"><div class="fu-top"><b data-cu="${c.id}">${esc(isNew?c.name:(r.data&&r.data.name)||c.name)}</b>${window.phc?phc(c):''}<span class="badge ${isNew?'b':'y'}">${isNew?'Naya customer':'Order badlav'}</span></div>
   <div class="fu-meta">${esc(c.area||'area nahi')} · Boy: <b>${esc((isNew?c.boy:(r.data&&r.data.boy)||c.boy)||'—')}</b> · bheja <b>${esc(r.by||'—')}</b> ne, ${tAgo(r.t)}</div>
   <div class="fu-last">${isNew?`Doodh: <b>${ordTxt(c.order)}</b>${(c.xorder||[]).length?' · Other: <b>'+esc(xoTxt(c.xorder))+'</b>':''} · kab se <b>${fmtShort(c.since)}</b>${spec.length?`<br><span style="color:var(--danger)">Alag rate: ${esc(spec.join(', '))}</span>`:''}${c.trial?`<br>Trial: ${c.trial.days} din, ${L(c.trial.pct)}% sasta`:''}${c.disc?`<br>Mahine ka discount: ${window.discText?discText(c.disc):''}`:''}${c.notes?'<br>Note: '+esc(c.notes):''}`:diffs(c).join('<br>')||'Koi badlav nahi dikh raha'}</div>
   <div class="fu-acts">${mine?`<span class="small muted">Manager ke approve karne ka intezaar</span><button type="button" class="btn sm o" data-act="slCancel" data-id="${c.id}">Request wapas lo</button>`:`<button type="button" class="btn sm p" data-act="slOk" data-id="${c.id}">✓ Approve (sheet me daalo)</button><button type="button" class="btn sm d" data-act="slNo" data-id="${c.id}">Wapas karo</button>${c.phone?`<a class="btn sm o" href="tel:${esc(c.phone)}">📞 Call</a>`:''}`}</div></div>`}
function reqSheet(){const P=pending();const mine=needOk();const L2=mine?P.filter(c=>c.req.by===S.me):P;
  openSheet(mine?'Mere bheje hue order':'Order approval',`<div class="small muted" style="margin-bottom:10px">${mine?'Ye order aapne liye hain. Manager ke approve karte hi customer Delivery sheet me aa jayega.':'Sales rep ne ye order liye hain. Dekh lo sab sahi hai, phir Approve dabao. Approve hote hi customer Delivery sheet me aa jata hai. Kuch galat ho to "Wapas karo" aur wajah likho.'}</div>
   ${L2.map(c=>reqCard(c,mine)).join('')||'<div class="of-ok">Koi order pending nahi 👍</div>'}
   ${mine?(()=>{const w=addDays(todayISO(),-7);const B=Object.values(S.customers).filter(c=>c.sale&&c.sale.by===S.me&&c.sale.ok===0&&dLocal(c.sale.okAt||c.sale.t)>=w);return B.length?'<div class="ee-h">Manager ne wapas kiye (7 din)</div>'+B.map(c=>`<div class="of-row"><span class="t"><b data-cu="${c.id}">${esc(c.name)}</b>${window.phc?phc(c):''}<br><span class="small" style="color:var(--danger)">Wajah: ${esc(c.sale.why||'—')} · ${esc(c.sale.okBy||'')}</span></span></div>`).join(''):''})():''}
   ${!mine&&L2.length>1?`<button type="button" class="btn p block" data-act="slOkAll">Sab ${L2.length} approve karo</button>`:''}`)}
async function approve(c){const r=c.req,t=Date.now(),today=todayISO();const log={by:r.by,t:r.t,type:r.type,ok:1,okBy:S.me||'',okAt:t};
  if(r.type==='new')return saveCustomer({...c,status:'active',req:null,resumedAt:today,sale:{...(c.sale||{}),...log}});
  const d=r.data||{};const body={...c,status:'active',req:null,resumedAt:today,pausedAuto:null,lost:null,saleLog:[...(c.saleLog||[]),log].slice(-30)};
  ['name','phone','area','address','landmark','map','boy','schedule','order','xorder','notes','disc'].forEach(k=>{if(d[k]!=null)body[k]=d[k]});if(d.disc===null)body.disc=null;
  if(d.boy&&d.boy!==c.boy)body.seq=Object.values(S.customers).filter(x=>x.boy===d.boy).reduce((m,x)=>Math.max(m,+x.seq||0),0)+10;
  const holds=(c.holds||[]).filter(h=>h.note!=='Shuru hone se pehle');if(d.since&&d.since>addDays(today,1))holds.push({from:today,to:addDays(d.since,-1),note:'Shuru hone se pehle'});body.holds=holds;
  return saveCustomer(body)}
function stats(){const t=todayISO(),w=addDays(t,-6),m=addDays(t,-29);const by={};const add=(n,e)=>{const o=by[n||'—']||(by[n||'—']={w:0,m:0,ok:0,no:0,pend:0});const d=dLocal(e.t);if(d>=w)o.w++;if(d>=m){o.m++;if(e.ok===1)o.ok++;else if(e.ok===0)o.no++;else o.pend++}};
  Object.values(S.customers).forEach(c=>{if(c.sale&&c.sale.by)add(c.sale.by,c.sale);(c.saleLog||[]).forEach(e=>add(e.by,e));if(c.req&&c.req.type==='change')add(c.req.by,{t:c.req.t})});return by}

Object.assign(A,{
  slOpen(){if(!isOwner())return;reqSheet()},
  async slOk(d){if(!canOk())return toast('Approve sirf manager / owner kar sakta hai');const c=S.customers[d.id];if(!c||!c.req)return;if(c.req.by===S.me&&!isAdmin())return toast('Apna liya hua order khud approve nahi kar sakte');
    await approve(c);toast(c.name+' approve · Delivery sheet me aa gaya');if(pending().length)reqSheet();else closeSheet()},
  async slOkAll(){if(!canOk())return;const P=pending().filter(c=>c.req.by!==S.me||isAdmin());if(!P.length)return;if(!await confirmBox({title:P.length+' order approve karein?',html:P.slice(0,12).map(c=>`<div class="chg">${esc(c.name)} · ${esc(c.req.by||'')}</div>`).join(''),yes:'Haan, sab approve'}))return reqSheet();
    for(const c of P)await approve(c);toast(P.length+' order approve ho gaye');closeSheet();render()},
  async slNo(d){if(!canOk())return toast('Sirf manager / owner');const c=S.customers[d.id];if(!c||!c.req)return;closeSheet();
    const why=await new Promise(res=>{openSheet('Order wapas karo · '+c.name,`<div class="field"><label class="f" for="slW">Kyon wapas kar rahe ho (sales rep ko dikhega)</label><input class="input" id="slW" placeholder="e.g. address adhoora hai, rate galat hai"></div><button type="button" class="btn d block" id="slWB">Wapas karo</button>`);$('#slWB').onclick=()=>res(($('#slW').value||'').trim()||'wajah nahi likhi')});
    const r=c.req,log={by:r.by,t:r.t,type:r.type,ok:0,okBy:S.me||'',okAt:Date.now(),why};closeSheet();
    if(r.type==='new')await saveCustomer({...c,status:'paused',req:null,sale:{...(c.sale||{}),...log},notes:((c.notes?c.notes+' | ':'')+'Order wapas: '+why).slice(0,300)});
    else await saveCustomer({...c,req:null,saleLog:[...(c.saleLog||[]),log].slice(-30)});
    toast(c.name+': order wapas kar diya');if(pending().length)reqSheet()},
  async slCancel(d){const c=S.customers[d.id];if(!c||!c.req||c.req.by!==S.me)return;if(c.req.type==='new'){delete S.customers[c.id];render();await queue('cust:'+c.id,()=>S.db.doc('customers/'+c.id).delete())}else await saveCustomer({...c,req:null});toast('Request wapas le li');reqSheet()},
  slWho(){const st=stats();openSheet('Kisne kitne order liye',`<table class="ldg"><thead><tr><th>Naam</th><th class="n">7 din</th><th class="n">30 din</th><th class="n">Approve</th><th class="n">Wapas</th><th class="n">Baaki</th></tr></thead><tbody>${Object.entries(st).sort((a,b)=>b[1].m-a[1].m).map(([n,o])=>`<tr><td><b>${esc(n)}</b></td><td class="n">${o.w}</td><td class="n">${o.m}</td><td class="n">${o.ok}</td><td class="n">${o.no}</td><td class="n">${o.pend}</td></tr>`).join('')||'<tr><td colspan="6" class="muted">Abhi tak kisi ne panel se order nahi liya</td></tr>'}</tbody></table>
     <div class="small muted" style="margin-top:8px">Naya customer aur purane customer ka order badlav, dono gine jate hain. Approve / Wapas / Baaki pichle 30 din ke hain.</div>`)},
});

/* sales rep ke liye wo sab raste band jo Delivery sheet ko badalte hain */
const LOCK={cgSave:'Customers grid',cgBulk:'Customers grid',cgAdd:'Naya row',cgDel:'Delete',editCustomer:'Customer edit',custSave:'Customer edit',acPause:'Pause / Resume',acRateForm:'Rate badlo',acRateSave:'Rate badlo',acHoldSave:'Chhutti',acHoldDel:'Chhutti',acOrder:'Order lo',rtSave:'Route order',fuResume:'Chalu karo',fuPause:'Pause',impOpen:'Excel import',mdSet:'Discount',mdSetSave:'Discount',mdGo:'Discount',trEnd:'Trial',lvSave:'Chhutti / badli',lvDel:'Chhutti / badli'};
Object.keys(LOCK).forEach(k=>{const f=A[k];if(typeof f!=='function')return;A[k]=function(){if(needOk())return toast(LOCK[k]+': ye Delivery sheet ko badalta hai, aapke paas iska access nahi. "Naya order" se order bhejo, manager approve karega');return f.apply(this,arguments)}});
/* call note me "Chalu karo" chuna to seedha chalu nahi, manager ke paas request */
const _fs=A.fuSave;A.fuSave=async function(d){if(needOk()){const a=$('#fuA');if(a&&(a.value==='resume'||a.value==='pause')){const c=S.customers[d.id];const want=a.value;a.value='';await _fs.call(this,d);if(want==='resume'&&c){saveCustField(c.id,{req:{type:'change',by:S.me||'',t:Date.now(),data:{since:todayISO()}}});toast('Note save · chalu karne ki request manager ko gayi')}return}}return _fs.call(this,d)};

/* Dashboard + Naya order page pe ginti */
const _h=vHome;vHome=function(){let o=_h();if(!isOwner()||!window.homeAlert)return o;
  /* sales rep ko Delivery sheet wali chetavni nahi (wo use khol hi nahi sakta) */
  if(needOk()&&typeof o.html==='string')o={...o,html:o.html.replace(/<button class="al [^"]*" data-act="go" data-r="(sheet|today|plan)">[\s\S]*?<\/button>/g,'')};const P=pending();const n=needOk()?P.filter(c=>c.req.by===S.me).length:P.length;
  return homeAlert(o,n?alRow(needOk()?'y':'r',needOk()?`Aapke <b>${n} order</b> manager ke approve karne ka intezaar kar rahe hain`:`<b>${n} naye order</b> approve karne hain (sales rep ne liye)`,'slOpen'):'')};
const _n=window.EXTRA_VIEWS.neworder;window.EXTRA_VIEWS.neworder=()=>{const o=_n();if(!isOwner())return o;const P=pending();const n=needOk()?P.filter(c=>c.req.by===S.me).length:P.length;
  return {...o,html:`<div class="chips" style="margin-bottom:8px">${needOk()?'<span class="badge y" style="padding:6px 10px">Aap sales rep ho: order manager ke approve karne pe Delivery sheet me jayega</span>':''}<button type="button" class="chip ${n?'on':''}" data-act="slOpen">${needOk()?'Mere bheje hue':'Approve karne hain'} · ${n}</button><button type="button" class="chip" data-act="slWho">👥 Kisne kitne order liye</button></div>`+o.html}};
})();
