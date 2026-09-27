import express from 'express'
import cors from 'cors'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname=path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE=path.join(__dirname,'data.json')
const app=express()
const PORT=process.env.PORT||4000
app.use(cors())
app.use(express.json({limit:'2mb'}))

const readDb=async()=>JSON.parse(await fs.readFile(DATA_FILE,'utf8'))
const writeDb=db=>fs.writeFile(DATA_FILE,JSON.stringify(db,null,2),'utf8')
const makeId=prefix=>`${prefix}_${Date.now()}_${Math.floor(Math.random()*10000)}`
const safeFetch=async(url,options={},timeoutMs=8000)=>{const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),timeoutMs);try{return await fetch(url,{...options,signal:ctrl.signal})}finally{clearTimeout(timer)}}

const parseQuantity=(q='')=>{
  const m=String(q).match(/([\d.,]+)\s*(kg|g|l|ml|stk|cl|stück)?/i)
  if(!m)return{size:1,unit:'stk'}
  const val=parseFloat(String(m[1]).replace(',','.'))||1
  const unit=(m[2]||'stk').toLowerCase()
  if(unit==='g')return{size:val/1000,unit:'kg'}
  if(unit==='ml')return{size:val/1000,unit:'l'}
  if(unit==='cl')return{size:val/100,unit:'l'}
  if(unit==='stück')return{size:val,unit:'stk'}
  return{size:val,unit}
}
const normOFF=p=>{const{size,unit}=parseQuantity(p.quantity||'1 kg');return{id:'off_'+(p.code||p.id||makeId('p')),name:(p.product_name||p.generic_name||'Unbekannt').trim(),brand:p.brands||'',pricePerKg:0,priceUnit:unit,packageSize:size,unit,available:true,imageUrl:p.image_front_small_url||p.image_url||null,barcode:p.code||null,source:'openfoodfacts'}}
const normRewe=p=>{const listing=p._embedded?.listing??{},pricing=listing.pricing??p.pricing??{},price=pricing.currentRetailPrice??pricing.minPrice?.value??0,media=listing.media??p.media??[],imgPath=media[0]?.path??null,{size,unit}=parseQuantity(p.packagingText||p.quantity||'1');return{id:'rewe_'+(p.id||p.nan||makeId('p')),name:(p.productName||p.name||'').trim(),brand:p.brand||listing.brand||'',pricePerKg:typeof price==='number'?price:0,priceUnit:pricing.basePrice?.unit??'stk',packageSize:size,unit,available:true,imageUrl:imgPath?(imgPath.startsWith('http')?imgPath:`https://shop.rewe.de${imgPath}`):null,source:'rewe'}}
const normEdeka=p=>{const price=p.price?.value??p.regularPrice??0,{size,unit}=parseQuantity(p.packunit||p.quantity||'1');return{id:'edeka_'+(p.plu||p.id||makeId('p')),name:(p.title||p.name||'').trim(),brand:p.brand||'',pricePerKg:typeof price==='number'?price:0,priceUnit:'stk',packageSize:size,unit,available:true,imageUrl:p.imageUrl||p.image||null,source:'edeka'}}

