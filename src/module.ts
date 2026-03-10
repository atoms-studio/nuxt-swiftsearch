import {
  defineNuxtModule,
  addImportsDir,
  addImports,
  createResolver,
  addComponentsDir,
  assertNuxtCompatibility,
} from "@nuxt/kit";

// Module options TypeScript interface definition
export interface ModuleOptions { }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@atoms-studio/nuxt-swiftsearch",
    configKey: "swiftsearch",
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_, nuxt) {
    assertNuxtCompatibility({ nuxt: ">=3.10" }, nuxt);
    const resolver = createResolver(import.meta.url);

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addImportsDir([
      resolver.resolve("./runtime/composables"),
      resolver.resolve("./runtime/utils"),
    ]);
    const composables = [
      'useAisAutocomplete',
      'useAisClearRefinements',
      'useAisConfigure',
      'useAisCurrentRefinements',
      'useAisHierarchicalMenu',
      'useAisHits',
      'useAisIndex',
      'useAisInfiniteHits',
      'useAisInfiniteHitsStatefulCache',
      'useAisMenu',
      'useAisNumericMenu',
      'useAisPagination',
      'useAisQueryRuleCustomData',
      'useAisRangeInput',
      'useAisRatingMenu',
      'useAisRefinementList',
      'useAisRouter',
      'useAisSearchBox',
      'useAisSortBy',
      'useAisStatefulCache',
      'useAisStats',
      'useAisToggleRefinement',
      'useAisWidget',
    ]

    for (const name of composables) {
      addImports({
        name,
        from: resolver.resolve(`runtime/composables/${name}`),
      })
    }
    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      prefix: "Ais",
    });
    // transpiling modules
    nuxt.options.vite ??= {};
    nuxt.options.vite.optimizeDeps ??= {};
    nuxt.options.vite.optimizeDeps.include ??= [];
    nuxt.options.vite.optimizeDeps.include.push(
      ...[
        "algoliasearch-helper",
        "@algolia/events",
        "hogan.js",
        "qs",
        "@vercel/oidc",
        "react"
      ],
    );
  },
});
