export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const key=process.env.GOOGLE_MAPS_API_KEY;
 if(!key)return res.status(503).json({error:'Google Maps is not configured'});
 try{
  const b=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  if(!b.origin||!b.destination)return res.status(400).json({error:'origin and destination are required'});
  const r=await fetch('https://routes.googleapis.com/directions/v2:computeRoutes',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline'},body:JSON.stringify({origin:{address:String(b.origin)},destination:{address:String(b.destination)},travelMode:'DRIVE',routingPreference:'TRAFFIC_AWARE',computeAlternativeRoutes:false,units:'METRIC',languageCode:'en-IN'})});
  const d=await r.json(); if(!r.ok)return res.status(r.status).json({error:d.error?.message||'Route calculation failed'});
  const x=d.routes?.[0]; if(!x)return res.status(404).json({error:'Route not found'});
  return res.status(200).json({distanceMeters:x.distanceMeters,distanceKm:Math.round(x.distanceMeters/100)/10,duration:x.duration,polyline:x.polyline?.encodedPolyline||null});
 }catch(e){return res.status(500).json({error:'Maps service error'});}
}