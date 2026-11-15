/* Oritic v4 · Bill PDF
 * Bill ka format (Settings / Bills → ⚙ Bill format): naam, title, address, phone, GSTIN, logo, UPI + QR,
 * page A4 / A5, kaunse hisse dikhen, neeche ki line. Ek customer ka PDF (phone pe seedha share / WhatsApp),
 * aur sab bills ek PDF me (har bill alag page). jsPDF + autotable + qrcode-generator cdnjs se, zaroorat pe load.
 * Standard PDF font me ₹ nahi hota, isliye PDF me "Rs." likha jata hai.
 */
'use strict';
(()=>{
const LIB={pdf:'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',at:'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',qr:'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'};
const loadJs=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('PDF library load nahi hui. Internet check karo.'));document.head.appendChild(s)});
async function loadPdf(){if(!(window.jspdf&&window.jspdf.jsPDF))await loadJs(LIB.pdf);if(!window.jspdf.jsPDF.API.autoTable)await loadJs(LIB.at);if(!window.qrcode)await loadJs(LIB.qr);return window.jspdf.jsPDF}

/* ---------- format ---------- */
const DEF={title:'Doodh ka bill',addr:'',phone:'',gst:'',logo:'',lw:0,lh:0,qr:true,size:'a4',daily:true,rate:true,pays:true,prev:true,boy:false};
const fmt=()=>({...DEF,...(settings().billFmt||{})});
/* PDF ke standard font me jo akshar nahi, unhe hatao (₹ → Rs.) */
const pt=s=>String(s??'').replace(/₹/g,'Rs.').replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF–—‘’“”•…]/g,'').replace(/\s+/g,' ').trim();
const rs=n=>{const v=Math.round((+n||0)*100)/100;return (v<0?'-':'')+'Rs. '+Math.abs(v).toLocaleString('en-IN',{maximumFractionDigits:2})};
const slug=s=>String(s).replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'customer';
const perTxt=b=>fmtShort(b.from)+' - '+fmtShort(b.to)+' '+b.from.slice(0,4);
const ADJ={discount:'Discount',charge:'Extra charge',writeoff:'Write-off',refund:'Paisa wapas diya'};
const plusAdj=t=>t==='charge'||t==='refund';
const GREEN=[31,107,69];

function drawQR(doc,text,x,y,size){const q=window.qrcode(0,'M');q.addData(text);q.make();const n=q.getModuleCount(),s=size/n;doc.setFillColor(0,0,0);
  for(let r=0;r<n;r++){let c=0;while(c<n){if(!q.isDark(r,c)){c++;continue}let e=c;while(e<n&&q.isDark(r,e))e++;doc.rect(x+c*s,y+r*s,(e-c)*s,s,'F');c=e}}}

