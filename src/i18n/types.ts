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
  verticalTab: {
    title: string;
    description: string;
    tabs: {
      datadriven: string;
      seamless: string;
      custom: string;
      multilanguage: string;
    };
    tabContent: {
      datadriven: string;
      datadrivenWhy: string;
      seamless: string;
      seamlessWhy: string;
      custom: string;
      customWhy: string;
      multilanguage: string;
      multilanguageWhy: string;
    };
    whyItMatters: string;
  };
  services: {
    heading: string;
    description: string;
    startProject: string;
    viewWork: string;
  };
}

// Translation types for Navigation
export interface NavTranslations {
  logo: string;
  works: string;
  blog: string;
  services: string;
  cta: string;
}

// Translation types for Common elements
export interface CommonTranslations {
  languageName: string;
  switchToArabic?: string;
  switchToEnglish?: string;
  closeMenu: string;
  languageNotice: {
    title: string;
    message: string;
  };
  ctaBanner: {
    title: string;
    description: string;
  };
  meta: {
    home: {
      title: string;
      description: string;
    };
    services: {
      title: string;
      description: string;
    };
    works: {
      title: string;
      description: string;
    };
    blog: {
      title: string;
      description: string;
    };
    contact: {
      title: string;
      description: string;
    };
    'get-in-touch': {
      title: string;
      description: string;
    };
  };
}

// Translation types for Vertical Tabs
export interface VerticalTabTranslations {
  title: string;
  description: string;
  tabs: {
    datadriven: string;
    seamless: string;
    custom: string;
    multilanguage: string;
  };
  tabContent: {
    datadriven: string;
    datadrivenWhy: string;
    seamless: string;
    seamlessWhy: string;
    custom: string;
    customWhy: string;
    multilanguage: string;
    multilanguageWhy: string;
  };
  whyItMatters: string;
}

// Translation types for Multilanguage Section
export interface MultilanguageTranslations {
  badge: string;
  title: string;
  description: string;
}

// Translation types for Testimonial Section
export interface TestimonialTranslations {
  badge: string;
  title: string;
  description: string;
  cta: string;
}

// Translation types for CTA
export interface CTATranslations {
  heading: string;
  subheading: string;
  getStarted: string;
  viewServices: string;
}

// Translation types for Comparison Section
export interface ComparisonTranslations {
  badge: string;
  title: string;
  description: string;
  columnHeaders: {
    feature: string;
    vebLabs: string;
    inHouse: string;
    typicalAgency: string;
  };
  features: {
    multilingualExpertise: string;
    revenueDrivenDesign: string;
    tailoredSolutions: string;
    dedicatedSupport: string;
    cuttingEdgeTools: string;
    scalableServices: string;
    regionalKnowledge: string;
  };
  cta: string;
}

// Translation types for FAQ Section
export interface FaqTranslations {
  badge: string;
  title: string;
  description: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

// Translation types for Footer
export interface FooterTranslations {
  companyDescription: string;
  contact: {
    title: string;
    readyToStart: string;
    benefits: {
      consultation: string;
      response: string;
      manager: string;
    };
  };
  support: {
    title: string;
    options: Array<{
      name: string;
      description: string;
    }>;
    businessHours: {
      title: string;
      weekdays: string;
      weekend: string;
    };
  };
  quickLinks: {
    title: string;
    links: Array<{
      name: string;
      url: string;
    }>;
  };
  services: {
    title: string;
    list: Array<string>;
  };
  address: {
    title: string;
    line1: string;
    line2: string;
  };
  copyright: string;
}

// Translation types for Projects
export interface ProjectTranslations {
  viewProject: string;
  keyResults: string;
  projects: {
    [key: string]: {
      title: string;
      description: string;
      category: string;
      client: string;
      results: string[];
    };
  };
}

// Translation types for OurWork
export interface OurWorkTranslations {
  badge: string;
  title: string;
  description: string;
  viewProject: string;
  all_projects: string;
}

// Translation types for Contact
export interface ContactTranslations {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    title: string;
    description: string;
  };
  form: {
    title: string;
    description: string;
    name: string;
    email: string;
    message: string;
    submit: string;
    success: string;
    error: string;
  };
  benefits: {
    support: {
      title: string;
      description: string;
    };
    response: {
      title: string;
      description: string;
    };
    team: {
      title: string;
      description: string;
    };
  };
}

// Translation types for Blog
export interface BlogTranslations {
  badge: string;
  title: string;
  description: string;
  search_placeholder: string;
  all_posts: string;
  newsletter: {
    title: string;
    description: string;
    email_placeholder: string;
    subscribe: string;
  };
}

// Translation types for Service
export interface ServiceItem {
  title: string;
  description: string;
  features: string[];
}

export interface ServiceTranslations {
  title: string;
  hero: {
    heading: string;
    description: string;
    startProject: string;
    viewWork: string;
  };
  services: {
    webDev: ServiceItem;
    uiux: ServiceItem;
    marketing: ServiceItem;
    support: ServiceItem;
  };
  pricing: {
    title: string;
    subtitle: string;
    basic: {
      name: string;
      price: string;
      usdPrice: string;
      description: string;
      features: string[];
    };
    professional: {
      name: string;
      price: string;
      usdPrice: string;
      description: string;
      features: string[];
    };
    enterprise: {
      name: string;
      price: string;
      description: string;
      features: string[];
    };
    cta: string;
  };
  whyChooseUs: {
    title: string;
  };
}

// Translation types for 404 page
export interface NotFoundTranslations {
  meta: {
    title: string;
    description: string;
  };
  message: string;
  buttons: {
    home: string;
    contact: string;
  };
}

// All translation namespaces
export interface Translations {
  hero: HeroTranslations;
  nav: NavTranslations;
  common: CommonTranslations;
  verticalTab: VerticalTabTranslations;
  multilanguage: MultilanguageTranslations;
  testimonial: TestimonialTranslations;
  cta: CTATranslations;
  comparison: ComparisonTranslations;
  faq: FaqTranslations;
  footer: FooterTranslations;
  projects: ProjectTranslations;
  ourwork: OurWorkTranslations;
  contact: ContactTranslations;
  blog: BlogTranslations;
  services: ServiceTranslations;
  "404": NotFoundTranslations;
}
