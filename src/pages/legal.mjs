import {esc, button, textLink, pageHead} from '../components.mjs';

const pages = (site, enquiryMode) => ({
  privacy: {title: 'Privacy', description: 'How the Enamplify website handles the information you share, in plain English.', lede: 'What this website collects, why, and how to reach us.', sections: [
    ['Who we are', `Enamplify is an AI enablement practice led by Amir Gulubayli. For any question about your information, email ${site.email}.`],
    ['Your enquiry', enquiryMode === 'server' ? 'The contact form sends your details and message through Resend to our inbox, and Cloudflare Turnstile checks the form for automated abuse. We use your enquiry only to reply to you.' : 'The contact form prepares a message in your own email app. Nothing you type is sent to an Enamplify server; your email provider handles the message when you choose to send it.'],
    ['Booking a call', 'Booking opens our scheduling provider in a new tab. The details you enter there are handled under that provider’s privacy policy and used by us only to hold the call.'],
    ['Field guide notes', 'Notes typed into a field guide stay in the page. They are not sent to us or saved.'],
    ['Technical information', 'Our hosting provider processes technical information such as IP addresses to deliver and protect the site. We do not use advertising trackers or marketing analytics.'],
    ['Fonts and images', 'Fonts are served from this website. The founder portrait may be served from ragmedium.com, our previous website.'],
    ['Your rights', `You can ask what we hold about you, and ask us to correct or delete it, by emailing ${site.email}.`]]},
  cookies: {title: 'Cookies', description: 'Enamplify sets no advertising or analytics cookies. What the website stores, and what it does not.', lede: 'A short answer: we don’t set any.', sections: [
    ['No cookies from us', 'This website does not set advertising, analytics or preference cookies, and does not use browser storage to follow you.'],
    ['Other services', 'Our booking provider and LinkedIn set their own cookies when you visit them. Their policies apply there.'],
    ['If this changes', 'If we ever add analytics or embedded services, we will update this page and ask for consent where the law requires it, before they run.']]},
  terms: {title: 'Terms', description: 'The terms that apply to using the Enamplify website and its free field guides.', lede: 'The ground rules for this website.', sections: [
    ['General information', 'This website describes Enamplify and how we work. It is general information, not an offer to provide a particular service.'],
    ['Engagements', 'Every engagement is governed by its own written agreement setting out scope, fees and responsibilities. An enquiry or call does not create one.'],
    ['Not professional advice', 'Articles and field guides are educational. They are not legal, regulatory or financial advice.'],
    ['No guaranteed outcomes', 'Examples and exhibits marked illustrative explain a pattern; they are not a promise of results.'],
    ['Using the field guides', 'You may use the field guides within your organisation and share links to them. Please keep the Enamplify attribution.'],
    ['Questions', `Email ${site.email}.`]]},
  accessibility: {title: 'Accessibility', description: 'How the Enamplify website is built to be usable by as many people as possible, and how to report a problem.', lede: 'We aim to meet WCAG 2.2 AA across the site.', sections: [
    ['How the site is built', 'Pages use semantic HTML, visible focus states, sufficient colour contrast and a skip link. Every page works without JavaScript, and motion is switched off if you ask your device to reduce it.'],
    ['Charts', 'Every exhibit has a text equivalent: a readable legend, a table, or a description for screen readers.'],
    ['Known limitations', 'The booking calendar is provided by a third party and may not meet the same standard. If it gives you trouble, email us and we will arrange a time directly.'],
    ['Report a problem', `Email ${site.email} and we will reply within five working days.`]]}
});

export const legalMeta = (key, site, enquiryMode) => {
  const p = pages(site, enquiryMode)[key];
  return {title: p.title, description: p.description};
};

export function legal(key, {site, enquiryMode}) {
  const p = pages(site, enquiryMode)[key];
  return `${pageHead({title: p.title, lede: p.lede, crumbs: [[p.title]]})}<section class="section wrap"><div class="prose prose--legal">${p.sections.map(([h, t]) => `<h2>${esc(h)}</h2><p>${esc(t)}</p>`).join('')}<p class="small">Last updated ${esc(site.launchDate)}.</p></div></section>`;
}

export const notFound = () => `<section class="section wrap not-found"><h1>This page has moved, or never existed.</h1><p class="lede">We recently reorganised the site. Most of what was here now lives under Approach or Insights.</p><div class="actions">${button('Back to the home page', '/')}${textLink('Browse insights', '/insights/')}</div></section>`;
