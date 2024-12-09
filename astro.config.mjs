import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";

export default defineConfig({
  site: 'https://veblabs.com',
  trailingSlash: 'never',
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
        // Remove trailing slashes from URLs
        const url = item.url.endsWith('/') ? item.url.slice(0, -1) : item.url;
        
        // Add root URL with highest priority
        if (url === 'https://veblabs.com') {
          return {
            ...item,
            url,
            priority: 1.0,
            changefreq: 'daily'
          };
        }
        
        // Special handling for language-specific URLs
        if (url.includes('/en/') || url.includes('/ar/')) {
          return {
            ...item,
            url,
            // Higher priority for main pages
            priority: url.split('/').length <= 3 ? 0.9 : 0.7,
            // Add language-specific alternates without trailing slashes
            links: [
              { lang: 'en', url: url.replace(/\/(en|ar)\//, '/en') },
              { lang: 'ar', url: url.replace(/\/(en|ar)\//, '/ar') }
            ]
          };
        }
        return {
          ...item,
          url
        };
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
