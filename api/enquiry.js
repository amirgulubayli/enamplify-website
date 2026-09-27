import {createHash} from 'node:crypto';

/** Server-side validation is independent of browser validation. */
export function validateEnquiry(input, now=Date.now()) {
 if(!input || typeof input!=='object' || Array.isArray(input))return {error:'A valid enquiry is required.'};
 const get=(key,max)=>typeof input[key]==='string'?input[key].trim().slice(0,max+1):'';
 const data={name:get('name',100),email:get('email',254),organisation:get('organisation',160),message:get('message',4000),interest:get('interest',80),token:get('cf-turnstile-response',2048),startedAt:Number(input.startedAt)};
 if(input.website)return {error:'The enquiry could not be accepted.'};
 if(!data.name||data.name.length>100||/[\r\n]/.test(data.name))return {error:'Please supply your name.'};
 if(data.email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(data.email)||/[\r\n]/.test(data.email))return {error:'Please supply a valid email.'};
 if(data.organisation.length>160||data.interest.length>80||/[\r\n]/.test(data.interest))return {error:'A field is too long or invalid.'};
 if(data.message.length<20||data.message.length>4000)return {error:'Please write between 20 and 4,000 characters about the work.'};
 if(!Number.isFinite(data.startedAt)||now-data.startedAt<1200||now-data.startedAt>86_400_000)return {error:'Please reload the page and try again.'};
 if(!data.token||data.token.length>2048)return {error:'Please complete the verification.'};
 return {data};
}

/** Dependency injection keeps the delivery path testable without sending real emails. */
export async function processEnquiry({method,headers,body},{env=process.env,fetcher=fetch,now=Date.now()}={}) {
 if(method!=='POST')return {status:405,body:{error:'Use POST.'}};
 const needed=['RESEND_API_KEY','CONTACT_FROM','CONTACT_TO','CONTACT_ALLOWED_ORIGIN','TURNSTILE_SECRET_KEY'];
 if(env.ENQUIRY_MODE!=='server'||needed.some(k=>!env[k]))return {status:503,body:{error:'Direct delivery is not configured. Please use the email contact option.'}};
 const origins=env.CONTACT_ALLOWED_ORIGIN.split(',').map(x=>x.trim());
 const origin=headers.origin || headers.Origin;
 if(!origin||!origins.includes(origin))return {status:403,body:{error:'This origin is not allowed.'}};
 if(!String(headers['content-type']||'').includes('application/json'))return {status:415,body:{error:'Send JSON.'}};
 if(Buffer.byteLength(JSON.stringify(body||{}))>16_384)return {status:413,body:{error:'The enquiry is too large.'}};
 const {data,error}=validateEnquiry(body,now);
 if(error)return {status:400,body:{error}};
 try{
  const checked=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:data.token}),signal:AbortSignal.timeout(5000)});
  const verification=await checked.json();
  const allowedHosts=origins.map(x=>new URL(x).hostname);
  if(!checked.ok||verification.success!==true||verification.action!=='enquiry'||!allowedHosts.includes(verification.hostname))return {status:400,body:{error:'Verification did not complete. Please try again.'}};
  const mail={from:env.CONTACT_FROM,to:[env.CONTACT_TO],reply_to:data.email,subject:`Enamplify enquiry · ${data.interest||'A conversation'}`,text:`${data.message}\n\nName: ${data.name}\nEmail: ${data.email}\nOrganisation: ${data.organisation||'Not supplied'}\nInterest: ${data.interest||'Not specified'}\n`};
  const idempotency=createHash('sha256').update(JSON.stringify(mail)+String(data.startedAt)).digest('hex');
  const sent=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`enquiry-${idempotency}`},body:JSON.stringify(mail),signal:AbortSignal.timeout(8000)});
  const receipt=await sent.json();
  if(!sent.ok||!receipt.id)return {status:502,body:{error:'Delivery could not be confirmed. Please email directly.'}};
  return {status:202,body:{ok:true}};
 }catch{return {status:502,body:{error:'Delivery could not be confirmed. Please email directly.'}};}
}

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST')res.setHeader('Allow','POST');
 try{
  let body=req.body;
  if(typeof body==='string'){if(Buffer.byteLength(body)>16_384){res.statusCode=413;res.end(JSON.stringify({error:'The enquiry is too large.'}));return;}body=JSON.parse(body);}
  else if(body===undefined){let chunks=[],size=0;for await(const chunk of req){size+=chunk.length;if(size>16_384){res.statusCode=413;res.end(JSON.stringify({error:'The enquiry is too large.'}));return;}chunks.push(chunk);}body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}
  const response=await processEnquiry({method:req.method,headers:req.headers,body});res.statusCode=response.status;res.end(JSON.stringify(response.body));
 }catch{res.statusCode=400;res.end(JSON.stringify({error:'The request could not be read.'}));}
}
