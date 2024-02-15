<template>
  <div v-if="state" :class="suit()">
    <slot v-bind="state" :results="instance.helper?.lastResults">
      <!-- prettier-ignore -->
      <span :class="suit('text')"
        ><template v-if="state.areHitsSorted"
          >{{ sortedResultsSentence }}</template
        ><template v-else>{{ resultsSentence }}</template
        > found in {{ state.processingTimeMS.toLocaleString() }}ms</span
      >
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";
const { instance, state } = useAisWidget("stats");

const suit = useSuit("Stats");

const sortedResultsSentence = computed(() => {
  if (!state.value) return "";
  const { nbHits, nbSortedHits } = state.value;

  const suffix = `sorted out of ${nbHits.toLocaleString()}`;

  if (nbSortedHits === 0) {
    return `No relevant results ${suffix}`;
  }

  if (nbSortedHits === 1) {
    return `1 relevant result ${suffix}`;
  }

  if (nbSortedHits && nbSortedHits > 1) {
    return `${(nbSortedHits || 0).toLocaleString()} relevant results ${suffix}`;
  }

  return "";
});

const resultsSentence = computed(() => {
  if (!state.value) return "";
  const { nbHits } = state.value;

  if (nbHits === 0) {
    return "No results";
  }

  if (nbHits === 1) {
    return "1 result";
  }

  if (nbHits > 1) {
    return `${nbHits.toLocaleString()} results`;
  }

  return "";
});
</script>
