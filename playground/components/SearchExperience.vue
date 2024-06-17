<template>
  <div>
    <AisInstantSearch
      :widgets
      :configuration
      :instance-key="'search-experience'"
    >
      <AisStats />
      <AisSortBy />
      <AisRefinementList attribute="brand" />
      <AisToggleRefinement attribute="free_shipping" />
      <AisInfiniteHits>
        <template #item="{ item }">
          {{ item.brand }} - {{ item.price }} - {{ item.name }}
        </template>
      </AisInfiniteHits>
      <AisRefinementList attribute="brand" searchable />
      <AisHierarchicalMenu attribute="hierarchicalCategories.lvl0" />
    </AisInstantSearch>

    <div @click="isFreeShipping = !isFreeShipping">
      Change free shipping {{ isFreeShipping }}
    </div>
  </div>
</template>

<script setup lang="ts">
import algoliasearch from "algoliasearch";
import type { InstantSearchOptions } from "instantsearch.js/es/types";
import { singleIndex as singleIndexMapping } from "instantsearch.js/es/lib/stateMappings";

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76", {
  responsesCache: useAisStatefulCache(),
  requestsCache: useAisStatefulCache(),
});
const algoliaRouter = useAisRouter();

const route = useRoute();
const filters = computed(() => `brand:${route.params.brand}`);

const isFreeShipping = ref(false);
const widgets = computed(() => [
  useAisSortBy({
    items: [
      { value: "instant_search", label: "Default" },
      { value: "instant_search_price_asc", label: "Price asc." },
      { value: "instant_search_price_desc", label: "Price desc." },
    ],
  }),
  useAisStats({}),
  useAisInfiniteHits({
    showPrevious: true,
  }),
  useAisHierarchicalMenu({
    attributes: [
      "hierarchicalCategories.lvl0",
      "hierarchicalCategories.lvl1",
      "hierarchicalCategories.lvl2",
    ],
  }),
  useAisRefinementList({
    attribute: "brand",
    showMore: true,
  }),
  useAisToggleRefinement({ attribute: "free_shipping" }),
  useAisConfigure({
    searchParameters: {
      filters: filters.value,
      distinct: true,
      facetFilters: [`free_shipping:${isFreeShipping.value}`],
    },
  }),
  useAisSearchBox({}),
]);

const configuration = ref<InstantSearchOptions>({
  indexName: "instant_search",
  routing: {
    router: algoliaRouter.value.router,
    stateMapping: singleIndexMapping("instant_search"),
  },
  searchClient: client,
} as unknown as InstantSearchOptions);
</script>

<style scoped></style>
