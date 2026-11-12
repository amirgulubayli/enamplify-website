---
name: Enamplify
description: Oxblood Editorial. Caslon, wine and parchment retain the original consultancy's quiet credibility across its workspace offerings.
colors:
  paper: "#f3eee5"
  paper-light: "#faf7f1"
  paper-deep: "#e9e2d7"
  ink: "#242321"
  ink-soft: "#4a433d"
  wine: "#502d36"
  wine-deep: "#3c2229"
  wine-mist: "#e3d3d0"
  bronze: "#9b8269"
  line: "#d6ccbf"
  muted: "#696058"
  control: "#857869"
  error: "#a1261c"
typography:
  display:
    fontFamily: "Libre Caslon Display, Times New Roman, Noto Serif, serif"
    fontSize: "clamp(2.625rem, 1.5rem + 5.2vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  display-hero:
    fontFamily: "Libre Caslon Display, Times New Roman, Noto Serif, serif"
    fontSize: "clamp(2rem, 1.1rem + 2.2vw, 2.75rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  display-article:
    fontFamily: "Libre Caslon Display, Times New Roman, Noto Serif, serif"
    fontSize: "clamp(2.375rem, 1.5rem + 3.2vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Libre Caslon Display, Times New Roman, Noto Serif, serif"
    fontSize: "clamp(2.125rem, 1.5rem + 2.2vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.016em"
  headline-visual:
    fontFamily: "Libre Caslon Display, Times New Roman, Noto Serif, serif"
    fontSize: "clamp(2rem, 1.4rem + 2.2vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.016em"
  title:
    fontFamily: "Libre Caslon Display, Times New Roman, Noto Serif, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.22
    letterSpacing: "-0.008em"
  italic:
    fontFamily: "Libre Caslon Text, Times New Roman, Noto Serif, serif"
    fontWeight: 400
    letterSpacing: "-0.012em"
  exhibit-caption:
    fontFamily: "Libre Caslon Display, Times New Roman, Noto Serif, serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-0.008em"
  stage-role:
    fontFamily: "Libre Caslon Text, Times New Roman, Noto Serif, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.2
  lede:
    fontFamily: "DM Sans, Segoe UI, Helvetica Neue, Arial, Noto Sans, sans-serif"
    fontSize: "clamp(1.125rem, 1.02rem + 0.4vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "DM Sans, Segoe UI, Helvetica Neue, Arial, Noto Sans, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "DM Sans, Segoe UI, Helvetica Neue, Arial, Noto Sans, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.005em"
  small:
    fontFamily: "DM Sans, Segoe UI, Helvetica Neue, Arial, Noto Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  caption:
    fontFamily: "DM Sans, Segoe UI, Helvetica Neue, Arial, Noto Sans, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
rounded:
  none: "0px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "40px"
  3xl: "48px"
  4xl: "56px"
  split: "80px"
  split-wide: "96px"
  gutter: "20px"
  gutter-medium: "32px"
  gutter-wide: "48px"
  section: "clamp(80px, 10vw, 144px)"
components:
  button-primary:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.paper-light}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.wine-deep}"
  button-secondary:
    backgroundColor: "{colors.wine-deep}"
    textColor: "{colors.paper-light}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.wine}"
    rounded: "{rounded.none}"
    padding: "10px 18px"
  button-quiet-hover:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.paper-light}"
  button-inverse:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.wine}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-inverse-hover:
    backgroundColor: "{colors.paper-light}"
  link-arrow:
    textColor: "{colors.wine}"
    padding: "6px 0"
  input:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "13px 14px"
  card:
    textColor: "{colors.ink}"
    padding: "20px 0 0"
  audience:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.none}"
    padding: "3px"
  audience-selected:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.paper-light}"
    padding: "8px 13px"
  audience-hero:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.none}"
    padding: "3px"
  concept-stage:
    backgroundColor: "{colors.paper-deep}"
    rounded: "{rounded.none}"
    width: "100%"
  visual-tag:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
  visual-tag-selected:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.paper-light}"
  close-band:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.paper-light}"
---

# Design System: Enamplify

## Overview

**Creative North Star: "Oxblood Editorial"**

