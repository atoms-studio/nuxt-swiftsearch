<template>
  <div
    :class="[suit(''), !state.canRefine && suit('', 'noRefinement')]"
    v-if="state"
  >
    <slot
      :items="items"
      :refine="refine"
      :search-for-items="state.searchForItems"
      :search-for-items-query="searchForFacetValuesQuery"
      :toggle-show-more="toggleShowMore"
      :can-toggle-show-more="state.canToggleShowMore"
      :is-showing-more="state.isShowingMore"
      :createURL="state.createURL"
      :is-from-search="state.isFromSearch"
      :can-refine="state.canRefine"
      :send-event="state.sendEvent"
    >
      <div :class="suit('searchBox')" v-if="searchable">
        <AisSearchInput
          v-model="searchForFacetValues"
          :placeholder="searchablePlaceholder"
        />
      </div>
      <slot
        name="noResults"
        :query="searchForFacetValues"
        v-if="state.isFromSearch && items.length === 0"
      >
        <div :class="suit('noResults')">No results.</div>
      </slot>
      <ul :class="suit('list')">
        <li
          :class="[suit('item'), item.isRefined && suit('item', 'selected')]"
          v-for="item in items"
          :key="item.value"
        >
          <slot
            name="item"
            :item="item"
            :refine="refine"
            :createURL="state.createURL"
          >
            <label :class="suit('label')">
              <input
                :class="suit('checkbox')"
                type="checkbox"
                :value="item.value"
                :checked="item.isRefined"
                @change="refine(item.value)"
              />
              <span v-if="searchable" :class="suit('labelText')">
                <ais-highlight attribute="item" :hit="item" />
              </span>
              <span v-else :class="suit('labelText')">{{ item.label }}</span>
              <span :class="suit('count')">{{ item.count }}</span>
            </label>
          </slot>
        </li>
      </ul>
      <button
        :class="[
          suit('showMore'),
          {
            [suit('showMore', 'disabled')]: !state.canToggleShowMore,
          },
        ]"
        @click="toggleShowMore"
        v-if="showMore"
        :disabled="!state.canToggleShowMore"
      >
        <slot name="showMoreLabel" :is-showing-more="state.isShowingMore">
          Show {{ state.isShowingMore ? "less" : "more" }}
        </slot>
      </button>
    </slot>
  </div>
</template>
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    attribute: string;
    searchable?: boolean;
    searchablePlaceholder?: string;
  }>(),
  { searchablePlaceholder: "Search here..." },
);

const { state: refinementsState, instance } = useWidget("refinementList");
const refinementListState = useAisRefinementListRenderState();

const state = computed(() => {
  return refinementListState.value[props.attribute]
    ? refinementListState.value[props.attribute]
    : refinementsState.value[props.attribute];
});
const widgetParams = computed(
  () => refinementsState.value[props.attribute].widgetParams,
);

const noop = () => {};

const suit = useSuit("RefinementList");

// widget settings from params
const operator = computed(() => widgetParams.value.operator ?? "or");

const limit = computed(() => widgetParams.value.limit);

const showMore = computed(() => widgetParams.value.showMore ?? false);

const showMoreLimit = computed(() => widgetParams.value.showMoreLimit);

const transformItems = computed(() => widgetParams.value.transformItems);

const sortBy = computed(() => widgetParams.value.sortBy);

const searchForFacetValuesQuery = ref("");

const searchForFacetValues = computed({
  get() {
    return searchForFacetValuesQuery.value;
  },
  set(value) {
    state.value.searchForItems(value);
    searchForFacetValuesQuery.value = value;
  },
});

const toggleShowMore = () => {
  state.value.toggleShowMore();
};

const items = computed(() =>
  state.value.items.map((item) =>
    Object.assign({}, item, {
      _highlightResult: { item: { value: item.highlighted } },
    }),
  ),
);

const refine = (value: string) => {
  state.value.refine(value);
  searchForFacetValuesQuery.value = "";
};
</script>
