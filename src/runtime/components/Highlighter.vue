<template>
  <span :class="suit()">
    <component
      v-for="({ value, isHighlighted }, index) in parsedHighlights as {
        value: string | undefined;
        isHighlighted: boolean;
      }[]"
      :class="[isHighlighted && suit('highlighted')]"
      :key="index"
      :is="isHighlighted ? highlightedTagName : 'span'"
      >{{ value }}</component
    >
  </span>
</template>

<script setup lang="ts">
import type { Hit } from "instantsearch.js";
import { computed } from "vue";
import { parseAlgoliaHit } from "../utils/parseAlgoliaHit";

const props = withDefaults(
  defineProps<{
    hit: Hit;
    attribute: string;
    highlightedTagName: string;
    highlightProperty: string;
    preTag: string;
    postTag: string;
    suit: (n?: string) => string;
  }>(),
  {
    highlightedTagName: "mark",
  },
);
const parsedHighlights = computed(() => {
  return parseAlgoliaHit({
    attribute: props.attribute,
    hit: props.hit,
    highlightProperty: props.highlightProperty,
    preTag: props.preTag,
    postTag: props.postTag,
  });
});
</script>
