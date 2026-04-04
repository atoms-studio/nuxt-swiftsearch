<template>
  <div class="p-8 font-sans overflow-hidden">
    <div
      class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
    >
      <h1 class="text-base font-semibold text-cosmos-black mb-8" data-testid="showcase-page">
        Full parity widget showcase
      </h1>
      <p class="text-sm text-cosmos-black-opacity-70">
        Dedicated playground page for the widgets recently added for vue-instantsearch parity.
      </p>
      <div class="flex flex-wrap -mx-4 mt-8">
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/"
        >
          Home
        </NuxtLink>
        <NuxtLink
          class="flex items-center m-2 py-4 px-8 bg-nova-grey text-xxs uppercase font-semibold text-white no-underline rounded"
          to="/search"
        >
          Manual mode
        </NuxtLink>
      </div>
    </div>

    <AisInstantSearch :configuration="configuration" instance-key="showcase">
      <AisConfigure
        :search-parameters="{
          hitsPerPage: 6,
          query: 'apple',
          attributesToSnippet: ['description:16'],
        }"
      />

      <AisConfigureRelatedItems :hit="relatedHit" :matching-patterns="matchingPatterns" />

      <AisExperimentalConfigureRelatedItems
        :hit="relatedHit"
        :matching-patterns="matchingPatterns"
      />

      <AisQueryRuleContext :tracked-filters="trackedFilters" />

      <div class="flex sm:flex-row flex-col-reverse">
        <div class="flex flex-col flex-no-grow sm:max-w-296 w-full">
          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Search</h4>
            <AisSearchBox data-testid="showcase-searchbox" />
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Breadcrumb</h4>
            <AisBreadcrumb data-testid="showcase-breadcrumb" :attributes="hierarchicalAttributes" />
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Hits per page</h4>
            <AisHitsPerPage data-testid="showcase-hitspage" :items="hitsPerPageItems" />
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Voice search</h4>
            <AisVoiceSearch data-testid="showcase-voicesearch" />
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Powered by</h4>
            <AisPoweredBy data-testid="showcase-poweredby" />
          </div>
        </div>

        <div class="flex flex-col flex-1">
          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Dynamic widgets</h4>
            <AisDynamicWidgets
              data-testid="showcase-dynamicwidgets"
              :transform-items="fallbackDynamicAttributes"
            >
              <AisRefinementList attribute="brand" />
              <AisMenu attribute="categories" />
            </AisDynamicWidgets>
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Experimental dynamic widgets alias</h4>
            <AisExperimentalDynamicWidgets
              data-testid="showcase-exp-dynamicwidgets"
              :transform-items="fallbackDynamicAttributes"
            >
              <AisRefinementList attribute="brand" />
            </AisExperimentalDynamicWidgets>
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Relevant sort</h4>
            <AisRelevantSort data-testid="showcase-relevantsort" />
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Snippet + hits</h4>
            <AisHits data-testid="showcase-snippet">
              <template #item="{ item }">
                <article class="py-8 text-sm text-cosmos-black">
                  <h5 class="mb-4 font-semibold">
                    {{ item.name }}
                  </h5>
                  <AisSnippet :hit="item" attribute="description" />
                </article>
              </template>
            </AisHits>
          </div>

          <div
            class="m-4 p-16 border-dashed border border-proton-grey-opacity-80 rounded text-solstice-blue"
          >
            <h4 class="subtitle">Query rule custom data</h4>
            <AisQueryRuleCustomData data-testid="showcase-query-rule-custom-data">
              <template #item="{ item }">
                <div class="py-4 text-sm">
                  {{ item.title || item.objectID || JSON.stringify(item) }}
                </div>
              </template>
            </AisQueryRuleCustomData>
          </div>
        </div>
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

const hierarchicalAttributes = [
  "hierarchicalCategories.lvl0",
  "hierarchicalCategories.lvl1",
  "hierarchicalCategories.lvl2",
];

const hitsPerPageItems = [
  { label: "6 hits", value: 6, default: true },
  { label: "12 hits", value: 12 },
  { label: "24 hits", value: 24 },
];

const fallbackDynamicAttributes = (items: string[]) => {
  return items.length ? items : ["brand", "categories"];
};

const relatedHit = {
  objectID: "showcase-related-hit",
  brand: "Apple",
  categories: ["Electronics", "Audio"],
};

const matchingPatterns = {
  brand: { score: 3 },
  categories: { score: 2 },
};

const trackedFilters = {
  brand: (values: Array<string | number | boolean>) => values,
};
</script>
