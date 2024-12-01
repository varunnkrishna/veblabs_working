export const defaultLang = 'en';

export const supportedLanguages = {
  en: 'English',
  ar: 'العربية'
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

export const ui = {
  en: {
    'nav.language': 'Language',
  },
  ar: {
    'nav.language': 'اللغة',
  },
} as const;