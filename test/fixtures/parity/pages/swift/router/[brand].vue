<template>
  <div class="brand-page">
    <h1 data-testid="brand-heading">
      {{ brandTitle }}
    </h1>
    <NuxtLink to="/swift/router">
      Back to router home
    </NuxtLink>

    <AisInstantSearch
      :widgets="widgets"
      :configuration="configuration"
      :instance-key="`router-${brandTitle || 'all'}`"
    >
      <AisStats data-testid="brand-stats" />
      <AisCurrentRefinements data-testid="brand-currentrefinements" />
      <AisHits data-testid="brand-hits" />
      <AisToggleRefinement
        attribute="free_shipping"
        data-testid="brand-togglerefinement"
      />
      <AisRefinementList
        attribute="brand"
        searchable
        data-testid="brand-refinementlist"
      />
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";

const route = useRoute();
const searchClient = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");
const algoliaRouter = useAisRouter();

const brandTitle = computed(() => {
  return typeof route.params.brand === "string" ? route.params.brand : "";
});

const filters = computed(() => {
  return brandTitle.value ? `brand:${brandTitle.value}` : undefined;
});

const widgets = computed(() => [
  useAisConfigure({
    searchParameters: {
      filters: filters.value,
    },
  }),
  useAisStats({}),
  useAisCurrentRefinements({}),
  useAisHits({}),
  useAisToggleRefinement({ attribute: "free_shipping" }),
  useAisRefinementList({ attribute: "brand" }),
]);

const configuration = computed(() => ({
  indexName: "instant_search",
  routing: algoliaRouter.value,
  searchClient,
}));
</script>
