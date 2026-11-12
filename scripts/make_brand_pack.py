"""Writes the Enamplify brand pack into brand/ (not deployed).

The E is the same traced Libre Caslon Display glyph as the favicon (see
make_icons.py), so every file here matches the site exactly.

  brand/mark/        the E mark: wine square + paper E, and the inverse
                     (paper square + wine E); plus the bare E in wine and in
                     paper on a transparent ground. SVG, and PNG at 256-2048.
  brand/wordmark/    "Enamplify" in Libre Caslon Display as on the site header:
                     ink and wine on transparent, paper on transparent, and on
                     the wine and paper grounds. PNG at 2x and 4x.
  brand/lockup/      mark beside the wordmark, both colourways.
  brand/social/      LinkedIn/X avatar (400) and banners (1584x396, 1500x500).
  brand/colours.txt  the palette.
  brand/preview.png  a contact sheet of the pack.
  enamplify-brand-pack.zip at the repo root.
"""
import base64
import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright

from make_icons import PUBLIC, e_path, svg_uri

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "brand"

WINE = "#502d36"
WINE_DEEP = "#3c2229"
PAPER = "#f3eee5"
INK = "#242321"
BRONZE = "#9b8269"
FONT = PUBLIC / "fonts/libre-caslon-display-400-latin.woff2"
SANS = PUBLIC / "fonts/dm-sans-var-latin.woff2"
SIZES = (256, 512, 1024, 2048)


def font_face() -> str:
    uri = lambda f: "data:font/woff2;base64," + base64.b64encode(f.read_bytes()).decode("ascii")
    return (f"@font-face{{font-family:D;src:url('{uri(FONT)}')}}"
            f"@font-face{{font-family:S;font-weight:100 900;src:url('{uri(SANS)}')}}")


def square(path: str, ground: str | None, letter: str) -> str:
    rect = f'<rect width="64" height="64" fill="{ground}"/>' if ground else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">{rect}<path d="{path}" fill="{letter}"/></svg>\n'


def shoot(page, html: str, w: int, h: int, out: Path, transparent: bool = False, scale: int = 1) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    page.set_viewport_size({"width": w, "height": h})
    page.set_content(f"<!doctype html><style>{font_face()}html,body{{margin:0;background:transparent}}</style>{html}")
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(150)
    page.screenshot(path=str(out), omit_background=transparent)
    print("wrote", out.relative_to(ROOT))


