# Oritic panel: Delivery sheet aur side menu ka UX review (15 Nov 2026)

Review: 1400 × 850 laptop screen aur 375 px phone. Demo data (30 customers) ke saath, local mode me.
Kaise: `evaluate` skill (Nielsen ke 10 niyam, severity) + `web-design-guidelines` skill (Vercel ke web niyam).

## Priority Issues

### Major

**1. Delivery sheet me table se pehle aadhi screen controls** (ho gaya)
Table 381 px pe shuru hota tha, yaani 850 px screen ka 45% sirf upar ke hisse me: date wali line, 12 tiles, "Confirm hue" tile, "Bottles kitni lagengi" ki patti, laal status box ki alag line, aur filter ki 2 lines. Shaam ko order lete waqt ek screen pe kam customer dikhte the. Niyam: kam se kam aur saaf design (Aesthetic and minimalist design).
Badlav: tiles chhote; "Confirm hue" tile aur bottle table hataye (tiles aur laal box wahi baat pehle se batate hain, aur bottle ka split har doodh ke tile ke neeche hai); laal / hara status box filter ki line me; History date wali line me; Active / Inactive ek chhota dropdown; Excel ⋯ Aur me; ⚙ Columns ka doosra button hataya (⋯ Aur me pehle se tha). **Ab table 295 px pe shuru hota hai.**

**2. Side menu hamesha 220 px jagah leta tha** (ho gaya)
Har page pe 220 px menu khula rehta tha, jabki menu din me kuch hi baar chahiye. Niyam: kam se kam aur saaf design; tez kaam ke liye lachila (Flexibility and efficiency of use).
Badlav: menu 64 px ki icon patti; mouse le jao to khulta hai (page ke upar, page hilta nahi); keyboard ke Tab se bhi khulta hai; 📌 dabao to hamesha khula (har computer yaad rakhta hai). Delivery sheet ko **156 px zyada chaudai** mili.

### Minor

**3. Filter chips pe ginti nahi thi** (ho gaya)
"Confirm baaki", "Delivered" dabane se pehle pata nahi chalta tha kitne hain. Niyam: system ka haal dikhna (Visibility of system status).
Badlav: har chip pe ginti, jaise "Confirm baaki 29".

**4. Phone pe Delivery sheet ka upar ka hissa ab bhi lamba** (baaki)
375 px pe date, tiles aur filter ek ke neeche ek aate hain, pehla customer kaafi neeche hai. Owner ye page zyada tar computer pe chalate hain, isliye abhi chhoda. Niyam: kam se kam aur saaf design.
Badlav: phone pe tiles aur filter ek "Filter ▾" button ke andar band rahein.

**5. Excel ab ⋯ Aur ke andar** (dhyan rakhna)
Ek click zyada laga. Button pe tooltip aur table ke neeche ki line me likha hai "Excel bhi ⋯ Aur me hai". Ctrl + K me "Excel backup" pehle se hai. Niyam: yaad rakhne ki jagah dikhna (Recognition rather than recall).

### Cosmetic

**6. "Bade bottle (1L)", "Chhote bottle (½L)" tile ke naam 2 line me toot-te hain.**
Badlav: chhota naam "1L bottle", "½L bottle".

**7. Search aur date box ke label nahi the (screen reader ke liye).** (ho gaya) `aria-label` jode.

## Positive Findings

- Date ka rang (pichli = amber, aaj = safed, agli = hara) door se dikhta hai, ise mat badlo.
- Laal "N order abhi confirm nahi" box click karne pe wahi rows dikhata hai: tez aur saaf.
- Keyboard se kaam (Enter, Tab, Ctrl + Enter, [ ]) aur Ctrl + K office ke tez kaam ke liye sabse badi taakat hain.

## Recommended Actions

1. Phone pe Delivery sheet ka upar ka hissa lamba (Filter ▾)
2. Tile ke naam 2 line me toot-te hain
