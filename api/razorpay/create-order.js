const Razorpay = null;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return res.status(503).json({ error: 'Razorpay is not configured' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const amount = Math.round(Number(body.amount));
    if (!Number.isFinite(amount) || amount < 100) return res.status(400).json({ error: 'Invalid amount' });
    const receipt = String(body.receipt || ('DC_' + Date.now())).slice(0, 40);
    const auth = Buffer.from(keyId + ':' + keySecret).toString('base64');
    const r = await fetch('https://api.razorpay.com/v1/orders', {
      method:'POST', headers:{'Authorization':'Basic '+auth,'Content-Type':'application/json'},
      body:JSON.stringify({amount,currency:'INR',receipt,notes:{booking_id:String(body.booking_id||'')}})
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({error:data.error?.description || 'Unable to create Razorpay order'});
    return res.status(200).json({id:data.id,amount:data.amount,currency:data.currency,key_id:keyId});
  } catch(e) { return res.status(500).json({error:'Payment service error'}); }
}
