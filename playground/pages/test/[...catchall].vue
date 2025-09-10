<template>
  <div>
    <h1>Catch all page</h1>
    <NuxtLink to="/?q=test">
      Test query
    </NuxtLink>
    <NuxtLink to="/test/Apple">
      Go to brand Apple
    </NuxtLink>
    <NuxtLink to="/test/Samsung">
      Go to Samsung
    </NuxtLink>
    <AisInstantSearch
      :widgets
      :configuration
      instance-key="catchall"
    >
      <AisStats />
      <AisClearRefinements id="free_shipping" />
      <AisClearRefinements id="brand" />
      <AisClearRefinements id="all" />
      <AisRangeInput attribute="price" />
      <AisSearchBox />
      <AisSortBy />
      <AisToggleRefinement attribute="free_shipping" />
      <AisInfiniteHits>
        <template #default="{ items }">
          <Product
            v-for="item in items"
            :id="item.objectID"
            :key="item.objectID"
            :name="item.name"
            :price="item.price"
          />
        </template>
      </AisInfiniteHits>

      <AisRefinementList
        attribute="brand"
        searchable
      />
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import algoliasearch from "algoliasearch";
const { data } = await useFetch("/api/testApi");

const filters = computed(() => `brand:${useRoute().params.catchall?.[0] || ''}`);

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76", {});
const algoliaRouter = useAisRouter();

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
  useAisConfigure({
    searchParameters: {
      filters: filters.value,
      distinct: true,
    },
  }),
]);

const configuration = ref({
  indexName: "instant_search",
  routing: algoliaRouter.value,
  searchClient: client,
});
</script>

<style scoped></style>
