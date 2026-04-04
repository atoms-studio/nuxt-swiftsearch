<template>
  <div class="p-8 font-sans overflow-hidden">
    <div class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
      <h1 class="text-base font-semibold text-cosmos-black mb-8">
        URL-synced pages
      </h1>
      <p class="text-sm text-cosmos-black-opacity-70">
        Pagination state is restored from the URL.
      </p>
      <div class="flex flex-wrap -mx-4 mt-8">
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/pagination/page/2"
        >
          Go to page 2
        </NuxtLink>
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/"
        >
          Back to home
        </NuxtLink>
      </div>
    </div>

    <AisInstantSearch
      :configuration="configuration"
      instance-key="index"
    >
      <AisConfigure :search-parameters="{ hitsPerPage: 20 }" />

      <section class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue">
        <div class="flex sm:flex-row flex-col">
          <div class="flex-1">
            <AisStats />
          </div>
          <div class="flex-1 text-sm text-cosmos-black-opacity-70">
            Routing is synced through /pagination/page/:page
          </div>
        </div>

        <section class="mt-8">
          <AisHits data-testid="pagination-hits" />
          <AisPagination
            data-testid="pagination-control"
            :padding="2"
            :show-first="false"
            :show-next="false"
            :show-last="false"
            :show-previous="false"
          />
        </section>
      </section>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76", {});
const algoliaRouter = useCustomRouting();
await useFetch("/api/testApi");

const stateMapping = useStateMapping();

const configuration = ref({
  indexName: "instant_search",
  routing: {
    router: algoliaRouter.value.router,
    stateMapping: stateMapping("instant_search"),
  },
  searchClient: client,
});
</script>
