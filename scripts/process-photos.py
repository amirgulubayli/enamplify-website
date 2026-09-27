"""Crops, grades and exports the London and Baku city photographs.

Usage:
  python scripts/process-photos.py [SOURCE_DIR] [--sheet OUT.jpg] [--impeccable-sidecar]

SOURCE_DIR holds the 2400px Unsplash originals and manifest.json (photographer,
photographerUrl, pageUrl, imageUrl, license). Outputs go to public/images/city/
as <id>-<width>.webp; metadata (files, size, alt, caption, credit) goes to
content/images.json. Re-running overwrites both.

The grade is deliberately light, so the pictures still read as photographs:
  1. saturation down (SATURATION),
  2. contrast softened slightly (CONTRAST),
  3. a luminance-weighted split tone: shadows pulled toward wine-deep #3c2229,
     highlights toward paper #f3eee5, each capped at SHADOW_MAX / HIGHLIGHT_MAX.

Provenance (photographer, source page, licence, processing) is written into each
WebP as an XMP packet (dc:creator, dc:source, dc:rights, dc:description) and is
also recorded in content/images.json. `impeccable embed-prompt` cannot embed in
WebP (it falls back to a <file>.webp.json sidecar), so it is only run with
--impeccable-sidecar, which writes those sidecars next to the images.
Pure PIL; no numpy.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public/images/city"
JSON_OUT = ROOT / "content/images.json"
DEFAULT_SRC = Path(
    os.environ.get("LOCALAPPDATA", "")
    + "/Temp/claude/C--RAG-code-Enamplify-Website-Source-Updated-enamplify/"
    "c95e408e-98c4-40a7-9e9b-b2503a4547ce/scratchpad/photos"
)
IMPECCABLE = Path.home() / ".claude/plugins/cache/impeccable/impeccable/4.3.1/skills/impeccable/scripts/impeccable"

# Palette (spec 12.1)
PAPER = (0xF3, 0xEE, 0xE5)
WINE_DEEP = (0x3C, 0x22, 0x29)

# Grade parameters, shared by all eight images
SATURATION = 0.82      # 1.0 = unchanged; 0.82 = 18% less saturated
CONTRAST = 0.94        # 1.0 = unchanged; slight softening
SHADOW_MAX = 0.14      # max blend toward wine-deep, at black, falling off as (1-L)^2
HIGHLIGHT_MAX = 0.12   # max blend toward paper, at white, falling off as L^2

QUALITY = 78
WIDTHS = {"4:5": [640, 1024, 1600], "21:9": [640, 1024, 1600, 2400]}
RATIOS = {"4:5": 4 / 5, "21:9": 21 / 9}
# KB budgets: (width checked, max KB)
BUDGETS = {"4:5": (1024, 180), "21:9": (1600, 260)}

# Crop boxes as fractions of the source (left, top, right, bottom). The script
# snaps the box to the exact aspect by adjusting the bottom edge, and fails if
# that moves it by more than 1% of the height, so the numbers below are honest.
IMAGES = {
    "hero-london": {
        "file": "london-04.jpg", "aspect": "4:5",
        # Royal Exchange portico, pediment to column bases. The bottom stops at the
        # top of the plinth, just above the heads of the people on the pavement;
        # that caps the crop at 958px wide, so it also exports at native width.
        "crop": (0.2100, 0.000, 0.6092, 0.665),
        "alt": {
            "en": "The Royal Exchange portico at Bank junction in the City of London, its Corinthian columns lit by low evening sun",
            "az": "London Sitisində, Bank qovşağında Kral Birjasının portiki; Korinf sütunları axşamın alçaq günəşi ilə işıqlanır",
        },
        "caption": {"en": "The Royal Exchange, London", "az": "Kral Birjası, London"},
    },
    "hero-baku": {
        "file": "baku-03.jpg", "aspect": "4:5",
        # The ornate sandstone facade opposite the Maiden Tower, whole, with its
        # corner turret; the parked cars along the bottom are out. The tower
        # itself is outside the frame (it cannot share 4:5 with the full facade).
        "crop": (0.515, 0.020, 0.985, 0.900),
        "alt": {
            "en": "An ornate sandstone building with a corner turret near the Maiden Tower in Baku, in warm evening light",
            "az": "Bakıda, Qız qalası yaxınlığında künc qülləli, naxışlı qumdaşı bina; axşamın isti işığında",
        },
        "caption": {"en": "Near the Maiden Tower, Baku", "az": "Qız qalası yaxınlığında, Bakı"},
    },
    "about-london": {
        "file": "london-01.jpg", "aspect": "4:5",
        # The Gherkin, Leadenhall and 22 Bishopsgate against the dusk sky.
        "crop": (0.215, 0.000, 0.748, 1.000),
        "alt": {
            "en": "The City of London towers at dusk, including 30 St Mary Axe and 22 Bishopsgate, with lit office windows",
            "az": "Axşam çağı London Sitisinin göydələnləri, o cümlədən 30 St Mary Axe və 22 Bishopsgate; ofis pəncərələrində işıq yanır",
        },
        "caption": {"en": "The City of London at dusk", "az": "Axşam çağı London Siti"},
    },
    "about-baku": {
        "file": "baku-04.jpg", "aspect": "4:5",
        # Flame Towers silhouetted over the lit facades; car lights are out.
        "crop": (0.290, 0.130, 0.757, 0.908),
        "alt": {
            "en": "The Flame Towers silhouetted at dusk above lit historic facades in central Baku",
            "az": "Alaqaranlıqda Bakının mərkəzində işıqlandırılmış tarixi binaların üzərində Alov qüllələrinin siluetləri",
        },
        "caption": {"en": "Flame Towers, Baku", "az": "Alov qüllələri, Bakı"},
    },
    "band-approach": {
        "file": "london-06.jpg", "aspect": "21:9",
        # Colonnade vanishing toward the lantern and the river.
        "crop": (0.000, 0.190, 1.000, 0.833),
        "alt": {
            "en": "A Portland stone colonnade in London, its columns receding toward a hanging lantern and trees beyond",
            "az": "Londonda Portlend daşından sütunlu qalereya; sütunlar asılmış fənərə və arxadakı ağaclara doğru uzanır",
        },
        "caption": {"en": "A colonnade in London", "az": "London, sütunlu qalereya"},
    },
    "band-work": {
        "file": "baku-01.jpg", "aspect": "21:9",
        # Flame Towers with the evening horizon; the dense foreground is trimmed.
        "crop": (0.000, 0.200, 1.000, 0.800),
        "alt": {
            "en": "The three Flame Towers above central Baku at golden hour, with the city and hills behind",
            "az": "Qürub çağı Bakının mərkəzi üzərində üç Alov qülləsi; arxada şəhər və təpələr görünür",
        },
        "caption": {"en": "Baku at golden hour", "az": "Qürub çağı Bakı"},
    },
    "band-insights": {
        "file": "london-03.jpg", "aspect": "21:9",
        # Skyline from the Walkie-Talkie to the Gherkin, with a strip of river.
        "crop": (0.000, 0.060, 1.000, 0.822),
        "alt": {
            "en": "The City of London skyline seen across the Thames, from 20 Fenchurch Street to 30 St Mary Axe",
            "az": "Temza çayının o tayından London Sitisinin siluetinə görünüş: 20 Fenchurch Street binasından 30 St Mary Axe binasınadək",
        },
        "caption": {"en": "The City of London from the Thames", "az": "Temza çayından London Siti"},
    },
    "band-contact": {
        "file": "baku-06.jpg", "aspect": "21:9",
        # Government House facade and the edge of the fountain pool.
        "crop": (0.000, 0.010, 1.000, 0.581),
        "alt": {
            "en": "Government House in Baku at dusk, seen from across a fountain pool",
            "az": "Alaqaranlıqda fəvvarə hovuzunun o tayından Bakıdakı Hökumət evinə görünüş",
        },
        "caption": {"en": "Government House, Baku", "az": "Hökumət evi, Bakı"},
    },
}


def crop_box(size, frac, aspect):
    w, h = size
    left, top, right, bottom = frac
    x0, x1 = round(left * w), round(right * w)
    cw = x1 - x0
    ch = round(cw / RATIOS[aspect])
    y0 = round(top * h)
    y1 = y0 + ch
    if abs(y1 - bottom * h) > 0.01 * h or y1 > h or x1 > w:
        raise SystemExit(f"crop {frac} does not fit {aspect} on {size}: bottom would be {y1 / h:.3f}")
    return (x0, y0, x1, y1)


def grade(im):
    im = ImageEnhance.Color(im).enhance(SATURATION)
    im = ImageEnhance.Contrast(im).enhance(CONTRAST)
    lum = im.convert("L")
    shadow = lum.point(lambda v: round(255 * SHADOW_MAX * (1 - v / 255) ** 2))
    high = lum.point(lambda v: round(255 * HIGHLIGHT_MAX * (v / 255) ** 2))
    im = Image.composite(Image.new("RGB", im.size, WINE_DEEP), im, shadow)
    im = Image.composite(Image.new("RGB", im.size, PAPER), im, high)
    return im


def xmp_packet(meta, text):
    from xml.sax.saxutils import escape as e
    return (
        '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>'
        '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
        '<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" '
        'xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/">'
        f'<dc:creator><rdf:Seq><rdf:li>{e(meta["photographer"])}</rdf:li></rdf:Seq></dc:creator>'
        f'<dc:source>{e(meta["pageUrl"])}</dc:source>'
        f'<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">{e(meta["license"])}</rdf:li></rdf:Alt></dc:rights>'
        f'<dc:description><rdf:Alt><rdf:li xml:lang="x-default">{e(text)}</rdf:li></rdf:Alt></dc:description>'
        f'<xmpRights:WebStatement>{e(meta["pageUrl"])}</xmpRights:WebStatement>'
        '</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>'
    ).encode("utf-8")


def embed(path, text):
    if not IMPECCABLE.exists():
        return "impeccable CLI not found"
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(text)
        tmp = f.name
    try:
        r = subprocess.run(["bash", str(IMPECCABLE), "embed-prompt", str(path), "--prompt-file", tmp],
                           capture_output=True, text=True, encoding="utf-8")
        return None if r.returncode == 0 else (r.stderr or r.stdout).strip()
    finally:
        os.unlink(tmp)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("source", nargs="?", type=Path, default=DEFAULT_SRC)
    ap.add_argument("--sheet", type=Path, help="write a JPEG review sheet here")
    ap.add_argument("--impeccable-sidecar", action="store_true")
    opts = ap.parse_args()
    src, sheet, do_embed = opts.source, opts.sheet, opts.impeccable_sidecar
    manifest = {m["file"]: m for m in json.loads((src / "manifest.json").read_text(encoding="utf-8"))}
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    data, previews, embed_errors = {}, {}, {}
    for id_, spec in IMAGES.items():
        meta = manifest[spec["file"]]
        orig = Image.open(src / spec["file"]).convert("RGB")
        box = crop_box(orig.size, spec["crop"], spec["aspect"])
        cropped = orig.crop(box)
        graded = grade(cropped)
        native = cropped.width
        widths = [w for w in WIDTHS[spec["aspect"]] if w <= native]
        # A crop narrower than the budget width would otherwise stop at 640;
        # add its native width so there is still a large, never-upscaled file.
        if native < BUDGETS[spec["aspect"]][0] and native not in widths:
            widths.append(native)
        files, largest = {}, None
        prov = (f"Photograph by {meta['photographer']} ({meta['pageUrl']}), {meta['license']}. "
                f"Cropped (source fractions l,t,r,b = {', '.join(f'{v:g}' for v in spec['crop'])}) and colour-graded "
                f"by scripts/process-photos.py for Enamplify; no generative model.")
        xmp = xmp_packet(meta, prov)
        budget_w, budget_kb = BUDGETS[spec["aspect"]]
        for w in widths:
            h = round(w / RATIOS[spec["aspect"]])
            out = graded.resize((w, h), Image.LANCZOS)
            path = OUT_DIR / f"{id_}-{w}.webp"
            q = QUALITY
            while True:
                out.save(path, "WEBP", quality=q, method=6, xmp=xmp)
                if w < min(budget_w, native) or path.stat().st_size <= budget_kb * 1024 or q <= 60:
                    break
                q -= 4
            if do_embed:
                err = embed(path, prov)
                if err:
                    embed_errors[path.name] = err
            files[str(w)] = f"/images/city/{id_}-{w}.webp"
            largest = (w, h)
            print(f"{path.name:28s} {w}x{h}  q{q}  {path.stat().st_size / 1024:6.1f} KB")
            if w == 1024 or w == widths[-1]:
                previews[id_] = (out, cropped, orig, box)
        data[id_] = {
            "files": files,
            "width": largest[0],
            "height": largest[1],
            "alt": spec["alt"],
            "caption": spec["caption"],
            "credit": {
                "name": meta["photographer"],
                "url": meta["photographerUrl"],
                "source": meta["pageUrl"],
                "license": meta["license"],
            },
            "provenance": prov,
        }

    JSON_OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {JSON_OUT.relative_to(ROOT)}")
    if embed_errors:
        print("embed-prompt failed for", len(embed_errors), "files; first error:", next(iter(embed_errors.values())))
    if sheet:
        make_sheet(sheet, previews)


def make_sheet(path, previews):
    try:
        font = ImageFont.truetype("arial.ttf", 22)
    except OSError:
        font = ImageFont.load_default()
    cell_h, pad, label = 520, 16, 34
    tiles = []
    # before/after for hero-london, then source with crop box
    g, c, orig, box = previews["hero-london"]
    before = c.resize(g.size, Image.LANCZOS)
    tiles.append(("hero-london BEFORE (crop, ungraded)", before))
    tiles.append(("hero-london AFTER", g))
    for id_, (g, c, orig, box) in previews.items():
        src = orig.copy()
        ImageDraw.Draw(src).rectangle(box, outline=(255, 40, 40), width=8)
        tiles.append((f"{id_} source + crop", src))
        tiles.append((id_, g))
    scaled = []
    for name, im in tiles:
        s = cell_h / im.height
        scaled.append((name, im.resize((round(im.width * s), cell_h), Image.LANCZOS)))
    cols = 4
    rows = [scaled[i:i + cols] for i in range(0, len(scaled), cols)]
    W = max(sum(t.width for _, t in r) + pad * (len(r) + 1) for r in rows)
    H = len(rows) * (cell_h + label + pad) + pad
    sheet = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(sheet)
    y = pad
    for r in rows:
        x = pad
        for name, t in r:
            d.text((x, y), name, fill=WINE_DEEP, font=font)
            sheet.paste(t, (x, y + label))
            x += t.width + pad
        y += cell_h + label + pad
    sheet.save(path, quality=86)
    print(f"wrote {path}")


if __name__ == "__main__":
    main()
