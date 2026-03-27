<template>
  <AisDynamicWidgets v-bind="$props">
    <slot />
  </AisDynamicWidgets>
</template>

<script setup lang="ts">
type ExperimentalDynamicWidgetsProps = {
  transformItems?: (...args: any[]) => any;
  facets?: ["*"] | string[];
  maxValuesPerFacet?: number;
  id?: string;
};

defineProps<ExperimentalDynamicWidgetsProps>();
</script>
