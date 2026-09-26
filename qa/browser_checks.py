"""Offline Chromium rendering and interaction QA.
The container's browser disallows localhost navigation. Pages are loaded from their
actual built HTML with local CSS/JS inlined. HTTP routes are checked separately.
External images/fonts are aborted deliberately; fallbacks are part of this check.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,time,urllib.request,urllib.error
ROOT=Path(__file__).resolve().parents[1]
CSS=(ROOT/'assets/styles.css').read_text();JS=(ROOT/'assets/site.js').read_text()
ROUTES=json.loads((ROOT/'qa/routes.json').read_text())
OUT=ROOT/'qa/screenshots';OUT.mkdir(exist_ok=True)
report={'method':'Built HTML rendered in Chromium with identical inline local CSS/JS; external requests aborted. HTTP routes checked separately with urllib.','viewports':[1440,768,390,320],'routes':[],'interactions':[],'externalAssetsVerified':False,'liveDeploymentVerified':False}

def load(page,route):
 html=(ROOT/'dist'/route.strip('/')/'index.html').read_text()
 html=re.sub(r'<link[^>]+rel="stylesheet"[^>]*>','',html)
 html=re.sub(r'<script[^>]+src=[^>]*></script>','',html)
 html=html.replace('</head>','<style>'+CSS+'</style></head>')
 html=html.replace('</body>','<script>'+JS+'</script></body>')
 page.set_content(html,wait_until='domcontentloaded')
 page.wait_for_timeout(25)

def check(name,fn):
 try: fn();report['interactions'].append({'name':name,'passed':True})
 except Exception as e:report['interactions'].append({'name':name,'passed':False,'error':str(e)[:1000]})

with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in report['viewports']:
  context=b.new_context(viewport={'width':width,'height':1000 if width>760 else 844})
  context.route('**/*',lambda route:route.abort())
  for r in ROUTES:
   page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   load(page,r['url'])
   info=page.evaluate('''() => ({scrollWidth:document.documentElement.scrollWidth,innerWidth, h1:document.querySelectorAll('h1').length, ids:[...document.querySelectorAll('[id]')].map(e=>e.id), blank:document.querySelector('main').innerText.trim().length < 100, overflowing:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+2 && r.width>0 && getComputedStyle(e).position!=='absolute';}).slice(0,5).map(e=>e.tagName+'.'+e.className)})''')
   duplicate_ids=len(set(info['ids']))!=len(info['ids'])
   passed=info['scrollWidth']<=width+1 and info['h1']==1 and not info['blank'] and not duplicate_ids and not errors
   report['routes'].append({'route':r['url'],'width':width,'passed':passed,'scrollWidth':info['scrollWidth'],'duplicateIds':duplicate_ids,'pageErrors':errors, 'overflowing':info['overflowing'] if not passed else []})
   if width in [1440,390] and r['url'] in ['/','/solutions/ai-training/','/about/','/work/pripitch/','/perspectives/','/perspectives/beyond-the-ai-demo/','/resources/ai-pilot-acceptance-checklist/','/contact/']:
    name=r['url'].strip('/').replace('/','-') or 'home'
    page.screenshot(path=str(OUT/f'{name}-{width}.png'),full_page=True)
   page.close()
  context.close()
 # Fresh document and handlers for each interaction group.
 def new(route,width=390):
  c=b.new_context(viewport={'width':width,'height':844});c.route('**/*',lambda route:route.abort());pg=c.new_page();load(pg,route);return c,pg
 c,pg=new('/')
 def menu_test():
  pg.locator('.menu-toggle').click();assert pg.locator('#mobile-menu').is_visible();assert pg.locator('.menu-toggle').get_attribute('aria-expanded')=='true';assert pg.evaluate('getComputedStyle(document.body).overflow')=='hidden';pg.keyboard.press('Escape');assert not pg.locator('#mobile-menu').is_visible();assert pg.evaluate('document.activeElement.classList.contains("menu-toggle")')
 check('Mobile menu opens, locks scroll, closes with Escape and restores focus',menu_test);c.close()
 c,pg=new('/perspectives/',1440)
 def filters_test():
  assert pg.locator('#article-list .article-card:visible').count()==6
  pg.locator('#journal-search').fill('handoff');assert pg.locator('#article-list .article-card:visible').count()>=1
  pg.locator('#journal-search').fill('zzzz-no-match');assert pg.locator('#article-list .article-card:visible').count()==0;assert pg.locator('.empty-state').is_visible()
  pg.locator('[data-reset-filters]').click();assert pg.locator('#article-list .article-card:visible').count()==6
  pg.locator('.filter').nth(1).click();assert pg.locator('.filter').nth(1).get_attribute('aria-pressed')=='true';assert pg.locator('#article-list .article-card:visible').count()<6
 check('Journal search, topic filters, empty state and reset',filters_test);c.close()
 c,pg=new('/contact/',1440)
 def enquiry_test():
  pg.locator('button[type=submit]').click();assert pg.locator('#form-errors').is_visible();assert pg.locator('#name').get_attribute('aria-invalid')=='true'
  pg.locator('#name').fill('Alex Example');pg.locator('#email').fill('alex@example.com');pg.locator('#message').fill('We would like to explore practical AI training for our operations team.');pg.locator('button[type=submit]').click()
  assert pg.locator('#enquiry-result').is_visible();assert 'not been sent' in pg.locator('#enquiry-result').inner_text();link=pg.locator('#enquiry-result a').get_attribute('href');assert link.startswith('mailto:amirg@ragmedium.com?subject=');assert 'alex%40example.com' in link
 check('Accessible enquiry validation and honest prepared email with correct recipient',enquiry_test);c.close()
 c,pg=new('/resources/ai-pilot-acceptance-checklist/',1440)
 def resource_test():
  pg.locator('[name=worksheet-0]').fill('Example pilot');pg.locator('#note-0').fill('This is a local note.');pg.evaluate("window.dispatchEvent(new Event('beforeprint'))");assert pg.locator('.print-value').count()>0;assert 'This is a local note.' in pg.locator('.print-value').all_text_contents();pg.evaluate("window.dispatchEvent(new Event('afterprint'))");assert pg.locator('.print-value').count()==0
  pg.on('dialog',lambda d:d.accept());pg.locator('[data-clear-notes]').click();assert pg.locator('#note-0').input_value()==''
 check('Worksheet notes, unclipped print text and confirmed reset',resource_test);c.close()
 c,pg=new('/solutions/ai-training/',390)
 def accordion_test():
  second=pg.locator('.curriculum details').nth(1);second.locator('summary').click();assert second.get_attribute('open') is not None
 check('Native service curriculum accordion works',accordion_test);c.close()
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');c.route('**/*',lambda route:route.abort());pg=c.new_page();load(pg,'/')
 def motion_test():assert pg.evaluate('getComputedStyle(document.documentElement).scrollBehavior')=='auto'
 check('Reduced-motion setting removes smooth scrolling',motion_test);c.close()
 b.close()

report['http']=[]
for r in ROUTES:
 try:
  with urllib.request.urlopen('http://localhost:3000'+r['url']) as response:status=response.status
 except urllib.error.HTTPError as e:status=e.code
 report['http'].append({'route':r['url'],'status':status,'passed':status==200})
try:urllib.request.urlopen('http://localhost:3000/this-does-not-exist/')
except urllib.error.HTTPError as e:report['http'].append({'route':'/this-does-not-exist/','status':e.code,'passed':e.code==404})
report['summary']={'renderCases':len(report['routes']),'renderPasses':sum(x['passed'] for x in report['routes']),'interactionCases':len(report['interactions']),'interactionPasses':sum(x['passed'] for x in report['interactions']),'httpCases':len(report['http']),'httpPasses':sum(x['passed'] for x in report['http'])}
(ROOT/'qa/browser-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report['summary'],indent=2))
for x in report['routes']+report['interactions']:
 if not x['passed']:print('FAIL',x)
