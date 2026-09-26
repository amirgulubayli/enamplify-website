from playwright.sync_api import sync_playwright
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
PREVIEW=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT.parent/'Enamplify_Website_Preview.html'
import json
report=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1054});page.route('https://**/*',lambda r:r.abort())
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(PREVIEW.read_text(),wait_until='domcontentloaded')
 f=page.frame_locator('#website');f.locator('h1').wait_for();assert 'Human potential' in f.locator('h1').inner_text()
 f.locator('.desktop-nav a').filter(has_text='Solutions').click();f.locator('h1').filter(has_text='Different starting points').wait_for();report.append('Internal navigation works in the self-contained preview')
 page.locator('#page-picker').select_option('/perspectives/');f.locator('#journal-search').wait_for();f.locator('html[data-enamplify-ready=true]').wait_for();f.locator('#journal-search').fill('zzzz');assert f.locator('.empty-state').is_visible();report.append('Preview journal search works')
 page.locator('#mobile').click();page.wait_for_function("Math.round(document.querySelector('#website').getBoundingClientRect().width) === 390");assert round(page.locator('#website').bounding_box()['width'])==390;report.append('Mobile preview viewport is 390px')
 page.locator('#page-picker').select_option('/resources/ai-pilot-acceptance-checklist/');f.locator('a[download]').wait_for();assert f.locator('a[download]').get_attribute('href').startswith('data:application/pdf;base64,');report.append('PDF downloads are embedded in the standalone preview')
 page.locator('#page-picker').select_option('/');f.locator('h1').filter(has_text='Human potential').wait_for();page.locator('#desktop').click()
 page.screenshot(path=str(ROOT/'qa/screenshots/preview.png'))
 print(json.dumps({'passed':report,'pageErrors':errors},indent=2));assert not errors
 b.close()
