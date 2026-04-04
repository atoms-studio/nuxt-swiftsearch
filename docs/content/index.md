---
seo:
  title: Build fast Nuxt search with Swiftsearch
  description: SSR-first Algolia InstantSearch for Nuxt with declarative widgets,
    multi-index isolation, typed APIs, and strong Vue InstantSearch parity.
---

# Build fast Nuxt search with Algolia

Nuxt Swiftsearch gives you SSR-first InstantSearch for Nuxt, declarative widgets, and strong vue-instantsearch parity without sacrificing control.

- [Get started](/getting-started/installation)
- [Nuxt Swiftsearch on npm](https://www.npmjs.com/package/@atoms-studio/nuxt-swiftsearch)
- [Star on GitHub](https://github.com/atoms-studio/nuxt-swiftsearch)

## Why teams use Swiftsearch

- **SSR-first by default**: `AisInstantSearch` owns widget registration, so SSR output and hydration remain deterministic.
- **Declarative widgets**: Author `<AisHits />`, `<AisSearchBox />`, and other widgets directly in templates.
- **Manual mode still available**: Drop to `useAis*` composables whenever you need low-level control.
- **Multi-index isolation**: Use explicit `indexId` scoping to avoid state leakage between sibling indices.
- **Nuxt-native URL sync**: `useAisRouter()` keeps query, filters, and pagination in route state.

## Quick start

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ["@atoms-studio/nuxt-swiftsearch"],
});
```

## Coverage and compatibility

::note
Swiftsearch tracks `vue-instantsearch@4.24.3` parity.
::

::tip
36 of 37 upstream widgets are implemented with equivalent behavior.
::

::caution
`AisInstantSearchSsr` is intentionally merged into `AisInstantSearch` in Swiftsearch.
::

## Next steps

- Read the [usage guide](/getting-started/usage)
- Explore the [declarative transform](/getting-started/declarative-transform)
- Browse [examples](/examples)
