<template>
  <div>
    <NuxtLink to="/pagination">
      Go start page
    </NuxtLink>
    <AisInstantSearch
      :widgets
      :configuration
      instance-key="index"
    >
      <AisStats />
      <AisClearRefinements id="all" />
      <AisHits />
      <AisRefinementList
        attribute="brand"
        searchable
      />
      <NuxtLink to="/pagination?page=2">
        Go to page 3
      </NuxtLink>
    </AisInstantSearch>
  </div>
</template>
  
  <script setup lang="ts">
  import algoliasearch from "algoliasearch";
  
  const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76", {});
  const algoliaRouter = useAisRouter();
  
  const widgets = ref([
    useAisStats({}),
    useAisClearRefinements({}, "all"),
    useAisHits({
      escapeHTML
    }),
    useAisRefinementList({
      attribute: "brand",
      showMore: true,
    }),
  ]);
  
  const configuration = ref({
    indexName: "instant_search",
    routing: algoliaRouter.value,
    searchClient: client,
  });
  </script>
  
  <style scoped></style>
  