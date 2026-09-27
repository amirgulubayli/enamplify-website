"""Writes the Board Pack favicon set with Playwright.

The mark is a navy (#0a1f33) square with square corners and a white "E"
traced from Schibsted Grotesk Bold (weight 700): a stem and three bars whose
proportions follow the font's glyph (stem 0.21 of cap height, bars 0.17 to
0.18, middle bar shorter than top and bottom). The E is a <path>, so the SVGs
do not depend on fonts. It sits one unit right of geometric centre to balance
the open right side of the letter.

Outputs:
  public/favicon.svg, public/brand-mark.svg   the mark as SVG
  public/favicon.png (32x32)                  rendered from the SVG
  public/apple-touch-icon.png (180x180)       rendered from the SVG

Run with --compare OUT.png to render the traced path over the real font glyph
(embedded as a base64 data URI, as scripts/make_og.py does) for checking.
"""
import base64
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
FONTS = PUBLIC / "fonts"

NAVY = "#0a1f33"
WHITE = "#ffffff"

# 64-unit grid. Cap height 36 (y 14 to 50); even coordinates keep the
# 32px favicon on whole pixels.
E_PATH = "M20 14H46V20H28V28H43V34H28V44H46V50H20Z"

MARK = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
    f'<rect width="64" height="64" fill="{NAVY}"/>'
    f'<path d="{E_PATH}" fill="{WHITE}"/>'
    "</svg>\n"
)


def _data_uri(path: Path) -> str:
    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:font/woff2;base64,{b64}"


def _svg_uri(svg: str) -> str:
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode("utf-8")).decode("ascii")


def render_png(page, size: int, out: Path) -> None:
    page.set_viewport_size({"width": size, "height": size})
    page.set_content(
        "<!doctype html><html><head><style>html,body{margin:0;background:transparent}"
        "img{display:block;width:100vw;height:100vh}</style></head>"
        f'<body><img src="{_svg_uri(MARK)}" alt=""></body></html>'
    )
    page.wait_for_function("document.images[0].complete")
    page.screenshot(path=str(out), omit_background=True)


def render_compare(page, out: Path) -> None:
    """Traced path (translucent white) over the font's bold E (red), 640px."""
    font = _data_uri(FONTS / "schibsted-grotesk-latin.woff2")
    reference = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="640" height="640">'
        f'<rect width="64" height="64" fill="{NAVY}"/>'
        '<text x="16.4" y="50" font-family="D" font-weight="700" font-size="51.2" fill="#e5484d">E</text>'
        f'<path d="{E_PATH}" fill="{WHITE}" fill-opacity=".6"/>'
        "</svg>"
    )
    page.set_viewport_size({"width": 640, "height": 640})
    page.set_content(
        f"<!doctype html><html><head><style>@font-face{{font-family:D;src:url('{font}');font-weight:100 900}}"
        f"body{{margin:0}}</style></head><body>{reference}</body></html>"
    )
    page.evaluate("document.fonts.load('700 50px D')")
    page.wait_for_timeout(300)
    page.screenshot(path=str(out))


def main() -> None:
    for name in ("favicon.svg", "brand-mark.svg"):
        (PUBLIC / name).write_text(MARK, encoding="utf-8", newline="\n")
        print(f"wrote public/{name}")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(device_scale_factor=1)
        render_png(page, 32, PUBLIC / "favicon.png")
        print("wrote public/favicon.png")
        render_png(page, 180, PUBLIC / "apple-touch-icon.png")
        print("wrote public/apple-touch-icon.png")
        if "--compare" in sys.argv:
            out = Path(sys.argv[sys.argv.index("--compare") + 1])
            render_compare(page, out)
            print(f"wrote {out}")
        browser.close()


if __name__ == "__main__":
    main()
