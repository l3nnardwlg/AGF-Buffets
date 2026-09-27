import {
useMemo}
 from 'react'
import {
ArrowLeft,
CheckCircle2,
LockKeyhole}
 from 'lucide-react'
import {
useNavigate}
 from 'react-router-dom'
import {
useApp}
 from '../context/AppContext.jsx'
import Stepper from '../components/Stepper.jsx'
import {
aggregateArticles,
buffetTotals,
fmtEUR}
 from '../utils/calc.js'
export default function Cart(
)
{
const{
activeBuffet,
user,
deliveryDate,
stockMap,
setStockMap,
orderReference,
setOrderReference}
=useApp(
)
;
const nav=useNavigate(
)
;
const employee=user?.role==='employee';
const items=useMemo(
(
)
=>aggregateArticles(
activeBuffet)
,
[activeBuffet])
;
const totals=useMemo(
(
)
=>buffetTotals(
activeBuffet)
,
[activeBuffet])
;
if(
!activeBuffet)
return null;
if(
!employee)
return <div className="pb-16"><Stepper current={
3}
/><div className="mx-auto max-w-3xl px-6 pt-10"><button onClick={
(
)
=>nav(
'/buffet/edit')
}
 className="mb-5 inline-flex items-center gap-2 text-sm text-neutral-300"><ArrowLeft className="h-4 w-4"/>Zurück</button><div className="rounded-xl border border-neutral-800 bg-neutral-950 p-8"><LockKeyhole className="mb-4 h-10 w-10 text-gold"/><h1 className="text-2xl font-bold">Kundenübersicht</h1><p className="mt-2 text-neutral-400">Einkaufspreise,
 Bestellmengen und Lagerbestand sind nicht sichtbar.</p><div className="mt-6 text-4xl font-bold text-gold">{
fmtEUR(
totals.sell)
}
</div><div className="mt-1 text-sm text-neutral-400">{
fmtEUR(
totals.sell/activeBuffet.totalPersons)
}
 pro Person</div></div></div></div>;
const lines=items.map(
it=>{
const stock=Number(
stockMap[it.articleId]?.stock||0)
;
const effective=Math.max(
0,
it.ordered-stock)
;
return{
...it,
stock,
effective,
skipped:stock>=it.ordered,
price:effective*it.article.purchasePricePerUnit}
}
)
;
const subtotal=lines.reduce(
(
s,
l)
=>s+l.price,
0)
;
const setStock=(
id,
val)
=>setStockMap(
prev=>(
{
...prev,
[id]:{
stock:val}
}
)
)
;
return <div className="pb-16"><Stepper current={
3}
/><div className="mx-auto max-w-[1300px] px-6 pt-6"><button onClick={
(
)
=>nav(
'/buffet/edit')
}
 className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-300"><ArrowLeft className="h-4 w-4"/>Zurück zum Buffet</button><h1 className="text-2xl font-bold">Interner Einkauf</h1><p className="text-sm text-neutral-400">Lieferung {
deliveryDate}
</p><div className="mt-6 grid gap-6 lg:grid-cols-3"><div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 lg:col-span-2">{
lines.map(
l=><div key={
l.articleId}
 className="grid grid-cols-12 items-center gap-3 border-b border-neutral-800 p-4 last:border-0"><div className="col-span-5"><div className="font-medium">{
l.article.name}
</div><div className="text-xs text-neutral-500">Bedarf {
l.needed}
 {
l.article.unit}
 · Bestellung {
l.ordered}
 {
l.article.unit}
</div></div><div className="col-span-3"><input type="number" value={
l.stock||''}
 onChange={
e=>setStock(
l.articleId,
e.target.value)
}
 placeholder="Lagerbestand" className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-2 text-sm"/></div><div className="col-span-2 text-sm">{
l.effective}
 {
l.article.unit}
</div><div className="col-span-2 text-right"><div className="font-semibold text-gold">{
fmtEUR(
l.price)
}
</div>{
l.skipped&&<CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400"/>}
</div></div>)
}
</div><div className="h-fit rounded-xl border border-neutral-800 bg-neutral-950 p-5"><label className="text-xs uppercase tracking-wider text-neutral-500">Referenz</label><input value={
orderReference}
 onChange={
e=>setOrderReference(
e.target.value)
}
 className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm" placeholder="Event / Auftrag"/><div className="mt-6 text-xs uppercase tracking-wider text-neutral-500">EK Bestellsumme</div><div className="text-3xl font-bold text-gold">{
fmtEUR(
subtotal)
}
</div><button onClick={
(
)
=>alert(
`Demo-Bestellung: ${fmtEUR(subtotal)}`)
}
 className="mt-5 w-full rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-neutral-950">Bestellung auslösen</button></div></div></div></div>}
