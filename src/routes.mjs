import {home} from './pages/home.mjs';
import {approach} from './pages/approach.mjs';
import {work} from './pages/work.mjs';
import {about} from './pages/about.mjs';
import {insights, article, guide} from './pages/insights.mjs';
import {contact} from './pages/contact.mjs';
import {legal, legalMeta, notFound} from './pages/legal.mjs';

export const redirects = [
  {source: '/solutions/', destination: '/approach/'},
  {source: '/solutions/:slug/', destination: '/approach/'},
  {source: '/for/:slug/', destination: '/'},
  {source: '/start/:slug/', destination: '/contact/'},
  {source: '/work/:slug/', destination: '/work/'},
  {source: '/perspectives/', destination: '/insights/'},
  {source: '/perspectives/:slug/', destination: '/insights/:slug/'},
  {source: '/resources/', destination: '/insights/'},
  {source: '/resources/:slug/', destination: '/insights/guides/:slug/'},
  {source: '/credits/', destination: '/'},
  {source: '/thank-you/', destination: '/'}
];

export function routeTable(ctx) {
  const {site, articles, guides, faqs, enquiryMode} = ctx;
  const routes = [
    {url: '/', home: true, title: 'Enamplify · AI enablement for mid-sized teams', description: site.description, html: home(ctx), bodyClass: 'is-home'},
    {url: '/approach/', title: 'How AI enablement works: diagnose, prove, scale', description: 'Start small, prove it, then scale. How Enamplify helps teams build their own AI workflows with review, governance and data kept where it belongs.', crumbs: [['Approach']], faqs, html: approach(ctx)},
    {url: '/work/', title: 'AI systems we’ve built and products we run', description: 'Delivered AI systems across clinical, finance, growth and operations, a Google hackathon win, and the AI products we build and run ourselves.', crumbs: [['Work']], html: work(ctx)},
    {url: '/about/', title: 'About Enamplify: founder-led, London and Baku', description: 'Enamplify is a founder-led AI enablement consultancy in London and Baku. Meet Amir Gulubayli and the principles behind the work.', crumbs: [['About']], html: about(ctx)},
    {url: '/insights/', title: 'Insights on AI adoption for operations leaders', description: 'Practical essays and free field guides on AI adoption, pilots, measurement and governance for operations leaders.', crumbs: [['Insights']], html: insights(ctx)},
    ...articles.map(a => ({url: `/insights/${a.slug}/`, title: a.title, description: a.summary, crumbs: [['Insights', '/insights/'], [a.title]], article: a, html: article(a, ctx), bodyClass: 'is-article'})),
    ...guides.map(g => ({url: `/insights/guides/${g.slug}/`, title: g.name, description: g.description, crumbs: [['Insights', '/insights/'], [g.name]], html: guide(g), bodyClass: 'is-guide'})),
    {url: '/contact/', title: 'Book a diagnostic call', description: 'Book a 30-minute diagnostic call with Amir Gulubayli, founder of Enamplify. No pitch deck: a conversation about your team and its work.', crumbs: [['Book a call']], contact: true, html: contact(ctx)},
    ...['privacy', 'cookies', 'terms', 'accessibility'].map(key => ({url: `/${key}/`, ...legalMeta(key, site, enquiryMode), crumbs: [[legalMeta(key, site, enquiryMode).title]], html: legal(key, ctx)})),
    {url: '/404/', title: 'Page not found', description: 'This page has moved. Find your way back to Enamplify.', index: false, notFound: true, html: notFound()}
  ];
  return routes;
}
