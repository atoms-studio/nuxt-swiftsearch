<template>
  <div class="page">
    <AisInstantSearch
      :configuration="configuration"
      instance-key="full"
    >
      <AisConfigure :search-parameters="{ hitsPerPage: 5 }" />
      <div data-testid="searchbox">
        <AisSearchBox show-loading-indicator />
      </div>
      <div data-testid="stats">
        <AisStats />
      </div>
      <div data-testid="currentrefinements">
        <AisCurrentRefinements />
      </div>
      <div data-testid="clearrefinements">
        <AisClearRefinements />
      </div>
      <div data-testid="sortby">
        <AisSortBy :items="sortByItems" />
      </div>
      <div data-testid="togglerefinement">
        <AisToggleRefinement attribute="free_shipping" />
      </div>
      <div data-testid="refinementlist">
        <AisRefinementList
          attribute="brand"
          searchable
          :limit="10"
          :show-more="true"
          :show-more-limit="20"
        />
      </div>
      <div data-testid="menu">
        <AisMenu
          attribute="categories"
          :show-more="true"
        />
      </div>
      <div data-testid="menuselect">
        <AisMenuSelect attribute="categories" />
      </div>
      <div data-testid="numericmenu">
        <AisNumericMenu
          attribute="price"
          :items="numericMenuItems"
        />
      </div>
      <div data-testid="ratingmenu">
        <AisRatingMenu attribute="rating" />
      </div>
      <div data-testid="hierarchicalmenu">
        <AisHierarchicalMenu :attribute="hierarchicalAttributes[0]" />
      </div>
      <div data-testid="rangeinput">
        <AisRangeInput attribute="price" />
      </div>
      <div data-testid="autocomplete">
        <AisAutocomplete />
      </div>
      <div data-testid="hits">
        <AisHits />
      </div>
      <div data-testid="infinitehits">
        <AisInfiniteHits :show-previous="true" />
      </div>
      <div data-testid="pagination">
        <AisPagination />
      </div>
      <div data-testid="panel">
        <AisPanel
          component="refinementList"
          attribute="brand"
          header="Brand refinements"
          :class-names="panelClassNames"
        >
          <template #default>
            <AisRefinementList attribute="brand" />
          </template>
        </AisPanel>
      </div>
      <AisIndex index="airbnb">
        <div data-testid="index-hits">
          <AisHits />
        </div>
        <div data-testid="index-refinementlist">
          <AisRefinementList attribute="city" />
        </div>
      </AisIndex>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";

const searchClient = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");

const sortByItems = [
  { value: "instant_search", label: "Default" },
  { value: "instant_search_price_asc", label: "Price asc." },
  { value: "instant_search_price_desc", label: "Price desc." },
];

const numericMenuItems = [
  { label: "All" },
  { label: "<= 100", end: 100 },
  { label: "100 - 500", start: 100, end: 500 },
  { label: ">= 500", start: 500 },
];

const hierarchicalAttributes = [
  "hierarchicalCategories.lvl0",
  "hierarchicalCategories.lvl1",
  "hierarchicalCategories.lvl2",
];

const panelClassNames = {
  header: "custom-header",
  body: "custom-body",
};

const configuration = {
  indexName: "instant_search",
  searchClient,
};
</script>
