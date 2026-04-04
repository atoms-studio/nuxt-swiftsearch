<template>
  <div class="p-8 font-sans overflow-hidden">
    <div
      class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
    >
      <h1 class="text-base font-semibold text-cosmos-black mb-8" data-testid="manual-page">
        Manual widgets mode
      </h1>
      <p class="text-sm text-cosmos-black-opacity-70">
        This page keeps <code>:widgets</code> for backwards compatibility checks.
      </p>
      <div class="flex flex-wrap -mx-4 mt-8">
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/"
        >
          Declarative home
        </NuxtLink>
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/Samsung"
        >
          Samsung page
        </NuxtLink>
      </div>
    </div>

    <AisInstantSearch :widgets :configuration instance-key="search">
      <div class="flex sm:flex-row flex-col-reverse">
        <div class="flex flex-col flex-no-grow sm:max-w-296 w-full">
          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Search</h4>
            <AisSearchBox data-testid="manual-searchbox" />
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Shipping</h4>
            <AisToggleRefinement attribute="free_shipping" />
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Brand</h4>
            <AisRefinementList attribute="brand" searchable />
          </div>
        </div>

        <div class="flex flex-col flex-1">
          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <div class="flex sm:flex-row flex-col">
              <div class="flex-1 mr-16">
                <h4 class="subtitle">SortBy</h4>
                <AisSortBy />
              </div>
              <div class="flex-1">
                <h4 class="subtitle">Stats</h4>
                <AisStats />
              </div>
            </div>
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Results</h4>
            <AisInfiniteHits data-testid="manual-main-hits">
              <template #default="{ items }">
                <div
                  v-for="item in items"
                  :key="item.objectID"
                  data-testid="manual-main-item"
                  class="flex py-16 px-24 bg-gradient-white-moon-grey font-sans text-sm text-color-inherit rounded shadow"
                >
                  <div
                    class="flex items-center justify-center h-56 w-56 px-8 bg-white mr-16 flex-no-grow flex-no-shrink"
                  >
                    <img class="h-auto max-h-48 w-auto" :src="item.image" alt="" />
                  </div>
                  <div>
                    <h5 class="mb-8 text-cosmos-black font-bold text-sm">
                      {{ item.name }}
                    </h5>
                    <p class="text-cosmos-black-opacity-70 text-xs">
                      {{ item.brand }} - ${{ item.price }}
                    </p>
                  </div>
                </div>
              </template>
            </AisInfiniteHits>
          </div>
        </div>
      </div>

      <div
        class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
      >
        <h4 class="subtitle">Secondary index (manual)</h4>
        <AisIndex index="airbnb">
          <AisInfiniteHits data-testid="manual-index-hits">
            <template #item="{ item }">
              <div class="py-8 text-sm">{{ item.city }} - {{ item.name }}</div>
            </template>
          </AisInfiniteHits>
        </AisIndex>
      </div>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";
import type { InstantSearchOptions } from "instantsearch.js/es/types";
import { singleIndex as singleIndexMapping } from "instantsearch.js/es/lib/stateMappings";
const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");
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
  }),
  useAisRefinementList(
    {
      attribute: "brand",
      showMore: true,
    },
    "brand-search",
  ),
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
