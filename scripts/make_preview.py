"""Creates a self-contained multi-page review file; it is NOT a hosted deployment."""
from pathlib import Path
import json,re,base64
from html import escape
ROOT=Path(__file__).resolve().parents[1]
ROUTES=json.loads((ROOT/'qa/routes.json').read_text())
CSS=(ROOT/'assets/styles.css').read_text()
JS=(ROOT/'assets/site.js').read_text()
PAGES={}
bridge=r'''<script>
document.addEventListener('click', function(event) {
 const link=event.target.closest('a[href]');if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const href=link.getAttribute('href');
 if(href.startsWith('/')&&!href.startsWith('//')){event.preventDefault();parent.postMessage({enamplifyPreview:true,route:href},'*');}
},true);
window.addEventListener('message',function(event){if(event.source!==parent||!event.data.enamplifyPreview)return;const wanted=event.data.interest;const select=document.querySelector('#interest');if(select&&wanted&&Array.from(select.options).some(o=>o.value===wanted))select.value=wanted;});
</script>'''
for r in ROUTES:
 html=(ROOT/'dist'/r['url'].strip('/')/'index.html').read_text()
 html=re.sub(r'<link[^>]+href="/assets/[^\"]+"[^>]*>','',html)
 html=re.sub(r'<script[^>]+src="/assets/[^\"]+"[^>]*></script>','',html)
 html=re.sub(r'<link[^>]+rel="(?:icon|apple-touch-icon|alternate)"[^>]*>','',html)
 # Styles and scripts are stored once in the review shell.
 # Injected when the selected page is opened.
 for pdf in (ROOT/'public/downloads').glob('*.pdf'):
  data='data:application/pdf;base64,'+base64.b64encode(pdf.read_bytes()).decode()
  html=html.replace(f'href="/downloads/{pdf.name}" download',f'href="{data}" download="{pdf.name}"')
 # The preview is explicitly not a public link; production metadata remains untouched in source.
 html=html.replace('Copy article link','Copy development link')
 PAGES[r['url']]=html
payload=json.dumps(PAGES,ensure_ascii=False).replace('<','\\u003c')
options=''.join(f'<option value="{r["url"]}">{escape(r["title"])}</option>' for r in ROUTES if r['url']!='/404/')
shell='''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Enamplify · interactive website review</title><style>
*{box-sizing:border-box}body{margin:0;background:#ddd5c8;color:#f3eee5;font:12px/1.5 Arial,sans-serif}button,select{font:inherit}button{cursor:pointer}#review-bar{height:54px;background:#502d36;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:0 22px}#review-bar strong{letter-spacing:.08em;font-size:11px;font-weight:normal}#review-bar span{opacity:.78;font-size:11px}#controls{display:flex;gap:7px;align-items:center}#controls button{background:transparent;border:1px solid #9e7f87;color:#f3eee5;padding:5px 10px;border-radius:0}#controls button[aria-pressed=true]{background:#f3eee5;color:#502d36}select{padding:6px 10px;max-width:275px;color:#242321;background:#f3eee5;border:0}iframe{display:block;width:100%;height:calc(100dvh - 54px);border:0;margin:0 auto;background:#f3eee5;transition:width .18s ease}.mobile-view iframe{width:390px;max-width:100%;box-shadow:0 0 35px #24232120}:focus-visible{outline:2px solid #e8d7ac;outline-offset:3px}@media(max-width:650px){#review-bar{height:70px;padding:8px 12px;gap:12px}#review-bar strong{font-size:10px}#review-bar span{display:block;font-size:9px}select{max-width:150px;font-size:10px}#controls button{display:none}iframe{height:calc(100dvh - 70px)}}@media(prefers-reduced-motion:reduce){iframe{transition:none}}
</style></head><body><header id="review-bar"><div><strong>Enamplify / Website review</strong> <span>Local preview · not a published website</span></div><div id="controls"><label for="page-picker" hidden>Open a page</label><select id="page-picker" aria-label="Open a page">OPTIONS</select><button id="desktop" aria-pressed="true">Desktop</button><button id="mobile" aria-pressed="false">Mobile</button></div></header><iframe id="website" title="Enamplify website preview" allow="clipboard-write"></iframe><script>
const pages=PAYLOAD; const DESIGN_CSS=CSS_PAYLOAD, CLIENT_JS=JS_PAYLOAD, BRIDGE=BRIDGE_PAYLOAD;
const frame=document.getElementById('website'),picker=document.getElementById('page-picker');let current='/';
function render(){const raw=location.hash.slice(1)||'/';let url;try{url=new URL(raw,'https://preview.invalid');}catch{url=new URL('https://preview.invalid/');}let route=url.pathname;if(!route.endsWith('/'))route+='/';if(!Object.hasOwn(pages,route))route='/404/';current=route;picker.value=route;frame.srcdoc=pages[route].replace('</head>',()=>'<style>'+DESIGN_CSS+'</style></head>').replace('</body>',()=>'<script>'+CLIENT_JS+'<'+'/script>'+BRIDGE+'</body>');frame.onload=()=>frame.contentWindow.postMessage({enamplifyPreview:true,interest:url.searchParams.get('interest')},'*');document.title='Enamplify review · '+(picker.selectedOptions[0]?.textContent||'Page not found');}
window.addEventListener('hashchange',render);window.addEventListener('message',event=>{if(event.source===frame.contentWindow&&event.data?.enamplifyPreview&&typeof event.data.route==='string'){if(location.hash.slice(1)===event.data.route)render();else location.hash=event.data.route;}});picker.addEventListener('change',()=>location.hash=picker.value);document.getElementById('mobile').onclick=()=>{document.body.classList.add('mobile-view');document.getElementById('mobile').setAttribute('aria-pressed','true');document.getElementById('desktop').setAttribute('aria-pressed','false');};document.getElementById('desktop').onclick=()=>{document.body.classList.remove('mobile-view');document.getElementById('mobile').setAttribute('aria-pressed','false');document.getElementById('desktop').setAttribute('aria-pressed','true');};render();
</script></body></html>'''
shell=shell.replace('OPTIONS',options).replace('CSS_PAYLOAD',json.dumps(CSS).replace('<','\\u003c')).replace('JS_PAYLOAD',json.dumps(JS).replace('<','\\u003c')).replace('BRIDGE_PAYLOAD',json.dumps(bridge).replace('<','\\u003c')).replace('PAYLOAD',payload)
output=ROOT.parent/'Enamplify_Website_Preview.html';output.write_text(shell)
print(output,len(shell.encode()),'bytes',len(PAGES),'pages')
