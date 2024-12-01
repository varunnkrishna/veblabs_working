import { defineMiddleware } from 'astro:middleware';
import { getLanguageFromURL } from './i18n/utils';
import { defaultLang, supportedLanguages } from './i18n/config';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  
  // Skip API routes and static assets
  if (pathname.startsWith('/api/') || pathname.match(/\.(jpg|png|gif|svg|css|js)$/)) {
    return next();
  }

  // Handle root path
  if (pathname === '/') {
    return context.redirect(`/${defaultLang}`);
  }

  // Get language from URL
  const lang = getLanguageFromURL(pathname);

  // If no language is specified or language is not supported, redirect to default language
  if (!lang || !Object.keys(supportedLanguages).includes(lang)) {
    const newPath = `/${defaultLang}${pathname}`;
    return context.redirect(newPath);
  }

  // Continue to the next middleware/route
  return next();
});
