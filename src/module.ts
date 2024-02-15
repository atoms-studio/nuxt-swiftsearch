import {
  defineNuxtModule,
  addImportsDir,
  createResolver,
  addComponentsDir,
} from "@nuxt/kit";

// Module options TypeScript interface definition
export interface ModuleOptions { }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-swiftsearch",
    configKey: "swiftsearch",
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addImportsDir([
      resolver.resolve("./runtime/composables"),
      resolver.resolve("./runtime/utils"),
    ]);
    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      prefix: "Ais",
    });
  },
});
