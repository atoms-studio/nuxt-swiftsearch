<template>
  <div class="page">
    <AisInstantSearch :configuration="configuration" instance-key="nested-child">
      <AisConfigure :search-parameters="{ hitsPerPage: 5 }" />
      <AisSearchBox />

      <FiltersSidebar :attributes="refinementListAttributes" />

      <AisHits data-testid="hits" />
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";

const searchClient = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");

const refinementListAttributes = ["brand", "categories"];

const configuration = {
  indexName: "instant_search",
  searchClient,
};
</script>
