import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Public-source photography only. No keys or private repository contents are fetched.
const assets=[
 {name:'amir-gulubayli.jpg',urls:['https://ragmedium.com/images/amir-gulubayli.jpg','https://www.ragmedium.com/images/amir-gulubayli.jpg'],source:'Existing founder portrait referenced by RAGmedium website source; verify the downloaded image before launch.'}
];
export async function syncAssets(){
 await fs.mkdir(path.join(root,'public/images'),{recursive:true});
 const results=await Promise.all(assets.map(async asset=>{
  const dest=path.join(root,'public/images',asset.name);
  if(await fs.stat(dest).then(s=>s.size>1000).catch(()=>false))return {name:asset.name,status:'already-local'};
  for(const url of asset.urls)try{
   const res=await fetch(url,{signal:AbortSignal.timeout(6500)});
   if(!res.ok || !/^image\/jpeg/i.test(res.headers.get('content-type')||''))continue;
   const buf=Buffer.from(await res.arrayBuffer());
   if(buf.length<1000||buf.length>5_000_000)continue;
   await fs.writeFile(dest,buf);return {name:asset.name,status:'downloaded',bytes:buf.length,source:asset.source,url};
  }catch{/* Fall back to the remote URL and then to a non-photographic placeholder. */}
  return {name:asset.name,status:'unavailable',source:asset.source};
 }));
 await fs.mkdir(path.join(root,'qa'),{recursive:true});await fs.writeFile(path.join(root,'qa/assets.json'),JSON.stringify(results,null,2));
 console.log('Asset sync:',results.map(r=>`${r.name}: ${r.status}`).join('; ')); return results;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await syncAssets();
