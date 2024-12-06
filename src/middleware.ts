import { defineMiddleware } from 'astro:middleware';
import { getLanguageFromURL } from './i18n/utils';
import { defaultLang, supportedLanguages } from './i18n/config';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, hostname } = context.url;
  
  // Handle www to non-www redirect first
  if (hostname.startsWith('www.')) {
    const newUrl = new URL(context.url);
    newUrl.hostname = newUrl.hostname.replace('www.', '');
    return context.redirect(newUrl.toString(), 301);
  }

  // Skip API routes and static assets
  if (pathname.startsWith('/api/') || 
      pathname.match(/\.(jpg|png|gif|svg|css|js|webp|ico|xml)$/)) {
    return next();
  }

  // Get language from URL
  const lang = getLanguageFromURL(pathname);
  const hasLangPrefix = pathname.match(/^\/[a-z]{2}\//);

  // If no language prefix or invalid language, redirect
  if (!hasLangPrefix || !Object.keys(supportedLanguages).includes(lang)) {
    // Get user's preferred language from browser
    const acceptLanguage = context.request.headers.get('accept-language');
    let preferredLang = defaultLang;

    if (acceptLanguage) {
      const userLanguages = acceptLanguage.split(',')
        .map(lang => lang.split(';')[0].trim().substring(0, 2));
      
      preferredLang = userLanguages.find(lang => 
        Object.keys(supportedLanguages).includes(lang)
      ) || defaultLang;
    }

    // Create new path with language prefix
    const pathWithoutLang = hasLangPrefix ? pathname.substring(3) : pathname;
    const newPath = `/${preferredLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
    
    // Always redirect to language-prefixed URL
    return context.redirect(newPath, 301);
  }

  // Continue to the next middleware/route
  return next();
});
