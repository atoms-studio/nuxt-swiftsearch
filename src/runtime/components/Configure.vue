<template>
  <div :class="suit()">
    <slot v-bind="{ searchParameters: searchParametersState, refine }" />
  </div>
</template>

<script setup lang="ts">
import { useAisWidget } from "../composables/useAisWidget";
import { useSuit } from "../composables/useSuit";
import { computed } from "vue";

defineProps<{
  searchParameters?: { [key: string]: unknown };
  [key: string]: unknown;
}>();

const { state, widgetParams } = useAisWidget("configure");

const refine = computed(() => state.value?.refine);

const searchParametersState = computed(() => {
  return widgetParams.value?.searchParameters;
});

const suit = useSuit("Configure");
</script>

<style scoped></style>