The original consultancy identity remains the visual authority: warm parchment, dark ink, oxblood wine, Caslon headings and quiet sans-serif reading text. The adaptive AI workspace is presented through original concepts and concise visual explanations. Us and Me inhabit this same world; audience and product content change without introducing a separate consumer identity. The interactive workspace and guided setup have an explicitly scoped, softer product treatment inside the editorial page.

Generous space and hairlines organise the page. Serif display type carries a short proposition; wine italic gives a phrase emphasis; original workspace concepts explain the product at a readable scale. Warm architectural photographs place London and Baku beneath the product on the landing pages and support the practice's context on inner pages. Original concepts, authored HTML demonstrations and open diagrams carry the landing story; longer reading belongs to the site's established article and service surfaces.

**Key Characteristics:**
- Parchment surfaces, ink text and oxblood emphasis.
- Libre Caslon Display headings, Libre Caslon Text italic and DM Sans reading text.
- Square marketing edges, fine rules, tonal bands and generous section rhythm, with softer interactive product surfaces.
- Shared components and responsive structure for Us and Me, in English and Azerbaijani.
- Large, uncropped workspace concepts, brief illustrative notes and a native thumbnail contact sheet.
- Continuous horizontal preview motion with one playback control, initially paused for reduced motion, and a complete static reading surface.

## Colors

The palette is warm and restrained: paper variations carry the reading surface, with wine as the principal accent and the closing field.

### Primary
- **Oxblood Wine** (`wine`): primary actions, italic emphasis, current navigation, focus outlines, small process counters, drawn checks, the sandbox field and the closing band. **Deep Wine** (`wine-deep`) deepens primary hover states and fills secondary actions. **Wine Mist** (`wine-mist`) provides secondary text inside wine fields.

### Secondary
- **Bronze** (`bronze`): quiet separators, prose markers and reciprocal-link underlines. It is a detail colour, not the small process-counter text colour.

### Neutral
- **Parchment** (`paper`): the base page, header and footer; inverse actions on wine.
- **Light Paper** (`paper-light`): lighter section bands, inputs, form panels, audience-switch frame, text on primary actions and the sandbox field.
- **Deep Paper** (`paper-deep`): wash bands, worksheet panels and image placeholders.
- **Ink** (`ink`): headings, principal text, structural top rules and the featured concept frame.
- **Soft Ink** (`ink-soft`): supporting prose, ledes and secondary links.
- **Muted Warm Grey** (`muted`): notes, captions, metadata, durations and footer details.
- **Hairline** (`line`): section boundaries, row dividers and quiet frames.
- **Control** (`control`): input and menu-toggle borders.
- **Error Red** (`error`): invalid fields and form error summaries only.

The product extension is scoped to `.live-app` and `.portal-setup`: `--portal-surface: #fff` for the shell, `--portal-soft: #f7f5f1` for supporting panels and `--portal-stroke: #e7e1d8` for controls and dividers. Wine, Ink and the existing warm neutrals remain accents and text. These local values do not replace the global frontmatter palette.

### Named Rules
**The Wine Emphasis Rule.** Wine carries emphasis, actions and control states across both offerings. Keep secondary copy in Soft Ink or Muted Warm Grey on paper; use Wine Mist for closing-band support and Light Paper for sandbox headings, copy and controls.

## Typography

**Display Font:** Libre Caslon Display, with Times New Roman and Noto Serif fallbacks.
**Body Font:** DM Sans, with Segoe UI, Helvetica Neue, Arial and Noto Sans fallbacks.
**Italic Font:** Libre Caslon Text, with Times New Roman and Noto Serif fallbacks.

**Character:** Regular-weight Caslon gives the site its considered editorial voice. DM Sans keeps product explanations, labels and forms direct. Fonts are self-hosted in Latin and Latin Extended subsets with `font-display: optional`.

