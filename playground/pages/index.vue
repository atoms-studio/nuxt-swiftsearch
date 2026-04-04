<template>
  <div class="p-8 font-sans overflow-hidden">
    <div class="-mx-4 -mb-4">
      <div class="flex sm:flex-row sm:mt-0 flex-col mb-32">
        <NuxtLink
          class="flex-1 mx-4 sm:my-0 my-4 py-24 px-40 bg-gradient-white-moon-grey shadow rounded text-center cursor-pointer text-cosmos-black no-underline"
          to="/"
        >
          <h2 class="mb-8 font-semibold text-base">InstantSearch</h2>
          <p class="text-base">Declarative search interface</p>
        </NuxtLink>
        <NuxtLink
          class="flex-1 mx-4 sm:my-0 my-4 py-24 px-40 bg-proton-grey-opacity-20 rounded text-center cursor-pointer text-nova-grey no-underline"
          to="/autocomplete"
        >
          <h2 class="mb-8 font-semibold text-base">AutoComplete</h2>
          <p class="text-base">Multi-index suggestions</p>
        </NuxtLink>
        <NuxtLink
          class="flex-1 mx-4 sm:my-0 my-4 py-24 px-40 bg-proton-grey-opacity-20 rounded text-center cursor-pointer text-nova-grey no-underline"
          to="/Samsung"
        >
          <h2 class="mb-8 font-semibold text-base">Brand Search</h2>
          <p class="text-base">Route based faceted search</p>
        </NuxtLink>
        <NuxtLink
          class="flex-1 mx-4 sm:my-0 my-4 py-24 px-40 bg-proton-grey-opacity-20 rounded text-center cursor-pointer text-nova-grey no-underline"
          to="/showcase"
        >
          <h2 class="mb-8 font-semibold text-base">Parity Showcase</h2>
          <p class="text-base">New parity widgets</p>
        </NuxtLink>
      </div>

      <div
        class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
      >
        <h1 class="text-base font-semibold text-cosmos-black mb-8">Nuxt SwiftSearch Playground</h1>
        <p class="text-sm text-cosmos-black-opacity-70">
          Structure and utility classes aligned with the Algolia showcase CSS.
        </p>
        <div class="flex flex-wrap -mx-4 mt-8">
          <NuxtLink
            class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
            to="/?instant_search%5Btoggle%5D%5Bfree_shipping%5D=true&instant_search%5Bquery%5D=testa"
          >
            URL state
          </NuxtLink>
          <NuxtLink
            class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
            to="/search"
          >
            Manual page
          </NuxtLink>
          <NuxtLink
            class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
            to="/test/Samsung"
          >
            Catch-all
          </NuxtLink>
          <NuxtLink
            class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
            to="/pagination"
          >
            Pagination
          </NuxtLink>
          <NuxtLink
            class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
            to="/showcase"
          >
            Parity showcase
          </NuxtLink>
        </div>
      </div>
    </div>

    <AisInstantSearch
      :configuration="configuration"
      :middlewares="middlewares"
      instance-key="index"
    >
      <AisConfigure :search-parameters="{}" />

      <div class="flex sm:flex-row flex-col-reverse">
        <div class="flex flex-col flex-no-grow sm:max-w-296 w-full">
          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Search</h4>
            <AisSearchBox data-testid="home-searchbox" />
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
            <AisRefinementList id="brand-index" attribute="brand" :show-more="true" />
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Price</h4>
            <AisRangeInput attribute="price" id="price-index" />
          </div>
        </div>

        <div class="flex flex-col flex-1">
          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <div class="flex sm:flex-row flex-col">
              <div class="flex-1 mr-16">
                <h4 class="subtitle">SortBy</h4>
                <AisSortBy :items="sortByItems" />
              </div>
              <div class="flex-1">
                <h4 class="subtitle">Stats</h4>
                <AisStats />
              </div>
            </div>

            <div class="mt-8">
              <h4 class="subtitle">Clear refinements</h4>
              <div class="flex flex-wrap -mx-4">
                <div class="m-2">
                  <AisClearRefinements
                    id="free_shipping"
                    :included-attributes="['free_shipping']"
                  />
                </div>
                <div class="m-2">
                  <AisClearRefinements id="brand" :included-attributes="['brand']" />
                </div>
                <div class="m-2">
                  <AisClearRefinements id="all" />
                </div>
              </div>
            </div>
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Results</h4>
            <AisInfiniteHits :show-previous="true" :cache="mainInfiniteHitsCache">
              <template #item="{ item }">
                <div
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
                    <p class="text-cosmos-black-opacity-50 text-xs">
                      {{ item.categories }}
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
        <h4 class="subtitle">Multi-index isolation</h4>
        <div class="flex sm:flex-row flex-col">
          <section data-testid="index-1" class="flex-1 m-4">
            <h5 class="mb-8 text-cosmos-black font-bold text-sm">Index 1 - airbnb</h5>
            <AisIndex index="airbnb">
              <AisRefinementList attribute="city" />
              <AisClearRefinements id="bnb" />
              <AisInfiniteHits>
                <template #item="{ item }">
                  <div class="py-8 text-sm">{{ item.city }} - {{ item.name }}</div>
                </template>
              </AisInfiniteHits>
            </AisIndex>
          </section>

          <section data-testid="index-2" class="flex-1 m-4">
            <h5 class="mb-8 text-cosmos-black font-bold text-sm">Index 2 - Chicago filter</h5>
            <AisIndex index="airbnb" index-id="bnb2">
              <AisConfigure :search-parameters="{ filters: 'city:Chicago' }" />
              <AisRefinementList attribute="city" />
              <AisClearRefinements id="bnb" />
              <AisInfiniteHits>
                <template #item="{ item }">
                  <div class="py-8 text-sm">{{ item.city }} - {{ item.name }}</div>
                </template>
              </AisInfiniteHits>
            </AisIndex>
          </section>
        </div>
      </div>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";
import type { Middleware } from "instantsearch.js";

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76", {});
const algoliaRouter = useAisRouter();
const sortByItems = [
  { value: "instant_search", label: "Default" },
  { value: "instant_search_price_asc", label: "Price asc." },
  { value: "instant_search_price_desc", label: "Price desc." },
];

const mainInfiniteHitsCache = useAisInfiniteHitsStatefulCache("index");

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
