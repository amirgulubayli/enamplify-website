import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let running=false,again=false,timer;
async function rebuild(){if(running){again=true;return;}running=true;await new Promise(resolve=>{const p=spawn(process.execPath,['scripts/build.mjs'],{cwd:root,stdio:'inherit'});p.on('exit',resolve);});running=false;if(again){again=false;await rebuild();}}
await rebuild();
const {serve}=await import('./serve.mjs');serve();
for(const dir of ['src','assets','content','public'])fs.watch(path.join(root,dir),{recursive:true},()=>{clearTimeout(timer);timer=setTimeout(rebuild,150);});
