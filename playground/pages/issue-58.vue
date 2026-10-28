<template>
  <main class="p-8 font-sans" data-testid="issue-58-page">
    <h1 class="text-base font-semibold mb-8">Issue #58 regression check</h1>
    <p class="text-sm text-cosmos-black-opacity-70 mb-8">
      Declarative <code>v-for</code> over a refinement-list config array — the verbatim reproduction
      from the issue.
    </p>

    <AisInstantSearch :configuration="configuration" instance-key="issue-58">
      <AisConfigure :search-parameters="{ hitsPerPage: 12 }" />

      <div class="search-layout">
        <AisSearchBox placeholder="Search products…" />

        <AisRefinementList
          v-for="attribute in refinementListAttributes"
          :key="attribute"
          :attribute="attribute"
        />

        <AisStats />
        <AisHits />
        <AisPagination />
      </div>
    </AisInstantSearch>
  </main>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");

const refinementListAttributes = ["brand", "price_range", "free_shipping"];

const configuration = ref({
  indexName: "instant_search",
  searchClient: client,
});
</script>
