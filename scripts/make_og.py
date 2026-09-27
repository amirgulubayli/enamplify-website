"""Renders the oxblood social cards (1200x630) with Playwright.

  public/images/social-card.png      English
  public/images/social-card-az.png   Azerbaijani

Paper ground, the wine Caslon wordmark, the home headline with its second line
in wine Caslon Text italic, a hairline and the two cities along the foot, and a
thin strip of the two graded hero photographs (London, Baku) down the right
edge. Headline and city names come from content/copy/<code>.json and
content/<code>/site.json, so the cards always match the site. Fonts and photos
are embedded as data URIs; nothing is fetched. Provenance is embedded in each
PNG with `impeccable embed-prompt`.
"""
import base64
import json
import os
import shutil
import subprocess
import tempfile
from html import escape
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
FONTS = PUBLIC / "fonts"
RANGES = json.loads((FONTS / "unicode-ranges.json").read_text(encoding="utf-8"))
IMAGES = json.loads((ROOT / "content/images.json").read_text(encoding="utf-8"))
IMPECCABLE = Path.home() / ".claude/plugins/cache/impeccable/impeccable/4.3.1/skills/impeccable/scripts/impeccable"
BASH = next((b for b in (os.environ.get("BASH_EXE"), "C:/Program Files/Git/bin/bash.exe", shutil.which("bash")) if b and Path(b).exists()), "bash")

CARDS = {"en": "social-card.png", "az": "social-card-az.png"}


def uri(path: Path, mime: str) -> str:
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def faces() -> str:
    out = []
    for family, stem, style in (("D", "libre-caslon-display-400", "normal"), ("I", "libre-caslon-text-400italic", "italic"), ("T", "dm-sans-var", "normal")):
        for subset in ("latin", "latin-ext"):
            name = f"{stem}-{subset}.woff2"
            out.append(f"@font-face{{font-family:{family};src:url('{uri(FONTS / name, 'font/woff2')}');font-style:{style};"
                       f"font-weight:{'400 700' if family == 'T' else '400'};unicode-range:{RANGES[name]}}}")
    return "".join(out)


def photo(id_: str) -> str:
    files = IMAGES[id_]["files"]
    return uri(PUBLIC / files[max(files, key=int)].lstrip("/"), "image/webp")


def card(code: str) -> str:
    copy = json.loads((ROOT / "content/copy" / f"{code}.json").read_text(encoding="utf-8"))
    site_path = ROOT / "content" / ("site.json" if code == "en" else f"{code}/site.json")
    cities = json.loads(site_path.read_text(encoding="utf-8")).get("cities") or ["London", "Baku"]
    home = copy["home"]
    return f"""<!doctype html><html lang="{code}"><head><meta charset="utf-8"><style>{faces()}
*{{box-sizing:border-box}}
body{{margin:0;width:1200px;height:630px;background:#f3eee5;color:#242321;font-family:T;-webkit-font-smoothing:antialiased;display:grid;grid-template-columns:1fr 340px}}
.copy{{padding:60px 64px 52px 72px;display:grid;grid-template-rows:auto 1fr auto}}
.w{{font:400 44px/1 D;letter-spacing:-.035em;color:#502d36}}
h1{{align-self:center;margin:0;font:400 {84 if code == 'en' else 70}px/1.04 D;letter-spacing:-.02em;text-wrap:balance}}
h1 span{{display:block;font-family:I;font-style:italic;color:#502d36;letter-spacing:-.012em}}
.foot{{display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid #d6ccbf;padding-top:18px;font-size:21px;color:#696058}}
.foot b{{font:italic 400 24px I;color:#502d36}}
.strip{{display:grid;grid-template-columns:1fr 1fr;gap:8px;height:630px}}
.strip img{{width:100%;height:630px;object-fit:cover;display:block}}
.strip img+img{{object-position:40% 50%}}
</style></head><body>
<div class="copy"><div class="w">Enamplify</div>
<h1>{escape(home['heroTitle'])}<span>{escape(home['heroTitleAlt'])}</span></h1>
<div class="foot"><b>{' · '.join(escape(c) for c in cities)}</b><span>enamplify.com</span></div></div>
<div class="strip"><img src="{photo('hero-london')}" alt=""><img src="{photo('hero-baku')}" alt=""></div>
</body></html>"""


def provenance(code: str) -> str:
    credits = "; ".join(f"{IMAGES[i]['credit']['name']} ({IMAGES[i]['credit']['source']}, {IMAGES[i]['credit']['license']})" for i in ("hero-london", "hero-baku"))
    return (f"Enamplify social card ({code}), rendered by scripts/make_og.py in Chromium from HTML: the site's own copy set in "
            f"Libre Caslon Display, Libre Caslon Text italic and DM Sans (SIL OFL), with the graded hero photographs by {credits}. "
            "No generative model.")


def embed(path: Path, text: str) -> None:
    if not IMPECCABLE.exists():
        print("impeccable CLI not found; provenance not embedded in", path.name)
        return
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(text)
        tmp = f.name
    try:
        r = subprocess.run([BASH, str(IMPECCABLE), "embed-prompt", str(path), "--prompt-file", tmp], capture_output=True, text=True, encoding="utf-8")
        print(("embedded provenance in " + path.name) if r.returncode == 0 else ("embed-prompt failed: " + (r.stderr or r.stdout).strip()))
    finally:
        os.unlink(tmp)


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 630})
        for code, name in CARDS.items():
            page.set_content(card(code))
            page.evaluate("document.fonts.ready")
            page.wait_for_function("[...document.images].every(i => i.complete)")
            page.wait_for_timeout(300)
            out = PUBLIC / "images" / name
            page.screenshot(path=str(out))
            print(f"wrote public/images/{name}")
            embed(out, provenance(code))
        browser.close()


if __name__ == "__main__":
    main()
