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
  ['/portfolio', '/works'],
  ['/about-us', '/about'],
  ['/blog/web-design', '/blog/web-design-trends-2025'],
  ['/services/web-development', '/services'],
  ['/services/mobile-development', '/services'],
  ['/services/digital-marketing', '/services'],
  // Add redirects for common URL patterns
  ['/en/en', '/en'],
  ['/ar/ar', '/ar'],
  ['/ar/en', '/en'],
  ['/en/ar', '/ar']
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
      pathname.match(/\.(jpg|png|gif|svg|css|js|webp|ico|xml|txt|pdf)$/)) {
    return next();
  }

  // Get path segments and remove empty ones
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  // Handle language prefix
  const lang = firstSegment in supportedLanguages ? firstSegment : defaultLang;
  
  // Check for double language codes and redirect
  if (pathSegments.length >= 2 && pathSegments[1] in supportedLanguages) {
    const correctPath = `/${pathSegments[1]}/${pathSegments.slice(2).join('/')}`;
    const redirectUrl = correctPath + (correctPath.endsWith('/') ? '' : '/');
    return context.redirect(redirectUrl, 301);
  }

  // Handle redirects from redirectMap
  for (const [oldPath, newPath] of redirectMap) {
    if (pathname.includes(oldPath)) {
      const redirectPath = `/${lang}${newPath}${newPath.endsWith('/') ? '' : '/'}`;
      return context.redirect(redirectPath, 301);
    }
  }

  // Add language prefix if missing
  if (!firstSegment || !(firstSegment in supportedLanguages)) {
    let newPath = `/${defaultLang}${pathname}`;
    // Ensure trailing slash for non-asset URLs
    if (!newPath.endsWith('/') && !newPath.includes('.')) {
      newPath += '/';
    }
    return context.redirect(newPath, 301);
  }

  // Handle trailing slashes last
  if (!pathname.endsWith('/') && !pathname.includes('.')) {
    return context.redirect(pathname + '/', 308);
  }

  // Remove double slashes if any
  if (pathname.includes('//')) {
    const cleanPath = pathname.replace(/\/+/g, '/');
    return context.redirect(cleanPath, 301);
  }

  return next();
});
