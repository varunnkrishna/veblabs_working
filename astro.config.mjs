import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";

export default defineConfig({
  site: 'https://veblabs.com', 
  integrations: [tailwind(), icon()],
  output: "server",
  server: {
    port: 4321,
    host: true
  },
  vite: {
    css: {
      preprocessorOptions: {
        css: {
          additionalData: `@import "/src/styles/global.css";`,
        },
      },
    },
  },
});
