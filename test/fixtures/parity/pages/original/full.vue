<template>
  <div class="page">
    <ClientOnly>
      <AisInstantSearch
        index-name="instant_search"
        :search-client="searchClient"
      >
        <AisConfigure :hits-per-page.camel="5" />
        <AisSearchBox
          data-testid="searchbox"
          show-loading-indicator
        />
        <AisStats data-testid="stats" />
        <AisCurrentRefinements data-testid="currentrefinements" />
        <AisClearRefinements data-testid="clearrefinements" />
        <AisSortBy
          :items="sortByItems"
          data-testid="sortby"
        />
        <AisToggleRefinement
          attribute="free_shipping"
          data-testid="togglerefinement"
        />
        <AisRefinementList
          attribute="brand"
          searchable
          :show-more="true"
          data-testid="refinementlist"
        />
        <AisMenu
          attribute="categories"
          :show-more="true"
          data-testid="menu"
        />
        <AisMenuSelect
          attribute="categories"
          data-testid="menuselect"
        />
        <AisNumericMenu
          attribute="price"
          :items="numericMenuItems"
          data-testid="numericmenu"
        />
        <AisRatingMenu
          attribute="rating"
          data-testid="ratingmenu"
        />
        <AisHierarchicalMenu
          :attributes="hierarchicalAttributes"
          data-testid="hierarchicalmenu"
        />
        <AisRangeInput
          attribute="price"
          data-testid="rangeinput"
        />
        <AisAutocomplete data-testid="autocomplete" />
        <AisHits data-testid="hits" />
        <AisInfiniteHits
          :show-previous="true"
          data-testid="infinitehits"
        />
        <AisPagination data-testid="pagination" />

        <AisPanel
          data-testid="panel"
          header="Brand refinements"
          :collapsible="true"
          :class-names="panelClassNames"
        >
          <template #default>
            <AisRefinementList
              attribute="brand"
              show-more
            />
          </template>
        </AisPanel>
        <AisIndex index-name="airbnb">
          <AisHits data-testid="index-hits" />
          <AisRefinementList
            attribute="city"
            data-testid="index-refinementlist"
          />
        </AisIndex>
      </AisInstantSearch>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";
import {
  AisAutocomplete,
  AisClearRefinements,
  AisConfigure,
  AisCurrentRefinements,
  AisHierarchicalMenu,
  AisHits,
  AisIndex,
  AisInfiniteHits,
  AisInstantSearch,
  AisMenu,
  AisMenuSelect,
  AisNumericMenu,
  AisPagination,
  AisPanel,
  AisRangeInput,
  AisRatingMenu,
  AisRefinementList,
  AisSearchBox,
  AisSortBy,
  AisStats,
  AisToggleRefinement,
} from "vue-instantsearch/vue3/es";

const panelClassNames = {
  header: "custom-header",
  body: "custom-body",
};

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
</script>
