import { describe, it, expect } from 'vitest';
import { createI18n } from '../index.js';

const locales = ['es', 'en'];
const translations = {
  es: {
    pages: {
      home: { label: 'Inicio' },
      about: { label: 'Sobre el pueblo', title: 'Sobre el pueblo', description: 'Perfil' },
      contact: { label: 'Contacto', title: 'Contacto', description: 'Formulario' },
    },
    gallery: {
      tag: 'Galería',
      items: {
        'gallery-1': { title: 'Gal 1', description: 'Galería 1' },
      },
    },
  },
  en: {
    pages: {
      home: { label: 'Home' },
      about: { label: 'About', title: 'About', description: 'Profile' },
      contact: { label: 'Contact', title: 'Contact', description: 'Form' },
    },
    gallery: {
      tag: 'Gallery',
      items: {
        'gallery-1': { title: 'Gallery 1', description: 'Gallery 1 desc' },
      },
    },
  },
};

const staticPages = [
  { id: 'home', path: { es: '', en: '' } },
  { id: 'about', path: { es: 'sobre-el-pueblo', en: 'about' } },
  { id: 'contact', path: { es: 'contacto', en: 'contact' } },
];

const extraEntries = [
  { id: 'gallery-1', path: { es: 'galerias/galeria-1', en: 'galleries/gallery-1' } },
];

const i18n = createI18n({
  defaultLocale: 'es',
  locales,
  translations,
  pages: staticPages,
  extraEntries,
});

const { t, getNavLinks, translatePath, buildStaticPaths, buildExtraPaths } = i18n;

describe('createI18n', () => {
  it('translates keys and falls back to key when missing', () => {
    expect(t('es', 'pages.about.title')).toBe('Sobre el pueblo');
    expect(t('en', 'pages.about.title')).toBe('About');
    expect(t('en', 'missing.key')).toBe('missing.key');
  });

  it('builds nav links without home by default', () => {
    const links = getNavLinks('es');
    const hrefs = links.map(l => l.href);
    expect(hrefs).toEqual(['/es/sobre-el-pueblo', '/es/contacto']);
  });

  it('translates static paths when switching locale', () => {
    expect(translatePath('/es/sobre-el-pueblo', 'en')).toBe('/en/about');
    expect(translatePath('/en/about', 'es')).toBe('/es/sobre-el-pueblo');
  });

  it('translates extra entries (galleries) when switching locale', () => {
    expect(translatePath('/es/galerias/galeria-1', 'en')).toBe(
      '/en/galleries/gallery-1'
    );
    expect(translatePath('/en/galleries/gallery-1', 'es')).toBe(
      '/es/galerias/galeria-1'
    );
  });

  it('keeps remainder of path when no mapping exists', () => {
    expect(translatePath('/es/foo/bar', 'en')).toBe('/en/foo/bar');
  });

  it('builds static paths for all locales (excluding home)', () => {
    const paths = buildStaticPaths();
    const params = paths.map(p => `${p.params.lang}:${p.params.path.join('/')}`);
    expect(params).toContain('es:sobre-el-pueblo');
    expect(params).toContain('en:about');
    expect(params).toContain('es:contacto');
    expect(params).toContain('en:contact');
    expect(params).not.toContain('es:'); // home is excluded
  });

  it('builds extra paths for galleries', () => {
    const paths = buildExtraPaths();
    const params = paths.map(p => `${p.params.lang}:${p.params.path.join('/')}`);
    expect(params).toContain('es:galerias/galeria-1');
    expect(params).toContain('en:galleries/gallery-1');
  });
});