function drawBill(doc,b,F,first){if(!first)doc.addPage();const st=settings(),c=b.c;const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),M=W<160?9:12,sm=W<160;
  let y=M;doc.setTextColor(20);
  /* header: logo + business */
  let x=M;if(F.logo){try{const lh=sm?13:17,lw=F.lw&&F.lh?Math.min(lh*F.lw/F.lh,lh*2.2):lh;doc.addImage(F.logo,'JPEG',M,y,lw,lh);x=M+lw+4}catch(_){}}
  doc.setFont('helvetica','bold');doc.setFontSize(sm?13:16);doc.text(pt(st.company||'Oritic'),x,y+5.5);
  doc.setFont('helvetica','normal');doc.setFontSize(sm?7.5:8.5);doc.setTextColor(95);let yy=y+10;
  [F.addr,F.phone&&('Phone: '+F.phone),F.gst&&('GSTIN: '+F.gst)].filter(Boolean).forEach(s=>{const L2=doc.splitTextToSize(pt(s),W-x-M-(sm?42:58));doc.text(L2,x,yy);yy+=L2.length*3.8});
  doc.setTextColor(20);doc.setFont('helvetica','bold');doc.setFontSize(sm?11:13);doc.text(pt(F.title||DEF.title),W-M,y+5.5,{align:'right'});
  doc.setFont('helvetica','normal');doc.setFontSize(sm?7.5:8.5);doc.text(pt(perTxt(b)),W-M,y+10,{align:'right'});doc.setTextColor(95);doc.text('Bill date: '+pt(fmtShort(todayISO())+' '+todayISO().slice(0,4)),W-M,y+14,{align:'right'});
  y=Math.max(yy,y+18)+1;doc.setDrawColor(210);doc.setLineWidth(.3);doc.line(M,y,W-M,y);y+=5;
  /* customer + kul baki box */
  const bw=sm?40:52,bh=sm?15:17;doc.setFillColor(...(b.closing>0.5?[253,236,234]:[230,242,235]));doc.roundedRect(W-M-bw,y-1,bw,bh,2,2,'F');
  doc.setTextColor(95);doc.setFontSize(sm?7:8);doc.text(b.closing<-0.5?'Advance (jama)':'Kul baki',W-M-bw/2,y+3.5,{align:'center'});
  doc.setTextColor(...(b.closing>0.5?[179,38,30]:GREEN));doc.setFont('helvetica','bold');doc.setFontSize(sm?12:14);doc.text(rs(Math.abs(b.closing)),W-M-bw/2,y+10.5,{align:'center'});
  doc.setTextColor(20);doc.setFontSize(sm?10:11.5);doc.text(pt(c.name),M,y+3);doc.setFont('helvetica','normal');doc.setFontSize(sm?7.5:8.5);doc.setTextColor(80);let cy=y+7.5;
  [c.phone&&('Phone: '+c.phone),[c.house,c.address,c.area].filter(Boolean).join(', '),F.boy&&c.boy&&('Delivery: '+c.boy)].filter(Boolean).forEach(s=>{const L2=doc.splitTextToSize(pt(s),W-2*M-bw-6);doc.text(L2,M,cy);cy+=L2.length*3.7});
  y=Math.max(cy,y+bh)+3;doc.setTextColor(20);
  const T=(opt)=>{doc.autoTable({theme:'grid',margin:{left:M,right:M},styles:{fontSize:sm?7.5:8.5,cellPadding:sm?1.2:1.6,lineColor:[220,226,220],lineWidth:.2,textColor:20},headStyles:{fillColor:GREEN,textColor:255,fontStyle:'bold'},...opt,startY:y});y=doc.lastAutoTable.finalY+4};
  /* is period ka bill */
  const body=b.lines.map(l=>{const r=l.l?l.a/l.l:0;return F.rate?[pt(l.name),L(l.l)+' L',r?rs(r):'',rs(l.a)]:[pt(l.name),L(l.l)+' L',rs(l.a)]});
  if(b.extras)body.push(F.rate?['Paneer / dahi / other','','',rs(b.extras)]:['Paneer / dahi / other','',rs(b.extras)]);
  const tot=F.rate?[{content:'Is period ka bill ('+b.rows.length+' din)',colSpan:3,styles:{fontStyle:'bold'}},{content:rs(b.amount),styles:{fontStyle:'bold',halign:'right'}}]:[{content:'Is period ka bill ('+b.rows.length+' din)',colSpan:2,styles:{fontStyle:'bold'}},{content:rs(b.amount),styles:{fontStyle:'bold',halign:'right'}}];
  T({head:[F.rate?['Saman','Matra','Rate','Rakam']:['Saman','Matra','Rakam']],body:[...(body.length?body:[[{content:'Is period me koi delivery nahi',colSpan:F.rate?4:3}]]),tot],columnStyles:F.rate?{1:{halign:'right'},2:{halign:'right'},3:{halign:'right'}}:{1:{halign:'right'},2:{halign:'right'}}});
  /* hisab */
  const H2=[];if(F.prev&&Math.abs(b.prev)>0.5)H2.push(['Pichla baki',rs(b.prev)]);H2.push(['Is period ka bill',rs(b.amount)]);
  (b.adj||[]).forEach(a=>H2.push([pt((ADJ[a.type]||a.type)+(a.note?' ('+a.note+')':'')),(plusAdj(a.type)?'+ ':'- ')+rs(a.amt)]));
  if(b.paid)H2.push(['Jama (payment)','- '+rs(b.paid)]);
  H2.push([{content:b.closing<-0.5?'Advance (aapka jama)':'Kul baki',styles:{fontStyle:'bold'}},{content:rs(Math.abs(b.closing)),styles:{fontStyle:'bold',halign:'right',textColor:b.closing>0.5?[179,38,30]:GREEN}}]);
  T({head:[['Hisab','']],body:H2,columnStyles:{1:{halign:'right',cellWidth:sm?34:44}}});
  if(F.pays&&b.pays.length)T({head:[['Payment date','Kaise','Rakam']],body:b.pays.map(p=>[pt(fmtShort(p.date)),p.mode==='cash'?'Cash':'UPI',rs(p.amt)]),columnStyles:{2:{halign:'right'}}});
  if(F.daily&&b.rows.length)T({head:[['Date','Doodh','Saath me','Rakam']],body:b.rows.map(r=>[pt(fmtShort(r.date)),pt(qtyText(r.q||{})),pt(extrasText(r.x)),rs(r.a)]),styles:{fontSize:sm?7:7.8,cellPadding:sm?1:1.2,lineColor:[220,226,220],lineWidth:.2,textColor:30},columnStyles:{3:{halign:'right'}}});
  /* footer: UPI QR + note */
  const upi=(st.upi||'').trim(),showQ=F.qr&&upi&&b.closing>0.5,need=showQ?(sm?30:34):14;if(y+need>H-M){doc.addPage();y=M}
  let fx=M;if(showQ){const qs=sm?24:28;drawQR(doc,`upi://pay?pa=${upi.replace(/[^A-Za-z0-9@._-]/g,'')}&pn=${encodeURIComponent(pt(st.company||'Oritic'))}&am=${(Math.round(b.closing*100)/100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(pt('Bill '+c.name+' '+perTxt(b)).slice(0,60))}`,M,y,qs);fx=M+qs+5}
  doc.setFont('helvetica','bold');doc.setFontSize(sm?8.5:9.5);doc.setTextColor(20);
  if(upi){doc.text('UPI: '+pt(upi),fx,y+4);doc.setFont('helvetica','normal');doc.setFontSize(sm?7.5:8.5);doc.setTextColor(80);if(showQ)doc.text(pt('Scan karke '+rs(b.closing)+' bharein (kisi bhi UPI app se)'),fx,y+8.5)}
  doc.setFont('helvetica','normal');doc.setFontSize(sm?7.5:8.5);doc.setTextColor(80);const note=pt(st.billNote||'Dhanyavaad');if(note)doc.text(doc.splitTextToSize(note,W-fx-M),fx,y+(upi?(showQ?13:8.5):4));
  doc.setTextColor(20)}

