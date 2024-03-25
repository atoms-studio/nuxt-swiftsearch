<template>
  <div>
    <NuxtLink to="/Samsung"> Go to samsung </NuxtLink>
    <AisInstantSearch :widgets :configuration>
      <AisStats />
      <AisSearchBox />
      <AisSortBy />
      <AisToggleRefinement attribute="free_shipping" />
      <AisInfiniteHits>
        <template #default="{ items }">
          <div v-for="item in items" :key="item.objectID">
            {{ item.brand }} - {{ item.price }}
          </div>
        </template>
      </AisInfiniteHits>
      <AisRefinementList attribute="brand" searchable />
      <AisIndex index="airbnb">
        <AisInfiniteHits />
      </AisIndex>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import algoliasearch from "algoliasearch";
import type { InstantSearchOptions } from "instantsearch.js/es/types";
import { singleIndex as singleIndexMapping } from "instantsearch.js/es/lib/stateMappings";
const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");
const algoliaRouter = useAisRouter();

const indexBnb = useAisIndex({
  indexName: "airbnb",
});

indexBnb.addWidgets([useAisInfiniteHits({})]);
const route = useRoute();

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
  useAisRefinementList({
    attribute: "brand",
    showMore: true,
  }),
  useAisToggleRefinement({ attribute: "free_shipping" }),
  useAisSearchBox({}),
  indexBnb,
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