### Hierarchy
- **Display / hero:** landing titles use the compact fluid display-hero role, centred to 26ch, with a separate wine italic line. Azerbaijani landing titles use `clamp(1.875rem, 1rem + 2vw, 2.75rem)`, a 28ch measure and 1.08 line height. Ordinary page titles retain the larger display role and a 16ch measure.
- **Article display:** the smaller fluid display role, held to 22ch.
- **Headline:** fluid section H2, held to 22ch where a section-title measure is used. Repeated visual-chapter headings use the smaller headline-visual role and a 15ch measure.
- **Title:** regular Caslon H3; article-card titles enlarge to 1.625rem.
- **Italic:** phrase emphasis inherits heading size; exhibit run-in labels, control terms and quiet place names use the same italic family in wine.
- **Exhibit caption:** regular Caslon with a wine italic run-in exhibit label, followed by the explanatory title.
- **Stage role:** one Wine italic audience/role line, with no separate concept title or rail heading. Its fictional-concept note is local metadata (0.75rem, reducing to 0.6875rem below 600px), not a new general reading-text role.
- **Lede / body:** fluid ledes generally held to 44ch; landing hero support uses 1.0625rem/1.5 to 72ch, and visual-chapter subheads use the lede role to 36ch. Prose is held to 66ch, inner-page FAQ answers to 62ch.
- **Label / small / caption:** DM Sans for controls and supporting detail. Navigation uses 0.875rem; compact audience links, thumbnails and visual status labels use 0.8125rem; input text uses 1rem. The handoff path uses 1.625rem/1.2 Caslon, with its final review step in Wine italic.

Within the interactive workspace and guided setup only, DM Sans also supplies the UI headings: semibold (600) titles and section labels above regular readable descriptions. The product wordmark and the marketing headings outside these containers retain Caslon. This local hierarchy does not redefine global display or headline tokens.

### Named Rules
**The Sentence Case Rule.** Headings, actions and labels use sentence case. Do not introduce decorative preheaders, kickers, uppercase transforms or small-caps label systems.

**The Figures Rule.** Use tabular lining figures where the source compares or sequences numbers: ledger cells, stage numbers and durations. Small stage counters are wine.

## Layout

The reading width is 1264px plus the surrounding gutters. Gutters step from 20px to 32px at 720px, then 48px at 1200px. Section padding follows the frontmatter's fluid section token. Internal spacing repeatedly uses 8, 12, 16, 24, 32, 40, 48 and 56px, with 80px or 96px between major columns.

Asymmetry is deliberate on supporting sections: text/content splits use 5:7 from 900px; split inner-page headings use 7:5 from 1000px. Close bands use 7:5 from 900px, founder blocks 4:8, and article body/aside 8:4 from 1000px. Multi-column groups stack on smaller screens and retain their rules. Card lists become two columns at 760px and three at 1100px. Form rows divide at 600px.

The sticky header is 64px minimum height, increasing to 80px at 1200px. Anchor clearance is the header height plus 24px. Us and Me share a compact visual-first hero: a short proposition, brief supporting text, one action and a reciprocal offering link. Preserve early visibility of the workspace stage as the purpose of this compact hierarchy. The prominent offering switch sits beside the header wordmark from 720px and centred above the landing H1 on phones. Exactly one switch is visible outside the mobile menu; the menu retains its own switch.

The landing stage and thin contact sheet share a 1080px content width and retain each concept's complete 3:2 aspect ratio. A compact flex caption holds the role, fictional-concept note and one playback icon. The thumbnail strip stays one horizontally scrollable row, with 14px gaps and 156px items, reducing to 132px below 600px. It has no search, count, preview heading or full-size action. Ten visual chapters cover adaptation, setup, examples, agents, operations, connections, AI accounts, context, sandbox and place, in an offering-specific order with a heading and short subhead beside or above the demonstration; their padding is `clamp(72px, 9vw, 128px)`. From 900px, a twelve-column grid supports asymmetric compositions; below that, the same visual reading order stacks. This landing composition is scoped in `.impeccable/surfaces/src-pages-home-mjs.md`; it does not prescribe every inner page. Landing-only styles and scripts include the authored demo and remain omitted from inner pages. Their scoped caps are 42KB CSS and 22KB JavaScript, with combined caps of 76KB and 32KB; global assets retain their established limits. Visible main copy, including interactive product UI and setup, stays within 750 words, and static HTML including authored templates and hidden scenario panels within 1100 words.

Explanatory diagrams and workflow steps adapt their columns to the available width. Detailed tables keep row and column headings; below 600px they become vertically stacked rows with a visible column label before each value. Supporting diagrams, chats, tables and images stack beneath their introductory text before the 900px split. Keep this reading order meaningful without scripts.

## Elevation & Depth

