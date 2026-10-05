export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const token=process.env.WHATSAPP_ACCESS_TOKEN,phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID,version=process.env.WHATSAPP_API_VERSION||'v23.0';
 if(!token||!phoneId)return res.status(503).json({error:'WhatsApp Cloud API is not configured'});
 try{
  const b=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(!b.to||!b.message)return res.status(400).json({error:'to and message are required'});
  const r=await fetch('https://graph.facebook.com/'+version+'/'+phoneId+'/messages',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:String(b.to).replace(/[^0-9]/g,''),type:'text',text:{preview_url:false,body:String(b.message).slice(0,4096)}})});
  const d=await r.json();if(!r.ok)return res.status(r.status).json({error:d.error?.message||'WhatsApp send failed'});return res.status(200).json(d);
 }catch(e){return res.status(500).json({error:'WhatsApp service error'});}
}