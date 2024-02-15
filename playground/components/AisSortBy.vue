<template>
  <div :class="suit()" v-if="state">
    <slot
      :items="state.options"
      :has-no-results="state.hasNoResults"
      :refine="state.refine"
      :current-refinement="state.currentRefinement"
      :can-refine="state.canRefine"
    >
      <select
        :class="suit('select')"
        @change="
          state.refine(($event?.currentTarget as HTMLSelectElement)?.value)
        "
        aria-label="Sort results by"
      >
        <option
          v-for="item in state.options"
          :key="item.value"
          :class="suit('option')"
          :value="item.value"
          :selected="item.value === state.currentRefinement"
        >
          {{ item.label }}
        </option>
      </select>
    </slot>
  </div>
</template>

<script setup lang="ts">
const { state } = useWidget("sortBy");
const suit = useSuit("SortBy");
</script>
