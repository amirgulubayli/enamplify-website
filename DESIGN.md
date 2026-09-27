---
name: Enamplify
description: The Board Pack. Outcomes shown as numbered exhibits on white paper, in navy ink with one reserved blue signal.
colors:
  paper: "#ffffff"
  wash: "#f4f6f8"
  navy: "#0a1f33"
  ink: "#1a2633"
  muted: "#556474"
  rule: "#d8dee5"
  rule-strong: "#a8b4c0"
  control: "#7b8896"
  signal: "#1f5eff"
  signal-deep: "#1746c8"
  signal-wash: "#e9efff"
  close-text: "#d6dde6"
  error: "#b42318"
typography:
  display:
    fontFamily: "Schibsted Grotesk, Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.5rem, 1.4rem + 4.4vw, 4.75rem)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-0.028em"
  display-article:
    fontFamily: "Schibsted Grotesk, Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.125rem, 1.4rem + 3vw, 3.5rem)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-0.028em"
  headline:
    fontFamily: "Schibsted Grotesk, Arial, Helvetica, sans-serif"
    fontSize: "clamp(1.75rem, 1.2rem + 1.9vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Schibsted Grotesk, Arial, Helvetica, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 600
    lineHeight: 1.3
  statement:
    fontFamily: "Schibsted Grotesk, Arial, Helvetica, sans-serif"
    fontSize: "clamp(1.25rem, 1rem + 0.8vw, 1.625rem)"
    fontWeight: 600
    lineHeight: 1.35
  exhibit-caption:
    fontFamily: "Schibsted Grotesk, Arial, Helvetica, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.35
  lede:
    fontFamily: "Public Sans, Arial, Helvetica, sans-serif"
    fontSize: "clamp(1.125rem, 1rem + 0.45vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Public Sans, Arial, Helvetica, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "'lnum' 1"
  label:
    fontFamily: "Public Sans, Arial, Helvetica, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1
  small:
    fontFamily: "Public Sans, Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  caption:
    fontFamily: "Public Sans, Arial, Helvetica, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
  figures:
    fontFamily: "Public Sans, Arial, Helvetica, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    fontFeature: "'tnum' 1, 'lnum' 1"
rounded:
  none: "0px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
  gutter: "20px"
  gutter-wide: "32px"
  section: "clamp(64px, 9vw, 128px)"
  container: "1264px"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "12px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.signal-deep}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "12px 20px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
    height: "40px"
  button-quiet-hover:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.paper}"
  button-inverse:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.navy}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "12px 20px"
    height: "48px"
  button-inverse-hover:
    backgroundColor: "{colors.signal-wash}"
    textColor: "{colors.navy}"
  link-arrow:
    textColor: "{colors.signal-deep}"
    typography: "{typography.label}"
    padding: "6px 0"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
  exhibit:
    textColor: "{colors.navy}"
    typography: "{typography.exhibit-caption}"
    padding: "16px 0 0"
  card:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "24px 0"
  close-band:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.close-text}"
    padding: "{spacing.section} 0"
  form-panel:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
    padding: "32px"
---

# Design System: Enamplify

## Overview

**Creative North Star: "The Board Pack"**

Every outcome is shown as a numbered exhibit, the way a COO already reads a board pack. The page is white paper set in deep navy ink, with hairline rules doing the structural work that shadows, cards and gradients do elsewhere. Exhibits carry a run-in label, an action title that states the finding, a chart drawn in two or three flat tones, and a source line. One electric blue is reserved for the thing the reader should look at: the highlighted data, the link, the primary button, the focus ring.

Density is that of a well-set report: generous section rhythm (64 to 128px), content held to readable measures (42ch ledes, 66ch prose), grids that collapse to a single column on phones without losing the rule structure. Nothing floats, nothing glows, nothing is rounded. The system refuses the category default of a dark gradient hero with a product screenshot and three feature cards, and it refuses the cream-serif editorial look it replaced.

Motion is a single idea: exhibit marks below the first viewport draw themselves once as they arrive. Everything else changes state in 200ms colour shifts.

**Key Characteristics:**
- White paper, navy ink, one reserved signal blue.
- Numbered exhibits with run-in label, action title, chart, note and source line.
- Structure from 1px hairlines and 2px navy top rules; no shadows, no gradients, no radius.
- Schibsted Grotesk display over Public Sans text, self-hosted, tabular figures only where numbers are compared.
- Sentence case everywhere; no preheaders, kickers, eyebrows or uppercase.
- At most one navy close band per page, before the footer.

