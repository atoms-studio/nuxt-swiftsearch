<template>
  <div>
    <AisInstantSearch
      :widgets
      :configuration
      instance-key="autocomplete"
    >
      <AisAutocomplete>
        <template #default="{ currentRefinement, indices, refine }">
          <input
            type="search"
            :value="currentRefinement"
            placeholder="Search for a product"
            @input="refine(($event.currentTarget as HTMLInputElement).value)"
          >
          <ul
            v-for="index in indices"
            :key="index.indexId"
          >
            <li>
              <h3>{{ index.indexName }}</h3>
              <ul>
                <li
                  v-for="hit in index.hits"
                  :key="hit.objectID"
                >
                  <ais-highlight
                    attribute="name"
                    :hit="hit"
                  />
                  <button
                    type="button"
                    @click="index.sendEvent('click', hit, 'Item Added')"
                  >
                    Add to cart
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </template>
      </AisAutocomplete>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import algoliasearch from "algoliasearch";
import type { InstantSearchOptions } from "instantsearch.js/es/types";

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");

const widgets = computed(() => [
  useAisAutocomplete({})
]);

const configuration = ref<InstantSearchOptions>({
  indexName: "instant_search",
  searchClient: client,
} as unknown as InstantSearchOptions);
</script>

<style scoped></style>
