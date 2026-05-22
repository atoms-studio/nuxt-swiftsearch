<template>
  <div data-testid="status-page">
    <AisInstantSearch :configuration="configuration" instance-key="status-test">
      <AisConfigure :search-parameters="{ hitsPerPage: 5 }" />
      <AisRefinementList id="brand-list" attribute="brand" />
      <AisStateResults v-slot="{ status }">
        <div data-testid="status">{{ status }}</div>
      </AisStateResults>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";

const baseClient = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");

const SEARCH_DELAY_MS = 600;

const delay = <T>(value: Promise<T>) =>
  new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      value.then(resolve, reject);
    }, SEARCH_DELAY_MS);
  });

const searchClient = {
  ...baseClient,
  search(requests: Parameters<typeof baseClient.search>[0]) {
    return delay(baseClient.search(requests));
  },
  searchForFacetValues(requests: Parameters<typeof baseClient.searchForFacetValues>[0]) {
    return delay(baseClient.searchForFacetValues(requests));
  },
};

const configuration = {
  indexName: "instant_search",
  searchClient,
};
</script>
