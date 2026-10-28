<template>
  <main class="p-8 font-sans" data-testid="issue-58-nested-page">
    <h1 class="text-base font-semibold mb-8">Issue #58 nested-components check</h1>
    <p class="text-sm text-cosmos-black-opacity-70 mb-8">
      Widgets living inside <code>&lt;IssueFiltersSidebar&gt;</code>, auto-discovered via the
      <code>childWidgetDiscovery</code> module option.
    </p>

    <AisInstantSearch :configuration="configuration" instance-key="issue-58-nested">
      <AisConfigure :search-parameters="{ hitsPerPage: 12 }" />

      <div class="grid grid-cols-[240px_1fr] gap-8">
        <IssueFiltersSidebar :attributes="['brand', 'price_range', 'free_shipping']" />

        <div>
          <AisSearchBox placeholder="Search products…" />
          <AisHits />
          <AisPagination />
        </div>
      </div>
    </AisInstantSearch>
  </main>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");

const configuration = ref({
  indexName: "instant_search",
  searchClient: client,
});
</script>
