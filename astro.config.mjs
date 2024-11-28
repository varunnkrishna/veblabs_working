import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],
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
