# Widget Reference — nuxt-swiftsearch

Complete props, composable params, slots, and examples for every widget.

> **Pattern reminder**: Every widget with a composable requires dual registration — composable in `widgets` array + component in `<template>`. See [SKILL.md](./SKILL.md) for the core pattern.

---

## Root & Structure

### AisInstantSearch

The root wrapper. All other widgets must be nested inside it.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `configuration` | `InstantSearchOptions` | Yes | `{ indexName, searchClient, routing? }` |
| `widgets` | `Array<Widget>` | Yes | Computed array of composable results |
| `instanceKey` | `string` | No | Unique key when using multiple instances |
| `middlewares` | `Middleware[]` | No | InstantSearch middlewares |

**Slots:** `default` — nest all child widgets here.

```vue
<AisInstantSearch :widgets :configuration>
  <!-- child widgets -->
</AisInstantSearch>
```

---

### AisIndex

Scopes nested widgets to a different Algolia index.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `index` | `string` | Yes | Target index name |

**Composable:** `useAisIndex({ indexName: "other_index" })`

**Slots:** `default` — nest widgets scoped to this index.

```vue
<AisIndex index="articles">
  <AisHits />
</AisIndex>
```

---

## Search Input

### AisSearchBox

Text input for search queries with submit/reset buttons and loading indicator.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `""` | Input placeholder text |
| `autofocus` | `boolean` | `false` | Auto-focus on mount |
| `showLoadingIndicator` | `boolean` | `false` | Show loading spinner |
| `shouldShowLoadingIndicator` | `boolean` | `false` | Conditional loading indicator |
| `ignoreCompositionEvents` | `boolean` | `false` | Ignore IME composition |
| `submitTitle` | `string` | `"Submit the search query"` | Submit button title |
| `resetTitle` | `string` | `"Clear the search query"` | Reset button title |

**Composable:** `useAisSearchBox({})`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ currentRefinement, isSearchStalled, refine }` | Full custom render |
| `submit-icon` | — | Custom submit icon |
| `reset-icon` | — | Custom reset icon |
| `loading-indicator` | — | Custom loading spinner |

```vue
<AisSearchBox placeholder="Search products..." :autofocus="true" />

<!-- Custom slot -->
<AisSearchBox>
  <template #default="{ currentRefinement, refine }">
    <input :value="currentRefinement" @input="refine($event.target.value)" />
  </template>
</AisSearchBox>
```

---

### AisAutocomplete

Autocomplete suggestions across one or more indices.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | Widget instance ID |

**Composable:** `useAisAutocomplete({})`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ currentRefinement, refine, indices }` | Full custom render |

`indices` is an array of `{ indexId, indexName, hits }` — one per searched index.

```vue
<AisAutocomplete>
  <template #default="{ currentRefinement, refine, indices }">
    <input :value="currentRefinement" @input="refine($event.target.value)" />
    <div v-for="index in indices" :key="index.indexId">
      <h3>{{ index.indexName }}</h3>
      <div v-for="hit in index.hits" :key="hit.objectID">
        {{ hit.name }}
      </div>
    </div>
  </template>
</AisAutocomplete>
```

---

## Results

### AisHits

Displays paginated search results.

**Props:** None.

**Composable:** `useAisHits({ escapeHTML?: boolean })`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ items, sendEvent }` | Full custom render |
| `item` | `{ item, index, sendEvent }` | Per-item render |

```vue
<AisHits>
  <template #item="{ item }">
    <h2>{{ item.name }}</h2>
    <p>{{ item.description }}</p>
  </template>
</AisHits>
```

---

### AisInfiniteHits

Infinite scroll results with load-more/load-previous buttons.

**Props:** None (showPrevious is derived from composable).

**Composable:** `useAisInfiniteHits({ showPrevious?: boolean, cache?: object })`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ items, results, isLastPage, refinePrevious, refineNext, sendEvent }` | Full custom render |
| `item` | `{ item, index, sendEvent }` | Per-item render |
| `loadPrevious` | `{ refinePrevious, page, isFirstPage }` | Load previous button |
| `loadMore` | `{ refineNext, refine, page, isLastPage }` | Load more button |

