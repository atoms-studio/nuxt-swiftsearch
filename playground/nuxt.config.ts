export default defineNuxtConfig({
  modules: ["../src/module"],
  devtools: { enabled: true },
  experimental: {
    componentIslands: true,
  },
  compatibilityDate: "2025-09-26",
});



