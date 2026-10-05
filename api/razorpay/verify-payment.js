import crypto from 'node:crypto';
export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 try{
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
  if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature) return res.status(400).json({error:'Missing payment fields'});
  const expected=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id+'|'+razorpay_payment_id).digest('hex');
  const ok=crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(razorpay_signature));
  if(!ok) return res.status(400).json({verified:false,error:'Invalid payment signature'});
  return res.status(200).json({verified:true,payment_id:razorpay_payment_id,order_id:razorpay_order_id});
 }catch(e){return res.status(400).json({verified:false,error:'Payment verification failed'});}
}