async function makePdf(bills){const J=await loadPdf();const F=fmt();const doc=new J({unit:'mm',format:F.size==='a5'?'a5':'a4',compress:true});
  for(let i=0;i<bills.length;i++){drawBill(doc,bills[i],F,i===0);if(i%15===14)await new Promise(r=>setTimeout(r,0))}
  return doc.output('blob')}
const fileOne=b=>`bill-${slug(b.c.name)}-${b.from.slice(0,7)}${b.from.slice(8)!=='01'||b.to.slice(8)<'28'?'-'+b.from.slice(8)+'-'+b.to.slice(8):''}.pdf`;
window.billPdf={make:makePdf,fileOne,fmt};

/* ---------- which bills (same as Bills page) ---------- */
function pageBills(){const q=(S.bq||'').trim().toLowerCase();
  return Object.values(S.customers).filter(c=>(S.bboy==='all'||c.boy===S.bboy)&&(!q||(c.name+' '+c.phone+' '+(c.area||'')).toLowerCase().includes(q))).map(c=>billFor(c,S.month,S.period)).filter(b=>b.rows.length||Math.abs(b.closing)>0.5||b.paid||b.adj.length).sort((a,b)=>(a.c.boy||'').localeCompare(b.c.boy||'')||((a.c.seq??9999)-(b.c.seq??9999))||a.c.name.localeCompare(b.c.name))}

