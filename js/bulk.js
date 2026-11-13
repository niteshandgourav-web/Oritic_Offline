/* Oritic v2 · office tools for fast bulk work
 * Loaded after the main panel script and uses its globals (S, A, ROUTES, render, writeRows, plDraft …).
 * Adds: Delivery sheet (Aaj + Kal + pichli date, ek hi page), Customers grid (inline edit, paste from Excel,
 * bulk change), Excel import, bulk payment entry, WhatsApp bill queue, Ctrl+K search, keyboard shortcuts,
 * audit log for pichli date ke badlav, local/offline data tools.
 */
'use strict';
(()=>{

/* ================= styles ================= */
const CSS=`
.mbanner{font-size:12.5px;padding:6px 12px;border-radius:10px;background:var(--info-soft);color:var(--info);margin-bottom:10px}
.kbd{display:inline-block;font:600 11px/1.5 ui-monospace,Consolas,monospace;padding:0 5px;border:1px solid var(--line);border-bottom-width:2px;border-radius:5px;color:var(--muted);background:var(--surface)}
.navhint{margin:16px 10px 0;font-size:12px;color:var(--muted);line-height:1.9}
.sheet .panel.wide{max-width:1100px}
details.btbox>summary{list-style:none;cursor:pointer}details.btbox>summary::-webkit-details-marker{display:none}
details.btbox:not([open])>summary{border-bottom:0}
.btmore{font-size:12px;color:var(--muted);align-self:center}.btmore::after{content:' ▾'}details[open] .btmore::after{content:' ▴'}
.dtbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.dtpill{padding:8px 14px;border-radius:10px;font-weight:800;border:1.5px solid var(--line);background:var(--surface);white-space:nowrap}
.dtpill.past{background:#B45309;color:#fff;border-color:#B45309}.dtpill.next{background:#15803D;color:#fff;border-color:#15803D}
.dt-past .plstrip,.dt-next .plstrip{background:rgba(255,255,255,.3)}
.dt-past .plstrip .plt1,.dt-past .plstrip::after{background:#B45309;color:#fff}
.dt-next .plstrip .plt1,.dt-next .plstrip::after{background:#15803D;color:#fff}
.dt-past .plstrip .plt1 .k,.dt-next .plstrip .plt1 .k{color:rgba(255,255,255,.88)}
.dt-past .plstrip .plt1.z .v,.dt-next .plstrip .plt1.z .v{color:rgba(255,255,255,.45)}
.dt-past .plstrip .pbar,.dt-next .plstrip .pbar{background:rgba(255,255,255,.3)}
.stboxes{display:flex;gap:8px;flex-wrap:wrap}
.stbox{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:12px;font-weight:800;font-size:14px;text-align:left}
.stbox.bad{background:var(--danger-soft);color:var(--danger)}.stbox.good{background:var(--accent-soft);color:var(--accent-ink)}.stbox.warn{background:var(--warn-soft);color:var(--warn)}
.pendbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:10px 12px;border-radius:12px;background:var(--danger-soft);color:var(--danger);font-size:13.5px;font-weight:700}
.shw,.cgw{overflow:auto;border:1px solid var(--line2);border-radius:var(--r);background:var(--surface);max-height:calc(100vh - 250px);min-height:320px}
.sht,.cgt{border-collapse:separate;border-spacing:0;table-layout:fixed}
.sht th,.cgt th{position:sticky;top:0;z-index:3;background:var(--surface2);font-size:11.5px;padding:8px;text-align:left;color:var(--muted);border-bottom:1px solid var(--line);border-right:1px solid var(--line2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sht td{vertical-align:top;padding:8px;border-bottom:1px solid var(--line2);border-right:1px solid var(--line2);font-size:13px;background:var(--surface)}
.sht .s1,.cgt .s1{position:sticky;left:0;z-index:2}.sht .s2{position:sticky;left:36px;z-index:2}.sht .s3{position:sticky;left:82px;z-index:2;box-shadow:inset -2px 0 0 var(--line)}
.sht th.s1,.sht th.s2,.sht th.s3,.cgt th.s1,.cgt th.s2,.cgt th.s3{z-index:4;background:var(--surface2)}
.sht td.s1,.cgt td.s1{text-align:center;padding:8px 0}
.sht tr.conf td{background:color-mix(in srgb,var(--accent-soft) 35%,var(--surface))}
.sht tr.del td{background:color-mix(in srgb,var(--accent-soft) 75%,var(--surface))}
.sht tr.skip td{background:var(--surface2);color:var(--muted)}
.sht tr.dirty td{background:color-mix(in srgb,var(--warn-soft) 65%,var(--surface))}
.sht tr.sel td,.cgt tr.sel td{background:color-mix(in srgb,var(--info-soft) 75%,var(--surface))}
.sht tr.inact td{color:var(--muted)}
.sht tr.grp td,.cgt tr.grp td{background:var(--bg);padding:6px 12px;font-weight:800}
.sht tr.grp td b,.cgt tr.grp td b{position:sticky;left:12px;display:inline-block}
.sht .plq input{min-height:52px}
.sht td.s2 .ck{width:30px;height:30px;border-radius:9px;margin:0 auto}
.ck.saving{color:transparent!important;position:relative;border-color:var(--accent);background:var(--surface)!important}
.ck.saving::after{content:'';position:absolute;inset:6px;border:2.5px solid var(--accent);border-right-color:transparent;border-radius:50%;animation:obspin .7s linear infinite}
.ck.okpop{animation:obpop .45s ease}.ck.err{background:var(--danger-soft)!important;border-color:var(--danger)!important;color:var(--danger)!important}
tr.flashok td{animation:obfl 1.1s ease}
@keyframes obspin{to{transform:rotate(360deg)}}@keyframes obpop{0%{transform:scale(.6)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
@keyframes obfl{0%{background:color-mix(in srgb,var(--accent) 35%,var(--surface))}}
.stp{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:11.5px;font-weight:800;white-space:nowrap}
.stp.todo{background:var(--danger-soft);color:var(--danger)}.stp.conf{background:var(--info-soft);color:var(--info)}.stp.del{background:var(--accent);color:var(--accent-fg)}.stp.skip{background:var(--surface2);color:var(--muted)}.stp.dirty{background:var(--warn-soft);color:var(--warn)}.stp.none{background:transparent;color:var(--muted)}
.shbtns{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap}
.brin{display:flex;gap:4px;align-items:center}.brin input{width:46px;padding:6px 4px;border:1px solid var(--line);border-radius:8px;text-align:center;font:inherit;font-size:14px;font-weight:700;background:var(--surface);color:var(--fg)}
.bulkbar{position:sticky;bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:6;display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 12px;border-radius:14px;background:var(--fg);color:var(--bg);box-shadow:0 8px 30px rgba(0,0,0,.25)}
.bulkbar .btn{background:rgba(127,127,127,.25);color:inherit}.bulkbar .btn.p{background:var(--accent);color:var(--accent-fg)}.bulkbar .btn.d{background:var(--danger);color:#fff}
.bulkbar select,.bulkbar input{padding:6px 8px;border-radius:8px;border:0;font:inherit;font-size:13px;max-width:150px;background:var(--surface);color:var(--fg)}
.bulkbar .sep{width:1px;height:24px;background:currentColor;opacity:.25}
#cgbar{position:sticky;bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:6}#cgbar:empty{display:none}#cgbar .bulkbar{position:static}
@media (max-width:899px){.bulkbar,#cgbar{bottom:calc(74px + env(safe-area-inset-bottom,0px))}}
.cgt td{padding:0;border-bottom:1px solid var(--line2);border-right:1px solid var(--line2);background:var(--surface);font-size:13px}
.cgt .s2{position:sticky;left:34px;z-index:2}.cgt .s3{position:sticky;left:76px;z-index:2;box-shadow:inset -2px 0 0 var(--line)}
.cgt td.ro{padding:8px;color:var(--muted);text-align:right;white-space:nowrap}.cgt td.pos{padding:8px 4px;color:var(--muted);font-size:12px;text-align:center}
.cgi{display:block;width:100%;border:0;background:transparent;padding:8px;font:inherit;font-size:13px;color:var(--fg);outline:none;height:36px}
select.cgi{padding:6px 4px;cursor:pointer}
.cgt td:focus-within{box-shadow:inset 0 0 0 2px var(--accent)}
.cgt td.dirty{background:var(--warn-soft)}.cgt td.err{background:var(--danger-soft)}.cgt tr.newr td{background:color-mix(in srgb,var(--info-soft) 45%,var(--surface))}
.cgt td.acts{white-space:nowrap;padding:4px 6px}
#cbox,#kp{position:fixed;inset:0;z-index:40;background:rgba(10,18,13,.5);display:flex;align-items:flex-start;justify-content:center;padding:10vh 16px 16px}
#cbox[hidden],#kp[hidden]{display:none}
.cb-panel,.kp-panel{background:var(--surface);color:var(--fg);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.35);width:100%;max-width:580px;padding:18px}
.cb-body{margin-top:8px;max-height:52vh;overflow:auto;font-size:14px;line-height:1.5}.cb-body .chg{padding:7px 0;border-bottom:1px solid var(--line2)}
.kp-panel{padding:0;overflow:hidden;max-width:640px}
.kp-panel input{width:100%;border:0;border-bottom:1px solid var(--line);padding:16px 18px;font:inherit;font-size:17px;background:transparent;color:var(--fg);outline:none}
.kp-list{max-height:56vh;overflow:auto;padding:6px}
.kp-it{display:flex;gap:10px;align-items:center;width:100%;padding:9px 12px;border-radius:10px;text-align:left}
.kp-it.on{background:var(--accent-soft)}.kp-it .g{font-size:10.5px;color:var(--muted);font-weight:800;text-transform:uppercase;min-width:70px}
.kp-it .t{font-weight:700}.kp-it .s{font-size:12px;color:var(--muted)}
.kp-foot{padding:8px 14px;border-top:1px solid var(--line2);font-size:12px;color:var(--muted);display:flex;gap:12px;flex-wrap:wrap}
.bpt{width:100%;border-collapse:collapse;min-width:820px}.bpt th{font-size:11.5px;color:var(--muted);text-align:left;padding:6px;border-bottom:1px solid var(--line);white-space:nowrap}
.bpt td{padding:4px;border-bottom:1px solid var(--line2);vertical-align:middle}
.bpt input,.bpt select{width:100%;padding:8px;border:1px solid var(--line);border-radius:8px;font:inherit;font-size:13.5px;background:var(--surface);color:var(--fg)}
.bpt td.err input{border-color:var(--danger);background:var(--danger-soft)}.bpt .bal{font-size:12.5px;white-space:nowrap}
details.card>summary{list-style:none;cursor:pointer}details.card>summary::-webkit-details-marker{display:none}
.acpop{position:fixed;z-index:35;background:var(--surface);border:1px solid var(--line);border-radius:10px;box-shadow:var(--shadow);max-height:280px;overflow:auto;min-width:260px}
.acpop button{display:flex;justify-content:space-between;gap:10px;width:100%;padding:8px 10px;text-align:left;font-size:13px}.acpop button.on{background:var(--accent-soft)}
.imp-sum{display:flex;gap:8px;flex-wrap:wrap}.imp-tbl td.bad{color:var(--danger);font-weight:700}.imp-tbl td{font-size:12.5px}
.pgbar{height:10px;border-radius:99px;background:var(--surface2);overflow:hidden}.pgbar i{display:block;height:100%;background:var(--accent);width:0;transition:width .2s}
.wasent{opacity:.55}
@media (max-width:899px){.only-desk{display:none!important}}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

/* ================= routes / nav ================= */
ROUTES.splice(1,0,{id:'sheet',l:'Delivery',t:'Delivery sheet'});
ROUTES.find(r=>r.id==='home').l='Dashboard';
ROUTES.find(r=>r.id==='today').l='Aaj list';
const planR=ROUTES.find(r=>r.id==='plan');planR.hide=true;planR.l='Kal (purana)';
ICONS.sheet=ICONS.plan;
window.EXTRA_VIEWS={sheet:()=>vSheet()};
const ls={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(_){return d}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}}};
Object.assign(S,{sel:new Set(),shf:'all',shHist:ls.get('oritic.shHist','1')==='1',svst:{},shList:[],
  cview:ls.get('oritic.cview',matchMedia('(min-width:900px)').matches?'grid':'list'),cgDirty:{},cgNew:[],cgSel:new Set(),cgErr:{},
  bp:[],bpErr:{},imp:null});
const bpBlank=()=>({cid:'',q:'',amt:'',mode:'cash',date:todayISO(),note:''});
for(let i=0;i<5;i++)S.bp.push(bpBlank());

const _nav=nav;
nav=function(){_nav();if(isOwner())$('#snav').insertAdjacentHTML('beforeend',`<div class="navhint"><span class="kbd">Ctrl</span> <span class="kbd">K</span> dhoondo<br><span class="kbd">?</span> shortcuts</div>`)};
window.modeBanner=()=>window.ORITIC_MODE==='local'&&isOwner()?`<div class="mbanner"><b>Local mode:</b> data sirf is browser me save ho raha hai, live database me nahi. Settings → Data me backup lete raho.</div>`:'';
const _open=openSheet;openSheet=function(t,h){const p=$('#sheet .panel');if(p)p.classList.remove('wide');_open(t,h)};
const _close=closeSheet;closeSheet=function(){const p=$('#sheet .panel');if(p)p.classList.remove('wide');_close()};
document.addEventListener('toggle',e=>{if(e.target.classList&&e.target.classList.contains('btbox'))window.BT_OPEN=e.target.open},true);
document.addEventListener('wheel',e=>{const a=document.activeElement;if(a&&a.type==='number'&&e.target===a)a.blur()},{passive:true});

/* ================= confirm box (Enter = haan, Esc = rehne do) ================= */
function confirmBox({title,html,yes='Haan',no='Rehne do',danger=false}){return new Promise(res=>{
  let el=$('#cbox');if(!el){el=document.createElement('div');el.id='cbox';document.body.appendChild(el)}
  el.innerHTML=`<div class="cb-panel" role="dialog" aria-modal="true"><h3>${title}</h3><div class="cb-body">${html||''}</div>
    <div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn o" data-cb="0">${no} <span class="kbd">Esc</span></button><button class="btn ${danger?'d':'p'}" data-cb="1">${yes} <span class="kbd">Enter</span></button></div></div>`;
  el.hidden=false;
  const done=v=>{el.hidden=true;el.innerHTML='';document.removeEventListener('keydown',kd,true);res(v)};
  const kd=e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();done(true)}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();done(false)}};
  document.addEventListener('keydown',kd,true);
  el.onclick=e=>{const b=e.target.closest('[data-cb]');if(b)done(b.dataset.cb==='1');else if(e.target===el)done(false)};
  setTimeout(()=>{const b=el.querySelector('[data-cb="1"]');if(b)b.focus()},30)})}
window.confirmBox=confirmBox;