```vue
<AisInfiniteHits>
  <template #item="{ item }">
    <div>{{ item.name }}</div>
  </template>
  <template #loadMore="{ refineNext, isLastPage }">
    <button :disabled="isLastPage" @click="refineNext">Load more</button>
  </template>
</AisInfiniteHits>
```

---

### AisStateResults

Generic access to search results and state. No composable needed.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `catchError` | `boolean` | `false` | Catch search errors |
| `errorFn` | `() => void` | — | Error callback |

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ results, state, status, error }` | Full state access |

```vue
<AisStateResults>
  <template #default="{ results }">
    <p v-if="results && results.nbHits === 0">No results found.</p>
  </template>
</AisStateResults>
```

---

## Refinement Widgets

### AisRefinementList

Faceted filtering with checkboxes. Supports search within facet values and show-more.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attribute` | `string` | — | **Required.** Facet attribute |
| `searchable` | `boolean` | `false` | Enable search within facets |
| `searchablePlaceholder` | `string` | `"Search here…"` | Search input placeholder |

**Composable:** `useAisRefinementList({ attribute, limit?, showMore?, showMoreLimit? })`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ items, refine, searchForItems, searchForItemsQuery, toggleShowMore, canToggleShowMore, isShowingMore, createURL, isFromSearch, canRefine, sendEvent }` | Full custom render |
| `item` | `{ item, refine, createURL }` | Per-item render |
| `noResults` | — | Shown when facet search has no matches |
| `showMoreLabel` | `{ isShowingMore }` | Custom show more label |

**Item shape:** `{ value, label, count, isRefined, highlighted? }`

```vue
<AisRefinementList attribute="brand" :searchable="true">
  <template #item="{ item, refine }">
    <label>
      <input type="checkbox" :checked="item.isRefined" @change="refine(item.value)" />
      {{ item.label }} ({{ item.count }})
    </label>
  </template>
</AisRefinementList>
```

---

### AisMenu

Single-select facet menu (radio-button style).

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attribute` | `string` | — | **Required.** Facet attribute |
| `showMore` | `boolean` | `false` | Enable show more |

**Composable:** `useAisMenu({ attribute, limit?, showMore?, showMoreLimit? })`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ items, canRefine, canToggleShowMore, isShowingMore, refine, createURL, toggleShowMore, sendEvent }` | Full custom render |
| `showMoreLabel` | `{ isShowingMore }` | Custom show more label |

**Item shape:** `{ value, label, count, isRefined }`

```vue
<AisMenu attribute="category" />
```

---

### AisMenuSelect

Dropdown select for single-value facet filtering.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attribute` | `string` | — | **Required.** Facet attribute |

**Composable:** Uses `useAisMenu({ attribute })` — same composable as `AisMenu`.

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ items, canRefine, refine, createURL, sendEvent }` | Full custom render |
| `defaultOption` | — | Custom "See all" option text |
| `item` | `{ item }` | Per-option render |

```vue
<AisMenuSelect attribute="category" />
```

---

### AisHierarchicalMenu

Nested multi-level category navigation (e.g., Electronics > Phones > Smartphones).

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attribute` | `string` | — | **Required.** Primary attribute |
| `showMore` | `boolean` | `false` | Enable show more |

**Composable:** `useAisHierarchicalMenu({ attributes: string[], limit?, showMore?, showMoreLimit? })`

> Note: The composable takes `attributes` (array of hierarchy levels), e.g., `["category.lvl0", "category.lvl1", "category.lvl2"]`.

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ items, canRefine, canToggleShowMore, isShowingMore, refine, createURL, toggleShowMore, sendEvent }` | Full custom render |
| `showMoreLabel` | `{ isShowingMore }` | Custom show more label |

**Item shape:** `{ value, label, count, isRefined, data (children) }` — items are nested.

```vue
<AisHierarchicalMenu attribute="category" />
```

```ts
useAisHierarchicalMenu({
  attributes: ["category.lvl0", "category.lvl1", "category.lvl2"],
})
```

---

### AisNumericMenu

Predefined numeric range filtering (e.g., price ranges).

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attribute` | `string` | — | **Required.** Numeric attribute |
| `items` | `NumericMenuConnectorParamsItem[]` | — | **Required.** Range definitions |

**Composable:** `useAisNumericMenu({ attribute, items })`