/* ---------- format form ---------- */
function bfHtml(){const F=fmt(),st=settings();const ck=(id,v,l)=>`<label class="chip" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" id="${id}" ${v?'checked':''}> ${l}</label>`;
  return `<div class="stack">
   <div class="small muted">Ye format har bill PDF me lagega. PDF me ₹ ki jagah "Rs." aata hai (PDF font ki seema).</div>
   <div class="grid g2"><div class="field"><label class="f">Business / dairy ka naam</label><input class="input" id="bfCo" value="${esc(st.company||'')}"></div>
    <div class="field"><label class="f">Bill ka title</label><input class="input" id="bfTi" value="${esc(F.title)}" placeholder="Doodh ka bill"></div></div>
   <div class="field"><label class="f">Address</label><input class="input" id="bfAd" value="${esc(F.addr)}" placeholder="Dukaan / dairy ka pata"></div>
   <div class="grid g2"><div class="field"><label class="f">Phone</label><input class="input" id="bfPh" inputmode="tel" value="${esc(F.phone)}"></div>
    <div class="field"><label class="f">GSTIN (ho to)</label><input class="input" id="bfGs" value="${esc(F.gst)}"></div></div>
   <div class="field"><label class="f">Logo</label><div class="row wrap" style="gap:10px;align-items:center">${F.logo?`<img src="${F.logo}" alt="Logo" style="height:44px;max-width:120px;border-radius:6px;border:1px solid var(--line2);background:#fff">`:'<span class="small muted">Abhi koi logo nahi</span>'}
    <label class="btn sm o" style="cursor:pointer">Logo chuno<input type="file" id="bfLogo" accept="image/*" hidden></label>${F.logo?'<button class="btn sm o" data-act="bfLogoDel">Hatao</button>':''}</div></div>
   <div class="grid g2"><div class="field"><label class="f">UPI ID</label><input class="input" id="bfUpi" value="${esc(st.upi||'')}" placeholder="e.g. oritic@upi"></div>
    <div class="field"><label class="f">Page size</label><select class="input" id="bfSz"><option value="a4" ${F.size!=='a5'?'selected':''}>A4 (bada)</option><option value="a5" ${F.size==='a5'?'selected':''}>A5 (chhota, aadha A4)</option></select></div></div>
   <div class="field"><label class="f">Bill ke neeche line</label><input class="input" id="bfNote" value="${esc(st.billNote||'')}" placeholder="Dhanyavaad — payment 5 tareekh tak kar dein"></div>
   <div><div class="f" style="margin-bottom:6px">Bill me kya dikhe</div><div class="row wrap" style="gap:6px">${ck('bfQr',F.qr,'UPI QR (baki ke amount ka)')}${ck('bfRate',F.rate,'Rate')}${ck('bfPrev',F.prev,'Pichla baki')}${ck('bfPays',F.pays,'Payments ki list')}${ck('bfDaily',F.daily,'Din-wise list')}${ck('bfBoy',F.boy,'Delivery boy ka naam')}</div></div>
   <div class="row wrap"><button class="btn o" data-act="bfSample">Namoona PDF dekho</button><span class="grow"></span><button class="btn p" data-act="bfSave">Save format</button></div></div>`}
function readBf(){const v=id=>(($('#'+id)||{}).value||'').trim(),c=id=>!!($('#'+id)||{}).checked;
  return {f:{...fmt(),title:v('bfTi')||DEF.title,addr:v('bfAd'),phone:v('bfPh'),gst:v('bfGs'),size:v('bfSz')||'a4',qr:c('bfQr'),rate:c('bfRate'),prev:c('bfPrev'),pays:c('bfPays'),daily:c('bfDaily'),boy:c('bfBoy')},co:v('bfCo'),upi:v('bfUpi'),note:v('bfNote')}}
function logoData(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,400/Math.max(im.width,im.height));const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(im.width*k));cv.height=Math.max(1,Math.round(im.height*k));
  const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.drawImage(im,0,0,cv.width,cv.height);res({d:cv.toDataURL('image/jpeg',.85),w:cv.width,h:cv.height})};im.onerror=()=>rej(new Error('Ye image nahi khuli'));im.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}
document.addEventListener('change',async e=>{if(e.target.id!=='bfLogo')return;const f=e.target.files[0];if(!f)return;try{const r=await logoData(f);const F2={...readBf().f,logo:r.d,lw:r.w,lh:r.h};await saveSettings({...settings(),billFmt:F2});toast('Logo laga diya');A.bfOpen()}catch(err){toast(err.message||String(err))}});

/* ---------- download / share ---------- */
async function give(blob,name,share,txt){const file=new File([blob],name,{type:'application/pdf'});
  if(share&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name,text:txt||''});return}catch(err){if(err&&err.name==='AbortError')return}}
  saveFile(name,blob)}
