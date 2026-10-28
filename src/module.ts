import {
  defineNuxtModule,
  addImportsDir,
  addImports,
  createResolver,
  addComponentsDir,
  addVitePlugin,
  assertNuxtCompatibility,
} from "@nuxt/kit";
import { aisDeclarativeWidgetsPlugin } from "./vite/aisDeclarativeWidgetsPlugin";

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Opt-in: discover Ais widgets rendered inside child components. Child SFCs
   * are compiled into exported widget factories that the file containing
   * `<AisInstantSearch>` imports and registers automatically.
   */
  childWidgetDiscovery?: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@atoms-studio/nuxt-swiftsearch",
    configKey: "swiftsearch",
  },
  // Default configuration options of the Nuxt module
  defaults: {
    childWidgetDiscovery: false,
  },
  setup(options, nuxt) {
    assertNuxtCompatibility({ nuxt: ">=4.0.0" }, nuxt);
    const resolver = createResolver(import.meta.url);

    // Filled by the components:extend hook (which re-fires on dev rescans);
    // the plugin reads it lazily at transform time, so hook order is safe.
    const componentRegistry = new Map<
      string,
      { filePath: string; mode: "all" | "client" | "server" }
    >();

    if (options.childWidgetDiscovery) {
      nuxt.hook("components:extend", (components) => {
        componentRegistry.clear();
        for (const component of components) {
          if (typeof component === "object" && "pascalName" in component && component.filePath) {
            componentRegistry.set(component.pascalName, {
              filePath: component.filePath,
              mode: component.mode ?? "all",
            });
          }
        }
      });
    }

    addVitePlugin(() =>
      aisDeclarativeWidgetsPlugin({
        childWidgetDiscovery: options.childWidgetDiscovery,
        resolveComponent: (name) => componentRegistry.get(name),
        exclude: [resolver.resolve("./runtime")],
      }),
    );

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addImportsDir([resolver.resolve("./runtime/utils")]);
    const composables = [
      "useAisAutocomplete",
      "useAisBreadcrumb",
      "useAisClearRefinements",
      "useAisConfigure",
      "useAisConfigureRelatedItems",
      "useAisCurrentRefinements",
      "useAisDynamicWidgets",
      "useAisHierarchicalMenu",
      "useAisHits",
      "useAisHitsPerPage",
      "useAisIndex",
      "useAisInfiniteHits",
      "useAisInfiniteHitsStatefulCache",
      "useAisMenu",
      "useAisNumericMenu",
      "useAisPagination",
      "useAisPoweredBy",
      "useAisQueryRuleContext",
      "useAisQueryRuleCustomData",
      "useAisRangeInput",
      "useAisRatingMenu",
      "useAisRefinementList",
      "useAisRelevantSort",
      "useAisRouter",
      "useAisSearchBox",
      "useAisSortBy",
      "useAisStatefulCache",
      "useAisStats",
      "useAisToggleRefinement",
      "useAisVoiceSearch",
      "useAisWidget",
      "useInstantSearch",
    ];

    for (const name of composables) {
      addImports({
        name,
        from: resolver.resolve(`runtime/composables/${name}`),
      });
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
      ...["algoliasearch-helper", "@algolia/events", "hogan.js", "qs", "@vercel/oidc", "react"],
    );
  },
});
