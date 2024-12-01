import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://veblabs.com', 
  integrations: [tailwind(), icon()],
  output: "hybrid",
  adapter: cloudflare({
    mode: "directory"
  }),
  vite: {
    css: {
      preprocessorOptions: {
        css: {
          additionalData: `@import "/src/styles/global.css";`,
        },
      },
    },
    ssr: {
      noExternal: ['reading-time']
    }
  },
});
