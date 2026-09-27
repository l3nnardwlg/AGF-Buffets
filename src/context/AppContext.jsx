import {
createContext,
useContext,
useMemo,
useState}
 from 'react'
import {
BUFFET_TEMPLATES}
 from '../data/dummyData.js'
const AppContext=createContext(
null)
;
const clone=(
v)
=>JSON.parse(
JSON.stringify(
v)
)
export function AppProvider(
{
children}
)
{
const[user,
setUser]=useState(
{
loggedIn:false,
role:null}
)
;
const[templates,
setTemplates]=useState(
(
)
=>clone(
BUFFET_TEMPLATES)
)
;
const[myBuffets,
setMyBuffets]=useState(
[])
;
const[activeBuffet,
setActiveBuffet]=useState(
null)
;
const[deliveryDate,
setDeliveryDate]=useState(
'2026-10-01')
;
const[stockMap,
setStockMap]=useState(
{
}
)
;
const[orderReference,
setOrderReference]=useState(
'')
const login=(
{
email,
role}
)
=>setUser(
{
loggedIn:true,
email,
role,
name:role==='employee'?'Mitarbeiter Demo':'Gast Demo'}
)
;
const logout=(
)
=>{
setUser(
{
loggedIn:false,
role:null}
)
;
setActiveBuffet(
null)
}
const startBuffet=(
buffet)
=>{
const next=clone(
buffet)
;
next.id=`buffet-${Date.now()}`;
next.status='draft';
next.isOwn=true;
setActiveBuffet(
next)
;
return next}
const openOwnBuffet=(
b)
=>setActiveBuffet(
clone(
b)
)
const saveActive=(
)
=>activeBuffet&&setMyBuffets(
prev=>prev.some(
b=>b.id===activeBuffet.id)
?prev.map(
b=>b.id===activeBuffet.id?clone(
activeBuffet)
:b)
:[...prev,
clone(
activeBuffet)
])
const saveAsTemplate=(
)
=>{
if(
!activeBuffet||user?.role!=='employee')
return;
const t=clone(
activeBuffet)
;
t.id=`tpl-${Date.now()}`;
t.status='published';
t.isOwn=false;
setTemplates(
prev=>[...prev,
t])
}
const createEmptyBuffet=(
name)
=>{
const b={
id:`buffet-${Date.now()}`,
title:name||'Neues Buffet',
image:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=70',
tags:['Eigen'],
category:'Eigen',
totalPersons:20,
globalMarkupPct:65,
courses:[{
id:'vorspeise',
name:'Vorspeise',
dishes:[]}
,
{
id:'hauptgang',
name:'Hauptgang',
dishes:[]}
,
{
id:'beilage',
name:'Beilage',
dishes:[]}
,
{
id:'dessert',
name:'Dessert',
dishes:[]}
]}
;
setActiveBuffet(
b)
;
return b}
const value=useMemo(
(
)
=>(
{
user,
login,
logout,
templates,
myBuffets,
activeBuffet,
setActiveBuffet,
startBuffet,
openOwnBuffet,
saveActive,
saveAsTemplate,
createEmptyBuffet,
deliveryDate,
setDeliveryDate,
stockMap,
setStockMap,
orderReference,
setOrderReference}
)
,
[user,
templates,
myBuffets,
activeBuffet,
deliveryDate,
stockMap,
orderReference])
;
return <AppContext.Provider value={
value}
>{
children}
</AppContext.Provider>}
export function useApp(
)
{
const c=useContext(
AppContext)
;
if(
!c)
throw new Error(
'useApp outside provider')
;
return c}
