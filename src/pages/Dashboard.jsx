import {
useMemo,
useState}
 from 'react'
import {
Plus,
Search}
 from 'lucide-react'
import {
useNavigate}
 from 'react-router-dom'
import {
useApp}
 from '../context/AppContext.jsx'
import Stepper from '../components/Stepper.jsx'
export default function Dashboard(
)
{
const{
templates,
myBuffets,
startBuffet,
openOwnBuffet,
createEmptyBuffet,
user}
=useApp(
)
;
const nav=useNavigate(
)
;
const employee=user?.role==='employee';
const[tab,
setTab]=useState(
'templates')
;
const[search,
setSearch]=useState(
'')
;
const list=tab==='templates'?templates:(
employee?myBuffets:[])
;
const filtered=useMemo(
(
)
=>list.filter(
b=>!search||b.title.toLowerCase(
)
.includes(
search.toLowerCase(
)
)
||(
b.tags||[])
.some(
t=>t.toLowerCase(
)
.includes(
search.toLowerCase(
)
)
)
)
,
[list,
search])
;
const select=b=>{
if(
tab==='own'&&employee)
openOwnBuffet(
b)
;
else startBuffet(
b)
;
nav(
'/buffet/edit')
}
;
const create=(
)
=>{
createEmptyBuffet(
'Neues Buffet')
;
nav(
'/buffet/edit')
}
;
return <div className="pb-16"><Stepper current={
1}
/><div className="mx-auto max-w-[1600px] px-6 pt-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">{
employee?'Buffetplanung':'Buffet auswählen'}
</h1><p className="text-sm text-neutral-400">{
employee?'Vorlagen nutzen oder eigene Buffets erstellen.':'Freigegebene Buffets ansehen – interne EK-Daten bleiben verborgen.'}
</p></div>{
employee&&<button onClick={
create}
 className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-neutral-950"><Plus className="h-4 w-4"/>Neues Buffet</button>}
</div><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div className="flex rounded-lg border border-neutral-800 bg-neutral-950 p-1"><button onClick={
(
)
=>setTab(
'templates')
}
 className={
`rounded-md px-4 py-2 text-sm ${tab==='templates'?'bg-gold font-semibold text-neutral-950':'text-neutral-300'}`}
>Vorlagen</button>{
employee&&<button onClick={
(
)
=>setTab(
'own')
}
 className={
`rounded-md px-4 py-2 text-sm ${tab==='own'?'bg-gold font-semibold text-neutral-950':'text-neutral-300'}`}
>Meine Buffets</button>}
</div><div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2"><Search className="h-4 w-4 text-neutral-500"/><input value={
search}
 onChange={
e=>setSearch(
e.target.value)
}
 placeholder="Suchen…" className="bg-transparent text-sm outline-none"/></div></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{
filtered.map(
b=><button key={
b.id}
 onClick={
(
)
=>select(
b)
}
 className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 text-left hover:border-gold/60"><img src={
b.image}
 alt="" className="aspect-[4/3] w-full object-cover"/><div className="p-4"><div className="font-semibold">{
b.title}
</div><div className="mt-2 flex flex-wrap gap-1">{
(
b.tags||[])
.map(
t=><span key={
t}
 className="rounded bg-neutral-800 px-2 py-1 text-[10px] text-neutral-300">{
t}
</span>)
}
</div></div></button>)
}
</div></div></div>}
