<template>
  <div>
    <NuxtLink to="/Samsung"> Go to brand </NuxtLink>
    <AisInstantSearch :widgets :configuration instance-key="index">
      <AisStats />
      <AisSearchBox />
      <AisSortBy />
      <AisToggleRefinement attribute="free_shipping" />
      <AisInfiniteHits />
      <AisRefinementList attribute="brand" searchable />
      <AisIndex index="airbnb">
        <AisInfiniteHits />
      </AisIndex>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import algoliasearch from "algoliasearch";
import { createInfiniteHitsSessionStorageCache } from "instantsearch.js/es/lib/infiniteHitsCache";

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76", {});
const algoliaRouter = useAisRouter();

const indexBnb = useAisIndex({
  indexName: "airbnb",
});

indexBnb.addWidgets([useAisInfiniteHits({})]);

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
    cache: useAisInfiniteHitsStatefulCache("index"),
  }),
  useAisRefinementList({
    attribute: "brand",
    showMore: true,
  }),
  useAisToggleRefinement({ attribute: "free_shipping" }),
  useAisSearchBox({}),
  indexBnb,
]);

const configuration = ref({
  indexName: "instant_search",
  routing: algoliaRouter.value,
  searchClient: client,
});
</script>

<style scoped></style>
