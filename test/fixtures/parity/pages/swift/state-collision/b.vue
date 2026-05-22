<template>
  <div data-testid="page-b">
    <NuxtLink data-testid="go-to-a" to="/swift/state-collision/a">Go to A</NuxtLink>
    <AisInstantSearch :configuration="configuration" instance-key="state-collision-b">
      <AisConfigure :search-parameters="{ hitsPerPage: 5 }" />
      <AisRefinementList id="shared-list" attribute="brand" />
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";

const searchClient = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");

const configuration = {
  indexName: "instant_search",
  searchClient,
};
</script>
