import {
ARTICLES}
 from '../data/dummyData.js'
export const fmtEUR=(
n)
=>new Intl.NumberFormat(
'de-DE',
{
style:'currency',
currency:'EUR'}
)
.format(
Number.isFinite(
n)
?n:0)
export const fmtDate=(
iso)
=>{
if(
!iso)
return'';
const[y,
m,
d]=iso.split(
'-')
;
return `${d}.${m}.${y}`}
export const dishPersons=(
d,
g)
=>d.personOverride>0?d.personOverride:g
export const neededAmount=(
i,
p)
=>i.grammPerPerson*p
export const orderedAmount=(
i,
p)
=>{
const a=ARTICLES[i.articleId];
if(
!a)
return 0;
const n=neededAmount(
i,
p)
;
return a.gebinde>0?Math.ceil(
n/a.gebinde)
*a.gebinde:n}
export const dishPurchasePrice=(
d,
g,
ordered=false)
=>{
const p=dishPersons(
d,
g)
;
return d.items.reduce(
(
s,
i)
=>{
const a=ARTICLES[i.articleId];
if(
!a)
return s;
const q=ordered?orderedAmount(
i,
p)
:neededAmount(
i,
p)
;
return s+q*a.purchasePricePerUnit}
,
0)
}
export const dishSellPrice=(
d,
g,
m)
=>dishPurchasePrice(
d,
g,
false)
*(
1+(
(
d.markupPct??m??0)
/100)
)
export function buffetTotals(
b)
{
if(
!b)
return{
ekNeeded:0,
ekOrdered:0,
sell:0,
overhangCost:0}
;
let ekNeeded=0,
ekOrdered=0,
sell=0;
for(
const c of b.courses||[])
for(
const d of c.dishes||[])
{
ekNeeded+=dishPurchasePrice(
d,
b.totalPersons,
false)
;
ekOrdered+=dishPurchasePrice(
d,
b.totalPersons,
true)
;
sell+=dishSellPrice(
d,
b.totalPersons,
b.globalMarkupPct)
}
return{
ekNeeded,
ekOrdered,
sell,
overhangCost:ekOrdered-ekNeeded}
}
export function aggregateArticles(
b)
{
const map=new Map(
)
;
if(
!b)
return[];
for(
const c of b.courses||[])
for(
const d of c.dishes||[])
{
const p=dishPersons(
d,
b.totalPersons||0)
;
for(
const i of d.items||[])
{
const a=ARTICLES[i.articleId];
if(
!a)
continue;
const cur=map.get(
i.articleId)
||{
articleId:i.articleId,
article:a,
needed:0}
;
cur.needed+=neededAmount(
i,
p)
;
map.set(
i.articleId,
cur)
}
}
return[...map.values(
)
].map(
v=>(
{
...v,
ordered:v.article.gebinde>0?Math.ceil(
v.needed/v.article.gebinde)
*v.article.gebinde:v.needed}
)
)
}