app.get('/api/health',(_req,res)=>res.json({ok:true,service:'agf-buffets-api'}))
app.post('/api/auth/login',async(req,res)=>{
  const{email,password}=req.body||{},db=await readDb()
  const user=db.users.find(u=>u.email.toLowerCase()===String(email||'').toLowerCase())
  if(!user||user.password!==password)return res.status(401).json({message:'Ungültige Login-Daten'})
  res.json({user:{id:user.id,name:user.name,customerNumber:user.customerNumber,email:user.email}})
})
app.get('/api/buffets/templates',async(_req,res)=>res.json({templates:(await readDb()).templates||[]}))
app.get('/api/buffets/custom',async(_req,res)=>res.json({mine:(await readDb()).customBuffets||[]}))
app.post('/api/buffets/custom',async(req,res)=>{
  const{name,buffet}=req.body||{}
  if(!name&&!buffet?.name)return res.status(400).json({message:'Name ist erforderlich'})
  const db=await readDb(),record={...(buffet||{}),id:buffet?.id||makeId('buffet'),name:buffet?.name||String(name).trim(),updatedAt:new Date().toISOString()}
  db.customBuffets=[...(db.customBuffets||[]),record];await writeDb(db);res.status(201).json({buffet:record,mine:db.customBuffets})
})
app.post('/api/orders',async(req,res)=>{
  const{reference,buffetId,buffetName,deliveryDate,items}=req.body||{}
  if(!Array.isArray(items)||!items.length)return res.status(400).json({message:'Bestellung muss mindestens einen Artikel enthalten'})
  const order={id:makeId('ord'),reference:reference||'',buffetId:buffetId||null,buffetName:buffetName||'Unbekannt',deliveryDate:deliveryDate||null,items,createdAt:new Date().toISOString()}
  const db=await readDb();db.orders=[...(db.orders||[]),order];await writeDb(db);res.status(201).json({message:'Bestellung gespeichert',orderId:order.id,order})
})
app.get('/api/orders',async(_req,res)=>res.json({orders:(await readDb()).orders||[]}))

app.get('/api/products/barcode',async(req,res)=>{
  const code=String(req.query.code||'').trim().replace(/\D/g,'')
  if(code.length<8)return res.status(400).json({message:'Ungültiger Barcode'})
  try{const r=await safeFetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`,{headers:{'User-Agent':'AGF-Buffets/1.0'}});const data=await r.json();if(data.status!==1||!data.product)return res.json({product:null,message:'Produkt nicht gefunden'});res.json({product:normOFF({...data.product,code})})}catch(e){res.status(502).json({message:'OpenFoodFacts nicht erreichbar: '+e.message})}
})
app.get('/api/products/search',async(req,res)=>{
  const query=String(req.query.q||'').trim(),source=String(req.query.source||'openfoodfacts')
  if(query.length<2)return res.status(400).json({message:'Suchbegriff zu kurz'})
  try{
    if(source==='openfoodfacts'){
      const fields='code,product_name,generic_name,brands,quantity,image_front_small_url,image_url'
      const r=await safeFetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&action=process&page_size=25&lc=de&fields=${fields}`,{headers:{'User-Agent':'AGF-Buffets/1.0'}})
      if(!r.ok)throw new Error(`HTTP ${r.status}`)
      const data=await r.json();return res.json({source,products:(data.products||[]).filter(p=>p.product_name||p.generic_name).map(normOFF)})
    }
    if(source==='rewe'){
      const r=await safeFetch(`https://shop.rewe.de/api/products?search=${encodeURIComponent(query)}&objectsPerPage=25`,{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json','Referer':'https://shop.rewe.de/'}})
      if(!r.ok)throw new Error(`HTTP ${r.status}`)
      const data=await r.json(),raw=data?._embedded?.products??data?.products??[];return res.json({source,products:raw.map(normRewe).filter(p=>p.name)})
    }
    if(source==='edeka'){
      const r=await safeFetch(`https://www.edeka.de/service/search.jsp?query=${encodeURIComponent(query)}&searchType=product&pageSize=25`,{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json','Referer':'https://www.edeka.de/'}})
      if(!r.ok)throw new Error(`HTTP ${r.status}`)
      const data=await r.json(),raw=data?.products??data?.results??data?.items??[];return res.json({source,products:Array.isArray(raw)?raw.map(normEdeka).filter(p=>p.name):[]})
    }
    res.status(400).json({message:`Unbekannte Quelle: ${source}`})
  }catch(e){res.json({source,warning:`${source}: ${e.message}`,products:[]})}
})
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({message:'Interner Serverfehler'})})
app.listen(PORT,()=>console.log(`AGF Buffets API läuft auf http://localhost:${PORT}`))
