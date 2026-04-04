<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :items="items"
      :refine="state.refine"
      :has-no-results="state.hasNoResults"
      :can-refine="state.canRefine"
      :create-u-r-l="state.createURL"
    >
      <select
        :class="suit('select')"
        @change="state.refine(Number(($event.currentTarget as HTMLSelectElement).value))"
      >
        <option
          v-for="item in items"
          :key="item.value"
          :class="suit('option')"
          :value="item.value"
          :selected="item.isRefined"
        >
          {{ item.label }}
        </option>
      </select>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="TItem extends HitsPerPageRenderStateItem = HitsPerPageRenderStateItem">
import type {
  HitsPerPageRenderStateItem,
  HitsPerPageConnectorParamsItem,
} from "instantsearch.js/es/connectors/hits-per-page/connectHitsPerPage";
import { computed } from "vue";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import type { TransformItemsTo } from "../types/transformItems";

defineProps<{
  items: HitsPerPageConnectorParamsItem[];
  transformItems?: TransformItemsTo<HitsPerPageRenderStateItem, TItem>;
}>();

const { state } = useAisWidget("hitsPerPage");
const suit = useSuit("HitsPerPage");
const items = computed(() => (state.value?.items ?? []) as Array<TItem>);
</script>
