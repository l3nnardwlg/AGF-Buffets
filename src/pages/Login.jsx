import {
useState}
 from 'react'
import {
useNavigate}
 from 'react-router-dom'
import {
ArrowRight,
BriefcaseBusiness,
Lock,
Mail,
Users}
 from 'lucide-react'
import {
useApp}
 from '../context/AppContext.jsx'
export default function Login(
)
{
const{
login}
=useApp(
)
;
const nav=useNavigate(
)
;
const[role,
setRole]=useState(
'employee')
;
const[email,
setEmail]=useState(
'mitarbeiter@agf-buffets.local')
;
const[password,
setPassword]=useState(
'demo1234')
;
const submit=e=>{
e.preventDefault(
)
;
login(
{
email,
role}
)
;
nav(
'/dashboard')
}
;
return <div className="min-h-screen bg-neutral-950 text-white lg:grid lg:grid-cols-2"><div className="relative hidden overflow-hidden lg:block"><img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=85" className="h-full w-full object-cover" alt="Buffet"/><div className="absolute inset-0 bg-gradient-to-tr from-black via-black/50 to-transparent"/><div className="absolute bottom-12 left-12 max-w-xl"><div className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold">AGF BUFFETS</div><h1 className="text-5xl font-bold leading-tight">Buffets planen,
 kalkulieren und für Gäste freigeben.</h1><p className="mt-4 text-neutral-300">Mitarbeiter verwalten EK,
 Vorlagen und Bestellungen. Gäste sehen nur Verkaufspreise.</p></div></div><div className="flex items-center justify-center px-6 py-12"><form onSubmit={
submit}
 className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8"><div className="mb-8"><div className="text-xs uppercase tracking-[0.35em] text-gold">AGF Studios</div><h2 className="mt-2 text-3xl font-bold">AGF Buffets</h2></div><div className="mb-6 grid grid-cols-2 gap-3"><Role active={
role==='employee'}
 icon={
BriefcaseBusiness}
 label="Mitarbeiter" onClick={
(
)
=>setRole(
'employee')
}
/><Role active={
role==='guest'}
 icon={
Users}
 label="Gast / Kunde" onClick={
(
)
=>setRole(
'guest')
}
/></div><label className="mb-1 block text-xs uppercase tracking-wider text-neutral-400">E-Mail</label><div className="mb-4 flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3"><Mail className="h-4 w-4 text-neutral-500"/><input value={
email}
 onChange={
e=>setEmail(
e.target.value)
}
 type="email" required className="w-full bg-transparent text-sm outline-none"/></div><label className="mb-1 block text-xs uppercase tracking-wider text-neutral-400">Passwort / Zugangscode</label><div className="mb-6 flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-3"><Lock className="h-4 w-4 text-neutral-500"/><input value={
password}
 onChange={
e=>setPassword(
e.target.value)
}
 type="password" required className="w-full bg-transparent text-sm outline-none"/></div><button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-neutral-950">Anmelden <ArrowRight className="h-4 w-4"/></button><p className="mt-4 text-center text-xs text-neutral-500">Demo-Login,
 später Backend-Auth.</p></form></div></div>}
function Role(
{
active,
icon:Icon,
label,
onClick}
)
{
return <button type="button" onClick={
onClick}
 className={
`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold ${active?'border-gold bg-gold text-neutral-950':'border-neutral-700 bg-neutral-950 text-neutral-300'}`}
><Icon className="h-4 w-4"/>{
label}
</button>}
