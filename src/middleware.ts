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
  'works',
  'quote'
]);

// URL redirects map for old URLs
const redirectMap = new Map([
  // Blog post redirects
  ['/why-your-website-obsolete-2025', '/web-design-trends-2025'],
  ['/comparing-web-development-dubai', '/website-design-in-dubai'],
  ['/professional-web-development', '/website-design-in-dubai'],
  // Add more redirects for commonly accessed old URLs
  ['/contact-us', '/get-in-touch'],
  ['/portfolio', '/works'],
  ['/about-us', '/about'],
  ['/blog/web-design', '/blog/web-design-trends-2025'],
  ['/services/web-development', '/services'],
  ['/services/mobile-development', '/services'],
  ['/services/digital-marketing', '/services']
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, hostname } = context.url;
  
  // Handle www to non-www redirect first
  if (hostname.startsWith('www.')) {
    const newUrl = new URL(context.url);
    newUrl.hostname = newUrl.hostname.replace('www.', '');
    return context.redirect(newUrl.toString().replace(/\/$/, ''), 301);
  }

  // Skip API routes and static assets
  if (pathname.startsWith('/api/') || 
      pathname.match(/\.(jpg|png|gif|svg|css|js|webp|ico|xml|txt|pdf)$/)) {
    return next();
  }

  // Remove trailing slashes
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return context.redirect(context.url.toString().replace(/\/$/, ''), 301);
  }

  // Handle redirects for old URLs
  const pathWithoutLang = pathname.replace(/^\/[a-z]{2}\//, '');
  for (const [oldPath, newPath] of redirectMap) {
    if (pathWithoutLang.startsWith(oldPath)) {
      const lang = getLanguageFromURL(pathname);
      return context.redirect(`/${lang}${newPath}`, 301);
    }
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

    // Construct new URL with language prefix
    const newUrl = new URL(context.url);
    newUrl.pathname = `/${preferredLang}${pathname}`;
    return context.redirect(newUrl.toString().replace(/\/$/, ''), 301);
  }

  // Get the route without language prefix
  const route = segments[1] || '';
  
  // Check if route is valid
  if (!validRoutes.has(route) && !route.startsWith('blog/') && !route.startsWith('works/')) {
    // If it's a blog post that doesn't exist, redirect to blog index
    if (route.startsWith('blog/')) {
      return context.redirect(`/${firstSegment}/blog`, 301);
    }
    // If it's a work that doesn't exist, redirect to works index
    if (route.startsWith('works/')) {
      return context.redirect(`/${firstSegment}/works`, 301);
    }
    // For any other invalid route, redirect to homepage with language prefix
    return context.redirect(`/${firstSegment}`, 301);
  }

  // Handle potential 404s for dynamic routes
  try {
    const response = await next();
    return response;
  } catch (error: any) {
    if (error.status === 404) {
      return next();  // Let Astro handle the 404 page
    }
    throw error;
  }
});
