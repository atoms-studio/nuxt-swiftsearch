<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :items="state.options"
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
          v-for="item in state.options"
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

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";

defineProps<{
  items?: Array<{ value: string; label: string }>;
  transformItems?: (...args: any[]) => any;
}>();

const { state } = useAisWidget("sortBy");
const suit = useSuit("SortBy");
</script>
