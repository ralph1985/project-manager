/**
 * Minimal i18n + route helpers for Astro.
 * - Keeps slugs SEO-friendly per locale.
 * - Avoids duplicating templates: you feed definitions, it gives you translators and path builders.
 */

const defaultGetNested = (obj, path) =>
  path.reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj);

export function createI18n({
  defaultLocale,
  locales,
  translations,
  pages,
  extraEntries = [],
  getNested = defaultGetNested,
}) {
  const localeSet = new Set(locales);

  const t = (locale, key) => {
    const dict = translations[locale] ?? translations[defaultLocale];
    const value = getNested(dict, key.split('.'));
    if (typeof value === 'string') return value;
    return key;
  };

  const getNavLinks = (locale, { includeHome = false } = {}) =>
    pages
      .filter(p => includeHome || p.id !== 'home')
      .map(p => ({
        href: `/${locale}/${p.path[locale]}`.replace(/\/+$/, ''),
        label: t(locale, `pages.${p.id}.label`),
      }));

  const translatePath = (pathname, targetLocale) => {
    const normalized = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    const segments = normalized.split('/').filter(Boolean);
    const currentLocale = segments[0];
    const rest =
      localeSet.has(currentLocale) && segments.length ? segments.slice(1) : segments;
    const restPath = rest.join('/');

    const matchEntry = [...pages, ...extraEntries].find(entry =>
      Object.values(entry.path).some(path => trim(path) === restPath)
    );

    if (matchEntry) {
      const targetPath = matchEntry.path[targetLocale] ?? matchEntry.path[defaultLocale];
      return `/${targetLocale}/${targetPath}`.replace(/\/+$/, '');
    }

    if (!restPath) return `/${targetLocale}`;
    return `/${targetLocale}/${restPath}`;
  };

  const buildStaticPaths = (ids = []) => {
    const selected = ids.length
      ? pages.filter(p => ids.includes(p.id))
      : pages.filter(p => p.id !== 'home');

    const paths = [];
    for (const locale of locales) {
      for (const entry of selected) {
        const segments = trim(entry.path[locale]).split('/').filter(Boolean);
        paths.push({
          params: { lang: locale, path: segments },
          props: { locale, type: 'static', pageId: entry.id },
        });
      }
    }
    return paths;
  };

  const buildExtraPaths = () => {
    const paths = [];
    for (const locale of locales) {
      for (const entry of extraEntries) {
        const segments = trim(entry.path[locale]).split('/').filter(Boolean);
        const slug = segments.at(-1) ?? entry.id;
        paths.push({
          params: { lang: locale, path: segments },
          props: { locale, type: 'extra', id: entry.id, slug },
        });
      }
    }
    return paths;
  };

  return {
    t,
    getNavLinks,
    translatePath,
    buildStaticPaths,
    buildExtraPaths,
  };
}

const trim = value => value.replace(/^\/+|\/+$/g, '');
