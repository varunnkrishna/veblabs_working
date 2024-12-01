// Translation types for Hero component
export interface HeroTranslations {
  mainHeading: {
    part1: string;
    part2: string;
  };
  subtitle: string;
  cta: {
    primary: string;
    secondary: string;
  };
  features: {
    seo: {
      title: string;
      description: string;
    };
    speed: {
      title: string;
      description: string;
    };
    customization: {
      title: string;
      description: string;
    };
    multilingual: {
      title: string;
      description: string;
    };
  };
  trust: string;
}

// Translation types for Navigation
export interface NavTranslations {
  works: string;
  blog: string;
  services: string;
  about: string;
  cta: string;
}

// Translation types for Common elements
export interface CommonTranslations {
  languageName: string;
  switchToArabic?: string;
  switchToEnglish?: string;
}

// All translation namespaces
export interface Translations {
  hero: HeroTranslations;
  nav: NavTranslations;
  common: CommonTranslations;
}