The editorial site chrome is flat: no box shadows, gradients or blur. Soft elevation is reserved for the explicitly scoped interactive workspace and setup surfaces. Paper, Light Paper and Deep Paper form tonal layers; 1px hairlines organise rows and sections; Ink top rules introduce cards, exhibits and the gallery. The wine closing band and sandbox are native accent fields. The authored workspace demonstration has a stable application shell; other landing explanations use open compositions and connecting paths rather than framed panels. Full frames are used where containment matters, including the featured concept, offering switch, form panels, controls and ledgers. Interface styling inside an illustrative workspace image belongs to that artwork, not to the site's token system.

The interactive workspace uses `0 24px 70px rgb(36 35 33 / .1)` and guided setup uses `0 24px 70px rgb(36 35 33 / .08)`. These restrained shadows belong only to `.live-app` and `.portal-setup`; they do not establish general card elevation.

### Named Rules
**The Hairline Rule.** Separate and organise the editorial marketing surfaces with fine rules and tonal surfaces. Do not replace this quiet structure with floating panels or shadow elevation; the interactive workspace and guided setup use only their documented local soft elevation.

## Shapes

Marketing controls, panels and image frames retain square corners. Inside `.live-app` and `.portal-setup` only, outer corners are 20px, reducing to 16px below 600px; navigation and setup-action controls use 9px, shared item/file rows 10px, and shared agent/option panels 12px. Task-specific work surfaces vary their internal shape within this local product treatment. Rules are predominantly 1px. Directional actions retain 16px inline SVG arrows with 1.5px strokes; commitment checks are drawn in CSS. Landing explanations use locally served Lucide SVGs in Wine and provider marks from the local LobeHub SVG collection, with both licenses retained beside the assets. These icons accompany visible labels: usually 20px, enlarged to 32px in the connection constellation and 48px for sandbox browser/code/files. Sandbox icons reverse to Light Paper on Wine. Status marks use distinct square, inset, diamond and pause silhouettes with text, so colour alone never carries state. Existing FAQ disclosure controls retain their plus/minus affordance. Portraits use a 4:5 crop; place photography retains its evidenced crops. Workspace concepts retain their full 3:2 image proportions on both stage and shelf.

## Components

### Buttons and text links

Marketing actions are flat and square with a quiet directional cue. The scoped product controls use their local rounded treatment.
- **Primary / secondary / inverse:** 52px minimum height, 14px by 24px padding, 18px gap to the arrow. Primary is Wine with Light Paper text; secondary is Deep Wine with Light Paper text; inverse is Parchment with Wine text on a wine field.
- **Quiet:** Wine outline and text on transparent, 42px minimum height, 10px by 18px padding and 0.875rem label. Hover fills Wine.
- **States:** primary hover deepens to Deep Wine; secondary goes to Ink; inverse lightens to Light Paper. Colour transitions last 200ms. Button and text-link arrows move 3px to the right.
- **Focus:** a site-wide 2px Wine outline offset 3px; the wine close uses a Parchment outline. Fields use the same width flush to their border.
- **Arrow link:** Wine text, a 1px current-colour bottom rule, 6px vertical padding and 10px arrow gap. Hover deepens the text.

### Cards and ruled lists

Cards sit directly on their section surface, with an Ink top rule and 20px top padding. Titles precede metadata and supporting copy. An article or guide card's title link covers the card; hover turns the title Wine. Engagement-stage numbers are small Wine DM Sans, with durations in Muted Warm Grey.

### Inputs and enquiry panels

Light Paper controls have square corners, a 1px Control border and 13px by 14px padding. Labels sit above with an 8px gap in medium-weight DM Sans. Focus changes the border and flush outline to Wine. Invalid controls and the error summary use Error Red. The form is a Light Paper framed panel with fluid 24px to 44px padding; generated enquiry previews use Deep Paper.

### Navigation and offering switch

The header sits on Parchment under a Hairline. The regular Caslon wordmark is 2.125rem, growing to 2.5rem at 1200px. Desktop navigation uses DM Sans text with a Wine underline on hover or current state. At 1000px and below, navigation and the header action move into the scrollable mobile menu; its page links use 1.75rem Caslon. Hidden menus are inert and use the existing keyboard behaviour and no-script fallback.

