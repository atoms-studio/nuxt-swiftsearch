<template>
  <div class="router-page">
    <nav class="links">
      <NuxtLink to="/swift/router?instant_search%5Bquery%5D=apple">
        Prefilled query
      </NuxtLink>
      <NuxtLink to="/swift/router/Samsung">
        Samsung route
      </NuxtLink>
      <NuxtLink to="/swift/router/Apple">
        Apple route
      </NuxtLink>
    </nav>

    <AisInstantSearch
      :widgets="widgets"
      :configuration="configuration"
      instance-key="router"
    >
      <AisSearchBox data-testid="router-searchbox" />
      <AisStats data-testid="router-stats" />
      <AisToggleRefinement
        attribute="free_shipping"
        data-testid="router-togglerefinement"
      />
      <AisRefinementList
        attribute="brand"
        searchable
        data-testid="router-refinementlist"
      />
      <AisHits data-testid="router-hits" />
      <AisCurrentRefinements data-testid="router-currentrefinements" />
      <AisPagination data-testid="router-pagination" />
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";
import { computed } from "vue";

const searchClient = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");
const algoliaRouter = useAisRouter();

const widgets = computed(() => [
  useAisConfigure({ searchParameters: { hitsPerPage: 5 } }),
  useAisSearchBox({}),
  useAisStats({}),
  useAisToggleRefinement({ attribute: "free_shipping" }),
  useAisRefinementList({ attribute: "brand" }),
  useAisHits({}),
  useAisCurrentRefinements({}),
  useAisPagination({}),
]);

const configuration = computed(() => ({
  indexName: "instant_search",
  routing: algoliaRouter.value,
  searchClient,
}));
</script>
