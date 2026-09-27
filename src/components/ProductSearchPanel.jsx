import {
 useState }
 from 'react'
import {
 Barcode,
 Loader2,
 Search,
 ShoppingBasket }
 from 'lucide-react'
import {
 productApi }
 from '../services/productApi.js'
const SOURCES = [
[
'openfoodfacts',
'OpenFoodFacts']
,
[
'rewe',
'REWE']
,
[
'edeka',
'EDEKA']
]
export default function ProductSearchPanel(
{
 onPick }
)
 {
  const [
query,
setQuery]
=useState(
'')
;
 const [
barcode,
setBarcode]
=useState(
'')
;
 const [
source,
setSource]
=useState(
'openfoodfacts')
  const [
products,
setProducts]
=useState(
[
]
)
;
 const [
loading,
setLoading]
=useState(
false)
;
 const [
message,
setMessage]
=useState(
'')
  const run=async(
)
=>{
 if(
query.trim(
)
.length<2)
return;
 setLoading(
true)
;
setMessage(
'')
;
try{
const data=await productApi.search(
query.trim(
)
,
source)
;
setProducts(
data.products||[
]
)
;
setMessage(
data.warning||'')
}
catch(
error)
{
setMessage(
error.message)
;
setProducts(
[
]
)
}
finally{
setLoading(
false)
}
}
  const lookupBarcode=async(
)
=>{
if(
barcode.replace(
/\D/g,
'')
.length<8)
return;
setLoading(
true)
;
setMessage(
'')
;
try{
const data=await productApi.barcode(
barcode)
;
setProducts(
data.product?[
data.product]
:[
]
)
;
setMessage(
data.message||'')
}
catch(
error)
{
setMessage(
error.message)
;
setProducts(
[
]
)
}
finally{
setLoading(
false)
}
}
  return <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
    <div className="mb-4 flex items-center gap-2"><ShoppingBasket className="h-5 w-5 text-gold"/><h3 className="font-semibold">Externe Produktsuche</h3></div>
    <div className="grid gap-3 md:grid-cols-[1fr_auto]"><div className="flex rounded-md border border-neutral-700 bg-neutral-900"><input value={
query}
 onChange={
e=>setQuery(
e.target.value)
}
 onKeyDown={
e=>e.key==='Enter'&&run(
)
}
 placeholder="Produkt suchen…" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"/><select value={
source}
 onChange={
e=>setSource(
e.target.value)
}
 className="border-l border-neutral-700 bg-neutral-900 px-2 text-xs">{
SOURCES.map(
(
[
id,
label]
)
=><option key={
id}
 value={
id}
>{
label}
</option>)
}
</select></div><button onClick={
run}
 disabled={
loading}
 className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-neutral-950">{
loading?<Loader2 className="h-4 w-4 animate-spin"/>:<Search className="h-4 w-4"/>}
Suchen</button></div>
    <div className="mt-3 flex gap-2"><div className="flex flex-1 items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-3"><Barcode className="h-4 w-4 text-neutral-500"/><input value={
barcode}
 onChange={
e=>setBarcode(
e.target.value)
}
 placeholder="Barcode / EAN" className="w-full bg-transparent py-2 text-sm outline-none"/></div><button onClick={
lookupBarcode}
 className="rounded-md border border-neutral-700 px-3 text-sm hover:border-gold">Lookup</button></div>
    {
message&&<div className="mt-3 rounded-md border border-amber-800/50 bg-amber-950/30 p-2 text-xs text-amber-200">{
message}
</div>}
    <div className="mt-4 max-h-80 space-y-2 overflow-auto">{
products.map(
product=><button key={
product.id}
 onClick={
(
)
=>onPick?.(
product)
}
 className="flex w-full items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-left hover:border-gold/50">{
product.imageUrl?<img src={
product.imageUrl}
 alt="" className="h-12 w-12 rounded object-cover"/>:<div className="h-12 w-12 rounded bg-neutral-800"/>}
<div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{
product.name}
</div><div className="text-xs text-neutral-500">{
product.brand||product.source}
 · {
product.packageSize}
 {
product.unit}
</div></div><span className="text-xs uppercase text-gold">Übernehmen</span></button>)
}
</div>
  </div>
}