## Colors

A near-monochrome navy-on-white report palette with a single saturated blue that marks meaning.

### Primary
- **Signal Blue** (`signal`): the highlighted data series in every exhibit (bar segments, the lead line, its end label, its legend swatch), the primary button fill, and the focus outline. Its deeper step **Signal Deep** (`signal-deep`) is the text colour of arrow links and prose links, the hover colour for card titles and footer links, and the primary button's hover fill. **Signal Wash** (`signal-wash`) is the text-selection background and the inverse button's hover fill only.

### Neutral
- **Paper** (`paper`): the page, input fields, and text on navy and signal fills.
- **Report Wash** (`wash`): alternating section bands, the contact form panel, the worksheet close panel, the portrait placeholder.
- **Board Navy** (`navy`): headings, wordmark, exhibit captions and their 2px top rule, the comparison series in charts, the secondary button, the close band, tick marks.
- **Ink** (`ink`): body text; the secondary button's hover fill.
- **Slate** (`muted`): secondary text: the second clause of the hero H1, notes, meta lines, source lines, axis labels, breadcrumbs, ledger column heads.
- **Hairline** (`rule`): every 1px divider: header bottom, list rows, ledger rows, gridlines, source-line rule.
- **Strong Hairline** (`rule-strong`): the de-emphasised data series ("before", "other"), ledger head rule, grid-list top rule, breadcrumb separators.
- **Control Grey** (`control`): input and menu-toggle borders, the only 1px stroke with 3:1 non-text contrast.
- **Close Text** (`close-text`): body copy inside the navy close band.
- **Error Red** (`error`): invalid-field borders and the form error box border. Used nowhere else.

### Named Rules
**The Signal Reservation Rule.** Signal blue appears only on data marks the reader should compare against, links, the primary button and focus. It is never a background band, a decorative rule, an icon tint or a heading colour. In a chart, blue is the answer and navy or grey is the context.

**The One Navy Band Rule.** A page carries at most one full-bleed navy surface: the close band before the footer. Persuasion and reading pages end with it; the contact page (already the destination), legal pages and the 404 omit it. Other sections alternate paper and wash.

## Typography

**Display Font:** Schibsted Grotesk (fallback Arial, Helvetica)
**Body Font:** Public Sans (fallback Arial, Helvetica)

**Character:** A compact newspaper grotesk for headings and exhibit captions over a neutral civic sans for reading. Both are self-hosted Latin subsets with `font-display: optional`, so a slow first visit renders the fallback rather than swapping mid-read.

### Hierarchy
- **Display** (650, clamp 2.5 to 4.75rem, 1.02, -0.028em): the one H1 per page, max 18ch. Articles use the smaller article display (to 3.5rem, max 24ch). The hero H1 may set its second clause on its own line in Slate.
- **Headline** (600, clamp 1.75 to 2.75rem, 1.1, -0.018em): section H2s, max 24ch, stated as a sentence with a full stop.
- **Title** (600, 1.1875rem, 1.3): H3s in numbered lists, stages, cards, commitments.
- **Statement** (600 display, clamp 1.25 to 1.625rem, 1.35): the marked pull statement, the founder quote (to 1.875rem), large ticks and prose blockquotes, always under a 2px navy top rule.
- **Exhibit caption** (400 display, 1.1875rem, 1.35): the run-in exhibit caption; the "Exhibit N · Topic." label inside it is set at 700.
- **Lede** (400, clamp 1.125 to 1.3125rem, 1.55): page and hero ledes, max 42ch.
- **Body** (400, 1.0625rem, 1.6, lining figures): paragraphs; prose held to 66ch, FAQ answers to 62ch.
- **Label** (600, 0.9375rem): buttons, arrow links, nav items (500 weight at 0.9375rem in the header).
- **Small / Caption** (0.875rem / 0.8125rem, Slate): notes, card meta, source lines, axis labels, breadcrumbs, footer legal.

### Named Rules
**The Figures Rule.** Tabular lining figures are switched on only for elements whose numbers are compared in columns: legend values, bar values, ledgers, chart axes and stage numbers. Body text keeps proportional lining figures.

**The Sentence Case Rule.** Every heading, button, label, caption and nav item is sentence case. No `text-transform: uppercase`, no letterspaced small-caps labels, no preheader or kicker line above a heading. Context that would be a kicker goes after the title (card meta) or runs in (exhibit label).

