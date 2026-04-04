<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :items="options"
      :has-no-results="state.hasNoResults"
      :refine="state.refine"
      :current-refinement="state.currentRefinement"
      :can-refine="state.canRefine"
    >
      <select
        :class="suit('select')"
        aria-label="Sort results by"
        @change="
          state.refine(($event?.currentTarget as HTMLSelectElement)?.value)
        "
      >
        <option
          v-for="item in options"
          :key="item.value"
          :class="suit('option')"
          :selected="item.value === state.currentRefinement"
          :value="item.value"
        >
          {{ item.label }}
        </option>
      </select>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="TItem extends SortByOption = SortByOption">
import type { SortByRenderState } from "instantsearch.js/es/connectors/sort-by/connectSortBy";
import { computed } from "vue";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import type { TransformItemsTo } from "../types/transformItems";

type SortByOption = SortByRenderState["options"][number];

defineProps<{
  items?: Array<TItem>;
  transformItems?: TransformItemsTo<SortByOption, TItem>;
}>();

const { state } = useAisWidget("sortBy");
const suit = useSuit("SortBy");
const options = computed(() => (state.value?.options ?? []) as Array<TItem>);
</script>
