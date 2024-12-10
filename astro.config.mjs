import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";

export default defineConfig({
  site: 'https://veblabs.com',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  integrations: [
    tailwind(), 
    icon(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
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
        // Ensure URL ends with trailing slash to match our configuration
        const url = item.url.endsWith('/') ? item.url : `${item.url}/`;
        
        // Add root URL with highest priority
        if (url === 'https://veblabs.com/') {
          return {
            ...item,
            url,
            priority: 1.0,
            changefreq: 'daily'
          };
        }
        
        // Higher priority for main section pages
        if (url.match(/\/(blog|services|works)\//)) {
          return {
            ...item,
            url,
            priority: 0.8,
            changefreq: 'weekly'
          };
        }

        // Blog posts and work items
        if (url.match(/\/(blog|works)\/[^/]+\//)) {
          return {
            ...item,
            url,
            priority: 0.6,
            changefreq: 'monthly'
          };
        }

        // Default case
        return {
          ...item,
          url
        };
      },
      filter: (page) => {
        // Exclude 404 page and any other utility pages
        return !page.includes('404');
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
