import {esc, button, closeBand, audienceToggle, crossLink, ME_ENQUIRY, US_ENQUIRY} from '../components.mjs';
import {fill} from '../i18n.mjs';
import {workspaceStory} from './workspace-story.mjs';

/*
 * Two landing pages, one visual-first structure. Us (/) is the default: the Enamplify workspace,
 * implemented around an organisation. Me (/me/) is the same workspace for one person. Each opens
 * with a prominent Us · Me switch, a short proposition and its action, then lets the original
 * workspace concepts do the explaining: one large stage and a smoothly sliding contact sheet of every concept
 * (twenty professional on Us, twelve personal on Me). Visual product chapters and the close follow.
 * Both main actions use the real enquiry form; nothing here signs anyone up, and the concepts are
 * static illustrations with fictional data, so nothing on the page pretends to operate them.
 */

const FEATURED = {us: 'legal-lawyer', me: 'me-home-life'};
const file = (id, w) => `/images/workspaces/${id}-${w}.webp`;
const srcset = id => [480, 960, 1536].map(w => `${file(id, w)} ${w}w`).join(', ');
// Keep the large concept and its thin preview rail on one aligned reading width.
const STAGE_SIZES = '(min-width: 1144px) 1080px, (min-width: 720px) calc(100vw - 64px), calc(100vw - 40px)';
const capital = (s, locale) => s.charAt(0).toLocaleUpperCase(locale) + s.slice(1);

/** A concept's localised text plus the derived caption, shelf label, alt text and search terms. */
function view(x, ctx) {
  const g = ctx.copy.common.gallery;
  return {...x,
    caption: capital(fill(g.stageFor, {role: x.role}), ctx.locale),
    label: capital(x.role.replace(/^an? /, ''), ctx.locale),
    alt: fill(g.alt, {role: x.role, title: x.title, tabs: x.tabs.join(', ')}),
    terms: [x.role, x.category, x.title, ...x.tabs, x.id.replace(/-/g, ' ')].join(' ')};
}

/** First viewport: the offering switch, proposition, one line, action, optional note, cross-link. */
const hero = (c, ctx, {current, action, note = '', cross}) => `<section class="hero wrap" aria-labelledby="hero-title">${audienceToggle(ctx, current, {isPage: true, cls: 'audience--hero'})}<h1 id="hero-title">${esc(c.heroTitle)} <span class="h1-alt">${esc(c.heroTitleAlt)}</span></h1><p class="lede">${esc(c.lede)}</p><div class="actions">${button(action[0], action[1])}${note ? `<p class="note">${esc(note)}</p>` : ''}</div>${crossLink(cross[0], cross[1])}</section>`;

/**
 * The large stage and the shelf. Each shelf link opens that concept's full image natively (the
 * no-script path); with scripts a plain click shows it on the stage instead, marks it current and
 * announces it. Search is revealed only when scripts can run it. Thumbnails are lazy 480px files;
 * only the featured stage image loads eagerly.
 */
function studio(c, ctx, collection) {
  const g = ctx.copy.common.gallery;
  const list = ctx.concepts.filter(x => x.collection === collection).map(x => view(x, ctx));
  const lead = list.find(x => x.id === FEATURED[collection]) ?? list[0];
  const controls = `<button class="preview-playback" type="button" data-playback aria-pressed="false" aria-label="${esc(g.play)}" title="${esc(g.play)}" hidden><svg class="icon" data-play-icon viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M5 3l8 5-8 5z"/></svg><svg class="icon" data-pause-icon viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" hidden><path d="M5 3v10M11 3v10"/></svg></button>`;
  const stage = `<figure class="stage" data-stage><div class="stage__frame"><img src="${file(lead.id, 960)}" srcset="${srcset(lead.id)}" sizes="${STAGE_SIZES}" width="1536" height="1024" alt="${esc(lead.alt)}" loading="eager" fetchpriority="high" decoding="async"></div><p class="stage__error" data-error role="status" hidden>${esc(g.loadError)}</p><figcaption class="stage__cap"><span data-caption aria-live="off"><span class="stage__for" data-cap>${esc(lead.label)}</span></span><span class="stage__note">${esc(c.conceptNote)}</span>${controls}</figcaption></figure>`;
  const shelf = `<ul class="shelf">${list.map(v => `<li><a href="${file(v.id, 1536)}" data-concept data-id="${v.id}" data-alt="${esc(v.alt)}" data-label="${esc(v.label)}"${v === lead ? ' aria-current="true"' : ''}><img src="${file(v.id, 480)}" width="480" height="320" alt="" loading="lazy" decoding="async"><span>${esc(v.label)}</span></a></li>`).join('')}</ul>`;
  return `<section class="studio wrap" aria-label="${esc(g.railLabel)}" data-carousel data-play="${esc(g.play)}" data-pause="${esc(g.pause)}">${stage}<div class="preview-rail">${shelf}</div></section>`;
}

export function home(ctx) {
  const {copy} = ctx;
  const c = copy.home;
  const L = ctx.href;
  const delivery = c.delivery;
  return `${hero(c, ctx, {current: 'us', action: [copy.common.usCta, L(US_ENQUIRY)], note: c.note, cross: [c.cross, L('/me/')]})}
${studio(c, ctx, 'us')}
${workspaceStory(ctx, 'us')}
<section class="delivery wrap" aria-labelledby="delivery-title"><div><h2 id="delivery-title">${esc(delivery.title)}</h2><p class="lede">${esc(delivery.sub)}</p></div><ol>${delivery.steps.map(([title, body]) => `<li><h3>${esc(title)}</h3><p>${esc(body)}</p></li>`).join('')}</ol><a class="link-arrow" href="${L('/approach/')}">${esc(delivery.link)}</a></section>
${closeBand(ctx, {title: c.closeTitle, body: c.closeBody, action: [copy.common.usCta, US_ENQUIRY], cross: [c.cross, '/me/']})}`;
}

export function me(ctx) {
  const {copy} = ctx;
  const c = copy.me;
  const L = ctx.href;
  return `${hero(c, ctx, {current: 'me', action: [copy.common.meCta, L(ME_ENQUIRY)], note: c.note, cross: [c.cross, L('/')]})}
${studio(c, ctx, 'me')}
${workspaceStory(ctx, 'me')}
${closeBand(ctx, {title: c.closeTitle, body: c.closeBody, action: [copy.common.meCta, ME_ENQUIRY], cross: [c.cross, '/']})}`;
}
