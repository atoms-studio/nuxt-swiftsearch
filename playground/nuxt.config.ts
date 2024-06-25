export default defineNuxtConfig({
  modules: ["../src/module"],
  devtools: { enabled: true },
  typescript: {
    typeCheck: true,
  },
  experimental: {
    componentIslands: {
      selectiveClient: "deep",
    },
  },
});
