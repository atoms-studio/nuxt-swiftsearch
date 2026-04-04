<template>
  <div class="page">
    <AisInstantSearch index-name="instant_search" :search-client="searchClient">
      <AisConfigure
        :query="'apple'"
        :hits-per-page.camel="4"
        :attributes-to-snippet.camel="['description:14']"
      />

      <AisExperimentalConfigureRelatedItems
        :hit="relatedHit"
        :matching-patterns="matchingPatterns"
      />

      <AisQueryRuleContext :tracked-filters="trackedFilters" />
      <AisQueryRuleCustomData />

      <div data-testid="showcase-searchbox">
        <AisSearchBox />
      </div>

      <div data-testid="showcase-breadcrumb">
        <AisBreadcrumb :attributes="hierarchicalAttributes" />
      </div>

      <div data-testid="showcase-hitspage">
        <AisHitsPerPage :items="hitsPerPageItems" />
      </div>

      <div data-testid="showcase-dynamicwidgets">
        <AisDynamicWidgets :transform-items="fallbackDynamicAttributes">
          <AisRefinementList attribute="brand" />
          <AisMenu attribute="categories" />
        </AisDynamicWidgets>
      </div>

      <div data-testid="showcase-exp-dynamicwidgets">
        <AisExperimentalDynamicWidgets :transform-items="fallbackExperimentalDynamicAttributes">
          <AisMenu attribute="categories" />
        </AisExperimentalDynamicWidgets>
      </div>

      <div data-testid="showcase-voicesearch">
        <ClientOnly>
          <AisVoiceSearch />
        </ClientOnly>
      </div>

      <div data-testid="showcase-relevantsort">
        <AisRelevantSort />
      </div>

      <div data-testid="showcase-poweredby">
        <ClientOnly>
          <AisPoweredBy />
        </ClientOnly>
      </div>

      <div data-testid="showcase-snippet">
        <AisHits>
          <template #item="{ item }">
            <article>
              <h4>{{ item.name }}</h4>
              <AisSnippet :hit="item" attribute="description" />
            </article>
          </template>
        </AisHits>
      </div>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";
import {
  AisBreadcrumb,
  AisConfigure,
  AisDynamicWidgets,
  AisExperimentalConfigureRelatedItems,
  AisExperimentalDynamicWidgets,
  AisHits,
  AisHitsPerPage,
  AisInstantSearch,
  AisMenu,
  AisPoweredBy,
  AisQueryRuleContext,
  AisQueryRuleCustomData,
  AisRefinementList,
  AisRelevantSort,
  AisSearchBox,
  AisSnippet,
  AisVoiceSearch,
} from "vue-instantsearch/vue3/es";

const searchClient = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");

const hierarchicalAttributes = [
  "hierarchicalCategories.lvl0",
  "hierarchicalCategories.lvl1",
  "hierarchicalCategories.lvl2",
];

const hitsPerPageItems = [
  { label: "4 hits", value: 4, default: true },
  { label: "8 hits", value: 8 },
  { label: "12 hits", value: 12 },
];

const fallbackDynamicAttributes = (items: string[]) => {
  return items.length ? items : ["brand", "categories"];
};

const fallbackExperimentalDynamicAttributes = (items: string[]) => {
  return items.length ? items : ["categories"];
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
