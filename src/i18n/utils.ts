import en from './en.json';
import ar from './ar.json';

export const languages = {
  en: 'English',
  ar: 'العربية'
};

export const defaultLang = 'en';

export const ui = {
  en,
  ar
} as const;

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: string) {
    const keys = key.split('.');
    let value = ui[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
}
