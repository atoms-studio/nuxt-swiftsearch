<template>
  <div class="page">
    <AisInstantSearch
      :configuration="configuration"
      instance-key="index-isolation"
    >
      <AisConfigure :search-parameters="{ hitsPerPage: 5 }" />
      <AisIndex index="airbnb">
        <section data-testid="index-1">
          <AisClearRefinements
            id="shared-clear"
            data-testid="index-1-clear"
          />
          <AisRefinementList attribute="city" />
        </section>
      </AisIndex>

      <AisIndex
        index="airbnb"
        index-id="bnb2"
      >
        <section data-testid="index-2">
          <AisClearRefinements
            id="shared-clear"
            data-testid="index-2-clear"
          />
          <AisRefinementList attribute="city" />
        </section>
      </AisIndex>
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