## Layout

A single 1264px container with a 20px gutter, widening to 32px at 720px. Sections are separated by `section` padding (clamp 64 to 128px) and alternate between paper and wash; there is no other section chrome.

Grids are asymmetric and column-proportioned: the hero sets copy against its exhibit at 7:5 from 1000px; split sections set a heading against content at 5:7 from 900px; the close band runs 7:5; the founder block 4:8; the article body 8:4 with an aside. Three-up grids (numbered situations, outcomes, products) engage at 900 to 1000px; card and grid-list collections go two-up at 760px and three-up at 1100px. The contact form row goes two-up at 600px. Every multi-column grid collapses to a single column below its breakpoint, keeping its top rules.

Internal spacing steps are 8, 12, 16, 24, 32, 48 and 64px. Section titles sit 48px above their content. Headings take `text-wrap: balance`; ledes and captions take `text-wrap: pretty`.

The header is sticky at 72px minimum height; anchors scroll with 96px padding to clear it.

## Elevation & Depth

The system is flat. No element carries a box-shadow, a gradient or a blur. Depth and grouping come from three devices only: 1px hairlines in `rule` between rows, a 2px navy top rule that opens every exhibit, card, product, aside box, pull statement and result panel, and the tonal step from paper to wash (and, once per page, to navy).

### Named Rules
**The Hairline Rule.** If a group needs separating, draw a rule above it. Never lift it with a shadow or box it with a border on all four sides; the only fully bordered elements are form controls, the quiet button and the error box.

**The Top-Rule Rule.** Emphasis rules run across the top of a block, full width. Coloured side stripes on the left edge of cards, quotes or callouts are not part of this world.

## Shapes

Every corner is square (`rounded.none`): buttons, inputs, panels, swatches, chart marks. Rules are 1px (structure) or 2px navy (emphasis); chart lines are 2.5px with round joins. Icons are 16px inline SVG strokes at 1.5px: a right arrow for internal links and a north-east arrow for external ones. The only drawn glyphs are the CSS tick and dash in commitment lists and the plus/minus on FAQ summaries. The portrait is a 4:5 crop at 304px max width on a wash placeholder.

## Components

### Buttons
Square, flat, confident; the arrow moves, the button does not.
- **Shape:** square corners, 48px minimum height, 12px by 20px padding, 10px gap to a trailing 16px arrow.
- **Primary:** Signal Blue fill, white label; hover deepens to Signal Deep. One per view, for "Book a diagnostic call".
- **Secondary:** navy fill, white label; hover to Ink.
- **Quiet:** 40px, navy 1px border and label on transparent; hover fills navy. Used for the header's "Book a call".
- **Inverse:** white fill, navy label, only inside the navy close band; hover to Signal Wash.
- **Hover / Focus:** 200ms colour transitions; the arrow icon nudges 3px right on hover. Focus is a 2px Signal Blue outline offset 3px, site-wide.
- **Arrow link:** Signal Deep label, 600 weight, a 1px `currentColor` underline as a bottom border, same arrow and nudge. The text-link partner to a button.

### Exhibit (signature component)
The unit of proof. A figure with a 2px navy top rule and 16px top padding, containing in order:
1. **Run-in caption** in the exhibit caption style: a bold label "Exhibit N · Topic." followed on the same line by the action title, a full sentence stating the finding.
2. **Chart**, one of: a 100% stacked bar (56px tall) with a swatch legend carrying the values; paired horizontal bars on a shared scale with label, 12px track and value; a hairline line chart with direct end labels in a right gutter, three gridlines and a two-point axis; or a ledger table.
3. **Note** (optional, 0.9375rem): what to read from the chart.
4. **Source line** (0.8125rem, Slate) under a 1px hairline, beginning "Source:". Any invented or composite data must say so here ("Illustrative", "Example ledger").

Exhibits are numbered consecutively down a page. Chart tones are limited to `navy`, `signal` and `rule-strong`. SVG charts carry their data in an `aria-label` or a visible legend; ledgers carry a screen-reader caption and scroll horizontally in a focusable region on narrow screens.

**Motion:** exhibits already in the first viewport render complete. Exhibits below it start pending and, once on entering view, grow their bars from the left (1s) and draw their lines (1.4s) on `cubic-bezier(.2,.7,.2,1)`. With reduced motion, or in print, marks render complete and nothing animates.

