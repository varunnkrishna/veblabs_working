import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

function formatDate(date: string) {
  return new Date(date).toISOString().split('T')[0];
}

// Remove empty string from pages array since we don't want root URL in sitemap
const pages = [
  'about',
  'blog',
  'get-in-touch',
] as const;

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');
  const projects = await getCollection('projects');
  const languages = ['en', 'ar'] as const;

  // Generate language-specific URLs for static pages
  const staticPages = pages.flatMap(page => 
    languages.map(lang => ({
      url: `/${lang}/${page}`,
      lastmod: new Date().toISOString(),
    }))
  );

  // Add language homepages
  const homePages = languages.map(lang => ({
    url: `/${lang}`,
    lastmod: new Date().toISOString(),
    priority: '1.0'
  }));

  const blogPages = posts.map((post: CollectionEntry<'posts'>) => ({
    url: `/${post.data.language}/blog/${post.slug}`,
    lastmod: formatDate(post.data.date),
  }));

  const projectPages = projects.flatMap((project: CollectionEntry<'projects'>) => 
    languages.map(lang => ({
      url: `/${lang}/projects/${project.slug}`,
      lastmod: new Date().toISOString(),
    }))
  );

  const allPages = [...homePages, ...staticPages, ...blogPages, ...projectPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages.map(page => `
    <url>
      <loc>https://veblabs.com${page.url}</loc>
      <lastmod>${page.lastmod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>${page.priority || (page.url === '/en' || page.url === '/ar' ? '1.0' : '0.8')}</priority>
    </url>
  `).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
