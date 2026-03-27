<template>
  <div
    v-if="state"
    :class="[suit(''), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="items"
      :refine="refine"
      :search-for-items="state.searchForItems"
      :search-for-items-query="searchForFacetValuesQuery"
      :toggle-show-more="toggleShowMore"
      :can-toggle-show-more="state.canToggleShowMore"
      :is-showing-more="state.isShowingMore"
      :create-u-r-l="state.createURL"
      :is-from-search="state.isFromSearch"
      :can-refine="state.canRefine"
      :send-event="state.sendEvent"
    >
      <div
        v-if="searchable"
        :class="suit('searchBox')"
      >
        <AisSearchInput
          v-model="searchForFacetValues"
          :show-loading-indicator="true"
          :placeholder="searchablePlaceholder"
        />
      </div>
      <slot
        v-if="state.isFromSearch && items.length === 0"
        name="noResults"
        :query="searchForFacetValues"
      >
        <div :class="suit('noResults')">
          No results.
        </div>
      </slot>
      <ul :class="suit('list')">
        <li
          v-for="item in items"
          :key="item.value"
          :class="[suit('item'), item.isRefined && suit('item', 'selected')]"
        >
          <slot
            name="item"
            :item="item"
            :refine="refine"
            :create-u-r-l="state.createURL"
          >
            <label :class="suit('label')">
              <input
                :class="suit('checkbox')"
                type="checkbox"
                :value="item.value"
                :checked="item.isRefined"
                @change="refine(item.value)"
              >
              <span
                v-if="searchable"
                :class="suit('labelText')"
              >
                <AisHighlight
                  attribute="item"
                  :hit="item"
                />
              </span>
              <span
                v-else
                :class="suit('labelText')"
              >{{ item.label }}</span>
              <span :class="suit('count')">{{ item.count }}</span>
            </label>
          </slot>
        </li>
      </ul>
      <button
        v-if="showMoreEnabled"
        :class="[
          suit('showMore'),
          {
            [suit('showMore', 'disabled')]: !state.canToggleShowMore,
          },
        ]"
        :disabled="!state.canToggleShowMore"
        @click="toggleShowMore"
      >
        <slot
          name="showMoreLabel"
          :is-showing-more="state.isShowingMore"
        >
          Show {{ state.isShowingMore ? "less" : "more" }}
        </slot>
      </button>
    </slot>
  </div>
</template>
<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { computed, ref } from "vue";
import { useSuit } from "../composables/useSuit";

type RefinementListProps = {
  attribute: string;
  id?: string;
  searchable?: boolean;
  searchablePlaceholder?: string;
  operator?: "and" | "or";
  limit?: number;
  showMoreLimit?: number;
  showMore?: boolean;
  sortBy?: unknown[] | ((...args: any[]) => unknown);
  transformItems?: (...args: any[]) => any;
};

const props = withDefaults(
  defineProps<RefinementListProps>(),
  {
    id: "",
    searchablePlaceholder: "Search here…",
  },
);

const { state: refinementsState } = useAisWidget("refinementList", props.id);
const state = computed(() => {
  if (props.id) {
    return refinementsState.value;
  }

  return refinementsState.value[props.attribute];
});

const suit = useSuit("RefinementList");

const showMoreEnabled = computed(() => props.showMore ?? false);

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
  state.value.items.map((item) => ({
    ...item,
    _highlightResult: { item: { value: item.highlighted}}
  }))
);

const refine = (value: string) => {
  state.value.refine(value);
  searchForFacetValuesQuery.value = "";
};
</script>
