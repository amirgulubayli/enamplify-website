import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const buildInfo=JSON.parse(await fs.readFile(path.join(root,'qa/build.json'),'utf8'));
const routes=JSON.parse(await fs.readFile(path.join(root,'qa/routes.json'),'utf8'));
const read=route=>fs.readFile(path.join(root,'dist',route.url,'index.html'),'utf8');
const all=await Promise.all(routes.map(read));
test('38 complete planned pages exist',()=>assert.equal(routes.length,38));
test('all pages have exactly one H1 and one main landmark',()=>{for(const [i,html] of all.entries()){assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length,1,routes[i].url);assert.equal([...html.matchAll(/<main(?:\s|>)/g)].length,1,routes[i].url);assert.ok(html.includes('lang="en-GB"'));}});
test('all titles and meta descriptions are unique',()=>{for(const pattern of [/<title>(.*?)<\/title>/s,/<meta name="description" content="([^"]*)"/]){const vals=all.map(h=>h.match(pattern)?.[1]);assert.ok(vals.every(Boolean));assert.equal(new Set(vals).size,vals.length);}});
test('every internal link resolves to an output file',async()=>{for(const html of all)for(const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)){const link=match[1].split('?')[0];const file=path.join(root,'dist',link,link.endsWith('/')?'index.html':'');assert.ok(await fs.access(file).then(()=>true).catch(()=>false),`Missing ${link}`);}});
test('JSON-LD is valid and does not invent ratings',()=>{for(const h of all){for(const m of h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)){const data=JSON.parse(m[1]);assert.ok(data['@graph']);assert.equal(JSON.stringify(data).includes('aggregateRating'),false);}}});
test('no marketing placeholders or private workspace identifiers in public output',()=>{const allText=all.join('\n');for(const prohibited of ['Lorem ipsum','TODO','TBD','collection://','muhammad.gulubayli.25@','amirgulubayli@gmail.com','RESEND_API_KEY','TURNSTILE_SECRET_KEY','Notion CONTENT BRAIN','10×','10x productivity'])assert.ok(!allText.includes(prohibited),prohibited);});
test('downloadable worksheets really exist as PDFs',async()=>{for(const name of ['ai-pilot-acceptance-checklist','ai-opportunity-canvas','team-ai-readiness']){const b=await fs.readFile(path.join(root,'dist/downloads',name+'.pdf'));assert.equal(b.subarray(0,5).toString(),'%PDF-');assert.ok(b.length>2000);}});
test('no font files are distributed',async()=>{async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else assert.ok(!/\.(woff2?|ttf|otf)$/i.test(p),p);}}await walk(path.join(root,'dist'));});
test('enquiry composer clearly states that it has not sent anything',async()=>{const h=await read({url:'/contact/'});if(buildInfo.enquiryMode==='email'){assert.ok(h.includes('Nothing is sent until you choose to send it.'));assert.ok(h.includes('data-mode="email"'));}else{assert.ok(h.includes('data-mode="server"'));assert.ok(h.includes('cf-turnstile'));}assert.ok(!h.includes('Your enquiry has been sent.'));});
test('no trackers or local browser storage in client code',async()=>{const js=await fs.readFile(path.join(root,'assets/site.js'),'utf8');assert.ok(!/localStorage\.|sessionStorage\.|document\.cookie\s*=|googletagmanager|fbq\(/.test(js));});
test('fallback and accessibility features present',async()=>{const css=await fs.readFile(path.join(root,'assets/styles.css'),'utf8');assert.ok(css.includes('prefers-reduced-motion'));assert.ok(css.includes(':focus-visible'));for(const h of all){assert.ok(h.includes('Skip to content'));assert.ok(h.includes('<noscript>'));}});

test('public pages contain no em dashes, including encoded HTML entities',()=>{
  for(let i=0;i<all.length;i++) assert.ok(!/[\u2014]|&mdash;|&#(?:8212|x2014);/i.test(all[i]),routes[i].url);
});
test('decorative preheaders are absent from every page',()=>{
  for(let i=0;i<all.length;i++) assert.ok(!/class="[^"]*\b(?:eyebrow|section-label|service-kicker|visual-overline)\b/.test(all[i]),routes[i].url);
});
test('shared CSS does not force labels to uppercase',async()=>{
  const css=await fs.readFile(path.join(root,'assets/styles.css'),'utf8');
  assert.ok(!/text-transform\s*:\s*uppercase/i.test(css));
});
test('enquiry email subject contains no em dash',async()=>{
  const js=await fs.readFile(path.join(root,'assets/site.js'),'utf8');
  assert.ok(!js.includes('\u2014'));
});