**Items format:** `[{ label: "All" }, { label: "< $50", end: 50 }, { label: "$50–$100", start: 50, end: 100 }, { label: "> $100", start: 100 }]`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ items, canRefine, refine, createURL, sendEvent }` | Full custom render |

```vue
<AisNumericMenu
  attribute="price"
  :items="[
    { label: 'All' },
    { label: 'Under $50', end: 50 },
    { label: '$50–$100', start: 50, end: 100 },
    { label: 'Over $100', start: 100 },
  ]"
/>
```

---

### AisRangeInput

Free-form min/max numeric range input.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attribute` | `string` | — | **Required.** Numeric attribute |
| `precision` | `number` | `0` | Decimal precision |

**Composable:** `useAisRangeInput({ attribute, min?, max? })`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ currentRefinement, refine, canRefine, range, sendEvent }` | Full custom render |
| `minLabel` | — | Custom min input label |
| `maxLabel` | — | Custom max input label |
| `separator` | — | Custom separator (default: "to") |
| `submitLabel` | — | Custom submit text (default: "Go") |

`currentRefinement`: `{ min?: number, max?: number }`
`range`: `{ min: number, max: number }` — available range from data.

```vue
<AisRangeInput attribute="price" :precision="2" />
```

---

### AisRatingMenu

Star-rating based filtering.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attribute` | `string` | — | **Required.** Rating attribute |
| `max` | `number` | `5` | Maximum rating value |

**Composable:** `useAisRatingMenu({ attribute, max? })`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ items, canRefine, refine, createURL, sendEvent, max }` | Full custom render |

**Item shape:** `{ value, label, count, isRefined }`

```vue
<AisRatingMenu attribute="rating" :max="5" />
```

---

### AisToggleRefinement

Boolean on/off toggle for a facet value.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attribute` | `string` | — | **Required.** Attribute to toggle |
| `label` | `string` | — | Checkbox label |

**Composable:** `useAisToggleRefinement({ attribute, on?, off? })`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ value, canRefine, refine, createURL, sendEvent }` | Full custom render |

`value`: `{ name, isRefined, count }`

```vue
<AisToggleRefinement attribute="free_shipping" label="Free shipping" />
```

---

### AisClearRefinements

Button to clear all active refinements.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | Widget instance ID |

**Composable:** `useAisClearRefinements({ excludedAttributes? })`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ canRefine, refine, createURL }` | Full custom render |
| `resetLabel` | — | Custom button text (default: "Clear refinements") |

```vue
<AisClearRefinements />

<!-- Exclude query from clearing -->
<!-- composable: useAisClearRefinements({ excludedAttributes: ["query"] }) -->
```

---

### AisCurrentRefinements

Displays all currently active refinements with remove buttons.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | Widget instance ID |

**Composable:** `useAisCurrentRefinements({ transformItems? })`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ refine, items, createURL }` | Full custom render |
| `item` | `{ refine, item, createURL }` | Per-attribute group |
| `refinement` | `{ refine, refinement, createURL }` | Per-refinement value |

**Item shape:** `{ attribute, label, refinements[] }` where each refinement is `{ attribute, type, value, label, operator? }`

```vue
<AisCurrentRefinements>
  <template #item="{ item, refine }">
    <span>{{ item.label }}:</span>
    <span v-for="r in item.refinements" :key="r.value">
      {{ r.label }} <button @click="refine(r)">x</button>
    </span>
  </template>
</AisCurrentRefinements>
```

---

## Sorting & Pagination

### AisSortBy

Dropdown to switch between index replicas (sort orders).

**Props:** None.

**Composable:** `useAisSortBy({ items })` where items is `[{ value: "index_name", label: "Label" }]`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ items, hasNoResults, refine, currentRefinement, canRefine }` | Full custom render |

```vue
<AisSortBy />
```

```ts
useAisSortBy({
  items: [
    { value: "products", label: "Relevance" },
    { value: "products_price_asc", label: "Price (low to high)" },
    { value: "products_price_desc", label: "Price (high to low)" },
  ],
})
```

---

### AisPagination

