<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :items="state.items"
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
          v-for="item in state.items"
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

<script setup lang="ts">
import type {
  HitsPerPageConnectorParamsItem,
} from "instantsearch.js/es/connectors/hits-per-page/connectHitsPerPage";
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";

defineProps<{
  items: HitsPerPageConnectorParamsItem[];
  transformItems?: (...args: any[]) => any;
}>();

const { state } = useAisWidget("hitsPerPage");
const suit = useSuit("HitsPerPage");
</script>
