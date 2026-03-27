<template>
  <div class="p-8 font-sans overflow-hidden">
    <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
      <h1 class="text-base font-semibold text-cosmos-black mb-8">
        Route-driven brand filtering
      </h1>
      <p class="text-sm text-cosmos-black-opacity-70">
        The catch-all segment updates the Algolia filters through <code>AisConfigure</code>.
      </p>
      <div class="flex flex-wrap -mx-4 mt-8">
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/?q=test"
        >
          Test query
        </NuxtLink>
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/test/Apple"
        >
          Apple
        </NuxtLink>
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/test/Samsung"
        >
          Samsung
        </NuxtLink>
      </div>
      <span
        data-testid="active-brand-filter"
        class="inline-block mt-8 py-4 px-8 bg-proton-grey-opacity-20 rounded text-sm"
      >
        {{ filters }}
      </span>
    </div>

    <AisInstantSearch
      :configuration="configuration"
      instance-key="catchall"
    >
      <AisConfigure
        :search-parameters="{
          filters,
          distinct: true,
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
              Price
            </h4>
            <AisRangeInput attribute="price" />
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
              <div class="flex flex-wrap -mx-4">
                <div class="m-2">
                  <AisClearRefinements
                    id="free_shipping"
                    :included-attributes="['free_shipping']"
                  />
                </div>
                <div class="m-2">
                  <AisClearRefinements
                    id="brand"
                    :included-attributes="['brand']"
                  />
                </div>
                <div class="m-2">
                  <AisClearRefinements id="all" />
                </div>
              </div>
            </div>
          </div>

          <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
            <h4 class="subtitle">
              Results
            </h4>
            <AisInfiniteHits
              :show-previous="true"
              :cache="infiniteHitsCache"
            >
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
          </div>
        </div>
      </div>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";
await useFetch("/api/testApi");

const filters = computed(() => `brand:${useRoute().params.catchall[0]}`);

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76", {});
const algoliaRouter = useAisRouter();
const sortByItems = [
  { value: "instant_search", label: "Default" },
  { value: "instant_search_price_asc", label: "Price asc." },
  { value: "instant_search_price_desc", label: "Price desc." },
];
const infiniteHitsCache = useAisInfiniteHitsStatefulCache("catchall");

const configuration = ref({
  indexName: "instant_search",
  routing: algoliaRouter.value,
  searchClient: client,
});
</script>
