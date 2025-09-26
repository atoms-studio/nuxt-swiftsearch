<template>
  <div>
    <AisInstantSearch
      :widgets
      :configuration
    >
      <!-- <AisStats data-testid="stats" /> -->
      <!-- <AisSearchBox data-testid="searchbox" /> -->
      <!-- <AisSortBy data-testid="sortby" /> -->
      <!-- <AisToggleRefinement -->
      <!--   attribute="free_shipping" -->
      <!--   data-testid="togglerefinement" -->
      <!-- /> -->
      <AisInfiniteHits data-testid="infinitehits" />
      <AisRefinementList
        attribute="brand"
        searchable
        data-testid="refinementlist"
      />
      <!-- <AisIndex index="airbnb"> -->
      <!--   <AisInfiniteHits /> -->
      <!-- </AisIndex> -->
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";
import { computed, ref } from "vue"

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");
// const algoliaRouter = useAisRouter();

// const indexBnb = useAisIndex({
//   indexName: "airbnb",
// });
// indexBnb.addWidgets([useAisInfiniteHits({})]);

const widgets = computed(() => [
  // useAisSortBy({
  //   items: [
  //     { value: "instant_search", label: "Default" },
  //     { value: "instant_search_price_asc", label: "Price asc." },
  //     { value: "instant_search_price_desc", label: "Price desc." },
  //   ],
  // }),
  // useAisStats({}),
  useAisInfiniteHits({}),
  useAisRefinementList({
    attribute: "brand",
    showMore: true,
  }),
  // useAisToggleRefinement({ attribute: "free_shipping" }),
  // useAisConfigure({
  //   searchParameters: {
  //     query: "a",
  //   },
  // }),
  // useAisSearchBox({}),
  // indexBnb,
]);

const configuration = ref({
  indexName: "instant_search",
  searchClient: client,
});
</script>

<style scoped></style>