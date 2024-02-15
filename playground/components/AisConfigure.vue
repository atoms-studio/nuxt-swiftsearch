<template>
  <div :class="suit()">
    <slot v-bind="{ searchParameters, refine }"></slot>
  </div>
</template>

<script setup lang="ts">
const { state, widgetParams } = useWidget("configure");

const refine = computed(() => state.value?.refine);

const searchParameters = computed(() => {
  return widgetParams.value?.searchParameters;
});

const suit = useSuit("Configure");
</script>

<style scoped></style>