The Us/Me switch is a pair of native links in a square Hairline frame with 3px inset padding. The selected offering fills Wine with Light Paper text; landing-page current links carry `aria-current="page"`. Landing variants are enlarged and prominent: beside the wordmark from 720px, centred above the proposition on phones. Inner-page header links retain compact 8px by 13px padding; mobile-menu links use 10px by 18px. Both offering and language links preserve the reader's locale. Reciprocal audience links sit beneath landing and closing actions, using a Bronze underline on paper and Wine Mist text inside the close. Me's development/interest note belongs to the first action row, beside the button when space permits and wrapped below on phones.

The footer returns to Parchment with a Hairline top, three columns from 900px and a ruled legal row. London and Baku appear as quiet wine italic text.

### Exhibits and workspace concepts

Inner-page exhibits open with a 1px Ink rule and 18px top padding. Their captions use a Wine italic run-in label followed by a regular Caslon title.

The landing concept stage uses a full-width image in an Ink hairline frame over Deep Paper, followed by a short role, tiny fictional-concept note and one 40px square playback control. Us offers the recovered 20 professional concepts and Me the 12 personal concepts. They contain fictional sample data and are product direction, not evidence of client delivery or a released interface. The featured image is eager with a responsive 480/960/1536 source set; rail thumbnails and supporting story images load lazily. The stage preserves the complete image without cropping.

Each thumbnail is a native link to its full-size image. Script enhancement swaps the stage image, role and alternative text, marking the current item with a Wine inset outline and Wine label. Modified clicks retain the native destination. Arrow keys, Home and End navigate the complete collection. The initial selection and deliberate selections are centred within the rail without moving the page vertically. The strip uses native scrolling, without snap or a duplicated image track.

The contact sheet moves continuously at 24px per second through native `scrollLeft`, reversing at either boundary. The main preview changes every 6.5 seconds to a concept near the visible strip's centre, with a 420ms opacity/clip transition. One authored SVG play/pause icon has a complete localized accessible label, title and synchronized pressed state. Both motion and automatic selection stop offscreen, in a hidden document, during rail hover or while focus is inside the studio. Explicit Play resumes immediately, clearing temporary hover/focus suspension even while its button retains focus; a subsequent hover or focus entry suspends again. Explicit pause, manual selection and touch pause persistently. Reduced motion starts paused and removes transitions and smooth scrolling; readers may explicitly request playback. Deliberate selections announce the role politely; automatic changes turn live announcements off. Print retains the stage and role while hiding the contact sheet and playback control. An image failure replaces its frame with a short localized status message; another selection clears that error and loads the chosen image. These are static concept images; playback must not imply that the pictured workspace operates on the page.

Keep enough inset space in the scrolling rail for the existing keyboard focus outline to remain visible.

### Authored workspace demonstration

The adaptation chapter renders a stable white application shell, with a quiet brand bar and working Workspace/Files/Agents navigation, while the centre rebuilds through an authored request. The Wine italic request remains outside the shell; inside it DM Sans headings and content identify primary work, supporting context and reviewable results. The Enamplify wordmark retains Caslon. Navigation becomes a compact row below 600px. Files and Agents panes reset inherited minimum heights at 899px and below so shorter content does not leave an oversized empty surface. These are real HTML layouts using local icons, not changing screenshots or a live model response. Three authored scenes per offering change the structure of the work surface to fit the job. Us uses a report-document shelf with a broad paper reading surface, a three-lane follow-up kanban and a Wine milestone rail. Me uses weekday/time-axis planning with calendar blocks, a topic checklist beside a revealable flashcard and a recipe week with a grocery checklist. These are six separately composed HTML structures; adaptation must change topology rather than rename rows in a shared list/detail template. Reporting shelves, kanban lanes and recipes stack on phones; the roadmap rail turns vertical. The outer navigation, theme and typography remain stable. Fictional-concept notes remain visible.

