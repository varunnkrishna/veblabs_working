import { ui, defaultLang, supportedLanguages } from './config';
import type { SupportedLanguage } from './config';
import type { Translations, HeroTranslations, NavTranslations, CommonTranslations } from './types';

type TranslationModule = {
  default: unknown;
};

type TranslationImports = {
  [L in SupportedLanguage]: {
    [K in keyof Translations]: () => Promise<TranslationModule>;
  };
};

// Import all translation files
const translations: TranslationImports = {
  en: {
    common: () => import('./translations/en/common.json'),
    nav: () => import('./translations/en/nav.json'),
    hero: () => import('./translations/en/hero.json'),
    multilanguage: () => import('./translations/en/multilanguage.json'),
    testimonial: () => import('./translations/en/testimonial.json'),
    verticalTab: () => import('./translations/en/verticalTab.json'),
    cta: () => import('./translations/en/cta.json'),
    comparison: () => import('./translations/en/comparison.json'),
    faq: () => import('./translations/en/faq.json'),
    footer: () => import('./translations/en/footer.json'),
    projects: () => import('./translations/en/projects.json'),
    ourwork: () => import('./translations/en/ourwork.json'),
    contact: () => import('./translations/en/contact.json')
  },
  ar: {
    common: () => import('./translations/ar/common.json'),
    nav: () => import('./translations/ar/nav.json'),
    hero: () => import('./translations/ar/hero.json'),
    multilanguage: () => import('./translations/ar/multilanguage.json'),
    testimonial: () => import('./translations/ar/testimonial.json'),
    verticalTab: () => import('./translations/ar/verticalTab.json'),
    cta: () => import('./translations/ar/cta.json'),
    comparison: () => import('./translations/ar/comparison.json'),
    faq: () => import('./translations/ar/faq.json'),
    footer: () => import('./translations/ar/footer.json'),
    projects: () => import('./translations/ar/projects.json'),
    ourwork: () => import('./translations/ar/ourwork.json'),
    contact: () => import('./translations/ar/contact.json')
  }
};

export function getLanguageFromURL(pathname: string): SupportedLanguage {
  const [, lang] = pathname.split('/');
  if (lang && Object.keys(supportedLanguages).includes(lang)) {
    return lang as SupportedLanguage;
  }
  return defaultLang;
}

export async function loadTranslations<K extends keyof Translations>(
  lang: SupportedLanguage,
  namespace: K
): Promise<Translations[K]> {
  try {
    const module = await translations[lang][namespace]();
    return module.default as Translations[K];
  } catch (error) {
    console.error(`Failed to load translations for ${lang}.${namespace}:`, error);
    return {} as Translations[K];
  }
}

export function useTranslations(lang: SupportedLanguage) {
  const cache: Partial<Record<keyof Translations, unknown>> = {};

  return async function t<K extends keyof Translations>(namespace: K): Promise<Translations[K]> {
    if (!cache[namespace]) {
      cache[namespace] = await loadTranslations(lang, namespace);
    }
    return cache[namespace] as Translations[K];
  };
}

export function getLanguageDirection(lang: SupportedLanguage): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function getRelativeURL(pathname: string, lang: SupportedLanguage): string {
  const segments = pathname.split('/').filter(Boolean);
  const currentLang = getLanguageFromURL(pathname);
  
  // If we're already on a language route, remove the language segment
  if (currentLang === segments[0]) {
    segments.shift();
  }
  
  // If no path segments remain, return just the language
  if (segments.length === 0) {
    return `/${lang}`;
  }
  
  return `/${lang}/${segments.join('/')}`;
}