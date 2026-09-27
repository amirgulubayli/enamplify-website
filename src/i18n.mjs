// Locales, locale-aware URLs and a tiny string template helper. No i18n library.
export const locales = {
  en: {code: 'en', lang: 'en-GB', hreflang: 'en-GB', prefix: '', ogLocale: 'en_GB', label: 'EN', name: 'English'},
  az: {code: 'az', lang: 'az', hreflang: 'az', prefix: '/az', ogLocale: 'az_AZ', label: 'AZ', name: 'Azərbaycanca'}
};
export const defaultLocale = 'en';
export const localeCodes = Object.keys(locales);

const codeOf = locale => (typeof locale === 'string' ? locale : locale?.code) || defaultLocale;

/** True for root-relative page paths (and the feed) that live under a locale prefix; assets never do. */
const isLocalised = path => path.startsWith('/') && !path.startsWith('//') && (path.endsWith('/') || path === '/feed.xml' || /^\/(?:[^?#]*\/)?[?#]/.test(path));

/** Strip any locale prefix, giving the base (English) path: `/az/x/` → `/x/`, `/az/?q` → `/?q`. */
export function basePath(path) {
  for (const {prefix} of Object.values(locales)) {
    if (!prefix || typeof path !== 'string') continue;
    if (path === prefix) return '/';
    if (path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`) || path.startsWith(`${prefix}#`)) return path.slice(prefix.length).replace(/^(?=[?#])/, '/');
  }
  return path;
}

/**
 * The path in a locale: `/approach/` → `/az/approach/`, `/` → `/az/`, `/?x` → `/az/?x`. Idempotent:
 * an already-prefixed path is re-based first, so `/az/approach/` stays `/az/approach/` (and becomes
 * `/approach/` for English). Assets, downloads and external links pass through.
 */
export function localePath(locale, path) {
  if (typeof path !== 'string' || !isLocalised(path)) return path;
  return locales[codeOf(locale)].prefix + basePath(path);
}

export const otherLocale = code => localeCodes.find(c => c !== codeOf(code));

/** Every locale's URL for one base path. */
export const alternatesFor = path => Object.fromEntries(localeCodes.map(c => [c, localePath(c, path)]));

/** Fill `{name}` placeholders. Unknown placeholders are left visible so a missing value is noticed. */
export const fill = (template, values = {}) => String(template).replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
