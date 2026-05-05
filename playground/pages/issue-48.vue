<template>
  <div class="p-8 font-sans" data-testid="issue-48-page">
    <h1 class="text-base font-semibold mb-8">Issue #48 regression check</h1>
    <p class="text-sm text-cosmos-black-opacity-70 mb-8">
      Manual widgets mode without <code>widgetId</code>: <code>toggleShowMore()</code> and
      <code>searchForItems()</code> must reactively update the UI.
    </p>

    <AisInstantSearch :widgets="widgets" :configuration="configuration" instance-key="issue-48">
      <div data-testid="issue-48-list">
        <AisRefinementList attribute="brand" searchable :show-more="true" :limit="3" />
      </div>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");

const configuration = ref({
  indexName: "instant_search",
  searchClient: client,
});

const widgets = computed(() => [
  useAisSearchBox({}),
  useAisRefinementList({
    attribute: "brand",
    showMore: true,
    limit: 3,
  }),
]);
</script>
