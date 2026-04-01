<template>
  <AisDynamicWidgets v-bind="$props">
    <slot />
  </AisDynamicWidgets>
</template>

<script setup lang="ts">
import type { DynamicWidgetsConnectorParams } from "instantsearch.js/es/connectors/dynamic-widgets/connectDynamicWidgets";

type ExperimentalDynamicWidgetsProps = {
  transformItems?: DynamicWidgetsConnectorParams["transformItems"];
  facets?: ["*"] | string[];
  maxValuesPerFacet?: number;
  id?: string;
};

defineProps<ExperimentalDynamicWidgetsProps>();
</script>