/* ================= Delivery sheet ================= */
const dayType=d=>{const p=planDayISO();return d<p?'past':d===p?'cur':'next'};
const DT_L={past:'Pichli date',cur:'Aaj ki date',next:'Agli date'};
const hasItems=c=>{const d=plDraft(c);return PLN.some(p=>+d.qty[p.k]>0)||d.x.length>0};
function shState(c){const r=rowOf(S.pld,c.id),d=plDraft(c);if(d.dirty)return 'dirty';if(r&&r.s==='d')return 'del';if(r&&r.s==='k')return 'skip';if(plConf(c))return 'conf';return 'todo'}
/* customer us date pe juda tha ya nahi ("Customer kab se"), taaki naye customer purani dates pe pending na dikhen */
const existedOn=(c,d)=>{const s=c.since||c.createdAt||'';return !s||s<=d};
function shMatch(c,f){const s=shState(c);if(f==='all')return true;if(f==='todo')return s==='todo'||s==='dirty';if(f==='pend')return s!=='del'&&s!=='skip'&&hasItems(c)&&existedOn(c,S.pld);return s===f}
const qOf=x=>x&&x.s!=='k'?(x.q||{}):{};
function diffText(c,a,b){const P=[];const stt=x=>!x?'pending':x.s==='d'?'delivered':x.s==='k'?'skip':(x.pl?'confirmed':'pending');
  if(stt(a)!==stt(b))P.push(stt(a)+' → '+stt(b));
  PRODUCTS.forEach(p=>{const va=+qOf(a)[p.k]||0,vb=+qOf(b)[p.k]||0;if(va!==vb)P.push((p.k==='desi'?'Gir Cow':p.sh)+' '+L(va)+'L → '+L(vb)+'L')});
  const xa=a&&a.s!=='k'?extrasText(a.x):'',xb=b&&b.s!=='k'?extrasText(b.x):'';if(xa!==xb)P.push('Other: '+(xa||'—')+' → '+(xb||'—'));
  const ba=a?brText(a):'',bb=b?brText(b):'';if(ba!==bb)P.push('Wapas: '+(ba||'0')+' → '+(bb||'0'));
  const aa=a&&a.s==='d'?+a.a||0:0,ab=b&&b.s==='d'?+b.a||0:0;if(aa!==ab)P.push('bill '+inr(aa)+' → '+inr(ab));
  return P.length?`<div class="chg"><b>${esc(c.name)}</b> · ${P.map(esc).join(' · ')}</div>`:''}
function writeAudit(date,ids,before,rows){if(!S.db)return;const sm=x=>x?{s:x.s||'',pl:x.pl?1:0,q:x.q||{},x:(x.x||[]).map(e=>({n:e.n,a:+e.a||0})),a:+x.a||0,brS:+x.brS||0,brB:+x.brB||0}:null;
  const b=S.db.batch();ids.forEach(id=>{const c=S.customers[id]||{};b.set(S.db.doc('audit/'+date+'_'+uid()),{date,cid:id,name:c.name||'',before:sm(before[id]),after:sm(rows[id]),by:S.me||'',t:Date.now()})});b.commit().catch(e=>console.error('audit',e))}
/* Har sheet write yahan se: pichli date pe popup + record, save hone tak ghoomta circle, phir hara ✓ */
async function commitRows(rows){const date=S.pld,ids=Object.keys(rows);if(!ids.length)return false;
  /* wapas aayi bottles purani row se aage le jao (writeRows bhi yahi karta hai), taaki popup sahi dikhe */
  ids.forEach(id=>{const p=rowOf(date,id),n=rows[id];if(p&&p.br!=null&&n.br==null){n.br=p.br;if(p.brS!=null)n.brS=p.brS;if(p.brB!=null)n.brB=p.brB}});
  if(dayType(date)==='past'){const ch=ids.map(id=>diffText(S.customers[id],rowOf(date,id),rows[id])).filter(Boolean);
    if(ch.length){const ok=await confirmBox({title:`Aap pichli date (${fmtDate(date)}) ki entry badal rahe ho`,html:ch.slice(0,15).join('')+(ch.length>15?`<div class="small muted" style="margin-top:6px">+ ${ch.length-15} aur</div>`:''),yes:'Haan, badlo'});if(!ok)return false}}
  const before={};ids.forEach(id=>{const r=rowOf(date,id);before[id]=r?JSON.parse(JSON.stringify(r)):null;delete S.pldr[date+'|'+id];S.svst[date+'|'+id]='saving'});
  const ok=await writeRows(date,rows);
  ids.forEach(id=>S.svst[date+'|'+id]=ok===true?'ok':'err');rerender();
  if(ok===true){if(dayType(date)==='past')writeAudit(date,ids,before,rows);setTimeout(()=>{ids.forEach(id=>{if(S.svst[date+'|'+id]==='ok')delete S.svst[date+'|'+id]});rerender()},1300)}
  else toast('Save nahi hua, dobara dabao');
  return ok===true}
function shBuild(c){const r=rowOf(S.pld,c.id);const b=plBuild(c);if(b.s==='k')return null;
  const row=makeRow(c,'d',b.q,b.x,(r&&r.n)||'',(r&&r.by)||c.boy||'');row.pl=1;return row}
function pastPending(){const p=planDayISO(),out=[];for(let i=1;i<=7;i++){const d=addDays(p,-i);if(d>todayISO())continue;const day=S.days[d];
  if(!day||!Object.values(day.rows||{}).some(r=>r.s==='d'))continue;
  const n=todaysList(d,'all').filter(({c,r})=>c.status==='active'&&(!r||r.s==='p')&&existedOn(c,d)).length;if(n)out.push({d,n})}return out}

function shRow(c,n,type,days,showBr,showH){const d=plDraft(c),r=rowOf(S.pld,c.id),st=shState(c),sv=S.svst[S.pld+'|'+c.id];
  const flag={alt:'Alt din: is din nahi',cus:'Custom: is din nahi',off:'Paused / inactive',skip:'Skip'}[d.why];
  const ckOn=st==='conf'||st==='del'||st==='skip';
  const ck=`<button class="ck ${sv==='saving'?'saving':sv==='err'?'err':ckOn?'on':''} ${sv==='ok'?'okpop':''}" data-act="shOk" data-id="${c.id}" aria-label="Confirm" title="Confirm (Ctrl+Enter)">${sv==='err'?ICONS.skip:ICONS.check}</button>`;
  const lbl={todo:type==='past'?(hasItems(c)?'Pending':'—'):'Confirm baaki',conf:type==='next'?'Confirmed':'Delivery baaki',del:'Delivered',skip:'Skip',dirty:'Badla · save baaki'}[st];
  const stc=st==='todo'&&type==='past'&&!hasItems(c)?'none':st;
  const btns=type==='next'?'':`<div class="shbtns"><button class="btn xs ${st==='del'?'p':'o'}" data-act="shD" data-id="${c.id}">✓ Diya</button><button class="btn xs ${st==='skip'?'w':'o'}" data-act="shK" data-id="${c.id}">Skip</button>${r&&(r.s==='d'||r.s==='k')?`<button class="btn xs o" data-act="shP" data-id="${c.id}" title="Wapas pending (planned quantity rahegi)">↺</button>`:''}</div>`;
  const by=r&&r.s==='d'&&r.by?`<div class="small muted" style="margin-top:4px">${esc(r.by)}${r.t?' · '+new Date(r.t).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}):''}</div>`:'';
  const vv=varsOf(c).map(v=>{const left=dd(todayISO(),v.till);return `<div class="plvc ${left===0?'last':''}">${esc(v.t)}<small>${v.src==='field'?'🛵 '+esc(v.by||'')+' · ':''}${fmtShort(v.till)} tak · ${left===0?'aaj aakhri din':left+' din baaki'}</small><button class="plx" data-act="plVd" data-id="${c.id}" data-i="${v._i}" aria-label="Panel se hatao" title="Panel se hatao (history me rahega)">×</button></div>`}).join('')
   +(S.plvf===c.id?`<div class="plmini"><input class="input" id="pvt" placeholder="Jaise: 3 din 2L Cow"><div class="row"><input class="input" type="date" id="pvd" min="${todayISO()}" value="${addDays(todayISO(),3)}"><button class="btn sm p" data-act="plVs" data-id="${c.id}">Save</button></div></div>`:`<button class="pladd" data-act="plVf" data-id="${c.id}">+ Comment jodo</button>`);
  const xx=d.x.map((e,i)=>`<div class="plxi"><span>${esc(e.n)}${e.a?' · '+inr(e.a):' · <b style="color:var(--danger)">₹0</b>'}</span><button class="plx" data-act="plXd" data-id="${c.id}" data-i="${i}" aria-label="Hatao">×</button></div>`).join('')
   +(S.plxf===c.id?prodForm('px',c.id):`<button class="pladd" data-act="plXf" data-id="${c.id}">+ Product jodo</button>`);
  const kgWarn=['paneer','ghee'].some(k=>+d.qty[k]>0&&!kgRate(c,k))?`<div class="small" style="color:var(--danger);margin-top:4px">Paneer/Ghee ka rate ₹0 hai. Settings me rate daalo.</div>`:'';
  const br=r?brSplit(r):{s:0,b:0};
  return `<tr data-row="${c.id}" class="${st} ${c.status!=='active'?'inact':''} ${S.sel.has(c.id)?'sel':''} ${sv==='ok'?'flashok':''}">
   <td class="s1"><input type="checkbox" data-shsel="${c.id}" ${S.sel.has(c.id)?'checked':''} aria-label="Chuno"></td>
   <td class="s2 plc">${ck}<div class="small muted">${n}</div></td>
   <td class="s3"><b class="plname" data-dbl="${c.id}" title="Double click: customer details">${esc(c.name)}</b>${c.schedule==='alternate'?' <span class="badge b">Alt</span>':''}${c.status!=='active'?' <span class="badge y">Inactive</span>':''}
     <div class="small muted">${esc(c.area||'—')} · <b>${esc(c.boy||'—')}</b></div><div><button class="plph" data-act="plCopy" data-id="${c.id}">${esc(c.phone||'—')} ⧉</button></div>${flag?`<div class="plflag">${flag}</div>`:''}</td>
   ${PLN.map(p=>{const v=+d.qty[p.k]||0;return `<td class="plq ${v>0?'has':''}"><input type="number" inputmode="decimal" min="0" step="${p.s}" value="${v>0?v:''}" placeholder="–" data-act="pqty" data-id="${c.id}" data-p="${p.k}" aria-label="${esc(c.name)} ${p.sh}"></td>`}).join('')}
   <td class="plh" id="plb_${c.id}">${btHtml(bottlesOf(d.qty))}</td>
   <td><span class="stp ${stc}">${lbl}</span>${btns}${by}${kgWarn}</td>
   ${showBr?`<td><div class="brin"><input type="number" min="0" step="1" inputmode="numeric" value="${br.s||''}" placeholder="½L" data-shbr="${c.id}" data-k="S" title="½L bottle wapas"><input type="number" min="0" step="1" inputmode="numeric" value="${br.b||''}" placeholder="1L" data-shbr="${c.id}" data-k="B" title="1L bottle wapas"></div><div class="small muted" style="margin-top:4px">paas: ${bottleBal(c)}</div></td>`:''}
   <td>${xx}</td>
   <td><textarea class="plfix" data-act="pfix" data-id="${c.id}" placeholder="Note likho">${esc(c.notes||'')}</textarea></td>
   <td>${vv}</td>
   ${showH?days.map(x=>`<td class="plh">${plHistCell(c,x)}</td>`).join(''):''}</tr>`}

