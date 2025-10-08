<template>
  <div>
    <AisInstantSearch
      :widgets
      :configuration
    >
      <AisStats data-testid="stats" />
      <AisInfiniteHits data-testid="infinitehits" />
      <AisRefinementList
        attribute="brand"
        searchable
        data-testid="refinementlist"
      />
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";
import { computed, ref } from "vue"

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");
const widgets = computed(() => [
  useAisStats({}),
  useAisInfiniteHits({}),
  useAisRefinementList({
    attribute: "brand",
    showMore: true,
  }),
]);

const configuration = ref({
  indexName: "instant_search",
  searchClient: client,
});
</script>

<style scoped></style>
