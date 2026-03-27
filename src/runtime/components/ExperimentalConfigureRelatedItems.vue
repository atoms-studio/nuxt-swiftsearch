<template>
  <AisConfigureRelatedItems v-bind="$props">
    <slot />
  </AisConfigureRelatedItems>
</template>

<script setup lang="ts">
import type {
  MatchingPatterns,
  TransformSearchParameters,
} from "instantsearch.js/es/connectors/configure-related-items/connectConfigureRelatedItems";
import type { AlgoliaHit } from "instantsearch.js/es/types";

defineProps<{
  hit: AlgoliaHit;
  matchingPatterns: MatchingPatterns;
  transformSearchParameters?: TransformSearchParameters;
}>();
</script>
