---
seo:
  title: Nuxt Swiftsearch
  description: SSR-first Algolia InstantSearch for Nuxt with declarative widgets,
    multi-index isolation, and vue-instantsearch-like DX.
---

# Nuxt Swiftsearch

SSR-first Algolia InstantSearch for Nuxt, with declarative widget syntax and full manual-widget compatibility.

- [Get started](/getting-started/installation)
- [Examples](/examples)
- [View on GitHub](https://github.com/atoms-studio/nuxt-swiftsearch)

## What's new in v1

- Stable `1.x` release on npm `latest`
- Nuxt 4-first SSR architecture with deterministic hydration behavior
- Expanded parity and E2E coverage against vue-instantsearch fixtures
- Improved multi-index isolation with explicit `indexId` scoping

## Vue InstantSearch compatibility

Swiftsearch tracks `vue-instantsearch@4.24.3` parity.

- 36 of 37 upstream widgets are implemented with equivalent behavior
- `AisInstantSearchSsr` is intentionally merged into `AisInstantSearch` in Swiftsearch
- `AisConfigureRelatedItems` is available as a compatibility alias

## Why teams use it

- **SSR-first architecture**: Widgets are resolved from a parent-owned InstantSearch instance so SSR and hydration stay deterministic.
- **Declarative widgets**: Write `<AisHits />` directly in `<AisInstantSearch>` and let the Vite transform generate `:widgets`.
- **Multi-index isolation**: Scoped state resolution with `indexId` prevents cross-index leakage for duplicated widget types.
- **Vue InstantSearch parity**: Declarative DX and widget output are validated against vue-instantsearch parity fixtures.