On first visible entry, a request types over 2–2.8 seconds. At 25% the centre resets, then the primary work, context and result root pieces append at 35%, 70% and 100%. Those three insertion phases carry different internal structures for each mode. Spatial widget transitions last 650ms and use bounded offsets from the preceding layout positions. The workspace measures all three complete authored templates at the current width and reserves their maximum height while rebuilding; this reservation does not force Files or Agents panes to the workspace height. A 2.6-second reading hold precedes the next scene; one finite three-scene run then rests. The localized playback button pauses both typing and widget motion, shows a paused state, resumes progress and replays from the first scene after completion. Native underlined scene buttons animate only the selected scene and retain its pressed state. Offscreen and hidden-document states suspend progress and widget animation. Reduced motion reveals a complete selected scene immediately and hides playback; without scripts, the first complete scene remains visible, playback and scene selectors stay hidden, and visible portal controls remain disabled. The full request is available to assistive technology without announcing characters individually. No free-form request, model call or account connection is performed. Item, file, pane, task-move, flashcard, grocery, review-checkbox and routine interactions stop automatic playback, complete the current scene if necessary and finish pending widget animations.

Within each authored scene, selecting an item changes its inline preview and detail. Task checkboxes update reviewed styling and the actual checked/total ratio. Kanban move-to-review controls move the task into the review lane and mark it reviewed. Study controls reveal or hide the selected flashcard explanation. Grocery checkboxes change their checked state and completion styling. Workspace, Files and Agents controls switch visible panes; routine toggles and their written status synchronize between Workspace and Agents. Files use independent named source metadata and distinct source excerpts, never task descriptions. Filtering Calendar/Files source kinds through setup retains each resource name. These working local controls remain illustrative rather than evidence of a released account or external action.

Us leads with business outcomes and explicitly offers custom implementation, then places typed requests and examples with delivered-work links before agents, operations and supporting capabilities. A short Scope/Build/Support section uses the existing Caslon hierarchy and becomes three open columns from 720px. Me identifies personal software in development, presents its authored personal requests and examples early, and keeps its interest enquiry distinct from account creation. Exact landing progression remains scoped in `.impeccable/surfaces/src-pages-home-mjs.md`.

### Guided local setup

A three-step setup uses the same white DM Sans product treatment: choose example Calendar/Files sources, choose a first workflow, then review the selection and optional pause of automatic preparation. At least one source is required. Native Continue, Back, Apply and Start again controls advance, revisit, apply and reset the walkthrough; the current step is identified semantically, and transitions focus the active legend. Applying updates only the local demo scene, named sources and synchronized routine state, then focuses the workspace. Editing applied settings clears the stale success message until reapplied. Without scripts, the first step is visible with disabled choices and hidden navigation actions. No account connection, submission, external action, browser storage or persistent configuration occurs. The local-example note and Us implementation/Me development distinction remain visible.

### Visual explanations

Visual explanations use the same paper surfaces, Caslon headings, Wine italic emphasis and Hairlines. Ten chapters share short headings and subheads while giving each demonstration its own composition. A twelve-icon constellation surrounds the branded workspace: four open, unframed groups of three labelled tools, joined by curved paths from 1100px; narrower layouts put the core above a two-column or single-column group grid.

The AI account explanation is an open routing story: an Anthropic account at its limit hands a task through a curved path to an OpenAI fallback. A separate OpenAI account and Gemini account remain visible beneath, with DeepSeek and Qwen as additional examples where supported. Provider marks, account labels and written states distinguish the accounts without a table or ledger frame. This visual example does not expose connection controls; detailed labelled tables remain an inner-page pattern.

An open context composition places a wrapping icon-and-label line for files, conversations, project memory and access above a source-linked Light Paper document, without an admin sidebar or outer window frame. Numbered source markers, named sources and selected-import/export labels keep context visible without implying that signing in imports chat history. A shared objective feeds four parallel research, browser, file and code lanes, each with an icon, task, written state and progress bar. The unboxed agent branches converge on a handoff and one merged draft alongside an uncropped concept image.

The open operations flow links event, schedule and manual starts through a run queue to a human review step. Running, awaiting approval and paused states have distinct marks and text. A separate control line names approvals, permissions, budget and pause; its labels wrap with available width beneath a quiet top rule. The three workflow columns stack vertically below 900px. Every account, status and action shown in these explanations is illustrative. Provider availability, plans and limits remain qualified; the diagrams do not expose real connection or approval controls.

