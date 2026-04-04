<template>
  <div class="p-8 font-sans overflow-hidden">
    <div
      class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
    >
      <h1 class="text-base font-semibold text-cosmos-black mb-8">Multi-index autocomplete</h1>
      <p class="text-sm text-cosmos-black-opacity-70">
        Structure inspired by the Algolia showcase autocomplete panel.
      </p>
      <div class="flex flex-wrap -mx-4 mt-8">
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/"
        >
          Back to home
        </NuxtLink>
      </div>
    </div>

    <AisInstantSearch :configuration="configuration" instance-key="autocomplete">
      <section
        class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
      >
        <AisAutocomplete>
          <template #default="{ currentRefinement, indices, refine }">
            <input
              data-testid="autocomplete-input"
              class="w-full h-40 pl-40 pr-136 bg-moon-grey font-sans-alt text-sm text-color-inherit rounded focus:outline-none"
              type="search"
              :value="currentRefinement"
              placeholder="Search for a product"
              @input="refine(($event.currentTarget as HTMLInputElement).value)"
            />

            <div class="mt-8">
              <section
                v-for="index in indices"
                :key="index.indexId"
                data-testid="autocomplete-index"
                class="m-4 p-16 border border-nova-grey-opacity-20 rounded"
              >
                <h3 class="subtitle">
                  {{ index.indexName }}
                </h3>
                <ul class="px-0 py-4">
                  <li
                    v-for="hit in index.hits"
                    :key="hit.objectID"
                    class="py-8 text-sm text-cosmos-black"
                  >
                    <ais-highlight v-if="hit.name" attribute="name" :hit="hit" />
                    <ais-highlight v-else-if="hit.title" attribute="title" :hit="hit" />
                  </li>
                </ul>
              </section>
            </div>
          </template>
        </AisAutocomplete>
      </section>

      <AisIndex index="movies" />
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";
import type { InstantSearchOptions } from "instantsearch.js/es/types";
const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");
const algoliaRouter = useAisRouter();

const configuration = ref<InstantSearchOptions>({
  indexName: "instant_search",
  searchClient: client,
  routing: algoliaRouter.value,
} as unknown as InstantSearchOptions);
</script>
