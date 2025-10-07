<template>
  <div>
    <AisInstantSearch
      :widgets
      :configuration
      instance-key="index"
    >
      <AisStats />
      <AisHits />

      <NuxtLink to="/pagination/page/2">
        Go to page 2
      </NuxtLink>
      <AisPagination
        :show-first="false"
        :show-next="false"
        :show-last="false"
        :show-previous="false"
      />
    </AisInstantSearch>
    {{ data }}
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";

const client = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76", {});
const algoliaRouter = useCustomRouting();
const { data } = await useFetch("/api/testApi");
const widgets = ref([
  useAisStats({}),
  useAisHits({}),
  useAisConfigure({
    searchParameters: {
      hitsPerPage: 20,
    },
  }),
  useAisPagination({
    padding: 2,
  }),
]);

const stateMapping = useStateMapping();

const configuration = ref({
  indexName: "instant_search",
  routing: {
    router: algoliaRouter.value.router,
    stateMapping: stateMapping("instant_search"),
  },
  searchClient: client,
});
</script>

<style scoped></style>

