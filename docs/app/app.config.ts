export default defineAppConfig({
  seo: {
    title: "Nuxt Swiftsearch",
    description:
      "SSR-first Algolia InstantSearch for Nuxt with declarative widgets and vue-instantsearch-like DX.",
  },
  header: {
    title: "Nuxt Swiftsearch",
    logo: {
      light: "/swiftsearch.svg",
      dark: "/swiftsearch-dark.svg",
      alt: "Nuxt Swiftsearch",
    },
  },
  socials: {
    github: "https://github.com/atoms-studio/nuxt-swiftsearch",
    nuxt: "https://nuxt.com",
  },
  github: {
    url: "https://github.com/atoms-studio/nuxt-swiftsearch",
    branch: "main",
    rootDir: "docs",
  },
  toc: {
    title: "On this page",
  },
});
