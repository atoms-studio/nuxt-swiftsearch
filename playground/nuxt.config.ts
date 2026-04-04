import { fileURLToPath } from "node:url";

const localPublicDir = fileURLToPath(new URL("./public", import.meta.url));

export default defineNuxtConfig({
  modules: ["../src/module"],
  devtools: { enabled: true },
  experimental: {
    componentIslands: true,
  },
  nitro: {
    publicAssets: [
      {
        dir: localPublicDir,
        maxAge: 60 * 60 * 24 * 365,
      },
    ],
  },
  compatibilityDate: "2025-09-26",
});


