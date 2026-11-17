/* Oritic v3 · Guide: panel ka har hissa kaise use karna hai.
 * Ek hi jagah likha hai (GUIDE). Panel ke andar "Guide" page yahin se banta hai,
 * aur docs/USER-GUIDE.md bhi isi se banti hai (node tools/make-guide.js).
 */
'use strict';
(function(root){
const GUIDE=[
 {id:'flow',t:'Ek din ka poora kaam (sabse pehle ye padho)',where:'',steps:[
   'Shaam ko: customers ke call / WhatsApp se jo badlav aaye, wo Delivery sheet me likho. Phir "Sab confirm karo" dabao.',
   'Demand page se kal ka order supplier ko WhatsApp karo. Delivery sheet ke "Loading sheet" se dekho kis boy ko kitni bottle deni hai.',
   'Subah: boys apne phone me "Aaj list" se har ghar pe ✓ lagate hain, khali bottle wapas likhte hain, payment lete hain.',
   'Din me office: Payments me aaye paise likho, boy ne cash diya to Team & cash me "Mila ✓" karo, kharcha / maal Kharcha page me likho.',
   'Raat ko: Dashboard ka "Dhyan dein" box dekho. Jo laal hai use theek karo. Settings me "Pura backup" le lo, ya ⋯ Aur → ☁ Drive backup se aaj ka hisaab Drive pe bhejo.'],
  tips:['Delivery sheet subah 9 baje ke baad apne aap agle din pe khulti hai. Ye time Settings → Office tools me badal sakte ho.','Kahin se bhi Ctrl + K dabao aur customer ka naam likho. Sabse tez tareeka.','Bayen taraf ka menu sirf icons me simta rehta hai, mouse le jao to khulta hai. Hamesha khula chahiye to menu me upar 📌 dabao (har computer apni pasand yaad rakhta hai).']},
 {id:'home',t:'Dashboard',where:'Menu → Dashboard',steps:[
   '"Dhyan dein" box: jo kaam ruka hai wo yahan dikhta hai (order confirm baaki, delivery pe ✓ nahi, cash handover baaki, limit se zyada baki, bottle nahi lauti). Kisi line pe click karo to wahi page khulta hai.',
   'Uske neeche is mahine ka hisab: Sale, Paisa aaya, Maal + kharcha, Bachat (andaza), Customers se lena.',
   '"Cash kiske paas" me har insaan ke haath ka cash, aur "Bottles" me doodh ke type se kitni bottle bahar hain.',
   'Neeche aaj ka load, boy-wise table, kal ka anumaan aur 7 din ka graph pehle jaisa hai.'],
  tips:['Bachat andaza hai: sale me udhaar wala maal bhi gina hai, aur bacha stock nahi gina.']},
 {id:'sheet',t:'Delivery sheet (order lena, confirm karna, delivery mark karna)',where:'Menu → Delivery',steps:[
   'Upar date dekho. "Aaj ki date" safed, pichli date peeli, agli date hari dikhti hai. ‹ › ya [ ] se din badlo, "Pichli / Aaj ki / Agli" se seedha jao.',
   'Har customer ki line me roz ka order pehle se bhara hai. Customer ne badlav bola to us dabbe me number likho. Enter = neeche wala customer, Tab = agla product.',
   'Line ke shuru me ✓ dabao = order confirm. Quantity 0 karke ✓ = us din doodh nahi jayega. Sab theek ho to upar "Sab confirm karo".',
   'Delivery ho gayi to Status column me "✓ Diya", nahi gaya to "Skip". Galti ho to ↺ se wapas pending.',
   'Quantity badal ke dusri line pe jaoge to wo line apne aap save (confirm) ho jati hai. Ye Customers page ke "Auto save" button se band / chalu hota hai.',
   '"Wapas" column me likho kitni ½L aur 1L khali bottle wapas aayi.',
   'Shahad, dahi, gur jaise product: "+ Product jodo" se. Jo product roz jaate hain unka apna column bana lo (⋯ Aur → ⚙ Columns → Product ka apna column), phir bas quantity likhni hai.',
   'Kai customers ek saath: line ke aage ka checkbox tick karo (Shift + click = poori range). Neeche kaali patti aayegi: Confirm, ✓ Diya, Skip, quantity, product, comment sab ek saath.',
   '⋯ Aur → 📄 Boy sheets: har boy ki alag Excel file, uske route kram me. ⚙ Columns se tay karo kaunse column aur kis kram me. (Team & cash page pe bhi ye button hai.)',
   '⋯ Aur → ☁ Drive backup: us din ka poora hisaab (deliveries, payments, refund, cash, kharcha, meter, bottle) + har boy ki file aapki Google Drive ke "Oritic Backup" folder me. Pehli baar owner Settings → Google Drive backup me 5 step karke set kare.',
   '⋯ Aur → ⚙ Columns: kaunsa column pehle, kaunsa baad me, kaunsa chhupana hai. ↑ ↓ se aage-peeche karo. "Customer ka baki" column bhi yahin se on hota hai.',
   '"Loading sheet": har boy ko Cow / Buffalo / Gir ki kitni ½L aur 1L bottle aur kaunsa saamaan load karna hai. Copy karke WhatsApp ya Print.',
   '⋯ me: route ka order badlo, Auto-fill dobara, chhote rows (compact).'],
  tips:['Pichli date pe kuch bhi badloge to popup poochhega aur badlav ka record ban jayega (Settings → Pichli date ke badlav).','Laal box "17 order abhi confirm nahi" pe click karo to sirf wahi customers dikhte hain.','Tiles me har doodh ke neeche bottle ka hisab likha hai, jaise "18×1L + 7×½L".']},
 {id:'today',t:'Aaj list (delivery boy wali screen)',where:'Menu → Aaj list',steps:[
   'Boy apne naam aur PIN se login karta hai, use sirf apne customers dikhte hain.',
   'Ghar pe doodh diya to ✓, nahi diya to Skip. Naam pe tap karo to address, map, call, instructions aur "kitni bottle wapas li" dikhta hai.',
   'Customer ne paisa diya to usi screen se "Receive payment".',
   'Customer ne kuch kaha (kal 2L chahiye) to "Comment bhejo". Office ko Delivery sheet me dikh jayega.',
   '"⇅ Order badlo": apne gharon ka kram (route) khud set karo. Naam pe tap karo → Sabse upar / Sabse neeche / Kisi ke baad rakho (phir us ghar pe tap karo). Ya ⠿ pakad ke khiskao, ↑ ↓. Aakhir me "Save karo". Paas-paas ke ghar saath rakho, taaki ek ke yahan jao to dusre ka order bhi dikh jaye.'],
  tips:['Office bhi yahi list dekh sakta hai, par office ke liye Delivery sheet zyada tez hai.','Owner / office kisi bhi boy ka order badal sakte hain: Delivery sheet → ⋯ Aur → Customer ka order, ya Boy sheets → ⇅ Order. Kram apne aap kabhi nahi badalta.']},
 {id:'cust',t:'Customers (list, grid, Excel import)',where:'Menu → Customers',steps:[
   'Grid view Excel jaisa hai: kisi bhi dabbe me seedha likho. Upar "Auto save: ON" ho to dusri line pe jaate hi apne aap save ho jata hai (OFF karoge to Ctrl + S se save). Badle hue dabbe peele, galat wale laal dikhte hain.',
   'Naya customer: "+ 1 khali row" ya "+ 10 rows", naam / boy / schedule bharo, Ctrl + S. Mobile zaroori nahi.',
   'Excel se copy karke grid me paste kar sakte ho (kai dabbe ek saath).',
   'Bahut saare naye customer: "Excel import" → Template download → bhar ke upload → preview me galti dekho → Import.',
   'Kai customers ka boy / rate / quantity ek saath badalna: checkbox tick karo, neeche ki patti se lagao, phir Save.'],
  tips:['Line ke number (↗) pe click karo to us customer ka poora account khulta hai.']},
 {id:'acct',t:'Customer ka account (khata, rate, discount, chhutti)',where:'Customers me number ↗ pe click · ya Ctrl + K → naam → Enter',steps:[
   'Upar: kul baki, is mahine ka bill, pichla payment, bottles, abhi ke rate. ← → se agla / pichla customer, Esc se band.',
   '"Order lo": seedha Delivery sheet me is customer ki line khul jaati hai. Phone pe order lete waqt kaam aata hai.',
   'Khata tab: bank passbook jaisa. Har product ki alag line (doodh × rate, paneer, ghee…), payment, discount, aur chalta hua baki. Kisi line pe click = us din ki entry theek karo. Mahina ya tareekh chuno. "Statement Excel" / "Print".',
   'Rate kam karna (customer chhod raha ho): "Rate badlo / Discount" → naya rate likho → "Kab se lagu" chuno → Kyun → Save. Purane din purane rate pe rehte hain.',
   'Ek baar ka discount / extra charge / baki band karna: "Adjustment".',
   'Chhutti: Delivery calendar tab → "Chhutti lagao" → kab se, kab tak. Un dino customer sheet me nahi aayega, baad me apne aap shuru.',
   'Payments tab: har payment, kis tarah (Cash / UPI) aur kisne liya. Bottles tab: kab di, kab wapas aayi.'],
  tips:['Pichli tareekh se rate badloge to panel poochhega ki purane delivered din ka bill bhi badalna hai ya nahi.']},
 {id:'fix',t:'Galat entry theek karna (rate, quantity, product, price)',where:'Delivery sheet me ✎ · ya customer ke Khata me us din ki line pe click',steps:[
   'Kisi bhi purane din ki entry kholne ke 2 raste: (1) Delivery sheet me us din pe jao, Delivered wali line me ✎ dabao ya Value pe double click. (2) Customer ka account → Khata → us din ki line pe click.',
   '"Entry sudharo" khulega. Har product ki apni line hai: quantity, us din ka rate, aur total. Jo galat hai wahi badlo, neeche "Is din ka total" turant badal jata hai.',
   'Paneer, ghee, shahad jaise product: ya to rate likho (₹ per kg) ya seedha total ₹ likho, doosra apne aap bhar jata hai. Laal line = price nahi hai.',
   'Product galti se chadh gaya: us line ka ✕ dabao. Product chhoot gaya: "+ Product jodo". Doosra doodh gaya tha: "+ Doosra doodh".',
   'Us din delivery hui hi nahi thi: neeche "Is din delivery nahi hui". Entry bill se hat jayegi. Galti se dab gaya to usi din ko dobara khol ke Save karo, sab wapas aa jayega.',
   'Koi din chhoot gaya (entry hi nahi bani): Khata me upar date chuno → "Is date ki entry jodo / theek karo".',
   'Bahut saari entries me ek hi product ka price ₹0 hai: Bills ya Dashboard pe laal patti "entries me price nahi hai" dabao → product ka rate likho → "Sab pe lagao". Sab purani entries ek saath theek.'],
  tips:['Har badlav likha jata hai: kisne, kab, kya badla, pehle kitna tha. Entry dobara kholo to neeche dikhta hai, aur Khata me "✎ sudhari" likha aata hai.',
   'Yahan badla hua doodh ka rate sirf usi din ka hai. Customer ka rate aage ke liye badalna ho to account me "Rate badlo / Discount" use karo.',
   'Free me diya (sample): us line me "Free diya" tick kar do, phir wo laal nahi dikhega.']},
 {id:'neworder',t:'Naya order (call pe customer aaya)',where:'Menu → Naya order',steps:[
   'Sabse pehle mobile number likho. Number purana hai to customer ka naam dikh jayega: "Isi customer ka order badlo" dabao. Naya hai to naam, area, address bharo.',
   'Neeche har doodh ke saamne list rate likha hai, customer ko wahi bata do. + dabake quantity chuno. Is customer ko alag rate dena ho to Rate wale dabbe me likh do.',
   'Paneer, ghee jaise product roz chahiye to "Product dhoondo" me naam likho aur chip pe tap karo. Us customer ke liye alag price ho to Rate wale dabbe me likh do. Product list me nahi hai to "+ Naya product" se wahin bana lo.',
   'Kab se shuru, Roz ya ek din chhod ke, kaun sa boy, aur discount ho to wo chuno. Neeche hari patti me ek din aur mahine ka bill dikhta hai.',
   '"Customer + order save karo". Customer us date se Delivery sheet me apne aap aa jayega.'],
  tips:['Start date aage ki hai to tab tak customer sheet me nahi aayega.',
   'Trial offer: "kitne din sasta" me din (jaise 3) aur "kitna % sasta" likho. Un dino doodh sasta lagega. Trial khatam hote hi customer sheet se hat jata hai aur Dashboard pe peeli patti aati hai: phone karke poochho, phir "Continue" (normal rate pe chalu) ya "Band" dabao.']},
 {id:'galti',t:'Galti pakdo (galat entries dhoondna)',where:'Menu → Galti pakdo',steps:[
   'Upar 6 button hain, har ek ke saath ginti: Product price ₹0, Doodh ka rate ajeeb, Quantity ajeeb, Purane din pending, Bina rate ke customer, Double customer.',
   'Button dabao to list khulti hai. Har line ke aage ✎ dabao to wahi entry "Entry sudharo" me khul jati hai.',
   'Product price ₹0 me upar "Product ke hisab se ek saath theek karo" se ek rate sab pe lag jata hai.',
   'Purane din pending me "Us din ki sheet kholo" dabake Diya / Skip laga do.'],
  tips:['Hafte me ek baar ye page dekh lo. Sab theek ho to "Sab theek hai" likha aata hai.','Quantity ajeeb wali line sahi bhi ho sakti hai (mehmaan aaye the). Tab use chhod do.']},
 {id:'mdisc',t:'Mahine ka discount (alag customer, alag discount)',where:'Customer account → Mahine ka discount · phir Bills → Discount lagao',steps:[
   'Customer ka account kholo → "Mahine ka discount" → % (bill ka) ya ₹ fix har mahine chuno → Save.',
   'Mahina khatam hone pe Bills page pe neeli patti "Discount lagao / dekho" dabao. Mahina chuno, har customer ka bill aur discount dikh jayega.',
   '"Customers pe lagao" dabao. Har customer ke khate me us mahine ki ek "Discount" line ban jati hai aur baki kam ho jata hai.'],
  tips:['Dobara dabane se discount double nahi hota. Bill badla ho to sirf naya hisab update hota hai.','Hamesha ke liye sasta rate dena ho to discount nahi, "Rate badlo / Discount" use karo.','Ek baar ka discount: "Adjustment".']},
 {id:'follow',t:'Follow-up (jo customer chup-chaap doodh band kar de)',where:'Menu → Follow-up',steps:[
   'Koi customer 7 kaam ke din doodh na le to panel use "silent" maan leta hai, apne aap Pause kar deta hai aur Follow-up ki "Naye · call karo" list me daal deta hai. Dashboard pe laal patti bhi aati hai.',
   'Us customer ke card me naam, number, area, boy, aakhri doodh kab gaya, kya lete the aur baki dikhta hai. "Call" dabao, baat karo.',
   'Baat ke baad "✍ Call note likho": call me kya hua, doodh kyon band kiya, customer ka review (1 se 5 star), customer ne kya kaha, agla call kab, aur account ka kya karna hai (Chalu karo / Pause rakho / Chhod gaye).',
   '"Agla call" ki date aane pe wo customer "Aaj dobara call" list me aa jata hai.',
   'Har customer ke saare call notes: card me "History", ya customer account me "Call notes".',
   '"👥 Kisne kitne call kiye" se dikhta hai kis office member ne aaj aur 7 din me kitne call kiye aur kitne customer wapas chalu hue.'],
  tips:['Kitne din me silent maanna hai: Follow-up → "⚙ Kitne din me silent" (sirf owner). Wahin chun sakte ho ki apne aap Pause ho ya sirf laal dikhe.','Customers list me rang: laal = silent, peela = Paused, safed = chalu.','Chhutti wale din (jis din kisi ko delivery nahi hui) ginti me nahi aate.']},
 {id:'prices',t:'Price list · sabka rate ek saath badlo',where:'Menu → Price list (sirf owner)',steps:[
   'Pehli baar: "Shuru karo" dabao. Jinka rate default jaisa hai wo default ke saath chalenge, jinka alag hai wo special rahenge. Koi bill nahi badalta.',
   'Rate badalna: jis product ka rate badla uske saamne naya rate likho. "Kab se" chuno (jaise is mahine ki 1 tareekh). "Kab tak" khaali = aage bhi; chaho to "Us mahine ke end tak".',
   '"Pehle dekho kya badlega": kitni delivered entries badlengi, kitne customer, purana total → naya total, mahine-wise. Sab theek ho to "Haan, ye rate lagao". Bill, khata, baaki apne aap badal jate hain.',
   'Special rate wale customer, haath se sudhari entries aur jin din ka rate alag tha wo nahi badalte. Preview me inki ginti dikhti hai.',
   'Kisi customer ka special rate: naam dabao → account → "Rate badlo / Discount". Default pe wapas lana ho to "Default pe wapas (special hatao)".',
   'Galti ho gayi to Rate history me "Undo". Entries purane rate pe wapas aa jati hain.'],
  tips:['Aage ki date ka rate bhi daal sakte ho: us din se nayi deliveries naye rate pe chadhengi.','Settings ka "Default rates" ab sirf dikhata hai, badlav Price list se hota hai.','Sales rep aur boys Price list nahi dekh sakte.']},
 {id:'sales',t:'Sales rep ke order (manager approve karta hai)',where:'Menu → Naya order',steps:[
   'Sales rep banana: Team & cash → "🔑 Office access" → us member ka "Delivery sheet (manager)" tick hata do. Ab wo Delivery sheet, Aaj list aur Kal ki delivery khol hi nahi sakta.',
   'Sales rep "Naya order" se order leta hai, bilkul pehle jaisa. Save dabane pe order seedha sheet me nahi jata, manager ke paas "approval" me jata hai.',
   'Manager (ya owner) ko Dashboard pe "naye order approve karne hain" dikhta hai. Kholo: har order me kisne liya, kya order hai, alag rate ho to laal me. Sahi ho to "✓ Approve": customer turant Delivery sheet me aa jata hai.',
   'Galat ho to "Wapas karo" aur wajah likho. Sales rep ko "Mere bheje hue" me wajah dikhti hai.',
   'Purane customer ka order badalna bhi isi tarah request banta hai. Approve hone tak purana order hi chalta hai.',
   '"👥 Kisne kitne order liye": har member ke 7 din aur 30 din ke order, kitne approve hue, kitne wapas, kitne baaki.'],
  tips:['Sales rep customer ka edit, rate, pause / resume, chhutti, grid save nahi kar sakta. Ye sab Delivery sheet ko badalte hain.','Sales rep apna order khud approve nahi kar sakta.','Manager ka apna liya order seedha chalu hota hai, par ginti me uska naam bhi aata hai.']},
 {id:'access',t:'Kaun kya kar sakta hai (Owner, Office, Delivery boy)',where:'Team & cash',steps:[
   'Owner: sab kuch. Naya boy / office member jodna, PIN dena, hatana, settings, backup, customer delete sirf owner karta hai.',
   'Office (manager): saare orders, customers, payments, bills, kharcha, Naya order, entry sudharna. Naya member nahi jod sakta, kisi ko hata nahi sakta, PIN aur settings nahi dekh sakta, customer delete nahi kar sakta (Pause kar sakta hai).',
   'Delivery boy: sirf apne customers, apni Aaj list, apna payment aur bottle. Kisi aur boy ka data nahi dikhta.',
   'Naya member: Team & cash → "+ Naya member" → naam, role (boy / office), PIN.',
   'Boy badal gaya (Anil ki jagah Harish): naam edit mat karo. Team & cash → "⇄ Boy badlo (route handover)" → Anil chuno → naye boy ka naam aur PIN likho → "Route de do". Saare customers Harish ko mil jate hain, Anil ka login band hota hai, aur Anil ka purana hisab usi ke naam pe rehta hai.',
   'Boy kuch din chhutti pe hai: Team & cash → "🏖 Chhutti / badli" → kaun chhutti pe, kab se kab tak, uska kaam kaun karega → Save. Un dino uske customers badle wale ki Aaj list me aate hain aur delivery usi ke naam likhi jati hai. Chhutti khatam hote hi sab apne aap pehle jaisa. Jaldi laut aaya to "Aaj khatam karo".',
   'Har office member ko alag kaam: Team & cash → "🔑 Office access" → us member ke saamne tick lagao ya hatao: Delivery sheet, Paisa (payments, bills, vasooli, cash, kharcha), Entry sudharna. Tick hataya to wo page us member ko dikhega hi nahi.'],
  tips:['Chhutti (kuch din) aur Boy badlo (hamesha ke liye) alag hain. Chhutti me customers usi boy ke naam rehte hain.','Jahan bhi customer ka naam dikhta hai, saath me uska mobile number hota hai. Number pe ek click = copy.', 'Kisi bhi page pe customer ke naam pe double click = uska poora account (khata, payments, order, kaun sa boy).','Settings me ab boys ka naam type nahi hota, isliye galti se naam bigad nahi sakta.','Har boy aur office member ka PIN uski profile me hai: Team & cash → naam pe click → Profile.','Kisi office member ko owner jaisa poora access dena ho to uski profile me "Poora access" on karo.']},
 {id:'dues',t:'Vasooli (kis se kitna lena hai)',where:'Menu → Vasooli',steps:[
   'Upar ke dabbe: kul lena hai, 0–15 din, 16–30 din, 30+ din (pichle payment ko kitne din hue).',
   'Filter: 15+ din, 30+ din, ₹1,000+, Limit paar, Paused / chhod gaye, Advance.',
   '"Yaad dilao": WhatsApp khulta hai, message pehle se likha hota hai (baki, pichla payment, UPI). Aap bas Send dabao.',
   '"Agla yaad dilao": ek ke baad ek sabko. Jisko aaj bhej diya uske aage "aaj" likha aata hai.',
   'Paisa aa gaya to usi line me "Payment lo".'],
  tips:['Udhaar ki limit Settings → Office tools me daalo. Limit paar wale customer Delivery sheet me bhi laal nishaan ke saath dikhenge.']},
 {id:'bills',t:'Bills',where:'Menu → Bills',steps:[
   'Mahina chuno, phir Pura mahina / 1–15 / 16–end.',
   'Customer pe click = bill ka message. "WhatsApp pe bhejo" ya "Bill copy karo".',
   '"WhatsApp queue": sabke bill ek ke baad ek bhejne ke liye.',
   '"Excel (.xlsx)": poori list download.',
   'Bill ka PDF: customer ke bill me "📄 PDF" (phone pe "PDF bhejo" se seedha WhatsApp). Sabke bill ek file me: "📄 PDF (sab bills)", har bill alag page, upar wale filter (mahina, boy, search) ke hisab se.',
   '"⚙ Bill format": business naam, title, address, phone, GSTIN, logo, UPI ID aur QR, page A4 / A5, aur bill me kya dikhe (rate, pichla baki, payments, din-wise list, boy ka naam). "Namoona PDF dekho" se pehle dekh lo.'],
  tips:['PDF me ₹ ki jagah "Rs." aata hai (PDF font ki seema). Baki ho to bill me UPI QR aata hai, customer scan karke wahi amount bhar sakta hai.']},
 {id:'pay',t:'Payments (paisa lena)',where:'Menu → Payments · ya kahin se bhi P dabao',steps:[
   'Ek payment: "+ Payment lo" → customer → amount → Cash / UPI → "Kisne liya" → Save (do baar dabana hota hai, galti se bachne ke liye).',
   'Kai payments ek saath: "Bulk payment entry" me naam likho → Enter → amount → Enter → agli line. Aakhir me Ctrl + S.',
   '"Kisne liya" zaroori hai: cash jisne liya uske haath me gina jata hai (Team & cash).'],
  tips:['Amount khaali aata hai. Pura baki lena ho to "Pura baki bharo" dabao.']},
 {id:'team',t:'Team & cash (boys aur office ka hisab)',where:'Menu → Team & cash',steps:[
   'Table me har insaan: haath me kitna cash, aaj kitna liya, aaj kitni delivery, is mahine ka KM.',
   'Boy ne office ko cash diya: "+ Cash handover" → Kisne diya, Kisko diya, Amount → Save.',
   'Boy apne phone se bhi likh sakta hai (Payments → "Office ko cash diya"). Tab yahan "Ye cash office ko mila ya nahi?" me aayega: ginke "✓ Mila" dabao. Kam mila to utna hi likho.',
   'Cash bank me jama kiya: "+ Bank me jama".',
   'Naya boy ya office wala: "+ Naya member" → naam, kaam, phone, joining date, PIN, gaadi (apni / company ki), fuel (petrol / EV), aur salary / incentive ke niyam.',
   'Kisi ke naam pe click = uska account: Profile, Cash khata (har rupaya kahan se aaya, kahan gaya), Collection (aur kisko paisa wapas diya), Delivery (din-wise ya customer-wise), Bottles (di, wapas, 7+ din purani), KM & petrol, Hisab / incentive, Salary / advance.',
   'Hisab / incentive: salary + bhatta + har litre + har ghar + KM + trip, minus jo salary / advance diya = dena baaki. Bonus ya chhutti ke liye "Sudhaar".',
   'Kisi ne kaam chhod diya: uske Profile me "Kaam chhod diya". Login band, purana hisab "Purane member" me rehta hai.',
   'Salary ya advance dena: account me "Salary / advance do". Ye Kharcha me bhi jud jata hai.'],
  tips:['UPI seedha company ke account me jata hai, isliye kisi ke haath me nahi gina jata.','Customer ko paisa wapas dena (advance lautana): customer ka account → Adjustment → "Paisa wapas diya", aur kisne diya chuno. Cash me diya to uske haath ka cash ghatega.','Naya mahina fresh shuru karna ho to neeche "Hisab kis date se gino" me tareekh daalo.','Office ke logon ke naam Settings → Office tools → Office staff me daalo.']},
 {id:'kharcha',t:'Kharcha (maal khareedna, kharcha, supplier)',where:'Menu → Kharcha',steps:[
   '"Maal khareeda": jo customers ko dene ke liye khareeda (doodh, ghee, shahad, dahi, gur). Cheez, quantity, rate likho, amount apne aap. Supplier aur paisa kaise diya chuno.',
   'Udhaar pe liya to "Udhaar (baad me denge)" chuno. Wo supplier ke khate me jud jayega.',
   '"Kharcha": petrol, salary, packing, rent. Category chuno, amount likho. Salary / advance ho to "Kisko diya" me naam chuno.',
   '"Supplier ko payment": purana udhaar chukaya.',
   'Upar "… ka hisab": mahine ki sale, maal, kharcha, bachat (andaza), category-wise kharcha, Excel.',
   '"Suppliers": har supplier ko kitna dena baki hai. "Khata" se poori list, "Payment" se bhugtan.'],
  tips:['Cash se diya to jisne diya uske haath ka cash apne aap ghat jata hai.','Maal me "Cow milk / Buffalo milk / Gir cow milk / Chaach" litre me likhoge to neeche "Doodh ka hisab" dikhega: kitna khareeda, kitna order tha, kitna bacha.']},
 {id:'demand',t:'Demand (kal kya chahiye, supplier ko bhejna)',where:'Menu → Demand',steps:[
   'Upar "Supplier / godown ko order bhejo": tareekh chuno, list apne aap banti hai (doodh litre + bottle, aur saath ka saamaan).',
   'List me kuch badalna ho (thoda extra doodh) to wahin likh do.',
   '"WhatsApp pe bhejo" ya "Copy karo". Supplier ka number Kharcha → Suppliers me daala ho to uska naam chun sakte ho.',
   'Neeche aane wale 7 / 15 / 30 din ke other products ki zaroorat dikhti hai.'],tips:['Panel khud kisi ko message nahi bhejta. WhatsApp khulta hai, Send aap dabate ho.']},
 {id:'prod',t:'Products (shahad, dahi, gur, ghee ki list)',where:'Menu → Products',steps:[
   'Naya product: naam, unit (pc / kg / pack), rate → "+ Product jodo". Alag variety alag naam se (Shahad 250g, Shahad 500g).',
   '"Sheet column" tick karo to Delivery sheet me us product ka apna column ban jata hai.',
   'Rate badla to line me likh ke Save. Customer ko pichli baar jis rate pe diya tha wahi rate uske liye apne aap aata hai.'],tips:[]},
 {id:'bottles',t:'Bottles',where:'Menu → Bottles',steps:[
   'Upar: customers ke paas kul kitni bottle, Cow / Buffalo / Gir / Chaach aur ½L / 1L ke hisaab se.',
   '"7+ din se nahi lautayi": jin se bottle maangni hai.',
   'Bottle dena apne aap judta hai (delivery pe ✓ lagte hi). Wapasi Delivery sheet ke "Wapas" column me ya boy ke phone se likho.',
   'Galti theek karni ho to − / + . Customer ke naam pe click = uski bottle ki poori history.'],
  tips:['Doodh ke type ka hisab aise banta hai: jo bottle pehle di thi wahi pehle wapas maani jaati hai.']},
 {id:'meter',t:'Meter (gaadi ka KM)',where:'Menu → Meter',steps:[
   'Boy duty shuru aur khatam karte waqt apne phone se meter ki photo leta hai. Time apne aap aa jata hai.',
   'Office: photo dekh ke "Start KM" aur "End KM" likho. Total KM apne aap nikalta hai. Save dabao to incentive ban jata hai.',
   'Photo na ho to time aur KM haath se bhi likh sakte ho.',
   'Do chakkar lagaye (jaise pehle tempo se gaanv se doodh, phir delivery) to "Trip / chakkar" me likho.',
   'Petrol bharwaya ya EV charge kiya: "⛽ Petrol / charging" → litre / unit, ₹, kisne paise diye. Ye Kharcha me bhi judta hai.',
   'Neeche mahine ka KM, incentive aur petrol, aur petrol ka ₹ per KM. Boy ke naam pe click = din-wise.'],tips:['₹ per km har boy ka apna (Team & cash → naam → Profile). Na ho to Settings wala rate lagta hai.']},
 {id:'settings',t:'Settings aur backup',where:'Menu → Settings',steps:[
   'Company ka naam, UPI, bill ke neeche ki line, boys ke naam aur PIN, default rate.',
   'Office tools: "Aaj ki date" kab badle, Paneer / Ghee rate, Udhaar limit, Kharcha ki categories, Office staff.',
   'Database: "Pura backup" roz le lo. "Backup se wapas laao" se purana data wapas aata hai.',
   'Abhi panel "Local mode" me hai: data sirf isi browser me hai. Sab phones pe chalane ke liye Firebase jodna hoga (README dekho).',
   'Login: har insaan apne naam aur PIN se. Owner ka PIN yahan, boys aur office staff ke PIN bhi yahan ya Team & cash → naam → Profile me. Office staff ka PIN khaali = wo login nahi kar payega.',
   'Kisi ka PIN badlo ya use hatao to uske saare phones se agli baar kholte hi logout ho jata hai. Phone kho gaya ho to bas PIN badal do.',
   '5 baar galat PIN = us naam ka login us phone pe 5 min band (phir 10, 20 min…). Sahi PIN se sab theek.'],
  tips:['Office staff ko "Poora access" (Team & cash → naam → Profile) diya ho to wo Settings, team aur PIN badal sakta hai. Bina iske Settings band, baaki sab kaam chalta hai.','Ye login sirf "koi bhi aake na chala le" ke liye hai. Database ki asli suraksha alag kaam hai (V4-H1).']},
 {id:'keys',t:'Keyboard shortcuts',where:'Kahin bhi ? dabao',steps:[
   'Ctrl + K: customer / page / kaam dhoondo. Enter = account, Shift + Enter = bill, Alt + Enter = payment.',
   'g phir d = Delivery, g c = Customers, g p = Payments, g b = Bills, g h = Dashboard.',
   'Delivery sheet: Enter / ↓ agla customer, Ctrl + Enter confirm, [ ] din badlo.',
   'Customers grid aur Bulk payment: Ctrl + S save.'],tips:[]}
];
root.GUIDE=GUIDE;
if(typeof document==='undefined')return;

const st=document.createElement('style');st.textContent=`
.gd{max-width:860px}.gd details{background:var(--surface);border:1px solid var(--line2);border-radius:var(--r);margin-bottom:10px;overflow:hidden}
.gd summary{list-style:none;cursor:pointer;padding:13px 16px;display:flex;gap:10px;align-items:center;font-weight:800;font-size:15.5px}.gd summary::-webkit-details-marker{display:none}
.gd summary::after{content:'▾';margin-left:auto;color:var(--muted)}.gd details[open] summary::after{content:'▴'}.gd details[open] summary{border-bottom:1px solid var(--line2)}
.gd .gb{padding:12px 16px 16px}.gd .wh{display:inline-block;font-size:12.5px;font-weight:700;color:var(--accent-ink);background:var(--accent-soft);border-radius:8px;padding:3px 9px;margin-bottom:8px}
.gd ol{margin:0;padding-left:22px;line-height:1.65}.gd li{margin-bottom:5px}.gd .tip{margin-top:10px;font-size:13px;color:var(--muted);line-height:1.6}.gd .tip b{color:var(--fg)}`;
document.head.appendChild(st);
function vGuide(){const q=(S.gq||'').trim().toLowerCase();const Ls=GUIDE.filter(g=>!q||(g.t+' '+g.steps.join(' ')+' '+g.tips.join(' ')).toLowerCase().includes(q));
  const routeOf={home:'home',sheet:'sheet',today:'today',cust:'customers',acct:'customers',dues:'dues',bills:'bills',pay:'payments',team:'team',kharcha:'purchase',demand:'forecast',prod:'products',bottles:'bottles',meter:'odo',settings:'settings'};
  return {html:`<div class="stack gd"><div class="search">${ICONS.search}<input class="input" placeholder="Guide me dhoondo, jaise: discount, bottle, handover" value="${esc(S.gq||'')}" data-gq></div>
   ${Ls.map((g,i)=>`<details ${q||i===0?'open':''}><summary>${esc(g.t)}</summary><div class="gb">${g.where?`<div class="wh">Kahan: ${esc(g.where)}</div> ${routeOf[g.id]?`<button class="btn xs o" data-act="go" data-r="${routeOf[g.id]}">Ye page kholo ›</button>`:''}`:''}
     <ol>${g.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${g.tips.length?`<div class="tip">${g.tips.map(t=>'<b>Dhyan:</b> '+esc(t)).join('<br>')}</div>`:''}</div></details>`).join('')||emptyBox('Kuch nahi mila')}</div>`}}
window.EXTRA_VIEWS={...(window.EXTRA_VIEWS||{}),guide:vGuide};
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&'gq' in el.dataset){S.gq=el.value;clearTimeout(S.gqt);S.gqt=setTimeout(()=>{const pos=el.selectionStart;render();const n=$('#view [data-gq]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}},200)}});
const _help=A.help;A.help=function(){if(isOwner()){closeSheet();A.go({r:'guide'})}else _help()};
})(typeof window!=='undefined'?window:globalThis);
