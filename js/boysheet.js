/* Oritic v4 · Boy sheets
 * Har delivery boy ki ALAG file: us din ka order, uske route sequence (⇅ Order badlo) me,
 * owner ke chune columns usi kram me. Sirf owner / office ke liye (boys ko export nahi milta).
 * Abhi download hoti hai. Google Drive backup (V4-15) yahi window.boySheets use karega.
 */
'use strict';
(()=>{
const CSS=`
.bsrow{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line2);border-radius:12px;background:var(--surface);flex-wrap:wrap}
.bsrow .grow{min-width:0;flex:1 1 160px}
.bscol{display:flex;align-items:center;gap:8px;padding:6px 8px 6px 12px;border:1px solid var(--line2);border-radius:12px;background:var(--surface)}
.bscol label{display:flex;gap:10px;align-items:center;flex:1;min-width:0;cursor:pointer;min-height:40px}
.bscol input[type=checkbox]{width:20px;height:20px;flex:none}
.bscol .btn{min-width:40px;min-height:40px}
.bscol.off label{color:var(--muted)}
.bsnum{width:26px;text-align:center;font-weight:800;color:var(--muted);font-variant-numeric:tabular-nums;flex:none}
`;
const st0=document.createElement('style');st0.textContent=CSS;document.head.appendChild(st0);

/* ---------- columns: [key, label, default on] ---------- */
function colCatalog(){return [
  ['seq','Seq (kram)',1],['name','Customer',1],['phone','Phone',1],['house','Makan',1],['addr','Address',1],['landmark','Landmark',1],['map','Map link',0],
  ...PLN.map(p=>['q_'+p.k,p.sh+' ('+p.u+')',1]),
  ['b1','1L bottle',1],['bh','½L bottle',1],['other','Saath me (other products)',1],['val','Order value ₹',0],['bal','Baki ₹',0],['botOut','Customer ke paas bottle',0],
  ['fix','Fix comment',1],['var','Aaj ka comment',1],['status','Confirm hua?',0],['ret','Wapas bottle (khaali, boy bhare)',1],['pay','Payment liya (khaali)',1],['note','Note (khaali)',0]]}
function bsCols(){const cat=colCatalog();const saved=Array.isArray(settings().boyCols)?settings().boyCols:[];const out=[],seen=new Set();
  saved.forEach(x=>{const c=cat.find(y=>y[0]===x.k);if(c&&!seen.has(c[0])){seen.add(c[0]);out.push({k:c[0],l:c[1],on:!!x.on})}});
  cat.forEach(c=>{if(!seen.has(c[0]))out.push({k:c[0],l:c[1],on:!!c[2]})});return out}

/* ---------- data: boy → rows (route sequence) ---------- */
function bsData(date){const cols=bsCols().filter(c=>c.on);const need=k=>cols.some(c=>c.k===k);
  const B=need('bal')&&window.allBalances?allBalances():null;const M=need('botOut')&&window.botAll?botAll():null;
  const by={};const o=S.pld,od=S.pldr;S.pld=date;S.pldr=date===o?od:{};
  try{
    Object.values(S.customers).filter(c=>c.status==='active').sort((a,b)=>(a.boy||'').localeCompare(b.boy||'')||((a.seq??9999)-(b.seq??9999))||a.name.localeCompare(b.name)).forEach(c=>{
      const d=plDraft(c);if(!(PLN.some(p=>+d.qty[p.k]>0)||d.x.length))return;
      const b=c.boy||'—';const g=by[b]||(by[b]={rows:[],tot:{},n:0,b1:0,bh:0,val:0});const bt=bottlesOf(d.qty),v=plValue(c);g.n++;
      const val={seq:g.n,name:c.name,phone:c.phone||'',house:c.house||'',addr:[c.address,c.area].filter(Boolean).join(', '),landmark:c.landmark||'',map:c.map||'',
        b1:bt.b||'',bh:bt.s||'',other:d.x.map(e=>e.n).join(', '),val:v,bal:B?Math.round(B[c.id]||0):'',botOut:M&&M[c.id]?M[c.id].t||'':'',
        fix:c.notes||'',var:varsOf(c).map(x=>x.t).join(' | '),status:plConf(c)&&!d.dirty?'Haan':'Auto-fill',ret:'',pay:'',note:''};
      PLN.forEach(p=>{const q=+d.qty[p.k]||0;val['q_'+p.k]=q||'';g.tot[p.k]=(g.tot[p.k]||0)+q});g.b1+=bt.b;g.bh+=bt.s;g.val+=v;
      g.rows.push(cols.map(cl=>val[cl.k]))});
  }finally{S.pld=o;S.pldr=od}
  return {date,cols,by}}
const sumLine=g=>[`${g.n} ghar`,...PLN.filter(p=>g.tot[p.k]>0).map(p=>p.sh+' '+fq(g.tot[p.k],p.u)),`1L bottle ${g.b1}`,`½L bottle ${g.bh}`].join(' · ');
const safeSheet=n=>String(n).replace(/[\[\]:*?\/\\]/g,'').slice(0,28)||'Boy';
const fileName=(date,boy)=>`oritic-${date}-${String(boy).replace(/[^A-Za-z0-9ऀ-ॿ]+/g,'-').replace(/^-|-$/g,'')||'boy'}.xlsx`;
async function bsBook(D,boy){const XL=await loadXLSX();const g=D.by[boy];if(!g)return null;
  const tot=D.cols.map(c=>c.k==='name'?'TOTAL':c.k.startsWith('q_')?(g.tot[c.k.slice(2)]||''):c.k==='b1'?g.b1:c.k==='bh'?g.bh:c.k==='val'?Math.round(g.val):'');
  const aoa=[[`${settings().company||'Oritic'} · ${boy} · ${fmtDate(D.date)} ${D.date.slice(0,4)}`],[sumLine(g)],[],D.cols.map(c=>c.l),...g.rows,tot];
  const ws=XL.utils.aoa_to_sheet(aoa);ws['!cols']=D.cols.map(c=>({wch:/^(addr|other|fix|var|landmark|map)$/.test(c.k)?30:c.k==='name'?22:c.k==='seq'?5:/^q_/.test(c.k)?9:c.k==='ret'||c.k==='pay'?14:12}));
  const wb=XL.utils.book_new();XL.utils.book_append_sheet(wb,ws,safeSheet(boy));return XL.write(wb,{bookType:'xlsx',type:'array'})}
const XMIME='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
async function bsDownload(D,boy){let out;try{out=await bsBook(D,boy)}catch(e){toast(e.message||String(e));return false}if(!out)return false;saveFile(fileName(D.date,boy),new Blob([out],{type:XMIME}));return true}
window.boySheets={cols:bsCols,data:bsData,book:bsBook,fileName,mime:XMIME};

/* ---------- UI (owner / office) ---------- */
S.bs={date:null,edit:null};
const bsDate=()=>S.bs.date||(S.route==='sheet'&&S.pld?S.pld:planDayISO());
function drawBs(){const date=bsDate();const D=bsData(date);const bl=[...new Set([...boys(),...Object.keys(D.by)])];
  openSheet('Boy sheets',`<div class="stack">
   <div class="small muted">Har boy ki <b>alag Excel file</b>: us din ka order, uske <b>route kram</b> (⇅ Order badlo) me, aapke chune columns isi kram me. Ye sirf owner / office ke liye hai.</div>
   <div class="row wrap" style="gap:8px"><label class="small muted" for="bsD">Delivery date</label><input type="date" class="input" id="bsD" style="width:auto;padding:6px 8px" value="${date}" data-bsd>
    <button class="btn sm o" data-act="bsCols">⚙ Columns (${D.cols.length})</button></div>
   ${bl.map(b=>{const g=D.by[b];return `<div class="bsrow"><div class="grow"><div style="font-weight:800">${esc(b)}</div><div class="small muted">${g?esc(sumLine(g)):'Is din koi order nahi'}</div></div>
     <button class="btn sm o" data-act="routeOrder" data-b="${esc(b)}">⇅ Order</button><button class="btn sm p" data-act="bsOne" data-b="${esc(b)}" ${g?'':'disabled'}>⬇ Excel</button></div>`}).join('')||emptyBox('Koi delivery boy nahi')}
   <button class="btn p block" data-act="bsAll" ${Object.keys(D.by).length?'':'disabled'}>⬇ Sab boys ki file (${Object.keys(D.by).length} alag file)</button>
   <div class="small muted">Browser "kai files download karein?" pooche to <b>Allow</b> dabao. Baad me ye files Google Drive pe apne aap jayengi.</div></div>`)}
function drawCols(){const L0=S.bs.edit;openSheet('Boy sheet ke columns',`<div class="stack">
   <div class="small muted">Tick = file me aayega. ↑ ↓ se kram badlo (upar wala pehle). Ye setting sab computers pe ek jaisi rehti hai.</div>
   ${L0.map((c,i)=>`<div class="bscol ${c.on?'':'off'}"><span class="bsnum">${i+1}</span><label><input type="checkbox" data-bsc="${i}" ${c.on?'checked':''}><span>${esc(c.l)}</span></label>
     <button class="btn xs o" data-act="bsMv" data-i="${i}" data-n="-1" ${i?'':'disabled'} aria-label="Upar">↑</button><button class="btn xs o" data-act="bsMv" data-i="${i}" data-n="1" ${i<L0.length-1?'':'disabled'} aria-label="Neeche">↓</button></div>`).join('')}
   <div class="rtbar"><button class="btn o" data-act="bsColReset">Pehle jaisa</button><span class="grow"></span><button class="btn o" data-act="bsColBack">Wapas</button><button class="btn p" data-act="bsColSave">Save</button></div></div>`)}
document.addEventListener('change',e=>{const el=e.target;if(!el.dataset)return;
  if('bsd' in el.dataset&&el.value){S.bs.date=el.value;drawBs();return}
  if(el.dataset.bsc!=null&&S.bs.edit){const c=S.bs.edit[+el.dataset.bsc];if(c){c.on=el.checked;el.closest('.bscol').classList.toggle('off',!c.on)}}});
const own=()=>{if(!isOwner()){toast('Sirf owner / office ke liye');return false}return true};
Object.assign(A,{
  bsOpen(){if(!own())return;S.bs.date=null;drawBs()},
  async bsOne(d){if(!own())return;const D=bsData(bsDate());if(await bsDownload(D,d.b))toast(d.b+' ki file download ho gayi')},
  async bsAll(){if(!own())return;const D=bsData(bsDate());const bl=Object.keys(D.by).sort();let n=0;for(const b of bl){if(await bsDownload(D,b))n++;await new Promise(r=>setTimeout(r,600))}toast(n+' files download ho gayi')},
  bsCols(){if(!own())return;S.bs.edit=bsCols().map(c=>({...c}));drawCols()},
  bsMv(d){const L0=S.bs.edit,i=+d.i,j=i+(+d.n);if(!L0||j<0||j>=L0.length)return;[L0[i],L0[j]]=[L0[j],L0[i]];const sc=$('#shBody').scrollTop;drawCols();$('#shBody').scrollTop=sc},
  bsColReset(){S.bs.edit=colCatalog().map(c=>({k:c[0],l:c[1],on:!!c[2]}));drawCols()},
  bsColBack(){S.bs.edit=null;drawBs()},
  bsColSave(){if(!own())return;const L0=S.bs.edit;if(!L0.some(c=>c.on))return toast('Kam se kam ek column chuno');
    saveSettings({...settings(),boyCols:L0.map(c=>({k:c.k,on:c.on}))}).then(()=>{toast('Columns save');S.bs.edit=null;drawBs()})}
});
})();
/* Test link: ?demo = local mode me khaali browser me demo data apne aap bhar do */
(()=>{if(window.ORITIC_MODE!=='local'||!/[?&]demo\b/.test(location.search))return;let n=0;
  const t=setInterval(()=>{if(++n>40)return clearInterval(t);if(!S.ready)return;clearInterval(t);if(Object.keys(S.customers||{}).length)return;
    const b=document.createElement('button');b.dataset.act='demoLoad';b.hidden=true;document.body.appendChild(b);S.role=S.role||'owner';S.me=S.me||'Owner';b.click();S.role=null;S.me=''},250)})();
