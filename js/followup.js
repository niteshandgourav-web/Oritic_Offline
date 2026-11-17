/* v4: Follow-up (js/followup.js)
   1. Silent band: customer ne pichle N "kaam ke dino" me doodh nahi liya to wo silent gina jata hai.
      settings.quietDays (default 7). settings.quietAuto!==false ho to wo apne aap Paused ho jata hai (pausedAuto me kab / kyon).
      Kaam ka din = jis din kisi ko bhi delivery hui (chhutti / khali din nahi gine jate).
   2. Follow-up page: kisko call karna hai, call note (kya hua, kyon band, review 1-5, agla call), kisne kitne call kiye.
      Notes customer.calls me rehte hain.
   3. Office access: settings.team[naam].perm = {sheet,money,fix}. false = us member ko wo kaam band. Owner sab kar sakta hai. */
(function(){
const css=document.createElement('style');
css.textContent=`
.cu-off{background:var(--warn-soft)!important}.cu-quiet{background:var(--danger-soft)!important}
tr.cu-off td,tr.cu-quiet td{background:transparent}
.fu-leg{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;color:var(--muted);margin:6px 0 8px}
.fu-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:4px;border:1px solid var(--line)}
.fu-card{background:var(--surface);border:1px solid var(--line2);border-left:5px solid var(--line);border-radius:var(--r);padding:10px 12px;margin-bottom:8px}
.fu-card.new{border-left-color:var(--danger)}.fu-card.due{border-left-color:var(--warn)}.fu-card.ok{border-left-color:var(--accent)}
.fu-top{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline}.fu-top b{font-size:15.5px}
.fu-meta{font-size:13px;color:var(--muted);margin-top:3px}.fu-meta b{color:var(--fg)}
.fu-last{font-size:13px;margin-top:6px;padding:6px 8px;border-radius:8px;background:var(--surface2)}
.fu-acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.fu-stat{display:grid;grid-template-columns:repeat(auto-fit,minmax(98px,1fr));gap:6px;margin-bottom:10px}
.fu-stat div{background:var(--surface);border:1px solid var(--line2);border-radius:var(--rs);padding:8px 10px}.fu-stat b{display:block;font-size:20px}
.fu-stat span{font-size:12px;color:var(--muted)}
.fu-stars button{border:0;background:none;font-size:26px;line-height:1;cursor:pointer;color:var(--line);padding:0 2px}.fu-stars button.on{color:#D99A00}
.fu-log{border-top:1px solid var(--line2);padding:8px 0;font-size:13.5px}.fu-log small{color:var(--muted)}
`;
document.head.appendChild(css);
const OUT={talk_yes:'Baat hui · chalu karna hai',talk_later:'Baat hui · abhi nahi, baad me',talk_no:'Baat hui · band hi rakhna hai',noans:'Phone nahi uthaya',wrong:'Number galat / band',offer:'Offer diya, soch ke batayenge',other:'Kuch aur'};
const WHY={away:'Bahar gaye / chhutti',price:'Rate zyada laga',quality:'Doodh ki quality',late:'Delivery late / miss',other_vendor:'Doosre se lene lage',noneed:'Zaroorat nahi rahi',pay:'Payment ka jhagda',unknown:'Pata nahi',other:'Kuch aur'};
const qDays=()=>Math.max(2,Math.round(+settings().quietDays||7));
const autoOn=()=>settings().quietAuto!==false;
const callsOf=c=>Array.isArray(c&&c.calls)?c.calls:[];
const lastCall=c=>{const L2=callsOf(c);return L2.length?L2[L2.length-1]:null};

/* kaam ke din (jis din koi delivery hui), naye se purane */
let WD=null,WDk='';
function workDays(){const t=todayISO();const k=Object.keys(S.days).length+'|'+t;if(WD&&WDk===k)return WD;
  WD=Object.keys(S.days).filter(d=>d<=t&&Object.values(S.days[d].rows||{}).some(r=>r.s==='d')).sort().reverse();WDk=k;return WD}
function lastDel(c){const W=workDays();for(const d of W){const r=S.days[d].rows[c.id];if(r&&r.s==='d')return d}return ''}
/* 0 = theek. warna kitne kaam ke din se doodh nahi gaya */
function quietOf(c){if(!c||c.status!=='active')return 0;const W=workDays(),N=qDays();if(W.length<N)return 0;const win=W.slice(0,N);const from=win[win.length-1];
  const start=[c.since,c.createdAt,c.resumedAt].filter(Boolean).sort().pop()||'';if(start>from)return 0;      // naya / abhi resume hua: N din ka mauka
  if((c.holds||[]).some(h=>h.from<=win[0]&&win[0]<=h.to))return 0;                                               // chhutti / trial pe hai
  if(win.some(d=>{const r=S.days[d].rows[c.id];return r&&r.s==='d'}))return 0;
  const ld=lastDel(c);if(!ld)return 0;return W.findIndex(d=>d===ld)}
window.quietOf=quietOf;
window.custTone=c=>!c?'':c.status!=='active'?'cu-off':quietOf(c)?'cu-quiet':'';

/* ---------- office access ---------- */
const PERM=[['sheet','Delivery sheet','Delivery sheet aur Kal ki delivery: order confirm, Diya / Skip. Sirf anubhavi log.'],
 ['money','Paisa','Payments, Bills, Vasooli, Team & cash, Kharcha.'],['fix','Entry sudharna','Purani delivery entry ka rate / quantity / product badalna.']];
const ROUTE_PERM={sheet:'sheet',plan:'sheet',payments:'money',bills:'money',dues:'money',team:'money',purchase:'money'};
window.canDo=k=>{if(S.role!=='owner')return false;if(isAdmin())return true;const p=((settings().team||{})[S.me]||{}).perm||{};return p[k]!==false};
window.canRoute=r=>{if(S.role!=='owner')return true;const k=ROUTE_PERM[r];return !k||canDo(k)};
function permSheet(){const st=settings();const L2=(Array.isArray(st.staff)?st.staff:[]);
  openSheet('Office access',`<div class="small muted" style="margin-bottom:10px">Har office member ko alag kaam do. Tick hata doge to wo page us member ko dikhega hi nahi. Owner ko sab dikhta hai. Naya order, Customers, Follow-up, Galti pakdo sabko milta hai.</div>
   ${L2.map(n=>{const p=((st.team||{})[n]||{}).perm||{};const full=((st.team||{})[n]||{}).full;return `<div class="of-card" style="padding:10px 12px"><b>${esc(n)}</b>${full?' <span class="badge g">Poora access (owner jaisa)</span>':''}
     ${full?'':PERM.map(([k,l,h])=>`<label style="display:flex;gap:8px;align-items:flex-start;margin-top:8px"><input type="checkbox" data-perm="${esc(n)}|${k}" ${p[k]!==false?'checked':''} style="margin-top:3px"><span><b>${l}</b><br><span class="small muted">${h}</span></span></label>`).join('')}</div>`}).join('')||'<div class="muted">Abhi koi office member nahi. Team & cash → "+ Naya member" se jodo.</div>'}
   ${L2.length?'<button type="button" class="btn p block" data-act="pmSave">Access save karo</button>':''}`)}

/* ---------- follow-up list ---------- */
function fuData(){const t=todayISO();const cs=Object.values(S.customers).filter(c=>lastDel(c));const out={neu:[],due:[],wait:[],lost:[]};
  cs.forEach(c=>{const q=quietOf(c);const lc=lastCall(c);const paused=c.status!=='active';if(!q&&!paused)return;
    const since=paused?(c.pausedAuto&&c.pausedAuto.at)||'':'';const after=lc&&(!since||new Date(lc.t).toISOString().slice(0,10)>=since);
    const o={c,q,lc,ld:lastDel(c),auto:!!c.pausedAuto,bal:Math.round(balanceUpto(c,null))};
    if(c.lost)out.lost.push(o);else if(lc&&lc.next&&lc.next<=t)out.due.push(o);else if(!lc||(q&&!after)||(c.pausedAuto&&!after))out.neu.push(o);else out.wait.push(o)});
  const byLd=(a,b)=>a.ld<b.ld?1:-1;out.neu.sort(byLd);out.due.sort((a,b)=>a.lc.next<b.lc.next?-1:1);out.wait.sort(byLd);out.lost.sort(byLd);return out}
function callStats(){const t=todayISO(),w=addDays(t,-6);const by={};Object.values(S.customers).forEach(c=>callsOf(c).forEach(x=>{const d=new Date(x.t).toISOString().slice(0,10);const o=by[x.by||'—']||(by[x.by||'—']={today:0,week:0,won:0});if(d===t)o.today++;if(d>=w)o.week++;if(d>=w&&x.out==='talk_yes')o.won++}));return by}
const dAgo=d=>{if(!d)return '';const n=Math.round((new Date(todayISO())-new Date(d))/864e5);return n<=0?'aaj':n===1?'kal':n+' din pehle'};
function card(o,cls){const c=o.c,lc=o.lc;const ord=PRODUCTS.filter(p=>+(c.order&&c.order[p.k])>0).map(p=>L(c.order[p.k])+'L '+(p.k==='desi'?'Gir':p.sh)).join(' + ')||'—';
  return `<div class="fu-card ${cls}"><div class="fu-top"><b data-cu="${c.id}">${esc(c.name)}</b>${window.phc?phc(c):''}<span class="badge ${c.status==='active'?'r':'y'}">${c.status==='active'?'Silent · '+o.q+' din':o.auto?'Apne aap Paused':'Paused'}</span>${c.lost?'<span class="badge n">Chhod gaye</span>':''}</div>
   <div class="fu-meta">${esc(c.area||'area nahi')} · Boy: <b>${esc(c.boy||'—')}</b> · aakhri doodh <b>${fmtShort(o.ld)}</b> (${dAgo(o.ld)}) · lete the ${esc(ord)}${o.bal>0?` · baki <b style="color:var(--danger)">${inr(o.bal)}</b>`:''}</div>
   ${lc?`<div class="fu-last"><b>${esc(OUT[lc.out]||lc.out)}</b>${lc.why?' · '+esc(WHY[lc.why]||lc.why):''}${lc.rate?' · '+'★'.repeat(lc.rate):''}${lc.note?' · “'+esc(lc.note)+'”':''}<br><small class="muted">${esc(lc.by||'')} · ${dAgo(new Date(lc.t).toISOString().slice(0,10))}${lc.next?' · agla call '+fmtShort(lc.next):''} · kul ${callsOf(c).length} call</small></div>`:'<div class="fu-last muted">Abhi tak kisi ne call nahi kiya.</div>'}
   <div class="fu-acts">${c.phone?`<a class="btn sm o" href="tel:${esc(c.phone)}">📞 Call</a><a class="btn sm o" href="https://wa.me/91${esc(c.phone)}" target="_blank" rel="noopener">WhatsApp</a>`:''}<button type="button" class="btn sm p" data-act="fuNote" data-id="${c.id}">✍ Call note likho</button><button type="button" class="btn sm o" data-act="fuLog" data-id="${c.id}">History</button>${c.status!=='active'?`<button type="button" class="btn sm o" data-act="fuResume" data-id="${c.id}">Chalu karo</button>`:`<button type="button" class="btn sm o" data-act="fuPause" data-id="${c.id}">Pause karo</button>`}</div></div>`}
function vFollow(){const D=fuData();const tab=S.fu||'neu';const T=[['neu','Naye · call karo',D.neu],['due','Aaj dobara call',D.due],['wait','Call ho chuka',D.wait],['lost','Chhod gaye',D.lost]];const cur=T.find(x=>x[0]===tab)||T[0];
  const st=callStats();const me=st[S.me]||{today:0,week:0,won:0};const all=Object.values(st).reduce((a,o)=>({today:a.today+o.today,week:a.week+o.week,won:a.won+o.won}),{today:0,week:0,won:0});
  return {html:`<div class="fu-stat"><div><b>${D.neu.length}</b><span>call baaki</span></div><div><b>${D.due.length}</b><span>aaj dobara call</span></div><div><b>${me.today}</b><span>aapke call aaj</span></div><div><b>${all.week}</b><span>sabke call (7 din)</span></div><div><b>${all.won}</b><span>wapas chalu (7 din)</span></div></div>
   <div class="chips">${T.map(x=>`<button type="button" class="chip ${cur[0]===x[0]?'on':''}" data-act="fuTab" data-v="${x[0]}">${x[1]} · ${x[2].length}</button>`).join('')}<button type="button" class="chip" data-act="fuWho">👥 Kisne kitne call kiye</button>${isAdmin()?'<button type="button" class="chip" data-act="fuSet">⚙ Kitne din me silent</button>':''}</div>
   <div class="of-tip">${cur[0]==='neu'?`Inhone pichle <b>${qDays()} kaam ke dino</b> se doodh nahi liya, aur abhi tak kisi ne baat nahi ki. Call karo, wajah poochho, note likho.`:cur[0]==='due'?'Inhe aaj dobara call karne ka note tha.':cur[0]==='wait'?'Inse baat ho chuki hai. Agla kadam note me likha hai.':'Inhone saaf mana kar diya. 1-2 mahine baad ek baar phir poochh sakte ho.'}</div>
   ${cur[2].slice(0,120).map(o=>card(o,cur[0]==='neu'?'new':cur[0]==='due'?'due':'ok')).join('')||'<div class="of-ok">Is list me koi nahi 👍</div>'}`}}
ROUTES.push({id:'follow',l:'Follow-up',t:'Follow-up · jo doodh nahi le rahe'});
ICONS.follow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/><path d="M15 4h5v5M20 4l-6 6"/></svg>';
if(typeof NAVG!=='undefined')NAVG[1][1].splice(1,0,'follow');
window.EXTRA_VIEWS={...(window.EXTRA_VIEWS||{}),follow:()=>vFollow()};

function noteSheet(id){const c=S.customers[id];if(!c)return;const o=(k,M,sel)=>Object.entries(M).map(([v,l])=>`<option value="${v}" ${sel===v?'selected':''}>${esc(l)}</option>`).join('');
  openSheet('Call note · '+c.name,`<div class="ee-who"><span>${esc(c.area||'')}</span><span>Boy: <b>${esc(c.boy||'—')}</b></span><span>aakhri doodh ${fmtShort(lastDel(c))}</span>${window.phc?phc(c):''}</div>
   <div class="field"><label class="f" for="fuO">Call me kya hua</label><select class="input" id="fuO">${o('out',OUT,'talk_later')}</select></div>
   <div class="field"><label class="f" for="fuW">Doodh kyon band kiya</label><select class="input" id="fuW"><option value="">— poochha nahi —</option>${o('why',WHY,'')}</select></div>
   <div class="field"><label class="f">Customer ka review (hamari service kaisi lagi)</label><div class="fu-stars" id="fuR" data-v="0">${[1,2,3,4,5].map(n=>`<button type="button" data-act="fuStar" data-n="${n}" aria-label="${n} star">★</button>`).join('')}</div></div>
   <div class="field"><label class="f" for="fuN">Customer ne kya kaha (apne shabdon me likho)</label><textarea class="input" id="fuN" rows="3" placeholder="e.g. 10 din ke liye gaon gaye hain, 25 tareekh se chahiye"></textarea></div>
   <div class="field"><label class="f" for="fuD">Agla call kab (zaroori nahi)</label><input class="input" type="date" id="fuD" min="${todayISO()}"></div>
   <div class="field"><label class="f" for="fuA">Is account ka kya karna hai</label><select class="input" id="fuA"><option value="">Jaisa hai waisa rehne do</option><option value="resume">Chalu karo (Delivery sheet me wapas)</option><option value="pause">Pause rakho</option><option value="lost">Chhod gaye (ab call mat karo)</option></select></div>
   <button type="button" class="btn p block" data-act="fuSave" data-id="${id}">Note save karo</button>`)}
function logSheet(id){const c=S.customers[id];if(!c)return;const L2=callsOf(c).slice().reverse();
  openSheet('Call history · '+c.name,`<button type="button" class="btn sm p" data-act="fuNote" data-id="${id}">✍ Naya call note</button>
   ${L2.map(x=>`<div class="fu-log"><b>${esc(OUT[x.out]||x.out)}</b>${x.why?' · '+esc(WHY[x.why]||x.why):''}${x.rate?' · '+'★'.repeat(x.rate):''}${x.act?' · <span class="badge n">'+esc({resume:'chalu kiya',pause:'pause',lost:'chhod gaye'}[x.act]||x.act)+'</span>':''}${x.note?'<br>“'+esc(x.note)+'”':''}<br><small>${esc(x.by||'')} · ${new Date(x.t).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}${x.next?' · agla call '+fmtShort(x.next):''}</small></div>`).join('')||'<div class="muted" style="margin-top:10px">Abhi tak koi call note nahi.</div>'}`)}
const setStatus=(c,on,extra)=>saveCustomer({...c,...extra,status:on?'active':'paused',...(on?{resumedAt:todayISO(),pausedAuto:null,lost:null}:{})});

Object.assign(A,{
  fuTab(d){S.fu=d.v;render()},
  fuNote(d){if(!isOwner())return toast('Sirf office / owner');noteSheet(d.id)},
  fuLog(d){logSheet(d.id)},
  fuStar(d){const b=$('#fuR');b.dataset.v=b.dataset.v===d.n?'0':d.n;[...b.children].forEach((x,i)=>x.classList.toggle('on',i<+b.dataset.v))},
  async fuSave(d){const c=S.customers[d.id];if(!c||!canWrite())return;const out=$('#fuO').value,act=$('#fuA').value,note=$('#fuN').value.trim();
    if(out==='other'&&!note)return toast('Kya hua, note me likho');
    const e={t:Date.now(),by:S.me||'',out,why:$('#fuW').value,rate:+$('#fuR').dataset.v||0,note:note.slice(0,400),next:$('#fuD').value||'',act};
    const calls=[...callsOf(c),e].slice(-40);closeSheet();
    if(act==='resume')await setStatus(c,true,{calls});else if(act==='pause')await setStatus(c,false,{calls});else if(act==='lost')await saveCustomer({...c,calls,status:'paused',lost:{at:todayISO(),why:e.why}});else await saveCustomer({...c,calls});
    toast('Call note save'+(act==='resume'?' · customer chalu':act==='lost'?' · chhod gaye me gaya':''))},
  async fuResume(d){const c=S.customers[d.id];if(!c)return;await setStatus(c,true);toast(c.name+' chalu · Delivery sheet me wapas')},
  async fuPause(d){const c=S.customers[d.id];if(!c)return;await setStatus(c,false);toast(c.name+' pause')},
  fuWho(){const st=callStats();openSheet('Kisne kitne call kiye',`<table class="ldg"><thead><tr><th>Naam</th><th class="n">Aaj</th><th class="n">7 din</th><th class="n">Wapas chalu (7 din)</th></tr></thead><tbody>${Object.entries(st).sort((a,b)=>b[1].week-a[1].week).map(([n,o])=>`<tr><td><b>${esc(n)}</b></td><td class="n">${o.today}</td><td class="n">${o.week}</td><td class="n">${o.won}</td></tr>`).join('')||'<tr><td colspan="4" class="muted">Abhi tak koi call note nahi</td></tr>'}</tbody></table>`)},
  fuSet(){if(!isAdmin())return toast('Sirf owner kar sakta hai');openSheet('Silent customer ki setting',`<div class="field"><label class="f" for="fuQ">Kitne kaam ke din doodh na le to silent maano</label><input class="input" id="fuQ" type="number" inputmode="numeric" min="2" max="60" value="${qDays()}"></div>
     <div class="small muted" style="margin:4px 0 10px">Kaam ka din = jis din delivery hui. Chhutti wale din nahi gine jate. Ek din chhod ke lene wale customer ke liye 7 ya zyada rakho.</div>
     <div class="field"><label class="f" for="fuAu">Silent hote hi kya ho</label><select class="input" id="fuAu"><option value="1" ${autoOn()?'selected':''}>Apne aap Pause karo (Delivery sheet se hat jaye)</option><option value="0" ${autoOn()?'':'selected'}>Sirf laal dikhao, Pause mat karo</option></select></div>
     <button type="button" class="btn p block" data-act="fuSetSave">Save</button>`)},
  async fuSetSave(){if(!isAdmin())return;const n=Math.round(+$('#fuQ').value);if(!(n>=2&&n<=60))return toast('2 se 60 ke beech likho');await saveSettings({...settings(),quietDays:n,quietAuto:$('#fuAu').value==='1'});closeSheet();toast('Setting save');render()},
  pmOpen(){if(!isAdmin())return toast('Sirf owner kar sakta hai');permSheet()},
  async pmSave(){if(!isAdmin())return;const st=settings();const T={...(st.team||{})};document.querySelectorAll('[data-perm]').forEach(i=>{const [n,k]=i.dataset.perm.split('|');T[n]={...(T[n]||{}),perm:{...((T[n]||{}).perm||{}),[k]:i.checked}}});await saveSettings({...st,team:T});closeSheet();toast('Access save ho gaya')},
});

/* silent hote hi apne aap Pause (din me ek baar, sirf owner / office ke device se) */
let ranFor='';
async function autoPause(){if(!S.ready||!isOwner()||!canWrite()||!autoOn())return;const t=todayISO();const key=t+'|'+Object.keys(S.days).length+'|'+qDays();if(ranFor===key)return;ranFor=key;
  const L2=Object.values(S.customers).filter(c=>quietOf(c));if(!L2.length)return;
  for(let i=0;i<L2.length;i+=300){const b=S.db.batch();L2.slice(i,i+300).forEach(c=>{const p={status:'paused',pausedAuto:{at:t,last:lastDel(c),days:quietOf(c)}};b.set(S.db.doc('customers/'+c.id),p,{merge:true});S.customers[c.id]={...c,...p}});await b.commit()}
  render();toast(L2.length+' customer '+qDays()+' din se doodh nahi le rahe · Follow-up me dekho')}
const _ar=window.afterRender;window.afterRender=()=>{if(_ar)_ar();setTimeout(autoPause,1500)};

const ban=()=>{if(!isOwner())return '';const D=fuData();const n=D.neu.length+D.due.length;return n?`<button type="button" class="of-ban" style="background:var(--danger-soft);color:var(--danger);border-color:var(--danger)" data-act="go" data-r="follow">📞 <b>${n} customers</b> ko call karna hai (doodh band hai). <u>Follow-up kholo</u></button>`:''};
const _h=vHome;vHome=function(){const o=_h();return o&&typeof o.html==='string'?{...o,html:ban()+o.html}:o};
const _c=vCustomers;vCustomers=function(){const o=_c();return o&&typeof o.html==='string'&&isOwner()?{...o,html:`<div class="fu-leg"><span><i class="cu-quiet"></i>Silent: ${qDays()} din se doodh nahi</span><span><i class="cu-off"></i>Paused / band</span><span><i style="background:var(--surface)"></i>Chalu</span></div>`+o.html}:o};
})();
