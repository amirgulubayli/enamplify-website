"""Renders public/images/social-card.png (1200x630) in the Board Pack style with Playwright."""
import base64
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "public/fonts"


def _data_uri(path: Path) -> str:
    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:font/woff2;base64,{b64}"


DISPLAY_FONT = _data_uri(FONTS / "schibsted-grotesk-latin.woff2")
TEXT_FONT = _data_uri(FONTS / "public-sans-latin.woff2")

HTML = f"""<!doctype html><html><head><style>
@font-face{{font-family:D;src:url('{DISPLAY_FONT}')}}
@font-face{{font-family:T;src:url('{TEXT_FONT}')}}
body{{margin:0;width:1200px;height:630px;background:#fff;font-family:T;color:#1a2633}}
.f{{box-sizing:border-box;height:630px;padding:64px 72px;display:grid;grid-template-rows:auto 1fr auto}}
.w{{font:700 34px D;color:#0a1f33;letter-spacing:-.02em}}
h1{{align-self:center;margin:0;font:650 84px/1.02 D;letter-spacing:-.03em;color:#0a1f33}}
h1 span{{display:block;color:#556474}}
.b{{display:flex;justify-content:space-between;align-items:end;border-top:2px solid #0a1f33;padding-top:18px;font-size:22px}}
.bar{{display:flex;width:420px;height:22px;gap:3px}}.bar i{{display:block}}
</style></head><body><div class="f"><div class="w">Enamplify</div>
<h1>AI your team builds.<span>Not AI you buy.</span></h1>
<div class="b"><span>AI enablement for mid-sized organisations · London · Baku</span>
<div class="bar"><i style="flex:41;background:#0a1f33"></i><i style="flex:50;background:#1f5eff"></i><i style="flex:9;background:#a8b4c0"></i></div></div></div></body></html>"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 630})
    page.set_content(HTML)
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(300)
    page.screenshot(path=str(ROOT / "public/images/social-card.png"))
    browser.close()
print("wrote public/images/social-card.png")
