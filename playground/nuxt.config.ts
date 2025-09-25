// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  modules: ["../src/module"],
  devtools: { enabled: true },

  typescript: {
    typeCheck: true,
  },

  compatibilityDate: "2024-08-09"
});

