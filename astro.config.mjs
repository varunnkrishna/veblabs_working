import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";

export default defineConfig({
  site: 'https://veblabs.com',
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
        // Special handling for language-specific URLs
        if (item.url.includes('/en/') || item.url.includes('/ar/')) {
          return {
            ...item,
            // Higher priority for main pages
            priority: item.url.split('/').length <= 3 ? 1.0 : 0.7,
            // Add language-specific alternates
            links: [
              { lang: 'en', url: item.url.replace(/\/(en|ar)\//, '/en/') },
              { lang: 'ar', url: item.url.replace(/\/(en|ar)\//, '/ar/') }
            ]
          };
        }
        return item;
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
