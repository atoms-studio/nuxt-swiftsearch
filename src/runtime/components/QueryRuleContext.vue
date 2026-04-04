<template>
  <slot />
</template>

<script setup lang="ts">
import type {
  ParamTrackedFilters,
  ParamTransformRuleContexts,
} from "instantsearch.js/es/connectors/query-rules/connectQueryRules";

defineProps<{
  trackedFilters: ParamTrackedFilters;
  transformRuleContexts?: ParamTransformRuleContexts;
}>();
</script>
