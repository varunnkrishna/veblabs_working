import { defineMiddleware } from 'astro:middleware';
import { getLanguageFromURL } from './i18n/utils';
import { defaultLang, supportedLanguages } from './i18n/config';

// Define valid routes that should have language prefixes
const validRoutes = new Set([
  '',
  'about',
  'blog',
  'contact',
  'get-in-touch',
  'services',
  'works'
]);

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

  // Get the path segments
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  // Check if the first segment is a valid language
  const isValidLang = Object.keys(supportedLanguages).includes(firstSegment);
  
  // If no language prefix or invalid language, redirect
  if (!isValidLang) {
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

    // If it's a valid route without language prefix, redirect to language version
    const route = segments[0] || '';
    if (validRoutes.has(route)) {
      const newPath = `/${preferredLang}${pathname}`;
      return context.redirect(newPath, 301);
    }

    // For invalid or root paths, redirect to language home
    return context.redirect(`/${preferredLang}`, 301);
  }

  // Handle invalid routes with language prefix
  if (segments.length > 1) {
    const route = segments[1] || '';
    if (!validRoutes.has(route) && !route.startsWith('blog/') && !route.startsWith('works/')) {
      return context.redirect(`/${firstSegment}`, 301);
    }
  }

  // Continue to the next middleware/route
  return next();
});
