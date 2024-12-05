import { defineMiddleware } from 'astro:middleware';
import { getLanguageFromURL } from './i18n/utils';
import { defaultLang, supportedLanguages } from './i18n/config';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  
  // Skip API routes and static assets
  if (pathname.startsWith('/api/') || 
      pathname.match(/\.(jpg|png|gif|svg|css|js|webp|ico|xml)$/)) {
    return next();
  }

  // Get language from URL
  const lang = getLanguageFromURL(pathname);

  // Handle root path and missing language prefix
  if (!lang || !Object.keys(supportedLanguages).includes(lang)) {
    // Don't redirect if it's an API call or static asset
    if (pathname.startsWith('/api/') || pathname.includes('.')) {
      return next();
    }

    // Get user's preferred language from browser
    const acceptLanguage = context.request.headers.get('accept-language');
    let preferredLang = defaultLang;

    if (acceptLanguage) {
      const userLanguages = acceptLanguage.split(',')
        .map(lang => lang.split(';')[0].trim().substring(0, 2));
      
      // Find the first supported language from user's preferences
      preferredLang = userLanguages.find(lang => 
        Object.keys(supportedLanguages).includes(lang)
      ) || defaultLang;
    }

    // Only redirect if we're at the root or missing language prefix
    if (pathname === '/' || !pathname.match(/^\/[a-z]{2}\//)) {
      const newPath = `/${preferredLang}${pathname === '/' ? '' : pathname}`;
      return context.redirect(newPath, 307); // 307 for temporary redirect
    }
  }

  // Continue to the next middleware/route
  return next();
});
