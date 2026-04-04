<template>
  <div class="p-8 font-sans overflow-hidden">
    <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
      <h1
        v-if="brand"
        data-testid="brand-heading"
        class="text-base font-semibold text-cosmos-black mb-8"
      >
        {{ brand }}
      </h1>
      <h1
        v-else
        class="text-base font-semibold text-cosmos-black mb-8"
      >
        Brand search
      </h1>
      <p class="text-sm text-cosmos-black-opacity-70">
        Showcase-inspired faceted layout with grouped widgets and infinite hits.
      </p>
    </div>

    <AisInstantSearch
      :key="`search-experience-${brand}`"
      :configuration="configuration"
      :instance-key="`search-experience-${brand}`"
    >
      <AisConfigure
        :search-parameters="{
          filters,
          distinct: true,
          facetFilters: [`free_shipping:${isFreeShipping}`],
        }"
      />

      <div class="flex sm:flex-row flex-col-reverse">
        <div class="flex flex-col flex-no-grow sm:max-w-296 w-full">
          <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
            <h4 class="subtitle">
              Search
            </h4>
            <AisSearchBox />
          </div>

          <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
            <h4 class="subtitle">
              Brand
            </h4>
            <AisRefinementList
              attribute="brand"
              searchable
              :show-more="true"
            />
          </div>

          <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
            <h4 class="subtitle">
              Category
            </h4>
            <AisMenuSelect attribute="categories" />
            <div class="mt-8">
              <AisMenu
                attribute="categories"
                :limit="5"
                :show-more="true"
                :show-more-limit="10"
                :sort-by="['name:desc']"
                :transform-items="menuTransformItems"
              />
            </div>
          </div>

          <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
            <h4 class="subtitle">
              Price
            </h4>
            <AisNumericMenu
              attribute="price"
              :items="numericMenuItems"
            />
          </div>

          <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
            <h4 class="subtitle">
              Rating
            </h4>
            <AisRatingMenu attribute="rating" />
          </div>

          <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
            <h4 class="subtitle">
              Hierarchy
            </h4>
            <AisHierarchicalMenu :attributes="hierarchicalAttributes" />
          </div>

          <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
            <h4 class="subtitle">
              Shipping
            </h4>
            <AisToggleRefinement attribute="free_shipping" />
          </div>
        </div>

        <div class="flex flex-col flex-1">
          <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
            <div class="flex sm:flex-row flex-col">
              <div class="flex-1 mr-16">
                <h4 class="subtitle">
                  SortBy
                </h4>
                <AisSortBy :items="sortByItems" />
              </div>
              <div class="flex-1">
                <h4 class="subtitle">
                  Stats
                </h4>
                <AisStats />
              </div>
            </div>

            <div class="mt-8">
              <h4 class="subtitle">
                Clear refinements
              </h4>
              <AisClearRefinements />
            </div>
          </div>

          <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
            <h4 class="subtitle">
              Infinite hits
            </h4>
            <AisInfiniteHits
              :show-previous="true"
              :cache="infiniteHitsCache"
            >
              <template #item="{ item }">
                <div class="flex py-16 px-24 bg-gradient-white-moon-grey font-sans text-sm text-color-inherit rounded shadow">
                  <div class="flex items-center justify-center h-56 w-56 px-8 bg-white mr-16 flex-no-grow flex-no-shrink">
                    <img
                      class="h-auto max-h-48 w-auto"
                      :src="(item as unknown as TProduct).image"
                      alt=""
                    >
                  </div>
                  <div>
                    <h5 class="mb-8 text-cosmos-black font-bold text-sm">
                      {{ (item as unknown as TProduct).name }}
                    </h5>
                    <p class="text-cosmos-black-opacity-70 text-xs">
                      ${{ (item as unknown as TProduct).price }}
                    </p>
                  </div>
                </div>
              </template>
            </AisInfiniteHits>
          </div>
        </div>
      </div>

      <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
        <button
          class="h-32 px-16 bg-gradient-white-moon-grey rounded shadow text-sm"
          type="button"
          @click="isFreeShipping = !isFreeShipping"
        >
          Toggle free shipping: {{ isFreeShipping }}
        </button>
      </div>
    </AisInstantSearch>
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
const sortByItems = [
  { value: "instant_search", label: "Default" },
  { value: "instant_search_price_asc", label: "Price asc." },
  { value: "instant_search_price_desc", label: "Price desc." },
];

const hierarchicalAttributes = [
  "hierarchicalCategories.lvl0",
  "hierarchicalCategories.lvl1",
  "hierarchicalCategories.lvl2",
];

const numericMenuItems = [
  { label: "All" },
  { label: "<= 10$", end: 10 },
  { label: "10$ - 100$", start: 10, end: 100 },
  { label: "100$ - 500$", start: 100, end: 500 },
  { label: ">= 500$", start: 500 },
];

const menuTransformItems = (items: Array<{ label: string }>) => {
  return items.map((item) => {
    return {
      ...item,
      label: item.label.toUpperCase(),
    };
  });
};

const infiniteHitsCache = useAisInfiniteHitsStatefulCache("ihits");

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
  image?: string;
};
</script>
