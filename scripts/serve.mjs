import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8'};
export function serve(port=Number(process.env.PORT||3000)){
 const server=http.createServer(async(req,res)=>{
  try{
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
   const url=new URL(req.url,'http://localhost');let pathname=decodeURIComponent(url.pathname);
   if(pathname.includes('\0')||pathname.split('/').includes('..')){res.writeHead(400);res.end('Bad request');return;}
   if(!path.extname(pathname)&&!pathname.endsWith('/')){res.writeHead(308,{Location:pathname+'/'+url.search});res.end();return;}
   let file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
   if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
   let status=200,buf;
   try{buf=await fs.readFile(file);}catch{file=path.join(root,'404.html');buf=await fs.readFile(file);status=404;}
   res.writeHead(status,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':buf.length,'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':'no-cache'});
   res.end(req.method==='HEAD'?undefined:buf);
  }catch{res.writeHead(500);res.end('Could not serve this page.');}
 });
 server.listen(port,'0.0.0.0',()=>console.log(`Enamplify preview: http://localhost:${port}`));
 return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))serve();
