import crypto from 'node:crypto';
export default async function handler(req,res){
 const verify=process.env.WHATSAPP_VERIFY_TOKEN;
 if(req.method==='GET'){const mode=req.query['hub.mode'],token=req.query['hub.verify_token'],challenge=req.query['hub.challenge'];if(mode==='subscribe'&&verify&&token===verify)return res.status(200).send(challenge);return res.status(403).send('Forbidden');}
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 try{const chunks=[];for await(const c of req)chunks.push(c);const raw=Buffer.concat(chunks);const appSecret=process.env.META_APP_SECRET;const sig=req.headers['x-hub-signature-256'];if(appSecret){const expected='sha256='+crypto.createHmac('sha256',appSecret).update(raw).digest('hex');if(!sig||sig!==expected)return res.status(401).json({error:'Invalid signature'});}const event=JSON.parse(raw.toString('utf8'));console.log('whatsapp_webhook',JSON.stringify(event));return res.status(200).json({received:true});}catch(e){return res.status(400).json({error:'Invalid webhook payload'});}
}