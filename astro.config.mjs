import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

export default defineConfig({
  site: 'https://veblabs.com',
  trailingSlash: 'always',
  redirects: {
    '/contact': '/get-in-touch',
    '/contact/': '/get-in-touch/',
    '/en/contact': '/en/get-in-touch',
    '/en/contact/': '/en/get-in-touch/',
    '/ar/contact': '/ar/get-in-touch',
    '/ar/contact/': '/ar/get-in-touch/'
  },
  build: {
    format: 'directory'
  },
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true
  },
  vite: {
    ssr: {
      noExternal: ['path-to-regexp']
    }
  },
  integrations: [
    tailwind(), 
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          ar: 'ar'
        }
      },
      customPages: [
        // Root language pages (highest priority)
        'https://veblabs.com/en/',  // English homepage
        'https://veblabs.com/ar/',  // Arabic homepage
        // Main section pages
        'https://veblabs.com/en/blog/',
        'https://veblabs.com/ar/blog/',
        'https://veblabs.com/en/works/',
        'https://veblabs.com/ar/works/',
        'https://veblabs.com/en/services/',
        'https://veblabs.com/ar/services/',
        'https://veblabs.com/en/get-in-touch/',
        'https://veblabs.com/ar/get-in-touch/',
        // Blog posts
        'https://veblabs.com/en/blog/dubai-tech-capital-2025/',
        'https://veblabs.com/ar/blog/dubai-tech-capital-2025/',
        'https://veblabs.com/en/blog/web-design-trends-2025/',
        'https://veblabs.com/ar/blog/web-design-trends-2025/',
        'https://veblabs.com/en/blog/website-design-in-dubai/',
        'https://veblabs.com/ar/blog/website-design-in-dubai/',
        'https://veblabs.com/en/blog/ai-tools-in-mental-health/',
        'https://veblabs.com/ar/blog/ai-tools-in-mental-health/',
        // Work items
        'https://veblabs.com/en/works/realestate/',
        'https://veblabs.com/ar/works/realestate/',
        'https://veblabs.com/en/works/healthcare/',
        'https://veblabs.com/ar/works/healthcare/',
        'https://veblabs.com/en/works/appointment-system/',
        'https://veblabs.com/ar/works/appointment-system/',
        'https://veblabs.com/en/works/cab-service/',
        'https://veblabs.com/ar/works/cab-service/',
        'https://veblabs.com/en/works/farmhouse/',
        'https://veblabs.com/ar/works/farmhouse/',
        'https://veblabs.com/en/works/software-testing/',
        'https://veblabs.com/ar/works/software-testing/',
        'https://veblabs.com/en/works/travel-agency/',
        'https://veblabs.com/ar/works/travel-agency/'
      ],
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // Normalize URL to ensure proper format
        let url = item.url;
        if (!url.endsWith('/')) {
          url = `${url}/`;
        }

        // Skip any non-language prefixed URLs or the root URL
        if (!url.match(/^https:\/\/veblabs\.com\/(en|ar)\/$/)) {
          if (!url.match(/^https:\/\/veblabs\.com\/(en|ar)\//)) {
            return undefined;
          }
        }

        // Define URL patterns and their priorities
        const patterns = [
          {
            // Language root pages (e.g., /en/, /ar/)
            pattern: /^https:\/\/veblabs\.com\/(en|ar)\/$/,
            priority: 1.0,
            changefreq: 'daily',
            lastmod: new Date()  // Always update lastmod for homepages
          },
          {
            // Main section pages (e.g., /en/blog/, /en/works/, /en/services/)
            pattern: /\/(en|ar)\/(blog|services|works)\/$/,
            priority: 0.9,
            changefreq: 'daily'
          },
          {
            // Blog posts
            pattern: /\/(en|ar)\/blog\/[^/]+\/$/,
            priority: 0.7,
            changefreq: 'weekly'
          },
          {
            // Work items
            pattern: /\/(en|ar)\/works\/[^/]+\/$/,
            priority: 0.6,
            changefreq: 'monthly'
          }
        ];

        // Find matching pattern and return appropriate configuration
        for (const { pattern, priority, changefreq, lastmod } of patterns) {
          if (url.match(pattern)) {
            return {
              ...item,
              url,
              priority,
              changefreq,
              lastmod: lastmod || item.lastmod
            };
          }
        }

        // Default case for other valid pages
        return {
          ...item,
          url,
          priority: 0.5,
          changefreq: 'monthly'
        };
      }
    }),
    cloudflare({
      mode: "directory",
      runtime: {
        mode: "local",
        type: "pages"
      },
      build: {
        baseDirectory: "dist",
        assetsInclude: ['**/*.woff2', '**/*.css'],
        headers: [
          {
            source: "**/*.woff2",
            headers: [
              {
                key: "Content-Type",
                value: "font/woff2"
              }
            ]
          },
          {
            source: "**/*.css",
            headers: [
              {
                key: "Content-Type",
                value: "text/css"
              }
            ]
          }
        ]
      }
    })
  ],
  output: "hybrid",
  adapter: cloudflare({
    mode: "directory",
    runtime: {
      mode: "local",
      type: "pages"
    },
    build: {
      baseDirectory: "dist",
      assetsInclude: ['**/*.woff2', '**/*.css'],
      headers: [
        {
          source: "**/*.woff2",
          headers: [
            {
              key: "Content-Type",
              value: "font/woff2"
            }
          ]
        },
        {
          source: "**/*.css",
          headers: [
            {
              key: "Content-Type",
              value: "text/css"
            }
          ]
        }
      ]
    }
  }),
  vite: {
    build: {
      cssMinify: true,
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
    css: {
      preprocessorOptions: {
        css: {
          additionalData: `@import "/src/styles/global.css";`,
        },
      },
      devSourcemap: true,
    },
    ssr: {
      noExternal: ['path-to-regexp']
    }
  }
});
