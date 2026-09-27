export default function Stepper(
{
current}
)
{
return <div className="border-b border-neutral-800 bg-neutral-950/60"><div className="mx-auto flex max-w-[1600px] gap-2 px-6 py-3">{
['Buffet wählen',
'Konfigurieren',
'Abschluss'].map(
(
s,
i)
=><div key={
s}
 className={
`rounded-full px-3 py-1 text-xs ${current===i+1?'bg-gold font-semibold text-neutral-950':'bg-neutral-800 text-neutral-400'}`}
>{
i+1}
. {
s}
</div>)
}
</div></div>}
