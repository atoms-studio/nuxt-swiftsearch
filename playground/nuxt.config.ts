// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["../src/module"],
  devtools: { enabled: true },

  typescript: {
    typeCheck: false,
  },

  compatibilityDate: "2024-08-09"
});

