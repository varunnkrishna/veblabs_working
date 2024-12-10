import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

function formatDate(date: string) {
  return new Date(date).toISOString().split('T')[0];
}

const validPages = [
  'blog',
  'contact',
  'get-in-touch',
  'services',
  'works'
] as const;

const siteUrl = 'https://veblabs.com';

interface SitemapPage {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  alternates?: Array<{
    href: string;
    hreflang: string;
  }>;
}

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');
  const projects = await getCollection('projects');

  // Generate URLs for static pages (using English as canonical)
  const staticPages: SitemapPage[] = validPages.map(page => {
    const enUrl = `${siteUrl}/en/${page}`;
    const arUrl = `${siteUrl}/ar/${page}`;
    return {
      url: enUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: page === 'blog' ? '0.8' : '0.6',
      alternates: [
        { href: enUrl, hreflang: 'en' },
        { href: arUrl, hreflang: 'ar' }
      ]
    };
  });

  // Add homepage (English as canonical)
  const homePages: SitemapPage[] = [{
    url: `${siteUrl}/en`,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: '1.0',
    alternates: [
      { href: `${siteUrl}/en`, hreflang: 'en' },
      { href: `${siteUrl}/ar`, hreflang: 'ar' },
      { href: `${siteUrl}/en`, hreflang: 'x-default' }
    ]
  }];

  // Add blog posts (using post's language as canonical)
  const blogPages: SitemapPage[] = posts.map((post: CollectionEntry<'posts'>) => ({
    url: `${siteUrl}/${post.data.language}/blog/${post.slug}`,
    lastmod: formatDate(post.data.date),
    changefreq: 'monthly',
    priority: '0.7'
  }));

  // Add project pages (using English as canonical)
  const projectPages: SitemapPage[] = projects.map((project: CollectionEntry<'projects'>) => {
    const enUrl = `${siteUrl}/en/works/${project.slug}`;
    const arUrl = `${siteUrl}/ar/works/${project.slug}`;
    return {
      url: enUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7',
      alternates: [
        { href: enUrl, hreflang: 'en' },
        { href: arUrl, hreflang: 'ar' }
      ]
    };
  });

  const allPages = [...homePages, ...staticPages, ...blogPages, ...projectPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.alternates ? `
${page.alternates.map(alt => `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`).join('\n')}` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
