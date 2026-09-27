import {
Calendar,
LogOut,
ShieldCheck,
UserRound}
 from 'lucide-react'
import {
Link,
useNavigate}
 from 'react-router-dom'
import {
useApp}
 from '../context/AppContext.jsx'
import {
fmtDate}
 from '../utils/calc.js'
export default function Header(
)
{
const{
user,
logout,
deliveryDate,
setDeliveryDate}
=useApp(
)
;
const nav=useNavigate(
)
;
const employee=user?.role==='employee';
return <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur"><div className="mx-auto flex min-h-16 max-w-[1600px] flex-wrap items-center justify-between gap-3 px-6 py-3"><Link to="/dashboard" className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-xs font-black text-neutral-950">AGF</div><div><div className="text-sm font-bold tracking-[0.18em]">AGF BUFFETS</div><div className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">Planning · Costing · Ordering</div></div></Link><div className="flex flex-wrap items-center gap-2">{
employee&&<label className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300"><Calendar className="h-4 w-4 text-gold"/><span>{
fmtDate(
deliveryDate)
}
</span><input type="date" value={
deliveryDate}
 onChange={
e=>setDeliveryDate(
e.target.value)
}
 className="max-w-32 bg-transparent text-xs outline-none"/></label>}
<div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs"><span className={
employee?'inline-flex items-center gap-1 font-semibold text-gold':'inline-flex items-center gap-1 font-semibold text-sky-300'}
>{
employee?<ShieldCheck className="h-4 w-4"/>:<UserRound className="h-4 w-4"/>}
{
employee?'Mitarbeiter':'Gast / Kunde'}
</span><span className="hidden text-neutral-500 md:inline">{
user?.email}
</span></div><button onClick={
(
)
=>{
logout(
)
;
nav(
'/login')
}
}
 className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 hover:text-red-300"><LogOut className="h-4 w-4"/></button></div></div></header>}