### Ledger
A full-width collapsed table at 0.875rem with tabular figures. Rows are divided by 1px hairlines; the header row is 600 Slate over a Strong Hairline; the first cell of each row is a navy 600 row header. Cells pad 10px top and bottom with 12px trailing space and no vertical rules.

### Stages
An ordered list of rows split by hairlines: a 48px column holding a zero-padded stage number ("01") in 600 display navy, then the title with its duration run in beside it in 500 Slate, then a one-line description. On the approach page each stage expands to a 5:7 detail row.

### Commitments ticks
Two columns ("We won't", "We will") under a hairline. Each item is a hairline-divided row with a 32px left indent holding a CSS-drawn navy check, or a Slate dash for refusals. A large variant sets items in the statement style.

### Cards / Containers
- **Corner Style:** square.
- **Background:** none; cards sit on the section surface.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** a 2px navy top rule only.
- **Internal Padding:** 24px top and bottom, no side padding.
- **Anatomy:** title link first, then the meta line (category or type, a middot, reading time) in caption Slate, then the summary. Meta never sits above the title. The whole card is the link target; hover turns the title Signal Deep.
- **Panels:** the contact form and worksheet close are wash panels with 32px padding; the enquiry result is a white panel under a navy top rule.

### Inputs / Fields
- **Style:** white fill, 1px Control Grey border, square, 12px by 14px padding, 1rem Public Sans in Ink. Labels sit above in 500 navy with an 8px gap.
- **Focus:** the border turns Signal Blue and a 2px Signal Blue outline sits flush (offset 0).
- **Error:** `aria-invalid` fields take an Error Red border; errors are summarised in a white box with an Error Red border above the form.

### Navigation
- **Header:** sticky white bar with a hairline bottom. The Schibsted wordmark (700, 1.375rem, navy) at left; four text links at 0.9375rem Ink with 28px gaps, gaining a 1px navy underline and navy colour on hover or when current; the quiet button at right.
- **Mobile (at 1000px and below):** links and button hide behind a bordered "Menu" toggle that relabels to "Close". The menu opens as a scrollable panel below the header with full-width rows in 600 display navy at 1.25rem, divided by hairlines. It traps focus, closes on Escape, and is `inert` while hidden. A `noscript` row of links stands in without JavaScript.
- **Breadcrumbs:** 0.8125rem Slate with slash separators in Strong Hairline, above every inner page head.
- **Footer:** a hairline-topped three-column block (brand and definition, pages, contact) with 0.875rem Slate column headings in sentence case, and a legal row under a second hairline.

### Close band
The page's single navy section, before the footer, on every persuasion and reading page (omitted on contact, legal and 404): headline in white (max 18ch) set against a Close Text paragraph and the inverse button at 7:5. It is hidden in print.

## Do's and Don'ts

### Do:
- **Do** show every claimed outcome as a numbered exhibit with a run-in "Exhibit N · Topic." label, an action title, a chart, and a source line.
- **Do** label invented, composite or example data as illustrative in the source line.
- **Do** keep Signal Blue to data marks, links, the primary button and focus; use navy and Strong Hairline for context series.
- **Do** separate groups with 1px hairlines and open emphasised blocks with a 2px navy top rule.
- **Do** end persuasion and reading pages with exactly one navy close band; omit it on contact, legal and 404 pages.
- **Do** set every heading, button and label in sentence case, with headings written as sentences.
- **Do** switch on tabular figures only for legend values, bar values, ledgers, axes and stage numbers.
- **Do** put card meta below the card title.
- **Do** keep all styling in the stylesheet; the site runs under a CSP with no inline styles.
- **Do** let only below-the-fold exhibit marks animate, once, and render everything complete under reduced motion and in print.

### Don't:
- **Don't** use shadows, gradients, blurs or rounded corners anywhere.
- **Don't** put a preheader, kicker or eyebrow line above a heading.
- **Don't** use `text-transform: uppercase` or letterspaced label type.
- **Don't** use em dashes in copy; use a full stop, comma or colon.
- **Don't** draw coloured side-stripe borders on cards, quotes or callouts.
- **Don't** add a second navy band, or use Signal Blue as a section or panel background.
- **Don't** use stock photography, product screenshots or icon glyph sets; icons are the two 16px stroke arrows.
- **Don't** write `style` attributes or inline `<style>` blocks.
