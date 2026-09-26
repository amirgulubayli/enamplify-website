"""Regenerate original PNG brand assets and the printable field guides.
Requires Pillow and ReportLab only for regeneration; not needed by the website build.
No font files are copied into the project.
"""
from pathlib import Path
import json, subprocess, textwrap
from html import escape
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_LEFT

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'public'
(OUT/'images').mkdir(exist_ok=True,parents=True)
(OUT/'downloads').mkdir(exist_ok=True,parents=True)
RESOURCES=json.loads((ROOT/'content/resources.json').read_text())
PARCHMENT='#F3EEE5'; INK='#242321'; OXBLOOD='#502D36'; STONE='#C9BEAD'; MUTED='#665E55'
mark_path='M11 9h54v17h-1C61 12 54 11 42 11H31v29h7c11 0 16-3 19-12h1v28h-1c-3-11-8-14-19-14h-7v31h12c13 0 19-5 23-19h1l-2 21H11v-2c9 0 10-2 10-9V21c0-8-1-10-10-10V9Z'
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="9" fill="{OXBLOOD}"/><path d="{mark_path}" transform="translate(10 5)" fill="{PARCHMENT}"/></svg>'
(OUT/'favicon.svg').write_text(svg)
(OUT/'brand-mark.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76 86"><path d="{mark_path}" fill="{OXBLOOD}"/></svg>')
try:
 import cairosvg
 for name,size in [('favicon.png',32),('apple-touch-icon.png',180)]:
  cairosvg.svg2png(bytestring=svg.encode(),write_to=str(OUT/name),output_width=size,output_height=size)
except ImportError:
 for name,size in [('favicon.png',32),('apple-touch-icon.png',180)]:
  im=Image.new('RGB',(size,size),OXBLOOD);ImageDraw.Draw(im).text((size*.3,size*.18),'E',fill=PARCHMENT);im.save(OUT/name)

def font(family,size):
 p=subprocess.check_output(['fc-match',family,'-f','%{file}']).decode().strip()
 return ImageFont.truetype(p,size)
im=Image.new('RGB',(1200,630),PARCHMENT);d=ImageDraw.Draw(im)
d.rectangle((980,0,1200,630),fill=OXBLOOD)
d.text((65,46),'Enamplify',font=font('EB Garamond',53),fill=INK)
d.line((65,125,915,125),fill=STONE,width=1)
d.text((67,181),'Human potential.',font=font('EB Garamond',88),fill=INK)
d.text((67,283),'Thoughtfully',font=font('EB Garamond:style=Italic',88),fill=OXBLOOD)
d.text((67,375),'advanced.',font=font('EB Garamond:style=Italic',88),fill=OXBLOOD)
d.text((70,556),'AI education & advisory',font=font('DejaVu Sans',16),fill=MUTED)
d.text((1028,226),'E',font=font('EB Garamond',136),fill=PARCHMENT)
im.save(OUT/'images/social-card.png',optimize=True)

P=ParagraphStyle('body',fontName='Helvetica',fontSize=9.5,leading=14.3,textColor=HexColor(INK))
TITLE=ParagraphStyle('title',fontName='Times-Roman',fontSize=29,leading=30,textColor=HexColor(INK))
H=ParagraphStyle('heading',fontName='Times-Roman',fontSize=19,leading=22,textColor=HexColor(INK))
SMALL=ParagraphStyle('small',fontName='Helvetica',fontSize=8,leading=11,textColor=HexColor(MUTED))

def text(c,text,x,y,width,style=P):
 p=Paragraph(escape(text).replace('\n','<br/>'),style);w,h=p.wrap(width,800);p.drawOn(c,x,y-h);return y-h

def label(c,t,x,y):
 c.setFillColor(HexColor(MUTED));c.setFont('Helvetica',7.4);c.drawString(x,y,t)

def chrome(c,r,page):
 c.setFillColor(HexColor(PARCHMENT));c.rect(0,0,595.276,841.89,stroke=0,fill=1)
 c.setFillColor(HexColor(INK));c.setFont('Times-Roman',25);c.drawString(48,791,'Enamplify')
 label(c,f"Field notes / {r['number']}",439,798)
 c.setStrokeColor(HexColor(STONE));c.setLineWidth(.5);c.line(48,772,547,772);c.line(48,48,547,48)
 label(c,'AI education & advisory',48,30)
 label(c,f'{page} / 2',515,30)

def check(c,n,heading,question,y,linecount=3):
 label(c,f'{n:02d}',48,y-13)
 y=text(c,heading,77,y,469,H)-8
 y=text(c,question,77,y,469,P)-12
 c.setStrokeColor(HexColor(STONE));c.setLineWidth(.45)
 for k in range(linecount):c.line(77,y,547,y);y-=17
 return y-10

for r in RESOURCES:
 target=OUT/'downloads'/f"{r['slug']}.pdf"
 c=canvas.Canvas(str(target),pagesize=(595.276,841.89),pageCompression=1)
 c.setTitle(r['name']);c.setAuthor('Enamplify');c.setSubject(r['description'])
 chrome(c,r,1)
 y=text(c,r['name'],48,747,499,TITLE)-13
 y=text(c,r['description'],48,y,499,P)-17
 label(c,'Use with your team / Notes and evidence',48,y);y-=19
 fields=r['fields']
 for i in range(0,len(fields),2):
  for j,f in enumerate(fields[i:i+2]):
   x=48+j*259
   label(c,f,x,y)
   c.setStrokeColor(HexColor(STONE));c.line(x,y-21,x+238,y-21)
  y-=39
 y-=6
 for i,(heading,q) in enumerate(r['checks'][:3],1):y=check(c,i,heading,q,y,2)
 if y<50: raise RuntimeError(f'Page 1 overflow for {r["name"]}: {y}')
 c.showPage();chrome(c,r,2)
 label(c,r['name'],48,745)
 y=721
 for i,(heading,q) in enumerate(r['checks'][3:],4):y=check(c,i,heading,q,y,3)
 y-=6;y=text(c,'The next decision.',48,y,499,H)-8
 y=text(c,r['closing'],48,y,499,P)-18
 label(c,'Action / Owner / Review date',48,y);y-=20
 for i in range(3):c.setStrokeColor(HexColor(STONE));c.line(48,y,547,y);y-=20
 y-=8
 text(c,'A discussion aid, not a certification, professional opinion or promise of results. A readable web version accompanies this worksheet.',48,y,499,SMALL)
 if y<65:raise RuntimeError(f'Page 2 overflow for {r["name"]}: {y}')
 c.save();print(target.name,target.stat().st_size)