def wordmark_html(color: str, px: int, ground: str = "transparent", pad: float = 0.35) -> str:
    # Same letterform settings as .wordmark in assets/styles.css
    return (f'<div style="display:inline-block;background:{ground};padding:{px*pad:.0f}px {px*pad*1.4:.0f}px">'
            f'<span style="font:400 {px}px/1 D;letter-spacing:-.03em;color:{color};'
            f'-webkit-text-stroke:.012em {color};display:block;padding-bottom:.08em">Enamplify</span></div>')


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(device_scale_factor=1)
        path = e_path(page)

        marks = {
            "enamplify-mark-wine": square(path, WINE, PAPER),        # primary: paper E on wine
            "enamplify-mark-paper": square(path, PAPER, WINE),       # inverted: wine E on paper
            "enamplify-mark-ink": square(path, INK, PAPER),          # one-colour dark alternative
            "enamplify-e-wine": square(path, None, WINE),            # bare E, transparent
            "enamplify-e-paper": square(path, None, PAPER),
        }
        for name, svg in marks.items():
            (OUT / "mark").mkdir(parents=True, exist_ok=True)
            (OUT / "mark" / f"{name}.svg").write_text(svg, encoding="utf-8", newline="\n")
            for s in SIZES:
                shoot(page, f'<img src="{svg_uri(svg)}" style="display:block;width:{s}px;height:{s}px">',
                      s, s, OUT / "mark" / f"{name}-{s}.png", transparent=True)

        # Wordmarks: measure then shoot tight
        words = {
            "enamplify-wordmark-ink": (INK, "transparent"),
            "enamplify-wordmark-wine": (WINE, "transparent"),
            "enamplify-wordmark-paper": (PAPER, "transparent"),
            "enamplify-wordmark-on-wine": (PAPER, WINE),
            "enamplify-wordmark-on-paper": (WINE, PAPER),
        }
        for name, (fg, bg) in words.items():
            for label, px in (("2x", 160), ("4x", 320)):
                page.set_viewport_size({"width": 4000, "height": 1000})
                page.set_content(f"<!doctype html><style>{font_face()}body{{margin:0}}</style>{wordmark_html(fg, px, bg)}")
                page.evaluate("document.fonts.ready")
                page.wait_for_timeout(150)
                box = page.locator("div").bounding_box()
                shoot(page, wordmark_html(fg, px, bg), int(box["width"] + 0.99), int(box["height"] + 0.99),
                      OUT / "wordmark" / f"{name}-{label}.png", transparent=(bg == "transparent"))

        # Lockups: mark + wordmark on each ground
        for name, ground, word, markname in (("enamplify-lockup-on-paper", PAPER, INK, "enamplify-mark-wine"),
                                             ("enamplify-lockup-on-wine", WINE, PAPER, "enamplify-mark-paper")):
            html = (f'<div style="width:2400px;height:800px;background:{ground};display:flex;align-items:center;'
                    f'justify-content:center;gap:88px"><img src="{svg_uri(marks[markname])}" style="width:360px;height:360px">'
                    f'<span style="font:400 300px/1 D;letter-spacing:-.03em;color:{word};-webkit-text-stroke:.012em {word};'
                    f'padding-bottom:.08em">Enamplify</span></div>')
            shoot(page, html, 2400, 800, OUT / "lockup" / f"{name}.png")

        # Social
        avatar = f'<img src="{svg_uri(marks["enamplify-mark-wine"])}" style="display:block;width:400px;height:400px">'
        shoot(page, avatar, 400, 400, OUT / "social" / "avatar-400.png")
        for w, h, name in ((1584, 396, "linkedin-banner-1584x396"), (1500, 500, "x-banner-1500x500")):
            fs = int(h * 0.36)
            html = (f'<div style="width:{w}px;height:{h}px;background:{WINE};display:flex;align-items:center;'
                    f'justify-content:flex-end;padding-right:{int(w*0.07)}px;box-sizing:border-box;gap:{int(h*0.12)}px">'
                    f'<span style="font:400 {fs}px/1 D;letter-spacing:-.03em;color:{PAPER};-webkit-text-stroke:.012em {PAPER};padding-bottom:.08em">Enamplify</span>'
                    f'<span style="width:1px;height:{int(h*0.34)}px;background:{BRONZE}"></span>'
                    f'<span style="font:400 {int(fs*0.22)}px/1.5 S,sans-serif;letter-spacing:.16em;color:#e3d3d0">LONDON · BAKU</span></div>')
            shoot(page, html, w, h, OUT / "social" / f"{name}.png")

        (OUT / "colours.txt").write_text(
            "Enamplify palette\n\n"
            f"Wine (primary ground)   {WINE}   rgb(80,45,54)\n"
            f"Wine deep               {WINE_DEEP}   rgb(60,34,41)\n"
            f"Paper (letter / light)  {PAPER}   rgb(243,238,229)\n"
            f"Ink (text)              {INK}   rgb(36,35,33)\n"
            f"Bronze (rules, accents) {BRONZE}   rgb(155,130,105)\n\n"
            "Type: Libre Caslon Display (mark, wordmark, headlines), Libre Caslon Text Italic (accents),\n"
            "DM Sans (body). All SIL Open Font License; files in public/fonts/.\n\n"
            "Mark: primary is the paper E on a wine square; inverted is the wine E on paper.\n"
            "Square corners. Keep clear space of at least a quarter of the square on every side.\n"
            "The E is centred inside a circle crop, so the square files work as round avatars.\n",
            encoding="utf-8", newline="\n")

        # Contact sheet
        tiles = "".join(f'<figure style="margin:0;text-align:center"><div style="background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/20px 20px;padding:0">'
                        f'<img src="{svg_uri(svg)}" style="display:block;width:220px;height:220px"></div>'
                        f'<figcaption style="font:13px S;color:{INK};margin-top:10px">{name}</figcaption></figure>'
                        for name, svg in marks.items())
        sheet = (f'<div style="width:1400px;background:{PAPER};padding:64px;box-sizing:border-box;display:grid;gap:48px">'
                 f'<div style="display:flex;gap:40px;justify-content:space-between">{tiles}</div>'
                 f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">'
                 f'<div style="background:{PAPER};border:1px solid #d6ccbf;display:flex;align-items:center;justify-content:center;gap:28px;height:240px">'
                 f'<img src="{svg_uri(marks["enamplify-mark-wine"])}" width="110"><span style="font:400 92px/1 D;letter-spacing:-.03em;color:{INK};-webkit-text-stroke:.012em {INK}">Enamplify</span></div>'
                 f'<div style="background:{WINE};display:flex;align-items:center;justify-content:center;gap:28px;height:240px">'
                 f'<img src="{svg_uri(marks["enamplify-mark-paper"])}" width="110"><span style="font:400 92px/1 D;letter-spacing:-.03em;color:{PAPER};-webkit-text-stroke:.012em {PAPER}">Enamplify</span></div></div>'
                 f'<div style="display:flex;gap:0">' + "".join(
                     f'<div style="flex:1;background:{c};color:{t};font:14px/1.4 S;padding:20px;height:90px;box-shadow:inset 0 0 0 1px #d6ccbf">{n}<br>{c}</div>'
                     for n, c, t in (("Wine", WINE, PAPER), ("Wine deep", WINE_DEEP, PAPER), ("Paper", PAPER, INK),
                                     ("Ink", INK, PAPER), ("Bronze", BRONZE, PAPER))) + "</div></div>")
        page.set_viewport_size({"width": 1400, "height": 800})
        page.set_content(f"<!doctype html><style>{font_face()}body{{margin:0}}</style>{sheet}")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(150)
        page.locator("body > div").screenshot(path=str(OUT / "preview.png"))
        print("wrote brand/preview.png")
        browser.close()

    zip_base = ROOT / "enamplify-brand-pack"
    shutil.make_archive(str(zip_base), "zip", OUT)
    print("wrote", zip_base.with_suffix(".zip").name)


if __name__ == "__main__":
    main()
