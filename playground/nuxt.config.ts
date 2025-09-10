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

  ssr: true,

  nitro: {
    experimental: {
      wasm: true
    }
  },

  vite: {
    optimizeDeps: {
      force: true
    }
  },

  build: {
    transpile: ['../src/module']
  }
});

