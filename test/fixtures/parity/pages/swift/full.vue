<template>
  <div class="page">
    <AisInstantSearch
      :widgets="widgets"
      :configuration="configuration"
      instance-key="full"
    >
      <AisSearchBox data-testid="searchbox" />
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
        component="refinementList"
        attribute="brand"
        header="Brand refinements"
        :class-names="panelClassNames"
      >
        <template #default>
          <AisRefinementList attribute="brand" />
        </template>
      </AisPanel>
      <AisIndex index="airbnb">
        <AisHits data-testid="index-hits" />
        <AisRefinementList
          attribute="city"
          data-testid="index-refinementlist"
        />
      </AisIndex>
    </AisInstantSearch>
  </div>
</template>

<script setup lang="ts">
import { algoliasearch } from "algoliasearch";
import { computed } from "vue";

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

const indexBnb = useAisIndex({ indexName: "airbnb" }, "airbnb-index");
indexBnb.addWidgets([
  useAisHits({}, "airbnb-hits"),
  useAisRefinementList({ attribute: "city" }, "airbnb-city"),
]);

const widgets = computed(() => [
  useAisConfigure({ searchParameters: { hitsPerPage: 5 } }),
  useAisSearchBox({}),
  useAisStats({}),
  useAisCurrentRefinements({}),
  useAisClearRefinements({}),
  useAisSortBy({ items: sortByItems }),
  useAisToggleRefinement({ attribute: "free_shipping" }),
  useAisRefinementList(
    {
      attribute: "brand",
      searchable: true,
      showMore: true,
    },
    "brand"
  ),
  useAisMenu(
    {
      attribute: "categories",
      showMore: true,
    },
    "categories-menu"
  ),
  useAisNumericMenu({ attribute: "price", items: numericMenuItems }),
  useAisRatingMenu({ attribute: "rating" }),
  useAisHierarchicalMenu({ attributes: hierarchicalAttributes }),
  useAisRangeInput({ attribute: "price" }),
  useAisAutocomplete({}),
  useAisHits({}),
  useAisInfiniteHits({ showPrevious: true }),
  useAisPagination({}),
  indexBnb,
]);

const configuration = computed(() => ({
  indexName: "instant_search",
  searchClient,
}));
</script>