Page navigation with first/previous/next/last controls.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showFirst` | `boolean` | `true` | Show first page button |
| `showLast` | `boolean` | `true` | Show last page button |
| `showNext` | `boolean` | `true` | Show next page button |
| `showPrevious` | `boolean` | `true` | Show previous page button |

**Emits:** `page-change(page: number)`

**Composable:** `useAisPagination({ totalPages? })`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ refine, createURL, currentRefinement, nbHits, nbPages, pages, isFirstPage, isLastPage }` | Full custom render |
| `first` | `{ createURL, isFirstPage, refine }` | First page button |
| `previous` | `{ createURL, isFirstPage, refine }` | Previous page button |
| `item` | `{ page, createURL, isFirstPage, isLastPage, refine }` | Individual page link |
| `next` | `{ createURL, isLastPage, refine }` | Next page button |
| `last` | `{ createURL, isLastPage, refine }` | Last page button |

```vue
<AisPagination :show-first="true" :show-last="true" @page-change="scrollToTop" />
```

---

## Display & Info

### AisStats

Displays result count and processing time.

**Props:** None.

**Composable:** `useAisStats({})`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ nbHits, nbSortedHits, areHitsSorted, processingTimeMS, results }` | Full custom render |

```vue
<AisStats>
  <template #default="{ nbHits, processingTimeMS }">
    {{ nbHits }} results in {{ processingTimeMS }}ms
  </template>
</AisStats>
```

---

### AisHighlight

Renders highlighted text for matched search terms. No composable needed.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hit` | `Hit \| RefinementListItem` | — | **Required.** Object to highlight |
| `attribute` | `string` | — | **Required.** Attribute to highlight |
| `highlightedTagName` | `string` | `"mark"` | HTML tag for highlights |

**Slots:** None — renders directly.

```vue
<AisHits>
  <template #item="{ item }">
    <AisHighlight :hit="item" attribute="name" />
  </template>
</AisHits>
```

---

### AisPanel

Wrapper that provides header/body/footer structure with refinement-aware styling. No composable needed.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `component` | `string` | — | Widget type (e.g., `"refinementList"`) |
| `attribute` | `string` | — | **Required.** Attribute to monitor |
| `classNames` | `object` | — | Custom CSS classes `{ root, header, body, footer, noRefinement }` |

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ hasRefinements }` | Main content |
| `header` | `{ hasRefinements }` | Panel header |
| `footer` | `{ hasRefinements }` | Panel footer |

**CSS Classes:** `.ais-Panel`, `.ais-Panel--noRefinement`, `.ais-Panel-header`, `.ais-Panel-body`, `.ais-Panel-footer`

```vue
<AisPanel component="refinementList" attribute="brand">
  <template #header>Brand</template>
  <AisRefinementList attribute="brand" />
</AisPanel>
```

---

## Configuration & Rules

### AisConfigure

Applies hidden search parameters without rendering anything visible.

**Props:** None.

**Composable:** `useAisConfigure({ searchParameters })`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ searchParameters, refine }` | Full custom render |

```ts
useAisConfigure({
  searchParameters: {
    hitsPerPage: 20,
    analytics: true,
    distinct: true,
  },
})
```

---

### AisQueryRuleCustomData

Displays custom data returned by Algolia Query Rules.

**Props:** None.

**Composable:** `useAisQueryRuleCustomData({ transformItems? })`

**Slots:**
| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ items }` | All custom data items |
| `item` | `{ item }` | Per-item render |

```vue
<AisQueryRuleCustomData>
  <template #default="{ items }">
    <div v-for="item in items" :key="item.objectID">
      <a :href="item.link">{{ item.title }}</a>
    </div>
  </template>
</AisQueryRuleCustomData>
```

---

## Utility

### SearchInput

Low-level search input component used internally by `AisSearchBox`. No composable needed. Useful for building custom search inputs.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `""` | Placeholder text |
| `autofocus` | `boolean` | `false` | Auto-focus on mount |
| `showLoadingIndicator` | `boolean` | `false` | Loading spinner |
| `shouldShowLoadingIndicator` | `boolean` | `false` | Conditional loading |
| `ignoreCompositionEvents` | `boolean` | `false` | Ignore IME events |
| `submitTitle` | `string` | `"Search"` | Submit button title |
| `resetTitle` | `string` | `"Clear"` | Reset button title |
| `value` | `string` | `""` | Input value (v-model) |

**Emits:** `input`, `update:modelValue`, `focus`, `blur`, `reset`

**Slots:** `submit-icon`, `reset-icon`, `loading-indicator`

**Exposed:** `isFocused(): boolean`
