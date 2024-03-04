<template>
  <div>
    <NuxtLink to="/"> Home</NuxtLink>
    <AisInstantSearch index-name="instant_search" :search-client="client">
      <AisInfiniteHits data-testid="infinitehits" />
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import algoliasearch from "algoliasearch";
import {
  AisInstantSearch,
  AisInfiniteHits,
  // @ts-ignore
} from "vue-instantsearch/vue3/es";
const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");
</script>

<style scoped></style>
