<template>
  <div v-if="state" :class="suit()">
    <slot
      :can-refine="canRefine"
      :refine="state.refine"
      :create-u-r-l="state.createURL"
    >
      <button
        type="reset"
        :class="[suit('button'), !canRefine && suit('button', 'disabled')]"
        :disabled="!canRefine"
        @click.prevent="state.refine"
      >
        <slot name="resetLabel"> Clear refinements </slot>
      </button>
    </slot>
  </div>
</template>
<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";
const { state } = useAisWidget("clearRefinements");

const suit = useSuit("ClearRefinements");

const canRefine = computed(() => state.value.hasRefinements);
</script>
