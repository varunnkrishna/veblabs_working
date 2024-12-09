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

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');
  const projects = await getCollection('projects');
  const languages = ['en', 'ar'] as const;

  // Generate language-specific URLs for static pages
  const staticPages = validPages.flatMap(page => 
    languages.map(lang => ({
      url: `${siteUrl}/${lang}/${page}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: page === 'blog' ? '0.8' : '0.6'
    }))
  );

  // Add language homepages
  const homePages = languages.map(lang => ({
    url: `${siteUrl}/${lang}`,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: '1.0'
  }));

  // Add blog posts
  const blogPages = posts.map((post: CollectionEntry<'posts'>) => ({
    url: `${siteUrl}/${post.data.language}/blog/${post.slug}`,
    lastmod: formatDate(post.data.date),
    changefreq: 'monthly',
    priority: '0.7'
  }));

  // Add project pages
  const projectPages = projects.flatMap((project: CollectionEntry<'projects'>) => 
    languages.map(lang => ({
      url: `${siteUrl}/${lang}/works/${project.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    }))
  );

  const allPages = [...homePages, ...staticPages, ...blogPages, ...projectPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
