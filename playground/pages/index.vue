<template>
  <div>
    <NuxtLink
      to="/?instant_search%5Btoggle%5D%5Bfree_shipping%5D=true&instant_search%5Bquery%5D=testa"
    >
      Test query
    </NuxtLink>
    <NuxtLink to="/Samsung"> Go to brand </NuxtLink>
    <NuxtLink to="/test/Samsung"> Go to brand catchall </NuxtLink>

    <AisInstantSearch :widgets :configuration :middlewares instance-key="index">
      <AisStats />
      <AisClearRefinements id="free_shipping" />
      <AisClearRefinements id="brand" />
      <AisClearRefinements id="all" />
      <AisRangeInput attribute="price" />
      <AisSearchBox />
      <AisSortBy />
      <AisToggleRefinement attribute="free_shipping" />
      <AisInfiniteHits />
      <AisRefinementList attribute="brand" searchable />
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
import type { Middleware } from "instantsearch.js";

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

const middlewares = ref<Middleware[]>([
  ({ instantSearchInstance }) => {
    return {
      onStateChange({ uiState }) {
        console.log(uiState, "from middleware");
      },
      subscribe() {},
      unsubscribe() {},
    };
  },
]);
const configuration = ref({
  indexName: "instant_search",
  routing: algoliaRouter.value,
  searchClient: client,
});
</script>

<style scoped></style>
