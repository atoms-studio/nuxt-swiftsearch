export default defineNuxtConfig({
  modules: ["../src/module"],
  devtools: { enabled: true },

  typescript: {
    typeCheck: true,
  },

  experimental: {
    componentIslands: true,
  },

  compatibilityDate: "2024-08-09",
});

