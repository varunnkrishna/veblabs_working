import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

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
  integrations: [
    tailwind(), 
    icon(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          ar: 'ar-SA'
        }
      },
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // Skip invalid URLs
        if (
          item.url.includes('//ar') || 
          item.url.includes('//en') ||
          item.url === 'https://veblabs.com/services' || 
          item.url === 'https://veblabs.com/index'
        ) {
          return undefined;
        }

        // Ensure URL ends with trailing slash to match our configuration
        const url = item.url.endsWith('/') ? item.url : `${item.url}/`;
        
        // Skip the root URL as it redirects to /en
        if (url === 'https://veblabs.com/') {
          return undefined;
        }

        // Language root pages get highest priority
        if (url.match(/https:\/\/veblabs\.com\/(en|ar)\/$/)) {
          return {
            ...item,
            url,
            priority: 1.0,
            changefreq: 'daily'
          };
        }
        
        // Higher priority for main section pages
        if (url.match(/\/(en|ar)\/(blog|services|works)\/$/)) {
          return {
            ...item,
            url,
            priority: 0.8,
            changefreq: 'weekly'
          };
        }

        // Blog posts and work items
        if (url.match(/\/(en|ar)\/(blog|works)\/[^/]+\/$/)) {
          return {
            ...item,
            url,
            priority: 0.6,
            changefreq: 'monthly'
          };
        }

        // Default case - only include if it has a language prefix
        if (url.match(/\/(en|ar)\//)) {
          return {
            ...item,
            url,
            priority: 0.5,
            changefreq: 'monthly'
          };
        }

        return undefined; // Skip all other URLs
      },
      filter(page) {
        // Exclude 404 page, non-language prefixed pages, and any other utility pages
        return !page.includes('404') && 
               (page.includes('/en/') || page.includes('/ar/'));
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
