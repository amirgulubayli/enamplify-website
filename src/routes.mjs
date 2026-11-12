import {homeNew, meNew} from './pages/home-new.mjs';
import {approach} from './pages/approach.mjs';
import {about} from './pages/about.mjs';
import {insights, article, guide} from './pages/insights.mjs';
import {contact} from './pages/contact.mjs';
import {discover} from './pages/discover.mjs';
import {careers} from './pages/careers.mjs';
import {caseStudy} from './pages/cases.mjs';
import {portfolio, portfolioMeta} from './pages/portfolio.mjs';
import {briefing} from './pages/briefing.mjs';
import {legal, legalMeta, legalKeys, notFound} from './pages/legal.mjs';
import {defaultLocale, localePath, alternatesFor} from './i18n.mjs';

export const redirects = [
  {source: '/solutions/', destination: '/approach/'},
  {source: '/solutions/:slug/', destination: '/approach/'},
  {source: '/for/:slug/', destination: '/'},
  {source: '/start/:slug/', destination: '/contact/'},
  {source: '/new/me/', destination: '/me/'},
  {source: '/new/', destination: '/'},
  {source: '/az/new/me/', destination: '/az/me/'},
  {source: '/az/new/', destination: '/az/'},
  {source: '/work/', destination: '/'},
  {source: '/work/pripitch/', destination: '/'},
  {source: '/work/grademy/', destination: '/'},
  {source: '/work/rag-x/', destination: '/'},
  {source: '/perspectives/', destination: '/insights/'},
  {source: '/perspectives/:slug/', destination: '/insights/:slug/'},
  {source: '/resources/', destination: '/insights/'},
  {source: '/resources/:slug/', destination: '/insights/guides/:slug/'},
  {source: '/credits/', destination: '/'},
  {source: '/thank-you/', destination: '/'}
];

/**
 * The pages of one locale. Each route has a stable `key`, its `locale`, its own `url` and the
 * `alternates` (locale code → URL) of the same page in every locale. The bilingual 404 belongs to
 * the default locale only; `notFoundAlso` lists the other locales' contexts to show on it.
 */
export function routeTable(ctx, {notFoundAlso = []} = {}) {
  const {site, articles, guides, faqs, cases, copy} = ctx;
  const r = copy.routes;
  const page = (key, path, fields) => ({key, locale: ctx.locale, url: localePath(ctx.locale, path), alternates: alternatesFor(path), ...fields});
  const routes = [
    page('home', '/', {home: true, title: r.home.title, description: site.description, html: homeNew(ctx), bodyClass: 'is-home is-new'}),
    // Me is a landing page in its own right: a full title (no "| Enamplify" suffix) and no visible
    // breadcrumb, though its structured data still places it under the home page.
    page('me', '/me/', {standalone: true, title: r.me.title, description: r.me.description, crumbs: [[r.me.crumb]], html: meNew(ctx), bodyClass: 'is-home is-new is-me'}),
    page('approach', '/approach/', {title: r.approach.title, description: r.approach.description, crumbs: [[r.approach.crumb]], faqs, html: approach(ctx)}),
    page('portfolio', '/portfolio/', {title: portfolioMeta(ctx.locale).title, description: portfolioMeta(ctx.locale).description, crumbs: [[portfolioMeta(ctx.locale).title]], index: false, html: portfolio(ctx), bodyClass: 'is-portfolio'}),
    page('briefing', '/briefing/', {title: r.briefing.title, description: r.briefing.description, crumbs: [[r.briefing.crumb]], index: false, html: briefing(ctx), bodyClass: 'is-guide is-briefing'}),
    ...cases.map(c => page(`case:${c.slug}`, `/work/${c.slug}/`, {title: c.title, description: c.summary, crumbs: [[c.title]], caseStudy: c, html: caseStudy(c, ctx), bodyClass: 'is-case'})),
    page('about', '/about/', {title: r.about.title, description: r.about.description, crumbs: [[r.about.crumb]], html: about(ctx)}),
    page('insights', '/insights/', {title: r.insights.title, description: r.insights.description, crumbs: [[r.insights.crumb]], html: insights(ctx)}),
    ...articles.map(a => page(`article:${a.slug}`, `/insights/${a.slug}/`, {title: a.title, description: a.summary, crumbs: [[r.insights.crumb, '/insights/'], [a.title]], article: a, html: article(a, ctx), bodyClass: 'is-article'})),
    ...guides.map(g => page(`guide:${g.slug}`, `/insights/guides/${g.slug}/`, {title: g.name, description: g.description, crumbs: [[r.insights.crumb, '/insights/'], [g.name]], html: guide(g, ctx), bodyClass: 'is-guide'})),
    page('careers', '/careers/', {title: r.careers.title, description: r.careers.description, crumbs: [[r.careers.crumb]], job: {...copy.careers.role, posted: site.careersPosted}, html: careers(ctx)}),
    page('discover', '/discover/', {title: r.discover.title, description: r.discover.description, crumbs: [[r.discover.crumb]], index: false, html: discover(ctx), bodyClass: 'is-discover'}),
    page('contact', '/contact/', {title: r.contact.title, description: r.contact.description, crumbs: [[r.contact.crumb]], contact: true, html: contact(ctx)}),
    ...legalKeys.map(key => page(`legal:${key}`, `/${key}/`, {...legalMeta(key, ctx), crumbs: [[legalMeta(key, ctx).title]], html: legal(key, ctx)}))
  ];
  if (ctx.locale === defaultLocale) {
    const versions = [ctx, ...notFoundAlso];
    routes.push({key: 'notFound', locale: ctx.locale, url: '/404/', alternates: alternatesFor('/'), index: false, notFound: true,
      title: versions.map(v => v.copy.routes.notFound.title).join(' · '), description: versions.map(v => v.copy.routes.notFound.description).join(' '), html: notFound(versions)});
  }
  return routes;
}