The sandbox occupies a full Wine field with Light Paper headings, copy and controls. A task sits above large browser, code and file icons and open contents; connecting paths link these three stages from 720px, without an outer console frame or pane borders. A Light Paper result with Wine text identifies reviewable output, above a pause/retain/resume line. The stages stack on phones and form three equal columns from 720px. This is a labelled product concept with scoped access, not a live browser, code runner or storage guarantee.

Each offering has six illustrative scenario panels, pairing a complete uncropped concept image with a request, work steps and reviewable result. From 720px, image and narrative use a 7:3 split; below that they stack. Underlined text tabs wrap with 24px horizontal gaps, have a 44px minimum height and use Wine text and an underline when selected. Work steps form an inline wrapping flow. Script enhancement exposes the tablist, synchronizes selected and hidden-panel states, and uses roving focus with Left/Right/Home/End navigation. Without scripts the first complete scenario remains visible and the inactive selector stays hidden. Us follows these concepts with three editorial links to existing delivered-work case studies; keep this evidence distinct from fictional scenario results.

Four contextual enquiry actions follow adaptation, accounts, sandbox and examples. Each uses the existing localized enquiry destination with its offering preselected; Me remains an interest enquiry while in development. Adaptation, accounts and examples use the existing square Wine primary action; the sandbox uses the shared inverse action on its Wine field. The complete chapter order and landing asset/copy bounds remain scoped in `.impeccable/surfaces/src-pages-home-mjs.md`.

Warm London and Baku architectural photographs use a staggered 7:5 composition and 4:5 crops, with a quiet italic place caption and existing credit. Labels identify pictured content or state rather than decorating a heading. Fictional diagrams explain intended behaviour; provider-dependent availability and sample outputs do not become universal capability promises.

Six figures (connections, accounts, context, agents, sandbox and operations) each run a finite cause/work/result sequence on first entry, then rest in the complete state. A localized replay control restarts each of those six sequences; it is hidden without scripts and under reduced motion. The sandbox is the focal sequence, completing browser, code, files, reviewable output and retained-state emphasis within 4.4 seconds. Agent lanes fill in parallel before the merged output is emphasized. These six sequences pause offscreen and in a hidden document. Complete static states remain visible without scripts and under reduced motion; do not add decorative repeating motion or blanket section-fade choreography. Native FAQ disclosures remain an inner-page pattern.

### Compact control lines

A ruled definition list supports short implementation or control explanations on relevant inner pages. Wine italic terms sit beside Ink descriptions in 7.5rem/minmax columns with a 16px gap and 14px row padding. Fine Hairlines divide rows. In a supporting 5:7 split the list stacks below the heading and short paragraph below 900px, with 40px of clearance.

### Close band

The wine close pairs a Parchment Caslon heading with Wine Mist copy and an inverse action, using the shared 7:5 split. Us and Me carry their reciprocal audience link beneath that action. The close is hidden in print.

## Do's and Don'ts

### Do:
- **Do** retain the original parchment, oxblood and Caslon identity across Us and Me.
- **Do** use wine italic for meaningful phrase emphasis and fine rules for structure.
- **Do** keep headings and actions in sentence case, with card metadata below the title.
- **Do** label illustrative product concepts and examples honestly; show only verified proof as results.
- **Do** keep small process counters in Wine and reserve Bronze for quiet detail.
- **Do** preserve keyboard focus, native offering links, locale continuity and reduced-motion states.
- **Do** give automatic previews a visible playback control, pause on interaction and start paused for reduced motion.
- **Do** keep styling in the stylesheet under the site's existing no-inline-style policy.

### Don't:
- **Don't** introduce a separate visual identity for Me or reinstate the superseded navy-and-blue Board Pack palette.
- **Don't** add shadows or rounded panels to editorial marketing surfaces; use only the documented local treatment inside the interactive workspace and guided setup. Keep gradients and blur out of both.
- **Don't** put decorative preheaders, kickers or eyebrows above headings, or introduce uppercase label styling.
- **Don't** use coloured side-stripe callouts in place of the established ruled structure.
- **Don't** turn illustrative concepts into release claims or invent metrics, testimonials or client proof.
- **Don't** use icon fonts or glyph icon sets; use the evidenced local SVG icons, inline SVG arrows and CSS affordances, retaining visible labels and asset licenses.
- **Don't** use em dashes in visitor copy or write inline style attributes and style blocks.
