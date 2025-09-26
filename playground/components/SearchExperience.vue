<template>
  <div>
    <h1 v-if="brand">
      {{ brand }}
    </h1>

    <AisInstantSearch
      :key="`search-experience-${brand}`"
      :widgets
      :configuration
      :instance-key="`search-experience-${brand}`"
    >
      <AisStats />
      <AisClearRefinements />
      <AisSortBy />
      <AisPanel
        component="refinementList"
        attribute="brand"
        :class-names="{
          root: 'custom-panel',
          header: 'custom-header',
          body: 'custom-body',
          noRefinement: 'custom-no-refinement',
          footer: 'custom-footer'
        }"
      >
        <template #header="{ hasRefinements }">
          <div>does Brand have refinements? {{ hasRefinements }}</div>
        </template>
        <template #default>
          <AisRefinementList attribute="brand" />
        </template>
        <template #footer>
          this is the footer
        </template>
      </AisPanel>
      <AisPanel
        component="toggleRefinement"
        attribute="free_shipping"
      >
        <template #default="{ hasRefinements }">
          <div>does Free Shipping have refinements? {{ hasRefinements }}</div>
          <AisToggleRefinement attribute="free_shipping" />
        </template>
      </AisPanel>
      <AisMenuSelect attribute="categories" />
      <AisMenu
        attribute="categories"
        :show-more="true"
      />
      <AisInfiniteHits>
        <template #default="{ items }">
          <Product
            v-for="item in items"
            :id="item.objectID"
            :key="item.objectID"
            :name="(item as unknown as TProduct).name"
            :price="(item as unknown as TProduct).price"
          />
        </template>
      </AisInfiniteHits>
      <AisRefinementList
        attribute="brand"
        searchable
      />
      <AisNumericMenu
        attribute="price"
        :items="[
          { label: 'All' },
          { label: '<= 10$', end: 10 },
          { label: '10$ - 100$', start: 10, end: 100 },
          { label: '100$ - 500$', start: 100, end: 500 },
          { label: '>= 500$', start: 500 },
        ]"
      />
      <AisHierarchicalMenu attribute="hierarchicalCategories.lvl0" />
      <AisRatingMenu attribute="rating" />
    </AisInstantSearch>

    <div @click="isFreeShipping = !isFreeShipping">
      Change free shipping {{ isFreeShipping }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";
import type { InstantSearchOptions } from "instantsearch.js/es/types";
import { singleIndex as singleIndexMapping } from "instantsearch.js/es/lib/stateMappings";

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76", {
  responsesCache: useAisStatefulCache(),
  requestsCache: useAisStatefulCache(),
});
const algoliaRouter = useAisRouter();

const route = useRoute();
const brand = typeof route.params.brand === "string" ? route.params.brand : "";
const filters = computed(() => `brand:${brand}`);
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
    cache: useAisInfiniteHitsStatefulCache("ihits"),
  }),
  useAisHierarchicalMenu(
    {
      attributes: [
        "hierarchicalCategories.lvl0",
        "hierarchicalCategories.lvl1",
        "hierarchicalCategories.lvl2",
      ],
    },
    brand
  ),
  useAisRefinementList(
    {
      attribute: "brand",
      showMore: true,
    },
    brand
  ),
  useAisToggleRefinement({ attribute: "free_shipping" }),
  useAisConfigure({
    searchParameters: {
      filters: filters.value,
      distinct: true,
      facetFilters: [`free_shipping:${isFreeShipping.value}`],
    },
  }),
  useAisSearchBox({}),
  useAisClearRefinements({}),
  useAisMenu({
    attribute: "categories",
    limit: 5,
    showMore: true,
    showMoreLimit: 10,
    sortBy: ["name:desc"],
    transformItems: (items) => {
      return items.map((item) => {
        return {
          ...item,
          label: item.label.toUpperCase(),
        };
      });
    },
  }),
  useAisNumericMenu({
    attribute: "price",
    items: [
      { label: 'All' },
      { label: '<= 10$', end: 10 },
      { label: '10$ - 100$', start: 10, end: 100 },
      { label: '100$ - 500$', start: 100, end: 500 },
      { label: '>= 500$', start: 500 },
    ],
  }),
  useAisRatingMenu({
    attribute: "rating",
  }),
]);

const configuration = ref<InstantSearchOptions>({
  indexName: "instant_search",
  routing: {
    router: algoliaRouter.value.router,
    stateMapping: singleIndexMapping("instant_search"),
  },
  searchClient: client,
} as unknown as InstantSearchOptions);
type TProduct = {
  objectID: string;
  name: string;
  price: string;
};
</script>

<style scoped></style>
