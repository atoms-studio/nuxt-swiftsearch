---
name: nuxt-swiftsearch
description: Implement Algolia search UIs in Nuxt 3 apps using @atoms-studio/nuxt-swiftsearch — an SSR-first, fully typed alternative to vue-instantsearch.
version: 1.0.0
license: MIT
author: "@atoms-studio"
tags:
  - nuxt
  - algolia
  - search
  - ssr
  - vue
---

## Instructions

Use this skill when building search UIs in Nuxt 3 apps with Algolia via `@atoms-studio/nuxt-swiftsearch`.

### When to Use

- Adding search functionality to a Nuxt 3 app with Algolia
- Building search pages with filters, pagination, infinite scroll
- Implementing SSR-compatible search experiences
- Migrating from vue-instantsearch to a Nuxt-native approach

### Installation

```bash
npx nuxi@latest module add swiftsearch
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@atoms-studio/nuxt-swiftsearch"],
});
```

### Core Pattern: Dual Registration

Every widget requires **both** a composable (in `<script setup>`) AND a component (in `<template>`). The composable registers the widget with the InstantSearch instance; the component renders it.

```vue
<template>
  <AisInstantSearch :widgets :configuration>
    <AisSearchBox />
    <AisHits />
    <AisRefinementList attribute="brand" />
  </AisInstantSearch>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";

const client = algoliasearch("APP_ID", "API_KEY");

const widgets = computed(() => [
  useAisSearchBox({}),
  useAisHits({ escapeHTML: true }),
  useAisRefinementList({ attribute: "brand" }),
]);

const configuration = ref({
  indexName: "my_index",
  searchClient: client,
});
</script>
```

### Critical Rules

1. **`widgets` must be `computed`** — not a plain array. The reactivity is required for SSR hydration.
2. **`configuration` must be `ref`** — wrap the config object in `ref()`.
3. **Attribute props must match** — when using `AisRefinementList`, `AisMenu`, etc., the `attribute` prop on the component must match the `attribute` in the composable.
4. **All composables and components are auto-imported** — no manual imports needed for `useAis*` composables or `Ais*` components.

### Available Components & Composables

| Component | Composable | Purpose |
|---|---|---|
| `<AisInstantSearch>` | — | Root wrapper, receives `:widgets` and `:configuration` |
| `<AisIndex>` | `useAisIndex()` | Multi-index scoping |
| `<AisSearchBox>` | `useAisSearchBox()` | Search input |
| `<AisHits>` | `useAisHits()` | Paginated results |
| `<AisInfiniteHits>` | `useAisInfiniteHits()` | Infinite scroll results |
| `<AisRefinementList>` | `useAisRefinementList()` | Facet filtering |
| `<AisMenu>` | `useAisMenu()` | Single-select facet menu |
| `<AisMenuSelect>` | — | Dropdown facet menu |
| `<AisHierarchicalMenu>` | `useAisHierarchicalMenu()` | Nested category navigation |
| `<AisNumericMenu>` | `useAisNumericMenu()` | Numeric range filtering |
| `<AisRangeInput>` | `useAisRangeInput()` | Min/max range input |
| `<AisRatingMenu>` | `useAisRatingMenu()` | Star rating filter |
| `<AisToggleRefinement>` | `useAisToggleRefinement()` | Boolean toggle filter |
| `<AisClearRefinements>` | `useAisClearRefinements()` | Clear all active filters |
| `<AisCurrentRefinements>` | `useAisCurrentRefinements()` | Show active filters |
| `<AisSortBy>` | `useAisSortBy()` | Sort order selector |
| `<AisStats>` | `useAisStats()` | Results count & timing |
| `<AisPagination>` | `useAisPagination()` | Page navigation |
| `<AisConfigure>` | `useAisConfigure()` | Hidden search parameters |
| `<AisHighlight>` | — | Highlight matched text |
| `<AisAutocomplete>` | `useAisAutocomplete()` | Autocomplete suggestions |
| `<AisPanel>` | — | Collapsible panel wrapper |
| `<AisQueryRuleCustomData>` | `useAisQueryRuleCustomData()` | Query rules data |
| `<AisStateResults>` | — | Generic state renderer |

### URL Routing

To sync search state with the URL:

1. Set up query string parsing:

```ts
// app/router.options.ts
import type { RouterConfig } from "@nuxt/schema";
import qs from "qs";

export default <RouterConfig>{
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify,
};
```

2. Add the router to configuration:

```vue
<script setup lang="ts">
const algoliaRouter = useAisRouter();

const configuration = ref({
  indexName: "my_index",
  routing: algoliaRouter.value,
  searchClient: client,
});
</script>
```

### Slot Customization

All components expose slots with typed render state:

```vue
<AisHits>
  <template #item="{ item }">
    <div>{{ item.name }}</div>
  </template>
</AisHits>

<AisInfiniteHits>
  <template #item="{ item }">
    <div>{{ item.title }}</div>
  </template>
  <template #loadMore="{ refineNext, isLastPage }">
    <button :disabled="isLastPage" @click="refineNext">Load more</button>
  </template>
</AisInfiniteHits>
```

### Caching (Infinite Hits)

For stateful caching across page navigations:

```ts
const cache = useAisStatefulCache();
const infiniteCache = useAisInfiniteHitsStatefulCache();

const widgets = computed(() => [
  useAisInfiniteHits({ cache: infiniteCache }),
]);
```

### Accessing the Instance

```vue
<script setup lang="ts">
const { getInstance } = useAisInstantSearch();
// Access the raw InstantSearch instance for advanced use cases
</script>
```

### Multi-Index Search

```vue
<AisInstantSearch :widgets :configuration>
  <AisIndex index="products">
    <AisHits />
  </AisIndex>
  <AisIndex index="articles">
    <AisHits />
  </AisIndex>
</AisInstantSearch>
```

### CSS Classes

Components use BEM convention: `ais-WidgetName-element--modifier`. Use `useSuit("WidgetName")` to generate class names programmatically.

### Common Mistakes

- Forgetting to add the composable to `widgets` array (component renders but doesn't work)
- Using a plain array instead of `computed()` for widgets
- Mismatched `attribute` between component prop and composable param
- Importing composables manually (they're auto-imported)

## Dependencies

- Nuxt >= 3.10
- `algoliasearch` v5+
- `qs` (only if using routing)
