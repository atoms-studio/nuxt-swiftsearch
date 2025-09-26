<template>
  <div>
    <AisInstantSearch
      index-name="instant_search"
      :search-client="client"
    >
      <AisStats data-testid="stats" />
      <AisInfiniteHits data-testid="infinitehits" />
      <AisRefinementList
        attribute="brand"
        searchable
        :show-more="true"
        data-testid="refinementlist"
      />
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";
import {
  AisInstantSearch,
  AisStats,
  AisInfiniteHits,
  AisRefinementList,
} from "vue-instantsearch/vue3/es";
const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");
</script>

<style scoped></style>