function vSheet(){
  if(!isOwner())return vToday();
  const date=S.pld,type=dayType(date),pd=planDayISO();
  const all=plList();const cnt={todo:0,conf:0,del:0,skip:0,dirty:0,pend:0};
  all.forEach(c=>{const s=shState(c);if(c.status==='active'||s==='dirty')cnt[s]++;if(c.status==='active'&&shMatch(c,'pend'))cnt.pend++});
  const fl=type==='next'?[['all','Sab'],['todo','Confirm baaki'],['conf','Confirmed']]:type==='cur'?[['all','Sab'],['todo','Confirm baaki'],['conf','Delivery baaki'],['del','Delivered'],['skip','Skip']]:[['all','Sab'],['pend','Pending'],['del','Delivered'],['skip','Skip']];
  if(!fl.some(x=>x[0]===S.shf))S.shf='all';
  const list=all.filter(c=>shMatch(c,S.shf));S.shList=list.map(c=>c.id);
  for(const id of [...S.sel])if(!S.customers[id])S.sel.delete(id);
  const showBr=type!=='next',showH=S.shHist;const days=Array.from({length:7},(_,i)=>addDays(S.plhe,-i));
  const W=[36,46,210,...PLN.map(()=>64),70,178,...(showBr?[118]:[]),220,180,230,...(showH?days.map(()=>100):[])];const NC=W.length;
  const allOn=list.length&&list.every(c=>S.sel.has(c.id));
  const head=[`<input type="checkbox" data-shall ${allOn?'checked':''} aria-label="Sab chuno">`,'✓','Customer',...PLN.map(p=>p.sh+' ('+p.u+')'),'Bottles','Status',...(showBr?['Wapas ½L · 1L']:[]),'Other products','Fix comment','Variable comment',...(showH?days.map(d=>fmtShort(d)+' '+DOW[new Date(d+'T12:00:00').getDay()]):[])];
  let body='',lastBoy=null,n=0;
  list.forEach(c=>{if(c.boy!==lastBoy){lastBoy=c.boy;body+=`<tr class="grp"><td colspan="${NC}"><b>${esc(c.boy||'—')}</b></td></tr>`}body+=shRow(c,++n,type,days,showBr,showH)});
  if(!list.length)body=`<tr><td colspan="${NC}"><div class="empty">Is filter me koi customer nahi.</div></td></tr>`;
  const todoN=cnt.todo+cnt.dirty;const pend=type==='past'?[]:pastPending();const dn=(S.days[date]||{}).dnote||{};
  const selN=[...S.sel].filter(id=>S.customers[id]).length;
  const boxes=[];
  if(type!=='past')boxes.push(`<button class="stbox ${todoN?'bad':'good'}" data-act="shF" data-v="${todoN?'todo':'all'}">${todoN?`${todoN} order abhi confirm nahi`:'Sab confirm ✓'}</button>`);
  if(type==='cur'&&cnt.conf)boxes.push(`<button class="stbox warn" data-act="shF" data-v="conf">${cnt.conf} delivery abhi ✓ nahi hui</button>`);
  if(type==='past')boxes.push(`<button class="stbox ${cnt.pend?'bad':'good'}" data-act="shF" data-v="${cnt.pend?'pend':'all'}">${cnt.pend?`${cnt.pend} delivery pending (bill me nahi judi)`:'Sab mark ho chuke ✓'}</button>`);
  if(cnt.dirty)boxes.push(`<span class="stbox warn">${cnt.dirty} row me badlav, ✓ dabake save karo</span>`);
  const html=`<div class="stack">
   <div class="row sp wrap">
    <div class="dtbar"><button class="btn sm o" data-act="shShift" data-n="-1" title="Pichla din  [">‹</button><span class="dtpill ${type}">${DT_L[type]} · ${fmtDate(date)}</span><button class="btn sm o" data-act="shShift" data-n="1" title="Agla din  ]">›</button>
     <input type="date" class="input" style="width:auto;padding:6px 10px" value="${date}" data-shdate>
     <div class="seg">${[[-1,'Pichli'],[0,'Aaj ki'],[1,'Agli']].map(([k,l])=>`<button class="${date===addDays(pd,k)?'on':''}" data-act="shJump" data-n="${k}">${l}</button>`).join('')}</div></div>
    <div class="row wrap"><button class="btn sm o" data-act="routeOrder" data-b="${esc(S.plboy)}">⇅ Order</button><button class="btn sm o" data-act="xlsx" data-d="${date}">Excel backup</button><button class="btn sm o" data-act="plAuto">Auto-fill dobara</button>
     ${type!=='next'?`<button class="btn sm o" data-act="shAllD">Baaki sab ✓ Diya</button>`:''}<button class="btn sm p" data-act="plAll">Sab confirm karo</button></div></div>
   ${pend.length?`<div class="pendbar">Pichli dates pe delivery ✓ nahi hui (bill me nahi judegi): ${pend.map(p=>`<button class="btn xs o" data-act="shGo" data-d="${p.d}">${fmtShort(p.d)} · ${p.n}</button>`).join('')}</div>`:''}
   <div class="dt-${type}"><div id="plstrip">${plStrip()}</div></div>
   <div class="stboxes">${boxes.join('')}</div>
   <div class="row sp wrap"><div class="row wrap">${chips(fl.map(([v,l])=>({v,l})),S.shf,'shF')}</div>
    <div class="row wrap">${chips([{v:'active',l:'Active'},{v:'paused',l:'Inactive'},{v:'all',l:'Sab'}],S.plst,'plSt')}</div></div>
   <div class="row sp wrap">${boyChips(S.plboy,'plBoy')}<div class="row wrap"><input class="input" style="max-width:240px" placeholder="Naam ya mobile  ( / )" value="${esc(S.plq)}" data-act="plq">
    <button class="btn sm o" data-act="shHistT">${showH?'History chhupao':'History dikhao'}</button>
    ${showH?`<span class="row small muted">History <button class="btn xs o" data-act="plHist" data-n="-1">‹</button>${fmtShort(days[6])} – ${fmtShort(days[0])}<button class="btn xs o" data-act="plHist" data-n="1" ${S.plhe>=todayISO()?'disabled':''}>›</button></span>`:''}</div></div>
   <div class="shw" data-ks="shw"><table class="sht" style="min-width:${W.reduce((a,b)=>a+b,0)}px;width:100%"><colgroup>${W.map(w=>`<col style="width:${w}px">`).join('')}</colgroup>
    <thead><tr>${head.map((h,i)=>`<th class="${i===0?'s1':i===1?'s2':i===2?'s3':''}">${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>
   <div class="small muted">Number likho → <span class="kbd">Enter</span>/<span class="kbd">↓</span> agla customer, <span class="kbd">Tab</span> agla product, <span class="kbd">Ctrl</span>+<span class="kbd">Enter</span> row confirm. Quantity 0 + ✓ = us din delivery nahi. Checkbox se kai rows chuno (<span class="kbd">Shift</span>+click = range), neeche wali bar se ek saath badlo. <span class="kbd">[</span> <span class="kbd">]</span> = date badlo. Naam pe double click = details.</div>
   ${selN?shBulkBar(selN,type):''}
   <div class="card"><div class="row sp wrap"><h3>Dispatch notes · ${fmtDate(date)}</h3><span class="small muted">${dn.by?'Last save: '+esc(dn.by)+(dn.t?' · '+new Date(dn.t).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}):''):'Date-wise save hota hai'}</span></div>
    <textarea class="input dnote" style="margin-top:8px" data-act="dnote" data-d="${date}" placeholder="Bottle count verify, warehouse instructions, packing notes…">${esc(dn.t0||'')}</textarea>
    <div class="small muted" style="margin-top:4px">Box se bahar click karte hi save.</div></div></div>`;
  return {title:'Delivery sheet',html,action:`<button class="btn sm o only-desk" data-act="keys" title="Keyboard shortcuts">⌨</button>`}}
function shBulkBar(n,type){const pr=products().filter(p=>p.on!==false);
  return `<div class="bulkbar"><b>${n} chune</b>
   <button class="btn sm p" data-act="shBulk" data-op="ok">✓ Confirm</button>${type!=='next'?`<button class="btn sm" data-act="shBulk" data-op="d">✓ Diya</button><button class="btn sm" data-act="shBulk" data-op="k">Skip</button><button class="btn sm" data-act="shBulk" data-op="p">Pending</button>`:''}
   <span class="sep"></span><select id="sbP" aria-label="Product">${PLN.map(p=>`<option value="${p.k}">${p.sh}</option>`).join('')}</select><input id="sbV" type="number" min="0" step="0.25" placeholder="Qty" style="width:70px"><button class="btn sm" data-act="shBulk" data-op="qty">Qty lagao</button>
   <span class="sep"></span><input id="sbX" list="sbXl" placeholder="Other product" style="width:140px"><datalist id="sbXl">${pr.map(p=>`<option value="${esc(p.n)}">`).join('')}</datalist><input id="sbXq" type="number" min="0" step="any" value="1" style="width:54px" aria-label="Qty"><button class="btn sm" data-act="shBulk" data-op="x">Jodo</button>
   <span class="sep"></span><input id="sbC" placeholder="Comment" style="width:140px"><input id="sbCd" type="date" min="${todayISO()}" value="${addDays(todayISO(),3)}"><button class="btn sm" data-act="shBulk" data-op="cm">Comment</button>
   <button class="btn sm" data-act="shSelClear">✕</button></div>`}

let shLast=null;
document.addEventListener('click',e=>{
  const all=e.target.closest&&e.target.closest('[data-shall]');
  if(all){const on=all.checked;S.shList.forEach(id=>on?S.sel.add(id):S.sel.delete(id));render();return}
  const cb=e.target.closest&&e.target.closest('[data-shsel]');
  if(cb){const id=cb.dataset.shsel,on=cb.checked;
    if(e.shiftKey&&shLast&&S.shList.includes(shLast)){const a=S.shList.indexOf(shLast),b=S.shList.indexOf(id);S.shList.slice(Math.min(a,b),Math.max(a,b)+1).forEach(x=>on?S.sel.add(x):S.sel.delete(x))}
    else on?S.sel.add(id):S.sel.delete(id);
    shLast=id;render()}});
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&el.dataset.act==='pqty'&&S.route==='sheet'){const tr=el.closest('tr');if(tr){tr.classList.add('dirty');const sp=tr.querySelector('.stp');if(sp){sp.className='stp dirty';sp.textContent='Badla · save baaki'}}}});
document.addEventListener('change',e=>{const el=e.target;if(!el.dataset)return;
  if('shdate' in el.dataset&&el.value){S.pld=el.value;S.sel.clear();render();return}
  if(el.dataset.shbr){const id=el.dataset.shbr,c=S.customers[id];if(!c)return;const tr=el.closest('tr');const g=k=>Math.max(0,Math.round(+(tr.querySelector(`[data-shbr="${id}"][data-k="${k}"]`)||{}).value||0));
    const r=rowOf(S.pld,id);const base=r?JSON.parse(JSON.stringify(r)):makeRow(c,'p');const s=g('S'),b=g('B');
    if(s+b>Math.max(0,bottleBal(c)+(+(r&&r.br)||0)))toast(c.name+': customer ke paas itni bottles nahi dikh rahi, phir bhi save kar rahe hain');
    commitRows({[id]:{...base,brS:s,brB:b,br:s+b,t:Date.now()}})}});
document.addEventListener('keydown',e=>{const t=e.target;if(!t.dataset||t.dataset.act!=='pqty'||S.route!=='sheet')return;
  if(e.key==='Enter'&&(e.ctrlKey||e.metaKey||e.shiftKey)){e.preventDefault();e.stopPropagation();const id=t.dataset.id,p=t.dataset.p;
    A.shOk({id}).then(()=>{const i=S.shList.indexOf(id),nx=S.shList[i+1];if(nx){const inp=document.querySelector(`input[data-act="pqty"][data-id="${nx}"][data-p="${p}"]`);if(inp){inp.focus();inp.select()}}})}},true);

Object.assign(A,{
  shShift(d){S.pld=addDays(S.pld,+d.n);S.sel.clear();render()},
  shJump(d){S.pld=addDays(planDayISO(),+d.n);S.sel.clear();render()},
  shGo(d){S.pld=d.d;S.shf='pend';S.sel.clear();render()},
  shF(d){S.shf=d.v;render()},
  shHistT(){S.shHist=!S.shHist;ls.set('oritic.shHist',S.shHist?'1':'0');render()},
  shSelClear(){S.sel.clear();render()},
  async shOk(d){const c=S.customers[d.id];if(!c)return;const r=rowOf(S.pld,c.id),dr=plDraft(c);let row;
    if(r&&r.s==='d'){if(!dr.dirty){toast('Delivered hai. Badalna hai to quantity badlo, ya ↺ dabao');return}row=shBuild(c);if(!row){toast('Quantity 0 hai. Skip dabao');return}}
    else if(plConf(c)&&!dr.dirty)row=makeRow(c,'p');
    else row=plBuild(c);
    return commitRows({[c.id]:row})},
  shD(d){const c=S.customers[d.id];if(!c)return;const r=rowOf(S.pld,c.id);if(r&&r.s==='d'&&!plDraft(c).dirty)return toast('Pehle se delivered hai');
    const row=shBuild(c);if(!row)return toast('Quantity 0 hai. Skip dabao ya quantity likho');commitRows({[c.id]:row})},
  shK(d){const c=S.customers[d.id];if(!c)return;const r=rowOf(S.pld,c.id);if(r&&r.s==='k')return;const row=makeRow(c,'k',null,[],(r&&r.n)||'');row.pl=1;commitRows({[c.id]:row})},
  shP(d){const c=S.customers[d.id];if(!c)return;const r=rowOf(S.pld,c.id);if(!r)return;
    const row=r.s==='d'?makeRow(c,'p',r.q,r.x,r.n,r.by):makeRow(c,'p',orderOf(c),standingX(c),r.n,r.by);row.pl=1;commitRows({[c.id]:row})},
  async shAllD(){const list=plList().filter(c=>c.status==='active'&&!['del','skip'].includes(shState(c))&&hasItems(c));if(!list.length)return toast('Koi pending delivery nahi');
    if(dayType(S.pld)!=='past'){const ok=await confirmBox({title:`${list.length} customers ko ${fmtDate(S.pld)} ki delivery ✓ Diya karein?`,html:'Jo quantity table me hai, wahi bill me judegi.',yes:'Haan, sab ✓'});if(!ok)return}
    const rows={};list.forEach(c=>{const r=shBuild(c);if(r)rows[c.id]=r});if(await commitRows(rows))toast(Object.keys(rows).length+' deliveries ✓')},
  async shBulk(d){const ids=[...S.sel].filter(id=>S.customers[id]);if(!ids.length)return;const op=d.op;const cs=ids.map(id=>S.customers[id]);
    if(op==='qty'){const k=$('#sbP').value,v=$('#sbV').value;if(v===''||!(+v>=0))return toast('Qty likho');cs.forEach(c=>{const dr=plDraft(c);dr.qty[k]=+v;dr.dirty=true});render();return toast(cs.length+' rows me lag gaya. Ab ✓ Confirm dabao')}
    if(op==='x'){const name=$('#sbX').value.trim();const qty=+$('#sbXq').value||1;if(!name)return toast('Product ka naam likho');const p=findProd(name);let zero=0;
      cs.forEach(c=>{const lr=lastRate(c.id,p?p.id:'',name);const rate=lr!=null?lr:(p?+p.a||0:0);if(!rate)zero++;const base=p?p.n:name;const dr=plDraft(c);dr.x.push({n:base+(qty!==1?' ×'+L(qty):''),base,pid:p?p.id:'',qty,rate,a:Math.round(qty*rate*100)/100});dr.dirty=true});
      render();return toast(cs.length+' rows me "'+name+'" juda'+(zero?' · '+zero+' ka rate ₹0':'')+'. Ab ✓ Confirm dabao')}
    if(op==='cm'){const t=$('#sbC').value.trim(),till=$('#sbCd').value;if(!t||!till)return toast('Comment aur tareekh likho');cs.forEach(c=>addVar(c.id,{t,till}));render();return toast(cs.length+' customers pe comment laga')}
    const rows={};let skipN=0;
    cs.forEach(c=>{const r=rowOf(S.pld,c.id),s=shState(c);
      if(op==='ok'){if(s==='del'||((s==='conf'||s==='skip')&&!plDraft(c).dirty)){skipN++;return}rows[c.id]=plBuild(c)}
      else if(op==='d'){if(s==='del'&&!plDraft(c).dirty){skipN++;return}const row=shBuild(c);if(row)rows[c.id]=row;else skipN++}
      else if(op==='k'){if(s==='skip'){skipN++;return}const row=makeRow(c,'k',null,[],(r&&r.n)||'');row.pl=1;rows[c.id]=row}
      else if(op==='p'){if(!r||!(r.s==='d'||r.s==='k')){skipN++;return}const row=r.s==='d'?makeRow(c,'p',r.q,r.x,r.n,r.by):makeRow(c,'p',orderOf(c),standingX(c),r.n,r.by);row.pl=1;rows[c.id]=row}});
    if(!Object.keys(rows).length)return toast('Chune hue rows pe kuch badalna nahi tha');
    if(await commitRows(rows)){S.sel.clear();render();toast(Object.keys(rows).length+' rows save'+(skipN?' · '+skipN+' chhode (pehle se)':''))}},
  keys(){sheetKeys()}
});
/* "Sab confirm karo" Delivery sheet me: ek popup, save status, pichli date pe badlav ka record */
const _plAll=A.plAll;
A.plAll=async function(d,el){if(S.route!=='sheet')return _plAll(d,el);
  const rows={};plList().filter(c=>c.status==='active').forEach(c=>{const r=rowOf(S.pld,c.id),dr=plDraft(c);if(r&&r.s==='d'&&!dr.dirty)return;if(plConf(c)&&!dr.dirty)return;rows[c.id]=r&&r.s==='d'?(shBuild(c)||plBuild(c)):plBuild(c)});
  const n=Object.keys(rows).length;if(!n)return toast('Sab pehle se confirm hain');
  if(dayType(S.pld)!=='past'){const ok=await confirmBox({title:`${n} customers ke order confirm karein?`,html:`${fmtDate(S.pld)} · Jo quantity table me hai wahi jayegi. Quantity 0 wale "us din nahi" confirm honge.`,yes:'Haan, sab confirm'});if(!ok)return}
  if(await commitRows(rows))toast(n+' confirm ho gaye')};

/* ================= Customers grid ================= */
const CGCOLS=()=>[
  {f:'name',l:'Naam *',w:190},{f:'phone',l:'Mobile',w:118},{f:'boy',l:'Boy',w:112,sel:()=>boys().map(b=>[b,b])},
  {f:'area',l:'Area',w:124},{f:'house',l:'Makan',w:120},{f:'address',l:'Address',w:210},{f:'landmark',l:'Landmark',w:150},
  {f:'schedule',l:'Schedule',w:112,sel:()=>[['daily','Roz'],['alternate','Alternate'],['custom','Custom']]},
  {f:'status',l:'Status',w:96,sel:()=>[['active','Active'],['paused','Paused']]},
  ...PRODUCTS.map(p=>({f:'order.'+p.k,l:(p.k==='desi'?'Gir':p.sh)+' L',w:66,num:1,step:0.5})),
  ...PRODUCTS.map(p=>({f:'rates.'+p.k,l:'₹ '+(p.k==='desi'?'Gir':p.sh),w:66,num:1,step:1})),
  {f:'notes',l:'Fix comment',w:210},{f:'map',l:'Map link',w:170}];
const cgObj=id=>id.startsWith('new_')?S.cgNew.find(x=>x.id===id):S.customers[id];
function cgVal(c,f){if(f.startsWith('order.'))return orderOf(c)[f.slice(6)]||0;if(f.startsWith('rates.'))return ratesOf(c)[f.slice(6)];const v=c[f];return v==null?'':v}
function cgCur(id,f){const d=S.cgDirty[id];if(d&&f in d)return d[f];const c=cgObj(id);return c?cgVal(c,f):''}
function cgSetVal(id,f,v){const c=cgObj(id);if(!c)return;const d=S.cgDirty[id]||(S.cgDirty[id]={});if(String(v)===String(cgVal(c,f))&&!id.startsWith('new_'))delete d[f];else d[f]=String(v);if(!Object.keys(d).length)delete S.cgDirty[id];delete S.cgErr[id+'|'+f]}
function cgNewRow(){const id='new_'+uid();S.cgNew.push({id,name:'',phone:'',boy:S.cboy!=='all'?S.cboy:(boys()[0]||''),area:'',house:'',address:'',landmark:'',schedule:'daily',status:'active',order:{},rates:{},notes:'',map:''});return id}
function cgList(){const q=S.cq.trim().toLowerCase();const all=Object.values(S.customers);
  let list=all.filter(c=>(S.cboy==='all'||c.boy===S.cboy)&&(S.cstatus==='all'||(S.cstatus==='active'?c.status==='active':c.status!=='active'))&&(!q||(c.name+' '+(c.phone||'')+' '+(c.area||'')+' '+(c.address||'')+' '+(c.house||'')).toLowerCase().includes(q)));
  const pos={};const g={};all.forEach(c=>(g[c.boy||'']=g[c.boy||'']||[]).push(c));Object.values(g).forEach(arr=>arr.sort((a,b)=>((a.seq??9999)-(b.seq??9999))||a.name.localeCompare(b.name)).forEach((c,i)=>pos[c.id]=i+1));
  if(S.csort!=='az')list.sort((a,b)=>(a.boy||'').localeCompare(b.boy||'')||(pos[a.id]-pos[b.id]));else list.sort((a,b)=>(a.area||'').localeCompare(b.area||'')||a.name.localeCompare(b.name));
  return {list,pos,total:all.length,act:all.filter(c=>c.status==='active').length}}
function cgCell(id,col,ci){const v=cgCur(id,col.f);const d=S.cgDirty[id];const dirty=d&&col.f in d;const err=S.cgErr[id+'|'+col.f];
  const cls=`${ci===0?'s3 ':''}${dirty?'dirty ':''}${err?'err':''}`;const ttl=err?` title="${esc(err)}"`:'';
  if(col.sel){const opts=col.sel();if(v!==''&&!opts.some(o=>o[0]===v))opts.push([v,v]);
    return `<td class="${cls}"${ttl}><select class="cgi" data-cg="${id}" data-f="${col.f}">${col.f==='boy'&&!v?'<option value="">— chuno —</option>':''}${opts.map(o=>`<option value="${esc(o[0])}" ${o[0]===v?'selected':''}>${esc(o[1])}</option>`).join('')}</select></td>`}
  return `<td class="${cls}"${ttl}><input class="cgi" data-cg="${id}" data-f="${col.f}" value="${esc(v)}" ${col.num?`type="number" inputmode="decimal" min="0" step="${col.step}"`:col.f==='phone'?'inputmode="tel"':''} autocomplete="off"></td>`}
function cgBarHtml(){const dn=Object.keys(S.cgDirty).length,sn=[...S.cgSel].filter(id=>cgObj(id)).length;if(!dn&&!sn)return '';
  return `<div class="bulkbar">${dn?`<b>${dn} customers me badlav</b><button class="btn sm p" data-act="cgSave">Save karo <span class="kbd" style="background:transparent;color:inherit">Ctrl S</span></button><button class="btn sm" data-act="cgReset">Reset</button>`:''}
   ${sn?`${dn?'<span class="sep"></span>':''}<b>${sn} chune</b>
   <select id="cbBoy" aria-label="Boy">${boys().map(b=>`<option>${esc(b)}</option>`).join('')}</select><button class="btn sm" data-act="cgBulk" data-op="boy">Boy lagao</button>
   <button class="btn sm" data-act="cgBulk" data-op="active">Active</button><button class="btn sm" data-act="cgBulk" data-op="paused">Pause</button>
   <select id="cbSch" aria-label="Schedule"><option value="daily">Roz</option><option value="alternate">Alternate</option></select><button class="btn sm" data-act="cgBulk" data-op="sch">Schedule</button>
   <span class="sep"></span><select id="cbP" aria-label="Doodh">${PRODUCTS.map(p=>`<option value="${p.k}">${p.k==='desi'?'Gir Cow':p.sh}</option>`).join('')}</select>
   <input id="cbV" type="number" min="0" step="0.5" placeholder="L/din" style="width:66px"><button class="btn sm" data-act="cgBulk" data-op="qty">Qty</button>
   <input id="cbR" type="number" min="0" step="1" placeholder="₹ rate" style="width:70px"><button class="btn sm" data-act="cgBulk" data-op="rate">Rate</button>
   <span class="sep"></span><button class="btn sm" data-act="cgXlsx">Excel</button><button class="btn sm d" data-act="cgDel">Delete</button><button class="btn sm" data-act="cgSelClear">✕</button>`:''}</div>`}
let cgBarN='';function cgBar(){const k=Object.keys(S.cgDirty).length+'|'+S.cgSel.size;if(k===cgBarN)return;cgBarN=k;const el=$('#cgbar');if(el)el.innerHTML=cgBarHtml()}
function vCustGrid(){const {list,pos,total,act}=cgList();const cols=CGCOLS();
  const W=[34,42,...cols.map(c=>c.w),96,70,170];const NC=W.length;
  const ids=[...S.cgNew.map(x=>x.id),...list.map(c=>c.id)];S.cgIds=ids;
  const allOn=ids.length&&ids.every(id=>S.cgSel.has(id));
  const head=[`<input type="checkbox" data-cgall ${allOn?'checked':''} aria-label="Sab chuno">`,'#',...cols.map(c=>c.l),'Baki','Bottles',''];
  const row=(id,isNew,c)=>`<tr data-row="${id}" class="${isNew?'newr':''} ${S.cgSel.has(id)?'sel':''}"><td class="s1"><input type="checkbox" data-cgsel="${id}" ${S.cgSel.has(id)?'checked':''} aria-label="Chuno"></td>
     <td class="pos s2">${isNew?'naya':pos[id]||''}</td>${cols.map((col,ci)=>cgCell(id,col,ci)).join('')}
     ${isNew?'<td class="ro">–</td><td class="ro">–</td><td class="acts"><button class="btn xs o" data-act="cgDrop" data-id="'+id+'">Hatao</button></td>':(()=>{const bal=balanceUpto(c,null);return `<td class="ro" style="color:${bal>0.5?'var(--danger)':'inherit'};font-weight:700">${inr(bal)}</td><td class="ro">${bottleBal(c)}</td>
       <td class="acts"><button class="btn xs o" data-act="openCustomer" data-id="${id}">Profile</button> <button class="btn xs o" data-act="openBill" data-id="${id}">Bill</button> <button class="btn xs o" data-act="addPayment" data-id="${id}">₹</button></td>`})()}</tr>`;
  let body='';if(S.cgNew.length)body+=`<tr class="grp"><td colspan="${NC}"><b>Naye customers (save hone baaki)</b></td></tr>`+S.cgNew.map(x=>row(x.id,true,x)).join('');
  let lastG=null;list.forEach(c=>{if(S.csort!=='az'&&S.cboy==='all'&&c.boy!==lastG){lastG=c.boy;body+=`<tr class="grp"><td colspan="${NC}"><b>${esc(c.boy||'—')}</b></td></tr>`}body+=row(c.id,false,c)});
  if(!ids.length)body=`<tr><td colspan="${NC}"><div class="empty">Koi customer nahi mila</div></td></tr>`;
  cgBarN=Object.keys(S.cgDirty).length+'|'+S.cgSel.size;
  const html=`<div class="stack">
    <div class="row sp wrap"><div class="search grow" style="min-width:220px;max-width:420px">${ICONS.search}<input class="input" placeholder="Naam, phone, area…  ( / )" value="${esc(S.cq)}" data-act="cq"></div>
     <div class="row wrap"><button class="btn sm o" data-act="cgAdd" data-n="1">+ 1 khali row</button><button class="btn sm o" data-act="cgAdd" data-n="10">+ 10 rows</button><button class="btn sm o" data-act="impOpen">Excel import</button><button class="btn sm o" data-act="cgXlsx">Excel export</button></div></div>
    <div class="row sp wrap">${boyChips(S.cboy,'setCBoy')}<div class="row"><div class="seg">${[['active','Active'],['paused','Paused'],['all','Sab']].map(([v,l])=>`<button class="${S.cstatus===v?'on':''}" data-act="setCStatus" data-v="${v}">${l}</button>`).join('')}</div>
     <div class="seg">${[['route','Route order'],['az','Area / A–Z']].map(([v,l])=>`<button class="${(S.csort||'route')===v?'on':''}" data-act="setCSort" data-v="${v}">${l}</button>`).join('')}</div><button class="btn sm o" data-act="routeOrder" data-b="${esc(S.cboy)}">⇅ Order</button></div></div>
    <div class="small muted">${list.length} dikh rahe · ${act} active · ${total-act} paused. Cell me seedha likho, <span class="kbd">Enter</span>/<span class="kbd">↑↓</span> se upar-neeche, <span class="kbd">Ctrl</span>+<span class="kbd">S</span> save. Excel se kai cells copy karke yahan paste kar sakte ho.</div>
    <div class="cgw" data-ks="cgw"><table class="cgt" style="min-width:${W.reduce((a,b)=>a+b,0)}px;width:100%"><colgroup>${W.map(w=>`<col style="width:${w}px">`).join('')}</colgroup>
     <thead><tr>${head.map((h,i)=>`<th class="${i===0?'s1':i===1?'s2':i===2?'s3':''}">${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>
    <div id="cgbar">${cgBarHtml()}</div></div>`;
  return {html}}
const _vCust=vCustomers;
vCustomers=function(){if(!isOwner())return _vCust();
  const tg=`<div class="seg only-desk"><button class="${S.cview==='grid'?'on':''}" data-act="cView" data-v="grid">Grid</button><button class="${S.cview!=='grid'?'on':''}" data-act="cView" data-v="list">List</button></div>`;
  if(S.cview==='grid'&&matchMedia('(min-width:900px)').matches){const o=vCustGrid();return {html:o.html,action:tg+`<button class="btn sm p" data-act="editCustomer">+ Naya</button>`}}
  const o=_vCust();return {html:o.html,action:tg+`<button class="btn sm o" data-act="impOpen">Excel import</button>`+(o.action||'')}};
function cgParse(f,v){v=String(v==null?'':v).trim();
  if(f==='schedule'){const s=norm(v);return /^(roz|daily|regular|rozana|everyday|d)$/.test(s)?'daily':/^(alt|alternate|alternateday|ekdinchhodke|a)$/.test(s)?'alternate':/^(custom|c)$/.test(s)?'custom':v}
  if(f==='status'){const s=norm(v);return /^(active|chalu|on|haan|yes)$/.test(s)?'active':/^(paused|pause|band|inactive|off|nahi|no)$/.test(s)?'paused':v}
  if(f==='boy'){const b=boys().find(x=>norm(x)===norm(v));return b||v}
  return v}
document.addEventListener('input',e=>{const el=e.target;if(!el.classList||!el.classList.contains('cgi'))return;cgSetVal(el.dataset.cg,el.dataset.f,el.value);const td=el.closest('td');const d=S.cgDirty[el.dataset.cg];td.classList.toggle('dirty',!!(d&&el.dataset.f in d));td.classList.remove('err');cgBar()});
document.addEventListener('change',e=>{const el=e.target;if(el.tagName==='SELECT'&&el.classList.contains('cgi')){cgSetVal(el.dataset.cg,el.dataset.f,el.value);const d=S.cgDirty[el.dataset.cg];el.closest('td').classList.toggle('dirty',!!(d&&el.dataset.f in d));cgBar()}});
function cgMove(el,dr,dc){const tr=el.closest('tr'),td=el.closest('td');const rows=[...document.querySelectorAll('.cgt tbody tr[data-row]')];const ri=rows.indexOf(tr);let ci=td.cellIndex;
  if(dc){let cells=[...tr.cells];for(let k=ci+dc;k>=0&&k<cells.length;k+=dc){const x=cells[k].querySelector('.cgi');if(x){x.focus();if(x.select)x.select();return}}return}
  const nr=rows[ri+dr];if(!nr)return;const x=nr.cells[ci]&&nr.cells[ci].querySelector('.cgi');if(x){x.focus();if(x.select)x.select()}}
document.addEventListener('keydown',e=>{const el=e.target;if(!el.classList||!el.classList.contains('cgi'))return;const sel=el.tagName==='SELECT';
  const atS=()=>{try{return el.selectionStart===0&&el.selectionEnd===0}catch(_){return true}},atE=()=>{try{return el.selectionStart===el.value.length}catch(_){return true}};
  let dr=0,dc=0;if(e.key==='Enter')dr=e.shiftKey?-1:1;else if(!sel&&e.key==='ArrowDown')dr=1;else if(!sel&&e.key==='ArrowUp')dr=-1;
  else if(!sel&&e.key==='ArrowRight'&&atE())dc=1;else if(!sel&&e.key==='ArrowLeft'&&atS())dc=-1;
  if(!dr&&!dc)return;e.preventDefault();cgMove(el,dr,dc)});
document.addEventListener('paste',e=>{const el=e.target;if(!el.classList||!el.classList.contains('cgi'))return;const t=(e.clipboardData||window.clipboardData).getData('text')||'';if(!/[\t\n]/.test(t.replace(/\r?\n$/,'')))return;e.preventDefault();
  const lines=t.replace(/\r/g,'').replace(/\n$/,'').split('\n').map(l=>l.split('\t'));const cols=CGCOLS().map(c=>c.f);const c0=cols.indexOf(el.dataset.f);
  const id0=el.dataset.cg;const isNew=id0.startsWith('new_');let ids=isNew?S.cgNew.map(x=>x.id):S.cgIds.filter(id=>!id.startsWith('new_'));let r0=ids.indexOf(id0);
  if(isNew)while(ids.length<r0+lines.length){ids.push(cgNewRow())}
  let n=0;lines.forEach((cells,li)=>{const id=ids[r0+li];if(!id)return;cells.forEach((v,k)=>{const f=cols[c0+k];if(!f)return;cgSetVal(id,f,cgParse(f,v));n++})});
  render();toast(n+' cells paste hue'+(!isNew&&r0+lines.length>ids.length?' (baaki lines ke liye rows nahi thi)':'')+'. Check karke Save dabao')});
document.addEventListener('click',e=>{const all=e.target.closest&&e.target.closest('[data-cgall]');if(all){const on=all.checked;(S.cgIds||[]).forEach(id=>on?S.cgSel.add(id):S.cgSel.delete(id));render();return}
  const cb=e.target.closest&&e.target.closest('[data-cgsel]');if(!cb)return;const id=cb.dataset.cgsel,on=cb.checked;const L2=S.cgIds||[];
  if(e.shiftKey&&S.cgLast&&L2.includes(S.cgLast)){const a=L2.indexOf(S.cgLast),b=L2.indexOf(id);L2.slice(Math.min(a,b),Math.max(a,b)+1).forEach(x=>on?S.cgSel.add(x):S.cgSel.delete(x))}else on?S.cgSel.add(id):S.cgSel.delete(id);
  S.cgLast=id;cb.closest('tr').classList.toggle('sel',on);if(e.shiftKey)render();else{cgBarN='';cgBar()}});
const phoneOk=raw=>{const d=String(raw||'').replace(/\D/g,'');if(!d)return '';if(d.length===10)return d;if(d.length===12&&d.startsWith('91'))return d.slice(2);if(d.length===11&&d.startsWith('0'))return d.slice(1);return null};
Object.assign(A,{
  cView(d){S.cview=d.v;ls.set('oritic.cview',d.v);render()},
  cgAdd(d){let first=null;for(let i=0;i<(+d.n||1);i++){const id=cgNewRow();first=first||id}render();setTimeout(()=>{const x=document.querySelector(`.cgi[data-cg="${first}"][data-f="name"]`);if(x)x.focus()},30)},
  cgDrop(d){S.cgNew=S.cgNew.filter(x=>x.id!==d.id);delete S.cgDirty[d.id];S.cgSel.delete(d.id);render()},
  cgReset(){S.cgDirty={};S.cgErr={};S.cgNew=[];render();toast('Badlav hata diye')},
  cgSelClear(){S.cgSel.clear();render()},
  cgBulk(d){const ids=[...S.cgSel].filter(id=>cgObj(id));if(!ids.length)return;const op=d.op;let f,v;
    if(op==='boy'){f='boy';v=$('#cbBoy').value}else if(op==='active'||op==='paused'){f='status';v=op}else if(op==='sch'){f='schedule';v=$('#cbSch').value}
    else if(op==='qty'){v=$('#cbV').value;if(v===''||!(+v>=0)||Math.round(+v*2)!==+v*2)return toast('Quantity 0.5 ke step me likho');f='order.'+$('#cbP').value}
    else if(op==='rate'){v=$('#cbR').value;if(v===''||!(+v>=0))return toast('Rate likho');f='rates.'+$('#cbP').value}
    ids.forEach(id=>cgSetVal(id,f,v));render();toast(ids.length+' rows me laga. Check karke Save dabao')},
  async cgSave(){if(!isOwner())return toast('Sirf owner kar sakta hai');if(!canWrite())return toast('Aapko write permission nahi hai');
    const ids=Object.keys(S.cgDirty);if(!ids.length)return toast('Koi badlav nahi');
    const phones={};Object.values(S.customers).forEach(c=>{const p=cleanPhone(c.phone);if(p)phones[p]=c.id});
    const errs=[],writes=[],done=[];S.cgErr={};
    for(const id of ids){const isNew=id.startsWith('new_');const base=cgObj(id);if(!base)continue;const g=f=>cgCur(id,f);const dirty=S.cgDirty[id];
      if(isNew&&Object.values(dirty).every(v=>!String(v).trim())){done.push(id);continue}
      const E=(f,m)=>{errs.push(m);S.cgErr[id+'|'+f]=m};const n0=errs.length;
      const name=String(g('name')).trim();if(!name)E('name','Naam khaali hai');
      const phone=phoneOk(g('phone'));if(phone===null)E('phone','Mobile 10 digit ka nahi');else if(phone&&phones[phone]&&phones[phone]!==id)E('phone','Ye number '+((S.customers[phones[phone]]||{}).name||'kisi aur')+' ka hai');
      const boy=String(g('boy')).trim();if(!boy)E('boy','Boy chuno');
      const sch=g('schedule');if(!['daily','alternate','custom'].includes(sch))E('schedule','Schedule: Roz / Alternate / Custom');else if(sch==='custom'&&!((base.wdays||[]).length))E('schedule','Custom ke din customer ki profile (Edit) me chuno');
      const status=g('status');if(!['active','paused'].includes(status))E('status','Status: Active / Paused');
      const order={},rates={};PRODUCTS.forEach(p=>{const q=+g('order.'+p.k);if(!(q>=0)||Math.round(q*2)!==q*2)E('order.'+p.k,(p.k==='desi'?'Gir Cow':p.sh)+' quantity 0.5 ke step me ho');order[p.k]=q||0;const rt=+g('rates.'+p.k);if(!(rt>=0))E('rates.'+p.k,'Rate galat');rates[p.k]=rt||0});
      if(errs.length>n0)continue;
      if(phone)phones[phone]=id;
      const txt=f=>String(g(f)).trim();
      if(isNew){const nid='c'+(phone||uid());if(S.customers[nid]){E('phone','Is number ka customer pehle se hai');continue}
        const seq=Object.values(S.customers).filter(x=>x.boy===boy).reduce((m,x)=>Math.max(m,+x.seq||0),0)+10+writes.filter(w=>w.body.boy===boy).length*10;
        writes.push({id:nid,old:id,isNew:true,body:{name,phone,boy,area:txt('area'),house:txt('house'),address:txt('address'),landmark:txt('landmark'),map:txt('map'),schedule:sch,wdays:[],status,order,rates,notes:txt('notes'),openingDue:0,bottles:0,xorder:[],since:todayISO(),createdAt:todayISO(),seq,src:'grid'}})}
      else{const patch={};Object.keys(dirty).forEach(f=>{if(f.startsWith('order.'))patch.order=order;else if(f.startsWith('rates.'))patch.rates={...(base.rates||{}),...rates};else if(f==='phone')patch.phone=phone;else if(f==='name')patch.name=name;else if(f==='boy')patch.boy=boy;else if(f==='schedule')patch.schedule=sch;else if(f==='status')patch.status=status;else patch[f]=txt(f)});
        if(patch.boy&&patch.boy!==base.boy)patch.seq=Object.values(S.customers).filter(x=>x.boy===patch.boy&&x.id!==id).reduce((m,x)=>Math.max(m,+x.seq||0),0)+10;
        writes.push({id,body:patch})}}
    done.forEach(id=>{delete S.cgDirty[id];S.cgNew=S.cgNew.filter(x=>x.id!==id)});
    if(writes.length){try{for(let i=0;i<writes.length;i+=400){const b=S.db.batch();writes.slice(i,i+400).forEach(w=>{if(w.isNew)b.set(S.db.doc('customers/'+w.id),w.body);else b.set(S.db.doc('customers/'+w.id),w.body,{merge:true})});await b.commit()}
      writes.forEach(w=>{if(w.isNew){S.customers[w.id]={id:w.id,...w.body};delete S.cgDirty[w.old];S.cgNew=S.cgNew.filter(x=>x.id!==w.old)}else{S.customers[w.id]={...S.customers[w.id],...w.body};delete S.cgDirty[w.id]}})}
      catch(err){console.error(err);render();return toast('Save nahi hua: '+(err&&err.message||err))}}
    render();toast((writes.length?writes.length+' customers save':'Kuch save nahi hua')+(errs.length?' · '+errs.length+' galti (laal cells): '+errs[0]:''))},
  async cgDel(){const ids=[...S.cgSel].filter(id=>S.customers[id]);if(!ids.length)return toast('Sirf naye rows chune hain, unhe "Hatao" se hatao');
    const ok=await confirmBox({title:`${ids.length} customers delete karein?`,html:`<div class="small" style="color:var(--danger);margin-bottom:8px">Customer ki profile hat jayegi, wapas nahi aayegi. Pehle backup le lo.</div>`+ids.slice(0,12).map(id=>`<div class="chg">${esc(S.customers[id].name)} · ${esc(S.customers[id].boy||'')}</div>`).join('')+(ids.length>12?`<div class="small muted">+ ${ids.length-12} aur</div>`:''),yes:'Haan, delete',danger:true});if(!ok)return;
    try{for(let i=0;i<ids.length;i+=400){const b=S.db.batch();ids.slice(i,i+400).forEach(id=>b.delete(S.db.doc('customers/'+id)));await b.commit()}ids.forEach(id=>{delete S.customers[id];S.cgSel.delete(id);delete S.cgDirty[id]});render();toast(ids.length+' customers delete')}catch(err){toast('Delete nahi hua: '+(err&&err.message||err))}},
  async cgXlsx(){let XL;try{XL=await loadXLSX()}catch(e){return toast(e.message)}const {list}=cgList();const sel=[...S.cgSel].filter(id=>S.customers[id]);const cs=sel.length?sel.map(id=>S.customers[id]):list;
    const rows=cs.map(c=>{const o=custToRow(c);o['Baki ₹']=Math.round(balanceUpto(c,null));o['Bottles']=bottleBal(c);o['ID (mat badlo)']=c.id;return o});
    const wb=XL.utils.book_new();const ws=XL.utils.json_to_sheet(rows);ws['!cols']=Object.keys(rows[0]||{a:1}).map(k=>({wch:/Address|comment|Map|Note/.test(k)?30:k.startsWith('Naam')?24:12}));XL.utils.book_append_sheet(wb,ws,'Customers');
    saveFile(`oritic-customers-${todayISO()}.xlsx`,new Blob([XL.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))}
});

/* ================= Excel import (customers, sirf owner) ================= */
const IMP_COLS=[['name','Naam*'],['boy','Delivery Boy*'],['schedule','Schedule*'],['phone','Mobile'],['wdays','Custom ke din'],['status','Status'],
  ['order.cow','Cow L'],['order.buffalo','Buffalo L'],['order.desi','Gir Cow L'],['order.chaach','Chaach L'],
  ['rates.cow','Cow rate'],['rates.buffalo','Buffalo rate'],['rates.desi','Gir Cow rate'],['rates.chaach','Chaach rate'],
  ['area','Area'],['address','Address'],['house','Makan'],['landmark','Landmark'],['map','Map link'],['notes','Fix comment'],['note2','Note'],['since','Customer kab se']];
const IMP_ALIAS={naam:'name',name:'name',customer:'name',customername:'name',deliveryboy:'boy',boy:'boy',partner:'boy',deliverypartner:'boy',schedule:'schedule',frequency:'schedule',mobile:'phone',phone:'phone',mobileno:'phone',mobilenumber:'phone',number:'phone',customkedin:'wdays',days:'wdays',din:'wdays',status:'status',
  cowl:'order.cow',cow:'order.cow',buffalol:'order.buffalo',buffalo:'order.buffalo',gircowl:'order.desi',gircow:'order.desi',desi:'order.desi',gir:'order.desi',chaachl:'order.chaach',chaach:'order.chaach',
  cowrate:'rates.cow',buffalorate:'rates.buffalo',gircowrate:'rates.desi',desirate:'rates.desi',chaachrate:'rates.chaach',area:'area',address:'address',makan:'house',house:'house',flat:'house',landmark:'landmark',maplink:'map',map:'map',location:'map',
  fixcomment:'notes',fixcomments:'notes',notes:'notes',note:'note2',customerkabse:'since',since:'since',startdate:'since'};
const WD={sun:0,ravi:0,rav:0,mon:1,som:1,tue:2,man:2,wed:3,bud:3,thu:4,gur:4,fri:5,shu:5,sat:6,sha:6};
function custToRow(c){const o=orderOf(c),r=ratesOf(c);return {'Naam*':c.name,'Delivery Boy*':c.boy||'','Schedule*':c.schedule==='alternate'?'Alternate':c.schedule==='custom'?'Custom':'Roz','Mobile':c.phone||'','Custom ke din':(c.wdays||[]).map(w=>DOW[w]).join(', '),'Status':c.status==='active'?'Active':'Paused',
  'Cow L':o.cow,'Buffalo L':o.buffalo,'Gir Cow L':o.desi,'Chaach L':o.chaach,'Cow rate':r.cow,'Buffalo rate':r.buffalo,'Gir Cow rate':r.desi,'Chaach rate':r.chaach,'Area':c.area||'','Address':c.address||'','Makan':c.house||'','Landmark':c.landmark||'','Map link':c.map||'','Fix comment':c.notes||'','Note':'','Customer kab se':custSince(c)||''}}
const isoOf=v=>{if(v instanceof Date&&!isNaN(v))return v.getFullYear()+'-'+String(v.getMonth()+1).padStart(2,'0')+'-'+String(v.getDate()).padStart(2,'0');const s=String(v||'').trim();if(!s)return '';let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(m)return m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0');m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);if(m){const y=m[3].length===2?'20'+m[3]:m[3];return y+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0')}return null};
function impValidate(raw){const boysL=boys();const rows=[];const unknownBoys=new Set();
  raw.forEach((src,i)=>{const d={};Object.keys(src).forEach(h=>{const k=IMP_ALIAS[norm(h)];if(k)d[k]=src[h]});
    const R={n:i+2,src,d,err:[],warn:[]};const name=String(d.name??'').trim();
    if(Object.values(d).every(v=>String(v??'').trim()===''))return;
    if(/\(example/i.test(name)){R.skip='Example row, chhod di';rows.push(R);return}
    if(!name)R.err.push('Naam khaali');
    const boyRaw=String(d.boy??'').trim();const boy=boysL.find(b=>norm(b)===norm(boyRaw));if(!boyRaw)R.err.push('Delivery Boy khaali');else if(!boy){R.err.push(`Boy "${boyRaw}" Settings ki list me nahi`);unknownBoys.add(boyRaw)}
    const sch=cgParse('schedule',d.schedule);if(!String(d.schedule??'').trim())R.err.push('Schedule khaali (Roz / Alternate / Custom)');else if(!['daily','alternate','custom'].includes(sch))R.err.push(`Schedule "${d.schedule}" samajh nahi aaya`);
    let wdays=[];if(sch==='custom'){const toks=String(d.wdays??'').toLowerCase().split(/[\s,\/;]+/).filter(Boolean);toks.forEach(t=>{const k=WD[t.slice(0,3)];if(k==null)R.err.push(`Din "${t}" samajh nahi aaya`);else if(!wdays.includes(k))wdays.push(k)});if(!toks.length)R.err.push('Custom ke din likho (jaise Mon, Wed, Fri)')}
    const phone=phoneOk(d.phone);if(phone===null)R.err.push('Mobile 10 digit ka nahi');
    const status=String(d.status??'').trim()?cgParse('status',d.status):'active';if(!['active','paused'].includes(status))R.err.push(`Status "${d.status}" samajh nahi aaya`);
    const order={},rates={};PRODUCTS.forEach(p=>{const v=String(d['order.'+p.k]??'').trim();const q=v===''?0:+v;if(!(q>=0))R.err.push((p.k==='desi'?'Gir Cow':p.sh)+' quantity minus / galat');else if(Math.round(q*2)!==q*2)R.err.push((p.k==='desi'?'Gir Cow':p.sh)+' quantity 0.5 ke step me nahi');order[p.k]=q||0;
      const rv=String(d['rates.'+p.k]??'').trim();if(rv!==''){if(!(+rv>=0))R.err.push((p.k==='desi'?'Gir Cow':p.sh)+' rate galat');else rates[p.k]=+rv}});
    const since=d.since!==undefined&&String(d.since).trim()!==''?isoOf(d.since):'';if(since===null)R.err.push('"Customer kab se" ki date samajh nahi aayi (2026-11-01 ya 01/11/2026)');
    if(name&&!phone&&Object.values(S.customers).some(c=>norm(c.name)===norm(name)))R.warn.push('Is naam ka customer pehle se hai');
    const txt=k=>String(d[k]??'').trim();
    R.phone=phone;R.body={name,phone:phone||'',boy:boy||boyRaw,schedule:sch,wdays,status,order,rates:{...Object.fromEntries(PRODUCTS.map(p=>[p.k,defRates()[p.k]])),...rates},area:txt('area'),address:txt('address'),house:txt('house'),landmark:txt('landmark'),
      map:(txt('map').match(/https?:\/\/\S+/)||[txt('map')])[0],notes:[txt('notes'),txt('note2')].filter(Boolean).join(' · '),since:since||todayISO(),createdAt:todayISO(),openingDue:0,bottles:0,xorder:[],src:'excel'};
    rows.push(R)});
  const byPhone={};rows.forEach(R=>{if(R.phone&&!R.skip)(byPhone[R.phone]=byPhone[R.phone]||[]).push(R.n)});
  const exist={};Object.values(S.customers).forEach(c=>{const p=cleanPhone(c.phone);if(p)exist[p]=c});
  rows.forEach(R=>{if(!R.phone||R.skip)return;const same=byPhone[R.phone];if(same.length>1)R.err.push(`Ye number file me ${same.length} baar hai (row ${same.join(', row ')})`);const ex=exist[R.phone];if(ex)R.err.push(`Ye number pehle se panel me "${ex.name}" ke naam pe hai`)});
  const seqBase={};let k=0;rows.forEach(R=>{if(R.err.length||R.skip)return;const b=R.body.boy;if(seqBase[b]==null)seqBase[b]=Object.values(S.customers).filter(x=>x.boy===b).reduce((m,x)=>Math.max(m,+x.seq||0),0);seqBase[b]+=10;R.body.seq=seqBase[b];R.id='c'+(R.phone||(uid()+(k++)))});
  return {rows,unknownBoys:[...unknownBoys]}}
function impDraw(){const I=S.imp;const body=$('#shBody');if(!body)return;
  if(!I||!I.rows){body.innerHTML=impIntro();return}
  const ok=I.rows.filter(r=>!r.err.length&&!r.skip),bad=I.rows.filter(r=>r.err.length),skip=I.rows.filter(r=>r.skip),warn=ok.filter(r=>r.warn.length);
  body.innerHTML=`<div class="stack">
   <div class="row sp wrap"><div><b>${esc(I.file)}</b><div class="small muted">${I.rows.length} rows padhe</div></div><label class="btn sm o" style="cursor:pointer">Dusri file<input type="file" accept=".xlsx,.xls,.csv" data-impfile hidden></label></div>
   <div class="imp-sum"><span class="badge g" style="font-size:14px;padding:6px 12px">${ok.length} naye</span><span class="badge ${bad.length?'r':'n'}" style="font-size:14px;padding:6px 12px">${bad.length} galat</span>${skip.length?`<span class="badge n" style="font-size:14px;padding:6px 12px">${skip.length} chhode</span>`:''}${warn.length?`<span class="badge y" style="font-size:14px;padding:6px 12px">${warn.length} dhyan dein</span>`:''}</div>
   ${I.unknownBoys.length?`<div class="banner">Ye boys Settings ki list me nahi hain: <b>${I.unknownBoys.map(esc).join(', ')}</b> <button class="btn xs p" data-act="impBoys">Settings me jod do</button></div>`:''}
   ${bad.length?`<div class="card" style="padding:0"><div class="row sp" style="padding:10px 12px"><h3 style="color:var(--danger)">Galat rows (pehle inhe theek karo)</h3><button class="btn xs o" data-act="impErrFile">Galat rows ki Excel</button></div><div class="scroll" style="max-height:260px"><table class="tbl compact imp-tbl"><thead><tr><th>Row</th><th>Naam</th><th>Mobile</th><th>Galti</th></tr></thead><tbody>
     ${bad.map(r=>`<tr><td>${r.n}</td><td>${esc(r.body?r.body.name:'')}</td><td>${esc(String(r.d.phone??''))}</td><td class="bad">${r.err.map(esc).join('<br>')}</td></tr>`).join('')}</tbody></table></div></div>`:''}
   <div class="card" style="padding:0"><div style="padding:10px 12px"><h3>Preview (sahi rows${ok.length>60?', pehli 60':''})</h3></div><div class="scroll" style="max-height:300px"><table class="tbl compact imp-tbl"><thead><tr><th>Row</th><th>Naam</th><th>Mobile</th><th>Boy</th><th>Schedule</th><th>Order</th><th>Area</th><th></th></tr></thead><tbody>
     ${ok.slice(0,60).map(r=>`<tr><td>${r.n}</td><td><b>${esc(r.body.name)}</b></td><td>${esc(r.body.phone||'—')}</td><td>${esc(r.body.boy)}</td><td>${esc(schedText(r.body).split(' (')[0])}</td><td>${qtyText(r.body.order)}</td><td>${esc(r.body.area)}</td><td class="small" style="color:var(--warn)">${r.warn.map(esc).join(', ')}</td></tr>`).join('')||'<tr><td colspan="8" class="muted">Koi sahi row nahi</td></tr>'}</tbody></table></div></div>
   <div class="small muted">Import me sirf customer ki details aati hain. Order history, baki aur bottles nahi aate. Import se pehle pura backup apne aap download hoga.</div>
   <div id="impProg"></div>
   <div class="row wrap"><button class="btn p" data-act="impRun" ${bad.length||!ok.length?'disabled':''}>${ok.length} customers import karo</button>${bad.length?'<span class="small" style="color:var(--danger);align-self:center">Galat rows theek karke file dobara chuno, tab import khulega</span>':''}</div></div>`}
const impIntro=()=>`<div class="stack"><div class="card"><h3>1. Template download karo</h3><div class="small muted" style="margin:4px 0 10px">Sahi columns wali Excel file, ek example row ke saath. Zaroori: Naam, Delivery Boy, Schedule. Mobile zaroori nahi.</div><button class="btn o" data-act="impTpl">Template download</button></div>
  <div class="card"><h3>2. Bhari hui file chuno</h3><div class="small muted" style="margin:4px 0 10px">.xlsx / .xls / .csv. Pehli sheet padhi jayegi. Upload ke baad preview me har row ka haal dikhega.</div><label class="btn p" style="cursor:pointer">Excel file chuno<input type="file" accept=".xlsx,.xls,.csv" data-impfile hidden></label></div>
  <div class="small muted">Boys ke naam Settings ki list se match hone chahiye (${boys().map(esc).join(', ')||'abhi list khali hai'}). Quantity 0.5 ke step me. Mobile 10 digit, ek number ek hi customer.</div></div>`;
document.addEventListener('change',async e=>{const el=e.target;if(!el.dataset||!('impfile' in el.dataset))return;const f=el.files[0];if(!f)return;
  let XL;try{XL=await loadXLSX()}catch(err){return toast(err.message)}
  try{const wb=XL.read(await f.arrayBuffer(),{type:'array',cellDates:true});const ws=wb.Sheets[wb.SheetNames[0]];const raw=XL.utils.sheet_to_json(ws,{defval:'',raw:true});
    if(!raw.length)return toast('File me koi row nahi mili');const v=impValidate(raw);S.imp={file:f.name,raw,...v};impDraw()}catch(err){console.error(err);toast('File padh nahi paaye: '+(err&&err.message||err))}});
Object.assign(A,{
  impOpen(){if(!isOwner())return toast('Sirf owner kar sakta hai');S.imp=null;openSheet('Excel se customers import','');$('#sheet .panel').classList.add('wide');impDraw()},
  async impTpl(){let XL;try{XL=await loadXLSX()}catch(e){return toast(e.message)}const wb=XL.utils.book_new();
    const ex={'Naam*':'Ramesh Sharma (example, ye row hata do)','Delivery Boy*':boys()[0]||'Sunil','Schedule*':'Roz','Mobile':'9876543210','Custom ke din':'','Status':'Active','Cow L':1,'Buffalo L':0,'Gir Cow L':0,'Chaach L':0,'Cow rate':'','Buffalo rate':'','Gir Cow rate':'','Chaach rate':'','Area':'Raja Park','Address':'Plot 12, Gali 3','Makan':'B-204, 2nd floor','Landmark':'Shiv mandir ke saamne','Map link':'','Fix comment':'Gate pe rakhna','Note':'','Customer kab se':todayISO()};
    const ws=XL.utils.json_to_sheet([ex],{header:IMP_COLS.map(c=>c[1])});ws['!cols']=IMP_COLS.map(c=>({wch:/Address|comment|Map|Naam/.test(c[1])?28:14}));XL.utils.book_append_sheet(wb,ws,'Customers');
    const help=[['Column','Kya likhna hai'],['Naam*','Zaroori'],['Delivery Boy*','Zaroori. Settings ki list se: '+(boys().join(', ')||'(list khali)')],['Schedule*','Roz / Alternate / Custom'],['Mobile','10 digit. Khaali chhod sakte ho. Ek number ek hi customer'],['Custom ke din','Sirf Custom ke liye: Mon, Wed, Fri (ya Som, Budh, Shukra)'],['Status','Active / Paused (khaali = Active)'],['Cow L … Chaach L','Roz kitne litre. 0.5 ke step me'],['… rate','₹ / litre. Khaali = default rate'],['Customer kab se','2026-11-01 ya 01/11/2026'],['',''],['Dhyan dein','Example row (jisme "(example" likha hai) apne aap chhod di jaati hai'],['','Order history, baki aur bottles import nahi hote']];
    const wh=XL.utils.aoa_to_sheet(help);wh['!cols']=[{wch:20},{wch:70}];XL.utils.book_append_sheet(wb,wh,'Help');
    saveFile('oritic-customers-template.xlsx',new Blob([XL.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))},
  async impErrFile(){const I=S.imp;if(!I)return;let XL;try{XL=await loadXLSX()}catch(e){return toast(e.message)}const bad=I.rows.filter(r=>r.err.length).map(r=>({...r.src,'Galti':r.err.join(' | '),'Row':r.n}));
    const wb=XL.utils.book_new();XL.utils.book_append_sheet(wb,XL.utils.json_to_sheet(bad),'Galat rows');saveFile('oritic-import-galat-rows.xlsx',new Blob([XL.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))},
  impBoys(){const I=S.imp;if(!I)return;const add=I.unknownBoys.filter(b=>!boys().some(x=>norm(x)===norm(b)));if(!add.length)return;
    saveSettings({...settings(),boys:[...boys(),...add]}).then(()=>{const v=impValidate(I.raw);S.imp={...I,...v};impDraw();toast(add.join(', ')+' Settings me jud gaye. PIN Settings me set karo')})},
  async impRun(){const I=S.imp;if(!I)return;if(!canWrite())return toast('Aapko write permission nahi hai');const ok=I.rows.filter(r=>!r.err.length&&!r.skip);if(!ok.length||I.rows.some(r=>r.err.length))return;
    const yes=await confirmBox({title:`${ok.length} naye customers import karein?`,html:'Pehle pura backup download hoga. Phir 400-400 ke batch me save honge.',yes:'Haan, import'});if(!yes)return;
    A.backup();const pg=$('#impProg');const btn=$('[data-act="impRun"]');if(btn)btn.disabled=true;let n=0;
    const show=()=>{if(pg)pg.innerHTML=`<div class="small" style="margin-bottom:6px">${n} / ${ok.length} save hue…</div><div class="pgbar"><i style="width:${Math.round(n/ok.length*100)}%"></i></div>`};show();
    try{for(let i=0;i<ok.length;i+=400){const chunk=ok.slice(i,i+400);const b=S.db.batch();chunk.forEach(r=>b.set(S.db.doc('customers/'+r.id),r.body));await b.commit();chunk.forEach(r=>S.customers[r.id]={id:r.id,...r.body});n+=chunk.length;show()}
      $('#shBody').innerHTML=`<div class="stack"><div class="empty"><b>Import ho gaya ✓</b>${n} customers bane. 0 chhoote.</div><button class="btn p" data-act="closeSheet">Band karo</button></div>`;render()}
    catch(err){console.error(err);if(pg)pg.innerHTML=`<div class="banner">${n} customers bane, baaki save nahi hue: ${esc(err&&err.message||String(err))}. Dobara file chuno, jo ban gaye wo "pehle se hai" dikhenge.</div>`;render()}}
});

/* ================= Payments: bulk entry ================= */
let acState=null;
function acClose(){const p=$('#acpop');if(p)p.remove();acState=null}
function acShow(inp,items,onPick){let p=$('#acpop');if(!p){p=document.createElement('div');p.id='acpop';p.className='acpop';document.body.appendChild(p)}
  const r=inp.getBoundingClientRect();p.style.left=Math.max(8,r.left)+'px';p.style.top=(r.bottom+4)+'px';p.style.width=Math.max(260,r.width)+'px';
  acState={inp,items,onPick,i:0};p.innerHTML=items.map((it,i)=>`<button type="button" data-aci="${i}" class="${i===0?'on':''}"><span>${it.h}</span><span class="muted">${it.r||''}</span></button>`).join('')||'<div class="small muted" style="padding:10px">Nahi mila</div>'}
document.addEventListener('mousedown',e=>{const b=e.target.closest&&e.target.closest('#acpop [data-aci]');if(b&&acState){e.preventDefault();const s=acState;acClose();s.onPick(s.items[+b.dataset.aci])}else if(!(e.target.closest&&e.target.closest('#acpop')))acClose()});
function custMatches(q,n){q=q.trim().toLowerCase();const all=Object.values(S.customers);if(!q)return [];
  const sc=c=>{const nm=c.name.toLowerCase();return nm.startsWith(q)?0:nm.split(/\s+/).some(w=>w.startsWith(q))?1:(c.phone||'').includes(q)?2:(nm+' '+(c.area||'')).includes(q)?3:9};
  return all.map(c=>[sc(c),c]).filter(x=>x[0]<9).sort((a,b)=>a[0]-b[0]||a[1].name.localeCompare(b[1].name)).slice(0,n||12).map(x=>x[1])}
const bpBal=c=>{const b=balanceUpto(c,null);return `<span style="color:${b>0.5?'var(--danger)':'var(--accent)'};font-weight:700">${inr(b)}</span>`};
function bpRowHtml(r,i){const c=r.cid&&S.customers[r.cid];const e=S.bpErr[i]||{};
  return `<tr data-bpr="${i}"><td class="small muted">${i+1}</td>
   <td class="${e.c?'err':''}"><input data-bp="${i}" data-f="q" value="${esc(c?c.name:r.q)}" placeholder="Naam / phone likho" autocomplete="off"></td>
   <td class="bal" id="bpb_${i}">${c?bpBal(c)+`<div class="small muted">${esc(c.area||'')} · ${esc(c.boy||'')}</div>`:''}</td>
   <td class="${e.a?'err':''}"><input data-bp="${i}" data-f="amt" type="number" inputmode="decimal" min="0" value="${esc(r.amt)}" placeholder="₹"></td>
   <td><select data-bp="${i}" data-f="mode"><option value="cash" ${r.mode==='cash'?'selected':''}>Cash</option><option value="online" ${r.mode!=='cash'?'selected':''}>Online / UPI</option></select></td>
   <td><input data-bp="${i}" data-f="date" type="date" max="${todayISO()}" value="${esc(r.date)}"></td>
   <td><input data-bp="${i}" data-f="note" value="${esc(r.note)}" placeholder="optional"></td>
   <td><button class="btn xs o" data-act="bpDel" data-i="${i}" aria-label="Line hatao">×</button></td></tr>`}
function bpTot(){const v=S.bp.filter(r=>r.cid&&+r.amt>0);const cash=sum(v.filter(r=>r.mode==='cash'),r=>r.amt),on=sum(v.filter(r=>r.mode!=='cash'),r=>r.amt);return `<b>${v.length}</b> payments · Cash <b>${inr(cash)}</b> · Online <b>${inr(on)}</b> · Total <b>${inr(cash+on)}</b>`}
function bpCard(){return `<details class="card" ${ls.get('oritic.bpOpen','1')==='1'?'open':''} data-bpcard><summary class="row sp wrap"><h3>Bulk payment entry</h3><span class="small muted">Kai payments ek saath · Naam likho → <span class="kbd">Enter</span> → amount → <span class="kbd">Enter</span> agli line · <span class="kbd">Ctrl</span>+<span class="kbd">S</span> save</span></summary>
  <div class="scroll" style="margin-top:8px"><table class="bpt"><thead><tr><th>#</th><th style="min-width:220px">Customer</th><th>Baki</th><th style="width:110px">Amount ₹</th><th style="width:130px">Mode</th><th style="width:150px">Date</th><th>Note</th><th></th></tr></thead><tbody id="bpBody">${S.bp.map(bpRowHtml).join('')}</tbody></table></div>
  <div class="row sp wrap" style="margin-top:10px"><div class="small" id="bpTot">${bpTot()}</div><div class="row"><button class="btn sm o" data-act="bpAdd">+ 5 line</button><button class="btn sm o" data-act="bpClear">Saaf karo</button><button class="btn p" data-act="bpSave">Sab save karo</button></div></div></details>`}
document.addEventListener('toggle',e=>{if(e.target.dataset&&'bpcard' in e.target.dataset)ls.set('oritic.bpOpen',e.target.open?'1':'0')},true);
const _vPay=vPayments;
vPayments=function(){const o=_vPay();if(!isOwner())return o;return {...o,html:o.html.replace('<div class="stack">','<div class="stack">'+bpCard())}};
function bpPick(i,c){const r=S.bp[i];r.cid=c.id;r.q=c.name;delete (S.bpErr[i]||{}).c;const inp=$(`[data-bp="${i}"][data-f="q"]`);if(inp){inp.value=c.name;inp.closest('td').classList.remove('err')}
  const b=$('#bpb_'+i);if(b)b.innerHTML=bpBal(c)+`<div class="small muted">${esc(c.area||'')} · ${esc(c.boy||'')}</div>`;const a=$(`[data-bp="${i}"][data-f="amt"]`);if(a){a.placeholder=balanceUpto(c,null)>0?'Baki '+inr(balanceUpto(c,null)):'₹';a.focus();a.select()}const t=$('#bpTot');if(t)t.innerHTML=bpTot()}
document.addEventListener('input',e=>{const el=e.target;if(!el.dataset||el.dataset.bp==null)return;const i=+el.dataset.bp,f=el.dataset.f,r=S.bp[i];if(!r)return;
  if(f==='q'){r.q=el.value;if(r.cid&&S.customers[r.cid]&&S.customers[r.cid].name!==el.value){r.cid='';const b=$('#bpb_'+i);if(b)b.innerHTML=''}
    acShow(el,custMatches(el.value).map(c=>({c,h:esc(c.name),r:esc((c.area||'')+' · '+(c.boy||'')+' · baki '+inr(balanceUpto(c,null)))})),it=>bpPick(i,it.c))}
  else r[f]=el.value;const t=$('#bpTot');if(t)t.innerHTML=bpTot()});
document.addEventListener('change',e=>{const el=e.target;if(el.dataset&&el.dataset.bp!=null&&el.tagName==='SELECT'){S.bp[+el.dataset.bp].mode=el.value;const t=$('#bpTot');if(t)t.innerHTML=bpTot()}});
document.addEventListener('keydown',e=>{const el=e.target;
  if(acState&&el===acState.inp){const p=$('#acpop');const bs=p?[...p.querySelectorAll('[data-aci]')]:[];
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();acState.i=Math.max(0,Math.min(bs.length-1,acState.i+(e.key==='ArrowDown'?1:-1)));bs.forEach((b,j)=>b.classList.toggle('on',j===acState.i));if(bs[acState.i])bs[acState.i].scrollIntoView({block:'nearest'});return}
    if(e.key==='Enter'&&acState.items.length){e.preventDefault();e.stopPropagation();const s=acState;acClose();s.onPick(s.items[s.i]);return}
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();acClose();return}}
  if(!el.dataset||el.dataset.bp==null)return;
  if(e.key==='Enter'&&el.dataset.f!=='q'){e.preventDefault();const i=+el.dataset.bp;if(i+1>=S.bp.length){for(let k=0;k<5;k++)S.bp.push(bpBlank());render()}setTimeout(()=>{const n=$(`[data-bp="${i+1}"][data-f="q"]`);if(n){n.focus();n.select()}},20)}},true);
Object.assign(A,{
  payFull(d){const a=$('#payAmt');if(a){a.value=d.v;a.focus()}},
  bpAdd(){for(let k=0;k<5;k++)S.bp.push(bpBlank());render()},
  bpDel(d){S.bp.splice(+d.i,1);if(!S.bp.length)S.bp.push(bpBlank());S.bpErr={};render()},
  bpClear(){S.bp=[];for(let k=0;k<5;k++)S.bp.push(bpBlank());S.bpErr={};render()},
  async bpSave(){if(!canWrite())return toast('Aapko write permission nahi hai');S.bpErr={};let bad=0;
    S.bp.forEach((r,i)=>{const filled=String(r.q).trim()||String(r.amt).trim();if(!filled)return;const e={};if(!r.cid||!S.customers[r.cid])e.c=1;if(!(+r.amt>0))e.a=1;if(e.c||e.a){S.bpErr[i]=e;bad++}});
    if(bad){render();return toast(bad+' line me customer ya amount sahi nahi (laal)')}
    const v=S.bp.filter(r=>r.cid&&+r.amt>0);if(!v.length)return toast('Koi payment nahi likha');
    const tot=sum(v,r=>r.amt);
    const ok=await confirmBox({title:`${v.length} payments · ${inr(tot)} save karein?`,html:v.slice(0,20).map(r=>`<div class="chg"><b>${esc(S.customers[r.cid].name)}</b> · ${inr(+r.amt)} · ${r.mode==='cash'?'Cash':'Online'} · ${fmtShort(r.date||todayISO())}${r.note?' · '+esc(r.note):''}</div>`).join('')+(v.length>20?`<div class="small muted">+ ${v.length-20} aur</div>`:''),yes:'Haan, save'});if(!ok)return;
    S.bp=[];for(let k=0;k<5;k++)S.bp.push(bpBlank());
    for(const r of v)await savePayment({id:uid(),cid:r.cid,amt:+r.amt,mode:r.mode,date:r.date||todayISO(),note:String(r.note||'').trim(),by:S.me||'',t:Date.now(),proof:false});
    render();toast(v.length+' payments save · '+inr(tot))}
});

/* ================= Bills: WhatsApp queue + xlsx ================= */
const waKey=()=>'oritic.wa.'+S.month+'.'+S.period;
const waSent=()=>{try{return new Set(JSON.parse(ls.get(waKey(),'[]')))}catch(_){return new Set()}};
const waMark=id=>{const s=waSent();s.add(id);ls.set(waKey(),JSON.stringify([...s]))};
function billsList(){const q=S.bq.trim().toLowerCase();return Object.values(S.customers).filter(c=>(S.bboy==='all'||c.boy===S.bboy)&&(!q||(c.name+' '+c.phone+' '+(c.area||'')).toLowerCase().includes(q))).map(c=>billFor(c,S.month,S.period)).filter(b=>b.rows.length||Math.abs(b.closing)>0.5||b.paid).sort((a,b)=>b.closing-a.closing)}
const waUrl=b=>`https://wa.me/91${cleanPhone(b.c.phone)}?text=${encodeURIComponent(billText(b))}`;
function drawWa(){const sent=waSent();const L2=billsList().filter(b=>b.c.phone&&(S.waAll||b.closing>0.5));const left=L2.filter(b=>!sent.has(b.c.id)).length;
  openSheet('WhatsApp bill queue',`<div class="stack"><div class="row sp wrap"><div class="small"><b>${L2.length-left}/${L2.length}</b> bheje · ${fmtMonth(S.month)} · ${S.period==='full'?'Pura mahina':S.period==='h1'?'1–15':'16–'+dim(S.month)}</div>
    <label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-waall ${S.waAll?'checked':''}> jinka baki 0 hai unhe bhi</label></div>
    <button class="btn p block" data-act="waNext" ${left?'':'disabled'}>${left?`Agla bill bhejo (${left} baaki)`:'Sab bhej diye ✓'}</button>
    <div class="list">${L2.map(b=>{const s=sent.has(b.c.id);return `<div class="item ${s?'wasent':''}"><div class="grow"><div class="t">${esc(b.c.name)}</div><div class="s">${esc(b.c.boy||'')} · Bill ${inr(b.amount)} · Baki ${inr(b.closing)}</div></div><a class="btn sm ${s?'o':'p'}" href="${waUrl(b)}" target="_blank" rel="noopener" data-wa="${b.c.id}">${s?'✓ Bheja':'Bhejo'}</a></div>`}).join('')||emptyBox('Kisi ka bill bhejna baaki nahi','<span class="small">Phone number wale customers hi yahan aate hain.</span>')}</div>
    <div class="small muted">WhatsApp har baar naya tab kholta hai. Message bhej ke is tab pe wapas aao aur "Agla" dabao. Kaun bheja gaya, ye isi computer pe yaad rehta hai.</div></div>`)}
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[data-wa]');if(a){waMark(a.dataset.wa);setTimeout(drawWa,300)}const w=e.target.closest&&e.target.closest('[data-waall]');if(w){S.waAll=w.checked;drawWa()}});
const _vBills=vBills;
vBills=function(){const o=_vBills();if(!isOwner())return o;const bar=`<div class="row wrap"><button class="btn o" data-act="waQueue">${ICONS.wa} WhatsApp queue</button><button class="btn o" data-act="billsXlsx">Excel (.xlsx)</button></div>`;return {...o,html:o.html.replace('<div class="stack">','<div class="stack">'+bar)}};
Object.assign(A,{
  waQueue(){drawWa()},
  waNext(){const sent=waSent();const b=billsList().find(b=>b.c.phone&&(S.waAll||b.closing>0.5)&&!sent.has(b.c.id));if(!b)return;waMark(b.c.id);window.open(waUrl(b),'_blank','noopener');drawWa()},
  async billsXlsx(){let XL;try{XL=await loadXLSX()}catch(e){return toast(e.message)}const [from,to]=periodRange(S.month,S.period);
    const rows=billsList().map(b=>({'Naam':b.c.name,'Mobile':b.c.phone||'','Area':b.c.area||'','Boy':b.c.boy||'','Din':b.rows.length,...Object.fromEntries(PRODUCTS.map(p=>{const l=b.lines.find(x=>x.k===p.k);return [(p.k==='desi'?'Gir Cow':p.sh)+' L',l?l.l:0]})),'Extras ₹':b.extras,'Bill ₹':Math.round(b.amount),'Pichla baki ₹':Math.round(b.prev),'Jama ₹':Math.round(b.paid),'Kul baki ₹':Math.round(b.closing)}));
    const wb=XL.utils.book_new();const ws=XL.utils.json_to_sheet(rows);ws['!cols']=Object.keys(rows[0]||{a:1}).map(k=>({wch:k==='Naam'?24:12}));XL.utils.book_append_sheet(wb,ws,'Bills');
    saveFile(`oritic-bills-${from}-to-${to}.xlsx`,new Blob([XL.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))}
});

/* ================= Settings: office tools, data, audit ================= */
const _vSet=vSettings;
vSettings=function(){const o=_vSet();if(!isOwner())return o;const rt=settings().rates||{};const ch=cutoffHour();const lc=window.OriticLocal?OriticLocal.counts():null;
  const extra=`<div class="stack" style="margin-top:12px">
   <div class="card"><h3>Office tools</h3><div class="grid g3" style="margin-top:8px">
     <div class="field"><label class="f">"Aaj ki date" kab badle</label><select class="input" id="st2Cut">${Array.from({length:13},(_,h)=>`<option value="${h}" ${h===ch?'selected':''}>${h===0?'Raat 12 baje (normal)':'Subah '+h+' baje ke baad'}</option>`).join('')}</select><div class="small muted" style="margin-top:4px">Is time ke baad Delivery sheet agli date pe khulti hai.</div></div>
     <div class="field"><label class="f">Paneer rate (₹ / kg)</label><input class="input" id="st2Pn" type="number" inputmode="decimal" value="${esc(rt.paneer??'')}" placeholder="e.g. 420"></div>
     <div class="field"><label class="f">Ghee rate (₹ / kg)</label><input class="input" id="st2Gh" type="number" inputmode="decimal" value="${esc(rt.ghee??'')}" placeholder="e.g. 680"></div></div>
     <button class="btn p" style="margin-top:10px" data-act="st2Save">Save</button></div>
   <div class="card"><h3>Database</h3><div class="small" style="margin:6px 0 10px">${window.ORITIC_MODE==='local'?`<b>Local mode</b>: data sirf is browser me hai (${lc?Object.entries(lc).map(([k,v])=>v+' '+k).join(' · ')||'khaali':''}). Doosre phone/PC ko nahi dikhega.`:`<b>Firebase mode</b>: project <code>${esc((window.FIREBASE_CONFIG||{}).projectId||'')}</code>. Sab phones ko live dikhta hai.`}</div>
     <div class="row wrap"><button class="btn o" data-act="backupAll">Pura backup (sab data)</button><label class="btn o" style="cursor:pointer">Backup se wapas laao<input type="file" accept=".json,application/json" data-restore hidden></label><button class="btn o" data-act="auditView">Pichli date ke badlav (record)</button>
     ${window.ORITIC_MODE==='local'?`<button class="btn o" data-act="demoLoad">Demo data daalo</button><button class="btn d" data-act="localWipe">Local data mitao</button>`:''}</div>
     <div class="small muted" style="margin-top:8px">Pura backup me customers, delivery days, payments, settings, purchases, KM aur badlav ka record aata hai. Meter photos aur payment screenshots nahi aate.</div></div></div>`;
  return {...o,html:o.html+extra}};
async function collAll(name){if(!S.db)return {};const s=await S.db.collection(name).get();const m={};s.docs.forEach(d=>m[d.id]=d.data());return m}
document.addEventListener('change',async e=>{const el=e.target;if(!el.dataset||!('restore' in el.dataset))return;const f=el.files[0];el.value='';if(!f)return;
  let j;try{j=JSON.parse(await f.text())}catch(_){return toast('Ye JSON backup file nahi hai')}
  const cols=['customers','days','payments','purchases','kms','audit'].filter(k=>j[k]&&typeof j[k]==='object');const n=cols.reduce((a,k)=>a+Object.keys(j[k]).length,0)+(j.settings?1:0);if(!n)return toast('Backup me kuch nahi mila');
  const ok=await confirmBox({title:'Backup se data wapas laayein?',html:`${cols.map(k=>Object.keys(j[k]).length+' '+k).join(' · ')}${j.settings?' · settings':''}<div class="small" style="color:var(--danger);margin-top:8px">${window.ORITIC_MODE==='local'?'Is browser ke data me':'<b>Firebase database</b> me'} same ID wali entries is file se badal jayengi. Pehle abhi ka backup le lo.</div>`,yes:'Haan, wapas laao',danger:window.ORITIC_MODE!=='local'});if(!ok)return;
  try{const W=[];if(j.settings)W.push(['settings/main',j.settings]);cols.forEach(k=>Object.entries(j[k]).forEach(([id,v])=>{const b={...v};delete b.id;W.push([k+'/'+id,b])}));
    for(let i=0;i<W.length;i+=400){const b=S.db.batch();W.slice(i,i+400).forEach(([p,v])=>b.set(S.db.doc(p),v));await b.commit()}toast(W.length+' entries wapas aa gayi');if(window.ORITIC_MODE==='local')setTimeout(()=>location.reload(),800)}catch(err){toast('Restore fail: '+(err&&err.message||err))}});
Object.assign(A,{
  st2Save(){if(!isOwner())return;const cut=+$('#st2Cut').value;const pn=$('#st2Pn').value,gh=$('#st2Gh').value;
    saveSettings({...settings(),dayCutoff:cut,rates:{...(settings().rates||{}),paneer:+pn||0,ghee:+gh||0}}).then(()=>toast('Saved'))},
  async backupAll(){const data={exportedAt:new Date().toISOString(),mode:window.ORITIC_MODE,customers:S.customers,days:S.days,payments:S.payments,settings:S.settings,purchases:S.purchases,kms:S.kms,audit:await collAll('audit').catch(()=>({}))};
    saveFile(`oritic-full-backup-${todayISO()}.json`,new Blob([JSON.stringify(data)],{type:'application/json'}))},
  async auditView(){openSheet('Pichli date ke badlav','<div class="empty">Load ho raha hai…</div>');let m;try{m=await collAll('audit')}catch(e){$('#shBody').innerHTML='<div class="empty">Load nahi hua</div>';return}
    const list=Object.values(m).sort((a,b)=>(b.t||0)-(a.t||0)).slice(0,300);
    $('#shBody').innerHTML=`<div class="stack"><div class="small muted">Delivery sheet me pichli date pe kiya gaya har badlav: kisne, kab, pehle kya tha, ab kya hai. (Sabse naye upar, max 300)</div>
     <div class="list">${list.map(a=>{const c={name:a.name};const tx=diffText(c,a.before&&{...a.before,x:a.before.x||[]},a.after&&{...a.after,x:a.after.x||[]}).replace(/^<div class="chg">|<\/div>$/g,'');return `<div class="item"><div class="grow"><div class="t" style="white-space:normal">${tx||esc(a.name)}</div><div class="s">${fmtDate(a.date)} ki entry · ${esc(a.by||'')} · ${new Date(a.t).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}</div></div></div>`}).join('')||emptyBox('Abhi koi record nahi')}</div></div>`},
  async localWipe(){if(!window.OriticLocal)return;const ok=await confirmBox({title:'Is browser ka sara local data mitayein?',html:'Customers, deliveries, payments, settings sab hat jayenge. Pehle "Pura backup" le lo. Live database pe koi asar nahi.',yes:'Haan, mitao',danger:true});if(!ok)return;
    await OriticLocal.wipe();try{localStorage.removeItem('oritic.login')}catch(_){}location.reload()},
  async demoLoad(){if(window.ORITIC_MODE!=='local')return toast('Demo data sirf local mode me');if(Object.keys(S.customers).length){const ok=await confirmBox({title:'Demo data jodein?',html:'Abhi ke data ke saath 30 demo customers, 6 din ki deliveries aur kuch payments jud jayenge.',yes:'Haan, jodo'});if(!ok)return}
    await demoLoad();toast('Demo data aa gaya. Owner PIN 1234');setTimeout(()=>location.reload(),600)}
});
async function demoLoad(){let seed=42;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const boysL=['Sunil','Anil','Nitu'];const areas=['Raja Park','Malviya Nagar','C-Scheme','Vaishali Nagar','Mansarovar','Tilak Nagar'];
  const st={...(settings()||{}),company:'Oritic (Demo)',boys:boysL,pins:{owner:'1234',boys:{Sunil:'1111',Anil:'2222',Nitu:'3333'}},rates:{...DEF_RATES,paneer:420,ghee:680},dayCutoff:9,upi:'demo@upi',billNote:'Dhanyavaad 🙏',autoExport:false,
    products:[{id:'pPaneer',n:'Paneer',u:'kg',a:420,on:true},{id:'pGhee',n:'Ghee',u:'kg',a:680,on:true},{id:'pDahi',n:'Dahi 400g',u:'pc',a:45,on:true},{id:'pPan200',n:'Paneer 200g',u:'pc',a:90,on:true},{id:'pButter',n:'Butter 100g',u:'pc',a:60,on:true}]};
  const custs={};for(let i=1;i<=30;i++){const id='cdemo'+String(i).padStart(2,'0');const sch=i%9===0?'alternate':i===14?'custom':'daily';const since=addDays(todayISO(),-40-i);
    custs[id]={name:'Demo Customer '+String(i).padStart(2,'0'),phone:'90000000'+String(i).padStart(2,'0'),boy:boysL[(i-1)%3],area:areas[i%areas.length],address:'Plot '+(10+i)+', Gali '+(1+i%5),house:i%4===0?'Flat B-'+(100+i):'',landmark:i%3===0?'Mandir ke saamne':'',map:'',
      schedule:sch,wdays:sch==='custom'?[1,3,5]:[],status:i===27?'paused':'active',order:{cow:i%2?1:0,buffalo:i%2?0:(i%5===0?1.5:1),desi:i%7===0?0.5:0,chaach:i%6===0?0.5:0},rates:{...DEF_RATES},notes:i%5===0?'Gate pe rakhna':'',openingDue:i%8===0?250:0,bottles:0,since,createdAt:since,seq:Math.ceil(i/3)*10,xorder:i%10===0?[{n:'Dahi 400g',pid:'pDahi',qty:1}]:[]}}
  const days={};const pays={};
  for(let k=6;k>=1;k--){const d=addDays(todayISO(),-k);const rows={};
    Object.entries(custs).forEach(([id,c])=>{if(c.status!=='active')return;const cc={id,...c};
      if(c.schedule==='custom'&&!c.wdays.includes(new Date(d+'T12:00:00').getDay()))return;
      if(c.schedule==='alternate'){const y=days[addDays(d,-1)];if(y&&y.rows[id]&&y.rows[id].s==='d')return}
      const skip=rnd()<0.06;const q={...c.order};const x=(c.xorder||[]).map(e=>({n:e.n,base:e.n,pid:e.pid,qty:e.qty,rate:45,a:45*e.qty,so:1}));
      const row=makeRow(cc,skip?'k':'d',skip?null:q,skip?[]:x,'',c.boy);row.pl=1;if(!skip&&rnd()<0.35){const o=bottlesOf(q);row.brS=o.s;row.brB=o.b;row.br=o.s+o.b}rows[id]=row});
    days[d]={date:d,rows}}
  Object.keys(custs).forEach((id,i)=>{if(i%3)return;const amt=Math.round(200+rnd()*600);pays['pdemo'+i]={cid:id,amt,mode:i%2?'cash':'online',date:addDays(todayISO(),-(1+i%5)),note:'',by:'Owner',t:Date.now()-i*1000,proof:false}});
  const W=[['settings/main',st],...Object.entries(custs).map(([id,c])=>['customers/'+id,c]),...Object.entries(days).map(([id,d])=>['days/'+id,d]),...Object.entries(pays).map(([id,p])=>['payments/'+id,p])];
  const b=S.db.batch();W.forEach(([p,v])=>b.set(S.db.doc(p),v));await b.commit()}

/* ================= Ctrl+K search + keyboard shortcuts ================= */
const KP_ACTIONS=()=>[
  {g:'Kaam',t:'Naya customer',k:'n',run:()=>A.editCustomer({}),own:1},{g:'Kaam',t:'Payment lo',k:'p',run:()=>A.addPayment({})},
  {g:'Kaam',t:'Bulk payment entry',run:()=>{A.go({r:'payments'});setTimeout(()=>{const i=$('[data-bp="0"][data-f="q"]');if(i)i.focus()},60)},own:1},
  {g:'Kaam',t:'Excel se customers import',run:()=>{A.go({r:'customers'});A.impOpen()},own:1},
  {g:'Kaam',t:'Customers Excel export',run:()=>A.cgXlsx(),own:1},
  {g:'Kaam',t:'WhatsApp bill queue',run:()=>{A.go({r:'bills'});A.waQueue()},own:1},
  {g:'Kaam',t:'Excel backup (Delivery sheet ki date)',run:()=>A.xlsx({d:S.pld}),own:1},
  {g:'Kaam',t:'Pura backup download',run:()=>A.backupAll(),own:1},
  {g:'Kaam',t:'Keyboard shortcuts',k:'?',run:()=>sheetKeys()}];
function kpItems(q){const out=[];const s=q.trim().toLowerCase();const m=t=>!s||t.toLowerCase().includes(s);
  const R=isOwner()?ROUTES:visibleRoutes();R.forEach(r=>{if(m(r.t+' '+r.l))out.push({g:'Page',t:r.t,s:r.l,run:()=>A.go({r:r.id})})});
  KP_ACTIONS().filter(a=>(!a.own||isOwner())&&m(a.t)).forEach(a=>out.push(a));
  if(s)custMatches(s,25).forEach(c=>out.push({g:'Customer',t:c.name,s:[c.area,c.boy,c.phone,'baki '+inr(balanceUpto(c,null))].filter(Boolean).join(' · '),run:()=>A.openCustomer({id:c.id}),bill:()=>A.openBill({id:c.id}),pay:()=>A.addPayment({id:c.id})}));
  const order={Customer:0,Page:1,Kaam:2};return s?out.sort((a,b)=>order[a.g]-order[b.g]):out}
function kpDraw(){const el=$('#kp');if(!el||el.hidden)return;const q=$('#kpq').value;const it=kpItems(q);S.kpIt=it;S.kpI=Math.min(S.kpI||0,Math.max(0,it.length-1));
  $('#kpl').innerHTML=it.map((x,i)=>`<button class="kp-it ${i===S.kpI?'on':''}" data-kpi="${i}"><span class="g">${x.g}</span><span class="grow" style="min-width:0"><div class="t">${esc(x.t)}</div>${x.s?`<div class="s">${esc(x.s)}</div>`:''}</span>${x.k?`<span class="kbd">${x.k}</span>`:''}</button>`).join('')||'<div class="empty small">Kuch nahi mila</div>';
  const on=$('#kpl .kp-it.on');if(on)on.scrollIntoView({block:'nearest'})}
function kpOpen(){let el=$('#kp');if(!el){el=document.createElement('div');el.id='kp';document.body.appendChild(el)}
  el.innerHTML=`<div class="kp-panel" role="dialog" aria-modal="true" aria-label="Dhoondo"><input id="kpq" placeholder="Customer ka naam / phone, page ya kaam…" autocomplete="off"><div class="kp-list" id="kpl"></div>
   <div class="kp-foot"><span><span class="kbd">↑</span><span class="kbd">↓</span> chuno</span><span><span class="kbd">Enter</span> kholo</span><span><span class="kbd">Shift</span>+<span class="kbd">Enter</span> bill</span><span><span class="kbd">Alt</span>+<span class="kbd">Enter</span> payment</span><span><span class="kbd">Esc</span> band</span></div></div>`;
  el.hidden=false;S.kpI=0;kpDraw();setTimeout(()=>{const i=$('#kpq');if(i)i.focus()},20)}
function kpClose(){const el=$('#kp');if(el){el.hidden=true;el.innerHTML=''}}
function kpRun(i,mod){const x=(S.kpIt||[])[i];if(!x)return;kpClose();if(mod==='bill'&&x.bill)x.bill();else if(mod==='pay'&&x.pay)x.pay();else x.run()}
document.addEventListener('input',e=>{if(e.target.id==='kpq'){S.kpI=0;kpDraw()}});
document.addEventListener('click',e=>{const k=$('#kp');if(!k||k.hidden)return;const b=e.target.closest('[data-kpi]');if(b)kpRun(+b.dataset.kpi);else if(e.target===k)kpClose()});
function sheetKeys(){const K=(k,t)=>`<div class="row sp" style="padding:6px 0;border-bottom:1px solid var(--line2)"><span>${t}</span><span>${k}</span></div>`;const kb=s=>s.split(' ').map(x=>`<span class="kbd">${x}</span>`).join(' ');
  openSheet('Keyboard shortcuts',`<div class="stack"><div><h3>Kahin bhi</h3>${K(kb('Ctrl K'),'Customer / page / kaam dhoondo')}${K(kb('/'),'Search box pe jao')}${K(kb('?'),'Ye list')}${K(kb('g d'),'Delivery sheet')}${K(kb('g c'),'Customers')}${K(kb('g p'),'Payments')}${K(kb('g b'),'Bills')}${K(kb('g h'),'Dashboard')}${K(kb('g s'),'Settings')}${K(kb('p'),'Payment lo')}${K(kb('n'),'Naya customer (Customers page)')}${K(kb('Esc'),'Popup band')}</div>
   <div><h3>Delivery sheet</h3>${K(kb('Enter')+' / '+kb('↓'),'Agla customer, same product')}${K(kb('Tab'),'Agla product')}${K(kb('Ctrl Enter'),'Row confirm, phir agla customer')}${K(kb('[')+' '+kb(']'),'Pichla / agla din')}${K(kb('Shift')+' + click','Kai rows ek saath chuno')}</div>
   <div><h3>Customers grid</h3>${K(kb('Enter')+' / '+kb('↑')+' '+kb('↓'),'Upar / neeche cell')}${K(kb('←')+' '+kb('→'),'Line ke shuru/aakhir pe agla cell')}${K(kb('Ctrl S'),'Save')}${K(kb('Ctrl V'),'Excel se kai cells paste')}</div>
   <div><h3>Bulk payments</h3>${K(kb('Enter'),'Customer chuno / agli line')}${K(kb('Ctrl S'),'Sab save')}</div></div>`)}
let gAt=0;
document.addEventListener('keydown',e=>{
  const kp=$('#kp');if(kp&&!kp.hidden){
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();kpClose();return}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();S.kpI=Math.max(0,Math.min((S.kpIt||[]).length-1,(S.kpI||0)+(e.key==='ArrowDown'?1:-1)));kpDraw();return}
    if(e.key==='Enter'){e.preventDefault();e.stopPropagation();kpRun(S.kpI||0,e.shiftKey?'bill':e.altKey?'pay':'');return}
    return}
  if(!S.role)return;
  const ctrl=e.ctrlKey||e.metaKey,k=(e.key||'').toLowerCase();
  if(ctrl&&k==='k'){e.preventDefault();kpOpen();return}
  if(ctrl&&k==='s'){if(S.route==='customers'&&isOwner()&&$('.cgt')){e.preventDefault();A.cgSave()}else if(S.route==='payments'&&isOwner()&&$('#bpBody')){e.preventDefault();A.bpSave()}return}
  const t=e.target;const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable;
  if(typing||ctrl||e.altKey)return;
  if(!$('#sheet').hidden||($('#cbox')&&!$('#cbox').hidden))return;
  if(e.key==='/'){const i=$('#view .search input, #view input[data-act="plq"], #view input[data-act="cq"]');if(i){e.preventDefault();i.focus();i.select()}return}
  if(e.key==='?'){e.preventDefault();sheetKeys();return}
  if(S.route==='sheet'&&(e.key==='['||e.key===']')){e.preventDefault();A.shShift({n:e.key==='['?-1:1});return}
  if(gAt&&Date.now()-gAt<1500){gAt=0;const m={d:'sheet',c:'customers',p:'payments',b:'bills',h:'home',s:'settings',a:'today',o:'bottles',r:'products',f:'forecast',u:'purchase',m:'odo',k:'plan'}[k];
    if(m&&(isOwner()?ROUTES.some(r=>r.id===m):visibleRoutes().some(r=>r.id===m))){e.preventDefault();A.go({r:m})}return}
  if(k==='g'){gAt=Date.now();return}
  if(k==='p'){e.preventDefault();A.addPayment({});return}
  if(k==='n'&&isOwner()&&S.route==='customers'){e.preventDefault();A.editCustomer({});return}
});

})();
