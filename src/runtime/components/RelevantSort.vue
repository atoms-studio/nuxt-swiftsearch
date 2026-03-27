<template>
  <div
    v-if="state && state.isVirtualReplica"
    :class="suit()"
  >
    <slot
      :is-relevant-sorted="state.isRelevantSorted"
      :refine="refine"
    >
      <div :class="suit('text')">
        <slot
          name="text"
          :is-relevant-sorted="state.isRelevantSorted"
        />
      </div>
      <button
        type="button"
        :class="suit('button')"
        @click="refine()"
      >
        <slot
          name="button"
          :is-relevant-sorted="state.isRelevantSorted"
        >
          {{ state.isRelevantSorted ? "See all results" : "See relevant results" }}
        </slot>
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";

const { state } = useAisWidget("relevantSort");
const suit = useSuit("RelevantSort");

const refine = () => {
  if (!state.value) {
    return;
  }

  if (state.value.isRelevantSorted) {
    state.value.refine(0);
    return;
  }

  state.value.refine(undefined);
};
</script>
