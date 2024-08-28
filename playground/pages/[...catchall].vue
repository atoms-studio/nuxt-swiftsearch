<template>
  <div>
    <h1>Catch all page</h1>
    <NuxtLink to="/?q=test">
      Test query
    </NuxtLink>
    <NuxtLink to="/Samsung">
      Go to brand
    </NuxtLink>
    <AisInstantSearch
      :widgets
      :configuration
      instance-key="index"
    >
      <AisStats />
      <AisClearRefinements id="free_shipping" />
      <AisClearRefinements id="brand" />
      <AisClearRefinements id="all" />
      <AisRangeInput attribute="price" />
      <AisSearchBox />
      <AisSortBy />
      <AisToggleRefinement attribute="free_shipping" />
      <AisInfiniteHits />
      <AisRefinementList
        attribute="brand"
        searchable
      />
      <AisIndex index="airbnb">
        <AisInfiniteHits>
          <template #item="{ item }">
            {{ item.city }}
          </template>
        </AisInfiniteHits>
        <AisRefinementList attribute="city" />
        <AisClearRefinements id="bnb" />
      </AisIndex>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import algoliasearch from "algoliasearch";

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76", {});
const algoliaRouter = useAisRouter();

const indexBnb = useAisIndex({
  indexName: "airbnb",
});

indexBnb.addWidgets([
  useAisInfiniteHits({}),
  useAisClearRefinements({}, "bnb"),
  useAisRefinementList({ attribute: "city" }),
]);

const widgets = computed(() => [
  useAisSortBy({
    items: [
      { value: "instant_search", label: "Default" },
      { value: "instant_search_price_asc", label: "Price asc." },
      { value: "instant_search_price_desc", label: "Price desc." },
    ],
  }),
  useAisStats({}),
  useAisClearRefinements({ includedAttributes: ["brand"] }, "brand"),
  useAisClearRefinements(
    { includedAttributes: ["free_shipping"] },
    "free_shipping",
  ),
  useAisClearRefinements({}, "all"),

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
  useAisRangeInput({
    attribute: "price",
  }),
  useAisConfigure({ searchParameters: {} }),
  indexBnb,
]);

const configuration = ref({
  indexName: "instant_search",
  routing: algoliaRouter.value,
  searchClient: client,
});
</script>

<style scoped></style>
