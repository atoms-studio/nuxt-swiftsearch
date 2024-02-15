<template>
  <div :class="suit()">
    <slot v-bind="{ searchParameters, refine }"></slot>
  </div>
</template>

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";
const { state, widgetParams } = useAisWidget("configure");

const refine = computed(() => state.value?.refine);

const searchParameters = computed(() => {
  return widgetParams.value?.searchParameters;
});

const suit = useSuit("Configure");
</script>

<style scoped></style>
