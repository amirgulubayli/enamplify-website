import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as page from '../src/pages.mjs';
import {renderMarkdown} from '../src/markdown.mjs';
import { esc, header, footer } from '../src/components.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const json = async name => JSON.parse(await fs.readFile(path.join(root, 'content', `${name}.json`),'utf8'));
export async function build() {
  try { process.loadEnvFile(path.join(root,'.env.local')); } catch(e) { if(e.code !== 'ENOENT') throw e; }
  await fs.mkdir(path.join(root,'qa'),{recursive:true});
  if (process.env.VERCEL && process.env.ASSET_SYNC !== '0') {
    const { syncAssets } = await import('./sync-assets.mjs');
    await syncAssets();
  }
  const [site, services, articles, resources, projects, audiences] = await Promise.all(['site','services','articles','resources','projects','audiences'].map(json));
  for(const item of [...services,...articles,...resources,...projects,...audiences]) {
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) throw new Error(`Invalid content slug: ${item.slug}`);
  }
  for(const article of articles) {
    const markdown=await fs.readFile(path.join(root,'content/articles',`${article.slug}.md`),'utf8');
    article.html=renderMarkdown(markdown);
    article.readingTime=Math.max(1,Math.ceil(markdown.split(/\s+/).length/220));
  }
  const suppliedUrl = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const base = new URL(suppliedUrl).origin;
  if (!/^https?:/.test(base)) throw new Error('SITE_URL must use HTTP or HTTPS');
  const isLive = (process.env.VERCEL_ENV === 'production' || process.env.INDEX_SITE === 'true') && !base.includes('localhost');
  const enquiryMode = process.env.ENQUIRY_MODE === 'server' && process.env.RESEND_API_KEY && process.env.CONTACT_FROM && process.env.CONTACT_TO && process.env.CONTACT_ALLOWED_ORIGIN && process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY ? 'server' : 'email';
  const exists = async p => fs.stat(p).then(s=>s.size>1000).catch(()=>false);
  site.portrait = await exists(path.join(root,'public/images/amir-gulubayli.jpg')) ? '/images/amir-gulubayli.jpg' : site.portrait;
  site.libraryImage = await exists(path.join(root,'public/images/library.jpg')) ? '/images/library.jpg' : 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=85';
  const ctx = {site,services,articles,resources,projects,audiences,enquiryMode};
  const routes=[];
  function add(url,title,description,html,extra={}) { routes.push({url,title,description,html,index:true,...extra}); }
  add('/','AI education & advisory',site.description,page.home(ctx),{home:true});
  add('/solutions/','Ways to work together','Practical AI training, leadership briefings, workflow design and ongoing advice. Find the right starting point for your organisation.',page.solutions(ctx));
  for (const s of services) add(`/solutions/${s.slug}/`,s.name,s.summary,page.servicePage(s));
  add('/approach/','Our approach','Understand, practise, apply and review. A thoughtful method for turning AI into practical capability that stays with your people.',page.approach());
  add('/about/','About Enamplify & Amir Gulubayli','Meet the thinking behind Enamplify: a founder-led AI education and advisory practice shaped by software, automation and product work.',page.about(ctx));
  add('/work/','Selected founder projects','Explore the context and ideas behind pripitch, grademy and RAG-X. Candid founder project notes, without unsupported customer results.',page.work(ctx));
  for (const p of projects) add(`/work/${p.slug}/`,`${p.name} · a founder project note`,p.summary,page.projectPage(p));
  add('/perspectives/','Perspectives · the Enamplify journal','Useful thinking on AI, human judgement and the work in between. Essays and practical questions by Amir Gulubayli.',page.journal(ctx));
  for(const a of articles) add(`/perspectives/${a.slug}/`,a.title,a.summary,page.articlePage(a,ctx),{article:a});
  add('/resources/','Field guides for practical AI work','Free practical worksheets for AI pilots, opportunity selection and team readiness. Useful questions, no email gate.',page.resourcesPage(ctx));
  for(const r of resources) add(`/resources/${r.slug}/`,r.name,r.description,page.resourcePage(r),{resource:true});
  for(const a of audiences) add(`/for/${a.slug}/`,`AI capability for ${a.name.toLowerCase()}`,a.intro,page.audiencePage(a));
  add('/contact/','Begin a conversation','Tell Amir about your team, the work and the change you have in mind. Begin a conversation about practical AI education and advisory.',page.contact(ctx),{contact:true});
  for(const [slug,title,description] of [
    ['team-ai-training','Practical AI training for your team','Build shared capability with relevant learning, applied practice and a team playbook.'],
    ['leadership-briefing','A clearer leadership decision about AI','A focused briefing built around your organisation and a useful next decision.'],
    ['pilot-review','What happens after your AI pilot?','Review ownership, quality and handoffs before expanding an AI pilot.']
  ]) add(`/start/${slug}/`,title,description,page.landing(slug,ctx),{index:false});
  for(const [key,title] of [['privacy','Privacy'],['cookies','Cookies'],['terms','Terms'],['accessibility','Accessibility'],['credits','Credits']]) add(`/${key}/`,title,`${title}: the practical details of the Enamplify website.`,page.legalPage(key,ctx));
  add('/thank-you/','A good next step','Continue exploring Enamplify after your conversation.',page.thankYou(),{index:false});
  add('/404/','Page not found','Let’s get you back to something useful.',page.notFound(),{index:false,notFound:true});

  await fs.rm(out,{recursive:true,force:true}); await fs.mkdir(out,{recursive:true});
  await fs.cp(path.join(root,'public'),out,{recursive:true});
  await fs.mkdir(path.join(out,'assets'),{recursive:true});
  const css=await fs.readFile(path.join(root,'assets/styles.css'),'utf8');
  const js=await fs.readFile(path.join(root,'assets/site.js'),'utf8');
  const hash = value => createHash('sha256').update(value).digest('hex').slice(0,10);
  const cssName=`styles.${hash(css)}.css`, jsName=`site.${hash(js)}.js`;
  await fs.writeFile(path.join(out,'assets',cssName),css); await fs.writeFile(path.join(out,'assets',jsName),js);
  const org={'@type':'Organization','@id':`${base}/#practice`,name:site.name,url:base,description:site.description,email:site.email,founder:{'@id':`${base}/#founder`},logo:`${base}/favicon.svg`};
  const person={'@type':'Person','@id':`${base}/#founder`,name:site.founder,sameAs:[site.linkedin]};
  for(const r of routes) {
    const canonical=base+r.url;
    const title=r.home ? `${site.name} · AI education & advisory` : `${r.title.replace(/\.$/,'')} | ${site.name}`;
    const graph=[org,person,{'@type':'WebSite','@id':`${base}/#website`,url:base,name:site.name,inLanguage:'en-GB'}];
    if(r.article) graph.push({'@type':'Article',headline:r.article.title,description:r.article.summary,datePublished:r.article.isoDate,dateModified:r.article.isoDate,author:{'@id':`${base}/#founder`},publisher:{'@id':`${base}/#practice`},mainEntityOfPage:canonical,image:`${base}/images/social-card.png`});
    const data=JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c');
    const turnstile=r.contact && enquiryMode==='server' ? `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>` : '';
    let content=r.html;
    if(r.contact && enquiryMode==='server') content=content.replace('<div id="form-errors"',`<div class="cf-turnstile" data-sitekey="${esc(process.env.TURNSTILE_SITE_KEY)}" data-theme="light" data-action="enquiry"></div><div id="form-errors"`);
    const html=`<!doctype html>\n<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#F3EEE5"><title>${esc(title)}</title><meta name="description" content="${esc(r.description)}"><meta name="robots" content="${isLive&&r.index?'index,follow':'noindex,follow'}"><link rel="canonical" href="${esc(canonical)}"><meta property="og:type" content="${r.article?'article':'website'}"><meta property="og:site_name" content="Enamplify"><meta property="og:locale" content="en_GB"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(r.description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(base)}/images/social-card.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Enamplify. Human potential. Thoughtfully advanced."><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.png" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="alternate" type="application/rss+xml" title="Enamplify Perspectives" href="/feed.xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" media="print" data-webfonts><link rel="stylesheet" href="/assets/${cssName}"><script src="/assets/${jsName}" defer></script>${turnstile}<script type="application/ld+json">${data}</script></head><body id="top" class="${r.resource?'resource-page ':''}${r.article?'article-page ':''}${r.home?'home-page':''}">${header(site,r.url)}<main id="main" tabindex="-1">${content}</main>${footer(site)}</body></html>`;
    const dest=path.join(out,r.url,'index.html'); await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,html);
    if(r.notFound) await fs.writeFile(path.join(out,'404.html'),html);
  }
  const xmlEsc=t=>esc(t).replace(/&#39;/g,'&apos;');
  const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.filter(r=>r.index).map(r=>`<url><loc>${xmlEsc(base+r.url)}</loc><lastmod>${site.launchDate}</lastmod></url>`).join('')}</urlset>`;
  await fs.writeFile(path.join(out,'sitemap.xml'),sitemap);
  await fs.writeFile(path.join(out,'robots.txt'),isLive?`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
  const feed=`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Enamplify Perspectives</title><link>${xmlEsc(base)}/perspectives/</link><description>Useful thinking on AI, human judgement and the work in between.</description><language>en-gb</language><atom:link href="${xmlEsc(base)}/feed.xml" rel="self" type="application/rss+xml"/>${articles.map(a=>`<item><title>${xmlEsc(a.title)}</title><link>${xmlEsc(base)}/perspectives/${a.slug}/</link><guid>${xmlEsc(base)}/perspectives/${a.slug}/</guid><description>${xmlEsc(a.summary)}</description><pubDate>${new Date(a.isoDate).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`;
  await fs.writeFile(path.join(out,'feed.xml'),feed);
  const manifest=routes.map(({url,title,description,index})=>({url,title,description,index}));
  await fs.writeFile(path.join(root,'qa/routes.json'),JSON.stringify(manifest,null,2));
  await fs.writeFile(path.join(root,'qa/build.json'),JSON.stringify({builtAt:new Date().toISOString(),pages:routes.length,base,indexing:isLive,enquiryMode,cssBytes:Buffer.byteLength(css),jsBytes:Buffer.byteLength(js),fontsBundled:false},null,2));
  console.log(`Built ${routes.length} complete pages. Enquiries: ${enquiryMode}. Indexing: ${isLive}. Canonical base: ${base}`);
  return {routes,base,enquiryMode};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) build().catch(e=>{console.error(e);process.exitCode=1;});