const busy=(el,on,txt)=>{if(!el)return;if(on){el.dataset.o=el.textContent;el.textContent=txt||'PDF ban raha hai…';el.disabled=true}else{el.textContent=el.dataset.o||el.textContent;el.disabled=false}};
Object.assign(A,{
  bfOpen(){if(!isOwner())return toast('Sirf owner kar sakta hai');openSheet('Bill ka format',bfHtml());$('#sheet .panel').classList.add('wide')},
  async bfSave(){if(!isOwner())return;const r=readBf();await saveSettings({...settings(),company:r.co||settings().company||'Oritic',upi:r.upi,billNote:r.note,billFmt:r.f});toast('Bill format save');closeSheet();render()},
  async bfLogoDel(){if(!isOwner())return;await saveSettings({...settings(),billFmt:{...fmt(),logo:'',lw:0,lh:0}});toast('Logo hata diya');A.bfOpen()},
  async bfSample(d,el){if(!isOwner())return;const r=readBf();const old=settings();
    const c=Object.values(S.customers).map(x=>billFor(x,S.month||todayISO().slice(0,7),S.period||'full')).find(b=>b.rows.length)||(Object.values(S.customers)[0]&&billFor(Object.values(S.customers)[0],todayISO().slice(0,7),'full'));if(!c)return toast('Pehle koi customer jodo');
    busy(el,true);try{S.settings={...old,company:r.co||old.company,upi:r.upi,billNote:r.note,billFmt:r.f};const blob=await makePdf([c]);window.open(URL.createObjectURL(blob),'_blank')||saveFile('namoona-bill.pdf',blob)}catch(err){toast(err.message||String(err))}finally{S.settings=old;busy(el,false)}},
  async pdfOne(d,el){const c=S.customers[d.id];if(!c)return;const b=billFor(c,S.month,S.period);busy(el,true);try{const blob=await makePdf([b]);await give(blob,fileOne(b),!!d.share,`${c.name} · ${perTxt(b)} · Kul baki ${inr(b.closing)}`)}catch(err){toast(err.message||String(err))}finally{busy(el,false)}},
  async pdfAll(d,el){if(!isOwner())return;const B=pageBills();if(!B.length)return toast('Is filter me koi bill nahi');busy(el,true,`PDF ban raha hai… (${B.length} bills)`);
    try{const blob=await makePdf(B);saveFile(`bills-${S.month}${S.period!=='full'?'-'+S.period:''}${S.bboy!=='all'?'-'+slug(S.bboy):''}.pdf`,blob);toast(B.length+' bills ka PDF download ho gaya')}catch(err){toast(err.message||String(err))}finally{busy(el,false)}}
});

/* ---------- hooks: Bills page, bill sheet, Settings ---------- */
const _vb=vBills;vBills=function(){const o=_vb();if(!isOwner())return o;const btns=`<button class="btn o" data-act="pdfAll">📄 PDF (sab bills)</button><button class="btn o" data-act="bfOpen">⚙ Bill format</button>`;
  return {...o,html:o.html.includes('data-act="waQueue"')?o.html.replace('<button class="btn o" data-act="waQueue">',btns+'<button class="btn o" data-act="waQueue">'):o.html.replace('<div class="stack">','<div class="stack"><div class="row wrap">'+btns+'</div>')}};
const _sb=sheetBill;sheetBill=function(cid){_sb(cid);const cp=document.querySelector('#shBody [data-act="copy"]');if(!cp)return;
  const canShare=!!(navigator.canShare&&window.File);cp.parentElement.insertAdjacentHTML('beforeend',`<button class="btn o" data-act="pdfOne" data-id="${esc(cid)}">📄 PDF</button>${canShare?`<button class="btn o" data-act="pdfOne" data-id="${esc(cid)}" data-share="1">PDF bhejo</button>`:''}`)};
const _vs=vSettings;vSettings=function(){const o=_vs();if(!isOwner())return o;
  return {...o,html:o.html+`<div class="card" style="margin-top:12px"><div class="row sp wrap"><div><h3>Bill ka format (PDF)</h3><div class="small muted" style="margin-top:4px">Logo, address, GSTIN, UPI QR, page size, aur bill me kya dikhe.</div></div><button class="btn o" data-act="bfOpen">⚙ Bill format kholo</button></div></div>`}};
})();
